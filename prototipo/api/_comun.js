// Utilidades de las funciones de /api. El guion bajo evita que Vercel publique este archivo como función.
// Sin claves de Twilio (o de ElevenLabs, o VAPID para push) todo queda en modo simulado (solo validación, sin límites);
// sin Redis, los datos viven en memoria.
import { createCipheriv, createDecipheriv, createECDH, createHmac, createPrivateKey, hkdfSync, randomBytes, sign } from 'node:crypto';

const env = process.env;
export const POR_IP_HORA = 60, POR_NUMERO_DIA = 10, CODIGOS_POR_NUMERO = 3, LLAMADAS_POR_DIA = 2;
export const limiteDiario = () => Number(env.LIMITE_DIARIO || 100);
export const limitePush = () => Number(env.LIMITE_PUSH_DIARIO || 1000);   // push no cuesta, pero tampoco es ilimitado
export const horarioVoz = () => horaColombia() >= 8 && horaColombia() < 19;   // llamadas solo de 8 a. m. a 7 p. m.

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

// Versión del texto de autorización que vio la persona (la define la app, junto al texto: "avisos-v1", "llamada-v1").
export function version(v) {
  if (!/^[a-z]+-v\d{1,3}$/.test(String(v ?? ''))) throw falla(400, 'Falta la versión del aviso de autorización');
  return v;
}
// Prueba mínima de la autorización (Ley 1581): seudónimo del número, fecha, versión del aviso, respuesta y canal. Nada más.
export const autorizacion = (destino, aviso, canal) =>
  ['SET', `aut:${hmac('num:' + destino)}:${canal}:${Date.now()}`, JSON.stringify({ aviso, fecha: new Date().toISOString(), respuesta: 'acepto', canal }), 'EXAT', Math.floor(Date.now() / 1000) + 370 * 86400];

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

// En los logs nunca va el número completo ni el texto; de una suscripción push, nada.
export const oculto = d => d.startsWith('+') ? '***' + d.slice(-2) : 'un navegador';

// ---------- protección contra abuso (solo con envío real: en modo simulado no se gasta nada) ----------
const ip = req => {
  const a = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'sin-ip';
  return a.includes(':') ? a.split(':').slice(0, 4).join(':') : a;   // IPv6: por red (≈/64), no por dirección
};

export async function proteger(req, tel, canal) {
  if (simulado(canal)) return;
  // Push solo lleva texto fijo a la suscripción de quien lo pide: sin lista blanca y con su propio cupo diario.
  const push = canal === 'push', agente = canal === 'agente', demo = env.NUMEROS_DEMO;
  // Cerrado por defecto: texto libre a cualquier número solo si se abre a propósito y hay límites globales (Redis).
  // El agente de voz (IA) solo llama a NUMEROS_DEMO, aunque PERMITIR_ENVIO_ABIERTO esté puesto.
  if (!push && !demo && (agente || env.PERMITIR_ENVIO_ABIERTO !== '1' || !redisListo()))
    throw falla(503, agente ? 'Llamadas del asistente cerradas: configure NUMEROS_DEMO' : 'Envíos reales cerrados: configure NUMEROS_DEMO, o Redis y PERMITIR_ENVIO_ABIERTO=1');
  if (!push && demo && !demo.split(',').map(normalizar).includes(tel)) throw falla(403, 'Este número no está autorizado para el demo');
  // ponytail: 60 por hora y red tolera CGNAT y el Wi-Fi del evento; el freno real son el tope por número y el diario.
  if (await contar('ip:' + ip(req), 3600) > POR_IP_HORA) throw falla(429, 'Demasiadas solicitudes desde esta conexión. Intente en una hora');
  // Llamadas (agente o voz leída): tope propio y bajo por número, aparte del de SMS.
  if ((agente || canal === 'llamada') && await contar('voz:' + tel, 86400) > LLAMADAS_POR_DIA) throw falla(429, 'Este número ya tiene las llamadas de hoy. Intente mañana');
  if (await contar('num:' + tel, 86400) > POR_NUMERO_DIA) throw falla(429, push ? 'Este celular ya pidió muchos avisos hoy. Intente mañana' : 'Este número ya recibió muchos mensajes hoy. Intente mañana');
  if (await contar(push ? 'push-total' : 'total', 86400) > (push ? limitePush() : limiteDiario())) throw falla(429, 'Se alcanzó el límite de envíos de hoy');
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
// 'agente': llamada del agente de voz de ElevenLabs (api/llamar.js); 'push': notificación web con VAPID.
export const simulado = canal =>
  canal === 'agente' ? !(env.ELEVENLABS_API_KEY && env.ELEVENLABS_PHONE_NUMBER_ID)
  : canal === 'push' ? !(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT)
  : !(twilioListo() && desde(canal));

async function twilio(recurso, datos) {
  const sid = env.TWILIO_ACCOUNT_SID;
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/${recurso}.json`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${env.TWILIO_AUTH_TOKEN}`).toString('base64') },
    body: new URLSearchParams(datos),
    signal: AbortSignal.timeout(8000),
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

