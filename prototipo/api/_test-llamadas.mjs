// Pruebas de la llamada del agente de voz (api/llamar.js) y de los recordatorios por llamada y push, sin cuentas reales:
//   node prototipo/api/_test-llamadas.mjs
// Parte 1, modo simulado. Parte 2, con un fetch falso que imita a ElevenLabs, QStash, Upstash, Twilio y un servicio de push.
// Reloj fijo. El guion bajo evita que Vercel publique este archivo.
import assert from 'node:assert/strict';
import { createECDH, createHash, createHmac, createDecipheriv, createPublicKey, generateKeyPairSync, hkdfSync, randomBytes, verify } from 'node:crypto';

for (const k of Object.keys(process.env))
  if (/^(TWILIO_|KV_|UPSTASH_|NUMEROS_DEMO|CLAVE_CIFRADO|LIMITE_|PERMITIR_ENVIO_ABIERTO|ELEVENLABS_|QSTASH_|VAPID_|GEMINI_|ANTHROPIC_|elevenlabs|gemini|twiilo)/.test(k)) delete process.env[k];
process.env.CRON_SECRET = 'secreto-de-prueba';
const env = process.env, mostrar = console.log, logs = [];
console.log = console.error = (...a) => logs.push(a.join(' '));
let ahora;
Date.now = () => ahora;
const ir = iso => { ahora = Date.parse(iso); };
ir('2026-10-21T15:00:00Z');   // 10 a. m. en Colombia

const { cifrarPush, memoria, textoLlamada, POR_NUMERO_DIA, CODIGOS_POR_NUMERO } = await import('./_comun.js');
const { textoPush } = await import('./cron-recordatorios.js');
const { sellar, abrir: abrirSello, paraElOido, MAX_TURNOS, VOZ } = await import('./_ia-telefono.js');

async function api(ruta, method, body, { ip = '10.0.0.1', headers = {}, query } = {}) {
  const { default: h } = await import(`./${ruta}.js`), r = { cabeceras: {} };
  await h({ method, body, query, headers: { 'x-real-ip': ip, host: 'miderecho.test', 'content-type': 'application/json', ...headers } },
    { status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; },
      setHeader(k, v) { r.cabeceras[k.toLowerCase()] = v; }, send(t) { r.texto = t; return this; } });
  return r;
}
const TEL = '3001112233';
const llamar = (cambios = {}, opciones) => api('llamar', 'POST', { telefono: TEL, acepto: true, aviso: 'llamada-v1', codigo: 'ABCD', vence: '2026-11-03', ...cambios }, opciones);
const programar = cambios => api('recordatorios', 'POST', { codigo: 'K7P2', canal: 'sms', telefono: TEL, fechas: ['2026-11-03'], vence: '2026-11-03', acepto: true, aviso: 'avisos-v1', ...cambios });
const cron = () => api('cron-recordatorios', 'GET', null, { headers: { authorization: 'Bearer secreto-de-prueba' } });
// Un navegador de verdad: llaves del cliente para descifrar lo que le llega.
const ua = createECDH('prime256v1'); ua.generateKeys();
const auth = randomBytes(16);
const sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc123', keys: { p256dh: ua.getPublicKey().toString('base64url'), auth: auth.toString('base64url') } };
const programarPush = cambios => programar({ codigo: 'ABCD', canal: 'push', telefono: undefined, suscripcion: sub, fechas: ['2026-11-02', '2026-11-03', '2026-11-04'], ...cambios });
let r;

// ---------- parte 1: modo simulado ----------
r = await llamar();
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
assert.equal((await llamar({ codigo: undefined, vence: undefined })).status, 200);   // solo orientación, sin caso
assert.equal((await llamar({}, { headers: { 'content-type': 'text/plain' } })).status, 415);
assert.equal((await llamar({}, { headers: { 'sec-fetch-site': 'cross-site' } })).status, 403);
assert.equal((await llamar({}, { headers: { origin: 'https://malo.example' } })).status, 403);

// autorización expresa: `acepto: true` y la versión del texto que vio la persona
for (const acepto of [undefined, false, 'true', 1]) assert.match((await llamar({ acepto })).error, /autorización/);
for (const aviso of [undefined, '', 'llamada', 'Llamada-v1', 'x-v1; borrar']) assert.match((await llamar({ aviso })).error, /versión del aviso/);
// solo celulares de Colombia
for (const telefono of ['12345', '+1 415 555 0100', '601 234 5678', '', null]) assert.equal((await llamar({ telefono })).status, 400, `debió rechazar ${telefono}`);
assert.equal((await llamar({ codigo: 'abc' })).status, 400);
assert.equal((await llamar({ codigo: '<script>' })).status, 400);
assert.equal((await llamar({ vence: '2026-02-30' })).status, 400);
assert.equal((await llamar({ vence: 'mañana' })).status, 400);

// horario: llamar ya solo de 8 a. m. a 7 p. m. en Colombia
ir('2026-10-21T12:59:00Z');   // 7:59 a. m.
assert.match((await llamar()).error, /8 a\. m\. a 7 p\. m\./);
ir('2026-10-21T13:00:00Z');   // 8:00 a. m.
assert.equal((await llamar()).status, 200);
ir('2026-10-21T23:59:00Z');   // 6:59 p. m.
assert.equal((await llamar()).status, 200);
ir('2026-10-22T00:00:00Z');   // 7:00 p. m.
assert.match((await llamar()).error, /8 a\. m\. a 7 p\. m\./);

// agendar: franjas en punto o y media, de 8 a. m. a 6:30 p. m., desde 10 minutos y hasta 7 días
ir('2026-10-21T15:00:00Z');
const agendar = cuando => llamar({ cuando });
r = await agendar('2026-10-22T09:00-05:00');
assert.deepEqual([r.status, r.simulado], [200, true]);
assert.match(r.token, /^[\w-]{22}$/);
assert.equal((await agendar('2026-10-22T18:30-05:00')).status, 200);
assert.equal((await agendar('2026-10-22T23:30Z')).status, 200);   // es 6:30 p. m. en Colombia
for (const cuando of ['2026-10-22T07:30-05:00', '2026-10-22T19:00-05:00', '2026-10-22T09:15-05:00', '2026-10-21T10:00-05:00',
  '2026-10-28T10:30-05:00', '2026-10-22T09:00', '2026-10-22 09:00-05:00', 'mañana a las 9', 1792677600])
  assert.equal((await agendar(cuando)).status, 400, `debió rechazar ${cuando}`);
