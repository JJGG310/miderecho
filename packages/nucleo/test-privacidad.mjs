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
console.log('privacidad: ok');
