// Pruebas de src/lib/avisos.js sin navegador: node apps/web/test-avisos.mjs
// Cola de cancelación (fuera de los casos, reintento al volver la señal), fechas, aviso local y llamada agendada.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { sumarHabiles, deIso, iso } from '@miderecho/nucleo';

const guardado = new Map();
globalThis.localStorage = { getItem: k => guardado.get(k) ?? null, setItem: (k, v) => guardado.set(k, String(v)), removeItem: k => guardado.delete(k) };
let enLinea = false;
Object.defineProperty(globalThis, 'navigator', { value: { get onLine() { return enLinea; } }, configurable: true });
const pedidos = [], respuestas = [];
globalThis.fetch = async (url, { method, body }) => {
  pedidos.push({ url, method, datos: JSON.parse(body) });
  const [estado, j] = respuestas.shift() || [200, { ok: true, simulado: true, token: 'tok' + pedidos.length }];
  return new Response(JSON.stringify(j), { status: estado });
};
const escuchas = {};
globalThis.window = { addEventListener: (e, f) => { escuchas[e] = f; } };
const a = await import('./src/lib/avisos.js');
const pausa = () => new Promise(r => setTimeout(r, 20));
const cola = () => JSON.parse(localStorage.getItem('miderecho-cancelar') || '[]');

// fechas: 3 días hábiles antes, el día y 1 hábil después; solo las futuras
const rad = new Date(2026, 9, 1), caso = { codigo: 'K7P2', rad: iso(rad), plazo: 15, venc: iso(sumarHabiles(rad, 15)), estado: 'esperando' };
assert.deepEqual(a.fechasAviso(caso, new Date(2026, 9, 2)), [sumarHabiles(rad, 12), deIso(caso.venc), sumarHabiles(rad, 16)].map(iso));
assert.deepEqual(a.fechasAviso(caso, deIso(caso.venc)), [iso(sumarHabiles(rad, 16))]);
assert.deepEqual(a.fechasAviso({ ...caso, venc: null }), []);
assert.match(a.nuevoCodigo(), /^[A-HJ-NP-Z2-9]{4}$/);

// aviso local: hoy primero, luego mañana; solo casos esperando respuesta
const hoy = new Date(2026, 9, 21);
assert.deepEqual(a.plazosCercanos([
  { titulo: 'Tutela de salud', entidad: 'EPS', venc: '2026-10-22', estado: 'esperando' },
  { titulo: 'Derecho de petición', entidad: 'Alcaldía de Ovejas', venc: '2026-10-21', estado: 'esperando' },
  { titulo: 'Derecho de petición', entidad: 'ANT', venc: '2026-10-21', estado: 'respondido' },
  { titulo: 'Derecho de petición', entidad: 'ANT', venc: '2026-10-25', estado: 'esperando' },
], hoy), ['Hoy vence el plazo de su derecho de petición a Alcaldía de Ovejas.', 'Mañana vence el plazo de su tutela de salud a EPS.']);

// cola de cancelación: sin señal se guarda (solo código y token), sobrevive a "Borrar todo" y sale al volver la señal
a.cancelarAvisos({ ...caso, avisos: { sms: 'tSms', push: '', llamada: 'tLlamada' } });   // push '' = modo de prueba: nada que cancelar
await pausa();
assert.deepEqual(cola(), [{ ruta: 'recordatorios', datos: { codigo: 'K7P2', token: 'tSms' } }, { ruta: 'recordatorios', datos: { codigo: 'K7P2', token: 'tLlamada' } }]);
assert.equal(pedidos.length, 0);
guardado.delete('miderecho-v2');   // lo que hace almacen.borrarTodo()
enLinea = true;
respuestas.push([500, { ok: false, error: 'falla' }]);   // el primero falla: se queda para el próximo intento
await escuchas.online();
assert.deepEqual(pedidos.map(p => [p.url, p.method, p.datos.token]), [['/api/recordatorios', 'DELETE', 'tSms'], ['/api/recordatorios', 'DELETE', 'tLlamada']]);
assert.deepEqual(cola().map(x => x.datos.token), ['tSms']);
respuestas.push([400, { ok: false, error: 'Token inválido' }]);   // un token inválido no se reintenta para siempre
await a.procesarCola();
assert.deepEqual(cola(), []);

