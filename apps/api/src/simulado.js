// Asistente simulado: reglas por palabras clave para que el demo funcione sin clave de API.
// Devuelve el mismo formato que la herramienta "responder" del modelo.
import { hayRiesgo } from '@miderecho/nucleo';
import { RESPUESTA_RIESGO } from './orientacion.js';

const tiene = (t, ...ps) => ps.some(p => t.includes(p));

export function responderSimulado(mensajes) {
  const persona = mensajes.filter(m => m.rol === 'persona').map(m => m.texto.toLowerCase());
  const t = persona.join(' ');
  const ultimo = persona.at(-1) || '';

  if (hayRiesgo(t)) return RESPUESTA_RIESGO;

  if (tiene(t, 'factura', 'cobr', 'recibo') && (tiene(t, 'agua', 'luz', 'energ', 'aseo', 'acueducto') || /\bgas\b/.test(t))) {
    const servicio = tiene(t, 'luz', 'energ') ? 'energia' : /\bgas\b/.test(t) ? 'gas' : tiene(t, 'aseo', 'basura') ? 'aseo' : 'acueducto';
    return orientar({
      tema: 'Cobro injusto en la factura', derecho: 'vivienda', documento: 'servicios_publicos',
      resumen: 'Le están cobrando en la factura un valor que no corresponde a lo que consume.',
      dicho_de_otra_forma: 'La empresa no puede cobrarle lo que no gastó. Puede reclamar por escrito y, mientras resuelven, no tiene que pagar lo que está reclamando.',
      posible_vulneracion: 'Podría estar en juego su derecho como usuario a que le cobren solo lo que consume.',
      pasos: ['Busque la factura con el cobro que no reconoce (solo se reclaman las de los últimos 5 meses).', 'Presente el reclamo a la empresa con la app y guarde la copia con la fecha.', 'Espere la respuesta: la empresa tiene 15 días hábiles.', 'Si no le responde a tiempo, la ley entiende que le dio la razón.'],
      donde_acudir: ['Oficina de atención de la empresa', 'Personería del municipio', 'Superintendencia de Servicios Públicos (Superservicios)'],
      buscar_abogado_si: 'Si la empresa niega el reclamo, tiene solo 5 días hábiles para presentar el recurso.',
      datos: { servicio, motivo: 'cobro' },
    }, 'Entiendo: le están cobrando de más en el servicio. Para esto sirve un reclamo a la empresa de servicios públicos: es gratis y no necesita abogado.');
  }

  if (tiene(t, 'agua', 'acueducto', 'camino', 'vía', 'via ', 'puente', 'carretera')) {
    const temaId = tiene(t, 'agua', 'acueducto') ? 'agua' : 'vias';
    return orientar({
      tema: temaId === 'agua' ? 'El agua de la vereda no llega' : 'El camino de la vereda está dañado',
      derecho: 'peticion', documento: 'peticion',
      resumen: temaId === 'agua' ? 'El servicio de agua de la vereda está dañado o suspendido.' : 'La vía o el camino de la vereda está en mal estado.',
      dicho_de_otra_forma: 'Puede pedirle por escrito a la alcaldía que lo arregle. Están obligados a contestarle, y con eso ya queda constancia de que lo pidió.',
      posible_vulneracion: 'Podría estar en juego su derecho a recibir respuesta de las autoridades y a servicios básicos para vivir con dignidad.',
      pasos: ['Haga el derecho de petición a la alcaldía con la app.', 'Envíelo o entréguelo y pida el número de radicado.', 'Cuente 15 días hábiles: la app le avisa cuándo vence.', 'Si no le responden, la app le prepara la tutela.'],
      donde_acudir: ['Alcaldía del municipio', 'Personería del municipio'],
      buscar_abogado_si: 'Si después de la tutela no cumplen, pida orientación en la Personería o un consultorio jurídico.',
      datos: { temaId },
    }, 'Entiendo. Para esto sirve un derecho de petición a la alcaldía: es gratis, no necesita abogado y le deben contestar por escrito.');
  }

  if (tiene(t, 'eps', 'cita', 'medicamento', 'medicina', 'cirug', 'examen', 'hospital', 'salud', 'médico', 'medico')) {
    const que = tiene(t, 'medic') && !tiene(t, 'médico', 'medico') ? 'medicamento' : tiene(t, 'cirug') ? 'cirugia' : tiene(t, 'examen') ? 'examen' : 'cita';
    const urgenteDicho = tiene(ultimo, 'sí', 'si,', 'si ', 'urgente', 'grave') || tiene(t, 'urgente', 'grave', 'empeor');
    const preguntaron = mensajes.some(m => m.rol === 'asistente' && m.texto.includes('urgente'));
    if (!urgenteDicho && !preguntaron) return {
      accion: 'preguntar',
      mensaje: 'Entiendo, es un problema con su atención en salud. ¿Es urgente? ¿Su salud corre peligro si sigue esperando?',
      opciones: ['Sí, es urgente', 'No, pero lo necesito', 'No sé'],
    };
    // "No, pero lo necesito" o "No sé" niegan la urgencia; "no puedo trabajar, es urgente" no.
    const urgente = urgenteDicho && !/^\s*no\s*(,|pero\b|sé\b|$)/.test(ultimo);
    return orientar(urgente ? {
      tema: 'La EPS niega o demora la atención', derecho: 'salud', documento: 'tutela_salud',
      resumen: 'La EPS no le ha dado la atención que le ordenó el médico y su salud corre riesgo si espera.',
      dicho_de_otra_forma: 'Cuando su salud está en riesgo, puede pedirle a un juez que ordene a la EPS darle la atención rápido. No necesita abogado y el juez debe decidir en 10 días.',
      posible_vulneracion: 'Podría estar en juego su derecho a la salud y a la vida en condiciones dignas.',
      pasos: ['Reúna la orden médica y la respuesta de la EPS (o el número de su solicitud).', 'Haga la tutela de salud con la app y pida medida provisional.', 'Llévela al juzgado del municipio o preséntela en Tutela en línea.', 'Diga que es urgente al entregarla.'],
      donde_acudir: ['Juzgado del municipio (reparto)', 'Personería del municipio', 'Superintendencia de Salud'],
      buscar_abogado_si: 'Si el juez niega la tutela, tiene solo 3 días hábiles para impugnar.',
      datos: { que, urgente: true },
    } : {
      tema: 'La EPS no da la atención', derecho: 'salud', documento: 'peticion',
      resumen: 'La EPS no le ha dado la cita, el medicamento o la autorización que necesita.',
      dicho_de_otra_forma: 'Primero pídale por escrito a la EPS que cumpla. Si no le responde o le dice que no, ese papel le sirve después para pedir una tutela.',
      posible_vulneracion: 'Podría estar en juego su derecho a la salud y a recibir respuesta.',
      pasos: ['Haga el derecho de petición a la EPS con la app.', 'Guarde la copia y el número de radicado.', 'Cuente 15 días hábiles: la app le avisa.', 'Si no le responden o se pone urgente, la app le prepara la tutela de salud.'],
      donde_acudir: ['Oficina de la EPS', 'Personería del municipio', 'Superintendencia de Salud'],
      buscar_abogado_si: 'Si su salud empeora mientras espera, no espere los 15 días: haga la tutela de salud.',
      datos: { temaId: 'salud', que },
    }, urgente ? 'Entiendo, es urgente. Para esto sirve una tutela de salud: usted le pide a un juez que proteja su salud, y no necesita abogado.' : 'Entiendo. Para empezar, sirve un derecho de petición a la EPS: es gratis y le deben contestar por escrito.');
  }

  if (tiene(t, 'pago', 'pagan', 'salario', 'sueldo', 'jornal', 'patrón', 'patron', 'trabajé', 'trabaje', 'trabajo', 'despid')) {
    return orientar({
      tema: 'No me pagan lo del trabajo', derecho: 'trabajo', documento: 'ninguno',
      resumen: 'Usted trabajó y no le han pagado lo acordado.',
      dicho_de_otra_forma: 'Su trabajo tiene valor: le deben pagar lo acordado aunque no haya contrato escrito. Un contrato de palabra también vale.',
      posible_vulneracion: 'Podría estar en juego su derecho a recibir el pago por su trabajo.',
      pasos: ['Anote los días que trabajó, cuánto le deben pagar y quién le dio el trabajo.', 'Guarde pruebas: mensajes, fotos, testigos.', 'Pídale el pago por escrito a quien le dio el trabajo.', 'Si no le paga, acuda a la Inspección de Trabajo: es gratis.'],
      donde_acudir: ['Inspección de Trabajo (Ministerio del Trabajo)', 'Consultorio jurídico', 'Personería del municipio'],
      buscar_abogado_si: 'Para cobrar por la vía judicial conviene un consultorio jurídico: lo hacen gratis.',
      datos: {},
    }, 'Entiendo. En este caso no hace falta un documento de la app: lo mejor es acudir a la Inspección de Trabajo, que es gratis.');
  }

  if (tiene(t, 'tierra', 'predio', 'finca', 'lote', 'escritura', 'carta venta', 'título', 'titulo')) {
    return orientar({
      tema: 'No tengo el título de mi tierra', derecho: 'vivienda', documento: 'peticion',
      resumen: 'Usted vive y trabaja un predio pero no tiene el título de propiedad.',
      dicho_de_otra_forma: 'La carta venta prueba que tiene el predio, pero no le da la propiedad. Puede pedirle a la Agencia Nacional de Tierras que inicie la formalización, que es gratis.',
      posible_vulneracion: 'Podría estar en juego su derecho de acceso a la tierra.',
      pasos: ['Guarde la carta venta, recibos y todo lo que muestre que vive y trabaja el predio.', 'Haga un derecho de petición a la Agencia Nacional de Tierras con la app.', 'Nadie puede cobrarle por este trámite: si le piden plata, es una estafa.'],
      donde_acudir: ['Agencia Nacional de Tierras (ANT)', 'Consultorio jurídico'],
      buscar_abogado_si: 'Si hay otra persona que dice ser dueña, busque un consultorio jurídico.',
      datos: { temaId: 'tierras' },
    }, 'Entiendo. Puede empezar con un derecho de petición a la Agencia Nacional de Tierras.');
  }

  if (persona.length < 2) return {
    accion: 'preguntar',
    mensaje: 'Gracias por contarme. ¿Con quién es el problema?',
    opciones: ['Con la alcaldía o una entidad', 'Con la EPS o el hospital', 'Con la empresa del agua o la luz'],
  };

  return orientar({
    tema: 'Pedir respuesta a una entidad', derecho: 'peticion', documento: 'peticion',
    resumen: 'Necesita que una entidad le responda o le solucione algo.',
    dicho_de_otra_forma: 'Puede pedirle por escrito a la entidad lo que necesita. Están obligados a contestarle en 15 días hábiles.',
    posible_vulneracion: 'Podría estar en juego su derecho a recibir respuesta de las autoridades.',
    pasos: ['Haga el derecho de petición con la app.', 'Entréguelo y pida el número de radicado.', 'La app le avisa cuándo vence el plazo.'],
    donde_acudir: ['La entidad', 'Personería del municipio'],
    buscar_abogado_si: 'Si no le responden, la app le prepara la tutela.',
    datos: { temaId: 'otro' },
  }, 'Para esto sirve un derecho de petición: es gratis y no necesita abogado.');
}

const orientar = (orientacion, mensaje) => ({ accion: 'orientar', mensaje, orientacion });
