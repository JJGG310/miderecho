// POST /api/llamar { telefono, acepto: true, cuando?, codigo?, vence? } → { ok, simulado, token? }
//   El agente de voz "MiDerecho teléfono" (ElevenLabs) llama a la persona desde el número de Twilio importado en ElevenLabs.
//   Sin `cuando`, llama ya. Con `cuando` ("2026-10-22T09:00-05:00": en punto o y media, desde 10 minutos y hasta 7 días)
//   la agenda: el número queda cifrado en Redis y Upstash QStash vuelve a esta ruta a esa hora (PUT), porque el cron de
//   Vercel Hobby corre una vez al día. El agendado de ElevenLabs (batch calling) no admite el modo de retención cero.
//   Solo de 8 a. m. a 7 p. m., hora de Colombia. De la autorización se guarda solo el HMAC del número, la fecha y la versión.
//   Respaldo: si el agente no está configurado o ElevenLabs falla, y hay Twilio, llama con voz leída (texto fijo: código y fecha).
// DELETE /api/llamar { token }: cancela la llamada agendada. Siempre responde igual, exista o no.
// PUT /api/llamar { id }: solo para QStash, con su firma (Upstash-Signature).
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { atender, falla, celular, proteger, cifrar, descifrar, enviar, hmac, kv, redisListo, simulado, oculto, fechaVoz, textoLlamada, hoyColombia } from './_comun.js';

const AGENTE = 'agent_3901m5fd72hyedssc8h6r4gznevn';   // "MiDerecho teléfono": agente/prompt-telefono.md y agente/telefono.md
export const AVISO = 'llamada-v1';   // versión del texto de autorización de agendar.js: si cambia el texto, cambia esto
const FUERA = 'Solo llamamos de 8 a. m. a 7 p. m., hora de Colombia';
const env = process.env;
const ahora = () => Math.floor(Date.now() / 1000);
const enHorario = seg => { const h = new Date((seg - 5 * 3600) * 1000).getUTCHours(); return h >= 8 && h < 19; };   // Colombia: UTC-5
const destino = req => `https://${req.headers.host}/api/llamar`;

export default async function handler(req, res) {
  return atender(req, res, {
    async POST(b) {
      const tel = celular(b.telefono), datos = { codigo: codigoDe(b.codigo), vence: venceDe(b.vence) };
      if (b.acepto !== true) throw falla(400, 'Falta la autorización para llamar a este número');
      const cuando = b.cuando == null || b.cuando === '' ? null : cuandoDe(b.cuando), real = !simulado('agente') || !simulado('llamada');
      if (!cuando && !enHorario(ahora())) throw falla(400, FUERA);
      if (cuando && real && !(env.QSTASH_TOKEN && redisListo())) throw falla(503, 'Para agendar llamadas faltan QSTASH_TOKEN y Redis en el servidor');
      await proteger(req, tel, simulado('agente') ? 'llamada' : 'agente');
      // Prueba mínima de la autorización (Ley 1581): seudónimo del número, fecha, versión del aviso y respuesta. Nada más.
      if (real) await kv(['SET', `aut:${hmac('num:' + tel)}:${Date.now()}`, JSON.stringify({ aviso: AVISO, fecha: new Date().toISOString(), respuesta: 'acepto' }), 'EXAT', ahora() + 370 * 86400]);
      if (!cuando) return llamarConAgente(tel, datos);

      const token = randomBytes(16).toString('base64url'), id = hmac('llam:' + token);
      if (real) {
        await kv(['SET', 'llam:' + id, JSON.stringify({ ...datos, c: cifrar(tel) }), 'EXAT', cuando + 3600]);
        const r = await fetch(`${env.QSTASH_URL || 'https://qstash.upstash.io'}/v2/publish/${destino(req)}`, {
          method: 'POST', body: JSON.stringify({ id }),
          headers: { Authorization: 'Bearer ' + env.QSTASH_TOKEN, 'Content-Type': 'application/json', 'Upstash-Method': 'PUT', 'Upstash-Not-Before': String(cuando) },
        });
        if (!r.ok) {
          await kv(['DEL', 'llam:' + id]);
          console.error(`[llamar] QStash respondió ${r.status}`);
          throw falla(502, 'No se pudo agendar la llamada');
        }
      }
      console.log(`[llamar] agendada${real ? '' : ' (simulado)'} a ${oculto(tel)}`);
      return { ok: true, simulado: !real, token };
    },
    async DELETE(b) {
      const token = String(b.token ?? '');
      if (!/^[\w-]{22}$/.test(token)) throw falla(400, 'Token inválido');
      await kv(['DEL', 'llam:' + hmac('llam:' + token)]);
      return { ok: true, simulado: simulado('agente') && simulado('llamada') };
    },
    async PUT(b) {
      firmaQstash(req, b);
      const id = String(b.id ?? ''), [txt] = await kv(['GET', 'llam:' + id], ['DEL', 'llam:' + id]);   // se borra antes: nunca llama dos veces
      if (!txt) return { ok: true, simulado: false };   // cancelada o vencida
      if (!enHorario(ahora())) {
        console.error('[llamar] QStash llegó fuera del horario: no se llama');
        return { ok: true, simulado: false };
      }
      const r = JSON.parse(txt);
      return llamarConAgente(descifrar(r.c), r);
    },
  });
}

