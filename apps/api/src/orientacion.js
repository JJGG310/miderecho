// Contrato de la respuesta del asistente y textos jurídicos fijos.
// La IA conversa, entiende y clasifica. Lo jurídico ("Qué dice la ley", plazos, plantillas) sale de contenido fijo validable.
import { derechoInfo, TEMAS, SERVICIOS, MOTIVOS_SP, SALUD_NIEGA, DERECHOS, DERECHOS_INFO, EXPLICA, TIPOS } from '@miderecho/nucleo';

export const DOCUMENTOS = ['peticion', 'tutela_salud', 'tutela', 'servicios_publicos', 'ninguno'];
export const DESDE = ['hace una semana', 'hace un mes', 'hace tres meses', 'hace seis meses', 'hace más de un año'];

// Esquema de la herramienta "responder": el modelo SIEMPRE contesta llenándolo.
export const HERRAMIENTA = {
  name: 'responder',
  description: 'Responde a la persona. Úsala en cada turno.',
  input_schema: {
    type: 'object',
    properties: {
      accion: {
        type: 'string', enum: ['preguntar', 'orientar', 'riesgo', 'fuera_de_alcance'],
        description: 'preguntar: falta un dato clave (máximo 3 preguntas en toda la conversación). orientar: ya entiendes el problema. riesgo: amenazas, grupos armados, violencia o peligro físico. fuera_de_alcance: no es un tema legal de la app.',
      },
      mensaje: { type: 'string', description: 'Lo que lees a la persona. Español colombiano sencillo, tuteo, máximo 3 frases cortas. Una sola pregunta si accion=preguntar.' },
      opciones: { type: 'array', items: { type: 'string' }, maxItems: 3, description: 'Respuestas rápidas (botones) para la pregunta, si aplica.' },
      orientacion: {
        type: 'object',
        description: 'Solo si accion=orientar.',
        properties: {
          tema: { type: 'string', description: 'Título corto del problema, 2 a 6 palabras. Ej.: "Cobro injusto en la factura del agua".' },
          resumen: { type: 'string', description: 'Qué entendiste, en 1 o 2 frases, sin nombres propios ni datos personales.' },
          derecho: { type: 'string', enum: DERECHOS_INFO.map(d => d.id), description: 'Derecho del catálogo más relacionado.' },
          dicho_de_otra_forma: { type: 'string', description: 'Qué significa esto para la persona, en palabras de todos los días. 2 frases.' },
          posible_vulneracion: { type: 'string', description: 'Qué derecho PODRÍA estar en juego. Nunca afirmes que hubo una violación ni prometas resultados.' },
          documento: { type: 'string', enum: DOCUMENTOS, description: 'Documento que sirve. ninguno si la ruta es acudir a una entidad (ej.: Inspección de Trabajo, Comisaría, conciliación).' },
          pasos: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5, description: 'Pasos numerados, concretos y cortos.' },
          donde_acudir: { type: 'array', items: { type: 'string' }, maxItems: 3, description: 'Entidades a las que puede acudir (Personería, Defensoría, Inspección de Trabajo, Superservicios, consultorio jurídico...).' },
          buscar_abogado_si: { type: 'string', description: 'Cuándo conviene buscar un abogado o consultorio jurídico, o plazos que no debe dejar pasar.' },
          datos: {
            type: 'object',
            description: 'Lo que ya sabes para prellenar el documento. Omite lo que no sepas.',
            properties: {
              temaId: { type: 'string', enum: TEMAS.map(t => t.id), description: 'Solo para documento=peticion.' },
              servicio: { type: 'string', enum: SERVICIOS.map(s => s.id), description: 'Solo para servicios_publicos.' },
              motivo: { type: 'string', enum: MOTIVOS_SP.map(m => m.id), description: 'Solo para servicios_publicos.' },
              que: { type: 'string', enum: SALUD_NIEGA.map(s => s.id), description: 'Solo para tutela_salud.' },
              derecho: { type: 'string', enum: DERECHOS.map(d => d.id), description: 'Solo para tutela.' },
              desde: { type: 'string', enum: DESDE },
              urgente: { type: 'boolean', description: 'Solo salud: la persona dice que su vida o salud corre riesgo si espera.' },
            },
          },
        },
        required: ['tema', 'resumen', 'derecho', 'dicho_de_otra_forma', 'documento', 'pasos'],
      },
    },
    required: ['accion', 'mensaje'],
  },
};

