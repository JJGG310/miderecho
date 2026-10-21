// Filtro de privacidad: se aplica en el celular ANTES de enviar el relato al asistente, y otra vez en el servidor.
// Regla de la investigación (06 y 12): nada de cédulas, teléfonos ni correos hacia un modelo de IA de terceros.

const REGLAS = [
  // correos
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[correo]'],
  // cédulas o números largos, con o sin puntos: 1.234.567.890, 12345678
  [/\b\d{1,3}(?:[.\s]\d{3}){2,3}\b/g, '[número]'],
  // teléfonos: celulares colombianos (3xx xxx xxxx), con o sin +57
  [/(?:\+?57[\s-]?)?\b3\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[teléfono]'],
  [/\b\d{6,}\b/g, '[número]'],
];

// Devuelve el texto sin datos identificables y cuántos reemplazos hizo.
export function limpiar(texto = '') {
  let cambios = 0, t = String(texto);
  for (const [re, rep] of REGLAS) t = t.replace(re, () => { cambios++; return rep; });
  return { texto: t, cambios };
}

// Palabras que activan el protocolo de riesgo alto sin esperar a la IA (investigacion/06, protocolo de riesgo).
const RIESGO = /\b(amenaz\w*|me (van|quieren) (a )?matar|matar(me|nos|lo|la)?|armad[oa]s?|grupo armado|disidencia|paramilitar\w*|guerrilla|extorsi\w*|vacuna|desplaza(r|ron|miento)\w*|me pegan?|me golpe\w*|violencia|abus\w*)\b/i;
export const hayRiesgo = texto => RIESGO.test(String(texto));
