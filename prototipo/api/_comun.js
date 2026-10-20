// Utilidades de las funciones de /api. El guion bajo evita que Vercel publique este archivo como función.
// Sin claves de Twilio todo queda en modo simulado; sin Redis, los límites y recordatorios viven en memoria.
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto';

const env = process.env;
export const POR_IP_HORA = 20, POR_NUMERO_DIA = 10;   // el tope diario total es LIMITE_DIARIO (100 si no está)

// ---------- respuestas ----------
export const falla = (status, error) => Object.assign(new Error(error), { status });

export async function atender(req, res, metodos) {
  try {
    const f = metodos[req.method];
    if (!f) throw falla(405, 'Método no permitido');
    res.status(200).json(await f(req.body || {}));
  } catch (e) {
    if (!e.status) console.error('[api] error:', e.message);
    res.status(e.status || 500).json({ ok: false, simulado: false, error: e.status ? e.message : 'Error del servidor' });
  }
}

// ---------- validación ----------
// Solo celulares de Colombia: 10 dígitos que empiezan por 3, con o sin +57. Devuelve +573001234567.
const normalizar = t => {
  const d = String(t ?? '').replace(/[\s().-]/g, '').replace(/^\+?57(?=3\d{9}$)/, '');
  return /^3\d{9}$/.test(d) ? '+57' + d : null;
};
export function celular(t) {
  const tel = normalizar(t);
  if (!tel) throw falla(400, 'El número debe ser un celular de Colombia (10 dígitos que empiezan por 3)');
  return tel;
}

export function texto(t, max) {
  t = String(t ?? '').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').trim();
  if (!t) throw falla(400, 'Falta el texto');
  if (t.length > max) throw falla(400, `El texto pasa de ${max} caracteres`);
  return t;
}

// SMS en GSM-7 (160 caracteres en un solo mensaje): sin tildes, eñes ni emojis.
export const gsm = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\n\x20-\x7E¿¡]/g, '');

export const oculto = tel => '***' + tel.slice(-2);   // en los logs nunca va el número completo ni el texto

// ---------- protección contra abuso ----------
const ip = req => req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'sin-ip';

export async function proteger(req, tel) {
  if (tel && twilioListo() && !redisListo() && !env.NUMEROS_DEMO)
    throw falla(503, 'Envíos reales apagados: falta Redis (límites) o la lista NUMEROS_DEMO');
  if (tel && env.NUMEROS_DEMO && !env.NUMEROS_DEMO.split(',').map(normalizar).includes(tel))
    throw falla(403, 'Este número no está autorizado para el demo');
  if (await contar('ip:' + ip(req), 3600) > POR_IP_HORA) throw falla(429, 'Demasiadas solicitudes desde esta conexión. Intente en una hora');
  if (!tel) return;
  if (await contar('num:' + tel, 86400) > POR_NUMERO_DIA) throw falla(429, 'Este número ya recibió muchos mensajes hoy. Intente mañana');
  if (await contar('total', 86400) > Number(env.LIMITE_DIARIO || 100)) throw falla(429, 'Se alcanzó el límite de envíos de hoy');
}

const memoria = new Map();   // contadores sin Redis; ponytail: por instancia, se reinician con cada arranque en frío
async function contar(clave, segundos) {
  const k = `rl:${hmac(clave)}:${Math.floor(Date.now() / 1000 / segundos)}`;
  if (!redisListo()) { memoria.set(k, (memoria.get(k) || 0) + 1); return memoria.get(k); }
  const [n] = await redis(['INCR', k], ['EXPIRE', k, segundos]);
  return n;
}

// ---------- cifrado ----------
// Una sola clave de entorno; de ella salen la de AES-GCM y la de HMAC. Sin Redis ni clave, una al azar que vive con la función.
let efimera;
function clave(uso) {
  const base = env.CLAVE_CIFRADO ? Buffer.from(env.CLAVE_CIFRADO, 'base64') : !redisListo() && (efimera ||= randomBytes(32));
  if (!base || base.length < 32) throw new Error('Falta CLAVE_CIFRADO (32 bytes en base64)');
  return Buffer.from(hkdfSync('sha256', base, '', uso, 32));
}
const hmac = t => createHmac('sha256', clave('hmac')).update(t).digest('base64url').slice(0, 22);

