// Utilidades de las funciones de /api. El guion bajo evita que Vercel publique este archivo como función.
// Sin claves de Twilio todo queda en modo simulado (solo validación, sin límites); sin Redis, los datos viven en memoria.
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto';

const env = process.env;
export const POR_IP_HORA = 60, POR_NUMERO_DIA = 10, CODIGOS_POR_NUMERO = 3;
export const limiteDiario = () => Number(env.LIMITE_DIARIO || 100);

// ---------- respuestas ----------
export const falla = (status, error) => Object.assign(new Error(error), { status });

export async function atender(req, res, metodos) {
  try {
    const f = metodos[req.method];
    if (!f) throw falla(405, 'Método no permitido');
    // Solo desde la propia app: otro sitio no puede mandar JSON sin CORS, y el navegador delata el origen.
    const sitio = req.headers['sec-fetch-site'], origen = req.headers.origin;
    if ((sitio && sitio !== 'same-origin' && sitio !== 'none') || (origen && !mismoSitio(origen, req.headers.host)))
      throw falla(403, 'Solo se acepta desde la app');
    if (req.method !== 'GET' && !/^application\/json\b/i.test(req.headers['content-type'] || ''))
      throw falla(415, 'Envíe JSON (Content-Type: application/json)');
    let body;
    try { body = req.body || {}; } catch { throw falla(400, 'El cuerpo debe ser JSON'); }   // Vercel lo interpreta al leerlo
    res.status(200).json(await f(body));
  } catch (e) {
    if (!e.status) console.error('[api] error:', e.message);
    res.status(e.status || 500).json({ ok: false, simulado: false, error: e.status ? e.message : 'Error del servidor' });
  }
}

function mismoSitio(url, host) {
  try {
    const u = new URL(url);
    return u.host === host || ['localhost', '127.0.0.1'].includes(u.hostname);
  } catch { return false; }
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

export function texto(t, max, medir = s => s.length) {
  t = String(t ?? '').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').trim();
  if (!t) throw falla(400, 'Falta el texto');
  if (medir(t) > max) throw falla(400, `El texto pasa de ${max} caracteres`);
  return t;
}

// SMS en GSM-7: se conserva lo que está en el alfabeto (ñ, é, ü, ¿, ¡…), á→a, y se quita lo demás (emojis, `).
// La tabla extendida (^{}\[]~|€) vale, pero ocupa dos posiciones de las 160.
const GSM = '@£$¥èéùìòÇ\nØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const EXT = '^{}\\[]~|€';
export const gsm = t => [...t].map(c => (GSM + EXT).includes(c) ? c : [...c.normalize('NFD')].filter(x => GSM.includes(x)).join('')).join('');
export const septetos = t => t.length + [...t].filter(c => EXT.includes(c)).length;

export const oculto = tel => '***' + tel.slice(-2);   // en los logs nunca va el número completo ni el texto

// ---------- protección contra abuso (solo con envío real: en modo simulado no se gasta nada) ----------
const ip = req => {
  const a = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'sin-ip';
  return a.includes(':') ? a.split(':').slice(0, 4).join(':') : a;   // IPv6: por red (≈/64), no por dirección
};

export async function proteger(req, tel, canal) {
  if (simulado(canal)) return;
  const demo = env.NUMEROS_DEMO;
  // Cerrado por defecto: texto libre a cualquier número solo si se abre a propósito y hay límites globales (Redis).
  if (!demo && (env.PERMITIR_ENVIO_ABIERTO !== '1' || !redisListo()))
    throw falla(503, 'Envíos reales cerrados: configure NUMEROS_DEMO, o Redis y PERMITIR_ENVIO_ABIERTO=1');
  if (demo && !demo.split(',').map(normalizar).includes(tel)) throw falla(403, 'Este número no está autorizado para el demo');
  // ponytail: 60 por hora y red tolera CGNAT y el Wi-Fi del evento; el freno real son el tope por número y el diario.
  if (await contar('ip:' + ip(req), 3600) > POR_IP_HORA) throw falla(429, 'Demasiadas solicitudes desde esta conexión. Intente en una hora');
  if (await contar('num:' + tel, 86400) > POR_NUMERO_DIA) throw falla(429, 'Este número ya recibió muchos mensajes hoy. Intente mañana');
  if (await contar('total', 86400) > limiteDiario()) throw falla(429, 'Se alcanzó el límite de envíos de hoy');
}

export async function incr(k, venceSeg) {
  const [n] = await kv(['INCR', k], ['EXPIREAT', k, venceSeg]);
  return n;
}
export function contar(clave, segundos) {
  const v = Math.floor(Date.now() / 1000 / segundos);
  return incr(`rl:${hmac(clave)}:${v}`, (v + 1) * segundos);
}

// ---------- cifrado ----------
// Una sola clave de entorno; de ella salen la de AES-GCM y la de HMAC. Sin Redis ni clave, una al azar que vive con la función.
let efimera;
function clave(uso) {
  const base = env.CLAVE_CIFRADO ? Buffer.from(env.CLAVE_CIFRADO, 'base64') : !redisListo() && (efimera ||= randomBytes(32));
  if (!base || base.length < 32) throw new Error('Falta CLAVE_CIFRADO (32 bytes en base64)');
  return Buffer.from(hkdfSync('sha256', base, '', uso, 32));
}
export const hmac = t => createHmac('sha256', clave('hmac')).update(t).digest('base64url').slice(0, 22);

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

// ---------- almacén: Upstash Redis por REST (Marketplace de Vercel) o, sin él, los mismos comandos en memoria ----------
const redisUrl = () => env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
const redisToken = () => env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
export const redisListo = () => !!(redisUrl() && redisToken());

export async function kv(...comandos) {
  if (!redisListo()) return comandos.map(enMemoria);
  const r = await fetch(redisUrl() + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + redisToken() }, body: JSON.stringify(comandos) });
  if (!r.ok) throw new Error('Redis respondió ' + r.status);
  return (await r.json()).map(x => { if (x.error) throw new Error('Redis: ' + x.error); return x.result; });
}