assert.equal((await agendar('2026-10-21T10:30-05:00')).status, 200);   // dentro de 30 minutos sí
assert.equal((await agendar('2026-10-28T10:00-05:00')).status, 200);   // justo 7 días
// cancelar: token de 22 caracteres; siempre responde igual
assert.equal((await api('llamar', 'DELETE', { token: 'x' })).status, 400);
assert.equal((await api('llamar', 'DELETE', { token: 'a'.repeat(22) })).status, 200);
// la ruta de QStash exige firma
assert.equal((await api('llamar', 'PUT', { id: 'x' })).status, 401);

// en modo simulado no hay límites (no se gasta nada)
for (let i = 0; i <= POR_NUMERO_DIA; i++) assert.equal((await llamar({}, { ip: '10.0.0.9' })).status, 200);

// push: la clave pública VAPID sale del GET de recordatorios, y la suscripción solo puede ser de un servicio conocido
r = await api('recordatorios', 'GET');
assert.deepEqual([r.status, r.simulado, r.clave], [200, true, null]);
assert.match((r = await programarPush()).token, /^[\w-]{22}$/);
for (const endpoint of ['http://fcm.googleapis.com/fcm/send/x', 'https://malo.example/push', 'https://169.254.169.254/latest', 'https://fcm.googleapis.com.malo.example/x',
  'https://localhost/x', 'no es url', undefined])
  assert.equal((await programarPush({ suscripcion: { ...sub, endpoint } })).status, 400, `debió rechazar ${endpoint}`);
for (const endpoint of ['https://updates.push.services.mozilla.com/wpush/v2/x', 'https://web.push.apple.com/QX', 'https://wns2-by3p.notify.windows.com/w/?token=x'])
  assert.equal((await programarPush({ suscripcion: { ...sub, endpoint } })).status, 200, endpoint);
assert.equal((await programarPush({ suscripcion: { ...sub, keys: { ...sub.keys, auth: 'corto' } } })).status, 400);
assert.equal((await programarPush({ suscripcion: { ...sub, keys: { ...sub.keys, p256dh: randomBytes(65).toString('base64url') } } })).status, 400);
assert.equal((await programarPush({ suscripcion: null })).status, 400);
assert.equal((await programarPush({ vence: undefined })).status, 400);
assert.equal((await programarPush({ vence: '2026-11-31' })).status, 400);
assert.equal((await api('recordatorios', 'DELETE', { codigo: 'ABCD', token: r.token })).status, 200);

// textos fijos: llamada con voz leída (recordatorio) y push (solo código y cuándo vence)
assert.equal(textoLlamada('K7P2', '2026-11-03', '2026-10-30'), 'Hola. Le habla MiDerecho, un servicio automático. Le recordamos su caso K, 7, P, 2. El plazo vence el martes, 3 de noviembre. Si la entidad no le ha respondido, abra la app MiDerecho o pida ayuda a su líder o a la Personería.');
assert.match(textoLlamada('K7P2', '2026-11-03', '2026-11-04'), /El plazo venció el martes, 3 de noviembre\./);
assert.equal(textoPush('ABCD', '2026-11-02', '2026-11-03'), 'Su caso ABCD vence mañana.');
assert.equal(textoPush('ABCD', '2026-11-03', '2026-11-03'), 'Su caso ABCD vence hoy.');
assert.equal(textoPush('ABCD', '2026-10-30', '2026-11-03'), 'Su caso ABCD vence el 3 de noviembre.');
assert.equal(textoPush('ABCD', '2026-11-04', '2026-11-03'), 'Se venció el plazo del caso ABCD. Abra MiDerecho para ver qué sigue.');

