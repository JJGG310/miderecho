// Herramientas de servidor ("server tools") del agente de voz por teléfono. En una llamada no hay app: ElevenLabs las
// llama durante la conversación con POST /api/elevenlabs-sesion?herramienta=<nombre> (agente/telefono.md, §5).
// El agente solo escoge valores de listas cerradas; lo jurídico (documento, plazo, ley, frases) lo pone el servidor.
// Protegidas con un secreto compartido que ElevenLabs manda en la cabecera x-miderecho-secreto. Sin la variable
// AGENTE_HERRAMIENTAS_SECRETO quedan cerradas (503). Los logs no llevan datos de la persona.
// `conversacion` llega de la variable de sistema {{system__conversation_id}} (no la dice el modelo): con ella se ata
// el código a la llamada y se bloquean documento y aviso cuando se activó el protocolo de riesgo.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { TIPOS, MUNICIPIOS, TEMAS, SERVICIOS, MOTIVOS_SP, SALUD_NIEGA, DERECHOS, DERECHOS_INFO, generarDocumento, sumarHabiles, iso, deIso } from '@miderecho/nucleo';
import { leyFija, DESDE } from '../../apps/api/src/orientacion.js';
import { atender, falla, kv, cifrar, descifrar, hmac, hoyColombia, simulado } from './_comun.js';
import { enviarAviso } from './_avisos.js';

const DOCUMENTOS = ['peticion', 'tutela_salud', 'tutela', 'servicios_publicos'];
const AVISO = 'Esto es información general, no consejo de abogado.';
const LINEA = '______________';
const HORAS_CODIGO = 72;   // el código vive 3 días: a veces hay un día de camino hasta la Personería (investigacion/11, §3.8)
const ahora = () => Math.floor(Date.now() / 1000);
// Frases fijas: el agente las lee tal cual. Iguales a FRASES de apps/web/src/lib/agenteVoz.js (lo revisa la prueba).
export const FRASE = {
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
// Solo municipios de la lista del núcleo (sin tildes ni mayúsculas; "Puerto Rico" vale por "Puerto Rico (Meta)").
const norm = t => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
function municipioDe(m) {
  const n = MUNICIPIOS.find(x => [x.nombre, x.nombre.replace(/ \(.*\)$/, '')].some(v => norm(v) === norm(m)));
  if (typeof m !== 'string' || !n) throw falla(400, `municipio debe ser uno de: ${MUNICIPIOS.map(x => x.nombre).join(', ')}`);
  return n.nombre;
}
const fechaDe = f => {
  if (typeof f !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(f) || iso(deIso(f)) !== f) throw falla(400, 'desde debe ser una fecha AAAA-MM-DD');
  return f;
};
const conversacionDe = c => {
  if (typeof c !== 'string' || !/^[\w-]{4,100}$/.test(c)) throw falla(400, 'Falta conversacion ({{system__conversation_id}})');
  return hmac('conv:' + c);
};
// Con el protocolo de riesgo activo en esta llamada no se arma documento ni se manda nada.
async function sinRiesgo(conv) {
  if ((await kv(['GET', 'riesgo:' + conv]))[0]) throw falla(403, 'Protocolo de riesgo activo: no se arma documento ni se envían mensajes');
}
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
  // El registro queda atado a la llamada (HMAC de su id) para que el aviso solo pueda mandar códigos de esta conversación.
  async documento({ conversacion, ...b }) {
    const conv = conversacionDe(conversacion);
    await sinRiesgo(conv);
    const c = datosDocumento(b);
    try { generarDocumento(c.tipo, c); } catch { throw falla(400, 'Faltan datos para el documento'); }
    const codigo = nuevoCodigo();
    await kv(['SET', 'doc:' + hmac('doc:' + codigo), cifrar(JSON.stringify({ ...c, conv })), 'EXAT', ahora() + HORAS_CODIGO * 3600]);
    return { codigo, deletreado: codigo.split('').join(', '), titulo: TIPOS[c.tipo].titulo, pide: c.peticiones ?? [], para: c.entidad.replace(LINEA, '(lo escribe a mano)'),
      plazo_dias_habiles: c.plazo, codigo_sirve_dias: HORAS_CODIGO / 24, aviso: AVISO };
  },

  // Cuándo vence el plazo de respuesta, en días hábiles de Colombia (con festivos).
  plazo(b) {
    const tipo = uno(b.tipo, DOCUMENTOS, 'tipo'), desde = b.desde == null ? hoyColombia() : fechaDe(b.desde);
    const vence = iso(sumarHabiles(deIso(desde), TIPOS[tipo].plazo));
    return { dias_habiles: TIPOS[tipo].plazo, desde, vence, vence_en_palabras: enPalabras(vence) };
  },

  // SMS o WhatsApp con el código de un documento de ESTA llamada. El teléfono lo pone ElevenLabs con la variable de
  // sistema de la llamada, no el modelo; la fecha del plazo la calcula el servidor (desde = día de entrega, o hoy).
  // Entrada plana (más fácil para el modelo); cualquier otra clave se rechaza: el texto lo arma _avisos.js.
  async aviso({ canal, plantilla, telefono, codigo, desde, conversacion, ...sobra }, req) {
    if (Object.keys(sobra).length) throw falla(400, 'Solo se acepta canal, plantilla, telefono, codigo, desde y conversacion');
    canal = uno(canal, ['sms', 'whatsapp'], 'canal');
    const conv = conversacionDe(conversacion);
    await sinRiesgo(conv);
    // ponytail: el servidor no puede comprobar que el teléfono sea el de quien llama; hasta atarlo (agente/telefono.md §5),
    // el envío real solo va a NUMEROS_DEMO aunque PERMITIR_ENVIO_ABIERTO esté puesto.
    if (!simulado(canal) && !process.env.NUMEROS_DEMO) throw falla(503, 'Avisos del agente cerrados: configure NUMEROS_DEMO');
    const [guardado] = typeof codigo === 'string' ? await kv(['GET', 'doc:' + hmac('doc:' + codigo)]) : [null];
    const doc = guardado && JSON.parse(descifrar(guardado));
    if (!doc || doc.conv !== conv) throw falla(404, 'Ese código no es de un documento de esta llamada, o ya venció');
    const datos = plantilla === 'plazo'
      ? { codigo, fecha: iso(sumarHabiles(deIso(desde == null ? hoyColombia() : fechaDe(desde)), doc.plazo)) }
      : { codigo };
    return enviarAviso(req, { plantilla, telefono, datos }, canal, ['documento_listo', 'plazo']);
  },

  // Protocolo de riesgo en la llamada: desde aquí documento y aviso quedan bloqueados para esta conversación (24 h).
  async riesgo({ conversacion }) {
    await kv(['SET', 'riesgo:' + conversacionDe(conversacion), '1', 'EXAT', ahora() + 86400]);
    return { ok: true, indicacion: 'No use más herramientas ni pregunte nada del caso. Diga el texto fijo del protocolo de riesgo.' };
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
