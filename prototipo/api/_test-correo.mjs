// Pruebas de /api/correo sin cuentas reales: node prototipo/api/_test-correo.mjs (también corre con npm test).
// Parte 1, modo simulado (sin RESEND_API_KEY). Parte 2, con un fetch falso que imita a Resend. Parte 3, envío abierto con
// Redis y Twilio falsos: celular verificado por código. Reloj fijo para no depender de la hora. El guion bajo evita que Vercel publique este archivo.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

for (const k of Object.keys(process.env))
  if (/^(RESEND_|CORREO_REMITENTE|CORREOS_DEMO|PERMITIR_CORREO_ABIERTO|DOMINIOS_CORREO|KV_|UPSTASH_|CLAVE_CIFRADO|LIMITE_DIARIO|TWILIO_|NUMEROS_DEMO|PERMITIR_ENVIO_ABIERTO)/.test(k)) delete process.env[k];
const env = process.env, logs = [];
console.log = console.error = (...a) => logs.push(a.join(' '));
let ahora = Date.parse('2026-10-21T15:00:00Z');   // 10 a. m. en Colombia
Date.now = () => ahora;

const { default: handler, POR_RED_HORA, POR_DESTINO_DIA, aTexto } = await import('./correo.js');
const { memoria } = await import('./_comun.js');
async function llamar(method, body, { ip = '10.0.0.1', headers = {} } = {}) {
  const r = {};
  await handler({ method, body, headers: { 'x-real-ip': ip, host: 'miderecho.test', 'content-type': 'application/json', ...headers } },
    { status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; } });
  return r;
}
const correo = (body, op) => llamar('POST', body, op);
const modo = () => llamar('GET');
const persona = { nombre: 'Ana Rosa Pérez', cedula: '1.234.567' };
const peticion = { codigo: 'K7P2', temaId: 'vias', municipio: 'Ovejas', vereda: 'La Peña', desde: 'hace un mes',
  palabras: 'Se cayó el puente <script>alert(1)</script>', peticiones: [{ texto: 'Reparar la vía o el camino de la vereda.', tipo: 'general' }],
  plazo: 15, entidad: 'Alcaldía de Ovejas', correo: 'contactenos@ovejas-sucre.gov.co', ...persona };
const tutela = { codigo: 'T3ST', derecho: 'salud', afectado: 'propio', que: 'medicamento', detalle: 'insulina', pidio: 'negada', desde: 'hace un mes',
  urgente: 'si', pruebas: ['Orden o fórmula médica'], entidad: 'Nueva EPS', municipio: 'Ovejas', vereda: 'La Peña', telefono: '3001234567', ...persona };
const alAlcaldia = (cambios = {}, op) => correo({ tipo: 'peticion', destino: 'alcaldia:Ovejas', datos: peticion, ...cambios }, op);
const alJuzgado = (cambios = {}, op) => correo({ tipo: 'tutela_salud', destino: 'juzgado:Ovejas', datos: tutela, ...cambios }, op);
let r;

// ---------- directorio (packages/nucleo/src/directorio.js) ----------
const { DIRECTORIO, MUNICIPIOS, juzgadosDe } = await import('@miderecho/nucleo');
for (const m of MUNICIPIOS) {
  assert.ok(DIRECTORIO[`alcaldia:${m.nombre}`]?.correo === m.correo, `falta la alcaldía de ${m.nombre}`);
  assert.match(DIRECTORIO[`juzgado:${m.nombre}`]?.correo || '', /@cendoj\.ramajudicial\.gov\.co$/, `falta el juzgado de ${m.nombre}`);
  assert.ok(juzgadosDe(m.nombre).length >= 1);
}
assert.deepEqual(juzgadosDe('El Carmen de Bolívar').map(([, j]) => [j.correo.split('@')[0], j.verificado]), [['j01prmcbolivar', true], ['j02prmcbolivar', false]]);
assert.equal(DIRECTORIO['alcaldia:Chaparral'].verificado, false);