// cifrado push: el ejemplo del RFC 8291, byte por byte
assert.equal(cifrarPush('When I grow up, I want to be a watermelon',
  { keys: { p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', auth: 'BTBZMqHH6r4Tts7J_aSIgg' } },
  Buffer.from('yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw', 'base64url'), Buffer.from('DGv6ra1nlYgDCS1FRnbzlw', 'base64url')).toString('base64url'),
  'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN');

// menú de voz (lo pide Twilio por GET): nada del caso antes de que alguien oprima una tecla (un buzón no oprime)
const menu = (query, opciones) => api('llamar', 'GET', undefined, { query, ...opciones });
// Las acciones del TwiML: POST (sin method), una URL sin "&" y todo en `m` (la cuenta de prueba de Twilio no siguió las otras).
const destinoDe = twiml => { const u = new URL(twiml.match(/action="([^"]+)"/)?.[1] || twiml.match(/<Redirect>([^<]+)<\/Redirect>/)[1]); return { u, m: JSON.parse(Buffer.from(u.searchParams.get('m'), 'base64url')) }; };
ir('2026-10-30T15:00:00Z');
r = await menu({ codigo: 'ABCD', vence: '2026-11-03' });
assert.deepEqual([r.status, r.cabeceras['content-type']], [200, 'text/xml; charset=utf-8']);
assert.match(r.texto, /<Gather input="dtmf" numDigits="1" timeout="10" action="https:\/\/miderecho\.test\/api\/llamar\?m=[\w-]+">/);
assert.deepEqual(destinoDe(r.texto).m, { paso: '1', codigo: 'ABCD', vence: '2026-11-03' });
assert.ok(!/method=|&amp;|&#38;|input="dtmf speech"|<Gather input="speech"/.test(r.texto));
assert.match(r.texto, /oprima cualquier tecla/);
assert.ok(!/A, B|noviembre|MiDerecho/.test(r.texto), 'antes de la tecla no se dice nada del caso');
assert.match(r.texto, /<Hangup\/><\/Response>$/);
r = await menu({ paso: '1', codigo: 'ABCD', vence: '2026-11-03' });
assert.match(r.texto, /Le recordamos su caso A, B, C, D\. El plazo vence el martes, 3 de noviembre\./);
assert.match(r.texto, /<Gather input="dtmf" numDigits="1" timeout="8" action="https:\/\/miderecho\.test\/api\/llamar\?m=[\w-]+">[^]*oprima 1\. Si no le han respondido, oprima 2/);
assert.deepEqual(destinoDe(r.texto).m, { paso: '2', codigo: 'ABCD', vence: '2026-11-03' });
r = await menu({ paso: '1' });   // llamada sin caso: solo orientación
assert.match(r.texto, /qué documento le sirve/);
assert.ok(!r.texto.includes('<Gather'));
const paso2 = (extra, vence = '2026-11-03') => menu({ paso: '2', codigo: 'ABCD', vence, ...extra }).then(x => x.texto);
assert.match(await paso2({ Digits: '1' }), /Qué bien/);
assert.match(await paso2({ Digits: '2' }), /Todavía están a tiempo/);
assert.match(await paso2({ Digits: '2' }, '2026-10-20'), /Si ya pasó la fecha[^<]*no consejo de abogado/);
assert.match(await paso2({ Digits: '9' }), /uno, dos, tres[^]*Repito[^]*uno, dos, tres/);
r = { texto: await paso2({ Digits: '3' }) };
assert.match(r.texto, /<Redirect>https:\/\/miderecho\.test\/api\/llamar\?m=[\w-]+<\/Redirect>/);
assert.equal(destinoDe(r.texto).m.paso, '1');
// todo en `m` o con los parámetros sueltos de antes (la URL del plan B por la consola de Twilio)
assert.match((await menu({ m: Buffer.from(JSON.stringify({ paso: '2', codigo: 'ABCD', vence: '2026-11-03' })).toString('base64url'), Digits: '1' })).texto, /Qué bien/);
assert.match(await paso2({ Digits: '7' }), /No le entendí\.[^]*<Redirect/);
assert.match((await menu({ codigo: '<x>' })).texto, /No pudimos leer este recordatorio/);   // datos malos: igual responde TwiML
// la cuenta de prueba de Twilio puede pedirlo por POST de formulario (no JSON)
r = await api('llamar', 'POST', { Digits: '1' }, { query: { paso: '2', codigo: 'ABCD', vence: '2026-11-03' }, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
assert.match(r.texto, /Qué bien/);

// ---------- conversación con IA en el menú (modo básico: sin Gemini ni ElevenLabs) ----------
const accion = twiml => destinoDe(twiml).m;
const seguir = (twiml, extra) => menu({ ...accion(twiml), ...extra });
const l = sellar({ e: Math.floor(ahora / 1000) + 900 });
// sin la prueba de que la llamada salió de aquí (`l`), no se ofrece la asistente
assert.ok(!(await menu({ paso: '1', codigo: 'ABCD', vence: '2026-11-03' })).texto.includes('oprima 4'));
assert.match((await menu({ paso: '2', codigo: 'ABCD', vence: '2026-11-03', Digits: '4' })).texto, /No le entendí[^]*<Redirect/);
assert.match((await menu({ paso: '2', codigo: 'ABCD', vence: '2026-11-03', Digits: '4', l: sellar({ e: Math.floor(ahora / 1000) - 1 }) })).texto, /No le entendí/);   // vencida
assert.match((await menu({ paso: '2', codigo: 'ABCD', Digits: '4', l: l.slice(0, -2) + (l.at(-2) === 'A' ? 'B' : 'A') + l.at(-1) })).texto, /No le entendí/);   // alterada
// con `l`: el menú la ofrece, avisa qué es antes de conversar y pide oprimir 1
r = await menu({ paso: '1', codigo: 'ABCD', vence: '2026-11-03', l });
assert.match(r.texto, /Si está en peligro, oprima 9\. Para hablar con la asistente, oprima 4\./);
assert.match((await menu({ paso: '1', l })).texto, /<Gather[^>]*>[^]*oprima 4[^]*<\/Gather>[^]*qué documento le sirve/);   // también sin caso
r = await seguir(r.texto, { Digits: '4' });
assert.match(r.texto, /<Gather input="dtmf" numDigits="1" timeout="8" action="https:\/\/miderecho\.test\/api\/llamar\?m=[\w-]+">/);
assert.equal(accion(r.texto).paso, 'ia');
assert.match(r.texto, /inteligencia artificial: no es una persona ni un abogado\. No diga su nombre, su cédula ni datos de otras personas\. Para aceptar/);
assert.ok(!r.texto.includes('Google'), 'sin Gemini no se menciona a Google');
assert.match((await seguir(r.texto, { Digits: '2' })).texto, /Recuerde que soy un asistente automático/);   // no aceptó
r = await seguir(r.texto, { Digits: '1', To: '+573001112233' });
assert.match(r.texto, /<Gather input="speech" language="es-CO" speechTimeout="auto" timeout="7" action="https:\/\/miderecho\.test\/api\/llamar\?m=[\w-]+">/);
assert.deepEqual([accion(r.texto).paso, typeof accion(r.texto).s], ['turno', 'string']);
assert.match(r.texto, /<Say[^>]*>Cuénteme en pocas palabras qué necesita, sin nombres ni números\.<\/Say>/);   // sin ElevenLabs: voz de Twilio
// turno con el modo básico: trato de usted (sus preguntas vienen en tú) y frase fija del documento
const t1 = await seguir(r.texto, { SpeechResult: 'La EPS no me da la cita, mi cédula es 1144555666' });
assert.match(t1.texto, />Entiendo, es un problema con su atención en salud\. ¿Es urgente\? ¿Su salud corre peligro si sigue esperando\? Puede decir: Sí, es urgente, o No, pero lo necesito, o No sé\.</);
assert.match((await seguir(t1.texto, { SpeechResult: 'me cobraron de más el agua en la factura' })).texto,
  /Para esto sirve un reclamo a la empresa de servicios públicos\. Es gratis y no necesita abogado\. Lo puede hacer en la app MiDerecho/);
const s1 = abrirSello(accion(t1.texto).s);
assert.deepEqual([s1.n, s1.c, s1.h.length], [1, 'ABCD', 2]);
assert.ok(!JSON.stringify(s1).includes('1144555666'), 'la cédula no pasa a la conversación');
assert.ok(!t1.texto.includes('EPS no me da'), 'la URL no lleva lo que dijo la persona en claro');
// lo que no se oye y lo que no abre
assert.match((await seguir(t1.texto, { SpeechResult: '' })).texto, /Parece que no le escucho/);
assert.match((await menu({ ...accion(t1.texto), s: accion(t1.texto).s.slice(0, -3) + 'abc', SpeechResult: 'hola' })).texto, /Recuerde que soy un asistente automático/);
// riesgo: texto fijo, sin más turnos
const tr = await seguir(t1.texto, { SpeechResult: 'unos armados me amenazaron' });
assert.match(tr.texto, /uno, dos, tres[^]*Repito/);
assert.ok(!tr.texto.includes('<Gather'));
// máximo de turnos: el último cierra sin volver a escuchar
let tn = t1;
for (let n = 2; n <= MAX_TURNOS; n++) tn = await seguir(tn.texto, { SpeechResult: 'hola' });
assert.ok(!tn.texto.includes('<Gather'));
assert.match(tn.texto, /Se nos acabó el tiempo[^]*Recuerde que soy un asistente automático/);
// y el tiempo: pasados los 4 minutos (más margen), un estado viejo ya no conversa
ir('2026-10-30T15:07:00Z');
assert.match((await seguir(t1.texto, { SpeechResult: 'hola' })).texto, /^[^]*Recuerde que soy un asistente automático[^]*$/);
assert.ok(!(await seguir(t1.texto, { SpeechResult: 'hola' })).texto.includes('<Gather'));
assert.equal(paraElOido('**Hola.**\n- Uno. Dos. Tres. Cuatro.'), 'Hola. Uno. Dos.');
assert.equal(paraElOido('¿Es urgente? Dígame sí o no.'), '¿Es urgente? Dígame sí o no.');

// ---------- parte 2: ElevenLabs, QStash, Upstash, Twilio y servicio de push falsos ----------
let mapa = new Map(), redis = memoria(mapa), fallaEleven = false, fallaQstash = false, estadoPush = 201, fallaGemini = false, fallaTts = false, lentoGemini = false, lentoTts = false;
let textoGemini = 'Entiendo. Para esto sirve una tutela de salud. ¿Es urgente para su salud?';
const pedidosGemini = [], voces = [];
const llamadas = [], publicados = [], avisos = [], twilio = [], orden = [];
globalThis.fetch = async (url, { body, headers, signal }) => {
  if (!url.startsWith('https://kv.test/')) assert.ok(signal, `sin tiempo límite: ${url}`);
  if (url.startsWith('https://api.twilio.com/')) {
    twilio.push(Object.fromEntries(body)); orden.push('twilio');
    return new Response('{"sid":"CA1"}', { status: 201 });
  }
  if (url === 'https://api.elevenlabs.io/v1/convai/twilio/outbound-call') {
    llamadas.push({ headers, datos: JSON.parse(body) });
    return fallaEleven ? new Response(JSON.stringify({ detail: `no se pudo llamar a ${JSON.parse(body).to_number}` }), { status: 422 })
      : new Response(JSON.stringify({ success: true, message: 'ok', conversation_id: 'c1', callSid: 'CA1' }));
  }
  if (url.startsWith('https://qstash.test/')) {
    publicados.push({ url, headers, body });
    return new Response('{"messageId":"msg_1"}', { status: fallaQstash ? 500 : 201 });
  }
  if (url.startsWith('https://generativelanguage.googleapis.com/')) {
    pedidosGemini.push({ url, headers, datos: JSON.parse(body) });
    if (lentoGemini) await new Promise((_, no) => {   // nunca responde a tiempo (el setTimeout mantiene vivo el proceso de la prueba)
      const vivo = setTimeout(() => {}, 9000);
      signal.addEventListener('abort', () => { clearTimeout(vivo); no(signal.reason); });
    });
    return fallaGemini ? new Response('{}', { status: 500 }) : new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: textoGemini }] }, finishReason: 'STOP' }] }));
  }
  if (url.startsWith('https://api.elevenlabs.io/v1/text-to-speech/')) {
    voces.push({ url, headers, datos: JSON.parse(body) });
    if (lentoTts) await new Promise(r => setTimeout(r, 2000));
    return fallaTts ? new Response('{}', { status: 401 }) : new Response(Buffer.from('ID3-mp3-de-prueba'), { headers: { 'content-type': 'audio/mpeg' } });
  }
  if (url.startsWith('https://fcm.googleapis.com/')) {
    avisos.push({ url, headers, body }); orden.push('push');
    return new Response('', { status: estadoPush });
  }
  assert.deepEqual([url, headers.Authorization], ['https://kv.test/pipeline', 'Bearer kv']);
  return new Response(JSON.stringify(JSON.parse(body).map(c => ({ result: redis(c) }))));
};
const vapid = generateKeyPairSync('ec', { namedCurve: 'prime256v1' }), jwk = vapid.privateKey.export({ format: 'jwk' });
Object.assign(env, {
  ELEVENLABS_API_KEY: 'xi-prueba', ELEVENLABS_PHONE_NUMBER_ID: 'phnum_prueba', KV_REST_API_URL: 'https://kv.test', KV_REST_API_TOKEN: 'kv',
  CLAVE_CIFRADO: randomBytes(32).toString('base64'), QSTASH_URL: 'https://qstash.test', QSTASH_TOKEN: 'qs-token',
  QSTASH_CURRENT_SIGNING_KEY: 'sig_actual', QSTASH_NEXT_SIGNING_KEY: 'sig_siguiente', VAPID_PRIVATE_KEY: jwk.d,
  VAPID_PUBLIC_KEY: Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, 'base64url'), Buffer.from(jwk.y, 'base64url')]).toString('base64url'),
  VAPID_SUBJECT: 'mailto:equipo@miderecho.test',
});
ir('2026-10-21T15:00:00Z');

