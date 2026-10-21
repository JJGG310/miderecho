// Contenido jurídico y textos del prototipo.
// BORRADOR: un consultorio jurídico debe validarlo antes de usarlo con personas reales (ver investigacion/00, sección 12.5).

export const NOMBRE = 'MiDerecho';
export const VERIFICADO = 'Plantilla en borrador, pendiente de validación jurídica';
export const CORREO_SERVICIO = 'respuestas@miderecho.example'; // buzón del servicio (simulado)

export const AVISO = `<p><b>${NOMBRE}</b> es un servicio gratuito de información y plantillas para armar documentos como el derecho de petición, la tutela o un reclamo. <b>No somos abogados</b> ni reemplazamos a uno.</p>
<p>Lo que usted le cuenta al asistente lo lee Claude, una inteligencia artificial de la empresa Anthropic, en Estados Unidos. Antes intentamos quitar cédulas, teléfonos y correos, pero el filtro no atrapa todo: no escriba nombres, cédulas ni direcciones en el chat. No guardamos la conversación.</p>
<p>Su nombre y su cédula se piden al crear el documento y solo van en el papel: no van a la inteligencia artificial ni se guardan. En este celular quedan sus casos y su historial, que pueden mostrar el tema de su caso, aunque sea de salud: póngale clave al celular o bórrelos con <b>Borrar todo</b>. Contarnos datos delicados (salud, etnia, si es víctima o a qué organización pertenece) es opcional. Responsable: [Organización], [contacto].</p>`;

export const AYUDA_RIESGO = `<p>Aquí no vamos a guardar nada de lo que nos contó.</p>
<ul>
  <li>Si hay peligro ahora: <b>llame al 123</b>.</li>
  <li>La <b>Personería</b> de su municipio o la <b>Defensoría del Pueblo</b> pueden activar rutas de protección.</li>
  <li><b>Programa Somos Defensores</b>: proteccion@somosdefensores.org</li>
</ul>
<p class="nota">Prototipo: números y rutas por confirmar con las entidades aliadas.</p>`;

// Correos institucionales publicados por alcaldías PDET (investigacion/08, revisados el 20-oct-2026). Verificar antes de enviar.
export const MUNICIPIOS = [
  ['El Carmen de Bolívar', 'contactenos@elcarmen-bolivar.gov.co'],
  ['Ovejas', 'contactenos@ovejas-sucre.gov.co'],
  ['San Jacinto', 'contactenos@sanjacinto-bolivar.gov.co'],
  ['María La Baja', 'contactenos@marialabaja-bolivar.gov.co'],
  ['Chaparral', 'contactenos@chaparral-tolima.gov.co'],
  ['Planadas', 'alcaldia@planadas-tolima.gov.co'],
  ['Rioblanco', 'contactenos@rioblanco-tolima.gov.co'],
  ['Ataco', 'alcaldia@ataco-tolima.gov.co'],
  ['Mesetas', 'contactenos@mesetas-meta.gov.co'],
  ['La Macarena', 'alcaldia@lamacarena-meta.gov.co'],
  ['Vista Hermosa', 'contactenos@vistahermosa-meta.gov.co'],
  ['Puerto Rico (Meta)', 'alcaldia@puertorico-meta.gov.co'],
  ['Uribe', 'alcaldia@uribe-meta.gov.co'],
  ['Mapiripán', 'contactenos@mapiripan-meta.gov.co'],
  ['San José del Guaviare', 'contactenos@sanjosedelguaviare-guaviare.gov.co'],
].map(([nombre, correo]) => ({ nombre, correo }));

