// Prueba del modo sin internet. Correr: npm test -w apps/web
// 1. Cola de envíos (lib/cola.js): sin señal, los envíos esperan cifrados con la clave y salen solos al volver la señal.
// 2. Asistente sin señal: contesta el modo básico en el celular, sin llamar al servidor.
// 3. Precache: un build real (vite build a una carpeta temporal) guarda en el service worker todo lo que la app necesita.
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ls = new Map();
globalThis.localStorage = { getItem: k => ls.get(k) ?? null, setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) };
let red = false;
Object.defineProperty(globalThis, 'navigator', { value: { get onLine() { return red; } }, configurable: true });
globalThis.window = { addEventListener() {} };
const pedidos = [], respuestas = {};   // ruta → [estado, json] (por defecto 200 ok)
globalThis.fetch = async (url, { body }) => {
  const ruta = url.split('/api/')[1], datos = JSON.parse(body);
  pedidos.push({ ruta, datos });
  const [estado, j] = respuestas[ruta]?.shift() || [200, { ok: true, simulado: true, token: 'tok-' + ruta }];
  return new Response(JSON.stringify(j), { status: estado });
};

const { almacen } = await import('./src/lib/almacen.js');
const cola = await import('./src/lib/cola.js');
const avisos = await import('./src/lib/avisos.js');
const { preguntarAsistente } = await import('./src/lib/api.js');
const crudo = () => [...ls.values()].join(' ');

// ---------- 1. cola de envíos ----------
await almacen.crear('1234');
const hoy = new Date(), dia = n => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + n);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const caso = { codigo: 'K7P2', rad: iso(dia(-1)), plazo: 15, venc: iso(dia(20)), estado: 'esperando' };

let r = await avisos.programar(caso, 'sms', '3001112233', 'avisos-v2');
assert.deepEqual(r, { ok: true, enCola: true }, 'sin señal, el recordatorio queda en la cola');
assert.deepEqual(await avisos.programar(caso, 'push', undefined, 'avisos-v2'), { ok: false, error: 'Las notificaciones se activan con internet.' });
r = await avisos.pedirLlamada({ telefono: '3001112233', acepto: true, aviso: 'llamada-v2', cuando: `${iso(dia(2))}T09:00:00-05:00`, texto: 'pasado mañana' });
assert.deepEqual(r, { ok: true, enCola: true });
cola.encolar('correo', { tipo: 'peticion', destino: 'alcaldia:Ovejas', datos: { nombre: 'Ana Pérez Rojas', cedula: '1098765432', codigo: 'K7P2' } });
assert.equal(pedidos.length, 0, 'sin señal no sale nada');
assert.equal(cola.estadoEnvios().pendientes, 3);
await almacen.esperar();
for (const s of ['3001112233', 'Ana Pérez', '1098765432', 'alcaldia:Ovejas']) assert.ok(!crudo().includes(s), `quedó sin cifrar: ${s}`);

// Con la app bloqueada no se pueden leer ni enviar; al abrir con la clave vuelven.
almacen.bloquear();
red = true;
await cola.procesarEnvios();
assert.equal(pedidos.length, 0, 'bloqueada no envía');
await almacen.abrir('1234');
assert.equal(almacen.envios().length, 3);

// Vuelve la señal: salen solos. Un error del servidor (500) se reintenta después; un rechazo (400) no.
respuestas.correo = [[500, { ok: false, error: 'falla' }]];
await cola.procesarEnvios();
assert.deepEqual(pedidos.map(p => p.ruta), ['recordatorios', 'llamar', 'correo']);
assert.equal(pedidos[0].datos.telefono, '3001112233');
assert.ok(pedidos[0].datos.fechas.every(f => f > iso(hoy)), 'solo fechas futuras');
assert.deepEqual(avisos.avisosDe('K7P2'), { sms: 'tok-recordatorios' }, 'el token queda para poder cancelar');
assert.equal(avisos.llamadaAgendada()?.token, 'tok-llamar');
assert.equal(cola.estadoEnvios().pendientes, 1, 'el correo espera otro intento');
assert.match(cola.estadoEnvios().mensaje, /Volvió la señal: se enviaron los 2 envíos/);
respuestas.correo = [[400, { ok: false, error: 'Falta el destino' }]];
await cola.procesarEnvios();
assert.equal(cola.estadoEnvios().pendientes, 0);
assert.match(cola.estadoEnvios().mensaje, /No se pudo enviar: Falta el destino/);
await almacen.esperar();
assert.ok(!crudo().includes('3001112233') && !crudo().includes('1098765432'), 'lo enviado se borra');

