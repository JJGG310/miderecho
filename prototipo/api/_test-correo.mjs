// Pruebas de /api/correo sin cuentas reales: node prototipo/api/_test-correo.mjs
// Parte 1, modo simulado (sin RESEND_API_KEY). Parte 2, con un fetch falso que imita a Resend.
// Reloj fijo para no depender de la hora. El guion bajo evita que Vercel publique este archivo.
import assert from 'node:assert/strict';

for (const k of Object.keys(process.env))
  if (/^(RESEND_|CORREO_REMITENTE|CORREOS_DEMO|PERMITIR_CORREO_ABIERTO|KV_|UPSTASH_|CLAVE_CIFRADO|LIMITE_DIARIO)/.test(k)) delete process.env[k];
const env = process.env, logs = [];
console.log = console.error = (...a) => logs.push(a.join(' '));
Date.now = () => Date.parse('2026-10-21T15:00:00Z');   // 10 a. m. en Colombia

const { default: handler, POR_RED_HORA, POR_DESTINO_DIA, aTexto } = await import('./correo.js');
async function correo(body, { ip = '10.0.0.1', headers = {} } = {}) {
  const r = {};
  await handler({ method: 'POST', body, headers: { 'x-real-ip': ip, host: 'miderecho.test', 'content-type': 'application/json', ...headers } },
    { status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; } });
  return r;
}
const persona = { nombre: 'Ana Rosa Pérez', cedula: '1.234.567' };
const peticion = { codigo: 'K7P2', temaId: 'vias', municipio: 'Ovejas', vereda: 'La Peña', desde: 'hace un mes',
  palabras: 'Se cayó el puente <script>alert(1)</script>', peticiones: [{ texto: 'Reparar la vía o el camino de la vereda.', tipo: 'general' }],
  plazo: 15, entidad: 'Alcaldía de Ovejas', correo: 'contactenos@ovejas-sucre.gov.co', ...persona };
const tutela = { codigo: 'T3ST', derecho: 'salud', afectado: 'propio', que: 'medicamento', detalle: 'insulina', pidio: 'negada', desde: 'hace un mes',
  urgente: 'si', pruebas: ['Orden o fórmula médica'], entidad: 'Nueva EPS', municipio: 'Ovejas', vereda: 'La Peña', ...persona };
const alAlcaldia = (cambios = {}, op) => correo({ tipo: 'peticion', destino: 'alcaldia:Ovejas', datos: peticion, ...cambios }, op);
let r;

// ---------- parte 1: modo simulado ----------
r = await alAlcaldia();
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
assert.equal(r.constancia.para, 'contactenos@ovejas-sucre.gov.co');
assert.equal(r.constancia.entidad, 'Alcaldía de Ovejas');
assert.equal(r.constancia.id, null);
assert.equal(r.constancia.simulado, true);
assert.equal(r.constancia.fecha, '2026-10-21T15:00:00.000Z');
assert.equal((await correo({ tipo: 'tutela_salud', destino: 'juzgado:Ovejas', datos: tutela })).status, 200);
assert.equal((await correo({ tipo: 'impugnacion', destino: 'juzgado:Chaparral:2', datos: { codigo: 'IMP2', rad: '2026-10-20', derecho: 'salud', entidad: 'Nueva EPS', municipio: 'Chaparral', ...persona } })).status, 200);
assert.equal((await alAlcaldia({ destino: 'ant' })).constancia.para, 'atencionalciudadano@ant.gov.co');

// destino libre: sin lista se rechaza, aunque sea simulado
assert.equal((await alAlcaldia({ destino: 'alguien@gmail.com' })).status, 403);
for (const d of ['', 'x', '__proto__', 'constructor', 'alcaldia:Bogotá', 'a@b', 'a@b.co, c@d.co', 'a@b.co\nbcc: c@d.co'])
  assert.equal((await alAlcaldia({ destino: d })).status, 400, `debió rechazar el destino ${JSON.stringify(d)}`);
// cada documento a su tipo de entidad
assert.equal((await correo({ tipo: 'tutela_salud', destino: 'alcaldia:Ovejas', datos: tutela })).status, 400);
assert.equal((await alAlcaldia({ destino: 'juzgado:Ovejas' })).status, 400);
// la copia a un correo sin permiso no frena el envío: se omite y se avisa
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