// Solo los comandos que usamos, con vencimiento. ponytail: por instancia; se pierde en cada arranque en frío.
export function memoria(mem = new Map()) {
  return ([cmd, k, ...a]) => {
    let e = mem.get(k);
    if (e?.vence && e.vence <= Date.now()) { mem.delete(k); e = undefined; }
    const poner = v => mem.set(k, e = { v, vence: e?.vence || 0 });
    switch (cmd) {
      case 'GET': return e?.v ?? null;
      case 'SET': mem.set(k, { v: a[0], vence: a[1] === 'EXAT' ? a[2] * 1000 : 0 }); return 'OK';
      case 'DEL': return +mem.delete(k);
      case 'INCR': poner((e?.v || 0) + 1); return e.v;
      case 'EXPIRE': if (e) e.vence = Date.now() + a[0] * 1000; return +!!e;
      case 'EXPIREAT': if (e) e.vence = a[0] * 1000; return +!!e;
      case 'SADD': if (!e) poner(new Set()); a.forEach(x => e.v.add(x)); return a.length;
      case 'SREM': a.forEach(x => e?.v.delete(x)); return a.length;
      case 'SMEMBERS': return [...(e?.v ?? [])];
    }
    throw new Error('Comando no soportado: ' + cmd);
  };
}
const enMemoria = memoria();

// Colombia no cambia de hora: UTC-5 todo el año.
const colombia = () => new Date(Date.now() - 5 * 3600e3);
export const hoyColombia = () => colombia().toISOString().slice(0, 10);
export const horaColombia = () => colombia().getUTCHours();

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
// Twilio acepta hasta 4000 caracteres de TwiML en línea: quien llame debe revisar el largo.
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