// ---------- parte 1: modo simulado ----------
assert.deepEqual(await modo(), { status: 200, ok: true, simulado: true, prueba: false, verificar: false, cerrado: false, libre: false });
r = await alAlcaldia();
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
assert.equal(r.constancia.para, 'contactenos@ovejas-sucre.gov.co');
assert.equal(r.constancia.entidad, 'Alcaldía de Ovejas');
assert.equal(r.constancia.id, null);
assert.equal(r.constancia.simulado, true);
assert.equal(r.constancia.fecha, '2026-10-21T15:00:00.000Z');
assert.equal((await alJuzgado()).status, 200);
assert.equal((await correo({ tipo: 'impugnacion', destino: 'juzgado:Chaparral:2', datos: { codigo: 'IMP2', rad: '2026-10-20', derecho: 'salud', entidad: 'Nueva EPS', municipio: 'Chaparral', telefono: '3001234567', ...persona } })).status, 200);
assert.equal((await alAlcaldia({ destino: 'ant' })).constancia.para, 'atencionalciudadano@ant.gov.co');

// destino libre: sin lista se rechaza, aunque sea simulado
assert.equal((await alAlcaldia({ destino: 'alguien@gmail.com' })).status, 403);
for (const d of ['', 'x', '__proto__', 'constructor', 'alcaldia:Bogotá', 'a@b', 'a@b.co, c@d.co', 'a@b.co\nbcc: c@d.co'])
  assert.equal((await alAlcaldia({ destino: d })).status, 400, `debió rechazar el destino ${JSON.stringify(d)}`);
// cada documento a su tipo de entidad y a la entidad de su municipio
assert.equal((await alJuzgado({ destino: 'alcaldia:Ovejas' })).status, 400);
assert.equal((await alAlcaldia({ destino: 'juzgado:Ovejas' })).status, 400);
assert.equal((await alAlcaldia({ destino: 'alcaldia:Mesetas' })).status, 400);
assert.equal((await alJuzgado({ destino: 'juzgado:Planadas' })).status, 400);
// el juzgado tiene que poder avisarle a la persona: celular, correo en la dirección o copia
const sinContacto = { ...tutela, telefono: '' };
r = await alJuzgado({ datos: sinContacto });
assert.deepEqual([r.status, r.error], [400, 'Para que el juzgado le pueda avisar, escriba su celular en el documento o un correo para la copia']);
assert.equal((await alJuzgado({ datos: { ...sinContacto, telefono: '6012345678' } })).status, 400);   // un fijo no sirve
assert.equal((await alJuzgado({ datos: { ...sinContacto, direccion: 'ana@gmail.com' } })).status, 200);
assert.equal((await alJuzgado({ datos: sinContacto, copia: 'ana@gmail.com' })).status, 400);   // copia sin permiso: no cuenta
// la copia a un correo sin permiso no frena el envío a una entidad: se omite y se avisa
r = await alAlcaldia({ copia: 'ana@gmail.com' });
assert.deepEqual([r.status, r.copia], [200, false]);

// validación de los datos
assert.equal((await alAlcaldia({ tipo: 'contrato' })).status, 400);
assert.equal((await alAlcaldia({ tipo: 'toString' })).status, 400);
assert.equal((await alAlcaldia({ datos: null })).status, 400);
for (const cambio of [{ nombre: '' }, { cedula: '' }, { cedula: '12ab' }, { codigo: 'k7p2' }, { codigo: '<b>' }, { plazo: '<img src=x>' }, { plazo: 7 },
  { temaId: 'nada' }, { peticiones: 'texto' }, { peticiones: Array(11).fill('x') }, { palabras: 'x'.repeat(1001) }, { rad: '20-10-2026' }])
  assert.equal((await alAlcaldia({ datos: { ...peticion, ...cambio } })).status, 400, `debió rechazar ${JSON.stringify(cambio).slice(0, 60)}`);
assert.equal((await alAlcaldia({ datos: { ...peticion, temaId: undefined } })).status, 400);   // la plantilla no se puede armar
assert.equal((await alAlcaldia({ datos: { ...peticion, cedula: '1 234 567' } })).status, 200);   // la cédula con espacios se limpia

// solo JSON, solo desde la propia app, solo GET y POST
assert.equal((await alAlcaldia({}, { headers: { 'content-type': 'text/plain' } })).status, 415);
assert.equal((await alAlcaldia({}, { headers: { origin: 'https://malo.example' } })).status, 403);
assert.equal((await llamar('DELETE', {})).status, 405);
assert.equal((await alAlcaldia({ accion: 'codigo', telefono: '3001234567' })).status, 400);   // en simulado no hace falta código