// solo JSON, solo desde la propia app, solo POST
assert.equal((await alAlcaldia({}, { headers: { 'content-type': 'text/plain' } })).status, 415);
assert.equal((await alAlcaldia({}, { headers: { origin: 'https://malo.example' } })).status, 403);
r = {}; await handler({ method: 'GET', headers: {} }, { status(s) { r.status = s; return this; }, json() { return this; } });
assert.equal(r.status, 405);

// en modo simulado no hay límites
for (let i = 0; i <= POR_RED_HORA; i++) assert.equal((await alAlcaldia({}, { ip: '10.0.0.9' })).status, 200);

// abierto a propósito: en simulado, cualquier correo (con envío real exige además Redis; ver parte 2)
env.PERMITIR_CORREO_ABIERTO = '1';
assert.equal((await alAlcaldia({ destino: 'personeria@ovejas-sucre.gov.co' })).status, 200);
delete env.PERMITIR_CORREO_ABIERTO;

// texto plano del correo
assert.equal(aTexto('<p>Hola &amp; adiós &lt;3</p>\n    <h3>Hechos</h3><ol><li>Uno</li><li>Dos</li></ol>'), 'Hola & adiós <3\n\nHechos\n- Uno\n- Dos');
assert.equal(aTexto('&amp;lt;'), '&lt;');   // no decodifica dos veces

// ---------- parte 2: con un fetch falso que imita a Resend ----------
const enviados = [];
let falla = null;
globalThis.fetch = async (url, op) => {
  enviados.push({ url, headers: op.headers, cuerpo: JSON.parse(op.body) });
  if (falla) return { ok: false, status: falla, json: async () => ({ name: 'validation_error', message: 'You can only send testing emails to your own email address (equipo@ejemplo.co)' }) };
  return { ok: true, status: 200, json: async () => ({ id: 're_' + enviados.length }) };
};
const ultimo = () => enviados.at(-1).cuerpo;
env.RESEND_API_KEY = 're_prueba';

// cerrado por defecto: con clave real y sin lista ni envío abierto no sale nada
assert.equal((await alAlcaldia()).status, 503);
env.PERMITIR_CORREO_ABIERTO = '1';   // sin Redis no basta
assert.equal((await alAlcaldia()).status, 503);
assert.equal((await alAlcaldia({ destino: 'personeria@ovejas-sucre.gov.co' })).status, 403);
delete env.PERMITIR_CORREO_ABIERTO;
assert.equal(enviados.length, 0);

// con lista del equipo: lo del directorio llega al primer correo de la lista, marcado como prueba
env.CORREOS_DEMO = ' Equipo@Ejemplo.co , otra@ejemplo.co';
env.CORREO_REMITENTE = 'MiDerecho <envios@miderecho.test>';
r = await alAlcaldia({ html: '<a href="https://malo.example">clic</a>', to: 'victima@x.co' });
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
assert.ok(html.includes('Ana Rosa Pérez') && html.includes('1.234.567') && html.includes('Reparar la vía o el camino de la vereda.'));
assert.ok(html.includes('Ley 1755 de 2015') && html.includes('Enviada con autorización del peticionario. Código K7P2'));
assert.ok(html.includes('&lt;script&gt;') && !html.includes('<script>') && !html.includes('malo.example'));
assert.ok(text.includes('Se cayó el puente <script>') && !text.includes('<p>') && text.includes('- Reparar la vía'));
assert.ok(!JSON.stringify(e.cuerpo).includes('victima@x.co'));
// la misma petición reintentada lleva la misma llave (Resend no la reenvía); otro texto, otra llave
await alAlcaldia();
assert.equal(enviados.at(-1).headers['Idempotency-Key'], e.headers['Idempotency-Key']);
await alAlcaldia({ datos: { ...peticion, palabras: 'otra cosa' } });
assert.notEqual(enviados.at(-1).headers['Idempotency-Key'], e.headers['Idempotency-Key']);

