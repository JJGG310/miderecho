// Asistente simulado: reglas por palabras clave para que el demo funcione sin clave de API.
// Devuelve el mismo formato que la herramienta "responder" del modelo.
import { hayRiesgo } from '@miderecho/nucleo';

const tiene = (t, ...ps) => ps.some(p => t.includes(p));

export function responderSimulado(mensajes) {
  const persona = mensajes.filter(m => m.rol === 'persona').map(m => m.texto.toLowerCase());
  const t = persona.join(' ');
  const ultimo = persona.at(-1) || '';

  if (hayRiesgo(t)) return {
    accion: 'riesgo',
    mensaje: 'Lo que me cuentas es serio. No te voy a pedir más datos y no vamos a guardar nada de esto. Si hay peligro ahora mismo, llama al 123.',
  };

  if (tiene(t, 'factura', 'cobr', 'recibo') && (tiene(t, 'agua', 'luz', 'energ', 'aseo', 'acueducto') || /\bgas\b/.test(t))) {
    const servicio = tiene(t, 'luz', 'energ') ? 'energia' : /\bgas\b/.test(t) ? 'gas' : tiene(t, 'aseo', 'basura') ? 'aseo' : 'acueducto';
    return orientar({
      tema: 'Cobro injusto en la factura', derecho: 'vivienda', documento: 'servicios_publicos',
      resumen: 'Te están cobrando en la factura un valor que no corresponde a lo que consumes.',
      dicho_de_otra_forma: 'La empresa no puede cobrarte lo que no gastaste. Puedes reclamar por escrito y, mientras resuelven, no tienes que pagar lo que estás reclamando.',
      posible_vulneracion: 'Podría estar en juego tu derecho como usuario a que te cobren solo lo que consumes.',
      pasos: ['Busca la factura con el cobro que no reconoces (solo se reclaman las de los últimos 5 meses).', 'Presenta el reclamo a la empresa con la app y guarda la copia con la fecha.', 'Espera la respuesta: la empresa tiene 15 días hábiles.', 'Si no te responde a tiempo, la ley entiende que te dio la razón.'],
      donde_acudir: ['Oficina de atención de la empresa', 'Personería del municipio', 'Superintendencia de Servicios Públicos (Superservicios)'],
      buscar_abogado_si: 'Si la empresa niega el reclamo, tienes solo 5 días hábiles para presentar el recurso.',
      datos: { servicio, motivo: 'cobro', desde: 'hace un mes' },
    }, 'Entiendo: te están cobrando de más en el servicio. Para esto sirve un reclamo a la empresa de servicios públicos, es gratis y no necesitas abogado.');
  }

  if (tiene(t, 'agua', 'acueducto', 'camino', 'vía', 'via ', 'puente', 'carretera')) {
    const temaId = tiene(t, 'agua', 'acueducto') ? 'agua' : 'vias';
    return orientar({
      tema: temaId === 'agua' ? 'El agua de la vereda no llega' : 'El camino de la vereda está dañado',
      derecho: 'peticion', documento: 'peticion',
      resumen: temaId === 'agua' ? 'El servicio de agua de la vereda está dañado o suspendido.' : 'La vía o el camino de la vereda está en mal estado.',
      dicho_de_otra_forma: 'Puedes pedirle por escrito a la alcaldía que lo arregle. Están obligados a contestarte, y con eso ya queda constancia de que lo pediste.',
      posible_vulneracion: 'Podría estar en juego tu derecho a recibir respuesta de las autoridades y a servicios básicos para vivir con dignidad.',
      pasos: ['Haz el derecho de petición a la alcaldía con la app.', 'Envíalo o entrégalo y pide el número de radicado.', 'Cuenta 15 días hábiles: la app te avisa cuándo vence.', 'Si no te responden, la app te prepara la tutela.'],
      donde_acudir: ['Alcaldía del municipio', 'Personería del municipio'],
      buscar_abogado_si: 'Si después de la tutela no cumplen, pide orientación en la Personería o un consultorio jurídico.',
      datos: { temaId, desde: 'hace un mes' },
    }, 'Entiendo. Para esto sirve un derecho de petición a la alcaldía: es gratis, no necesitas abogado y te deben contestar por escrito.');
  }

  if (tiene(t, 'eps', 'cita', 'medicamento', 'medicina', 'cirug', 'examen', 'hospital', 'salud', 'médico', 'medico')) {
    const que = tiene(t, 'medic') && !tiene(t, 'médico', 'medico') ? 'medicamento' : tiene(t, 'cirug') ? 'cirugia' : tiene(t, 'examen') ? 'examen' : 'cita';
    const urgenteDicho = tiene(ultimo, 'sí', 'si,', 'si ', 'urgente', 'grave') || tiene(t, 'urgente', 'grave', 'empeor');
    const preguntaron = mensajes.some(m => m.rol === 'asistente' && m.texto.includes('urgente'));
    if (!urgenteDicho && !preguntaron) return {
      accion: 'preguntar',
      mensaje: 'Entiendo, es un problema con tu atención en salud. ¿Es urgente? ¿Tu salud corre peligro si sigues esperando?',
      opciones: ['Sí, es urgente', 'No, pero lo necesito', 'No sé'],
    };
    const urgente = urgenteDicho && !tiene(ultimo, 'no,', 'no ', 'no pero');
    return orientar(urgente ? {
      tema: 'La EPS niega o demora la atención', derecho: 'salud', documento: 'tutela_salud',
      resumen: 'La EPS no te ha dado la atención que te ordenó el médico y tu salud corre riesgo si esperas.',
      dicho_de_otra_forma: 'Cuando tu salud está en riesgo, puedes pedirle a un juez que ordene a la EPS atenderte rápido. No necesitas abogado y el juez debe decidir en 10 días.',
      posible_vulneracion: 'Podría estar en juego tu derecho a la salud y a la vida en condiciones dignas.',
      pasos: ['Reúne la orden médica y la respuesta de la EPS (o el número de tu solicitud).', 'Haz la tutela de salud con la app y pide medida provisional.', 'Llévala al juzgado del municipio o preséntala en Tutela en línea.', 'Di que es urgente al entregarla.'],
      donde_acudir: ['Juzgado del municipio (reparto)', 'Personería del municipio', 'Superintendencia de Salud'],
      buscar_abogado_si: 'Si el juez niega la tutela, tienes solo 3 días hábiles para impugnar.',
      datos: { que, desde: 'hace un mes', urgente: true },
    } : {
      tema: 'La EPS no da la atención', derecho: 'salud', documento: 'peticion',
      resumen: 'La EPS no te ha dado la cita, el medicamento o la autorización que necesitas.',
      dicho_de_otra_forma: 'Primero pídele por escrito a la EPS que cumpla. Si no te responde o te dice que no, ese papel te sirve después para pedir una tutela.',
      posible_vulneracion: 'Podría estar en juego tu derecho a la salud y a recibir respuesta.',
      pasos: ['Haz el derecho de petición a la EPS con la app.', 'Guarda la copia y el número de radicado.', 'Cuenta 15 días hábiles: la app te avisa.', 'Si no te responden o se pone urgente, la app te prepara la tutela de salud.'],
      donde_acudir: ['Oficina de la EPS', 'Personería del municipio', 'Superintendencia de Salud'],
      buscar_abogado_si: 'Si tu salud empeora mientras esperas, no esperes los 15 días: haz la tutela de salud.',
      datos: { temaId: 'salud', que, desde: 'hace un mes' },
    }, urgente ? 'Entiendo, es urgente. Para esto sirve una tutela de salud: le pides a un juez que proteja tu salud, y no necesitas abogado.' : 'Entiendo. Para empezar, sirve un derecho de petición a la EPS: es gratis y te deben contestar por escrito.');
  }

  if (tiene(t, 'pago', 'pagan', 'salario', 'sueldo', 'jornal', 'patrón', 'patron', 'trabajé', 'trabaje', 'trabajo', 'despid')) {
    return orientar({
      tema: 'No me pagan lo del trabajo', derecho: 'trabajo', documento: 'ninguno',
      resumen: 'Trabajaste y no te han pagado lo acordado.',
      dicho_de_otra_forma: 'Tu trabajo tiene valor: te deben pagar lo acordado aunque no haya contrato escrito. Un contrato de palabra también vale.',
      posible_vulneracion: 'Podría estar en juego tu derecho a recibir el pago por tu trabajo.',
      pasos: ['Anota los días que trabajaste, cuánto te deben pagar y quién te contrató.', 'Guarda pruebas: mensajes, fotos, testigos.', 'Pídele el pago por escrito a quien te contrató.', 'Si no te paga, acude a la Inspección de Trabajo: es gratis.'],
      donde_acudir: ['Inspección de Trabajo (Ministerio del Trabajo)', 'Consultorio jurídico', 'Personería del municipio'],
      buscar_abogado_si: 'Para cobrar por la vía judicial conviene un consultorio jurídico: lo hacen gratis.',
      datos: {},
    }, 'Entiendo. En este caso no hace falta un documento de la app: lo mejor es acudir a la Inspección de Trabajo, que es gratis.');
  }

  if (tiene(t, 'tierra', 'predio', 'finca', 'lote', 'escritura', 'carta venta', 'título', 'titulo')) {
    return orientar({
      tema: 'No tengo el título de mi tierra', derecho: 'vivienda', documento: 'peticion',
      resumen: 'Vives y trabajas un predio pero no tienes el título de propiedad.',
      dicho_de_otra_forma: 'La carta venta prueba que tienes el predio, pero no te hace dueño. Puedes pedirle a la Agencia Nacional de Tierras que inicie la formalización, que es gratis.',
      posible_vulneracion: 'Podría estar en juego tu derecho de acceso a la tierra.',
      pasos: ['Guarda la carta venta, recibos y todo lo que muestre que vives y trabajas el predio.', 'Haz un derecho de petición a la Agencia Nacional de Tierras con la app.', 'Nadie puede cobrarte por este trámite: si te piden plata, es una estafa.'],
      donde_acudir: ['Agencia Nacional de Tierras (ANT)', 'Consultorio jurídico'],
      buscar_abogado_si: 'Si hay otra persona que dice ser dueña, busca un consultorio jurídico.',
      datos: { temaId: 'tierras', desde: 'hace más de un año' },
    }, 'Entiendo. Puedes empezar con un derecho de petición a la Agencia Nacional de Tierras.');
  }

  if (persona.length < 2) return {
    accion: 'preguntar',
    mensaje: 'Gracias por contarme. ¿Con quién es el problema?',
    opciones: ['Con la alcaldía o una entidad', 'Con la EPS o el hospital', 'Con la empresa del agua o la luz'],
  };

  return orientar({
    tema: 'Pedir respuesta a una entidad', derecho: 'peticion', documento: 'peticion',
    resumen: 'Necesitas que una entidad te responda o te solucione algo.',
    dicho_de_otra_forma: 'Puedes pedirle por escrito a la entidad lo que necesitas. Están obligados a contestarte en 15 días hábiles.',
    posible_vulneracion: 'Podría estar en juego tu derecho a recibir respuesta de las autoridades.',
    pasos: ['Haz el derecho de petición con la app.', 'Entrégalo y pide el número de radicado.', 'La app te avisa cuándo vence el plazo.'],
    donde_acudir: ['La entidad', 'Personería del municipio'],
    buscar_abogado_si: 'Si no te responden, la app te prepara la tutela.',
    datos: { temaId: 'otro' },
  }, 'Para esto sirve un derecho de petición: es gratis y no necesitas abogado.');
}

const orientar = (orientacion, mensaje) => ({ accion: 'orientar', mensaje, orientacion });
