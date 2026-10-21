// Pruebas de las funciones de /api sin cuentas reales: node prototipo/api/_test-api.mjs
// Parte 1, modo simulado (sin Twilio ni Redis). Parte 2, con un fetch falso que imita a Twilio y a Upstash.
// Reloj fijo para no depender de la hora. El guion bajo evita que Vercel publique este archivo.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

for (const k of Object.keys(process.env))
  if (/^(TWILIO_|KV_|UPSTASH_|NUMEROS_DEMO|CLAVE_CIFRADO|LIMITE_DIARIO|DOMINIOS_PDF|PERMITIR_ENVIO_ABIERTO)/.test(k)) delete process.env[k];
process.env.CRON_SECRET = 'secreto-de-prueba';
const env = process.env, mostrar = console.log, logs = [];
console.log = console.error = (...a) => logs.push(a.join(' '));
let ahora;
Date.now = () => ahora;
const ir = iso => { ahora = Date.parse(iso); };
ir('2026-10-20T12:00:00Z');   // 7 a. m. en Colombia

const { gsm, septetos, twiml, descifrar, kv, memoria, POR_IP_HORA, POR_NUMERO_DIA } = await import('./_comun.js');
const { textoRecordatorio } = await import('./cron-recordatorios.js');

async function api(ruta, method, body, { ip = '10.0.0.1', headers = {} } = {}) {
  const { default: h } = await import(`./${ruta}.js`), r = {};
  await h({ method, body, headers: { 'x-real-ip': ip, host: 'miderecho.test', 'content-type': 'application/json', ...headers } },
    { status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; } });
  return r;
}
// sms.js y whatsapp.js solo aceptan plantillas cerradas (_avisos.js; sus pruebas están en _test-agente-avisos.mjs).
const listo = telefono => ({ plantilla: 'documento_listo', telefono, datos: { codigo: 'ABCD' } });
const sms = (telefono, ip) => api('sms', 'POST', listo(telefono), { ip });
const cron = () => api('cron-recordatorios', 'GET', null, { headers: { authorization: 'Bearer secreto-de-prueba' } });
const rec = { codigo: 'K7P2', telefono: '3125550000', canal: 'sms', fechas: ['2026-10-20', '2026-10-30'] };
const programar = (cambios, ip) => api('recordatorios', 'POST', { ...rec, ...cambios }, { ip });
const cancelar = (codigo, token) => api('recordatorios', 'DELETE', { codigo, token });
const idsDel = async f => (await kv(['SMEMBERS', 'dia:' + f]))[0];
const vivos = async f => (await kv(...(await idsDel(f)).map(id => ['GET', 'rec:' + id]))).filter(Boolean);
let r;

// ---------- parte 1: modo simulado ----------
r = await sms('300 111 2233');
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
assert.equal((await api('whatsapp', 'POST', listo('+57 300 111 2233'))).simulado, true);
assert.equal((await api('llamada', 'POST', { telefono: '573001112233', mensaje: 'Su petición vence mañana.' })).simulado, true);
assert.equal((await api('sms', 'GET')).status, 405);

