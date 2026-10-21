// Pruebas de avisos con plantillas (sms.js, whatsapp.js), herramientas del agente telefónico (_herramientas.js) y
// herramientas de cliente del agente de voz de la v2 (apps/web/src/lib/agenteVoz.js). Sin cuentas reales:
//   node prototipo/api/_test-agente-avisos.mjs
// El guion bajo evita que Vercel publique este archivo.
import assert from 'node:assert/strict';

for (const k of Object.keys(process.env))
  if (/^(TWILIO_|KV_|UPSTASH_|NUMEROS_DEMO|CLAVE_CIFRADO|LIMITE_DIARIO|PERMITIR_ENVIO_ABIERTO|AGENTE_HERRAMIENTAS_SECRETO|ELEVENLABS_)/.test(k)) delete process.env[k];
const env = process.env, mostrar = console.log, logs = [];
console.log = console.error = console.warn = (...a) => logs.push(a.join(' '));

const { septetos, gsm, kv, descifrar, POR_NUMERO_DIA } = await import('./_comun.js');
const { PLANTILLAS, armarAviso } = await import('./_avisos.js');
const { default: sesion } = await import('./elevenlabs-sesion.js');
const { sumarHabiles, deIso, iso } = await import('@miderecho/nucleo');
const { crearHerramientas, resumen, contexto } = await import('../../apps/web/src/lib/agenteVoz.js');

async function llamar(handler, { method = 'POST', body, query, headers = {}, ip = '10.0.0.1' }) {
  const r = {};
  await handler({ method, body, query, headers: { 'x-real-ip': ip, host: 'miderecho.test', 'content-type': 'application/json', ...headers } },
    { setHeader() {}, status(s) { r.status = s; return this; }, json(j) { Object.assign(r, j); return this; } });
  return r;
}
const api = async (ruta, body, op = {}) => llamar((await import(`./${ruta}.js`)).default, { body, ...op });
const aviso = (canal, plantilla, datos, telefono = '300 111 2233', extra = {}) => api(canal, { plantilla, telefono, datos, ...extra });
const SECRETO = 'x'.repeat(40);
const herr = (nombre, body, secreto = SECRETO, method = 'POST') =>
  llamar(sesion, { method, body, query: { herramienta: nombre }, headers: secreto ? { 'x-miderecho-secreto': secreto } : {} });
let r;

// ---------- 1. Avisos con plantillas cerradas (modo simulado) ----------
r = await aviso('sms', 'documento_listo', { codigo: 'K7P2' });
assert.deepEqual([r.status, r.ok, r.simulado], [200, true, true]);
assert.equal((await aviso('whatsapp', 'plazo', { codigo: 'K7P2', fecha: '2026-11-30' })).status, 200);
assert.equal((await aviso('sms', 'llamada_agendada', { fecha: '2026-10-22', hora: '09:30' })).status, 200);

// plantilla desconocida (también nombres heredados de Object) y texto libre por cualquier camino
for (const p of ['libre', 'texto', '__proto__', 'constructor', 'toString', undefined])
  assert.equal((await aviso('sms', p, { codigo: 'K7P2' })).status, 400, `plantilla ${p}`);
assert.equal((await api('sms', { telefono: '3001112233', texto: 'Hola, su tutela contra la EPS…' })).status, 400, 'interfaz vieja con texto');
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' }, undefined, { texto: 'x' })).status, 400, 'clave extra');
assert.equal((await aviso('whatsapp', 'documento_listo', { codigo: 'K7P2' }, undefined, { pdfUrl: 'https://miderecho.test/a.pdf' })).status, 400);
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2', nombre: 'Ana' })).status, 400, 'dato extra');
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'su tutela' })).status, 400, 'texto en el código');
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'k7p2' })).status, 400);
assert.equal((await aviso('sms', 'documento_listo', {})).status, 400);
assert.equal((await aviso('sms', 'documento_listo', ['K7P2'])).status, 400);
assert.equal((await aviso('sms', 'plazo', { codigo: 'K7P2', fecha: '2026-02-30' })).status, 400, 'fecha que no existe');
assert.equal((await aviso('sms', 'plazo', { codigo: 'K7P2', fecha: '30-nov' })).status, 400);
assert.equal((await aviso('sms', 'llamada_agendada', { fecha: '2026-10-22', hora: '25:00' })).status, 400);
for (const tel of ['12345', '+1 415 555 0100', '601 234 5678', '', null])
  assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' }, tel)).status, 400, `número ${tel}`);
