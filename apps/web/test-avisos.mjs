// Pruebas de src/lib/avisos.js sin navegador: node apps/web/test-avisos.mjs
// Tokens en su propia clave (fuera de los casos), cola de cancelación con reintento, cancelarTodo, fechas, aviso local,
// llamada agendada y el service worker de las notificaciones.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { sumarHabiles, deIso, iso } from '@miderecho/nucleo';

const guardado = new Map();
globalThis.localStorage = { getItem: k => guardado.get(k) ?? null, setItem: (k, v) => guardado.set(k, String(v)), removeItem: k => guardado.delete(k) };
let enLinea = false, anulada = false;
const serviceWorker = { ready: Promise.resolve({ pushManager: { getSubscription: async () => ({ unsubscribe: async () => (anulada = true) }) } }) };
Object.defineProperty(globalThis, 'navigator', { value: { get onLine() { return enLinea; }, serviceWorker }, configurable: true });
const pedidos = [], respuestas = [];
globalThis.fetch = async (url, { method, body }) => {
  pedidos.push({ url, method, datos: body && JSON.parse(body) });
  const [estado, j] = respuestas.shift() || [200, { ok: true, simulado: true, token: 'tok' + pedidos.length }];
  return new Response(JSON.stringify(j), { status: estado });
};
const escuchas = {};
globalThis.window = { addEventListener: (e, f) => { escuchas[e] = f; } };
const a = await import('./src/lib/avisos.js');
const pausa = () => new Promise(r => setTimeout(r, 20));
const cola = () => JSON.parse(localStorage.getItem('miderecho-cancelar') || '[]');
const tokens = () => cola().map(x => x.datos.token);
const sinNumero = () => assert.ok(![...guardado.values()].some(v => v.includes('3001112233')), 'el número no se guarda');

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

// programar: el número va al servidor con la autorización y la versión del aviso; al celular vuelve solo el token,
// que queda en su propia clave (no dentro de los casos, que pueden estar cifrados)
enLinea = true;
const nuevo = { codigo: 'A1B2', rad: iso(new Date()), plazo: 15, venc: iso(sumarHabiles(new Date(), 15)), estado: 'esperando' };
let r = await a.programar(nuevo, 'sms', '3001112233', 'avisos-v1');
assert.equal(r.ok, true);
assert.deepEqual([pedidos[0].url, pedidos[0].method], ['/api/recordatorios', 'POST']);
assert.deepEqual([pedidos[0].datos.codigo, pedidos[0].datos.canal, pedidos[0].datos.telefono, pedidos[0].datos.acepto, pedidos[0].datos.aviso, pedidos[0].datos.vence],
  ['A1B2', 'sms', '3001112233', true, 'avisos-v1', nuevo.venc]);
await a.programar(nuevo, 'llamada', '3001112233', 'avisos-v1');
await a.programar(nuevo, 'whatsapp', '3001112233', 'avisos-v1');
assert.deepEqual(a.avisosDe('A1B2'), { sms: 'tok1', llamada: 'tok2', whatsapp: 'tok3' });
assert.deepEqual(JSON.parse(localStorage.getItem('miderecho-avisos')).map(x => Object.keys(x).join()), ['codigo,canal,token', 'codigo,canal,token', 'codigo,canal,token']);
sinNumero();
respuestas.push([429, { ok: false, error: 'Este número ya tiene las llamadas de hoy. Intente mañana' }]);
r = await a.programar({ ...nuevo, codigo: 'C3D4' }, 'llamada', '3001112233', 'avisos-v1');
assert.deepEqual([r.ok, a.avisosDe('C3D4')], [false, {}]);   // si el servidor no acepta, no queda nada
// push sin soporte del navegador: error claro y nada guardado
r = await a.programar(nuevo, 'push', undefined, 'avisos-v1');
assert.match(r.error, /no recibe notificaciones/);
assert.equal('push' in a.avisosDe('A1B2'), false);

// quitar un canal sin señal: sale de los activos y queda en la cola, sin pedir nada al servidor
enLinea = false;
pedidos.length = 0;
a.cancelarAvisos('A1B2', ['sms']);
await pausa();
assert.deepEqual(a.avisosDe('A1B2'), { llamada: 'tok2', whatsapp: 'tok3' });
assert.deepEqual(cola(), [{ ruta: 'recordatorios', datos: { codigo: 'A1B2', token: 'tok1' } }]);
assert.equal(pedidos.length, 0);