// en modo simulado no hay límites
for (let i = 0; i <= POR_RED_HORA; i++) assert.equal((await alAlcaldia({}, { ip: '10.0.0.9' })).status, 200);

// abierto a propósito: correos de entidades solo de dominios permitidos (gov.co por defecto) y nunca para un juzgado
env.PERMITIR_CORREO_ABIERTO = '1';
assert.equal((await modo()).libre, 'abierto');
assert.equal((await alAlcaldia({ destino: 'personeria@ovejas-sucre.gov.co', datos: { ...peticion, entidad: 'Personería de Ovejas' } })).status, 200);
assert.equal((await alAlcaldia({ destino: 'pqr@empresa.example' })).status, 403);
assert.equal((await alJuzgado({ destino: 'juzgado@ovejas.gov.co' })).status, 403);
env.DOMINIOS_CORREO = 'gov.co, afinia.com.co';
assert.equal((await correo({ tipo: 'servicios_publicos', destino: 'pqr@afinia.com.co', datos: { ...peticion, servicio: 'energia', motivo: 'cobro', entidad: 'Afinia' } })).status, 200);
delete env.PERMITIR_CORREO_ABIERTO; delete env.DOMINIOS_CORREO;
env.CORREOS_DEMO = 'equipo@ejemplo.co';
assert.equal((await modo()).libre, 'lista');
delete env.CORREOS_DEMO;

// texto plano del correo
assert.equal(aTexto('<p>Hola &amp; adiós &lt;3</p>\n    <h3>Hechos</h3><ol><li>Uno</li><li>Dos</li></ol>'), 'Hola & adiós <3\n\nHechos\n- Uno\n- Dos');
assert.equal(aTexto('&amp;lt;'), '&lt;');   // no decodifica dos veces

// ---------- parte 2: con un fetch falso que imita a Resend ----------
const enviados = [], redis = memoria(), sms = [];
let falla = null;
globalThis.fetch = async (url, op) => {
  if (url.endsWith('/pipeline')) return { ok: true, json: async () => JSON.parse(op.body).map(c => ({ result: redis(c) })) };
  if (url.includes('api.twilio.com')) { sms.push(Object.fromEntries(op.body)); return { ok: true, json: async () => ({}) }; }
  enviados.push({ url, headers: op.headers, cuerpo: JSON.parse(op.body) });
  if (falla) return { ok: false, status: falla, json: async () => ({ name: 'validation_error', message: 'You can only send testing emails to your own email address (equipo@ejemplo.co)' }) };
  return { ok: true, status: 200, json: async () => ({ id: 're_' + enviados.length }) };
};
const ultimo = () => enviados.at(-1).cuerpo;
env.RESEND_API_KEY = 're_prueba';

// cerrado por defecto: con clave real y sin lista ni envío abierto no sale nada
assert.equal((await modo()).cerrado, true);
assert.equal((await alAlcaldia()).status, 503);
env.PERMITIR_CORREO_ABIERTO = '1';   // sin Redis no basta
assert.equal((await alAlcaldia()).status, 503);
assert.equal((await alAlcaldia({ destino: 'personeria@ovejas-sucre.gov.co' })).status, 403);
delete env.PERMITIR_CORREO_ABIERTO;
assert.equal(enviados.length, 0);

