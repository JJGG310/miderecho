// Pruebas de avisos con plantillas (sms.js, whatsapp.js), herramientas del agente telefónico (_herramientas.js) y
// herramientas de cliente del agente de voz de la v2 (apps/web/src/lib/agenteVoz.js). Sin cuentas reales:
//   node prototipo/api/_test-agente-avisos.mjs
// El guion bajo evita que Vercel publique este archivo.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

for (const k of Object.keys(process.env))
  if (/^(TWILIO_|KV_|UPSTASH_|NUMEROS_DEMO|CLAVE_CIFRADO|LIMITE_DIARIO|PERMITIR_ENVIO_ABIERTO|AGENTE_HERRAMIENTAS_SECRETO|ELEVENLABS_)/.test(k)) delete process.env[k];
const env = process.env, mostrar = console.log, logs = [];
console.log = console.error = console.warn = (...a) => logs.push(a.join(' '));

const { septetos, gsm, kv, hmac, descifrar, memoria, POR_NUMERO_DIA } = await import('./_comun.js');
const { PLANTILLAS, armarAviso } = await import('./_avisos.js');
const { FRASE } = await import('./_herramientas.js');
const { default: sesion, AVISO_VOZ } = await import('./elevenlabs-sesion.js');
const { sumarHabiles, deIso, iso } = await import('@miderecho/nucleo');
const { crearAgente, resumen, contexto, FRASES, AVISO_VOZ: AVISO_VOZ_APP } = await import('../../apps/web/src/lib/agenteVoz.js');

async function llamar(handler, { method = 'POST', body, query, url, headers = {}, ip = '10.0.0.1' }) {
  const r = { cabeceras: {} };
  await handler({ method, body, query, url, headers: { 'x-real-ip': ip, host: 'miderecho.test', 'content-type': 'application/json', ...headers } },
    { setHeader(k, v) { r.cabeceras[k] = v; }, status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; }, send(b) { r.cuerpo = b; return this; } });
  return r;
}
const api = async (ruta, body, op = {}) => llamar((await import(`./${ruta}.js`)).default, { body, ...op });
const aviso = (canal, plantilla, datos, telefono = '300 111 2233', extra = {}) => api(canal, { plantilla, telefono, datos, ...extra });
const SECRETO = 'x'.repeat(40);
const herr = (nombre, body, secreto = SECRETO, method = 'POST') =>
  llamar(sesion, { method, body, query: { herramienta: nombre }, headers: secreto ? { 'x-miderecho-secreto': secreto } : {} });
const vence = (desde, dias) => iso(sumarHabiles(deIso(desde), dias));
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const corta = f => `${+f.slice(8)}-${MESES[f.slice(5, 7) - 1]}`;
let r;

// ---------- 1. Avisos con plantillas cerradas (modo simulado) ----------
r = await aviso('sms', 'documento_listo', { codigo: 'K7P2' });
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
assert.equal((await aviso('whatsapp', 'plazo', { codigo: 'K7P2', fecha: '2026-11-30' })).status, 200);
assert.deepEqual(Object.keys(PLANTILLAS), ['documento_listo', 'plazo']);

// plantilla desconocida (también nombres heredados de Object) y texto libre por cualquier camino
for (const p of ['libre', 'texto', 'llamada_agendada', '__proto__', 'constructor', 'toString', undefined])
  assert.equal((await aviso('sms', p, { codigo: 'K7P2' })).status, 400, `plantilla ${p}`);
assert.equal((await api('sms', { telefono: '3001112233', texto: 'Hola, su tutela contra la EPS…' })).status, 400, 'interfaz vieja con texto');
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' }, undefined, { texto: 'x' })).status, 400, 'clave extra');
assert.equal((await aviso('whatsapp', 'documento_listo', { codigo: 'K7P2' }, undefined, { pdfUrl: 'https://miderecho.test/a.pdf' })).status, 400);
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2', nombre: 'Ana' })).status, 400, 'dato extra');
// cada dato es un texto con el formato exacto (listas y objetos no pasan, aunque se vean igual al convertirlos)
for (const codigo of ['su tutela', 'k7p2', 'ABCDEFGHJKLM', 'ABCI', 'AB01', 'K7P', ['K7P2'], { a: 'K7P2' }, 1234, null])
  assert.equal((await aviso('sms', 'documento_listo', { codigo })).status, 400, `código ${JSON.stringify(codigo)}`);
