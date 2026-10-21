// POST /api/elevenlabs-sesion: entrega al navegador el token de UNA conversación con el agente de voz
// (apps/web/src/lib/agenteVoz.js). La clave vive solo en la variable de entorno ELEVENLABS_API_KEY de Vercel; sin ella
// responde 503 y la app sigue sin voz.
// POST /api/elevenlabs-sesion?herramienta=<nombre>: herramientas de servidor del agente telefónico (_herramientas.js),
// con su propio secreto. Van en esta misma función para no sumar otra al límite de funciones del plan de Vercel.
import { herramienta } from './_herramientas.js';
import { contar, incr, hoyColombia } from './_comun.js';

const AGENTE = 'agent_8101m5dg7s5se9trrst6fjpvz52d';   // exige sesión firmada (enable_auth): sin este token no se puede abrir
// Con Redis (Upstash) los topes valen para todas las instancias; sin Redis, cada instancia lleva su cuenta.
// El total diario es el mismo tope del agente en ElevenLabs (60 conversaciones al día, 3 a la vez).
const POR_IP_HORA = 10, POR_DIA = 60;
// Versión vigente del aviso de voz: la misma AVISO_VOZ de apps/web/src/lib/agenteVoz.js (lo revisa _test-agente-avisos.mjs).
export const AVISO_VOZ = 'voz-v3';

// Solo el propio sitio (o localhost con `vercel dev`): pedido JSON, que obliga al navegador a preguntar antes si viene
// de otro dominio, y Origin igual al host. Un programa fuera del navegador puede falsificarlo: por eso el límite.
export function mismoSitio(h) {
  if (!String(h['content-type'] || '').startsWith('application/json')) return false;
  if (h['sec-fetch-site'] && h['sec-fetch-site'] !== 'same-origin') return false;
  try { return new URL(h.origin).host === h.host; } catch { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.query?.herramienta) return herramienta(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!mismoSitio(req.headers)) return res.status(403).json({ error: 'Solo desde MiDerecho' });
  // Solo con el aviso de voz vigente aceptado (ModoVoz.jsx manda su versión). Se cuenta por versión y día: es la prueba
  // mínima de la aceptación, sin IP ni datos de la persona (el celular guarda su propia fecha y versión).
  // Una app guardada con un aviso viejo recibe 409 y se actualiza sola al recargar (PWA con autoUpdate).
  const aviso = req.body?.aviso;
  if (typeof aviso !== 'string' || !/^voz-v\d{1,3}$/.test(aviso)) return res.status(400).json({ error: 'Falta aceptar el aviso del asistente de voz' });
  if (aviso !== AVISO_VOZ) return res.status(409).json({ error: 'El aviso de voz cambió: recargue la app y vuelva a aceptarlo' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'sin-ip';
  try {
    if (await contar('voz-ip:' + ip, 3600) > POR_IP_HORA || await contar('voz-total', 86400) > POR_DIA)
      return res.status(429).json({ error: 'Demasiados intentos. Espere un rato.' });
  } catch (e) {
    console.error('[elevenlabs-sesion] límites:', e.message);
    return res.status(503).json({ error: 'El asistente no está disponible' });
  }
  const clave = process.env.ELEVENLABS_API_KEY;
  if (!clave) return res.status(503).json({ error: 'Falta ELEVENLABS_API_KEY en el servidor' });
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENTE}`, { headers: { 'xi-api-key': clave } });
    if (!r.ok) {
      // Diagnóstico sin datos sensibles: ¿la clave sirve en su cuenta (y entonces el agente es de otra), o la rechazan del todo?
      const u = await fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': clave } }).catch(() => null);
      const detalle = (await r.text().catch(() => '')).replace(/[^\w .,:'"-]/g, ' ').slice(0, 160);
      throw new Error(`ElevenLabs respondió ${r.status} al token (clave en /v1/user: ${u ? u.status : 'sin red'}; motivo: ${detalle})`);
    }
    const { token } = await r.json();
    if (typeof token !== 'string') throw new Error('ElevenLabs no mandó token');
    await incr(`aviso:${aviso}:${hoyColombia()}`, Math.floor(Date.now() / 1000) + 400 * 86400).catch(() => {});
    return res.status(200).json({ token });
  } catch (e) {
    console.error('[elevenlabs-sesion]', e.message);   // sin datos de la persona
    return res.status(502).json({ error: 'El asistente no está disponible' });
  }
}
