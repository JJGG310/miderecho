// Prueba del guardado cifrado con la clave de 4 números. Correr: npm test -w apps/web
import assert from 'node:assert/strict';

const ls = new Map();
globalThis.localStorage = { getItem: k => ls.get(k) ?? null, setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) };
// Datos de la versión sin cifrar: deben pasar al cifrado al crear la clave.
ls.set('miderecho-v2', JSON.stringify({ casos: [{ id: 'viejo', entidad: 'Alcaldía de Chaparral' }], pref: { modoVoz: true } }));

const { almacen } = await import('./src/lib/almacen.js');
assert.equal(almacen.pref('modoVoz'), true, 'las preferencias se conservan');
assert.equal(almacen.hayClave(), false);

// Sin clave todavía: bloquear no borra lo que espera la clave.
almacen.guardarCaso({ id: 'antes', entidad: 'Personería' });
almacen.bloquear();
assert.equal(almacen.casos().length, 2, 'bloquear sin clave no descarta lo pendiente');

await almacen.crear('1234');
const manana = new Date(Date.now() + 864e5);
const venc = `${manana.getFullYear()}-${String(manana.getMonth() + 1).padStart(2, '0')}-${String(manana.getDate()).padStart(2, '0')}`;
almacen.guardarCaso({ id: 'a', entidad: 'EPS Sur', municipio: 'Tumaco', venc, estado: 'esperando' });
almacen.guardarOrientacion({ tema: 'La EPS niega la cita', derecho: 'salud', documento: 'tutela_salud', pasos: ['Pida la insulina'], buscar_abogado_si: 'Si es cáncer' });
await almacen.esperar();
const crudo = [...ls.values()].join(' ');
for (const s of ['EPS Sur', 'Tumaco', 'Chaparral', 'niega la cita', 'insulina']) assert.ok(!crudo.includes(s), `quedó sin cifrar: ${s}`);
assert.ok(almacen.plazoCerca(), 'la fecha límite queda sin cifrar para el aviso de Inicio');
assert.deepEqual(JSON.parse(localStorage.getItem('miderecho-v2-plazos')), [venc], 'solo la fecha, sin entidad ni tema');
assert.ok(!ls.has('miderecho-v2'), 'borra la copia sin cifrar');

almacen.bloquear();
assert.deepEqual(almacen.casos(), [], 'bloqueada no muestra casos');
await assert.rejects(almacen.abrir('0000'), 'clave errada');
assert.deepEqual(almacen.casos(), [], 'clave errada: sigue bloqueada');

// Lo que se guarda bloqueada queda en memoria y se une al abrir.
almacen.guardarCaso({ id: 'b', entidad: 'Alcaldía' });
await almacen.abrir('1234');
assert.deepEqual(almacen.casos().map(c => c.id).sort(), ['a', 'antes', 'b', 'viejo']);
assert.equal(almacen.historial().length, 1);
assert.equal(almacen.historial()[0].tema, 'Salud', 'guarda la categoría, no el título de la IA');
assert.ok(!('pasos' in almacen.historial()[0]) && !('buscar_abogado_si' in almacen.historial()[0]), 'no guarda texto libre de la IA');
await almacen.esperar();
almacen.bloquear();
await almacen.abrir('1234');
assert.equal(almacen.casos().length, 4, 'lo unido quedó cifrado');
assert.ok(almacen.plazoCerca(), 'bloqueada igual avisa que hay un plazo cerca');

almacen.borrarTodo();
await almacen.esperar();
assert.equal(ls.size, 0, 'Borrar todo no deja nada');
console.log('almacen: ok');