export function cifrar(t) {
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', clave('aes'), iv);
  const datos = Buffer.concat([c.update(t, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), datos]).toString('base64');
}
export function descifrar(b64) {
  const b = Buffer.from(b64, 'base64'), d = createDecipheriv('aes-256-gcm', clave('aes'), b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8');
}

// ---------- Redis (Upstash por REST, del Marketplace de Vercel) ----------
const redisUrl = () => env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
const redisToken = () => env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
export const redisListo = () => !!(redisUrl() && redisToken());

async function redis(...comandos) {
  const r = await fetch(redisUrl() + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + redisToken() }, body: JSON.stringify(comandos) });
  if (!r.ok) throw new Error('Redis respondió ' + r.status);
  return (await r.json()).map(x => { if (x.error) throw new Error('Redis: ' + x.error); return x.result; });
}

// Recordatorios: { canal, fechas: ['AAAA-MM-DD'], c: cifrado de { tel, mensaje } }, por código de caso.
const enMemoria = new Map();
export const recordatorios = {
  leer: async codigo => redisListo() ? JSON.parse((await redis(['HGET', 'recordatorios', codigo]))[0] ?? 'null') : enMemoria.get(codigo) ?? null,
  guardar: async (codigo, r) => { redisListo() ? await redis(['HSET', 'recordatorios', codigo, JSON.stringify(r)]) : enMemoria.set(codigo, r); },
  borrar: async codigo => { redisListo() ? await redis(['HDEL', 'recordatorios', codigo]) : enMemoria.delete(codigo); },
  async todos() {
    if (!redisListo()) return [...enMemoria];
    const [plano] = await redis(['HGETALL', 'recordatorios']), lista = [];
    for (let i = 0; i < plano.length; i += 2) lista.push([plano[i], JSON.parse(plano[i + 1])]);
    return lista;
  },
};

export const hoyColombia = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

// ---------- Twilio (API REST, sin SDK) ----------
const twilioListo = () => !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);
const desde = canal => canal === 'whatsapp' ? env.TWILIO_WHATSAPP_FROM?.replace(/^whatsapp:/, '') : env.TWILIO_FROM;
export const simulado = canal => !(twilioListo() && desde(canal));

async function twilio(recurso, datos) {
  const sid = env.TWILIO_ACCOUNT_SID;
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/${recurso}.json`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${env.TWILIO_AUTH_TOKEN}`).toString('base64') },
    body: new URLSearchParams(datos),
  });
  if (r.ok) return;
  const { code } = await r.json().catch(() => ({}));   // el mensaje de Twilio puede traer el número: solo se usa el código
  console.error(`[twilio] ${recurso} falló: ${r.status} ${code ?? ''}`);
  throw falla(502, `Twilio no aceptó el envío (código ${code ?? r.status})`);
}

const xml = t => t.replace(/[<>&"']/g, c => `&#${c.charCodeAt(0)};`);
// Voz neural de español latino. Pausa inicial para el "¿aló?" y el mensaje dos veces, por si no se oyó el comienzo.
export function twiml(t) {
  const decir = s => `<Say language="es-MX" voice="Polly.Mia-Neural">${s}</Say>`;
  return `<Response><Pause length="1"/>${decir(xml(t))}<Pause length="1"/>${decir('Repito.')}${decir(xml(t))}</Response>`;
}

// plantilla: { sid, variables } de una plantilla aprobada de WhatsApp (obligatoria fuera de la ventana de 24 h).
export async function enviar(canal, tel, t, { pdfUrl, plantilla } = {}) {
  if (simulado(canal)) {
    console.log(`[${canal}] simulado a ${oculto(tel)}: ${t.length} caracteres${pdfUrl ? ' + PDF' : ''}`);
    return { ok: true, simulado: true };
  }
  if (canal === 'sms') await twilio('Messages', { To: tel, From: desde(canal), Body: t });
  if (canal === 'llamada') await twilio('Calls', { To: tel, From: desde(canal), Twiml: twiml(t) });
  if (canal === 'whatsapp') await twilio('Messages', {
    To: 'whatsapp:' + tel, From: 'whatsapp:' + desde(canal),
    ...(plantilla ? { ContentSid: plantilla.sid, ContentVariables: JSON.stringify(plantilla.variables) } : { Body: t }),
    ...(pdfUrl && { MediaUrl: pdfUrl }),
  });
  console.log(`[${canal}] enviado a ${oculto(tel)}`);
  return { ok: true, simulado: false };
}

