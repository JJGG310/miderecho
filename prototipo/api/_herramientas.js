// Herramientas de servidor ("server tools") del agente de voz por teléfono. En una llamada no hay app: ElevenLabs las
// llama durante la conversación con POST /api/elevenlabs-sesion?herramienta=<nombre> (agente/telefono.md, §5).
// El agente solo escoge valores de listas cerradas; lo jurídico (documento, plazo, ley, frases) lo pone el servidor.
// Protegidas con un secreto compartido que ElevenLabs manda en la cabecera x-miderecho-secreto. Sin la variable
// AGENTE_HERRAMIENTAS_SECRETO quedan cerradas (503). Los logs no llevan datos de la persona.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { TIPOS, MUNICIPIOS, TEMAS, SERVICIOS, MOTIVOS_SP, SALUD_NIEGA, DERECHOS, DERECHOS_INFO, generarDocumento, sumarHabiles, iso, deIso } from '@miderecho/nucleo';
import { leyFija, DESDE } from '../../apps/api/src/orientacion.js';
import { atender, falla, kv, cifrar, hmac, hoyColombia } from './_comun.js';
import { enviarAviso } from './_avisos.js';

const DOCUMENTOS = ['peticion', 'tutela_salud', 'tutela', 'servicios_publicos'];
const AVISO = 'Esto es información general, no consejo de abogado.';
const LINEA = '______________';
const HORAS_CODIGO = 72;   // el código vive 3 días: a veces hay un día de camino hasta la Personería (investigacion/11, §3.8)
// Frases fijas de agente/prompt.md: el agente las lee tal cual.
const FRASE = {
  peticion: 'Para esto sirve un derecho de petición. Es gratis, no necesita abogado y la entidad debe contestarle por escrito.',
  tutela_salud: 'Para esto sirve una tutela de salud. Es un documento para pedirle a un juez que proteja su salud. No necesita abogado.',
  tutela: 'Para esto sirve una tutela. Es un documento para pedirle a un juez que proteja un derecho. No necesita abogado.',
  servicios_publicos: 'Para esto sirve un reclamo a la empresa de servicios públicos. Es gratis y no necesita abogado.',
  ninguno: 'Para esto no hace falta un documento de la app. La Personería de su municipio o un consultorio jurídico le orientan gratis.',
};

