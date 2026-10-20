// Contenido jurídico y textos del prototipo.
// BORRADOR: un consultorio jurídico debe validarlo antes de usarlo con personas reales (ver investigacion/00, sección 12.5).

export const NOMBRE = 'MiDerecho';
export const VERIFICADO = 'Plantilla en borrador, pendiente de validación jurídica';
export const CORREO_SERVICIO = 'respuestas@miderecho.example'; // buzón del servicio (simulado)

export const AVISO = `<p><b>${NOMBRE}</b> es un servicio gratuito que le ayuda a armar un derecho de petición. Es información general y plantillas: <b>no somos abogados</b> ni reemplazamos a uno.</p>
<p>No le vamos a pedir nada sensible (si es víctima, su etnia, sus creencias o a qué organización pertenece). Solo si usted quiere que enviemos la petición le pediremos nombre y cédula, y se borran apenas se envía.</p>
<p>Puede borrar todo cuando quiera con el botón <b>Borrar todo</b>. Responsable: [Organización], [contacto].</p>`;

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