// Lo que dice una llamada con voz leída (recordatorio, o respaldo si el agente de ElevenLabs no está): plantilla fija,
// solo el código letra por letra y la fecha. `hoy` decide si el plazo vence o ya venció.
export const fechaVoz = f => new Date(f + 'T12:00Z').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
export const textoLlamada = (codigo, vence, hoy) => 'Hola. Le habla MiDerecho, un servicio automático. ' +
  (codigo ? `Le recordamos su caso ${[...codigo].join(', ')}. ${vence ? `El plazo ${hoy > vence ? 'venció' : 'vence'} el ${fechaVoz(vence)}. ` : ''}` : '') +
  'Si la entidad no le ha respondido, abra la app MiDerecho o pida ayuda a su líder o a la Personería.';

// plantilla: { sid, variables } de una plantilla aprobada de WhatsApp (obligatoria fuera de la ventana de 24 h).
export async function enviar(canal, tel, t, { pdfUrl, plantilla } = {}) {
  if (simulado(canal)) {
    console.log(`[${canal}] simulado a ${oculto(tel)}: ${t.length} caracteres${pdfUrl ? ' + PDF' : ''}`);
    return { ok: true, simulado: true };
  }
  if (canal === 'sms') await twilio('Messages', { To: tel, From: desde(canal), Body: t });
  if (canal === 'llamada') await twilio('Calls', { To: tel, From: desde(canal), Twiml: twiml(t) });
  if (canal === 'push') await push(JSON.parse(tel), t);
  if (canal === 'whatsapp') await twilio('Messages', {
    To: 'whatsapp:' + tel, From: 'whatsapp:' + desde(canal),
    ...(plantilla ? { ContentSid: plantilla.sid, ContentVariables: JSON.stringify(plantilla.variables) } : { Body: t }),
    ...(pdfUrl && { MediaUrl: pdfUrl }),
  });
  console.log(`[${canal}] enviado a ${oculto(tel)}`);
  return { ok: true, simulado: false };
}

// ---------- Web Push (RFC 8291 y 8292) con node:crypto, sin librería ----------
// Solo servicios de push conocidos: el servidor hace POST a esa URL y no debe servir para llamar a cualquier sitio.
const SERVICIOS_PUSH = /^(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[\w-]+\.notify\.windows\.com)$/;
const b64u = t => Buffer.from(String(t ?? ''), 'base64url');

// La suscripción del navegador, validada y como texto: es lo que se cifra y se guarda, igual que un teléfono.
export function suscripcion(s) {
  let u;
  try { u = new URL(s.endpoint); } catch { u = null; }
  const p256dh = b64u(s?.keys?.p256dh), auth = b64u(s?.keys?.auth);
  if (u?.protocol !== 'https:' || !SERVICIOS_PUSH.test(u.hostname) || u.href.length > 800 || p256dh.length !== 65 || p256dh[0] !== 4 || auth.length !== 16)
    throw falla(400, 'Suscripción de avisos inválida');
  return JSON.stringify({ endpoint: u.href, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } });
}

// Cuerpo cifrado aes128gcm (RFC 8291). `efimera` y `sal` solo se pasan en la prueba con el ejemplo del RFC.
export function cifrarPush(texto, { keys }, efimera, sal = randomBytes(16)) {
  const ua = b64u(keys.p256dh), e = createECDH('prime256v1');
  efimera ? e.setPrivateKey(efimera) : e.generateKeys();
  const as = e.getPublicKey();
  const ikm = hkdfSync('sha256', e.computeSecret(ua), b64u(keys.auth), Buffer.concat([Buffer.from('WebPush: info\0'), ua, as]), 32);
  const parte = (info, n) => Buffer.from(hkdfSync('sha256', Buffer.from(ikm), sal, info, n));
  const c = createCipheriv('aes-128-gcm', parte('Content-Encoding: aes128gcm\0', 16), parte('Content-Encoding: nonce\0', 12));
  const datos = Buffer.concat([c.update(Buffer.from(texto + '\x02')), c.final(), c.getAuthTag()]);   // 0x02: último registro, sin relleno
  return Buffer.concat([sal, Buffer.from([0, 0, 16, 0, 65]), as, datos]);   // tamaño de registro 4096 y llave pública efímera
}

// Firma VAPID (JWT ES256) para que el servicio de push sepa que el aviso viene de este servidor.
function vapid(endpoint) {
  const pub = b64u(env.VAPID_PUBLIC_KEY), parte = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const llave = createPrivateKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256', d: env.VAPID_PRIVATE_KEY,
    x: pub.subarray(1, 33).toString('base64url'), y: pub.subarray(33).toString('base64url') } });
  const jwt = parte({ typ: 'JWT', alg: 'ES256' }) + '.' + parte({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT });
  return `vapid t=${jwt}.${sign('sha256', Buffer.from(jwt), { key: llave, dsaEncoding: 'ieee-p1363' }).toString('base64url')}, k=${env.VAPID_PUBLIC_KEY}`;
}

async function push(s, texto) {
  const r = await fetch(s.endpoint, {
    method: 'POST',
    headers: { Authorization: vapid(s.endpoint), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'high' },
    body: cifrarPush(JSON.stringify({ texto }), s),
    signal: AbortSignal.timeout(8000),
  });
  if (r.status === 404 || r.status === 410) throw falla(410, 'Ese celular ya no recibe los avisos');   // quien llama borra el registro
  if (!r.ok) {
    console.error(`[push] el servicio respondió ${r.status}`);
    throw falla(502, `El servicio de avisos respondió ${r.status}`);
  }
}