// falla cerrada: con claves reales, el agente solo llama a NUMEROS_DEMO, aunque el envío esté abierto
assert.match((await llamar()).error, /NUMEROS_DEMO/);
env.PERMITIR_ENVIO_ABIERTO = '1';
assert.match((await llamar()).error, /NUMEROS_DEMO/);
delete env.PERMITIR_ENVIO_ABIERTO;
assert.equal(llamadas.length, 0);
env.NUMEROS_DEMO = '3001112233, 310 000 0000';
assert.equal((await llamar({ telefono: '3209998877' })).status, 403);
assert.equal(llamadas.length, 0);

// llamada real: formato exacto para ElevenLabs (día 1: dos llamadas, la tercera ya no)
r = await llamar();
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, false]);
assert.equal(llamadas.at(-1).headers['xi-api-key'], 'xi-prueba');
const d = llamadas.at(-1).datos;
assert.deepEqual([d.agent_id, d.agent_phone_number_id, d.to_number], ['agent_3901m5fd72hyedssc8h6r4gznevn', 'phnum_prueba', '+573001112233']);
assert.deepEqual(d.conversation_initiation_client_data, { dynamic_variables: { codigo: 'A, B, C, D', vence: 'martes, 3 de noviembre' } });
assert.equal(d.telephony_call_config.twilio_call_recording_enabled, false);
assert.deepEqual(d.telephony_call_config.twilio_machine_detection.actions, [{ action: 'hang_up', answered_by: ['machine_start', 'fax'] }]);
assert.ok(!('conversation_config_override' in d.conversation_initiation_client_data));   // nada de cambiar el prompt desde aquí
// varios toques seguidos: la misma llamada no se repite en 90 s (por instancia) y no gasta del tope diario
assert.match((await llamar()).error, /Ya lo estamos llamando/);
assert.equal(llamadas.length, 1);
ahora += 91e3;
await llamar({ codigo: '', vence: '' });
assert.deepEqual(llamadas.at(-1).datos.conversation_initiation_client_data.dynamic_variables, { codigo: 'ninguno', vence: 'ninguna' });
ahora += 91e3;
assert.match((await llamar()).error, /llamadas de hoy/);   // tope propio: 2 llamadas al día por número
assert.equal(llamadas.length, 2);

