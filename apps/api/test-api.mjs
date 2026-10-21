// Prueba de la API en modo simulado (sin clave). Correr: npm test -w apps/api
import assert from 'node:assert/strict';
delete process.env.ANTHROPIC_API_KEY;
const { app } = await import('./src/app.js');

const srv = app.listen(0);
const base = `http://127.0.0.1:${srv.address().port}`;
const post = (ruta, body) => fetch(base + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async r => ({ status: r.status, body: await r.json() }));

try {
  const salud = await (await fetch(base + '/api/salud')).json();
  assert.equal(salud.ia, 'simulada');

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
  console.log('api: ok');
} finally {
  srv.close();
}
