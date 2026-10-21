import assert from 'node:assert/strict';
import { limpiar, hayRiesgo } from './src/privacidad.js';

assert.equal(limpiar('mi cédula es 1.144.123.456').texto, 'mi cédula es [número]');
assert.equal(limpiar('cédula 1144123456').texto, 'cédula [número]');
assert.equal(limpiar('llámeme al 312 456 7890').texto, 'llámeme al [teléfono]');
assert.equal(limpiar('o al +57 3124567890').texto, 'o al [teléfono]');
assert.equal(limpiar('escríbame a juan.perez@gmail.com').texto, 'escríbame a [correo]');
assert.equal(limpiar('desde hace 3 meses, factura de 45.000').texto, 'desde hace 3 meses, factura de 45.000');
assert.equal(limpiar('el 15 de marzo de 2026').cambios, 0);

assert.ok(hayRiesgo('me amenazaron por reclamar la tierra'));
assert.ok(hayRiesgo('un grupo armado nos sacó'));
assert.ok(!hayRiesgo('no me han dado la cita con el especialista'));
for (const t of ['mi padrastro me violó', 'me violaron cuando era niña', 'denunciar una violacion', 'me violo y nadie hizo nada',
  'me quieren quitar la vida', 'le quitaron la vida a mi hermano', 'pienso en quitarme la vida', 'mi esposo me maltrata', 'sufro maltrato en la casa'])
  assert.ok(hayRiesgo(t), t);
for (const t of ['la EPS violó mi derecho a la salud', 'me violaron mis derechos', 'hubo una violación de mis derechos fundamentales',
  'es una violación al debido proceso', 'violaciones de derechos', 'toco el violonchelo', 'la vida en la vereda está dura',
  'me quitaron la ayuda de la vida diaria', 'la factura del agua me cobra el triple', 'el patrón no me paga el jornal'])
  assert.ok(!hayRiesgo(t), t);
console.log('privacidad: ok');