// {vereda} y {desde} se llenan con lo que responde la persona.
export const TEMAS = [
  { id: 'agua', icono: '💧', titulo: 'Agua y servicios', ayuda: 'Acueducto, luz, basuras', entidad: 'alcaldia',
    hecho: 'El servicio de agua de la vereda {vereda} está dañado o suspendido desde {desde}.',
    peticion: 'Reparar y restablecer el servicio de agua de la vereda.' },
  { id: 'vias', icono: '🛤️', titulo: 'Vías y caminos', ayuda: 'Caminos, puentes, carreteras', entidad: 'alcaldia',
    hecho: 'La vía o el camino de la vereda {vereda} está en mal estado o bloqueado desde {desde}.',
    peticion: 'Reparar la vía o el camino de la vereda.' },
  { id: 'salud', icono: '🏥', titulo: 'Salud', ayuda: 'Citas, medicinas, EPS', entidad: 'eps',
    hecho: 'Desde {desde} no he podido obtener la atención en salud que necesito (cita, medicamento o autorización).',
    peticion: 'Asignar la cita, entregar el medicamento o dar la autorización pendiente.' },
  { id: 'ayudas', icono: '🤝', titulo: 'Ayudas y subsidios', ayuda: 'Programas sociales', entidad: 'alcaldia',
    hecho: 'Desde {desde} solicité información o inclusión en un programa o subsidio y no he recibido respuesta.',
    peticion: 'Informar el estado de mi solicitud y los requisitos que me faltan, si los hay.' },
  { id: 'tierras', icono: '🌱', titulo: 'Tierras', ayuda: 'Formalizar el predio', entidad: 'ant',
    hecho: 'Vivo y trabajo un predio en la vereda {vereda} desde {desde} y no tengo título de propiedad.',
    peticion: 'Iniciar el trámite de formalización del predio que ocupo e informarme los requisitos.' },
  { id: 'educacion', icono: '🏫', titulo: 'Educación', ayuda: 'Escuela, transporte, refrigerio', entidad: 'alcaldia',
    hecho: 'La escuela de la vereda {vereda} presenta problemas (docentes, transporte o alimentación escolar) desde {desde}.',
    peticion: 'Solucionar el problema de la escuela de la vereda.' },
  { id: 'otro', icono: '📝', titulo: 'Otro asunto', ayuda: 'Cuéntelo con sus palabras', entidad: 'alcaldia', hecho: '', peticion: '' },
];

export const PETICIONES_EXTRA = [
  { texto: 'Informar una fecha concreta para la solución.', tipo: 'general' },
  { texto: 'Entregar copia de los documentos relacionados con mi caso.', tipo: 'documentos' },
  { texto: 'Explicar qué norma o decisión aplica a mi caso.', tipo: 'consulta' },
];

// Ley 1755 de 2015, art. 14
export const PLAZOS = { general: 15, documentos: 10, consulta: 30 };

// Ruta "¿Su carta venta lo hace dueño?" (investigacion/09, secciones 3 a 5). [título, texto, ofrece petición a la ANT]
export const CARTA = {
  registrada: ['Usted figura como dueño', 'Si la escritura está inscrita en la Oficina de Registro de Instrumentos Públicos, usted es el dueño. Pida el certificado de tradición y libertad para confirmarlo.', false],
  sinregistro: ['Le falta un paso: registrar', 'La escritura sola no lo hace dueño. Hay que inscribirla en la Oficina de Registro de Instrumentos Públicos. Mientras no se registre, el dueño sigue siendo el anterior. Este trámite tiene costo.', false],
  baldio: ['Si es baldío, la tierra no se compra ni se vende', 'Un predio baldío es de la Nación. Una venta entre particulares no lo hace dueño, y tampoco se gana con los años. Solo la Agencia Nacional de Tierras (ANT) lo adjudica.', true],
  poco: ['Su papel prueba que usted posee, pero no es título', 'Guarde la carta venta, los recibos y todo lo que muestre que usted vive y trabaja el predio. Para formalizar por posesión se necesitan, según el caso, entre 5 y 10 años. Un consultorio jurídico le dice cuándo podrá hacerlo.', false],
  posesion: ['Su papel sirve como prueba. Puede formalizar', 'La carta venta no lo hace dueño, pero prueba que usted posee. Tiene dos caminos: la formalización gratuita de la Agencia Nacional de Tierras (según su patrimonio) o un proceso especial ante el juez (Ley 1561 de 2012), con apoyo gratuito de un consultorio jurídico.', true],
};