// con lista del equipo: lo del directorio llega al primer correo de la lista, marcado como prueba (y la app lo sabe por GET)
env.CORREOS_DEMO = ' Equipo@Ejemplo.co , otra@ejemplo.co';
env.CORREO_REMITENTE = 'MiDerecho <envios@miderecho.test>';
assert.deepEqual(await modo(), { status: 200, ok: true, simulado: false, prueba: true, verificar: false, cerrado: false, libre: 'lista' });
r = await alAlcaldia({ html: '<a href="https://malo.example">clic</a>', to: 'victima@x.co', datos: { ...peticion, entidad: 'Otra entidad cualquiera' } });
assert.deepEqual([r.status, r.simulado, r.constancia.id, r.constancia.para, r.constancia.prueba], [200, false, 're_1', 'equipo@ejemplo.co', true]);
let e = enviados.at(-1);
assert.equal(e.url, 'https://api.resend.com/emails');
assert.equal(e.headers.Authorization, 'Bearer re_prueba');
assert.match(e.headers['Idempotency-Key'], /^peticion-K7P2-[0-9a-f]{16}$/);
assert.deepEqual(e.cuerpo.to, ['equipo@ejemplo.co']);
assert.equal(e.cuerpo.from, 'MiDerecho <envios@miderecho.test>');
assert.equal(e.cuerpo.subject, 'Derecho de petición · Ovejas · código K7P2');
// el documento lo arma el servidor con la plantilla: lleva los datos, escapa el HTML y no usa nada de lo que mande el cliente fuera de los datos
const { html, text } = e.cuerpo;
assert.ok(html.includes('[PRUEBA de MiDerecho]') && html.includes('contactenos@ovejas-sucre.gov.co'));
assert.ok(html.includes('<b>Alcaldía de Ovejas</b>') && !html.includes('Otra entidad cualquiera'));   // con destino del directorio, su nombre
assert.ok(html.includes('Ana Rosa Pérez') && html.includes('1.234.567') && html.includes('Reparar la vía o el camino de la vereda.'));
assert.ok(html.includes('Ley 1755 de 2015') && html.includes('los datos de contacto que aparecen en el documento'));
assert.ok(html.includes('Otra dirección o correo: ____'));   // el mismo documento que la persona vio (modo mano por defecto)
assert.ok(html.includes('&lt;script&gt;') && !html.includes('<script>') && !html.includes('malo.example'));
assert.ok(text.includes('Se cayó el puente <script>') && !text.includes('<p>') && text.includes('- Reparar la vía'));
assert.ok(!JSON.stringify(e.cuerpo).includes('victima@x.co'));
assert.equal(e.cuerpo.reply_to, undefined);   // sin copia, nadie responde a este remitente
// la misma petición reintentada lleva la misma llave (Resend no la reenvía); otro texto, otra llave
await alAlcaldia({ datos: { ...peticion, entidad: 'Otra entidad cualquiera' } });
assert.equal(enviados.at(-1).headers['Idempotency-Key'], e.headers['Idempotency-Key']);
await alAlcaldia({ datos: { ...peticion, palabras: 'otra cosa' } });
assert.notEqual(enviados.at(-1).headers['Idempotency-Key'], e.headers['Idempotency-Key']);

// destino libre de la lista: va a ese correo, sin marca de prueba; copia con permiso, en copia oculta y como reply_to
r = await alAlcaldia({ destino: 'otra@ejemplo.co', datos: { ...peticion, entidad: 'Secretaría de Salud', correo: 'otra@ejemplo.co' }, copia: 'equipo@ejemplo.co' });
assert.deepEqual([r.status, r.constancia.para, r.constancia.prueba, r.copia], [200, 'otra@ejemplo.co', undefined, true]);
assert.deepEqual([ultimo().to, ultimo().bcc, ultimo().reply_to], [['otra@ejemplo.co'], ['equipo@ejemplo.co'], 'equipo@ejemplo.co']);
assert.ok(!ultimo().html.includes('[PRUEBA') && ultimo().html.includes('Para la respuesta: correo equipo@ejemplo.co'));
r = await alAlcaldia({ copia: 'ana@gmail.com' });
assert.deepEqual([r.status, r.copia, ultimo().bcc], [200, false, undefined]);
assert.equal((await alAlcaldia({ destino: 'ana@gmail.com' })).status, 403);
// el modo de la plantilla pasa tal cual (solo 'mano' o 'envio') y los datos de contacto de la persona van en el documento
await alAlcaldia({ datos: { ...peticion, modo: 'envio' } });
assert.ok(ultimo().html.includes('Enviada con autorización del peticionario. Código K7P2'));
await alAlcaldia({ datos: { ...peticion, modo: '<b>', direccion: 'Finca El Roble', telefono: '3001234567' } });
assert.ok(ultimo().html.includes('Dirección o correo: Finca El Roble') && ultimo().html.includes('Teléfono: 3001234567') && !ultimo().html.includes('Enviada con'));
// los campos de una línea no llevan saltos (ni al asunto ni al documento), y en el asunto solo van municipios de la lista
await alAlcaldia({ destino: 'otra@ejemplo.co', datos: { ...peticion, municipio: 'Bogotá\r\nBcc: victima@x.co', vereda: 'A\nB', correo: 'otra@ejemplo.co' } });
assert.equal(ultimo().subject, 'Derecho de petición · código K7P2');
assert.ok(ultimo().html.includes('Bogotá Bcc: victima@x.co') && ultimo().html.includes('Vereda A B'));