const ids = xs => xs.map(x => x.id);
function uno(v, valores, campo, def) {
  if (v == null && def !== undefined) return def;
  if (!valores.includes(v)) throw falla(400, `${campo} debe ser uno de: ${valores.join(', ')}`);
  return v;
}
// El municipio es un nombre de lugar: solo letras, espacios y puntuación simple (sin números ni correos).
function municipioDe(m) {
  m = String(m ?? '').trim();
  if (!/^[\p{L} .()'-]{2,60}$/u.test(m)) throw falla(400, 'municipio: escriba solo el nombre del municipio');
  return MUNICIPIOS.find(x => x.nombre.toLowerCase() === m.toLowerCase())?.nombre || m;
}
const fechaDe = f => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f ?? '') || iso(deIso(f)) !== f) throw falla(400, 'desde debe ser una fecha AAAA-MM-DD');
  return f;
};
const enPalabras = f => deIso(f).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const nuevoCodigo = () => Array.from(randomBytes(4), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');

// Datos del documento, solo de listas cerradas. Nombre, cédula, vereda y entidad exacta quedan en blanco para llenarlos a mano.
function datosDocumento(b) {
  const tipo = uno(b.tipo, DOCUMENTOS, 'tipo'), municipio = municipioDe(b.municipio);
  const base = { tipo, municipio, vereda: LINEA, desde: uno(b.desde, DESDE, 'desde', 'hace un mes'), palabras: '', modo: 'mano', plazo: TIPOS[tipo].plazo };
  if (tipo === 'peticion') {
    const t = TEMAS.find(x => x.id === uno(b.temaId, ids(TEMAS).filter(i => i !== 'otro'), 'temaId'));
    const entidad = { alcaldia: `Alcaldía de ${municipio}`, eps: `EPS ${LINEA}`, ant: 'Agencia Nacional de Tierras' }[t.entidad];
    return { ...base, temaId: t.id, entidad, peticiones: [t.peticion] };
  }
  if (tipo === 'servicios_publicos') {
    const motivo = uno(b.motivo, ids(MOTIVOS_SP), 'motivo');
    return { ...base, servicio: uno(b.servicio, ids(SERVICIOS), 'servicio'), motivo, cuenta: '', entidad: `Empresa de servicios públicos ${LINEA}`,
      peticiones: [...MOTIVOS_SP.find(m => m.id === motivo).peticiones] };
  }
  const salud = tipo === 'tutela_salud';
  return { ...base, derecho: salud ? 'salud' : uno(b.derecho, ids(DERECHOS), 'derecho'), que: salud ? uno(b.que, ids(SALUD_NIEGA), 'que') : undefined,
    detalle: '', pidio: salud ? 'negada' : 'sin_respuesta', urgente: b.urgente === true ? 'si' : 'no', afectado: 'propio', pruebas: [], entidad: salud ? `EPS ${LINEA}` : LINEA };
}

export const HERRAMIENTAS = {
  // Qué documento sirve, con la frase y la ley fijas. Sin urgencia, la tutela de salud pasa a petición a la EPS (apps/api/src/prompt.js).
  orientar(b) {
    let documento = uno(b.documento, [...DOCUMENTOS, 'ninguno'], 'documento');
    if (documento === 'tutela_salud' && b.urgente !== true) documento = 'peticion';
    const derecho = ids(DERECHOS_INFO).includes(b.derecho) ? b.derecho : undefined;
    return { documento, titulo: TIPOS[documento]?.titulo ?? null, frase: FRASE[documento], plazo_dias_habiles: TIPOS[documento]?.plazo ?? null,
      ley: leyFija(documento, derecho).texto, aviso: AVISO };
  },

  // Arma el documento con la plantilla fija y guarda solo sus variables (sin teléfono ni datos personales) con un código por 72 h.
  async documento(b) {
    const c = datosDocumento(b);
    try { generarDocumento(c.tipo, c); } catch { throw falla(400, 'Faltan datos para el documento'); }
    const codigo = nuevoCodigo();
    await kv(['SET', 'doc:' + hmac('doc:' + codigo), cifrar(JSON.stringify(c)), 'EXAT', Math.floor(Date.now() / 1000) + HORAS_CODIGO * 3600]);
    return { codigo, deletreado: codigo.split('').join(', '), titulo: TIPOS[c.tipo].titulo, pide: c.peticiones ?? [], para: c.entidad.replace(LINEA, '(lo escribe a mano)'),
      plazo_dias_habiles: c.plazo, codigo_sirve_dias: HORAS_CODIGO / 24, aviso: AVISO };
  },

  // Cuándo vence el plazo de respuesta, en días hábiles de Colombia (con festivos).
  plazo(b) {
    const tipo = uno(b.tipo, DOCUMENTOS, 'tipo'), desde = b.desde == null ? hoyColombia() : fechaDe(b.desde);
    const vence = iso(sumarHabiles(deIso(desde), TIPOS[tipo].plazo));
    return { dias_habiles: TIPOS[tipo].plazo, desde, vence, vence_en_palabras: enPalabras(vence) };
  },

  // SMS o WhatsApp con el código. El teléfono lo pone ElevenLabs con la variable de sistema de la llamada, no el modelo.
  // Entrada plana (más fácil para el modelo); cualquier otra clave se rechaza: el texto lo arma _avisos.js.
  aviso({ canal, plantilla, telefono, codigo, fecha, ...sobra }, req) {
    if (Object.keys(sobra).length) throw falla(400, 'Solo se acepta canal, plantilla, telefono, codigo y fecha');
    const datos = plantilla === 'plazo' ? { codigo, fecha } : { codigo };
    return enviarAviso(req, { plantilla, telefono, datos }, uno(canal, ['sms', 'whatsapp'], 'canal'), ['documento_listo', 'plazo']);
  },
};

// Comparación en tiempo constante. Un secreto corto cuenta como no configurado: falla cerrada.
function autorizar(enviado) {
  const secreto = process.env.AGENTE_HERRAMIENTAS_SECRETO || '';
  if (secreto.length < 32) throw falla(503, 'Herramientas del agente cerradas: falta AGENTE_HERRAMIENTAS_SECRETO (32 caracteres o más)');
  const h = s => createHash('sha256').update(String(s ?? '')).digest();
  if (!timingSafeEqual(h(enviado), h(secreto))) throw falla(401, 'No autorizado');
}

export function herramienta(req, res) {
  const nombre = String(req.query?.herramienta ?? '');
  return atender(req, res, {
    POST(b) {
      autorizar(req.headers['x-miderecho-secreto']);
      if (!Object.hasOwn(HERRAMIENTAS, nombre)) throw falla(404, 'Herramienta desconocida');
      return HERRAMIENTAS[nombre](b, req);
    },
  });
}