// solo JSON y solo desde la propia app (protecciones de _comun.js)
assert.equal((await api('sms', { plantilla: 'documento_listo', telefono: '3001112233', datos: { codigo: 'K7P2' } }, { headers: { 'content-type': 'text/plain' } })).status, 415);
assert.equal((await api('whatsapp', { plantilla: 'documento_listo', telefono: '3001112233', datos: { codigo: 'K7P2' } }, { headers: { origin: 'https://malo.example' } })).status, 403);
assert.equal((await api('sms', undefined, { method: 'GET' })).status, 405);

// los textos caben en un SMS, son GSM-7 puro y no llevan nada del caso
const ejemplos = { documento_listo: { codigo: 'ABCDEFGHJKLM' }, plazo: { codigo: 'ABCDEFGHJKLM', fecha: '2026-12-31' }, llamada_agendada: { fecha: '2026-12-31', hora: '23:30' } };
for (const [p, datos] of Object.entries(ejemplos)) {
  const { texto } = armarAviso({ plantilla: p, telefono: '3001112233', datos });
  assert.ok(septetos(texto) <= 160 && gsm(texto) === texto, texto);
  assert.doesNotMatch(texto, /tutela|petici|eps|salud|tierra|nombre|c[eé]dula|MiDerecho/i, texto);
}
assert.equal(armarAviso({ plantilla: 'plazo', telefono: '3001112233', datos: ejemplos.plazo }).texto, 'Caso ABCDEFGHJKLM: el plazo vence el 31-dic. Si la entidad no le ha respondido, avise a su lider.');
assert.match(armarAviso({ plantilla: 'llamada_agendada', telefono: '3001112233', datos: { fecha: '2026-10-22', hora: '14:05' } }).texto, /^A las 2:05 p\. m\. del 22-oct le llamaremos\. Si/);
assert.deepEqual(Object.keys(PLANTILLAS), ['documento_listo', 'plazo', 'llamada_agendada']);

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
assert.equal((await llamar(sesion, { body: {}, headers: { origin: 'https://miderecho.test', 'sec-fetch-site': 'same-origin' } })).status, 503);

// orientar: valores cerrados, frases y ley fijas
r = await herr('orientar', { documento: 'servicios_publicos' });
assert.deepEqual([r.status, r.documento, r.plazo_dias_habiles], [200, 'servicios_publicos', 15]);
assert.match(r.ley, /Ley 142 de 1994/);
assert.match(r.frase, /reclamo a la empresa/);
assert.equal(r.aviso, 'Esto es información general, no consejo de abogado.');
assert.equal((await herr('orientar', { documento: 'tutela_salud' })).documento, 'peticion', 'sin urgencia, petición a la EPS');
assert.equal((await herr('orientar', { documento: 'tutela_salud', urgente: true })).documento, 'tutela_salud');
assert.equal((await herr('orientar', { documento: 'ninguno', derecho: 'trabajo' })).titulo, null);
assert.equal((await herr('orientar', { documento: 'contrato' })).status, 400);

// documento: listas cerradas, código, variables cifradas por 72 h y nada personal
r = await herr('documento', { tipo: 'peticion', temaId: 'agua', municipio: 'chaparral', desde: 'hace tres meses' });
assert.equal(r.status, 200, r.error);
assert.match(r.codigo, /^[A-HJ-NP-Z2-9]{4}$/);
assert.equal(r.deletreado, r.codigo.split('').join(', '));
assert.deepEqual(r.pide, ['Reparar y restablecer el servicio de agua de la vereda.']);
assert.equal(r.para, 'Alcaldía de Chaparral');
const [guardado] = await kv(['GET', 'doc:' + (await import('./_comun.js')).hmac('doc:' + r.codigo)]);
assert.ok(guardado && !guardado.includes('Chaparral'), 'cifrado');
assert.equal(JSON.parse(descifrar(guardado)).temaId, 'agua');
for (const d of [{ tipo: 'servicios_publicos', servicio: 'energia', motivo: 'cobro', municipio: 'Ovejas' },
  { tipo: 'tutela_salud', que: 'medicamento', urgente: true, municipio: 'Planadas' },
  { tipo: 'tutela', derecho: 'minimo_vital', municipio: 'Puerto Rico (Meta)' }])
  assert.equal((r = await herr('documento', d)).status, 200, `${d.tipo}: ${r.error}`);