// prueba de la autorización: seudónimo, fecha, versión, respuesta y canal; sin número ni código
const autorizaciones = () => [...mapa].filter(([k]) => k.startsWith('aut:')).map(([k, { v }]) => [k, JSON.parse(v)]);
assert.ok(autorizaciones().length);
for (const [k, v] of autorizaciones()) {
  assert.deepEqual(Object.keys(v), ['aviso', 'fecha', 'respuesta', 'canal']);
  assert.deepEqual([v.aviso, v.respuesta, v.canal], ['llamada-v1', 'acepto', 'agente']);
  assert.ok(!/3001112233|ABCD/.test(k + JSON.stringify(v)));
}

// día 2: otro agente por variable; si ElevenLabs falla, 502 sin su mensaje (trae el número) y SIN respaldo con voz leída
ir('2026-10-22T15:00:00Z');
env.ELEVENLABS_AGENT_ID = 'agent_otro';
await llamar();
assert.equal(llamadas.at(-1).datos.agent_id, 'agent_otro');
delete env.ELEVENLABS_AGENT_ID;
Object.assign(env, { TWILIO_ACCOUNT_SID: 'ACprueba', TWILIO_AUTH_TOKEN: 'token', TWILIO_FROM: '+15005550006' });
fallaEleven = true;
ahora += 91e3;
assert.deepEqual([(r = await llamar()).status, r.error], [502, 'No se pudo hacer la llamada (código 422)']);
assert.equal(twilio.length, 0, 'una voz grabada podría dejar el código en un buzón');
fallaEleven = false;

// día 3: agendar de verdad; el número queda cifrado en Redis y QStash vuelve a la hora con PUT
ir('2026-10-23T15:00:00Z');
r = await llamar({ cuando: '2026-10-24T09:00-05:00' });
assert.deepEqual([r.status, r.simulado], [200, false]);
const p1 = publicados.at(-1), id1 = JSON.parse(p1.body).id;
assert.equal(p1.url, 'https://qstash.test/v2/publish/https://miderecho.test/api/llamar');
assert.deepEqual([p1.headers.Authorization, p1.headers['Upstash-Method'], p1.headers['Upstash-Not-Before']], ['Bearer qs-token', 'PUT', String(Date.parse('2026-10-24T14:00:00Z') / 1000)]);
assert.deepEqual(Object.keys(JSON.parse(p1.body)), ['id']);   // a QStash no le llega ni el número ni el token
assert.notEqual(id1, r.token);
assert.ok(!/3001112233|\+57/.test(mapa.get('llam:' + id1).v), 'el número debe quedar cifrado');
// una sola agendada por número: la nueva reemplaza la anterior
await llamar({ cuando: '2026-10-24T10:00-05:00' });
const pub = publicados.at(-1), { id } = JSON.parse(pub.body);
assert.equal(mapa.has('llam:' + id1), false);
assert.equal(mapa.has('llam:' + id), true);