const LEY_SP = 'La Ley 142 de 1994 (artículos 152 a 159) le permite a todo usuario presentar reclamos ante la empresa de servicios públicos. La empresa debe responder en 15 días hábiles; si no lo hace, se entiende que resolvió a favor del usuario (silencio administrativo positivo, artículo 158).';
const LEY_TUTELA = 'El artículo 86 de la Constitución y el Decreto 2591 de 1991 permiten que cualquier persona, sin abogado, pida a un juez proteger un derecho fundamental vulnerado o amenazado. El juez debe decidir en 10 días.';

// "Qué dice la ley" nunca lo escribe la IA: se toma del contenido fijo según el documento o el derecho.
export function leyFija(documento, derecho) {
  if (documento === 'servicios_publicos') return { texto: LEY_SP, normas: 'Ley 142 de 1994, artículos 152 a 159.' };
  if (documento === 'tutela') return { texto: LEY_TUTELA, normas: 'Constitución Política, artículo 86; Decreto 2591 de 1991.' };
  const d = derechoInfo(documento === 'peticion' ? 'peticion' : documento === 'tutela_salud' ? 'salud' : derecho) || derechoInfo('otros');
  return { texto: d.queDiceLaLey, normas: d.normas, fuente: d.fuente };
}

// Texto fijo del protocolo de riesgo (reglas del servidor, modo básico y bloqueos de seguridad de la IA).
export const RESPUESTA_RIESGO = { accion: 'riesgo', mensaje: 'Lo que me cuentas es serio. No te voy a pedir más datos y no vamos a guardar nada de esto. Si hay peligro ahora mismo, llama al 123.' };

const MAX_CAMPO = 600;
// Ajusta un valor al esquema de la herramienta: descarta claves desconocidas y valores fuera del catálogo,
// deja en las listas solo textos y recorta largos. undefined si no cumple el tipo, el catálogo o lo obligatorio.
function ajustar(v, s) {
  if (s.type === 'string') {
    if (typeof v !== 'string' || !v.trim()) return;
    return s.enum ? (s.enum.includes(v) ? v : undefined) : v.trim().slice(0, MAX_CAMPO);
  }
  if (s.type === 'boolean') return typeof v === 'boolean' ? v : undefined;
  if (s.type === 'array') {
    if (!Array.isArray(v)) return;
    const l = v.map(x => ajustar(x, s.items)).filter(x => x !== undefined).slice(0, s.maxItems);
    return l.length >= (s.minItems || 0) ? l : undefined;
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return;
  const o = {};
  for (const [k, sk] of Object.entries(s.properties)) {
    const x = ajustar(v[k], sk);
    if (x !== undefined) o[k] = x;
  }
  return (s.required || []).every(k => k in o) ? o : undefined;
}

// Valida, normaliza y completa la respuesta del modelo (o del modo simulado) antes de mandarla a la app.
// null si no cumple el contrato: quien llama usa el modo básico.
export function armarRespuesta(entrada) {
  const r = ajustar(entrada, HERRAMIENTA.input_schema);
  if (!r || (r.accion === 'orientar' && !r.orientacion)) return null;
  const out = { accion: r.accion, mensaje: r.mensaje, opciones: r.opciones || [] };
  if (r.accion === 'orientar') {
    const o = r.orientacion;
    const ley = leyFija(o.documento, o.derecho);
    out.orientacion = {
      ...o,
      ley,
      documento_titulo: o.documento && o.documento !== 'ninguno' ? TIPOS[o.documento]?.titulo : null,
      plazo_respuesta: o.documento && TIPOS[o.documento]?.plazo,
      silencio: o.documento === 'servicios_publicos' ? EXPLICA.silencioCorto : undefined,
      aviso: 'Esto es información general, no consejo de abogado.',
    };
  }
  if (r.accion === 'riesgo') out.riesgo = true;
  return out;
}