for (const fecha of ['2026-02-30', '30-nov', '2026-11-30T00:00', ['2026-11-30'], 20261130])
  assert.equal((await aviso('sms', 'plazo', { codigo: 'K7P2', fecha })).status, 400, `fecha ${JSON.stringify(fecha)}`);
assert.equal((await aviso('sms', 'documento_listo', {})).status, 400);
assert.equal((await aviso('sms', 'documento_listo', ['K7P2'])).status, 400);
for (const tel of ['12345', '+1 415 555 0100', '601 234 5678', '', null])
  assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' }, tel)).status, 400, `número ${tel}`);
// solo JSON y solo desde la propia app (protecciones de _comun.js)
assert.equal((await api('sms', { plantilla: 'documento_listo', telefono: '3001112233', datos: { codigo: 'K7P2' } }, { headers: { 'content-type': 'text/plain' } })).status, 415);
assert.equal((await api('whatsapp', { plantilla: 'documento_listo', telefono: '3001112233', datos: { codigo: 'K7P2' } }, { headers: { origin: 'https://malo.example' } })).status, 403);
assert.equal((await api('sms', undefined, { method: 'GET' })).status, 405);

// los textos caben en un SMS, son GSM-7 puro y no llevan nada del caso
for (const [p, datos] of Object.entries({ documento_listo: { codigo: 'ABCD' }, plazo: { codigo: 'ABCD', fecha: '2026-12-31' } })) {
  const { texto } = armarAviso({ plantilla: p, telefono: '3001112233', datos });
  assert.ok(septetos(texto) <= 160 && gsm(texto) === texto, texto);
  assert.doesNotMatch(texto, /tutela|petici|eps|salud|tierra|nombre|c[eé]dula|MiDerecho/i, texto);
}
assert.equal(armarAviso({ plantilla: 'plazo', telefono: '3001112233', datos: { codigo: 'ABCD', fecha: '2026-12-31' } }).texto, 'Caso ABCD: el plazo vence el 31-dic. Si la entidad no le ha respondido, avise a su lider.');

// ---------- 2. Herramientas del agente telefónico ----------
// secreto obligatorio: sin variable o corta, cerradas; con variable, cabecera exacta
assert.equal((await herr('orientar', { documento: 'peticion' })).status, 503, 'sin AGENTE_HERRAMIENTAS_SECRETO');
env.AGENTE_HERRAMIENTAS_SECRETO = 'corto';
assert.equal((await herr('orientar', { documento: 'peticion' }, 'corto')).status, 503, 'secreto corto = no configurado');
env.AGENTE_HERRAMIENTAS_SECRETO = SECRETO;
assert.equal((await herr('orientar', { documento: 'peticion' }, null)).status, 401, 'sin cabecera');
assert.equal((await herr('orientar', { documento: 'peticion' }, SECRETO + 'x')).status, 401, 'cabecera distinta');
assert.equal((await herr('orientar', { documento: 'peticion' }, 'y'.repeat(40))).status, 401);
assert.equal((await herr('borrar_todo', {})).status, 404, 'herramienta desconocida');
assert.equal((await herr('__proto__', {})).status, 404);
assert.equal((await herr('orientar', undefined, SECRETO, 'GET')).status, 405);
// sin ?herramienta= la misma función sigue siendo la sesión del navegador (y sin clave de ElevenLabs, 503)
assert.equal(AVISO_VOZ_APP, AVISO_VOZ, 'la app y el servidor piden la misma versión del aviso de voz');
assert.equal((await llamar(sesion, { body: { aviso: AVISO_VOZ }, headers: { origin: 'https://miderecho.test', 'sec-fetch-site': 'same-origin' } })).status, 503);

// orientar: valores cerrados, frases y ley fijas
r = await herr('orientar', { documento: 'servicios_publicos' });
assert.deepEqual([r.status, r.documento, r.plazo_dias_habiles], [200, 'servicios_publicos', 15]);
assert.match(r.ley, /Ley 142 de 1994/);
assert.equal(r.frase, FRASE.servicios_publicos);
assert.equal(r.aviso, 'Esto es información general, no consejo de abogado.');
assert.equal((await herr('orientar', { documento: 'tutela_salud' })).documento, 'peticion', 'sin urgencia, petición a la EPS');
assert.equal((await herr('orientar', { documento: 'tutela_salud', urgente: true })).documento, 'tutela_salud');
assert.equal((await herr('orientar', { documento: 'ninguno', derecho: 'trabajo' })).titulo, null);
assert.equal((await herr('orientar', { documento: 'contrato' })).status, 400);