// firma de QStash
const firmar = (cuerpo, { clave = 'sig_actual', sub: s = 'https://miderecho.test/api/llamar', exp = 300, hash } = {}) => {
  const p = o => Buffer.from(JSON.stringify(o)).toString('base64url'), t = Math.floor(ahora / 1000);
  const jwt = p({ alg: 'HS256', typ: 'JWT' }) + '.' + p({ iss: 'Upstash', sub: s, exp: t + exp, nbf: t, iat: t, jti: 'jwt_1',
    body: hash ?? createHash('sha256').update(cuerpo).digest('base64').replace(/\+/g, '-').replace(/\//g, '_') });
  return jwt + '.' + createHmac('sha256', clave).update(jwt).digest('base64url');
};
const qstash = (cuerpo, opciones) => api('llamar', 'PUT', JSON.parse(cuerpo), { headers: { 'upstash-signature': firmar(cuerpo, opciones) } });
const antes = llamadas.length;
ir('2026-10-24T14:00:02Z');
assert.equal((await qstash(p1.body)).status, 200);   // la reemplazada llega y no pasa nada
assert.equal(llamadas.length, antes);
ir('2026-10-24T15:00:02Z');
assert.equal((await qstash(pub.body, { clave: 'sig_falsa' })).status, 401);
assert.equal((await qstash(pub.body, { sub: 'https://malo.example/api/llamar' })).status, 401);
assert.equal((await qstash(pub.body, { exp: -120 })).status, 401);
assert.equal((await qstash(pub.body, { hash: createHash('sha256').update('{"id":"otro"}').digest('base64url') })).status, 401);
assert.equal((await api('llamar', 'PUT', { id }, { headers: { 'upstash-signature': firmar(pub.body).split('.').slice(0, 2).join('.') + '.' } })).status, 401);
assert.equal(llamadas.length, antes);
assert.equal((await qstash(pub.body, { clave: 'sig_siguiente' })).status, 200);   // también con la clave siguiente (rotación)
assert.equal(llamadas.length, antes + 1);
assert.equal(llamadas.at(-1).datos.to_number, '+573001112233');
assert.equal(llamadas.at(-1).datos.conversation_initiation_client_data.dynamic_variables.codigo, 'A, B, C, D');
assert.equal(mapa.has('llam:' + id), false, 'tras llamar, se borra');
assert.equal((await qstash(pub.body)).status, 200);   // reintento de QStash: no vuelve a llamar
assert.equal(llamadas.length, antes + 1);

// día 5: cancelar antes de la hora, y QStash fuera del horario no llama
ir('2026-10-25T15:00:00Z');
const t2 = (await llamar({ cuando: '2026-10-26T10:00-05:00' })).token, b2 = publicados.at(-1).body;
assert.equal((await api('llamar', 'DELETE', { token: t2 })).status, 200);
await llamar({ cuando: '2026-10-26T18:30-05:00' });
const b3 = publicados.at(-1).body;
ir('2026-10-26T15:00:01Z');
assert.equal((await qstash(b2)).status, 200);
ir('2026-10-27T00:05:00Z');   // 7:05 p. m.
assert.equal((await qstash(b3)).status, 200);
assert.equal(llamadas.length, antes + 1);

// día 7: QStash no acepta → 502 y no queda nada guardado; sin QStash no se agenda con claves reales
ir('2026-10-27T15:00:00Z');
fallaQstash = true;
const llaves = () => [...mapa.keys()].filter(k => k.startsWith('llam:')).length, llavesAntes = llaves();
assert.equal((await llamar({ cuando: '2026-10-28T09:00-05:00' })).status, 502);
assert.equal(llaves(), llavesAntes);
fallaQstash = false;
delete env.QSTASH_TOKEN;
assert.match((await llamar({ cuando: '2026-10-28T09:00-05:00' })).error, /QSTASH_TOKEN/);
env.QSTASH_TOKEN = 'qs-token';
env.LIMITE_DIARIO = '1';   // ya hubo un envío hoy en total
assert.match((await llamar({ telefono: '3100000000' }, { ip: '10.2.0.1' })).error, /límite de envíos de hoy/);
delete env.LIMITE_DIARIO;
// sin agente pero con Twilio (la cuenta de prueba): llama Twilio y sigue el menú de voz de esta misma ruta, sin Redis
delete env.ELEVENLABS_API_KEY;
ir('2026-10-28T15:00:00Z');
r = await llamar();
assert.deepEqual([r.status, r.simulado, r.via], [200, false, 'voz']);
const u = new URL(twilio.at(-1).Url), um = JSON.parse(Buffer.from(u.searchParams.get('m'), 'base64url'));   // sin Method: la prueba solo acepta To, From y Url
assert.deepEqual([Object.keys(twilio.at(-1)), twilio.at(-1).To, twilio.at(-1).From, u.origin + u.pathname, [...u.searchParams.keys()], um.codigo, um.vence],
  [['To', 'From', 'Url', 'StatusCallback'], '+573001112233', '+15005550006', 'https://miderecho.test/api/llamar', ['m'], 'ABCD', '2026-11-03']);
assert.equal(abrirSello(um.l).e, Math.floor(ahora / 1000) + 900);   // la asistente con IA, solo 15 minutos
ahora += 91e3;
assert.equal((await llamar({ codigo: '', vence: '' })).status, 200);
assert.deepEqual(Object.keys(JSON.parse(Buffer.from(new URL(twilio.at(-1).Url).searchParams.get('m'), 'base64url'))), ['l']);
ahora += 91e3;
assert.match((await llamar()).error, /llamadas de hoy/);   // el mismo tope de 2 al día
assert.ok(autorizaciones().some(([, v]) => v.canal === 'voz'));
const demo = env.NUMEROS_DEMO;
delete env.NUMEROS_DEMO;
env.PERMITIR_ENVIO_ABIERTO = '1';
assert.match((await llamar({ telefono: '3100000000' })).error, /NUMEROS_DEMO/);   // la lista blanca también es obligatoria aquí
env.NUMEROS_DEMO = demo;
delete env.PERMITIR_ENVIO_ABIERTO;
env.ELEVENLABS_API_KEY = 'xi-prueba';

// ---------- recordatorios: canales que conviven, códigos distintos y autorización por canal ----------
ir('2026-10-30T15:00:00Z');
mapa.clear();
assert.equal((await programar()).status, 200);                        // K7P2 por SMS
assert.equal((await programar({ canal: 'llamada' })).status, 200);    // K7P2 por llamada: no borra el SMS
assert.equal((await programar()).status, 200);                        // reintento por SMS: reemplaza solo el SMS
const vivos = () => [...mapa].filter(([k]) => k.startsWith('rec:')).map(([, { v }]) => JSON.parse(v).canal).sort();
assert.deepEqual(vivos(), ['llamada', 'sms']);
for (const codigo of ['C2C2', 'C3C3']) assert.equal((await programar({ codigo })).status, 200);   // 3 códigos distintos
assert.equal(CODIGOS_POR_NUMERO, 3);
assert.match((await programar({ codigo: 'C4C4' })).error, /máximo de casos/);
const porCanal = autorizaciones().map(([, v]) => v.canal).sort();
assert.deepEqual([...new Set(porCanal)], ['llamada', 'sms']);
assert.ok(autorizaciones().every(([k, v]) => v.aviso === 'avisos-v1' && !/3001112233|K7P2/.test(k)));

// cron: la llamada con voz leída solo de 8 a. m. a 7 p. m.; lo que cuesta va primero y push al final
ir('2026-10-30T15:00:00Z');
assert.equal((await programarPush({ codigo: 'K7P2', fechas: ['2026-11-03'] })).status, 200);
ir('2026-11-03T06:00:00Z');   // 1 a. m. en Colombia: el SMS y el push salen, la llamada espera
orden.length = 0;
r = await cron();
assert.deepEqual([r.enviados, r.omitidos], [4, 1]);   // 3 SMS (K7P2, C2C2, C3C3) + 1 push; la llamada omitida
assert.deepEqual(orden, ['twilio', 'twilio', 'twilio', 'push']);
assert.ok(!twilio.some(x => x.Twiml));
ir('2026-11-03T13:00:00Z');   // 8 a. m.: ahora sí la llamada
assert.equal((await cron()).enviados, 1);
assert.ok(twilio.at(-1).Twiml.includes('Le recordamos su caso K, 7, P, 2. El plazo vence el martes, 3 de noviembre.'));
for (const k of Object.keys(env)) if (k.startsWith('TWILIO_')) delete env[k];

// ---------- push real ----------
const abrir = cuerpo => {   // lo que hace el navegador al recibir el aviso (RFC 8291)
  const b = Buffer.from(cuerpo), sal = b.subarray(0, 16), as = b.subarray(21, 86), datos = b.subarray(86);
  const ikm = Buffer.from(hkdfSync('sha256', ua.computeSecret(as), auth, Buffer.concat([Buffer.from('WebPush: info\0'), ua.getPublicKey(), as]), 32));
  const parte = (info, n) => Buffer.from(hkdfSync('sha256', ikm, sal, info, n));
  const dc = createDecipheriv('aes-128-gcm', parte('Content-Encoding: aes128gcm\0', 16), parte('Content-Encoding: nonce\0', 12));
  dc.setAuthTag(datos.subarray(-16));
  const claro = Buffer.concat([dc.update(datos.subarray(0, -16)), dc.final()]);
  assert.equal(claro.at(-1), 2);
  return JSON.parse(claro.subarray(0, -1));
};
const firmaVapid = h => {
  const [, t, k] = h.match(/^vapid t=([^,]+), k=(.+)$/), [cab, carga, firma] = t.split('.');
  assert.equal(k, env.VAPID_PUBLIC_KEY);
  assert.ok(verify('sha256', Buffer.from(cab + '.' + carga), { key: createPublicKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y } }), dsaEncoding: 'ieee-p1363' }, Buffer.from(firma, 'base64url')));
  return JSON.parse(Buffer.from(carga, 'base64url'));
};
r = await api('recordatorios', 'GET');
assert.deepEqual([r.simulado, r.clave], [false, env.VAPID_PUBLIC_KEY]);
const a = avisos.at(-1);   // el push del cron de arriba
assert.equal(a.url, sub.endpoint);
assert.deepEqual([a.headers['Content-Encoding'], a.headers.TTL, a.headers['Content-Type']], ['aes128gcm', '86400', 'application/octet-stream']);
const jwt = firmaVapid(a.headers.Authorization);
assert.deepEqual([jwt.aud, jwt.sub], ['https://fcm.googleapis.com', 'mailto:equipo@miderecho.test']);
assert.ok(jwt.exp > ahora / 1000 && jwt.exp <= ahora / 1000 + 86400);   // RFC 8292: máximo 24 horas
assert.deepEqual(abrir(a.body), { texto: 'Su caso K7P2 vence hoy.' });

