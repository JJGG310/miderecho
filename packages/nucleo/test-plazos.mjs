// Prueba: node prototipo/test-plazos.mjs
import assert from 'node:assert/strict';
import { festivos, sumarHabiles, habilesEntre, iso } from './src/plazos.js';

const f26 = festivos(2026);
assert.equal(f26.size, 18);
for (const d of ['2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-18', '2026-06-08',
  '2026-06-15', '2026-06-29', '2026-08-17', '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08']) assert.ok(f26.has(d), d);

// Ejemplo del informe 05: radicada el 9-nov-2026, 15 días hábiles -> 1-dic-2026
assert.equal(iso(sumarHabiles(new Date(2026, 10, 9), 15)), '2026-12-01');
// Cruce de año: salta 25-dic, 1-ene y Reyes trasladado al 11-ene-2027
assert.equal(iso(sumarHabiles(new Date(2026, 11, 15), 15)), '2027-01-07');
// Días que faltan
assert.equal(habilesEntre(new Date(2026, 10, 30), new Date(2026, 11, 1)), 1);
assert.equal(habilesEntre(new Date(2026, 11, 1), new Date(2026, 11, 1)), 0);

console.log('plazos ok');