// documento: listas cerradas (también el municipio), código atado a la llamada, variables cifradas por 72 h
const A = 'conv_prueba_A', B = 'conv_prueba_B';
r = await herr('documento', { tipo: 'peticion', temaId: 'agua', municipio: 'chaparral', desde: 'hace tres meses', conversacion: A });
assert.equal(r.status, 200, r.error);
assert.match(r.codigo, /^[A-HJ-NP-Z2-9]{4}$/);
assert.equal(r.deletreado, r.codigo.split('').join(', '));
assert.deepEqual(r.pide, ['Reparar y restablecer el servicio de agua de la vereda.']);
assert.equal(r.para, 'Alcaldía de Chaparral');
const codigoA = r.codigo, [guardado] = await kv(['GET', 'doc:' + hmac('doc:' + codigoA)]);
assert.ok(guardado && !guardado.includes('Chaparral'), 'cifrado');
assert.equal(JSON.parse(descifrar(guardado)).temaId, 'agua');
for (const d of [{ tipo: 'servicios_publicos', servicio: 'energia', motivo: 'cobro', municipio: 'Ovejas' },
  { tipo: 'tutela_salud', que: 'medicamento', urgente: true, municipio: 'PLANADAS' },
  { tipo: 'tutela', derecho: 'minimo_vital', municipio: 'puerto rico' },
  { tipo: 'peticion', temaId: 'tierras', municipio: 'Mapiripan' }])
  assert.equal((r = await herr('documento', { ...d, conversacion: B })).status, 200, `${d.tipo}: ${r.error}`);
assert.equal(r.para, 'Agencia Nacional de Tierras');
for (const d of [{ tipo: 'peticion', temaId: 'otro', municipio: 'Ovejas' }, { tipo: 'peticion', temaId: 'agua', municipio: 'Calle 5 # 10-20' },
  { tipo: 'peticion', temaId: 'agua', municipio: 'Bogotá' }, { tipo: 'peticion', temaId: 'agua', municipio: ['Ovejas'] },
  { tipo: 'peticion', temaId: 'agua', municipio: 'Ovejas', desde: 'ayer' }, { tipo: 'contrato_laboral', municipio: 'Ovejas' }, { tipo: 'peticion', temaId: 'agua' }])
  assert.equal((await herr('documento', { ...d, conversacion: A })).status, 400, JSON.stringify(d));
assert.equal((await herr('documento', { tipo: 'peticion', temaId: 'agua', municipio: 'Ovejas' })).status, 400, 'sin conversación');

// plazo: días hábiles con festivos del núcleo
r = await herr('plazo', { tipo: 'peticion', desde: '2026-10-21' });
assert.deepEqual([r.status, r.dias_habiles, r.vence], [200, 15, vence('2026-10-21', 15)]);
assert.match(r.vence_en_palabras, /de noviembre/);
for (const desde of ['2026-02-30', ['2026-10-21'], 20261021]) assert.equal((await herr('plazo', { tipo: 'peticion', desde })).status, 400);
assert.equal((await herr('plazo', { tipo: 'tutela' })).status, 200, 'sin fecha: desde hoy');