async function llamarConAgente(tel, { codigo, vence }) {
  const respaldo = () => enviar('llamada', tel, textoLlamada(codigo, vence, hoyColombia()));   // Twilio, o simulado si tampoco hay
  if (simulado('agente')) return respaldo();
  const r = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
    method: 'POST',
    headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: env.ELEVENLABS_AGENT_ID || AGENTE, agent_phone_number_id: env.ELEVENLABS_PHONE_NUMBER_ID, to_number: tel,
      // Solo datos no sensibles: el código letra por letra (así lo lee la voz) y la fecha en palabras.
      conversation_initiation_client_data: { dynamic_variables: {
        codigo: codigo ? [...codigo].join(', ') : 'ninguno',
        vence: vence ? fechaVoz(vence) : 'ninguna',
      } },
      // Sin grabación; si contesta un buzón de voz, cuelga sin hablar (el celular puede ser compartido).
      telephony_call_config: { ringing_timeout_secs: 40, twilio_call_recording_enabled: false,
        twilio_machine_detection: { mode: 'enable', actions: [{ action: 'hang_up', answered_by: ['machine_start', 'fax'] }] } },
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) {   // el mensaje de ElevenLabs puede traer el número: solo el estado
    console.error(`[llamar] ElevenLabs no hizo la llamada: ${r.status}`);
    if (!simulado('llamada')) return respaldo();
    throw falla(502, `No se pudo hacer la llamada (código ${r.status})`);
  }
  console.log(`[llamar] llamando a ${oculto(tel)}`);
  return { ok: true, simulado: false };
}

// JWT HS256 de QStash: firmado con la clave actual o la siguiente, para esta URL, vigente y con el hash de este cuerpo.
// ponytail: el cuerpo se rehace con JSON.stringify; vale porque lo publicamos nosotros como {"id":"..."}.
function firmaQstash(req, b) {
  const [h, p, firma = ''] = String(req.headers['upstash-signature'] ?? '').split('.');
  const igual = (a, z) => a.length === z.length && timingSafeEqual(Buffer.from(a), Buffer.from(z));
  const claves = [env.QSTASH_CURRENT_SIGNING_KEY, env.QSTASH_NEXT_SIGNING_KEY].filter(Boolean);
  if (!p || !claves.some(k => igual(createHmac('sha256', k).update(h + '.' + p).digest('base64url'), firma))) throw falla(401, 'Firma inválida');
  const c = JSON.parse(Buffer.from(p, 'base64url')), t = ahora();
  const cuerpo = createHash('sha256').update(JSON.stringify(b)).digest('base64url');
  if (c.iss !== 'Upstash' || c.sub !== destino(req) || t > c.exp + 60 || t < c.nbf - 60 || String(c.body).replace(/=+$/, '') !== cuerpo)
    throw falla(401, 'Firma inválida');
}

function codigoDe(c) {
  if (c == null || c === '') return null;
  if (!/^[A-Z0-9]{4,12}$/.test(c)) throw falla(400, 'Código de caso inválido');
  return c;
}
function venceDe(v) {
  if (v == null || v === '') return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) && Date.parse(v + 'T00:00Z');
  if (!d || new Date(d).toISOString().slice(0, 10) !== v) throw falla(400, 'Fecha de vencimiento inválida');
  return v;
}
function cuandoDe(c) {
  const s = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(c) && Date.parse(c) / 1000;
  if (!s || s % 1800) throw falla(400, 'Hora inválida: escoja una franja en punto o y media');
  if (s < ahora() + 600 || s > ahora() + 7 * 86400) throw falla(400, 'La llamada se puede agendar desde dentro de 10 minutos y hasta 7 días');
  if (!enHorario(s)) throw falla(400, FUERA);
  return s;
}
