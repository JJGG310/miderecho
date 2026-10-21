// Guardado en el celular. Solo lo mínimo: casos (sin nombre, cédula ni relato) e historial de orientaciones,
// cifrados con la clave de 4 números (PBKDF2 + AES-GCM, como el prototipo). El celular puede ser compartido (investigacion/03).
// Las preferencias (leer en voz alta) no son sensibles y van aparte, sin cifrar. "Borrar todo" lo elimina todo.
import { useSyncExternalStore } from 'react';
import { derechoInfo } from '@miderecho/nucleo/derechos';

const CIFRADO = 'miderecho-v2-cifrado', PREF = 'miderecho-v2-pref', VIEJO = 'miderecho-v2';
const cod = new TextEncoder(), decod = new TextDecoder();
const b64 = u8 => btoa(String.fromCharCode(...u8));
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const leer = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const escribirLS = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento: la app sigue en memoria */ } };
const vacio = () => ({ casos: [], historial: [] });

// Versión anterior, sin cifrar: las preferencias pasan aparte y los casos se cifran al crear la clave.
const viejo = leer(VIEJO);
if (viejo?.pref && !leer(PREF)) escribirLS(PREF, viejo.pref);

// ponytail: 4 números se pueden adivinar con el celular en la mano; en producción, la llave segura del sistema (Android Keystore).
let clave = null, sal = null, vuelta = 0;
// En memoria. Con la app bloqueada solo tiene lo que se guardó en esta sesión: se cifra al abrir con la clave.
let datos = { casos: viejo?.casos || [], historial: viejo?.historial || [] };
let cola = Promise.resolve();

const oyentes = new Set();
const avisar = () => oyentes.forEach(f => f());
// true si la app está abierta con la clave. Las pantallas se vuelven a pintar al abrir o bloquear.
export const useAbierta = () => useSyncExternalStore(f => { oyentes.add(f); return () => oyentes.delete(f); }, () => !!clave);

async function derivar(pin, s) {
  const base = await crypto.subtle.importKey('raw', cod.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: s, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

function escribir(d) {
  datos = d;
  if (!clave) return;
  const k = clave, s = sal, v = vuelta, texto = JSON.stringify(d);
  cola = cola.then(async () => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, cod.encode(texto)));
    if (v === vuelta) escribirLS(CIFRADO, { salt: b64(s), iv: b64(iv), ct: b64(ct) });   // no revive lo que se borró mientras cifraba
  }).catch(() => { /* sin almacenamiento */ });
}

// a: lo guardado en esta sesión con la app bloqueada; b: lo que ya estaba cifrado.
const unir = (a, b) => ({
  casos: [...a.casos, ...(b.casos || []).filter(c => !a.casos.some(x => x.id === c.id))],
  historial: [...a.historial, ...(b.historial || [])].slice(0, 30),
});

export const almacen = {
  hayClave: () => !!leer(CIFRADO),
  async crear(pin) {
    const s = crypto.getRandomValues(new Uint8Array(16));
    const k = await derivar(pin, s);
    sal = s; clave = k;
    escribir(datos);
    cola = cola.then(() => escribirLS(VIEJO, null));
    avisar();
  },
  // Con una clave errada decrypt falla y no se toca nada: la app sigue bloqueada.
  async abrir(pin) {
    const g = leer(CIFRADO), s = deB64(g.salt), k = await derivar(pin, s);
    const leidos = JSON.parse(decod.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(g.iv) }, k, deB64(g.ct))));
    sal = s; clave = k;
    const pendiente = datos.casos.length || datos.historial.length;
    datos = unir(datos, leidos);
    if (pendiente) escribir(datos);
    avisar();
  },
  bloquear() { clave = null; sal = null; datos = vacio(); avisar(); },
  esperar: () => cola,   // para las pruebas

  casos: () => datos.casos,
  guardarCaso(caso) { escribir({ ...datos, casos: [caso, ...datos.casos.filter(c => c.id !== caso.id)] }); },
  borrarCaso(id) { escribir({ ...datos, casos: datos.casos.filter(c => c.id !== id) }); },
  historial: () => datos.historial,
  guardarOrientacion(o) {
    // No se guarda el resumen ni los datos del caso: solo la ruta. Y como tema, una categoría general ("Salud"),
    // no el título que escribe la IA, que puede revelar un dato sensible ("La EPS niega la quimioterapia").
    const tema = o.documento === 'servicios_publicos' ? 'Servicios públicos' : derechoInfo(o.derecho)?.menu || 'Consulta';
    const item = { id: crypto.randomUUID?.() || String(Date.now()), fecha: new Date().toISOString(), tema, derecho: o.derecho, documento: o.documento, documento_titulo: o.documento_titulo, pasos: o.pasos, donde_acudir: o.donde_acudir, buscar_abogado_si: o.buscar_abogado_si, ley: o.ley };
    escribir({ ...datos, historial: [item, ...datos.historial].slice(0, 30) });
  },
  borrarHistorial() { escribir({ ...datos, historial: [] }); },
  pref: (k, def) => leer(PREF)?.[k] ?? def,
  setPref(k, v) { escribirLS(PREF, { ...leer(PREF), [k]: v }); },
  borrarTodo() {
    vuelta++;
    [CIFRADO, PREF, VIEJO].forEach(k => escribirLS(k, null));
    clave = null; sal = null; datos = vacio();
    avisar();
  },
};