// aviso: solo códigos de documentos de esta llamada, fecha calculada en el servidor, sin texto libre
const avisoA = (cambios = {}) => herr('aviso', { canal: 'sms', plantilla: 'documento_listo', telefono: '+573001112233', codigo: codigoA, conversacion: A, ...cambios });
r = await avisoA();
assert.deepEqual([r.status, r.simulado], [200, true]);
assert.equal((await avisoA({ canal: 'whatsapp', plantilla: 'plazo', desde: '2026-10-21' })).status, 200);
assert.equal((await avisoA({ conversacion: B })).status, 404, 'código de otra llamada');
assert.equal((await avisoA({ codigo: 'ZZZZ' })).status, 404, 'código que no existe');
assert.equal((await avisoA({ codigo: ['K7P2'] })).status, 404);
assert.equal((await avisoA({ conversacion: undefined })).status, 400, 'sin conversación');
assert.equal((await avisoA({ plantilla: 'plazo', fecha: '2026-12-24' })).status, 400, 'la fecha no la pone el modelo');
assert.equal((await avisoA({ plantilla: 'llamada_agendada' })).status, 400);
assert.equal((await avisoA({ texto: 'hola' })).status, 400);
assert.equal((await avisoA({ canal: 'llamada' })).status, 400);
// protocolo de riesgo en la llamada A: documento y aviso bloqueados ahí; la llamada B sigue
assert.equal((await herr('riesgo', { conversacion: A })).ok, true);
assert.equal((await avisoA()).status, 403, 'aviso después del riesgo');
assert.equal((await herr('documento', { tipo: 'peticion', temaId: 'agua', municipio: 'Ovejas', conversacion: A })).status, 403, 'documento después del riesgo');
assert.equal((await herr('documento', { tipo: 'peticion', temaId: 'agua', municipio: 'Ovejas', conversacion: B })).status, 200);
assert.equal((await herr('riesgo', {})).status, 400);

