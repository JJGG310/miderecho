// Avisos por SMS o WhatsApp con plantillas cerradas: el texto lo arma el servidor, nunca quien llama a la API.
// Solo llevan un código de caso, fechas y horas. Nunca nombres, cédulas, temas ni entidades: el SMS no va cifrado
// y el celular puede ser compartido (investigacion/06, §4.3 D y E). Lo usan sms.js, whatsapp.js y _herramientas.js.
import { falla, celular, gsm, proteger, enviar } from './_comun.js';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const corta = f => `${+f.slice(8)}-${MESES[f.slice(5, 7) - 1]}`;   // igual que cron-recordatorios.js: "30-nov"
const hora = h => { const [hh, mm] = h.split(':').map(Number); return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'a. m.' : 'p. m.'}`; };
const MOSTRAR = { codigo: c => c, fecha: corta, hora };

// Cada dato se valida contra un formato cerrado: así ningún campo sirve para colar texto libre.
const FORMATOS = {
  codigo: c => /^[A-Z0-9]{4,12}$/.test(c),
  fecha: f => /^\d{4}-\d{2}-\d{2}$/.test(f) && !isNaN(Date.parse(f)) && new Date(f).toISOString().startsWith(f),
  hora: h => /^([01]\d|2[0-3]):[0-5]\d$/.test(h),
};

// Sin tildes ni eñes para que el SMS quepa en GSM-7. Para WhatsApp fuera de la ventana de 24 h, cada una necesita
// una plantilla aprobada por Meta en Twilio con las mismas variables, en este orden ({{1}}, {{2}}): TWILIO_WA_<NOMBRE>.
export const PLANTILLAS = {
  documento_listo: { campos: ['codigo'], texto: d => `Su documento ${d.codigo} quedo listo. Si necesita ayuda, vaya con su lider o a la Personeria.` },
  plazo: { campos: ['codigo', 'fecha'], texto: d => `Caso ${d.codigo}: el plazo vence el ${corta(d.fecha)}. Si la entidad no le ha respondido, avise a su lider.` },
  llamada_agendada: { campos: ['fecha', 'hora'], texto: d => `A las ${hora(d.hora)} del ${corta(d.fecha)} le llamaremos. Si usted no la pidio, ignore este mensaje.` },
};

// { plantilla, telefono, datos } → texto fijo. Rechaza cualquier otra clave: el texto libre no entra ni por error.
export function armarAviso(b = {}, permitidas = Object.keys(PLANTILLAS)) {
  const sobra = Object.keys(b).filter(k => !['plantilla', 'telefono', 'datos'].includes(k));
  if (sobra.length) throw falla(400, 'Solo se acepta { plantilla, telefono, datos }: el texto lo pone el servidor');
  if (!permitidas.includes(b.plantilla)) throw falla(400, `Plantilla desconocida. Use: ${permitidas.join(', ')}`);
  const p = PLANTILLAS[b.plantilla], datos = b.datos;
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw falla(400, `Faltan los datos: ${p.campos.join(', ')}`);
  const claves = Object.keys(datos);
  if (claves.length !== p.campos.length || !p.campos.every(k => claves.includes(k) && FORMATOS[k](String(datos[k]))))
    throw falla(400, `Datos inválidos para ${b.plantilla}: solo ${p.campos.join(', ')}, con su formato`);
  const valores = p.campos.map(k => MOSTRAR[k](String(datos[k])));
  return { tel: celular(b.telefono), texto: gsm(p.texto(datos)), valores };
}

export async function enviarAviso(req, b, canal, permitidas) {
  const { tel, texto, valores } = armarAviso(b, permitidas);
  await proteger(req, tel, canal);
  const sid = canal === 'whatsapp' && process.env['TWILIO_WA_' + b.plantilla.toUpperCase()];
  const plantilla = sid && { sid, variables: Object.fromEntries(valores.map((v, i) => [i + 1, v])) };
  return enviar(canal, tel, texto, { plantilla });
}
