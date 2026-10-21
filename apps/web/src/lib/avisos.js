// Avisos de los plazos y llamadas del asistente.
// - Recordatorios en el servidor (api/recordatorios.js y su cron): notificación push, SMS, WhatsApp o llamada con voz leída,
//   cada canal con autorización expresa. Del celular nunca se guarda el número: solo el código del caso y el token para cancelar.
// - Cola de cancelación: pares no sensibles que se reintentan al volver la señal; vive fuera de los casos, así que
//   sobrevive a "Borrar todo".
// - Aviso local (sin internet): plazos que vencen hoy o mañana.
// - Llamada del agente de voz (api/llamar.js): ahora o agendada.
import { sumarHabiles, deIso, iso } from '@miderecho/nucleo';

const BASE = import.meta.env?.VITE_API_URL || '';
const COLA = 'miderecho-cancelar';
const LLAMADA = 'miderecho-llamada';   // { token, cuando, texto } de la llamada agendada; nunca el número

// Igual que prototipo/comunicaciones.js: nunca lanza; sin internet o con error devuelve { ok: false, error }.
export async function pedir(ruta, method, datos) {
  if (!navigator.onLine) return { ok: false, simulado: false, error: 'Sin internet' };
  try {
    const r = await fetch(`${BASE}/api/${ruta}`, {
      method, headers: { 'Content-Type': 'application/json' }, body: datos && JSON.stringify(datos),
      signal: AbortSignal.timeout?.(15000),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.ok === true ? j : { ok: false, simulado: false, estado: r.status, error: j.error || `El servidor respondió ${r.status}` };
  } catch {
    return { ok: false, simulado: false, error: 'No se pudo conectar con el servidor' };
  }
}

const leerJSON = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const escribirJSON = (k, v) => { try { v == null || (Array.isArray(v) && !v.length) ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

// ---------- cola de cancelación ----------
let corriendo = false;
export async function procesarCola() {
  if (corriendo || !navigator.onLine) return;
  corriendo = true;
  try {
    // Cada pendiente una vez por corrida, también los que se agregan mientras corre.
    const intentados = new Set(), clave = x => JSON.stringify(x);
    for (let p; (p = leerJSON(COLA, []).find(x => !intentados.has(clave(x))));) {
      intentados.add(clave(p));
      const r = await pedir(p.ruta, 'DELETE', p.datos);
      // 400 es un token inválido: reintentarlo no sirve. Lo demás (sin señal, 429, 5xx) se reintenta.
      if (r.ok || r.estado === 400) escribirJSON(COLA, leerJSON(COLA, []).filter(x => clave(x) !== clave(p)));
    }
  } finally { corriendo = false; }
}
function encolar(ruta, datos) {
  escribirJSON(COLA, [...leerJSON(COLA, []), { ruta, datos }]);
  return procesarCola();
}
if (typeof window !== 'undefined') { window.addEventListener('online', procesarCola); procesarCola(); }

export const cancelarAvisos = caso => Object.values(caso?.avisos || {}).filter(Boolean)
  .forEach(token => encolar('recordatorios', { codigo: caso.codigo, token }));

// ---------- recordatorios ----------
export const CANALES = {
  push: 'notificación en este celular',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  llamada: 'llamada con voz grabada',
};
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const nuevoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => ALFABETO[b % 32]).join('');

// Mismas fechas en todos los canales: 3 días hábiles antes, el día del vencimiento y 1 día hábil después. Solo futuras.
export function fechasAviso(c, hoy = new Date()) {
  if (!c?.venc || !c.plazo || !c.rad) return [];
  const rad = deIso(c.rad);
  return [sumarHabiles(rad, c.plazo - 3), deIso(c.venc), sumarHabiles(rad, c.plazo + 1)].map(iso).filter(f => f > iso(hoy));
}

const soportaPush = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const llave = b64 => Uint8Array.from(atob(b64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const swListo = () => Promise.race([navigator.serviceWorker.ready, new Promise(r => setTimeout(r, 4000))]);

// Solo tras un toque de la persona: pide el permiso y suscribe este navegador. Sin claves VAPID en el servidor muestra
// una notificación de ejemplo desde el mismo celular (modo de prueba).
export async function activarPush() {
  if (!soportaPush()) return { ok: false, error: 'Este celular no recibe notificaciones de la app. Igual le mostramos el aviso al abrirla.' };
  if (await Notification.requestPermission() !== 'granted') return { ok: false, error: 'Sin permiso no le podemos enviar notificaciones. Puede darlo después en los ajustes del navegador.' };
  const k = await pedir('push', 'GET');
  if (!k.ok) return k;
  const reg = await swListo();
  if (!reg) return { ok: false, error: 'La app todavía no está instalada en este celular. Ábrala de nuevo con internet e intente otra vez.' };
  if (!k.clave) {
    await reg.showNotification('MiDerecho', { body: 'Modo de prueba: así le van a llegar los avisos de sus plazos.', icon: 'icon-192.png', lang: 'es-CO' });
    return { ok: true, simulado: true };
  }
  try {
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: llave(k.clave) });
    return { ok: true, suscripcion: sub.toJSON() };
  } catch {
    return { ok: false, error: 'Este navegador no pudo activar las notificaciones. Pruebe con Chrome.' };
  }
}

// destino: { telefono } o { suscripcion }. Devuelve { ok, simulado, token } o { ok: false, error }.
export function programar(caso, canal, destino) {
  const fechas = fechasAviso(caso);
  if (!fechas.length) return { ok: false, error: 'Ya no quedan fechas por recordar' };
  return pedir('recordatorios', 'POST', { codigo: caso.codigo, canal, fechas, vence: caso.venc, ...destino });
}

// ---------- aviso local: plazos que vencen hoy o mañana (sin internet) ----------
export function plazosCercanos(casos, hoy = new Date()) {
  const h = iso(hoy), m = iso(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1));
  return casos.filter(c => c.estado === 'esperando' && (c.venc === h || c.venc === m))
    .sort((a, b) => a.venc.localeCompare(b.venc))
    .map(c => `${c.venc === h ? 'Hoy' : 'Mañana'} vence el plazo de su ${c.titulo.toLowerCase()} a ${c.entidad}.`);
}

// ---------- llamada del asistente de voz ----------
export const llamadaAgendada = () => {
  const g = leerJSON(LLAMADA, null);
  if (g && g.cuando < Date.now()) { escribirJSON(LLAMADA, null); return null; }
  return g;
};
export async function pedirLlamada(datos) {
  const r = await pedir('llamar', 'POST', datos);
  if (r.ok && r.token) {
    const anterior = llamadaAgendada();
    if (anterior) encolar('llamar', { token: anterior.token });   // una sola llamada agendada a la vez
    escribirJSON(LLAMADA, { token: r.token, cuando: Date.parse(datos.cuando), texto: datos.texto });
  }
  return r;
}
export function cancelarLlamada() {
  const g = leerJSON(LLAMADA, null);
  escribirJSON(LLAMADA, null);
  return g ? encolar('llamar', { token: g.token }) : Promise.resolve();
}

// "Borrar todo": cancela en el servidor todo lo que este celular dejó programado.
export function cancelarTodo(casos) {
  casos.forEach(cancelarAvisos);
  cancelarLlamada();
}