// "Borrar todo" sin señal: cancela todo lo de este celular sin leer los casos (pueden estar cifrados o borrados)
// y anula la suscripción push
localStorage.setItem('miderecho-llamada', JSON.stringify({ token: 'L'.repeat(22), cuando: Date.now() + 864e5, texto: 'x' }));
guardado.delete('miderecho-v2');
await a.cancelarTodo();
assert.equal(anulada, true);
assert.deepEqual(a.avisosDe('A1B2'), {});
assert.equal(a.llamadaAgendada(), null);
assert.deepEqual(tokens(), ['tok1', 'tok2', 'tok3', 'L'.repeat(22)]);
assert.equal(pedidos.length, 0);

// al volver la señal sale todo; lo que falla (500) se queda para el próximo intento; un token inválido (400) no se insiste
enLinea = true;
respuestas.push([500, { ok: false, error: 'falla' }], [400, { ok: false, error: 'Token inválido' }]);
await escuchas.online();
assert.deepEqual(pedidos.map(p => [p.url, p.method, p.datos.token]), [['/api/recordatorios', 'DELETE', 'tok1'], ['/api/recordatorios', 'DELETE', 'tok2'],
  ['/api/recordatorios', 'DELETE', 'tok3'], ['/api/llamar', 'DELETE', 'L'.repeat(22)]]);
assert.deepEqual(tokens(), ['tok1']);
await a.procesarCola();
assert.deepEqual(cola(), []);

// con señal, varios seguidos (borrar un caso con SMS, llamada y WhatsApp): salen todos en la misma corrida
pedidos.length = 0;
for (const k of ['sms', 'llamada', 'whatsapp']) await a.programar(nuevo, k, '3001112233', 'avisos-v1');
const esperados = Object.values(a.avisosDe('A1B2'));
pedidos.length = 0;
a.cancelarAvisos('A1B2');
await pausa();
assert.deepEqual(pedidos.map(p => p.datos.token), esperados);
assert.deepEqual([cola(), a.avisosDe('A1B2')], [[], {}]);

// llamada agendada: se guarda token, hora y texto (nunca el número); una nueva cancela la anterior; cancelar la quita
pedidos.length = 0;
const cuando = new Date(Date.now() + 864e5).toISOString().slice(0, 10) + 'T09:00-05:00';
await a.pedirLlamada({ telefono: '3001112233', acepto: true, aviso: 'llamada-v1', cuando, texto: 'jueves 22 de octubre, a las 9 a. m.' });
assert.deepEqual(a.llamadaAgendada(), { token: 'tok1', cuando: Date.parse(cuando), texto: 'jueves 22 de octubre, a las 9 a. m.' });
assert.equal(pedidos[0].datos.aviso, 'llamada-v1');
await a.pedirLlamada({ telefono: '3001112233', acepto: true, aviso: 'llamada-v1', cuando, texto: 'otra' });
await pausa();
assert.deepEqual(pedidos.map(p => [p.url, p.method]), [['/api/llamar', 'POST'], ['/api/llamar', 'POST'], ['/api/llamar', 'DELETE']]);
assert.equal(pedidos[2].datos.token, 'tok1');
sinNumero();
await a.cancelarLlamada();
assert.equal(a.llamadaAgendada(), null);
assert.equal(pedidos.at(-1).datos.token, 'tok2');
// sin internet no se intenta nada y el cliente no lanza
enLinea = false;
assert.deepEqual(await a.pedir('recordatorios', 'GET'), { ok: false, simulado: false, error: 'Sin internet' });

// service worker (public/sw-avisos.js): push → notificación con título neutro y el texto; tocarla → abre Mis casos
const manejadores = {}, mostradas = [], abiertas = [];
const self = { addEventListener: (e, f) => { manejadores[e] = f; }, registration: { scope: 'https://miderecho.test/', showNotification: (t, o) => mostradas.push([t, o.body]) },
  clients: { matchAll: async () => [], openWindow: async u => abiertas.push(u) } };
runInNewContext(readFileSync(new URL('./public/sw-avisos.js', import.meta.url), 'utf8'), { self, URL });
let espera;
manejadores.push({ data: { json: () => ({ texto: 'Su caso K7P2 vence mañana.' }) }, waitUntil: p => { espera = p; } });
await espera;
manejadores.push({ data: { json: () => { throw new Error('sin datos'); } }, waitUntil: p => { espera = p; } });
await espera;
assert.deepEqual(mostradas, [['Recordatorio', 'Su caso K7P2 vence mañana.'], ['Recordatorio', 'Tiene un aviso de sus casos.']]);
manejadores.notificationclick({ notification: { close() {} }, waitUntil: p => { espera = p; } });
await espera;
assert.deepEqual(abiertas, ['https://miderecho.test/#/casos']);

console.log('✓ test-avisos: todo bien');
