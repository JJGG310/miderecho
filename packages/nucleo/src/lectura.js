// Lectura en voz alta de los textos FIJOS de la app con la voz de la asistente (ElevenLabs).
// La app pide el audio por clave y el servidor (prototipo/api/_lectura.js) saca el texto de aquí: nunca texto libre.
// La huella va en la URL: si un texto cambia, cambia la URL y se genera un audio nuevo; el viejo deja de pedirse.
import { DERECHOS_INFO, derechoInfo } from './derechos.js';

// Una viñeta de la historieta, tal como se lee: título, lo que cuenta el búho, lo que dicen los personajes y las listas.
export const lecturaCuadro = (q, n) => [`Cuadro ${n}: ${q.titulo}.`, q.texto, ...(q.dice || []).map(([quien, t]) => `${quien}: ${t}`),
  q.lista && `${q.listaTitulo} ${q.lista.join(' ')}`, q.pasos && `Pasos que puede seguir: ${q.pasos.join(' ')}`].filter(Boolean).join(' ');

export const LECTURA_DERECHOS = 'Conozca sus derechos. Le explicamos con palabras sencillas y con historietas qué derechos tiene, cómo darse cuenta de que no se los respetan y qué puede hacer. Funciona sin internet. Temas: ' + DERECHOS_INFO.map(d => d.menu).join(', ') + '.';

// Claves: "derechos" (la lista) y "derecho.<id>.titulo | resumen | cuadro.<n> | pasos | dicho".
export function textoLectura(clave) {
  if (clave === 'derechos') return LECTURA_DERECHOS;
  const [tipo, id, parte, n, ...sobra] = String(clave ?? '').split('.');
  const d = tipo === 'derecho' && !sobra.length && derechoInfo(id);
  if (!d) return null;
  if (parte === 'titulo' && n == null) return `${d.titulo}.`;
  if (parte === 'cuadro' && /^[1-9]$/.test(n ?? '') && d.cuadros?.[n - 1]) return lecturaCuadro(d.cuadros[n - 1], +n);
  if (parte === 'resumen' && n == null && !d.cuadros) return `${d.descripcion} Qué puede hacer: ${d.pasos.join(' ')}`;
  if (parte === 'pasos' && n == null && !d.cuadros) return `Qué puede hacer. ${d.pasos.join(' ')}`;
  if (parte === 'dicho' && n == null && d.dichoDeOtraForma) return `Dicho de otra forma. ${d.dichoDeOtraForma}`;
  return null;
}

// Lo que se lee al tocar la bocina del título de una ficha: el título y luego cada viñeta (o el resumen), en orden.
// Son audios separados para no generar dos veces el mismo texto.
export const clavesDerecho = d => [`derecho.${d.id}.titulo`, ...(d.cuadros ? d.cuadros.map((_, i) => `derecho.${d.id}.cuadro.${i + 1}`) : [`derecho.${d.id}.resumen`])];

// Huella corta del texto (FNV-1a de 32 bits en base 36), igual en el celular y en el servidor.
export function huella(texto) {
  let h = 0x811c9dc5;
  for (const c of String(texto)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
}

// La única URL válida para cada audio (el servidor rechaza cualquier otra forma, así la caché del CDN no se esquiva).
export const urlLectura = clave => `/api/elevenlabs-sesion?lectura=${clave}&v=${huella(textoLectura(clave))}`;