// ---------- Tutelas (Decreto 2591 de 1991). Todo el bloque: [validar] con consultorio jurídico ----------
const PRUEBAS = ['Copia de la decisión, carta o respuesta de la entidad', 'Copia de lo que le pedí a la entidad y la prueba de entrega', 'Recibos, fotos u otros papeles que muestren lo que pasa'];
// Los que tienen icono salen en el menú de la tutela general. Los ids no repiten los de TEMAS salvo educación,
// porque el agente de voz manda tema con los ids de TEMAS y solo debe llenar el derecho cuando coincide. {entidad}, {detalle} y {que} se llenan con lo que responde la persona.
export const DERECHOS = [
  { id: 'salud', texto: 'Derechos fundamentales a la salud y a la vida en condiciones dignas (artículos 1, 11 y 49 de la Constitución Política y Ley 1751 de 2015).',
    hecho: 'Necesito {que}, que me ordenó mi médico tratante.',
    hechoMenor: 'Mi hijo(a) necesita {que}, que le ordenó su médico tratante.',
    pretension: 'garantice {que}, tal como lo ordenó el médico tratante',
    pregunta: '¿Cuál? Escriba el nombre si lo sabe (opcional)', ejemplo: 'Ej.: cita con cardiología, insulina',
    pruebas: ['Orden o fórmula médica', 'Historia clínica o concepto del médico', 'Respuesta de la EPS negando el servicio, o el número de radicado de su solicitud', 'Copia de la petición que le hizo a la EPS'] },
  { id: 'minimo_vital', icono: '🍲', titulo: 'Mínimo vital', sub: 'Le quitaron o no le pagan la pensión, el salario o la ayuda con la que vive',
    texto: 'Derechos fundamentales al mínimo vital y a la vida en condiciones dignas (artículos 1, 11, 48 y 53 de la Constitución Política).',
    hecho: '{entidad} suspendió o no me ha pagado {detalle}. Ese dinero es con lo que vivimos mi familia y yo.',
    hechoMenor: '{entidad} suspendió o no le ha pagado a mi hijo(a) {detalle}. Ese dinero es con lo que vivimos.',
    pretension: 'pague o restablezca {detalle}',
    pregunta: '¿Qué le quitaron o no le pagan?', ejemplo: 'Ej.: la pensión, el subsidio de adulto mayor', pruebas: PRUEBAS },
  { id: 'educacion', icono: '🏫', titulo: 'Educación', sub: 'Cupo, transporte, docente o alimentación escolar de un niño o una niña',
    texto: 'Derecho fundamental a la educación (artículos 44 y 67 de la Constitución Política).',
    hecho: '{entidad} no ha garantizado {detalle}.',
    pretension: 'garantice {detalle}',
    pregunta: '¿Qué hace falta?', ejemplo: 'Ej.: el cupo escolar de mi hijo, el transporte escolar', pruebas: PRUEBAS },
  { id: 'debido_proceso', icono: '📋', titulo: 'Debido proceso', sub: 'Una entidad decidió algo contra usted sin escucharlo',
    texto: 'Derecho fundamental al debido proceso (artículo 29 de la Constitución Política).',
    hecho: '{entidad} tomó una decisión que me afecta ({detalle}) sin escucharme ni darme la oportunidad de defenderme.',
    hechoMenor: '{entidad} tomó una decisión que afecta a mi hijo(a) ({detalle}) sin escucharnos ni darnos la oportunidad de defendernos.',
    // CPACA, arts. 74 a 76: recursos contra actos administrativos en 10 días hábiles. [validar]
    otraVia: 'Contra una decisión de una entidad casi siempre se puede presentar un recurso (de reposición o de apelación) dentro de los 10 días hábiles siguientes a la notificación. Si no lo usó, el juez puede decir que la tutela no procede.',
    pretension: 'deje sin efecto esa decisión y me dé la oportunidad de presentar mis argumentos y pruebas antes de volver a decidir',
    pregunta: '¿Qué decidieron?', ejemplo: 'Ej.: me sacaron del programa sin avisarme', pruebas: PRUEBAS },
  // Para quien hizo la petición por fuera de la app; si la hizo aquí, la tutela sale desde Mis casos.
  { id: 'peticion', icono: '📄', titulo: 'Derecho de petición', sub: 'Le pidió algo a una entidad y no le respondieron a tiempo',
    texto: 'Derecho fundamental de petición (artículo 23 de la Constitución Política y Ley 1755 de 2015).',
    hecho: 'Le presenté a {entidad} un derecho de petición en el que pedí {detalle}, y no me ha dado una respuesta de fondo dentro del plazo de la ley.',
    pretension: 'dé una respuesta de fondo, clara, precisa y congruente a mi petición',
    pregunta: '¿Qué le pidió?', ejemplo: 'Ej.: arreglar el camino de la vereda',
    pruebas: ['Copia del derecho de petición', 'Constancia de entrega: sello, número de radicado o correo de envío'] },
  { id: 'otro_derecho', icono: '⚖️', titulo: 'Otro derecho', sub: 'Vida, igualdad, vivienda digna u otro',
    texto: 'Derechos fundamentales que se describen en los hechos.', hecho: '',
    pretension: 'tome las medidas necesarias para proteger mis derechos', pruebas: PRUEBAS },
];

