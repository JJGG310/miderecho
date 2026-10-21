// POST /api/elevenlabs-sesion: entrega al navegador el token de UNA conversación con el agente de voz (agente-voz.js).
// La clave vive solo en la variable de entorno ELEVENLABS_API_KEY de Vercel; sin ella responde 503 y la app sigue sin voz.
const AGENTE = 'agent_8101m5dg7s5se9trrst6fjpvz52d';   // exige sesión firmada (enable_auth): sin este token no se puede abrir
const POR_IP_HORA = 10;
const pedidos = new Map();   // ip -> horas de sus últimos pedidos
// ponytail: el límite vive en la memoria de cada instancia de Vercel; el tope que no se salta es el del agente
// en ElevenLabs (60 conversaciones al día, 3 a la vez). Si hace falta más, usar Redis como api/_comun.js.

// Solo el propio sitio (o localhost con `vercel dev`): pedido JSON, que obliga al navegador a preguntar antes si viene
// de otro dominio, y Origin igual al host. Un programa fuera del navegador puede falsificarlo: por eso el límite.
export function mismoSitio(h) {
  if (!String(h['content-type'] || '').startsWith('application/json')) return false;
  if (h['sec-fetch-site'] && h['sec-fetch-site'] !== 'same-origin') return false;
  try { return new URL(h.origin).host === h.host; } catch { return false; }
}

export function dentroDelLimite(ip, ahora = Date.now()) {
  const recientes = (pedidos.get(ip) || []).filter(t => ahora - t < 3600e3);
  if (recientes.length >= POR_IP_HORA) return false;
  pedidos.set(ip, [...recientes, ahora]);
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!mismoSitio(req.headers)) return res.status(403).json({ error: 'Solo desde MiDerecho' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'sin-ip';
  if (!dentroDelLimite(ip)) return res.status(429).json({ error: 'Demasiados intentos. Espere un rato.' });
  const clave = process.env.ELEVENLABS_API_KEY;
  if (!clave) return res.status(503).json({ error: 'Falta ELEVENLABS_API_KEY en el servidor' });
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENTE}`, { headers: { 'xi-api-key': clave } });
    if (!r.ok) throw new Error('ElevenLabs respondió ' + r.status);
    const { token } = await r.json();
    if (typeof token !== 'string') throw new Error('ElevenLabs no mandó token');
    return res.status(200).json({ token });
  } catch (e) {
    console.error('[elevenlabs-sesion]', e.message);   // sin datos de la persona
    return res.status(502).json({ error: 'El asistente no está disponible' });
  }
}