for (const d of [{ tipo: 'peticion', temaId: 'otro', municipio: 'Ovejas' }, { tipo: 'peticion', temaId: 'agua', municipio: 'Calle 5 # 10-20' },
  { tipo: 'peticion', temaId: 'agua', municipio: 'Ovejas', desde: 'ayer' }, { tipo: 'contrato_laboral', municipio: 'Ovejas' }, { tipo: 'peticion', temaId: 'agua' }])
  assert.equal((await herr('documento', d)).status, 400, JSON.stringify(d));

// plazo: días hábiles con festivos del núcleo
r = await herr('plazo', { tipo: 'peticion', desde: '2026-10-21' });
assert.deepEqual([r.status, r.dias_habiles, r.vence], [200, 15, iso(sumarHabiles(deIso('2026-10-21'), 15))]);
assert.match(r.vence_en_palabras, /de noviembre/);
assert.equal((await herr('plazo', { tipo: 'peticion', desde: '2026-02-30' })).status, 400);
assert.equal((await herr('plazo', { tipo: 'tutela' })).status, 200, 'sin fecha: desde hoy');

// aviso: solo las dos plantillas del agente, sin texto libre, al número que pone ElevenLabs
r = await herr('aviso', { canal: 'sms', plantilla: 'documento_listo', telefono: '+573001112233', codigo: 'K7P2' });
assert.deepEqual([r.status, r.simulado], [200, true]);
assert.equal((await herr('aviso', { canal: 'whatsapp', plantilla: 'plazo', telefono: '+573001112233', codigo: 'K7P2', fecha: '2026-11-30' })).status, 200);
assert.equal((await herr('aviso', { canal: 'sms', plantilla: 'llamada_agendada', telefono: '3001112233', fecha: '2026-10-22' })).status, 400);
assert.equal((await herr('aviso', { canal: 'sms', plantilla: 'documento_listo', telefono: '3001112233', codigo: 'K7P2', texto: 'hola' })).status, 400);
assert.equal((await herr('aviso', { canal: 'llamada', plantilla: 'documento_listo', telefono: '3001112233', codigo: 'K7P2' })).status, 400);

