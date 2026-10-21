// GET /api/elevenlabs-sesion?lectura=<clave>&v=<huella>: mp3 con la voz de la asistente (Alisson, ElevenLabs) de un
// texto FIJO de la app (packages/nucleo/src/lectura.js). Nunca texto libre: así nadie lo usa como lector gratis.
// Cada texto se genera una sola vez: la URL lleva la huella del texto y el CDN y el celular la guardan un año.
// El celular vuelve a la voz del sistema si esto falla (sin clave, sin internet, sin créditos).
import { textoLectura, urlLectura } from '@miderecho/nucleo/lectura';
import { contar } from './_comun.js';

const VOZ = 'SmgKjOvC1aIujLWcMzqq';          // Alisson, colombiana: la misma de los agentes
const MODELO = 'eleven_flash_v2_5';          // baja latencia; mp3 de 32 kbps para gastar pocos datos
const POR_DIA = 300;                          // tope de audios generados al día: con la caché, solo se pasa si alguien la esquiva

const fallo = (res, status, error) => { res.setHeader('Cache-Control', 'no-store'); return res.status(status).json({ error }); };

export async function lectura(req, res) {
  if (req.method !== 'GET') return fallo(res, 405, 'Método no permitido');
  const clave = String(req.query?.lectura ?? '');
  if (!textoLectura(clave)) return fallo(res, 404, 'Lectura desconocida');
  // Solo la URL canónica (misma clave, huella y orden): otra forma de escribirla esquivaría la caché y gastaría créditos.
  if (req.url !== urlLectura(clave)) return fallo(res, 409, 'El texto cambió o la dirección no es la de la app: recargue la app');
  const clave_api = process.env.ELEVENLABS_API_KEY;
  if (!clave_api) return fallo(res, 503, 'Falta ELEVENLABS_API_KEY en el servidor');
  try {
    if (await contar('lectura-total', 86400) > POR_DIA) return fallo(res, 429, 'Se alcanzó el tope de audios de hoy');
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOZ}?output_format=mp3_22050_32`, {
      method: 'POST',
      headers: { 'xi-api-key': clave_api, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: textoLectura(clave), model_id: MODELO, language_code: 'es' }),
    });
    if (!r.ok) throw new Error('ElevenLabs respondió ' + r.status);
    const audio = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    return res.status(200).send(audio);
  } catch (e) {
    console.error('[lectura]', e.message);   // solo el estado: nunca el texto
    return fallo(res, 502, 'No se pudo generar el audio');
  }
}