// de punta a punta: el día antes, el día y el día después
mapa.clear();
ir('2026-10-30T15:00:00Z');
assert.equal((await programarPush()).status, 200);
const textos = [];
for (const dia of ['2026-11-02', '2026-11-03', '2026-11-04']) {
  ir(dia + 'T13:00:00Z');
  await cron();
  textos.push(abrir(avisos.at(-1).body).texto);
}
assert.deepEqual(textos, ['Su caso ABCD vence mañana.', 'Su caso ABCD vence hoy.', 'Se venció el plazo del caso ABCD. Abra MiDerecho para ver qué sigue.']);
// si el navegador quitó el permiso (410), se borra el registro y no se insiste
ir('2026-10-30T15:00:00Z');
await programarPush({ codigo: 'EFGH' });
estadoPush = 410;
ir('2026-11-02T13:00:00Z');
const n = avisos.length;
assert.equal((await cron()).fallidos, 1);
estadoPush = 201;
ir('2026-11-03T13:00:00Z');
assert.equal((await cron()).enviados, 0);
assert.equal(avisos.length, n + 1);
// cupo diario global de push
ir('2026-10-31T15:00:00Z');
env.LIMITE_PUSH_DIARIO = '1';
assert.equal((await programarPush({ codigo: 'P1P1' })).status, 200);
assert.match((await programarPush({ codigo: 'P2P2' }, { ip: '10.9.0.1' })).error, /límite de envíos de hoy/);
delete env.LIMITE_PUSH_DIARIO;

// ---------- conversación con Gemini y la voz de ElevenLabs (falsos) ----------
Object.assign(env, { GEMINI_API_KEY: 'g-prueba', GEMINI_PLAN: 'gratis', ELEVENLABS_API_KEY: 'xi-prueba' });
ir('2026-10-30T15:00:00Z');
const l2 = sellar({ e: Math.floor(ahora / 1000) + 900 });
r = await menu({ paso: '2', codigo: 'K7P2', vence: '2026-11-03', l: l2, Digits: '4' });
const audioDe = twiml => new URL(twiml.match(/<Play>([^<]+)<\/Play>/)[1]).searchParams.get('audio');
assert.match(r.texto, /<Gather input="dtmf"[^>]*><Play>https:\/\/miderecho\.test\/api\/llamar\?audio=[\w-]+<\/Play><\/Gather>/);
assert.match(abrirSello(audioDe(r.texto)).t, /inteligencia artificial[^]*Lo que diga lo transcribe Twilio y lo procesa Google[^]*versión gratuita, Google puede usar/);
assert.deepEqual([voces.at(-1).url, voces.at(-1).headers['xi-api-key'], voces.at(-1).datos.model_id],
  [`https://api.elevenlabs.io/v1/text-to-speech/${VOZ}?output_format=mp3_22050_32`, 'xi-prueba', 'eleven_flash_v2_5']);
