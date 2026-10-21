// Genera el código QR de la landing como SVG, sin librerías ni servicios externos.
// Uso: node landing/qr.mjs https://miderecho-two.vercel.app  → imprime el <svg>; péguelo en index.html (id="qr").
// QR versión 3, corrección M, modo byte: sirve para enlaces de hasta 42 caracteres.
// Basado en el algoritmo de "QR Code generator" de Project Nayuki (MIT).

const texto = process.argv[2] || 'https://miderecho-two.vercel.app';
const datos = [...new TextEncoder().encode(texto)];
const N = 29, DATOS = 44, CORRECCION = 26;
if (datos.length > 42) throw new Error('El enlace es muy largo para la versión 3 (máximo 42 caracteres).');

// Bits: modo byte (0100), longitud (8 bits), datos, terminador y relleno.
const bits = [];
const poner = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
poner(4, 4); poner(datos.length, 8); datos.forEach(b => poner(b, 8));
poner(0, Math.min(4, DATOS * 8 - bits.length));
poner(0, (8 - bits.length % 8) % 8);
for (let p = 0xEC; bits.length < DATOS * 8; p ^= 0xEC ^ 0x11) poner(p, 8);
const palabras = [];
for (let i = 0; i < bits.length; i += 8) palabras.push(parseInt(bits.slice(i, i + 8).join(''), 2));

// Reed-Solomon en GF(256), polinomio 0x11D.
const mul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; };
const divisor = Array(CORRECCION).fill(0); divisor[CORRECCION - 1] = 1;
for (let i = 0, raiz = 1; i < CORRECCION; i++, raiz = mul(raiz, 2))
  for (let j = 0; j < CORRECCION; j++) { divisor[j] = mul(divisor[j], raiz); if (j + 1 < CORRECCION) divisor[j] ^= divisor[j + 1]; }
const resto = Array(CORRECCION).fill(0);
for (const b of palabras) { const f = b ^ resto.shift(); resto.push(0); divisor.forEach((c, i) => { resto[i] ^= mul(c, f); }); }
const todo = [...palabras, ...resto];

// Matriz: m[y][x] = oscuro; fijo[y][x] = módulo de función (no se enmascara).
const m = [...Array(N)].map(() => Array(N).fill(false));
const fijo = [...Array(N)].map(() => Array(N).fill(false));
const fijar = (x, y, v) => { m[y][x] = v; fijo[y][x] = true; };
for (let i = 0; i < N; i++) { fijar(6, i, i % 2 === 0); fijar(i, 6, i % 2 === 0); }
for (const [cx, cy] of [[3, 3], [N - 4, 3], [3, N - 4]])
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
    if (x >= 0 && x < N && y >= 0 && y < N) fijar(x, y, d !== 2 && d !== 4);
  }
for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) fijar(22 + dx, 22 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);

function formato(mascara) {   // nivel M = 00
  let r = mascara; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
  const b = ((mascara << 10) | r) ^ 0x5412, bit = i => ((b >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) fijar(8, i, bit(i));
  fijar(8, 7, bit(6)); fijar(8, 8, bit(7)); fijar(7, 8, bit(8));
  for (let i = 9; i < 15; i++) fijar(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) fijar(N - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) fijar(8, N - 15 + i, bit(i));
  fijar(8, N - 8, true);
}
formato(0);

// Datos en zigzag desde abajo a la derecha, saltando la columna 6.
for (let der = N - 1, i = 0; der >= 1; der -= 2) {
  if (der === 6) der = 5;
  for (let v = 0; v < N; v++) for (let j = 0; j < 2; j++) {
    const x = der - j, y = ((der + 1) & 2) === 0 ? N - 1 - v : v;
    if (!fijo[y][x] && i < todo.length * 8) { m[y][x] = ((todo[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
  }
}

const MASCARAS = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
  (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0,
];
const enmascarar = k => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!fijo[y][x] && MASCARAS[k](x, y)) m[y][x] = !m[y][x]; };

// Penalización estándar (rachas, bloques 2x2, falsos buscadores y balance) para elegir la máscara.
function penalizacion() {
  let p = 0, oscuros = 0;
  const linea = (get) => {
    for (let a = 0; a < N; a++) {
      let racha = 1;
      for (let b = 1; b <= N; b++) {
        if (b < N && get(a, b) === get(a, b - 1)) racha++;
        else { if (racha >= 5) p += racha - 2; racha = 1; }
      }
      const s = Array.from({ length: N }, (_, b) => (get(a, b) ? '1' : '0')).join('');
      p += 40 * ((s.match(/(?=10111010000)/g) || []).length + (s.match(/(?=00001011101)/g) || []).length);
    }
  };
  linea((y, x) => m[y][x]); linea((x, y) => m[y][x]);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (m[y][x]) oscuros++;
    if (x < N - 1 && y < N - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
  }
  return p + 10 * (Math.ceil(Math.abs(oscuros * 20 - N * N * 10) / (N * N)) - 1);
}
let mejor = 0, menor = Infinity;
for (let k = 0; k < 8; k++) { enmascarar(k); formato(k); const p = penalizacion(); if (p < menor) { menor = p; mejor = k; } enmascarar(k); }
enmascarar(mejor); formato(mejor);

// SVG: una sola ruta, rachas horizontales unidas, margen de 4 módulos.
let d = '';
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  if (!m[y][x] || (x > 0 && m[y][x - 1])) continue;
  let w = 1; while (x + w < N && m[y][x + w]) w++;
  d += `M${x + 4} ${y + 4}h${w}v1h-${w}z`;
}
console.log(`<svg id="qr" viewBox="0 0 ${N + 8} ${N + 8}" role="img" aria-label="Código QR que abre ${texto}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fffdfa"/><path fill="#1a3424" d="${d}"/></svg>`);
