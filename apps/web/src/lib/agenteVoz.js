// Agente de voz de MiDerecho (ElevenLabs Agents) en la v2: SDK, sesión firmada y herramientas de cliente.
// Sin React para poder probarlo en Node (prototipo/api/_test-agente-avisos.mjs). La pantalla está en componentes/ModoVoz.jsx.
// Configuración del agente y cómo recrearlo: agente/README.md. No se guarda audio ni transcripciones.
import { limpiar } from '@miderecho/nucleo/privacidad';

// Versión exacta del SDK oficial y su huella (SRI): si el archivo del CDN cambia, el navegador no lo ejecuta.
const SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.26.0/dist/lib.iife.js';
const SDK_SRI = 'sha384-GAgUf1yx/dGreo/QTqLRVycB5sMQdsPKOmbMWlKec+fjMXzz+OXy4c6EfjB7Anb7';

// Se descarga solo cuando la persona acepta hablar (el service worker no lo guarda).
let sdk = null;
export const cargarSDK = () => sdk ||= new Promise((ok, mal) => {
  const s = Object.assign(document.createElement('script'), { src: SDK, integrity: SDK_SRI, crossOrigin: 'anonymous' });
  const fallar = m => { clearTimeout(reloj); sdk = null; s.remove(); mal(new Error(m)); };
  const reloj = setTimeout(() => fallar('El asistente tardó demasiado en cargar'), 30000);
  s.onload = () => window.ElevenLabsClient?.Conversation ? (clearTimeout(reloj), ok(window.ElevenLabsClient)) : fallar('No se pudo cargar el asistente');
  s.onerror = () => fallar('No se pudo cargar el asistente');
  document.head.append(s);
});

// El agente exige sesión firmada: el token de cada conversación lo da prototipo/api/elevenlabs-sesion.js con la clave
// del servidor. Sin ELEVENLABS_API_KEY responde 503 y el modo voz dice que no está disponible.
// Solo en desarrollo, VITE_AGENTE_PRUEBAS (agente de pruebas: sin firma, solo localhost) permite probar sin la clave.
const PRUEBAS = import.meta.env?.DEV && import.meta.env.VITE_AGENTE_PRUEBAS;
export async function pedirSesion() {
  if (PRUEBAS) return { agentId: PRUEBAS, connectionType: 'webrtc' };
  const r = await fetch('/api/elevenlabs-sesion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (!r.ok) throw new Error('Sin sesión del asistente: ' + r.status);
  return { conversationToken: (await r.json()).token, connectionType: 'webrtc' };
}

// Todo texto que va al agente pasa antes por el filtro de privacidad del núcleo.
const l = t => limpiar(String(t ?? '')).texto;

// Lo que el agente lee de la respuesta del asistente de la app (apps/api). Lo jurídico viene de contenido fijo.
export function resumen(r) {
  if (r.accion === 'riesgo') return { accion: 'riesgo', indicacion: 'Siga el protocolo de riesgo: diga el texto fijo con calma, no pregunte nada más del caso y no use más herramientas.' };
  const o = r.accion === 'orientar' && r.orientacion;
  return {
    accion: r.accion, mensaje: l(r.mensaje), opciones: (r.opciones || []).map(l),
    ...(o && { orientacion: {
      tema: l(o.tema), documento: o.documento, documento_titulo: o.documento_titulo || null,
      pasos: (o.pasos || []).map(l), donde_acudir: (o.donde_acudir || []).map(l), aviso: o.aviso,
    } }),
  };
}

// Estado de la pantalla al empezar la llamada. No incluye el relato de la persona: ese ya lo tiene el asistente de la app.
export function contexto(mensajes, respuesta) {
  if (!mensajes.length) return 'Estado de la app: la persona todavía no ha contado su caso.';
  const ultimo = mensajes.filter(m => m.rol === 'asistente').at(-1)?.texto;
  return l(['Estado de la app: la persona ya contó su caso por escrito.',
    ultimo && `El asistente de la app respondió: "${ultimo}"`,
    respuesta?.opciones?.length && `Opciones: ${respuesta.opciones.join(' / ')}.`,
    respuesta?.accion === 'orientar' && 'La pantalla ya muestra la orientación y, si aplica, el botón para crear el documento.',
    respuesta?.accion === 'riesgo' && 'La pantalla muestra la ayuda del protocolo de riesgo.',
  ].filter(Boolean).join(' '));
}

const BLOQUEO = { ok: false, motivo: 'Protocolo de riesgo activo: no se sigue con el caso. Repita los datos de ayuda si la persona lo pide.' };

// Las ÚNICAS acciones del agente en la app. Aceptar avisos o autorizaciones, borrar, enviar mensajes o cerrar no están
// aquí: las hace siempre la persona en la pantalla (lección de la auditoría: se filtra por acción, no por el texto de un botón).
// app() devuelve las funciones vigentes del Asistente: { responder(texto) → respuesta | null, marcarRiesgo() }.
export function crearHerramientas(app, { riesgo = false, alUsar = () => {} } = {}) {
  return Object.freeze({
    async contar_al_asistente({ texto } = {}) {
      if (riesgo) return BLOQUEO;
      const t = l(String(texto ?? '').trim().slice(0, 600));
      if (!t.trim()) return { ok: false, motivo: 'Falta lo que dijo la persona.' };
      const r = await app().responder(t);
      alUsar();
      if (!r) return { ok: false, motivo: 'El asistente de la app no respondió. Pídale que intente de nuevo en un momento o que escriba en la pantalla.' };
      if (r.accion === 'riesgo') riesgo = true;
      return resumen(r);
    },
    activar_protocolo_riesgo() {
      riesgo = true;
      app().marcarRiesgo();
      alUsar();
      return { ok: true, indicacion: 'La pantalla muestra a dónde acudir. No haga más preguntas del caso ni use otras herramientas. Diga el texto fijo del protocolo de riesgo.' };
    },
  });
}
