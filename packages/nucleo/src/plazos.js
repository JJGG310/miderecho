// Plazos en días hábiles para Colombia.
// Ley 4 de 1913, art. 62: los plazos de días fijados en la ley se cuentan sin feriados ni días de vacancia.
// Festivos según la Ley 51 de 1983 (Ley Emiliani): algunos se trasladan al lunes siguiente.

const pad = n => String(n).padStart(2, '0');
export const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const deIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const mas = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const lunesSiguiente = d => mas(d, (8 - d.getDay()) % 7);

function pascua(y) { // algoritmo gregoriano de Meeus/Jones/Butcher
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}

const cache = {};
export function festivos(y) {
  if (cache[y]) return cache[y];
  const fijos = [[0, 1], [4, 1], [6, 20], [7, 7], [11, 8], [11, 25]].map(([m, d]) => new Date(y, m, d));
  const trasladables = [[0, 6], [2, 19], [5, 29], [7, 15], [9, 12], [10, 1], [10, 11]].map(([m, d]) => lunesSiguiente(new Date(y, m, d)));
  const p = pascua(y);
  const santos = [mas(p, -3), mas(p, -2)];                                   // jueves y viernes santo
  const movibles = [39, 60, 68].map(n => lunesSiguiente(mas(p, n)));         // Ascensión, Corpus, Sagrado Corazón
  return (cache[y] = new Set([...fijos, ...trasladables, ...santos, ...movibles].map(iso)));
}

const esHabil = d => d.getDay() !== 0 && d.getDay() !== 6 && !festivos(d.getFullYear()).has(iso(d));

// El plazo empieza a contar el día hábil siguiente a la radicación.
export function sumarHabiles(desde, n) {
  let d = desde, cuenta = 0;
  while (cuenta < n) { d = mas(d, 1); if (esHabil(d)) cuenta++; }
  return d;
}

// Días hábiles que faltan: los que hay después de "hoy" y hasta el vencimiento, inclusive.
export function habilesEntre(hoy, venc) {
  let d = hoy, cuenta = 0;
  while (d < venc) { d = mas(d, 1); if (esHabil(d)) cuenta++; }
  return cuenta;
}