// Si las fechas ya pasaron mientras esperaba, no se envía nada.
red = false;
cola.encolar('recordatorios', { codigo: 'VIEJ', canal: 'sms', fechas: ['2020-01-01'], telefono: '3001112233' });
red = true;
const antes = pedidos.length;
await cola.procesarEnvios();
assert.equal(pedidos.length, antes);
assert.equal(almacen.envios().length, 0);

// El interruptor del demo ("sin internet") también encola, aunque el celular tenga señal.
cola.forzarSinRed(true);
assert.equal((await avisos.programar(caso, 'whatsapp', '3001112233', 'avisos-v2')).enCola, true);
cola.forzarSinRed(false);
await cola.procesarEnvios();
assert.equal(pedidos.at(-1).datos.canal, 'whatsapp');

// ---------- 2. asistente sin señal: modo básico local ----------
red = false;
const n = pedidos.length;
r = await preguntarAsistente([{ rol: 'persona', texto: 'La EPS no me da la cita y mi cédula es 1098765432' }]);
assert.equal(r.fuente, 'simulada');
assert.equal(r.accion, 'preguntar');
assert.ok(r.opciones.length > 0 && /sin internet/i.test(r.aviso));
r = await preguntarAsistente([{ rol: 'persona', texto: 'Me amenazaron por reclamar el agua' }]);
assert.equal(r.riesgo, true);
assert.ok(r.ayuda.length > 20, 'la ayuda fija de riesgo');
r = await preguntarAsistente([{ rol: 'persona', texto: 'El agua de la vereda no llega' }]);
assert.equal(r.orientacion.documento, 'peticion');
assert.ok(r.orientacion.ley.texto, 'la ley sale del contenido fijo');
assert.equal(pedidos.length, n, 'nada salió del celular');

// ---------- 3. precache del service worker ----------
const raiz = fileURLToPath(new URL('.', import.meta.url)), tmp = mkdtempSync(join(tmpdir(), 'miderecho-offline-'));
try {
  const { build } = await import('vite');
  await build({ root: raiz, logLevel: 'silent', build: { outDir: tmp, emptyOutDir: true } });
  const archivos = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? archivos(join(d, f)) : [join(d, f)]);
  const sw = readFileSync(join(tmp, 'sw.js'), 'utf8');
  const precache = new Set([...sw.matchAll(/url:"([^"]+)"/g)].map(m => m[1]));
  const faltan = archivos(tmp).map(f => relative(tmp, f)).filter(f => !/^(sw\.js|workbox-[\w-]+\.js)$/.test(f) && !precache.has(f));
  assert.deepEqual(faltan, [], 'todo lo del build queda guardado para usarse sin internet');
  for (const f of ['index.html', 'sw-avisos.js', 'manifest.webmanifest']) assert.ok(precache.has(f), f);
  // Historietas, búho, íconos: todo lo de public/, esté en la carpeta que esté.
  for (const f of archivos(join(raiz, 'public')).map(f => relative(join(raiz, 'public'), f))) assert.ok(precache.has(f), `sin internet falta ${f}`);
  assert.ok([...precache].some(f => /^assets\/Politica-.*\.js$/.test(f)), 'la política (se carga aparte) también');
  assert.match(sw, /createHandlerBoundToURL\("index\.html"\)/, 'cualquier pantalla abre sin internet');
  assert.match(sw, /denylist:\[\/\^\\\/api\\\/\/\]/, 'las respuestas de /api nunca salen del caché');
} finally { rmSync(tmp, { recursive: true, force: true }); }

console.log('✓ test-offline: cola de envíos, modo básico y precache');
