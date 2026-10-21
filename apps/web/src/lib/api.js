// Cliente del backend (apps/api). El relato pasa por el filtro de privacidad ANTES de salir del celular.
// Sin señal, contesta aquí mismo el modo básico del servidor (reglas fijas, sin IA): el relato no sale del celular.
import { limpiar } from '@miderecho/nucleo/privacidad';
import { AYUDA_RIESGO } from '@miderecho/nucleo/contenido';
// ponytail: el modo básico se toma tal cual de apps/api (solo depende del núcleo); si crece, pasarlo a packages/nucleo.
import { responderSimulado } from '../../../api/src/simulado.js';
import { armarRespuesta } from '../../../api/src/orientacion.js';
import { memoria } from './ruta.js';
import { hayRed } from './cola.js';

const BASE = import.meta.env?.VITE_API_URL || '';
// Versión del aviso de la IA que la persona aceptó (pantallas/Consentimiento.jsx). Si cambia el texto, se sube.
export const CONSENTIMIENTO = 'ia-v3';   // el servidor exige el formato ia-vN (apps/api/src/app.js)

const SIN_RED = 'está sin internet. Respondemos con reglas fijas y lo que escribió no salió de su celular.';   // va tras "Modo básico (sin IA):"
// Igual que el servidor cuando no hay IA (apps/api/src/app.js): misma respuesta y la ayuda fija si hay riesgo.
export function basico(mensajes, aviso = SIN_RED) {
  const r = armarRespuesta(responderSimulado(mensajes));
  return { ...r, ...(r.riesgo && { ayuda: AYUDA_RIESGO }), fuente: 'simulada', aviso };
}

export async function preguntarAsistente(mensajes) {
  const limpios = mensajes.map(m => ({ rol: m.rol, texto: limpiar(m.texto).texto }));
  if (!hayRed()) return basico(limpios);
  let r;
  try {
    r = await fetch(`${BASE}/api/asistente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensajes: limpios, consentimiento: memoria.consentimiento }),
    });
  } catch { return basico(limpios); }   // la señal se cayó en el camino
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Error ${r.status}`);
  return r.json();
}