// tutela urgente al juzgado: carta al juez con a dónde avisar, asunto de reparto, entidad accionada intacta, sin firma manuscrita ni anexos
r = await alJuzgado();
assert.equal(r.status, 200);
assert.equal(ultimo().subject, 'URGENTE: Acción de tutela para reparto con medida provisional · Ovejas · código T3ST');
assert.ok(ultimo().html.includes('Señor(a) Juez:') && ultimo().html.includes('es el accionante') && ultimo().html.includes('Decreto 2591 de 1991'));
assert.ok(ultimo().html.includes('Para las notificaciones: celular 3001234567'));
assert.ok(ultimo().html.includes('<b>Accionada:</b> Nueva EPS') && ultimo().html.includes('jprmpalovejas@cendoj.ramajudicial.gov.co'));
assert.ok(ultimo().html.includes('Sin firma manuscrita (Ley 2213 de 2022, art. 2)') && ultimo().html.includes('los aportaré cuando el juzgado lo solicite'));
assert.ok(!ultimo().html.includes('Adjunto copia'));
r = await alJuzgado({ datos: { ...tutela, telefono: '' }, copia: 'equipo@ejemplo.co' });   // sin celular, con copia permitida
assert.ok(r.status === 200 && ultimo().reply_to === 'equipo@ejemplo.co' && ultimo().html.includes('Para las notificaciones: correo equipo@ejemplo.co'));

// error de Resend: 502, y en los logs solo el código (su mensaje trae el destinatario)
falla = 422;
r = await alAlcaldia({}, { ip: '10.9.9.9' });   // otra red: la de siempre ya va por su tope de POR_RED_HORA
assert.deepEqual([r.status, r.error], [502, 'El servicio de correo no aceptó el envío (validation_error)']);
falla = null;

// límites con envío real: por destinatario (la entidad, aunque en prueba llegue al equipo) y por red
for (let i = 0; i < POR_DESTINO_DIA; i++) await correo({ tipo: 'peticion', destino: 'alcaldia:Mesetas', datos: { ...peticion, municipio: 'Mesetas' } }, { ip: `10.2.0.${i}` });
assert.equal((await correo({ tipo: 'peticion', destino: 'alcaldia:Mesetas', datos: { ...peticion, municipio: 'Mesetas' } }, { ip: '10.3.0.1' })).status, 429);
assert.equal((await correo({ tipo: 'peticion', destino: 'alcaldia:Uribe', datos: { ...peticion, municipio: 'Uribe' } }, { ip: '10.3.0.1' })).status, 200);   // otra entidad sí
const alcaldias = ['Ataco', 'Planadas', 'Rioblanco', 'Uribe', 'Mapiripán', 'La Macarena'];
for (let i = 0; i < POR_RED_HORA; i++) {
  const m = alcaldias[i % 6];
  assert.equal((await correo({ tipo: 'peticion', destino: 'alcaldia:' + m, datos: { ...peticion, municipio: m } }, { ip: '10.1.1.1' })).status, 200, `envío ${i}`);
}
assert.equal((await alAlcaldia({}, { ip: '10.1.1.1' })).status, 429);
assert.equal((await alAlcaldia({}, { ip: '2800:e2:1:2:aa::1' })).status, 200);   // IPv6: cuenta por red, no por dirección

// tope diario con reserva para tutelas (al día siguiente, contadores nuevos): lo administrativo usa hasta el 80 %
ahora += 86400e3;
env.LIMITE_DIARIO = '5';
for (let i = 0; i < 4; i++) assert.equal((await alAlcaldia({}, { ip: `10.5.0.${i}` })).status, 200, `petición ${i}`);
assert.equal((await alAlcaldia({}, { ip: '10.5.1.1' })).status, 429);   // 5.ª petición: ya usó el 80 %
assert.equal((await alAlcaldia({}, { ip: '10.5.1.2' })).status, 429);   // y los rechazos no gastan la reserva
assert.equal((await alJuzgado({}, { ip: '10.5.2.1' })).status, 200);    // la tutela entra con la reserva
assert.equal((await alJuzgado({}, { ip: '10.5.2.2' })).status, 429);    // hasta el tope
delete env.LIMITE_DIARIO;

