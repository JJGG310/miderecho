// Guardado en el celular. Solo lo mínimo: casos (sin nombre, cédula ni relato), historial de orientaciones y preferencias.
// El celular puede ser compartido (investigacion/03): nada sensible se guarda y "Borrar todo" lo elimina.
import { cancelarAvisos, cancelarTodo } from './avisos.js';

const CLAVE = 'miderecho-v2';

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { return {}; }
}
function escribir(d) {
  try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch { /* sin almacenamiento: la app sigue en memoria */ }
}

export const almacen = {
  casos: () => leer().casos || [],
  guardarCaso(caso) {
    // Si ya le respondieron, los recordatorios sobran: se cancelan en el servidor (cola en lib/avisos.js).
    if (caso.estado !== 'esperando' && caso.avisos) { cancelarAvisos(caso); caso = { ...caso, avisos: undefined }; }
    const d = leer();
    d.casos = [caso, ...(d.casos || []).filter(c => c.id !== caso.id)];
    escribir(d);
  },
  borrarCaso(id) { const d = leer(); cancelarAvisos(d.casos?.find(c => c.id === id)); d.casos = (d.casos || []).filter(c => c.id !== id); escribir(d); },
  historial: () => leer().historial || [],
  guardarOrientacion(o) {
    const d = leer();
    // No se guarda el resumen ni los datos del caso: solo el tema y la ruta.
    const item = { id: crypto.randomUUID?.() || String(Date.now()), fecha: new Date().toISOString(), tema: o.tema, derecho: o.derecho, documento: o.documento, documento_titulo: o.documento_titulo, pasos: o.pasos, donde_acudir: o.donde_acudir, buscar_abogado_si: o.buscar_abogado_si, ley: o.ley };
    d.historial = [item, ...(d.historial || [])].slice(0, 30);
    escribir(d);
  },
  borrarHistorial() { const d = leer(); delete d.historial; escribir(d); },
  pref: (k, def) => leer().pref?.[k] ?? def,
  setPref(k, v) { const d = leer(); d.pref = { ...(d.pref || {}), [k]: v }; escribir(d); },
  borrarTodo() { cancelarTodo(leer().casos || []); try { localStorage.removeItem(CLAVE); } catch { /* nada que borrar */ } },
};