// ---------- 3. Envío real con Twilio falso: falla cerrada, lista blanca, plantilla de WhatsApp y límites ----------
const salidas = [];
globalThis.fetch = async (url, { body }) => {
  assert.match(url, /^https:\/\/api\.twilio\.com\//);
  salidas.push(Object.fromEntries(body));
  return new Response('{"sid":"SM1"}', { status: 201 });
};
Object.assign(env, { TWILIO_ACCOUNT_SID: 'ACprueba', TWILIO_AUTH_TOKEN: 'token', TWILIO_FROM: '+15005550006', TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886' });
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' })).status, 503, 'sin NUMEROS_DEMO: cerrado');
assert.equal((await herr('aviso', { canal: 'sms', plantilla: 'documento_listo', telefono: '3001112233', codigo: 'K7P2' })).status, 503, 'el agente tampoco abre');
env.NUMEROS_DEMO = '3001112233';
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' }, '3209998877')).status, 403, 'fuera de la lista');
r = await aviso('sms', 'documento_listo', { codigo: 'K7P2' });
assert.deepEqual([r.ok, r.simulado], [true, false]);
assert.deepEqual(salidas.at(-1), { To: '+573001112233', From: '+15005550006', Body: PLANTILLAS.documento_listo.texto({ codigo: 'K7P2' }) });
await aviso('whatsapp', 'plazo', { codigo: 'K7P2', fecha: '2026-11-30' });
assert.equal(salidas.at(-1).Body, 'Caso K7P2: el plazo vence el 30-nov. Si la entidad no le ha respondido, avise a su lider.', 'sin plantilla aprobada: texto (sandbox)');
env.TWILIO_WA_PLAZO = 'HXplazo';
await aviso('whatsapp', 'plazo', { codigo: 'K7P2', fecha: '2026-11-30' });
assert.deepEqual(salidas.at(-1), { To: 'whatsapp:+573001112233', From: 'whatsapp:+14155238886', ContentSid: 'HXplazo', ContentVariables: '{"1":"K7P2","2":"30-nov"}' });
for (let i = 3; i < POR_NUMERO_DIA; i++) assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' })).status, 200);
assert.equal((await aviso('sms', 'documento_listo', { codigo: 'K7P2' })).status, 429, 'tope por número');

// ---------- 4. Herramientas de cliente del agente de voz (v2) ----------
const llamadas = [];
let siguiente = { accion: 'preguntar', mensaje: '¿Es urgente? Llámame al 3001234567', opciones: ['Sí, es urgente', 'No'] };
let riesgos = 0;
const app = { responder: async t => { llamadas.push(t); return siguiente; }, marcarRiesgo: () => riesgos++ };
let h = crearHerramientas(() => app);
assert.deepEqual(Object.keys(h), ['contar_al_asistente', 'activar_protocolo_riesgo'], 'solo dos acciones: nada de aceptar, borrar, enviar ni cerrar');
assert.ok(Object.isFrozen(h));
r = await h.contar_al_asistente({ texto: 'La EPS no me da la cita, mi cédula es 1.144.555.666 y mi correo ana@correo.co' });
assert.equal(llamadas.at(-1), 'La EPS no me da la cita, mi cédula es [número] y mi correo [correo]', 'filtro antes del asistente');
assert.equal(r.mensaje, '¿Es urgente? Llámame al [teléfono]', 'filtro antes del agente');
assert.deepEqual(r.opciones, ['Sí, es urgente', 'No']);
assert.equal((await h.contar_al_asistente({ texto: '   ' })).ok, false);
siguiente = { accion: 'orientar', mensaje: 'Ya entiendo.', orientacion: { tema: 'Cita negada', documento: 'tutela_salud', documento_titulo: 'Tutela de salud', pasos: ['Guarda la orden'], resumen: 'secreto', ley: { texto: 'largo' } } };
r = await h.contar_al_asistente({ texto: 'Sí, es urgente' });
assert.deepEqual(r.orientacion, { tema: 'Cita negada', documento: 'tutela_salud', documento_titulo: 'Tutela de salud', pasos: ['Guarda la orden'], donde_acudir: [], aviso: undefined });
siguiente = null;
assert.equal((await h.contar_al_asistente({ texto: 'hola' })).ok, false, 'el asistente falló');
// riesgo desde el servidor: desde ahí no se manda nada más al asistente
siguiente = { accion: 'riesgo', mensaje: 'Lo que me cuentas es serio.' };
assert.equal((await h.contar_al_asistente({ texto: 'me amenazaron' })).accion, 'riesgo');
const antes = llamadas.length;
assert.equal((await h.contar_al_asistente({ texto: 'sigamos con el caso' })).ok, false);
assert.equal(llamadas.length, antes);
// riesgo desde el agente
h = crearHerramientas(() => app);
assert.equal(h.activar_protocolo_riesgo().ok, true);
assert.equal(riesgos, 1);
assert.equal((await h.contar_al_asistente({ texto: 'hola' })).ok, false);
assert.equal((await crearHerramientas(() => app, { riesgo: true }).contar_al_asistente({ texto: 'hola' })).ok, false, 'pantalla ya en riesgo');
assert.equal(resumen({ accion: 'riesgo', mensaje: 'x' }).accion, 'riesgo');
// contexto inicial: sin el relato de la persona y filtrado
const ctx = contexto([{ rol: 'persona', texto: 'Mi vecino Pedro me debe plata' }, { rol: 'asistente', texto: '¿Desde cuándo? Escribe al 3001234567' }], { accion: 'preguntar', opciones: ['Hace un mes'] });
assert.doesNotMatch(ctx, /Pedro|3001234567/);
assert.match(ctx, /Desde cuándo.*\[teléfono\].*Hace un mes/);
assert.match(contexto([], null), /todavía no ha contado/);

// ---------- 5. Los logs no llevan números, códigos ni textos de los avisos ----------
assert.ok(!logs.some(l => /\d{7}|K7P2|documento|plazo vence|quedo listo|Chaparral|cita/i.test(l)), logs.join('\n'));
mostrar(`✓ _test-agente-avisos: todo bien (${salidas.length} envíos a Twilio falso, ${logs.length} líneas de log revisadas)`);
