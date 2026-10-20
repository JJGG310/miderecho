// Pruebas de las funciones de /api sin cuentas reales: node prototipo/api/test-api.mjs
// Parte 1, modo simulado (sin Twilio ni Redis). Parte 2, con un fetch falso que imita a Twilio y a Upstash.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Vercel publica cada archivo de api/ como función: allá este responde 404 y no corre las pruebas.
export default function handler(req, res) { res.status(404).end(); }

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  for (const k of Object.keys(process.env)) if (/^(TWILIO_|KV_|UPSTASH_|NUMEROS_DEMO|CLAVE_CIFRADO|LIMITE_DIARIO|DOMINIOS_PDF)/.test(k)) delete process.env[k];
  process.env.CRON_SECRET = 'secreto-de-prueba';
  const env = process.env, mostrar = console.log, logs = [];
  console.log = console.error = (...a) => logs.push(a.join(' '));

  const { gsm, twiml, cifrar, descifrar, hoyColombia, recordatorios, POR_IP_HORA, POR_NUMERO_DIA } = await import('./_comun.js');
  async function api(ruta, method, body, { ip = '10.0.0.1', query = {}, headers = {} } = {}) {
    const { default: h } = await import(`./${ruta}.js`), r = {};
    await h({ method, body, query, headers: { 'x-real-ip': ip, host: 'miderecho.test', ...headers } },
      { status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; } });
    return r;
  }
  const sms = (telefono, ip, texto = 'Peticion ABCD vence el 1-dic.') => api('sms', 'POST', { telefono, texto }, { ip });
  const cron = () => api('cron-recordatorios', 'GET', null, { headers: { authorization: 'Bearer secreto-de-prueba' } });
  const dia = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

  // ---------- parte 1: modo simulado ----------
  let r = await sms('300 111 2233');
  assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
  assert.equal((await api('whatsapp', 'POST', { telefono: '+57 300 111 2233', texto: 'Su documento está listo.' })).simulado, true);
  assert.equal((await api('llamada', 'POST', { telefono: '573001112233', mensaje: 'Su petición vence mañana.' })).simulado, true);
  assert.equal((await api('sms', 'GET')).status, 405);

  // número inválido
  for (const tel of ['12345', '+1 415 555 0100', '601 234 5678', '+57 300 111 223', '', null])
    assert.equal((await sms(tel, '10.0.0.2')).status, 400, `debió rechazar ${tel}`);

  // texto largo o vacío; SMS sin tildes
  assert.equal((await sms('3001112233', '10.0.0.3', 'x'.repeat(161))).status, 400);
  assert.equal((await sms('3001112233', '10.0.0.3', '  ')).status, 400);
  assert.equal((await api('whatsapp', 'POST', { telefono: '3001112233', texto: 'x'.repeat(1001) })).status, 400);
  assert.equal((await api('llamada', 'POST', { telefono: '3001112233', mensaje: 'x'.repeat(401) })).status, 400);
  assert.equal(gsm('Petición: mañana ¿qué? 👍'), 'Peticion: manana ¿que? ');

  // lista blanca
  env.NUMEROS_DEMO = '3001112233, +57 310 000 0000';
  assert.equal((await sms('3209998877', '10.0.0.4')).status, 403);
  assert.equal((await sms('+573100000000', '10.0.0.4')).status, 200);
  delete env.NUMEROS_DEMO;

  // límite por IP y por número
  for (let i = 0; i < POR_IP_HORA; i++) assert.equal((await sms(`31500000${String(i).padStart(2, '0')}`, '10.0.0.5')).status, 200);
  assert.equal((await sms('3159999999', '10.0.0.5')).status, 429);
  for (let i = 0; i < POR_NUMERO_DIA; i++) assert.equal((await sms('3207777777', `10.1.0.${i}`)).status, 200);
  assert.equal((await sms('3207777777', '10.2.0.1')).status, 429);

  // PDF solo del mismo sitio
  const wa = pdfUrl => api('whatsapp', 'POST', { telefono: '3001112233', texto: 'Su documento', pdfUrl }, { ip: '10.0.0.6' });
  assert.equal((await wa('https://otro.com/x.pdf')).status, 400);
  assert.equal((await wa('http://miderecho.test/x.pdf')).status, 400);
  assert.equal((await wa('https://miderecho.test/doc/ABCD.pdf')).status, 200);

  // recordatorios
  const rec = { codigo: 'K7P2', telefono: '3125550000', canal: 'sms', fechas: [hoyColombia(), dia(10)], mensaje: 'Petición K7P2 vence el 30-oct.' };
  const programar = (cambios, ip = '10.0.0.7') => api('recordatorios', 'POST', { ...rec, ...cambios }, { ip });
  assert.equal((await programar({ fechas: [dia(-2)] })).status, 400);
  assert.equal((await programar({ fechas: [`${new Date().getFullYear() + 1}-02-30`] })).status, 400);
  assert.equal((await programar({ canal: 'paloma' })).status, 400);
  assert.equal((await programar({ codigo: 'a b' })).status, 400);
  assert.deepEqual([(r = await programar({})).status, r.simulado], [200, true]);
  const [[, guardado]] = await recordatorios.todos();
  assert.ok(!JSON.stringify(guardado).includes('3125550000'), 'el teléfono debe quedar cifrado');
  assert.equal(JSON.parse(descifrar(guardado.c)).mensaje, 'Peticion K7P2 vence el 30-oct.');
  assert.equal((await programar({ telefono: '3125550001' })).status, 409);
  assert.equal((await api('cron-recordatorios', 'GET')).status, 401);
  assert.deepEqual([(r = await cron()).enviados, r.borrados], [1, 0]);   // hoy se envía; queda la fecha futura
  assert.deepEqual([(r = await cron()).enviados, r.borrados], [0, 0]);
  assert.equal((await api('recordatorios', 'DELETE', null, { query: { codigo: 'K7P2' } })).ok, true);
  await programar({ codigo: 'Z9Z9', fechas: [hoyColombia()] });
  assert.deepEqual([(r = await cron()).enviados, r.borrados], [1, 1]);   // el último se envía y se borra
  assert.equal((await recordatorios.todos()).length, 0);

  // cifrado y TwiML
  assert.equal(descifrar(cifrar('+573001112233')), '+573001112233');
  assert.ok(twiml('A & B <x>').includes('A &#38; B &#60;x&#62;'));

  // tope diario total
  env.LIMITE_DIARIO = '5';
  assert.equal((await sms('3001112233', '10.9.9.9')).status, 429);
  delete env.LIMITE_DIARIO;

  // con claves de Twilio pero sin Redis ni NUMEROS_DEMO no se envía nada real
  Object.assign(env, { TWILIO_ACCOUNT_SID: 'ACprueba', TWILIO_AUTH_TOKEN: 'token', TWILIO_FROM: '+15005550006', TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886' });
  assert.equal((await sms('3001112233', '10.0.0.8')).status, 503);

  // ---------- parte 2: Twilio y Upstash falsos ----------
  const kv = new Map(), salidas = [];
  globalThis.fetch = async (url, { body, headers }) => {
    if (url.startsWith('https://api.twilio.com/')) {
      const datos = Object.fromEntries(body);
      salidas.push({ url, auth: headers.Authorization, datos });
      return datos.To.endsWith('3009999999')
        ? new Response(JSON.stringify({ code: 21608, message: `The number ${datos.To} is unverified` }), { status: 400 })
        : new Response('{"sid":"SM1"}', { status: 201 });
    }
    assert.equal(url, 'https://kv.test/pipeline');
    return new Response(JSON.stringify(JSON.parse(body).map(([cmd, k, ...a]) => {
      const h = kv.get(k) ?? (cmd.startsWith('H') ? new Map() : 0);
      if (cmd === 'INCR') kv.set(k, h + 1);
      if (cmd === 'HSET') kv.set(k, h.set(a[0], a[1]));
      if (cmd === 'HDEL') h.delete(a[0]);
      const res = { INCR: h + 1, HGET: h.get?.(a[0]) ?? null, HGETALL: [...(h.entries?.() ?? [])].flat() };
      return { result: cmd in res ? res[cmd] : 1 };
    })));
  };
  Object.assign(env, { KV_REST_API_URL: 'https://kv.test', KV_REST_API_TOKEN: 'kv' });
  assert.equal((await sms('3001112233', '10.3.0.1')).status, 500, 'con Redis, sin CLAVE_CIFRADO no debe operar');
  env.CLAVE_CIFRADO = randomBytes(32).toString('base64');

  r = await sms('3001112233', '10.3.0.1', 'Petición lista');
  assert.deepEqual([r.ok, r.simulado], [true, false]);
  assert.match(salidas.at(-1).url, /Accounts\/ACprueba\/Messages\.json$/);
  assert.equal(salidas.at(-1).auth, 'Basic ' + Buffer.from('ACprueba:token').toString('base64'));
  assert.deepEqual(salidas.at(-1).datos, { To: '+573001112233', From: '+15005550006', Body: 'Peticion lista' });

  await api('whatsapp', 'POST', { telefono: '3001112233', texto: 'Su documento', pdfUrl: 'https://miderecho.test/a.pdf' }, { ip: '10.3.0.1' });
  assert.deepEqual(salidas.at(-1).datos, { To: 'whatsapp:+573001112233', From: 'whatsapp:+14155238886', Body: 'Su documento', MediaUrl: 'https://miderecho.test/a.pdf' });

  await api('llamada', 'POST', { telefono: '3001112233', mensaje: 'Su petición vence el lunes.' }, { ip: '10.3.0.1' });
  assert.match(salidas.at(-1).url, /Calls\.json$/);
  assert.ok(salidas.at(-1).datos.Twiml.includes('<Say language="es-MX" voice="Polly.Mia-Neural">Su petición vence el lunes.</Say>'));

  r = await sms('3009999999', '10.3.0.1');
  assert.deepEqual([r.status, r.error], [502, 'Twilio no aceptó el envío (código 21608)']);

  // recordatorio por WhatsApp con plantilla aprobada, guardado en Redis y cifrado
  env.TWILIO_WHATSAPP_PLANTILLA = 'HXprueba';
  assert.deepEqual([(r = await programar({ codigo: 'W1W1', canal: 'whatsapp', fechas: [hoyColombia()] }, '10.3.0.2')).ok, r.simulado], [true, false]);
  assert.ok(!JSON.stringify([...kv.get('recordatorios')]).includes('3125550000'));
  assert.deepEqual([(r = await cron()).enviados, r.borrados], [1, 1]);
  assert.deepEqual(salidas.at(-1).datos, { To: 'whatsapp:+573125550000', From: 'whatsapp:+14155238886', ContentSid: 'HXprueba', ContentVariables: '{"1":"W1W1"}' });
  assert.equal(kv.get('recordatorios').size, 0);
  assert.ok(![...kv.keys()].some(k => k.includes('3001112233')), 'los contadores usan HMAC, no el número');

  // los logs no llevan números completos ni el contenido de los mensajes
  assert.ok(!logs.some(l => /\d{7}/.test(l) || /petici|documento|vence|lista/i.test(l)), logs.join('\n'));
  mostrar(`✓ test-api: todo bien (${salidas.length} envíos a Twilio falso, ${logs.length} líneas de log revisadas)`);
}