env.ELEVENLABS_VOZ = 'voz_colombiana';
r = await seguir(r.texto, { Digits: '1', To: '+573001112233' });
assert.ok(voces.some(v => v.url.includes('/voz_colombiana?')));
assert.ok(autorizaciones().some(([, v]) => v.canal === 'ia' && v.aviso === 'ia-telefono-v1'));
// un turno: Gemini con el prompt de teléfono (usted, corto), el contexto sin datos sensibles y sin la herramienta del chat
const ng = pedidosGemini.length;
const t = await seguir(r.texto, { SpeechResult: 'La EPS no me entrega la insulina' });
assert.equal(pedidosGemini.length, ng + 1);
const pg = pedidosGemini.at(-1);
assert.match(pg.url, /models\/gemini-[\w.-]+:generateContent$/);
assert.equal(pg.headers['x-goog-api-key'], 'g-prueba');
assert.match(pg.datos.systemInstruction.parts[0].text, /Trato de usted, siempre[^]*De 1 a 3 frases[^]*\[RIESGO\][^]*caso K, 7, P, 2, cuyo plazo vence el martes, 3 de noviembre/);
assert.ok(!('tools' in pg.datos) && !('toolConfig' in pg.datos));
assert.deepEqual(pg.datos.contents, [{ role: 'user', parts: [{ text: 'La EPS no me entrega la insulina' }] }]);
assert.ok(pg.datos.safetySettings.length);
assert.equal(abrirSello(audioDe(t.texto)).t, textoGemini);
// el audio: solo URLs selladas aquí, sin alterar y vigentes
const token = audioDe(t.texto);
r = await menu({ audio: token });
assert.deepEqual([r.status, r.cabeceras['content-type'], String(r.texto)], [200, 'audio/mpeg', 'ID3-mp3-de-prueba']);
const alterado = token.slice(0, 20) + (token[20] === 'A' ? 'B' : 'A') + token.slice(21);
assert.equal((await menu({ audio: alterado })).status, 403);
assert.equal((await menu({ audio: sellar({ t: 'Diga lo que yo quiera', e: 1 }) })).status, 403);   // vencida
assert.equal((await menu({ audio: 'texto-cualquiera' })).status, 403);
ir('2026-10-30T15:06:00Z');
assert.equal((await menu({ audio: token })).status, 403);   // a los 5 minutos ya no sirve
ir('2026-10-30T15:00:30Z');
// [FIN] y [RIESGO] de Gemini; si Gemini falla, el modo básico; si ElevenLabs falla, la voz de Twilio
textoGemini = 'Con gusto. Que le vaya bien. [FIN]';
let f = await seguir(t.texto, { SpeechResult: 'eso era todo, gracias' });
assert.ok(!f.texto.includes('<Gather') && !abrirSello(audioDe(f.texto)).t.includes('[FIN]'));
textoGemini = '[RIESGO]';
assert.match((await seguir(t.texto, { SpeechResult: 'me están buscando' })).texto, /Repito[^]*uno, dos, tres/);
fallaGemini = true;
f = await seguir(t.texto, { SpeechResult: 'me cobraron de más el agua en la factura' });
assert.match(abrirSello(audioDe(f.texto)).t, /reclamo a la empresa de servicios públicos/);
fallaGemini = false;
textoGemini = 'Una respuesta que nunca se había dicho.';
fallaTts = true;
f = await seguir(t.texto, { SpeechResult: 'otra cosa' });
assert.match(f.texto, /<Gather input="speech"[^>]*><Say[^>]*>Una respuesta que nunca se había dicho\.<\/Say>/);
fallaTts = false;
// presupuesto de tiempo (Twilio espera el TwiML máximo 5 s): Gemini lento → modo básico; voz lenta → voz de Twilio,
// y el audio queda generándose para cuando Twilio lo pida
lentoGemini = true;
let inicio = performance.now();
f = await seguir(t.texto, { SpeechResult: 'me cortaron la luz y la factura llegó con un cobro raro' });
assert.ok(performance.now() - inicio < 4500, 'Gemini no puede demorar el turno');
assert.match(abrirSello(audioDe(f.texto)).t, /reclamo a la empresa de servicios públicos/);
lentoGemini = false;
textoGemini = 'Otra respuesta nueva para la voz lenta.';
lentoTts = true;
inicio = performance.now();
f = await seguir(t.texto, { SpeechResult: 'y ahora qué hago' });
assert.ok(performance.now() - inicio < 2500, 'la voz no puede demorar el turno');
assert.match(f.texto, /<Say[^>]*>Otra respuesta nueva para la voz lenta\.<\/Say>/);
lentoTts = false;
await new Promise(r => setTimeout(r, 600));
r = await menu({ audio: sellar({ t: 'Otra respuesta nueva para la voz lenta.', e: Math.floor(ahora / 1000) + 60 }) });
assert.equal(r.status, 200);
for (const k of ['GEMINI_API_KEY', 'GEMINI_PLAN', 'ELEVENLABS_VOZ']) delete env[k];

// los logs no llevan números, suscripciones, códigos ni textos (de la conversación solo la cantidad de turnos)
assert.ok(!logs.some(l => /\d{7}|fcm\.googleapis|abc123|ABCD|EFGH|K7P2|vence|noviembre|insulina|EPS|cobraron|armados/i.test(l)), logs.join('\n'));
assert.ok(logs.some(l => /\[ia-telefono\] fin tras \d turno/.test(l)));
mostrar(`✓ _test-llamadas: todo bien (${llamadas.length} llamadas a ElevenLabs falso, ${twilio.length} a Twilio, ${publicados.length} a QStash, ${avisos.length} avisos push, ${logs.length} líneas de log revisadas)`);