// destino libre de la lista: va a ese correo, sin marca de prueba; copia con permiso, en copia oculta
r = await alAlcaldia({ destino: 'otra@ejemplo.co', datos: { ...peticion, entidad: 'Secretaría de Salud', correo: 'otra@ejemplo.co' }, copia: 'equipo@ejemplo.co' });
assert.deepEqual([r.status, r.constancia.para, r.constancia.prueba, r.copia], [200, 'otra@ejemplo.co', undefined, true]);
assert.deepEqual([ultimo().to, ultimo().bcc], [['otra@ejemplo.co'], ['equipo@ejemplo.co']]);
assert.ok(!ultimo().html.includes('[PRUEBA'));
r = await alAlcaldia({ copia: 'ana@gmail.com' });
assert.deepEqual([r.status, r.copia, ultimo().bcc], [200, false, undefined]);
assert.equal((await alAlcaldia({ destino: 'ana@gmail.com' })).status, 403);

// tutela urgente al juzgado: carta al juez, asunto de reparto y la entidad accionada intacta
r = await correo({ tipo: 'tutela_salud', destino: 'juzgado:Ovejas', datos: tutela });
assert.equal(r.status, 200);
assert.equal(ultimo().subject, 'URGENTE: Acción de tutela para reparto con medida provisional · Ovejas · código T3ST');
assert.ok(ultimo().html.includes('Señor(a) Juez:') && ultimo().html.includes('es el accionante') && ultimo().html.includes('Decreto 2591 de 1991'));
assert.ok(ultimo().html.includes('<b>Accionada:</b> Nueva EPS') && ultimo().html.includes('jprmpalovejas@cendoj.ramajudicial.gov.co'));

// error de Resend: 502, y en los logs solo el código (su mensaje trae el destinatario)
falla = 422;
r = await alAlcaldia();
assert.deepEqual([r.status, r.error], [502, 'El servicio de correo no aceptó el envío (validation_error)']);
falla = null;

// límites con envío real: por destinatario (la entidad, aunque en prueba llegue al equipo), por red y diario
for (let i = 0; i < POR_DESTINO_DIA; i++) await correo({ tipo: 'peticion', destino: 'alcaldia:Mesetas', datos: peticion }, { ip: `10.2.0.${i}` });
assert.equal((await correo({ tipo: 'peticion', destino: 'alcaldia:Mesetas', datos: peticion }, { ip: '10.3.0.1' })).status, 429);
assert.equal((await correo({ tipo: 'peticion', destino: 'alcaldia:Uribe', datos: peticion }, { ip: '10.3.0.1' })).status, 200);   // otra entidad sí
const alcaldias = ['Ataco', 'Planadas', 'Rioblanco', 'Uribe', 'Mapiripán', 'La Macarena'].map(m => 'alcaldia:' + m);
for (let i = 0; i < POR_RED_HORA; i++) assert.equal((await correo({ tipo: 'peticion', destino: alcaldias[i % 6], datos: peticion }, { ip: '10.1.1.1' })).status, 200, `envío ${i}`);
assert.equal((await alAlcaldia({}, { ip: '10.1.1.1' })).status, 429);
assert.equal((await alAlcaldia({}, { ip: '2800:e2:1:2:aa::1' })).status, 200);   // IPv6: cuenta por red, no por dirección
env.LIMITE_DIARIO = '5';   // el total del día ya pasó de 5
assert.equal((await correo({ tipo: 'peticion', destino: 'alcaldia:Ovejas', datos: peticion }, { ip: '10.4.0.1' })).status, 429);
delete env.LIMITE_DIARIO;

// ---------- en ningún log hay datos personales ni correos escritos a mano ----------
assert.ok(logs.some(l => l.includes('[correo] enviado: peticion a alcaldia:Ovejas (prueba)')));
assert.ok(logs.some(l => l.includes('[correo] Resend respondió 422 validation_error')));
for (const dato of ['Ana Rosa', '1.234.567', 'puente', 'insulina', 'Nueva EPS', 'La Peña', '@ejemplo.co', '@gmail.com', 'ovejas-sucre'])
  assert.ok(!logs.some(l => l.includes(dato)), `un log incluye "${dato}"`);

process.stdout.write('OK: /api/correo\n');