// (3) solo JSON y solo desde la propia app
const conCabeceras = headers => api('sms', 'POST', listo('3001112233'), { headers });
assert.equal((await conCabeceras({ 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
assert.equal((await conCabeceras({ 'content-type': 'text/plain' })).status, 415);
assert.equal((await conCabeceras({ 'sec-fetch-site': 'cross-site' })).status, 403);
assert.equal((await conCabeceras({ origin: 'https://malo.example' })).status, 403);
assert.equal((await conCabeceras({ origin: 'https://miderecho.test', 'sec-fetch-site': 'same-origin' })).status, 200);
assert.equal((await conCabeceras({ origin: 'http://localhost:3000' })).status, 200);

// número inválido
for (const tel of ['12345', '+1 415 555 0100', '601 234 5678', '+57 300 111 223', '', null])
  assert.equal((await sms(tel)).status, 400, `debió rechazar ${tel}`);

// topes de texto, (11) GSM-7 y (12) TwiML de 4000
assert.equal((await api('llamada', 'POST', { telefono: '3001112233', mensaje: 'x'.repeat(401) })).status, 400);
assert.equal((await api('llamada', 'POST', { telefono: '3001112233', mensaje: '&'.repeat(400) })).status, 400);
assert.equal(gsm('Petición está: mañana ¿qué? ¡Ü! `x` 👍 Ça ça'), 'Peticion esta: mañana ¿qué? ¡Ü! x  Ça ca');
assert.equal(septetos('a{b'), 4);
assert.ok(twiml('A & B <x>').includes('A &#38; B &#60;x&#62;'));

// (4) en modo simulado no hay límites: más de POR_IP_HORA desde la misma IP al mismo número
for (let i = 0; i <= POR_IP_HORA; i++) assert.equal((await sms('3001112233', '10.0.0.5')).status, 200);

// recordatorios: validación
assert.equal((await programar({ fechas: ['2026-10-18'] })).status, 400);   // pasada
assert.equal((await programar({ fechas: ['2027-02-30'] })).status, 400);   // no existe
assert.equal((await programar({ fechas: ['2028-01-01'] })).status, 400);   // a más de un año
assert.equal((await programar({ fechas: [1, 2, 3, 4, 5, 6, 7].map(d => `2026-11-0${d}`) })).status, 400);
assert.equal((await programar({ canal: 'paloma' })).status, 400);
assert.equal((await programar({ codigo: 'a b' })).status, 400);

// (1, 5) token secreto, sin texto libre, teléfono cifrado
r = await programar({ mensaje: 'texto libre que se ignora' });
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
assert.match(r.token, /^[\w-]{22}$/);
const tokenK = r.token, [guardado] = await vivos('2026-10-30');
assert.ok(!guardado.includes('3125550000') && !guardado.includes('texto libre'));
assert.equal(descifrar(JSON.parse(guardado).c), '+573125550000');
assert.equal(textoRecordatorio('K7P2', '2026-11-30'), 'Caso K7P2: recordatorio del 30-nov. Si la entidad no le ha respondido, avise a su lider.');
assert.equal(gsm(textoRecordatorio('K7P2', '2026-11-30')), textoRecordatorio('K7P2', '2026-11-30'));
// el mismo código en otro caso no choca; cancelar sin el token correcto no borra ni revela nada
assert.equal((await programar({ telefono: '3125550001' })).status, 200);
assert.deepEqual(await cancelar('K7P2', 'x'.repeat(22)), { status: 200, ok: true, simulado: true });
assert.equal((await cancelar('K7P2')).status, 400);
assert.equal((await vivos('2026-10-30')).length, 2);

// cron: secreto, envío del día, sin repetir
assert.equal((await api('cron-recordatorios', 'GET')).status, 401);
ir('2026-10-20T13:10:00Z');
assert.equal((await cron()).enviados, 2);
assert.equal((await cron()).enviados, 0);
// (13) hoy, después del envío de las 8 a. m., ya no se acepta
assert.equal((await programar({ codigo: 'H0Y1', fechas: ['2026-10-20'] })).status, 400);
// (6) uno cancelado no revive: el 30 solo sale el otro, y como era su última fecha se borra
assert.equal((await cancelar('K7P2', tokenK)).ok, true);
ir('2026-10-30T13:00:00Z');
assert.equal((await cron()).enviados, 1);
assert.equal((await vivos('2026-10-30')).length, 0);
// si el cron no corre un día, lo de ayer sale al siguiente
ir('2026-10-31T12:00:00Z');
await programar({ codigo: 'AY3R', fechas: ['2026-11-03'] });
ir('2026-11-04T13:00:00Z');
assert.equal((await cron()).enviados, 1);
// (7) cada registro vence solo 3 días después de su última fecha
await programar({ codigo: 'TTL1', fechas: ['2026-11-10'] });
const [idTtl] = await idsDel('2026-11-10');
ir('2026-11-12T23:59:00Z');
assert.notEqual((await kv(['GET', 'rec:' + idTtl]))[0], null);
ir('2026-11-13T00:00:01Z');
assert.equal((await kv(['GET', 'rec:' + idTtl]))[0], null);
// (7) sin CRON_SECRET, el cron no corre y lo dice en los logs
delete env.CRON_SECRET;
assert.equal((await cron()).status, 401);
assert.ok(logs.some(l => l.includes('falta CRON_SECRET')));
env.CRON_SECRET = 'secreto-de-prueba';

// ---------- parte 2: Twilio y Upstash falsos ----------
let mapa = new Map(), redis = memoria(mapa);
const reiniciar = () => { mapa = new Map(); redis = memoria(mapa); };
const salidas = [];
globalThis.fetch = async (url, { body, headers }) => {
  if (url.startsWith('https://api.twilio.com/')) {
    const datos = Object.fromEntries(body);
    salidas.push({ url, auth: headers.Authorization, datos });
    return datos.To.endsWith('3009999999')
      ? new Response(JSON.stringify({ code: 21608, message: `The number ${datos.To} is unverified` }), { status: 400 })
      : new Response('{"sid":"SM1"}', { status: 201 });
  }
  assert.deepEqual([url, headers.Authorization], ['https://kv.test/pipeline', 'Bearer kv']);
  return new Response(JSON.stringify(JSON.parse(body).map(c => ({ result: redis(c) }))));
};
ir('2026-10-21T12:00:00Z');
Object.assign(env, { TWILIO_ACCOUNT_SID: 'ACprueba', TWILIO_AUTH_TOKEN: 'token', TWILIO_FROM: '+15005550006', TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886' });

// (5) cerrado por defecto: hace falta NUMEROS_DEMO, o PERMITIR_ENVIO_ABIERTO=1 con Redis
assert.equal((await sms('3001112233')).status, 503);
env.PERMITIR_ENVIO_ABIERTO = '1';
assert.equal((await sms('3001112233')).status, 503);
Object.assign(env, { KV_REST_API_URL: 'https://kv.test', KV_REST_API_TOKEN: 'kv' });
assert.equal((await sms('3001112233')).status, 500, 'con Redis, sin CLAVE_CIFRADO no debe operar');
env.CLAVE_CIFRADO = randomBytes(32).toString('base64');
delete env.PERMITIR_ENVIO_ABIERTO;
assert.equal((await sms('3001112233')).status, 503);   // con Redis y clave, pero sin abrirlo a propósito
env.PERMITIR_ENVIO_ABIERTO = '1';

// formato real de cada envío
r = await sms('3001112233');
assert.deepEqual([r.ok, r.simulado], [true, false]);
assert.match(salidas.at(-1).url, /Accounts\/ACprueba\/Messages\.json$/);
assert.equal(salidas.at(-1).auth, 'Basic ' + Buffer.from('ACprueba:token').toString('base64'));
const textoListo = 'Su documento ABCD quedo listo. Si necesita ayuda, vaya con su lider o a la Personeria.';
assert.deepEqual(salidas.at(-1).datos, { To: '+573001112233', From: '+15005550006', Body: textoListo });
await api('whatsapp', 'POST', listo('3001112233'));
assert.deepEqual(salidas.at(-1).datos, { To: 'whatsapp:+573001112233', From: 'whatsapp:+14155238886', Body: textoListo });
await api('llamada', 'POST', { telefono: '3001112233', mensaje: 'Su petición vence el lunes.' });
assert.match(salidas.at(-1).url, /Calls\.json$/);
assert.ok(salidas.at(-1).datos.Twiml.includes('<Say language="es-MX" voice="Polly.Mia-Neural">Su petición vence el lunes.</Say>'));
assert.deepEqual([(r = await sms('3009999999')).status, r.error], [502, 'Twilio no aceptó el envío (código 21608)']);

// lista blanca
env.NUMEROS_DEMO = '3001112233, +57 310 000 0000';
assert.equal((await sms('3209998877', '10.3.0.2')).status, 403);
assert.equal((await sms('+573100000000', '10.3.0.2')).status, 200);
delete env.NUMEROS_DEMO;

// (4) límites con envío real: por red (IPv6 agrupada), por número y diario
reiniciar();
for (let i = 0; i < POR_IP_HORA; i++) assert.equal((await sms(`31500000${String(i).padStart(2, '0')}`, `2800:e2:1a80:d00::${i}`)).status, 200);
assert.equal((await sms('3159999999', '2800:e2:1a80:d00::ffff')).status, 429);
assert.equal((await sms('3159999999', '2800:e2:1a80:d01::1')).status, 200);   // otra red
for (let i = 0; i < POR_NUMERO_DIA; i++) assert.equal((await sms('3207777777', `10.1.0.${i}`)).status, 200);
assert.equal((await sms('3207777777', '10.2.0.1')).status, 429);
env.LIMITE_DIARIO = '5';
assert.equal((await sms('3001112233', '10.9.9.9')).status, 429);
delete env.LIMITE_DIARIO;

// (8) WhatsApp sin plantilla no se programa; (2) máximo de casos activos por número
reiniciar();
const wa1 = { codigo: 'W1W1', canal: 'whatsapp', fechas: ['2026-10-21'] };
assert.equal((await programar(wa1)).status, 400);
env.TWILIO_WHATSAPP_PLANTILLA = 'HXprueba';
assert.deepEqual([(r = await programar(wa1)).ok, r.simulado], [true, false]);
for (const codigo of ['A1A1', 'B2B2']) assert.equal((await programar({ codigo, fechas: ['2026-10-28'] })).status, 200);
assert.equal((await programar({ codigo: 'C3C3', fechas: ['2026-10-28'] })).status, 429);
assert.equal((await programar({ codigo: 'A1A1', fechas: ['2026-10-28'] })).status, 200);   // reintento: reemplaza, no suma
assert.equal((await vivos('2026-10-28')).length, 2);
assert.ok(![...mapa.keys()].some(k => /3125550000|3001112233/.test(k)), 'claves con HMAC, no con el número');
assert.ok(!JSON.stringify((await vivos('2026-10-28'))).includes('3125550000'));
// el cron usa la plantilla aprobada con código y fecha, y borra el que terminó
ir('2026-10-21T13:05:00Z');
assert.equal((await cron()).enviados, 1);
assert.deepEqual(salidas.at(-1).datos, { To: 'whatsapp:+573125550000', From: 'whatsapp:+14155238886', ContentSid: 'HXprueba', ContentVariables: '{"1":"W1W1","2":"21-oct"}' });

// (2) cada fecha gasta del cupo de ese día, en total y por número
reiniciar();
env.LIMITE_DIARIO = '2';
ir('2026-10-22T12:00:00Z');
for (const [i, codigo] of ['D1D1', 'D2D2'].entries()) assert.equal((await programar({ codigo, telefono: `318000000${i}`, fechas: ['2026-11-05'] })).status, 200);
ir('2026-10-23T12:00:00Z');   // otro día: el tope diario de envíos ya no frena, el cupo del 5 de noviembre sí
assert.match((await programar({ codigo: 'D3D3', telefono: '3180000002', fechas: ['2026-11-05'] })).error, /cupos/);
delete env.LIMITE_DIARIO;
reiniciar();
for (let i = 0; i < POR_NUMERO_DIA; i++) {
  if (i === 5) ir('2026-10-24T12:00:00Z');   // reparte los intentos en dos días para no tocar el tope diario por número
  assert.equal((await programar({ codigo: 'R1R1', fechas: ['2026-11-06'] })).status, 200);
}
assert.match((await programar({ codigo: 'R1R1', fechas: ['2026-11-06'] })).error, /cupos/);

// (2) el cron respeta LIMITE_DIARIO
reiniciar();
ir('2026-11-10T12:00:00Z');
for (const [i, codigo] of ['E1E1', 'E2E2', 'E3E3'].entries()) await programar({ codigo, telefono: `316000000${i}`, fechas: ['2026-11-10'] });
env.LIMITE_DIARIO = '5';   // ya van 3 en el día: caben 2 envíos más
ir('2026-11-10T13:00:00Z');
assert.deepEqual([(r = await cron()).enviados, r.omitidos], [2, 1]);
delete env.LIMITE_DIARIO;

// los logs no llevan números completos ni el contenido de los mensajes
assert.ok(!logs.some(l => /\d{7}/.test(l) || /petici|documento|vence|lista|señor|recordatorio del/i.test(l)), logs.join('\n'));
mostrar(`✓ _test-api: todo bien (${salidas.length} envíos a Twilio falso, ${logs.length} líneas de log revisadas)`);
