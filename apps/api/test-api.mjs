// Prueba de la API en modo simulado (sin clave) y con Gemini simulado por un fetch falso. Correr: npm test -w apps/api
// Ninguna prueba sale a internet ni usa claves reales.
import assert from 'node:assert/strict';
for (const k of ['ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'GEMINI_ENDPOINT']) delete process.env[k];
const { app } = await import('./src/app.js');

// La query (?gemini) carga otra instancia de app.js que vuelve a leer las variables de entorno.
const abrir = a => {
  const srv = a.listen(0), base = `http://127.0.0.1:${srv.address().port}`;
  const post = (ruta, body) => fetch(base + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async r => ({ status: r.status, body: await r.json() }));
  return { srv, post, salud: () => fetch(base + '/api/salud').then(r => r.json()) };
};
const { srv, post, salud } = abrir(app);

try {
  assert.equal((await salud()).ia, 'simulada');

  // Servicios públicos: orienta, con la ley fija y el documento correcto
  let r = await post('/api/asistente', { mensajes: [{ rol: 'persona', texto: 'Me llegó la factura del agua carísima, me cobran el triple y no gasté eso' }] });
  assert.equal(r.body.accion, 'orientar');
  assert.equal(r.body.orientacion.documento, 'servicios_publicos');
  assert.match(r.body.orientacion.ley.texto, /Ley 142 de 1994/);
  assert.equal(r.body.orientacion.datos.servicio, 'acueducto');

  // Salud: pregunta si es urgente y luego orienta a tutela de salud
  const m1 = { rol: 'persona', texto: 'La EPS no me da la cita con el cardiólogo hace dos meses' };
  r = await post('/api/asistente', { mensajes: [m1] });
  assert.equal(r.body.accion, 'preguntar');
  assert.equal(r.body.opciones.length, 3);
  r = await post('/api/asistente', { mensajes: [m1, { rol: 'asistente', texto: r.body.mensaje }, { rol: 'persona', texto: 'Sí, es urgente' }] });
  assert.equal(r.body.orientacion.documento, 'tutela_salud');

  // Trabajo: ruta sin documento (no hacemos contratos laborales)
  r = await post('/api/asistente', { mensajes: [{ rol: 'persona', texto: 'el patrón de la finca no me ha pagado el jornal de tres semanas' }] });
  assert.equal(r.body.orientacion.documento, 'ninguno');

  // Riesgo: corta sin pasar por la IA
  r = await post('/api/asistente', { mensajes: [{ rol: 'persona', texto: 'reclamé y ahora un grupo armado me amenazó' }] });
  assert.equal(r.body.accion, 'riesgo');
  assert.equal(r.body.fuente, 'reglas');
  assert.match(r.body.ayuda, /123/);

  // Validaciones
  assert.equal((await post('/api/asistente', {})).status, 400);
  assert.equal((await post('/api/documento', { tipo: 'contrato' })).status, 400);

  // Documento y plazo
  r = await post('/api/documento', { tipo: 'peticion', datos: { temaId: 'agua', vereda: 'La Esperanza', municipio: 'Chaparral', entidad: 'Alcaldía de Chaparral', desde: 'hace un mes', peticiones: ['Reparar el acueducto.'], plazo: 15 } });
  assert.equal(r.status, 200);
  assert.match(r.body.html, /Derecho de petición/);
  r = await post('/api/plazo', { dias: 15, desde: '2026-10-21', hoy: '2026-10-21' });
  assert.equal(r.body.vence, '2026-11-12'); // el lunes 2 de noviembre es festivo
} finally {
  srv.close();
}

// ---------- Gemini con fetch falso ----------
const fetchReal = globalThis.fetch;
let responder, pedido;
globalThis.fetch = (url, op) => {
  if (!String(url).includes('googleapis.com')) return fetchReal(url, op);
  pedido = { url: String(url), headers: op.headers, body: JSON.parse(op.body), signal: op.signal };
  return responder(op);
};
const json = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
const valida = () => json({ candidates: [{ finishReason: 'STOP', content: { role: 'model', parts: [{ functionCall: { name: 'responder', args: {
  accion: 'orientar', mensaje: 'Entiendo: te cobran de más en el agua.',
  orientacion: { tema: 'Cobro injusto en la factura', resumen: 'Te cobran más de lo que gastas.', derecho: 'vivienda', dicho_de_otra_forma: 'Puedes reclamar.', documento: 'servicios_publicos', pasos: ['Busca la factura.', 'Presenta el reclamo.'], datos: { servicio: 'acueducto', motivo: 'cobro' } },
} } }] } }] });
const relato = { rol: 'persona', texto: 'Me llegó la factura del agua carísima, mi cédula es 1.144.555.666' };

process.env.GEMINI_API_KEY = 'clave-de-prueba';
const g = abrir((await import('./src/app.js?gemini')).app);
const errores = [], consolaError = console.error;
console.error = (...a) => errores.push(a.join(' '));
try {
  assert.deepEqual(await g.salud(), { ok: true, ia: 'gemini', modelo: 'gemini-3.8-flash' });
  assert.ok(!JSON.stringify(await g.salud()).includes('clave-de-prueba'));

  // Respuesta válida: mismo formato que con Claude, con la ley fija
  responder = valida;
  let r = await g.post('/api/asistente', { mensajes: [{ rol: 'asistente', texto: 'Hola, cuéntame.' }, relato] });
  assert.equal(r.body.fuente, 'gemini');
  assert.equal(r.body.accion, 'orientar');
  assert.equal(r.body.orientacion.documento, 'servicios_publicos');
  assert.match(r.body.orientacion.ley.texto, /Ley 142 de 1994/);
  // Pedido a AI Studio: clave en cabecera (no en la URL), herramienta obligatoria, sin la cédula
  assert.equal(pedido.url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
  assert.equal(pedido.headers['x-goog-api-key'], 'clave-de-prueba');
  assert.ok(pedido.signal instanceof AbortSignal);
  assert.match(pedido.body.systemInstruction.parts[0].text, /NO eres abogado/);
  assert.deepEqual(pedido.body.toolConfig.functionCallingConfig, { mode: 'ANY', allowedFunctionNames: ['responder'] });
  assert.equal(pedido.body.tools[0].functionDeclarations[0].parametersJsonSchema.required[0], 'accion');
  assert.deepEqual(pedido.body.contents.map(c => c.role), ['user']); // el saludo del asistente se descarta
  assert.match(pedido.body.contents[0].parts[0].text, /\[número\]/);
  assert.ok(!JSON.stringify(pedido.body).includes('1.144.555.666'));
  assert.ok(pedido.body.safetySettings.every(s => s.threshold === 'BLOCK_ONLY_HIGH'));

  // Riesgo: corta por reglas sin llamar a Gemini
  pedido = null;
  r = await g.post('/api/asistente', { mensajes: [{ rol: 'persona', texto: 'reclamé y ahora un grupo armado me amenazó' }] });
  assert.equal(r.body.fuente, 'reglas');
  assert.equal(pedido, null);

  // Fallas → modo básico: bloqueo de seguridad, 429 (cuota) y tiempo agotado
  const timeout = AbortSignal.timeout;
  AbortSignal.timeout = () => timeout.call(AbortSignal, 20); // acorta los 20 s solo en la prueba
  for (const [caso, falla] of [
    ['bloqueo', () => json({ promptFeedback: { blockReason: 'SAFETY' } })],
    ['bloqueo del candidato', () => json({ candidates: [{ finishReason: 'SAFETY' }] })],
    ['429', () => json({ error: { code: 429, status: 'RESOURCE_EXHAUSTED' } }, 429)],
    ['tiempo agotado', op => new Promise((_, no) => op.signal.addEventListener('abort', () => no(op.signal.reason)))],
  ]) {
    responder = falla;
    r = await g.post('/api/asistente', { mensajes: [relato] });
    assert.equal(r.body.fuente, 'simulada', caso);
    assert.equal(r.body.accion, 'orientar', caso);
    assert.match(r.body.aviso, /modo básico/, caso);
  }
  AbortSignal.timeout = timeout;
  // Los registros dicen qué falló, nunca lo que escribió la persona
  assert.equal(errores.length, 4);
  assert.match(errores.join('\n'), /SAFETY[\s\S]*429[\s\S]*timeout/);
  assert.ok(!errores.join(' ').includes('factura'));
} finally {
  g.srv.close();
}

// Vertex AI en modo express: otro dominio y la clave va en ?key=
process.env.GEMINI_ENDPOINT = 'vertex';
const v = abrir((await import('./src/app.js?vertex')).app);
try {
  responder = valida;
  const r = await v.post('/api/asistente', { mensajes: [relato] });
  assert.equal(r.body.fuente, 'gemini');
  assert.equal(pedido.url, 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.8-flash:generateContent?key=clave-de-prueba');
  assert.equal(pedido.headers['x-goog-api-key'], undefined);
} finally {
  v.srv.close();
  console.error = consolaError;
  globalThis.fetch = fetchReal;
}

console.log('api: ok');
