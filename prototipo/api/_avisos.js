// Avisos por SMS o WhatsApp con plantillas cerradas: el texto lo arma el servidor, nunca quien llama a la API.
// Solo llevan el código del caso y una fecha. Nunca nombres, cédulas, temas ni entidades: el SMS no va cifrado
// y el celular puede ser compartido (investigacion/06, §4.3 D y E). Lo usan sms.js, whatsapp.js y _herramientas.js.
import { atender, falla, celular, gsm, proteger, enviar } from './_comun.js';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const corta = f => `${+f.slice(8)}-${MESES[f.slice(5, 7) - 1]}`;   // igual que cron-recordatorios.js: "30-nov"
const MOSTRAR = { codigo: c => c, fecha: corta };

// Cada dato es un texto con formato cerrado: así ningún campo sirve para colar texto libre.
// El código es el del generador de la app (4 caracteres, sin I, O, 0 ni 1).
const FORMATOS = {
  codigo: c => /^[A-HJ-NP-Z2-9]{4}$/.test(c),
  fecha: f => /^\d{4}-\d{2}-\d{2}$/.test(f) && new Date(f + 'T12:00:00Z').toISOString().startsWith(f),
};

// Sin tildes ni eñes para que el SMS quepa en GSM-7. Para WhatsApp fuera de la ventana de 24 h, cada una necesita
// una plantilla aprobada por Meta en Twilio con las mismas variables, en este orden ({{1}}, {{2}}): TWILIO_WA_<NOMBRE>.
export const PLANTILLAS = {
  documento_listo: { campos: ['codigo'], texto: d => `Su documento ${d.codigo} quedo listo. Si necesita ayuda, vaya con su lider o a la Personeria.` },
  plazo: { campos: ['codigo', 'fecha'], texto: d => `Caso ${d.codigo}: el plazo vence el ${corta(d.fecha)}. Si la entidad no le ha respondido, avise a su lider.` },
};

// { plantilla, telefono, datos } → texto fijo. Rechaza cualquier otra clave: el texto libre no entra ni por error.
export function armarAviso(b = {}, permitidas = Object.keys(PLANTILLAS)) {
  const sobra = Object.keys(b).filter(k => !['plantilla', 'telefono', 'datos'].includes(k));
  if (sobra.length) throw falla(400, 'Solo se acepta { plantilla, telefono, datos }: el texto lo pone el servidor');
  if (!permitidas.includes(b.plantilla)) throw falla(400, `Plantilla desconocida. Use: ${permitidas.join(', ')}`);
  const p = PLANTILLAS[b.plantilla], datos = b.datos;
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw falla(400, `Faltan los datos: ${p.campos.join(', ')}`);
  if (Object.keys(datos).length !== p.campos.length || !p.campos.every(k => typeof datos[k] === 'string' && FORMATOS[k](datos[k])))
    throw falla(400, `Datos inválidos para ${b.plantilla}: solo ${p.campos.join(', ')}, como texto con su formato`);
  return { tel: celular(b.telefono), texto: gsm(p.texto(datos)), valores: p.campos.map(k => MOSTRAR[k](datos[k])) };
}

export async function enviarAviso(req, b, canal, permitidas) {
  const { tel, texto, valores } = armarAviso(b, permitidas);
  await proteger(req, tel, canal);
  const sid = canal === 'whatsapp' && process.env['TWILIO_WA_' + b.plantilla.toUpperCase()];
  const plantilla = sid && { sid, variables: Object.fromEntries(valores.map((v, i) => [i + 1, v])) };
  return enviar(canal, tel, texto, { plantilla });
}

// Manejador listo para enrutar: POST { plantilla, telefono, datos } por ese canal (sms.js, whatsapp.js o un despachador).
export const manejarAviso = canal => (req, res) => atender(req, res, { POST: b => enviarAviso(req, b, canal) });
