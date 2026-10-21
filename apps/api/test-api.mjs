// Prueba de la API en modo simulado (sin clave) y con Gemini simulado por un fetch falso. Correr: npm test -w apps/api
// Ninguna prueba sale a internet ni usa claves reales.
import assert from 'node:assert/strict';
for (const k of ['ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'GEMINI_ENDPOINT', 'GEMINI_PLAN']) delete process.env[k];
const { app } = await import('./src/app.js');

// La query (?gemini) carga otra instancia de app.js que vuelve a leer las variables de entorno.
// extra: campos que se agregan a cada POST (el consentimiento que manda la app).
const abrir = (a, extra = {}) => {
  const srv = a.listen(0), base = `http://127.0.0.1:${srv.address().port}`;
  const post = (ruta, body) => fetch(base + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...extra, ...body }) }).then(async r => ({ status: r.status, body: await r.json() }));
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
  assert.equal(r.body.aviso, undefined); // sin IA no hace falta consentimiento

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

// ---------- Gemini (y Claude) con fetch falso ----------
const fetchReal = globalThis.fetch;
let responder, pedido, pedidos = 0;
globalThis.fetch = (url, op) => {
  if (!/googleapis\.com|anthropic\.com/.test(String(url))) return fetchReal(url, op);
  pedidos++;
  pedido = { url: String(url), headers: op.headers, body: JSON.parse(op.body), signal: op.signal };
  return responder(op);
};
const json = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });
const llamada = args => json({ candidates: [{ finishReason: 'STOP', content: { role: 'model', parts: [{ functionCall: { name: 'responder', args } }] } }] });
const ORIENTA = {
  accion: 'orientar', mensaje: 'Entiendo: te cobran de más en el agua.',
  orientacion: { tema: 'Cobro injusto en la factura', resumen: 'Te cobran más de lo que gastas.', derecho: 'vivienda', dicho_de_otra_forma: 'Puedes reclamar.', documento: 'servicios_publicos', pasos: ['Busca la factura.', 'Presenta el reclamo.'], datos: { servicio: 'acueducto', motivo: 'cobro' } },
};
const valida = () => llamada(ORIENTA);
const relato = { rol: 'persona', texto: 'Me llegó la factura del agua carísima, mi cédula es 1.144.555.666' };
const errores = [], avisos = [], consola = { error: console.error, warn: console.warn };
console.error = (...a) => errores.push(a.join(' '));
console.warn = (...a) => avisos.push(a.join(' '));
let r;

// Con clave pero sin GEMINI_PLAN, Gemini no se usa
process.env.GEMINI_API_KEY = ' clave-de-prueba\n';   // con espacios, como al pegarla en Vercel
const sinPlan = abrir((await import('./src/app.js?sinplan')).app);
try {
  const s = await sinPlan.salud();
  assert.equal(s.ia, 'simulada');
  assert.match(s.aviso, /falta GEMINI_PLAN/);
  responder = valida;
  assert.equal((await sinPlan.post('/api/asistente', { mensajes: [relato] })).body.fuente, 'simulada');
  assert.equal(pedidos, 0);
} finally {
  sinPlan.srv.close();
}