// "¿Qué le niega la EPS?". [validar] el transporte se ha ordenado por tutela a pacientes rurales sin recursos.
export const SALUD_NIEGA = [
  { id: 'cita', icono: '🩺', titulo: 'Una cita con el médico o especialista', frase: 'una cita con especialista' },
  { id: 'medicamento', icono: '💊', titulo: 'Un medicamento', frase: 'un medicamento' },
  { id: 'cirugia', icono: '🏥', titulo: 'Una cirugía o un procedimiento', frase: 'una cirugía o un procedimiento' },
  { id: 'examen', icono: '🔬', titulo: 'Un examen o una autorización', frase: 'un examen o una autorización' },
  { id: 'transporte', icono: '🚌', titulo: 'Transporte para ir al tratamiento', sub: 'Vive lejos y no puede pagar el viaje', frase: 'el transporte para asistir al tratamiento' },
  { id: 'otra_cosa', icono: '📝', titulo: 'Otra cosa', frase: 'un servicio de salud' },
];

export const RAZONES_IMPUGNACION = [
  'El juez no tuvo en cuenta las pruebas que presenté.',
  'Mi situación sigue igual o empeoró: mis derechos siguen sin protección.',
  'El juez dijo que yo tenía otro camino, pero ese camino no es rápido ni eficaz en mi caso.',
];

// ---------- Servicios públicos (Ley 142 de 1994, arts. 152 a 159). [validar] ----------
export const SERVICIOS = [
  { id: 'acueducto', icono: '💧', titulo: 'Agua', nombre: 'acueducto' },   // no 'agua': en TEMAS 'agua' incluye la luz
  { id: 'energia', icono: '💡', titulo: 'Luz', nombre: 'energía eléctrica' },
  { id: 'gas', icono: '🔥', titulo: 'Gas', nombre: 'gas' },
  { id: 'aseo', icono: '🗑️', titulo: 'Alcantarillado o aseo', nombre: 'alcantarillado o aseo' },
];
// {servicio}, {vereda} y {desde} se llenan con lo que responde la persona.
export const MOTIVOS_SP = [
  { id: 'cobro', icono: '🧾', titulo: 'Me cobraron de más', sub: 'Un cobro que no reconozco o que no es lo que gasté',
    hecho: 'Desde {desde}, en la factura del servicio de {servicio} me cobran un valor que no corresponde a lo que consumo.',
    // art. 154: no se reclaman facturas de más de 5 meses ni procede recurso contra ellas; art. 155: no se exige pagar lo reclamado
    // recurso: si la empresa lo niega, procede el recurso de reposición y apelación (art. 154: facturación, suspensión, corte)
    nota: 'Si puede, escriba abajo el mes de la factura y el valor que le cobraron. Solo se pueden reclamar facturas de los últimos 5 meses. Para reclamar no tiene que pagar lo que está reclamando.',
    recurso: true,
    // [validar] el art. 155 protege del corte mientras se resuelven los recursos presentados a tiempo
    peticiones: ['Revisar la factura y cobrarme solo lo que realmente consumí.', 'Revisar el medidor y entregarme el resultado de la revisión.', 'No suspender el servicio mientras resuelven este reclamo (artículo 155 de la Ley 142 de 1994).'] },
  { id: 'corte', icono: '✂️', titulo: 'Me cortaron el servicio', sub: 'Me lo suspendieron o cortaron',
    hecho: 'El servicio de {servicio} de mi vivienda en la vereda {vereda} está suspendido o cortado desde {desde}.',
    recurso: true,
    peticiones: ['Reconectar el servicio de inmediato.', 'Explicarme por escrito el motivo de la suspensión o el corte.', 'No cobrarme la reconexión si el corte no tenía razón.'] },
  { id: 'dano', icono: '🔧', titulo: 'Hay un daño o una falla', sub: 'El servicio no llega o llega mal',
    hecho: 'El servicio de {servicio} en la vereda {vereda} falla o no llega desde {desde}.',
    peticiones: ['Reparar el daño y restablecer el servicio.', 'Aplicar los descuentos por falla en la prestación del servicio (artículo 137 de la Ley 142 de 1994).'] },
  { id: 'otro', icono: '📝', titulo: 'Otro problema', sub: 'Cuéntelo con sus palabras', hecho: '', peticiones: [] },
];