// ---------- 3. Envío real con Twilio y Upstash falsos: falla cerrada, lista blanca, plantilla de WhatsApp y límites ----------
let redis = memoria(new Map());
const salidas = [];
globalThis.fetch = async (url, { body }) => {
  if (url === 'https://kv.test/pipeline') return new Response(JSON.stringify(JSON.parse(body).map(c => ({ result: redis(c) }))));
  assert.match(url, /^https:\/\/api\.twilio\.com\//);
  salidas.push(Object.fromEntries(body));
  return new Response('{"sid":"SM1"}', { status: 201 });
};
Object.assign(env, { TWILIO_ACCOUNT_SID: 'ACprueba', TWILIO_AUTH_TOKEN: 'token', TWILIO_FROM: '+15005550006', TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886' });
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' })).status, 503, 'sin NUMEROS_DEMO: cerrado');
// abierto a propósito para /api/sms (Redis y PERMITIR_ENVIO_ABIERTO), el agente sigue exigiendo NUMEROS_DEMO
Object.assign(env, { KV_REST_API_URL: 'https://kv.test', KV_REST_API_TOKEN: 'kv', CLAVE_CIFRADO: randomBytes(32).toString('base64'), PERMITIR_ENVIO_ABIERTO: '1' });
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' }, '3157778899')).status, 200, 'abierto para la app');
const C = 'conv_prueba_C', codigoC = (await herr('documento', { tipo: 'peticion', temaId: 'salud', municipio: 'Ataco', conversacion: C })).codigo;
const avisoC = cambios => herr('aviso', { canal: 'sms', plantilla: 'plazo', telefono: '3001112233', codigo: codigoC, conversacion: C, ...cambios });
assert.equal((await avisoC()).status, 503, 'el agente no manda a cualquier número');
env.NUMEROS_DEMO = '3001112233';
delete env.PERMITIR_ENVIO_ABIERTO;
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' }, '3209998877')).status, 403, 'fuera de la lista');
r = await avisoC({ desde: '2026-10-21' });
assert.deepEqual([r.ok, r.simulado], [true, false]);
assert.equal(salidas.at(-1).Body, `Caso ${codigoC}: el plazo vence el ${corta(vence('2026-10-21', 15))}. Si la entidad no le ha respondido, avise a su lider.`, 'fecha del servidor');
r = await aviso('sms', 'documento_listo', { codigo: 'K7P2' });
assert.deepEqual([r.ok, r.simulado], [true, false]);
assert.deepEqual(salidas.at(-1), { To: '+573001112233', From: '+15005550006', Body: PLANTILLAS.documento_listo.texto({ codigo: 'K7P2' }) });
await aviso('whatsapp', 'plazo', { codigo: 'K7P2', fecha: '2026-11-30' });
assert.equal(salidas.at(-1).Body, 'Caso K7P2: el plazo vence el 30-nov. Si la entidad no le ha respondido, avise a su lider.', 'sin plantilla aprobada: texto (sandbox)');
env.TWILIO_WA_PLAZO = 'HXplazo';
await aviso('whatsapp', 'plazo', { codigo: 'K7P2', fecha: '2026-11-30' });
assert.deepEqual(salidas.at(-1), { To: 'whatsapp:+573001112233', From: 'whatsapp:+14155238886', ContentSid: 'HXplazo', ContentVariables: '{"1":"K7P2","2":"30-nov"}' });
redis = memoria(new Map());   // cuentas nuevas: el tope por número
for (let i = 0; i < POR_NUMERO_DIA; i++) assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' })).status, 200);
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' })).status, 429, 'tope por número');

// ---------- 4. Herramientas de cliente del agente de voz (v2) ----------
assert.deepEqual(FRASES, FRASE, 'mismas frases fijas en la app y en el teléfono');
const llamadas = [];
let siguiente = { accion: 'preguntar', mensaje: '¿Es urgente? Llámame al 3001234567', opciones: ['Sí, es urgente', 'No'] };
let riesgos = 0, antesDeResponder = () => {};
const app = { responder: async t => { llamadas.push(t); antesDeResponder(); return siguiente; }, marcarRiesgo: () => riesgos++ };
let ag = crearAgente(() => app), h = ag.herramientas;
assert.deepEqual(Object.keys(h), ['contar_al_asistente', 'activar_protocolo_riesgo'], 'solo dos acciones: nada de aceptar, borrar, enviar ni cerrar');
assert.ok(Object.isFrozen(h));
r = await h.contar_al_asistente({ texto: 'La EPS no me da la cita, mi cédula es 1.144.555.666 y mi correo ana@correo.co' });
assert.equal(llamadas.at(-1), 'La EPS no me da la cita, mi cédula es [número] y mi correo [correo]', 'filtro antes del asistente');
assert.equal(r.mensaje, '¿Es urgente? Llámame al [teléfono]', 'filtro antes del agente');
assert.deepEqual(r.opciones, ['Sí, es urgente', 'No']);
assert.equal((await h.contar_al_asistente({ texto: '   ' })).ok, false);
// orientación: al agente solo le llega lo jurídico fijo (frase aprobada y ley del contenido validado), no los pasos del modelo
siguiente = { accion: 'orientar', mensaje: 'Ya entiendo.', orientacion: { tema: 'Cita negada', documento: 'tutela_salud', documento_titulo: 'Tutela de salud', pasos: ['Guarda la orden'], donde_acudir: ['Personería'], resumen: 'secreto', ley: { texto: 'El artículo 86…', normas: 'x' } } };
r = await h.contar_al_asistente({ texto: 'Sí, es urgente' });
assert.deepEqual(r.orientacion, { tema: 'Cita negada', documento: 'tutela_salud', documento_titulo: 'Tutela de salud', frase: FRASES.tutela_salud, ley: 'El artículo 86…', aviso: 'Esto es información general, no consejo de abogado.' });
siguiente = null;
assert.equal((await h.contar_al_asistente({ texto: 'hola' })).ok, false, 'el asistente falló');
// riesgo desde el servidor: desde ahí no se manda nada más al asistente
siguiente = { accion: 'riesgo', mensaje: 'Lo que me cuentas es serio.' };
assert.equal((await h.contar_al_asistente({ texto: 'me pasó algo' })).accion, 'riesgo');
const antes = llamadas.length;
assert.equal((await h.contar_al_asistente({ texto: 'sigamos con el caso' })).ok, false);
assert.equal(llamadas.length, antes);
// riesgo desde el agente
({ herramientas: h } = crearAgente(() => app));
assert.equal(h.activar_protocolo_riesgo().ok, true);
assert.equal(riesgos, 1);
assert.equal((await h.contar_al_asistente({ texto: 'hola' })).ok, false);
assert.equal((await crearAgente(() => app, { riesgo: true }).herramientas.contar_al_asistente({ texto: 'hola' })).ok, false, 'pantalla ya en riesgo');
// riesgo por regla fija sobre lo que dijo la PERSONA (transcripción del SDK), aunque el modelo no lo note
ag = crearAgente(() => app);
assert.equal(ag.escuchar({ source: 'ai', role: 'agent', message: '¿Lo amenazaron?' }), false, 'lo que dice el agente no cuenta');
assert.equal(ag.escuchar({ source: 'user', role: 'user', message: 'La EPS no me da la cita' }), false);
assert.equal(ag.escuchar({ source: 'user', role: 'user', message: 'Unos armados me amenazaron por reclamar la tierra' }), true);
assert.equal(riesgos, 2);
assert.equal(ag.escuchar({ source: 'user', message: 'me quieren matar' }), false, 'ya estaba activo: no se repite');
assert.equal((await ag.herramientas.contar_al_asistente({ texto: 'hola' })).ok, false);
// si la persona menciona peligro mientras el asistente responde, la respuesta no llega al agente
ag = crearAgente(() => app);
siguiente = { accion: 'preguntar', mensaje: '¿Desde cuándo?' };
antesDeResponder = () => ag.escuchar({ role: 'user', message: 'y me van a matar' });
assert.equal((await ag.herramientas.contar_al_asistente({ texto: 'la tierra' })).ok, false);
assert.equal(resumen({ accion: 'riesgo', mensaje: 'x' }).accion, 'riesgo');
// contexto inicial: sin el relato de la persona y filtrado
const ctx = contexto([{ rol: 'persona', texto: 'Mi vecino Pedro me debe plata' }, { rol: 'asistente', texto: '¿Desde cuándo? Escribe al 3001234567' }], { accion: 'preguntar', opciones: ['Hace un mes'] });
assert.doesNotMatch(ctx, /Pedro|3001234567/);
assert.match(ctx, /Desde cuándo.*\[teléfono\].*Hace un mes/);
assert.match(contexto([], null), /todavía no ha contado/);

// ---------- 5. Lectura en voz alta de textos fijos (GET /api/elevenlabs-sesion?lectura=…) ----------
const { textoLectura, clavesDerecho, huella, urlLectura, lecturaCuadro, LECTURA_DERECHOS } = await import('@miderecho/nucleo/lectura');
const { DERECHOS_INFO, derechoInfo } = await import('@miderecho/nucleo/derechos');
// solo claves cerradas: todo lo que la app pide existe; nada más
for (const d of DERECHOS_INFO) for (const c of clavesDerecho(d)) assert.ok(textoLectura(c), c);
assert.equal(textoLectura('derechos'), LECTURA_DERECHOS);
assert.equal(textoLectura('derecho.salud.cuadro.1'), lecturaCuadro(derechoInfo('salud').cuadros[0], 1));
for (const c of ['hola mundo', 'derecho.salud', 'derecho.salud.cuadro.9', 'derecho.salud.cuadro.1.x', 'derecho.__proto__.titulo', 'derecho.salud.titulo.1', 'derecho.salud.resumen', 'derecho.servicios.cuadro.1', '', undefined])
  assert.equal(textoLectura(c), null, `clave ${c}`);
assert.equal(huella('abc'), huella('abc'));
assert.notEqual(huella('abc'), huella('abd'));
const tts = [];
globalThis.fetch = async (url, op) => {
  if (url === 'https://kv.test/pipeline') return new Response(JSON.stringify(JSON.parse(op.body).map(c => ({ result: redis(c) }))));
  tts.push({ url, op });
  return new Response(new Uint8Array([0x49, 0x44, 0x33, 1, 2, 3]), { status: 200, headers: { 'content-type': 'audio/mpeg' } });
};
const leer = (clave, cambios = {}) => llamar(sesion, { method: 'GET', query: { lectura: clave, v: huella(textoLectura(clave) ?? '') }, url: urlLectura(clave), headers: {}, ...cambios });
delete env.ELEVENLABS_API_KEY;
r = await leer('derecho.salud.cuadro.1');
assert.deepEqual([r.status, r.cabeceras['Cache-Control']], [503, 'no-store'], 'sin clave: el celular usa su voz');
env.ELEVENLABS_API_KEY = 'clave-de-prueba';
r = await leer('derecho.salud.cuadro.1');
assert.equal(r.status, 200, r.error);
assert.equal(r.cabeceras['Content-Type'], 'audio/mpeg');
assert.equal(r.cabeceras['Cache-Control'], 'public, max-age=31536000, s-maxage=31536000, immutable');
assert.equal(r.cuerpo.length, 6);
assert.match(tts.at(-1).url, /text-to-speech\/SmgKjOvC1aIujLWcMzqq\?output_format=mp3_22050_32$/);
assert.equal(tts.at(-1).op.headers['xi-api-key'], 'clave-de-prueba');
assert.deepEqual(JSON.parse(tts.at(-1).op.body), { text: textoLectura('derecho.salud.cuadro.1'), model_id: 'eleven_flash_v2_5', language_code: 'es' });
const generados = tts.length;
assert.equal((await leer('texto libre que alguien quiere oír')).status, 404, 'nunca texto libre');
assert.equal((await leer('derecho.salud.cuadro.1', { url: urlLectura('derecho.salud.cuadro.1') + '&x=1' })).status, 409, 'otra URL esquivaría la caché');
assert.equal((await leer('derecho.salud.cuadro.1', { url: `/api/elevenlabs-sesion?v=${huella(textoLectura('derecho.salud.cuadro.1'))}&lectura=derecho.salud.cuadro.1` })).status, 409, 'otro orden');
assert.equal((await leer('derecho.salud.cuadro.1', { url: '/api/elevenlabs-sesion?lectura=derecho.salud.cuadro.1&v=viejo' })).status, 409, 'texto cambiado');
assert.equal((await leer('derecho.salud.cuadro.1', { method: 'POST' })).status, 405);
assert.equal(tts.length, generados, 'nada de eso gastó créditos');
globalThis.fetch = async (url, op) => url === 'https://kv.test/pipeline' ? new Response(JSON.stringify(JSON.parse(op.body).map(c => ({ result: redis(c) })))) : new Response('{"detail":"quota"}', { status: 401 });
r = await leer('derechos');
assert.deepEqual([r.status, r.cabeceras['Cache-Control']], [502, 'no-store'], 'sin créditos: no se guarda el error');

// lib/voz.js en el celular: cola de audios, vuelta a la voz del sistema y "parar" (con Audio, fetch y voz simulados)
const dichos = [], pedidos = [];
let falla = null;
globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
globalThis.window = { speechSynthesis: { cancel() {}, getVoices: () => [], addEventListener() {}, speak(u) { dichos.push(u.text); setTimeout(() => u.onend?.(), 0); } } };
globalThis.URL.createObjectURL = () => 'blob:x';
globalThis.URL.revokeObjectURL = () => {};
globalThis.Audio = class { pause() { this.pausado = true; } play() { setTimeout(() => !this.pausado && this.onended?.(), 0); return Promise.resolve(); } };
globalThis.fetch = async url => { pedidos.push(url); return url.includes(falla) ? new Response('', { status: 502 }) : new Response(new Blob(['mp3'])); };
const { leerAudios, callar } = await import('../../apps/web/src/lib/voz.js');
const espera = () => new Promise(r => setTimeout(r, 20));
const claves = clavesDerecho(derechoInfo('salud'));
let terminados = 0;
leerAudios(claves, 'texto completo', () => terminados++);
await espera();
assert.deepEqual(pedidos, claves.map(urlLectura), 'todos en orden, con su URL canónica');
assert.deepEqual([terminados, dichos.length], [1, 0], 'una sola vez y sin la voz del sistema');
pedidos.length = 0; falla = 'cuadro.2';
leerAudios(claves, 'texto completo', () => terminados++);
await espera();
assert.deepEqual([pedidos.length, dichos, terminados], [3, ['texto completo'], 2], 'si un audio falla, la voz del celular lee el texto');
pedidos.length = 0; falla = null;
globalThis.Audio.prototype.play = function () { return Promise.resolve(); };   // suena hasta que lo paren
leerAudios(claves, 'texto completo', () => terminados++);
await espera();
callar();
await espera();
assert.deepEqual([pedidos.length, terminados], [1, 3], 'parar corta la cola y avisa a su botón');
delete globalThis.window;

// ---------- 6. Los logs no llevan números, códigos ni textos de los avisos ----------
const codigos = [codigoA, codigoC].join('|');
assert.ok(!logs.some(l => new RegExp(`\\d{7}|K7P2|${codigos}|documento|plazo vence|quedo listo|Chaparral|cita|amenaz|Cuadro|Ana |derechos`, 'i').test(l)), logs.join('\n'));
mostrar(`✓ _test-agente-avisos: todo bien (${salidas.length} envíos a Twilio falso, ${logs.length} líneas de log revisadas)`);
