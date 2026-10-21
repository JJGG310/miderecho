// Prueba del guardado cifrado con la clave de 4 números. Correr: npm test -w apps/web
import assert from 'node:assert/strict';

const ls = new Map();
globalThis.localStorage = { getItem: k => ls.get(k) ?? null, setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) };
// Datos de la versión sin cifrar: deben pasar al cifrado al crear la clave.
ls.set('miderecho-v2', JSON.stringify({ casos: [{ id: 'viejo', entidad: 'Alcaldía de Chaparral' }], pref: { modoVoz: true } }));

const { almacen } = await import('./src/lib/almacen.js');
assert.equal(almacen.pref('modoVoz'), true, 'las preferencias se conservan');
assert.equal(almacen.hayClave(), false);

await almacen.crear('1234');
almacen.guardarCaso({ id: 'a', entidad: 'EPS Sur', municipio: 'Tumaco' });
almacen.guardarOrientacion({ tema: 'La EPS niega la cita' });
await almacen.esperar();
const crudo = [...ls.values()].join(' ');
for (const s of ['EPS Sur', 'Tumaco', 'Chaparral', 'niega la cita']) assert.ok(!crudo.includes(s), `quedó sin cifrar: ${s}`);
assert.ok(!ls.has('miderecho-v2'), 'borra la copia sin cifrar');

almacen.bloquear();
assert.deepEqual(almacen.casos(), [], 'bloqueada no muestra casos');
await assert.rejects(almacen.abrir('0000'), 'clave errada');
assert.deepEqual(almacen.casos(), [], 'clave errada: sigue bloqueada');

// Lo que se guarda bloqueada queda en memoria y se une al abrir.
almacen.guardarCaso({ id: 'b', entidad: 'Alcaldía' });
await almacen.abrir('1234');
assert.deepEqual(almacen.casos().map(c => c.id).sort(), ['a', 'b', 'viejo']);
assert.equal(almacen.historial().length, 1);
await almacen.esperar();
almacen.bloquear();
await almacen.abrir('1234');
assert.equal(almacen.casos().length, 3, 'lo unido quedó cifrado');

almacen.borrarTodo();
await almacen.esperar();
assert.equal(ls.size, 0, 'Borrar todo no deja nada');
console.log('almacen: ok');