process.env.GEMINI_PLAN = ' Pago ';
const appGemini = (await import('./src/app.js?gemini')).app;
const g = abrir(appGemini, { consentimiento: 'ia-v1' });
const sinConsentimiento = abrir(appGemini);
try {
  // Sin consentimiento válido no se llama a la IA: modo básico con aviso. El riesgo por reglas sigue.
  responder = valida;
  pedidos = 0;
  for (const consentimiento of [undefined, '', 'si', 'ia-v', 'ia-v1234', 'IA-V1', 'ia-v1 ', 1, ['ia-v1']]) {
    r = await sinConsentimiento.post('/api/asistente', { mensajes: [relato], consentimiento });
    assert.equal(r.body.fuente, 'simulada', String(consentimiento));
    assert.equal(r.body.accion, 'orientar');
    assert.equal(r.body.aviso, 'Para usar la inteligencia artificial primero debe aceptar el aviso.');
  }
  r = await sinConsentimiento.post('/api/asistente', { mensajes: [{ rol: 'persona', texto: 'un grupo armado me amenazó' }] });
  assert.equal(r.body.fuente, 'reglas');
  assert.equal(pedidos, 0);

  assert.deepEqual(await g.salud(), { ok: true, ia: 'gemini', modelo: 'gemini-3.8-flash', plan: 'pago' });
  assert.ok(!JSON.stringify(await g.salud()).includes('clave-de-prueba'));

  // Respuesta válida: mismo formato que con Claude, con la ley fija y sin aviso de prueba (plan de pago)
  responder = valida;
  r = await g.post('/api/asistente', { mensajes: [{ rol: 'asistente', texto: 'Hola, cuéntame.' }, relato] });
  assert.equal(r.body.fuente, 'gemini');
  assert.equal(r.body.accion, 'orientar');
  assert.equal(r.body.orientacion.documento, 'servicios_publicos');
  assert.match(r.body.orientacion.ley.texto, /Ley 142 de 1994/);
  assert.equal(r.body.aviso, undefined);
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

  // La salida se valida contra el esquema: fuera claves desconocidas y valores fuera del catálogo, listas solo de textos,
  // textos recortados. La IA no puede cambiar la ley fija ni el aviso legal.
  responder = () => llamada({ ...ORIENTA, extra: 'x', opciones: ['a', 5, 'b', 'c', 'd'], orientacion: { ...ORIENTA.orientacion,
    ley: { texto: 'Ley inventada' }, aviso: 'Te garantizo que ganas.', pasos: ['Paso uno.', { x: 1 }, 'x'.repeat(5000)],
    donde_acudir: 'Personería', datos: { servicio: 'internet', motivo: 'cobro', urgente: 'sí' } } });
  r = await g.post('/api/asistente', { mensajes: [relato] });
  assert.equal(r.body.fuente, 'gemini');
  assert.equal(r.body.extra, undefined);
  assert.deepEqual(r.body.opciones, ['a', 'b', 'c']);
  assert.match(r.body.orientacion.ley.texto, /Ley 142 de 1994/);
  assert.equal(r.body.orientacion.aviso, 'Esto es información general, no consejo de abogado.');
  assert.deepEqual(r.body.orientacion.pasos.map(p => p.length), [9, 600]);
  assert.equal(r.body.orientacion.donde_acudir, undefined);
  assert.deepEqual(r.body.orientacion.datos, { motivo: 'cobro' });

  // Fuera del contrato → modo básico con aviso (antes, "orientar" sin orientación dejaba la pantalla en blanco)
  for (const [caso, args] of [
    ['orientar sin orientación', { accion: 'orientar', mensaje: 'Listo.' }],
    ['acción desconocida', { accion: 'demandar', mensaje: 'Demanda ya.' }],
    ['documento fuera del catálogo', { ...ORIENTA, orientacion: { ...ORIENTA.orientacion, documento: 'contrato_laboral' } }],
    ['pasos que no son textos', { ...ORIENTA, orientacion: { ...ORIENTA.orientacion, pasos: [1, 2, 3] } }],
    ['sin mensaje', { accion: 'preguntar', opciones: ['Sí'] }],
  ]) {
    responder = () => llamada(args);
    r = await g.post('/api/asistente', { mensajes: [relato] });
    assert.equal(r.body.fuente, 'simulada', caso);
    assert.equal(r.body.accion, 'orientar', caso);
    assert.match(r.body.aviso, /modo básico/, caso);
  }

  // Bloqueo de seguridad de Google → protocolo de riesgo con la ayuda fija, no el modo básico genérico
  for (const bloqueo of [{ promptFeedback: { blockReason: 'SAFETY' } }, { candidates: [{ finishReason: 'PROHIBITED_CONTENT' }] }]) {
    responder = () => json(bloqueo);
    r = await g.post('/api/asistente', { mensajes: [relato] });
    assert.equal(r.body.accion, 'riesgo');
    assert.equal(r.body.riesgo, true);
    assert.match(r.body.ayuda, /123/);
  }
  assert.equal(avisos.length, 2);

  // Riesgo por reglas (también las palabras nuevas): corta sin llamar a Gemini
  pedidos = 0;
  for (const texto of ['reclamé y ahora un grupo armado me amenazó', 'mi padrastro me violó', 'me quieren quitar la vida']) {
    r = await g.post('/api/asistente', { mensajes: [{ rol: 'persona', texto }] });
    assert.equal(r.body.fuente, 'reglas', texto);
  }
  assert.equal(pedidos, 0);

  // Fallas → modo básico: otro bloqueo, 429 (cuota) y tiempo agotado
  const timeout = AbortSignal.timeout;
  AbortSignal.timeout = () => timeout.call(AbortSignal, 20); // acorta los 20 s solo en la prueba
  for (const [caso, falla] of [
    ['bloqueo por otra razón', () => json({ candidates: [{ finishReason: 'RECITATION' }] })],
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
  assert.equal(errores.length, 8);
  assert.match(errores.join('\n'), /contrato[\s\S]*RECITATION[\s\S]*429[\s\S]*timeout/);
  assert.ok(![...errores, ...avisos].join(' ').includes('factura'));
} finally {
  g.srv.close();
  sinConsentimiento.srv.close();
}

// Plan gratis + Vertex: toda respuesta lleva el aviso de prueba; otro dominio, la clave también va en cabecera
process.env.GEMINI_PLAN = 'gratis';
process.env.GEMINI_ENDPOINT = ' Vertex';
const v = abrir((await import('./src/app.js?vertex')).app, { consentimiento: 'ia-v12' });
try {
  assert.equal((await v.salud()).plan, 'gratis');
  responder = valida;
  r = await v.post('/api/asistente', { mensajes: [relato] });
  assert.equal(r.body.fuente, 'gemini');
  assert.equal(r.body.aviso, 'Modo de prueba: este asistente usa una versión gratuita de Gemini y Google puede usar lo que escriba para mejorar sus productos. No escriba datos reales de salud, nombres ni cédulas.');
  assert.equal(pedido.url, 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.8-flash:generateContent');
  assert.equal(pedido.headers['x-goog-api-key'], 'clave-de-prueba');
  responder = () => json({}, 503);
  r = await v.post('/api/asistente', { mensajes: [relato] });
  assert.match(r.body.aviso, /^La IA no respondió; se usó el modo básico\. Modo de prueba:/);
  r = await v.post('/api/asistente', { mensajes: [{ rol: 'persona', texto: 'un grupo armado me amenazó' }] });
  assert.match(r.body.aviso, /^Modo de prueba:/);
} finally {
  v.srv.close();
}

// Claude manda si hay las dos claves; sin reintentos: un 529 cae de una vez al modo básico
process.env.ANTHROPIC_API_KEY = 'clave-de-prueba';
const c = abrir((await import('./src/app.js?claude')).app, { consentimiento: 'ia-v1' });
try {
  assert.equal((await c.salud()).ia, 'claude');
  responder = () => json({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }, 529);
  pedidos = 0;
  r = await c.post('/api/asistente', { mensajes: [relato] });
  assert.equal(r.body.fuente, 'simulada');
  assert.equal(pedidos, 1);
  assert.match(pedido.url, /api\.anthropic\.com/);
} finally {
  c.srv.close();
  Object.assign(console, consola);
  globalThis.fetch = fetchReal;
}

console.log('api: ok');
