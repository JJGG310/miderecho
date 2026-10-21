// Prueba de prototipo/api/elevenlabs-sesion.js sin red ni clave real: node agente/test-sesion.mjs
import assert from 'node:assert/strict';
import handler from '../prototipo/api/elevenlabs-sesion.js';

const llamar = async (headers, method = 'POST') => {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } };
  await handler({ method, headers: { host: 'miderecho-two.vercel.app', 'x-forwarded-for': headers.ip || '1.1.1.1', ...headers } }, res);
  return res;
};
const bueno = { origin: 'https://miderecho-two.vercel.app', 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' };

let pedidoA = null;
globalThis.fetch = async (url, op) => { pedidoA = { url, op }; return { ok: true, json: async () => ({ token: 'tok123' }) }; };

assert.equal((await llamar(bueno, 'GET')).code, 405);
assert.equal((await llamar({ ...bueno, origin: 'https://otro.vercel.app' })).code, 403, 'otro dominio');
assert.equal((await llamar({ ...bueno, 'sec-fetch-site': 'cross-site' })).code, 403, 'sec-fetch-site ajeno');
assert.equal((await llamar({ ...bueno, 'content-type': 'text/plain' })).code, 403, 'no JSON');
assert.equal((await llamar({ ...bueno, origin: undefined })).code, 403, 'sin Origin');

delete process.env.ELEVENLABS_API_KEY;
assert.equal((await llamar({ ...bueno, ip: '2.2.2.2' })).code, 503, 'sin clave');

process.env.ELEVENLABS_API_KEY = 'clave-de-prueba';
const ok = await llamar({ ...bueno, ip: '3.3.3.3' });
assert.equal(ok.code, 200);
assert.deepEqual(ok.body, { token: 'tok123' });
assert.equal(ok.headers['Cache-Control'], 'no-store');
assert.match(pedidoA.url, /conversation\/token\?agent_id=agent_8101m5dg7s5se9trrst6fjpvz52d$/);
assert.equal(pedidoA.op.headers['xi-api-key'], 'clave-de-prueba');

const local = await llamar({ ...bueno, origin: 'http://localhost:3000', host: 'localhost:3000', ip: '4.4.4.4' });
assert.equal(local.code, 200, 'localhost con vercel dev');

for (let i = 0; i < 9; i++) await llamar({ ...bueno, ip: '5.5.5.5' });
assert.equal((await llamar({ ...bueno, ip: '5.5.5.5' })).code, 200, 'décimo pedido');
assert.equal((await llamar({ ...bueno, ip: '5.5.5.5' })).code, 429, 'once en una hora');

globalThis.fetch = async () => ({ ok: false, status: 401 });
assert.equal((await llamar({ ...bueno, ip: '6.6.6.6' })).code, 502, 'ElevenLabs rechaza');

console.log('elevenlabs-sesion: todo bien');
