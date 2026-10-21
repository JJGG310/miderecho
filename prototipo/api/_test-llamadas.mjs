// Pruebas de la llamada del agente de voz (api/llamar.js) y de los recordatorios por llamada y push, sin cuentas reales:
//   node prototipo/api/_test-llamadas.mjs
// Parte 1, modo simulado. Parte 2, con un fetch falso que imita a ElevenLabs, QStash, Upstash, Twilio y un servicio de push.
// Reloj fijo. El guion bajo evita que Vercel publique este archivo.
import assert from 'node:assert/strict';
import { createECDH, createHash, createHmac, createDecipheriv, createPublicKey, generateKeyPairSync, hkdfSync, randomBytes, verify } from 'node:crypto';

for (const k of Object.keys(process.env))
  if (/^(TWILIO_|KV_|UPSTASH_|NUMEROS_DEMO|CLAVE_CIFRADO|LIMITE_|PERMITIR_ENVIO_ABIERTO|ELEVENLABS_|QSTASH_|VAPID_)/.test(k)) delete process.env[k];
process.env.CRON_SECRET = 'secreto-de-prueba';
const env = process.env, mostrar = console.log, logs = [];
console.log = console.error = (...a) => logs.push(a.join(' '));
let ahora;
Date.now = () => ahora;
const ir = iso => { ahora = Date.parse(iso); };
ir('2026-10-21T15:00:00Z');   // 10 a. m. en Colombia

const { cifrarPush, memoria, textoLlamada, POR_NUMERO_DIA, CODIGOS_POR_NUMERO } = await import('./_comun.js');
const { textoPush } = await import('./cron-recordatorios.js');

async function api(ruta, method, body, { ip = '10.0.0.1', headers = {} } = {}) {
  const { default: h } = await import(`./${ruta}.js`), r = {};
  await h({ method, body, headers: { 'x-real-ip': ip, host: 'miderecho.test', 'content-type': 'application/json', ...headers } },
    { status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; } });
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
assert.equal((await api('llamar', 'GET')).status, 405);
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

// ---------- parte 2: ElevenLabs, QStash, Upstash, Twilio y servicio de push falsos ----------
let mapa = new Map(), redis = memoria(mapa), fallaEleven = false, fallaQstash = false, estadoPush = 201;
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
await llamar({ codigo: '', vence: '' });
assert.deepEqual(llamadas.at(-1).datos.conversation_initiation_client_data.dynamic_variables, { codigo: 'ninguno', vence: 'ninguna' });
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
// sin clave de ElevenLabs no hay llamada real ni respaldo por Twilio
delete env.ELEVENLABS_API_KEY;
ir('2026-10-28T15:00:00Z');
assert.deepEqual([(r = await llamar()).status, r.simulado], [200, true]);
assert.equal(twilio.length, 0);
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

// los logs no llevan números, suscripciones, códigos ni textos
assert.ok(!logs.some(l => /\d{7}|fcm\.googleapis|abc123|ABCD|EFGH|K7P2|vence|noviembre/i.test(l)), logs.join('\n'));
mostrar(`✓ _test-llamadas: todo bien (${llamadas.length} llamadas a ElevenLabs falso, ${twilio.length} a Twilio, ${publicados.length} a QStash, ${avisos.length} avisos push, ${logs.length} líneas de log revisadas)`);