// con señal, varios seguidos (borrar un caso con SMS y llamada): salen todos en la misma corrida
pedidos.length = 0;
a.cancelarAvisos({ ...caso, avisos: { sms: 'u1', llamada: 'u2', whatsapp: 'u3' } });
await pausa();
assert.deepEqual(pedidos.map(p => p.datos.token), ['u1', 'u2', 'u3']);
assert.deepEqual(cola(), []);

// recordatorio: el número va al servidor; al celular vuelve solo el token
pedidos.length = 0;
let r = await a.programar(caso, 'sms', { telefono: '3001112233' });
assert.equal(r.ok, true);
assert.deepEqual(pedidos[0].datos.codigo, 'K7P2');
assert.deepEqual([pedidos[0].url, pedidos[0].datos.canal, pedidos[0].datos.vence, pedidos[0].datos.telefono], ['/api/recordatorios', 'sms', caso.venc, '3001112233']);
assert.ok(![...guardado.values()].some(v => v.includes('3001112233')));

// llamada agendada: se guarda token, hora y texto (nunca el número); una nueva cancela la anterior; cancelar la quita
pedidos.length = 0;
const cuando = new Date(Date.now() + 864e5).toISOString().slice(0, 10) + 'T09:00-05:00';
r = await a.pedirLlamada({ telefono: '3001112233', acepto: true, cuando, texto: 'jueves 22 de octubre, a las 9 a. m.' });
assert.deepEqual(a.llamadaAgendada(), { token: 'tok1', cuando: Date.parse(cuando), texto: 'jueves 22 de octubre, a las 9 a. m.' });
await a.pedirLlamada({ telefono: '3001112233', acepto: true, cuando, texto: 'otra' });
await pausa();
assert.deepEqual(pedidos.map(p => [p.url, p.method]), [['/api/llamar', 'POST'], ['/api/llamar', 'POST'], ['/api/llamar', 'DELETE']]);
assert.equal(pedidos[2].datos.token, 'tok1');
assert.ok(![...guardado.values()].some(v => v.includes('3001112233')));
await a.cancelarLlamada();
assert.equal(a.llamadaAgendada(), null);
assert.equal(pedidos.at(-1).datos.token, 'tok2');
// sin internet no se intenta nada y el cliente no lanza
enLinea = false;
assert.deepEqual(await a.pedir('push', 'GET'), { ok: false, simulado: false, error: 'Sin internet' });

// service worker (public/sw-avisos.js): push → notificación con el texto; tocarla → abre Mis casos
const manejadores = {}, mostradas = [], abiertas = [];
const self = { addEventListener: (e, f) => { manejadores[e] = f; }, registration: { scope: 'https://miderecho.test/', showNotification: (t, o) => mostradas.push([t, o.body]) },
  clients: { matchAll: async () => [], openWindow: async u => abiertas.push(u) } };
runInNewContext(readFileSync(new URL('./public/sw-avisos.js', import.meta.url), 'utf8'), { self, URL });
let espera;
manejadores.push({ data: { json: () => ({ texto: 'Su caso K7P2 vence mañana.' }) }, waitUntil: p => { espera = p; } });
await espera;
manejadores.push({ data: { json: () => { throw new Error('sin datos'); } }, waitUntil: p => { espera = p; } });
await espera;
assert.deepEqual(mostradas, [['MiDerecho', 'Su caso K7P2 vence mañana.'], ['MiDerecho', 'Tiene un aviso de sus casos.']]);
manejadores.notificationclick({ notification: { close() {} }, waitUntil: p => { espera = p; } });
await espera;
assert.deepEqual(abiertas, ['https://miderecho.test/#/casos']);

console.log('✓ test-avisos: todo bien');