// ---------- parte 3: envío abierto (Redis y Twilio falsos): celular verificado por código ----------
ahora += 86400e3;
delete env.CORREOS_DEMO;
Object.assign(env, { PERMITIR_CORREO_ABIERTO: '1', KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 't', CLAVE_CIFRADO: randomBytes(32).toString('base64') });
assert.equal((await alAlcaldia({ accion: 'codigo', telefono: '3001234567' })).status, 503);   // sin Twilio no hay cómo verificar
Object.assign(env, { TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 't', TWILIO_FROM: '+15550000000', PERMITIR_ENVIO_ABIERTO: '1' });
assert.deepEqual(await modo(), { status: 200, ok: true, simulado: false, prueba: false, verificar: true, cerrado: false, libre: 'abierto' });
const conTel = { ...peticion, telefono: '3001234567' };
assert.equal((await alAlcaldia({ datos: conTel })).status, 403);   // sin código
assert.equal((await alAlcaldia({ datos: peticion, verificacion: { codigo: '123456' } })).status, 400);   // sin celular en el documento
assert.equal((await correo({ accion: 'codigo', telefono: '12345' })).status, 400);
assert.equal((await correo({ accion: 'codigo', telefono: '300 123 4567' })).status, 200);
const codigo = sms.at(-1).Body.match(/\d{6}/)[0];
assert.equal(sms.at(-1).To, '+573001234567');
assert.equal((await alAlcaldia({ datos: conTel, verificacion: { codigo: codigo === '000000' ? '111111' : '000000' } })).status, 403);
r = await alAlcaldia({ datos: conTel, verificacion: { codigo } });
assert.deepEqual([r.status, r.constancia.para, r.constancia.prueba, r.constancia.simulado], [200, 'contactenos@ovejas-sucre.gov.co', undefined, undefined]);
assert.deepEqual(ultimo().to, ['contactenos@ovejas-sucre.gov.co']);   // de verdad a la alcaldía
assert.equal((await alAlcaldia({ datos: conTel, verificacion: { codigo } })).status, 403);   // el código sirve una sola vez
await correo({ accion: 'codigo', telefono: '3001234567' });
const otro = sms.at(-1).Body.match(/\d{6}/)[0];
assert.equal((await alAlcaldia({ destino: 'pqr@empresa.example', datos: conTel, verificacion: { codigo: otro } })).status, 403);   // dominio no permitido
assert.equal((await alJuzgado({ destino: 'juzgado@ovejas.gov.co', verificacion: { codigo: otro } })).status, 403);   // juzgado solo del directorio
assert.equal((await alJuzgado({ verificacion: { codigo: otro }, copia: 'ana@gmail.com' })).status, 200);   // con celular verificado, copia a su correo
assert.deepEqual(ultimo().bcc, ['ana@gmail.com']);
for (let i = 0; i <= 5; i++) await alAlcaldia({ datos: conTel, verificacion: { codigo: '999999' } });
await correo({ accion: 'codigo', telefono: '3001234567' });
assert.equal((await alAlcaldia({ datos: conTel, verificacion: { codigo: sms.at(-1).Body.match(/\d{6}/)[0] } })).status, 429);   // demasiados intentos

// ---------- en ningún log hay datos personales, códigos ni correos escritos a mano ----------
assert.ok(logs.some(l => l.includes('[correo] enviado: peticion a alcaldia:Ovejas (prueba)')));
assert.ok(logs.some(l => l.includes('[correo] Resend respondió 422 validation_error')));
for (const dato of ['Ana Rosa', '1.234.567', '1234567', 'puente', 'insulina', 'Nueva EPS', 'La Peña', '@ejemplo.co', '@gmail.com', 'ovejas-sucre', '3001234567', codigo, otro])
  assert.ok(!logs.some(l => l.includes(dato)), `un log incluye "${dato}"`);

process.stdout.write('OK: /api/correo\n');