export const RAZONES_RECURSO = [
  'La empresa no revisó el medidor ni mi caso antes de decidir.',
  'El cobro no corresponde a lo que consumo normalmente.',
  'La respuesta no explica las razones ni las pruebas de la decisión.',
  'El servicio sigue fallando o sigue suspendido.',
];

// Explicaciones de lo que sigue después de cada documento. {entidad} se llena en la app. [validar] todo el bloque.
export const EXPLICA = {
  juramento: 'La ley no deja presentar dos tutelas por los mismos hechos (Decreto 2591 de 1991, artículos 37 y 38).',
  yaPresento: `<p>Presentar otra tutela por lo mismo puede traerle una sanción. Lo que sigue depende del fallo:</p>
    <ul><li>Si el juez se la <b>negó</b>, puede <b>impugnar</b> dentro de los 3 días hábiles siguientes a la notificación.</li>
    <li>Si el juez le <b>dio la razón</b> y no le cumplen, puede pedir el <b>desacato</b>.</li></ul><p>Anote su tutela en Mis casos y le decimos qué hacer.</p>`,
  // carencia actual de objeto por hecho superado
  hechoSuperado: '<p>La tutela sirve para problemas que siguen pasando. Si ya le dieron lo que necesitaba, normalmente ya no hay nada que el juez pueda ordenar.</p><p>Si le causaron un daño, pida orientación gratis en un consultorio jurídico o en la Personería.</p>',
  // subsidiariedad: en salud la Corte suele exigir que antes se le haya pedido a la EPS
  subsidiariedad: '<p>El juez revisa si usted ya intentó resolverlo con la entidad. Si todavía no le ha pedido, conviene hacer primero un derecho de petición: así queda claro que usted ya lo intentó.</p>',
  inmediatez: '<p>El juez revisa que la tutela se presente pronto, cuando el problema está pasando. Si empezó hace mucho, explique en el documento por qué no la presentó antes y que el problema sigue hoy.</p>',
  orientacion: '<p>Antes de presentarla puede pedir orientación gratis en la Personería de su municipio o en un consultorio jurídico.</p>',
  // Decreto 2591, art. 10: se pueden agenciar derechos ajenos si el titular no puede defenderse; también la Defensoría y la Personería. [validar]
  otraPersona: '<p>La tutela la presenta la persona a la que le niegan el derecho. Si esa persona no puede hacerlo por sí misma (por ejemplo, está muy enferma), la Personería o la Defensoría del Pueblo pueden presentarla por ella.</p><p>Acérquese a la Personería de su municipio: es gratis.</p>',
  presentarTutela: 'Llene a mano su nombre, cédula y teléfono, y fírmela. Llévela con copia de sus papeles al juzgado de su municipio (pida que la reciban para reparto) o preséntela por internet en Tutela en línea. La Personería puede ayudarle. No necesita abogado.',
  urgente: 'Al entregarla, diga que es urgente: pidió una medida provisional.',
  ganada: '<p>El juez le ordenó a {entidad} cumplir, casi siempre en 48 horas. Si no cumple, puede pedir el <b>desacato</b>: el juez puede sancionar al responsable con arresto y multa (Decreto 2591 de 1991, artículo 52).</p>',
  impugnar: '<p>Si no está de acuerdo con el fallo, puede impugnarlo para que un juez superior lo revise. Es gratis, no necesita abogado y se puede hacer por escrito o en persona en el juzgado.</p>',
  presentarImpugnacion: 'Llene a mano sus datos y el número del proceso (está en el fallo), fírmela y entréguela en el mismo juzgado que decidió la tutela.',
  impugnacionVencida: '<p>Pasaron los 3 días hábiles para impugnar y el fallo quedó en firme. Un consultorio jurídico o la Personería pueden revisar si queda otro camino.</p>',
  negadaDosVeces: '<p>El juez de segunda instancia también dijo que no. La Corte Constitucional escoge algunos fallos para revisarlos, y la Defensoría del Pueblo puede pedirle que revise el suyo. Un consultorio jurídico puede orientarle.</p>',
  desacato: 'Escríbalo como está en el fallo, si lo tiene a mano. Si no, déjelo en blanco y adjunte una copia del fallo.',
  presentarDesacato: 'Llene a mano sus datos y el número del proceso, fírmela y entréguela en el mismo juzgado que decidió la tutela, con una copia del fallo.',
  desacatoAnotado: '<p>El juez debe resolver el desacato pronto. Guarde la constancia de entrega.</p>',
  desacatoYa: '<p>Pregunte en el juzgado cómo va su desacato. La Personería puede acompañarle y exigir que se cumpla el fallo.</p>',
  silencioCorto: 'Si no responde a tiempo, la ley entiende que le dio la razón (silencio administrativo positivo).',
  // art. 158; reconocimiento en 72 horas: Decreto 2150 de 1995, art. 123 [validar]
  silencio: `<p>Si {entidad} no le respondió en 15 días hábiles, la ley entiende que le dio la razón (silencio administrativo positivo, artículo 158 de la Ley 142 de 1994), salvo que la demora haya sido por su causa o que hiciera falta practicar pruebas.</p>
    <p>Confírmelo con la Personería o con la <b>Superintendencia de Servicios Públicos (Superservicios)</b>. La empresa debe reconocerlo dentro de las 72 horas siguientes; si no lo hace, la Superservicios puede sancionarla y obligarla a cumplir.</p>
    <p class="nota">Guarde la copia de su reclamo con la fecha de entrega: es su prueba. Prototipo: canales de la Superservicios por confirmar.</p>`,
  // art. 157: las personerías asesoran a los usuarios que quieran presentar recursos
  recurso: '<p>Si no está de acuerdo con la respuesta, puede pedir que la empresa la revise (recurso de reposición) y, si insiste en negarlo, que decida la Superservicios (apelación). Es gratis y no necesita abogado. La Personería puede ayudarle a presentarlo.</p>',
  // art. 155: para recurrir hay que acreditar el pago de lo no discutido o del promedio de los últimos 5 periodos
  pagoRecurso: 'Para presentarlo debe tener pagada la parte de la factura que no está discutiendo, o el promedio de lo que pagó en los últimos 5 meses.',
  // art. 154: el recurso procede contra facturación, suspensión, terminación y corte [validar]
  sinRecurso: '<p>El recurso ante la empresa sirve para cobros en la factura y para cortes o suspensiones del servicio. Para un daño u otro problema, puede quejarse ante la Superintendencia de Servicios Públicos (Superservicios) o pedir orientación gratis en la Personería.</p>',
  recursoVencido: '<p>Pasaron los 5 días hábiles para el recurso y la decisión de la empresa quedó en firme. Puede pedir orientación en la Personería o quejarse ante la Superservicios.</p>',
  apelacion: '<p>Como pidió la apelación, la empresa debe enviar su caso a la Superintendencia de Servicios Públicos (Superservicios), que toma la decisión final. Si la empresa no lo envía, quéjese ante la Superservicios.</p>',
};
