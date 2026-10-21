// Envíos sin señal: el correo del documento, los recordatorios por SMS, WhatsApp o llamada, y la llamada del asistente.
// Sin señal, el envío espera en el almacén, cifrado con la clave junto a los casos (lib/almacen.js), y sale solo al volver
// la señal o al abrir la app con la clave. Guarda solo lo que el servidor necesita para ese envío y se borra apenas sale.
// Quien encola dice con alEnviarse() qué hacer con la respuesta (guardar el token, la constancia del correo…).
// Como el prototipo (prototipo/app.js, procesarCola). JS sin JSX para poder probarlo en Node (test-offline.mjs).
import { almacen } from './almacen.js';

const BASE = import.meta.env?.VITE_API_URL || '';

// ¿Hay red? Respeta el interruptor del demo (lib/conexion.jsx lo mueve con forzarSinRed).
let sinRedDemo = false;
export const forzarSinRed = b => { sinRedDemo = b; };
export const hayRed = () => !sinRedDemo && (typeof navigator === 'undefined' || navigator.onLine);

const tratar = {};
// ruta: 'correo' | 'recordatorios' | 'llamar'. listo(respuesta, envio) al salir; fallo(respuesta, envio) si el servidor lo
// rechaza; antes(datos) ajusta los datos justo antes de enviar (null: ya no hay nada que enviar).
export const alEnviarse = (ruta, listo, fallo, antes) => { tratar[ruta] = { listo, fallo, antes }; };

// Estado para la pantalla: cuántos esperan y el último resultado ("Volvió la señal: se envió…").
let estado = { pendientes: 0, mensaje: null };
const oyentes = new Set();
const actualizar = (mensaje = estado.mensaje) => { estado = { pendientes: almacen.envios().length, mensaje }; oyentes.forEach(f => f()); };
export const suscribirEnvios = f => { oyentes.add(f); return () => oyentes.delete(f); };
export const estadoEnvios = () => estado;
export const refrescarEnvios = () => actualizar();
export const cerrarMensajeEnvios = () => actualizar(null);

export function encolar(ruta, datos) {
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  almacen.guardarEnvio({ id, ruta, datos, creado: new Date().toISOString() });
  actualizar(null);
  return id;
}

async function post(ruta, datos) {
  try {
    const r = await fetch(`${BASE}/api/${ruta}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos), signal: AbortSignal.timeout?.(20000),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.ok === true ? j : { ok: false, estado: r.status, error: j.error || `El servidor respondió ${r.status}` };
  } catch { return { ok: false, error: 'No se pudo conectar con el servidor' }; }
}

// Ids ya enviados, sin cifrar (son números al azar): si la app se bloqueó o se recargó con un envío en camino, el borrado
// cifrado pudo no guardarse; al abrir, lo que esté aquí se descarta en vez de salir otra vez.
const SALIDOS = 'miderecho-envios-salidos';
const salidos = () => { try { return JSON.parse(localStorage.getItem(SALIDOS)) || []; } catch { return []; } };
const marcarSalido = id => { try { localStorage.setItem(SALIDOS, JSON.stringify([...salidos(), id].slice(-50))); } catch { /* sin almacenamiento */ } };
const sigue = id => almacen.abierta() && almacen.envios().some(x => x.id === id);   // no se bloqueó ni se borró todo

let corriendo = false;
// Solo con la app abierta (sin la clave no se pueden leer) y con red. Lo que el servidor rechaza (4xx) no se reintenta;
// sin conexión, 429 o error del servidor, queda para la próxima.
export async function procesarEnvios() {
  if (corriendo || !hayRed() || !almacen.envios().length) return;
  corriendo = true;
  let enviados = 0;
  const fallas = [];
  try {
    for (const id of salidos()) if (sigue(id)) almacen.quitarEnvio(id);
    for (const e of [...almacen.envios()]) {
      if (!hayRed()) break;
      if (!sigue(e.id)) continue;
      const datos = tratar[e.ruta]?.antes ? tratar[e.ruta].antes(e.datos) : e.datos;
      if (!datos) { almacen.quitarEnvio(e.id); continue; }
      const r = await post(e.ruta, datos);
      const final = r.ok || (r.estado >= 400 && r.estado < 500 && r.estado !== 429);
      if (!final) continue;
      marcarSalido(e.id);
      almacen.quitarEnvio(e.id);
      if (r.ok) { enviados++; tratar[e.ruta]?.listo?.(r, e); }
      else { fallas.push(r.error); tratar[e.ruta]?.fallo?.(r, e); }
    }
  } finally { corriendo = false; }
  if (!enviados && !fallas.length) return actualizar();
  actualizar([
    enviados && `Volvió la señal: ${enviados === 1 ? 'se envió lo que esperaba' : `se enviaron los ${enviados} envíos que esperaban`}.`,
    fallas.length && `No se pudo enviar: ${fallas.join('; ')}.`,
  ].filter(Boolean).join(' '));
}
