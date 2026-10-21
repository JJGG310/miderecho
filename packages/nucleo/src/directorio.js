// Correos de las entidades a las que MiDerecho envía documentos. Lo usan la app (para mostrar a dónde va) y /api/correo
// (prototipo/api/correo.js), que solo envía a estas direcciones. verificado: false = no confirmado en una fuente oficial.
import { MUNICIPIOS } from './contenido.js';

// Alcaldías: correos publicados en su propio sitio web, revisados el 20-oct-2026 (investigacion/08, sección 3).
// Chaparral mezcla dos dominios en su página: sin verificar.
const alcaldias = MUNICIPIOS.map(m => [`alcaldia:${m.nombre}`, { nombre: `Alcaldía de ${m.nombre}`, correo: m.correo, verificado: m.nombre !== 'Chaparral' }]);

// Juzgados: "Directorio de cuentas de correo electrónico" de la Rama Judicial (ramajudicial.gov.co/directorio-cuentas-de-correo-electronico),
// consultado el 21-oct-2026. El primero de cada municipio recibe las tutelas nuevas: la oficina de reparto si la hay, o el juzgado municipal.
// Los demás, si hay varios, son los juzgados que deciden: la impugnación y el desacato van al que decidió la tutela, y la persona lo escoge.
// [validar] Decreto 333 de 2021: las tutelas contra entidades nacionales van a los jueces del circuito; el juez municipal debe remitirlas.
const CARMEN1 = ['Juzgado 1 Promiscuo Municipal de El Carmen de Bolívar', 'j01prmcbolivar'];
const JUZGADOS = {
  'El Carmen de Bolívar': [CARMEN1, CARMEN1, ['Juzgado 2 Promiscuo Municipal de El Carmen de Bolívar', 'j02prmcbolivar']],   // sin oficina de reparto en el directorio: las tutelas nuevas al 1 [validar]
  'Ovejas': [['Juzgado Promiscuo Municipal de Ovejas', 'jprmpalovejas']],
  'San Jacinto': [['Juzgado Promiscuo Municipal de San Jacinto', 'jprmsjacinto']],
  'María La Baja': [['Juzgado Promiscuo Municipal de María La Baja', 'j01prmmlabaja']],
  'Chaparral': [['Reparto de los juzgados de Chaparral', 'repchaparraltol'],
    ['Juzgado 1 Civil Municipal de Chaparral', 'j01cmpalchaparral'], ['Juzgado 2 Civil Municipal de Chaparral', 'j02cmpalchaparral'],
    ['Juzgado 1 Penal Municipal de Chaparral', 'j01pmpalchaparral'], ['Juzgado 2 Penal Municipal de Chaparral', 'j02pmpalchaparral']],
  'Planadas': [['Juzgado Promiscuo Municipal de Planadas', 'j01prmpalplanadas']],
  'Rioblanco': [['Juzgado Promiscuo Municipal de Rioblanco', 'j01prmpalrioblanco']],
  'Ataco': [['Juzgado Promiscuo Municipal de Ataco', 'j01prmpalataco']],
  'Mesetas': [['Juzgado Promiscuo Municipal de Mesetas', 'j01prmmesetas']],
  'La Macarena': [['Juzgado Promiscuo Municipal de La Macarena', 'j01prmlamacarena']],
  'Vista Hermosa': [['Juzgado Promiscuo Municipal de Vista Hermosa', 'j01prmvhermosa']],
  'Puerto Rico (Meta)': [['Juzgado Promiscuo Municipal de Puerto Rico (Meta)', 'j01prmpalptorico']],
  'Uribe': [['Juzgado Promiscuo Municipal de Uribe', 'j01prmuribe']],
  'Mapiripán': [['Juzgado Promiscuo Municipal de Mapiripán', 'j01prmmapiripan']],
  'San José del Guaviare': [['Reparto de los juzgados civiles municipales de San José del Guaviare', 'repjcmpalsjguaviare'],
    ['Juzgado 1 Civil Municipal de San José del Guaviare', 'j01cmpalsjguaviare'], ['Juzgado 2 Civil Municipal de San José del Guaviare', 'j02cmpalsjguaviare'],
    ['Juzgado 1 Penal Municipal de San José del Guaviare', 'j01pmpalmixsjguaviare'], ['Juzgado 2 Penal Municipal de San José del Guaviare', 'j02pmpalmixsjguaviare']],
};
const juzgado = ([nombre, usuario]) => ({ nombre, correo: `${usuario}@cendoj.ramajudicial.gov.co`, verificado: true });
const juzgados = Object.entries(JUZGADOS).flatMap(([m, [primero, ...otros]]) => [
  [`juzgado:${m}`, juzgado(primero)], ...otros.map((j, i) => [`juzgado:${m}:${i + 1}`, juzgado(j)])]);

export const DIRECTORIO = Object.fromEntries([
  ...alcaldias,
  ...juzgados,
  // Carta de trato digno de la ANT (actualizada a 2025): radicación por info@ant.gov.co o atencionalciudadano@ant.gov.co.
  ['ant', { nombre: 'Agencia Nacional de Tierras (ANT)', correo: 'atencionalciudadano@ant.gov.co', verificado: true }],
]);

// Tutelas, impugnación y desacato van a un juzgado; lo demás, a la entidad.
export const paraJuzgado = tipo => tipo.startsWith('tutela') || tipo === 'impugnacion' || tipo === 'desacato';

// Juzgados que deciden en un municipio: [clave, datos]. Con uno solo, es el mismo que recibe la tutela.
export const juzgadosDe = municipio => {
  const xs = Object.entries(DIRECTORIO).filter(([k]) => k.startsWith(`juzgado:${municipio}:`));
  return xs.length ? xs : Object.entries(DIRECTORIO).filter(([k]) => k === `juzgado:${municipio}`);
};
