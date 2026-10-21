// Plantillas de los documentos: funciones puras, sin DOM. Se usan en el navegador y en Node (servidor, agente telefónico).
// BORRADOR: un consultorio jurídico debe validarlas antes de usarlas con personas reales (investigacion/12, sección 6).
import { NOMBRE, CORREO_SERVICIO, TEMAS, DERECHOS, SALUD_NIEGA, SERVICIOS, MOTIVOS_SP } from './contenido.js';
import { deIso } from './plazos.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fechaDoc = d => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
const linea = '______________________';
// El aviso de borrador (VERIFICADO) se muestra en la app, no en el papel que llega al juez o a la entidad.
const pie = `<p class="pie">Documento preparado con ${NOMBRE}.</p>`;
// Datos de la persona: si los dio en el paso "Tus datos para el documento" van impresos; si no, queda la línea para llenar a mano.
const accionante = c => `${esc(c.nombre || linea)}, C.C. ${esc(c.cedula || linea)}`;
const dondeRecibe = c => `${c.direccion ? esc(c.direccion) : `Vereda ${esc(c.vereda)}, ${esc(c.municipio)}`}. Teléfono: ${esc(c.telefono || linea)}`;
const firmaJudicial = c => `<p class="firma">${linea}<br>Firma<br>${c.nombre ? `${esc(c.nombre)}<br>` : ''}C.C. ${esc(c.cedula || linea)}</p>`;
const lista = xs => `<ol>${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
const de = (xs, id) => xs.find(x => x.id === id);
const derecho = id => de(DERECHOS, id) || de(DERECHOS, 'otro_derecho');
const hechoTutela = c => { const d = derecho(c.derecho); return (c.afectado === 'menor' && d.hechoMenor) || d.hecho; };

// plazo: días hábiles que tiene la entidad, la empresa o el juez para responder o decidir.
// presentar: días hábiles que tiene la persona para presentar el documento.
export const TIPOS = {
  peticion: { titulo: 'Derecho de petición', corto: 'la petición', icono: '📄', plazo: 15, doc: docPeticion },   // 10, 15 o 30 según lo que pide (PLAZOS en contenido.js)
  // Decreto 2591 de 1991, art. 29: fallo dentro de los 10 días siguientes a la presentación. [validar: hábiles]
  tutela_peticion: { titulo: 'Tutela por petición no respondida', corto: 'la tutela', icono: '⚖️', plazo: 10, doc: docTutelaPeticion },
  tutela_salud: { titulo: 'Tutela de salud', corto: 'la tutela', icono: '🏥', plazo: 10, doc: docTutela },
  tutela: { titulo: 'Tutela', corto: 'la tutela', icono: '⚖️', plazo: 10, doc: docTutela },
  // Art. 31: 3 días después de la notificación. Art. 32: el superior decide en 20 días desde que recibe el expediente. [validar: hábiles]
  impugnacion: { titulo: 'Impugnación del fallo de tutela', corto: 'la impugnación', icono: '↩️', presentar: 3, plazo: 20, doc: docImpugnacion },
  desacato: { titulo: 'Incidente de desacato', corto: 'el desacato', icono: '🔔', doc: docDesacato },   // art. 52
  // Ley 142 de 1994, art. 158: 15 días hábiles para responder, si no, silencio administrativo positivo.
  servicios_publicos: { titulo: 'Reclamo de servicios públicos', corto: 'el reclamo', icono: '💡', plazo: 15, doc: docReclamo },
  // Art. 154: recurso dentro de los 5 días siguientes a conocer la decisión. Art. 158 también aplica a los recursos.
  recurso_servicios: { titulo: 'Recurso de servicios públicos', corto: 'el recurso', icono: '💡', presentar: 5, plazo: 15, doc: docRecurso },
};

export const generarDocumento = (tipo, datos, hoy = new Date()) => TIPOS[tipo].doc(datos, hoy);

// Frase plantilla de los hechos según el documento; {campo} se llena con valor().
export function plantillaHecho(c) {
  if (c.tipo === 'servicios_publicos') return de(MOTIVOS_SP, c.motivo)?.hecho;
  if (c.tipo?.startsWith('tutela')) return hechoTutela(c);
  return de(TEMAS, c.temaId)?.hecho;
}
export function valor(c, k) {
  if (k === 'servicio') return de(SERVICIOS, c.servicio)?.nombre;
  if (k === 'que') { const q = de(SALUD_NIEGA, c.que); return q && q.frase + (c.detalle ? ` (${c.detalle})` : ''); }
  return c[k];
}
export const llenar = (plantilla, c) => plantilla.replace(/\{(\w+)\}/g, (_, k) => valor(c, k) ?? '');

function docPeticion(c, hoy) {
  const t = de(TEMAS, c.temaId);
  const hechos = [t.hecho && llenar(t.hecho, c), c.palabras].filter(Boolean);
  const respuesta = c.modo === 'envio'
    ? `Vereda ${c.vereda}, ${c.municipio}. Correo: ${CORREO_SERVICIO} (servicio que autoricé para recibir y reenviarme la respuesta).`
    : `Vereda ${c.vereda}, ${c.municipio}.${c.direccion ? ` Dirección o correo: ${c.direccion}.` : ` Otra dirección o correo: ${linea}`}`;
  return `<article class="doc">
    <p>${esc(c.municipio)}, ${fechaDoc(hoy)}</p>
    <p>Señores<br><b>${esc(c.entidad)}</b>${c.correo ? `<br>${esc(c.correo)}` : ''}</p>
    <p><b>Asunto:</b> Derecho de petición sobre ${esc(t.titulo.toLowerCase())}</p>
    <p>Yo, ${esc(c.nombre || linea)}, identificado(a) con cédula de ciudadanía n.º ${esc(c.cedula || linea)}, en ejercicio del derecho de petición (artículo 23 de la Constitución Política y Ley 1755 de 2015), presento la siguiente petición:</p>
    <h3>Hechos</h3><ol>${hechos.map(h => `<li>${esc(h)}</li>`).join('')}</ol>
    <h3>Peticiones</h3><ol>${c.peticiones.map(p => `<li>${esc(p.texto ?? p)}</li>`).join('')}</ol>
    <p>La respuesta debe darse dentro de los ${c.plazo} días hábiles siguientes a su recibo (artículo 14 de la Ley 1755 de 2015).</p>
    <p><b>Recibiré respuesta en:</b> ${esc(respuesta)}${c.telefono ? ` Teléfono: ${esc(c.telefono)}.` : ''}</p>
    <p>Atentamente,</p>
    <p class="firma">${c.modo === 'envio' ? `Enviada con autorización del peticionario. Código ${c.codigo}` : linea}<br>${esc(c.nombre || 'Nombre:')}<br>C.C. ${esc(c.cedula || '')}</p>
    ${pie}
  </article>`;
}

// c es un caso guardado: municipio, entidad, rad y venc de la petición, peticiones (textos), plazo y modo.
function docTutelaPeticion(c) {
  return `<article class="doc">
    <p>Señor(a)<br><b>Juez de la República (reparto)</b><br>${esc(c.municipio)}</p>
    <p><b>Referencia:</b> Acción de tutela para proteger el derecho fundamental de petición<br><b>Accionante:</b> ${accionante(c)}<br><b>Accionada:</b> ${esc(c.entidad)}</p>
    <h3>Hechos</h3><ol>
      <li>El ${fechaDoc(deIso(c.rad))} presenté un derecho de petición ante ${esc(c.entidad)}, en el que solicité: ${c.peticiones.map(esc).join(' ')}</li>
      <li>El plazo de ${c.plazo} días hábiles del artículo 14 de la Ley 1755 de 2015 venció el ${fechaDoc(deIso(c.venc))}, y a la fecha no he recibido una respuesta de fondo.</li></ol>
    <h3>Derecho vulnerado</h3><p>Derecho fundamental de petición (artículo 23 de la Constitución Política y Ley 1755 de 2015).</p>
    <h3>Pretensión</h3><p>Que se ordene a ${esc(c.entidad)} dar una respuesta de fondo, clara, precisa y congruente a mi petición dentro de las 48 horas siguientes a la notificación del fallo.</p>
    <h3>Pruebas</h3><p>Copia del derecho de petición y de la constancia de entrega${c.modo === 'envio' ? ' (correo electrónico de envío)' : ''}.</p>
    <h3>Juramento</h3><p>Bajo la gravedad del juramento manifiesto que no he presentado otra acción de tutela por los mismos hechos.</p>
    <h3>Notificaciones</h3><p>${dondeRecibe(c)}</p>
    ${firmaJudicial(c)}
    ${pie}
  </article>`;
}

// Tutela de salud y tutela general (Decreto 2591 de 1991). Los datos de salud llegan aquí desde la memoria y no se guardan.
// c: afectado ('propio'|'menor'), derecho, entidad, municipio, vereda, que/detalle, pidio ('negada'|'sin_respuesta'|'no'), desde, palabras, urgente ('si'|'no'), pruebas
function docTutela(c, hoy) {
  const d = derecho(c.derecho), urgente = c.urgente === 'si', salud = d.id === 'salud', menor = c.afectado === 'menor';
  const pretension = llenar(d.pretension, c), plantilla = hechoTutela(c);
  const derechos = menor ? 'los derechos fundamentales de mi hijo(a)' : 'mis derechos fundamentales';
  const hechos = [
    plantilla && llenar(plantilla, c),
    salud && c.pruebas?.some(p => /^orden/i.test(p)) && 'Así consta en la orden médica que adjunto.',
    { negada: `Le pedí a ${c.entidad} que lo solucionara y me respondió que no.`,
      sin_respuesta: `Le pedí a ${c.entidad} que lo solucionara y no me ha respondido, o lo ha aplazado sin darme una fecha cierta.` }[c.pidio],
    `Esta situación comenzó ${c.desde} y continúa a la fecha.`,
    c.palabras,
  ].filter(Boolean);
  return `<article class="doc">
    <p>${esc(c.municipio)}, ${fechaDoc(hoy)}</p>
    <p>Señor(a)<br><b>Juez de la República (reparto)</b><br>${esc(c.municipio)}</p>
    <p><b>Referencia:</b> Acción de tutela${urgente ? ' con solicitud de medida provisional' : ''}<br><b>Accionante:</b> ${accionante(c)}<br><b>Accionada:</b> ${esc(c.entidad)}</p>
    <p>${menor // [validar] representación legal del menor por el padre, la madre o quien lo tiene a cargo
      ? `Presento acción de tutela en representación de mi hijo(a) menor de edad, ${linea} (nombre completo y documento), para que se protejan sus derechos fundamentales (artículo 10 del Decreto 2591 de 1991).`
      : 'Presento acción de tutela en nombre propio (artículo 10 del Decreto 2591 de 1991) para que se protejan mis derechos fundamentales.'}</p>
    <h3>Hechos</h3>${lista(hechos)}
    <h3>Derechos vulnerados</h3><p>${esc(d.texto)}</p>
    ${urgente ? `<h3>Medida provisional</h3><p>Pido que, mientras decide esta tutela, ordene de inmediato a ${esc(c.entidad)} que ${esc(pretension)}, porque esperar el fallo pone en grave riesgo ${salud ? (menor ? 'la vida y la salud de mi hijo(a)' : 'mi vida y mi salud') : derechos} (artículo 7 del Decreto 2591 de 1991).</p>` : ''}
    <h3>Pretensiones</h3>${lista([
      `Proteger ${derechos}.`,
      `Ordenar a ${c.entidad} que, dentro de las 48 horas siguientes a la notificación del fallo, ${pretension}.`,
      // [validar] el tratamiento integral se concede cuando hay diagnóstico y la EPS ha puesto barreras
      salud && `Ordenar a ${c.entidad} que brinde el tratamiento integral que el médico tratante ordene para esta enfermedad, sin nuevas barreras.`,
    ].filter(Boolean))}
    <h3>Por qué procede la tutela</h3>${lista([
      `No existe otro medio de defensa judicial que proteja ${derechos} con la rapidez que esta situación necesita${urgente ? ', y esperar causaría un perjuicio irremediable' : ''} (artículo 6 del Decreto 2591 de 1991).`,
      `La presento en un tiempo razonable: la vulneración de ${derechos} continúa hoy.`,
    ])}
    <h3>Pruebas</h3>${c.pruebas?.length ? `<p>Adjunto copia de:</p>${lista(c.pruebas)}` : `<p>No tengo documentos en este momento. Pido que se le solicite a ${esc(c.entidad)} la información de mi caso.</p>`}
    <h3>Juramento</h3><p>Bajo la gravedad del juramento manifiesto que no he presentado otra acción de tutela por los mismos hechos.</p>
    <h3>Notificaciones</h3><p>${dondeRecibe(c)}</p>
    ${firmaJudicial(c)}
    ${pie}
  </article>`;
}

// c: caso de tutela guardado (municipio, entidad, derecho, rad = fecha de notificación del fallo), razones y palabras.
function docImpugnacion(c, hoy) {
  const razones = [...(c.razones || []), c.palabras].filter(Boolean);
  return `<article class="doc">
    <p>${esc(c.municipio)}, ${fechaDoc(hoy)}</p>
    <p>Señor(a)<br><b>Juez ${linea}</b><br>(el mismo juzgado que decidió la tutela)<br>${esc(c.municipio)}</p>
    <p><b>Referencia:</b> Impugnación del fallo de tutela<br><b>Radicado:</b> ${linea}<br><b>Accionante:</b> ${accionante(c)}<br><b>Accionada:</b> ${esc(c.entidad)}</p>
    <p>Presento impugnación contra el fallo de tutela que me fue notificado el ${fechaDoc(deIso(c.rad))}, dentro del término de tres (3) días del artículo 31 del Decreto 2591 de 1991, para que el juez superior lo revise.</p>
    <h3>Razones</h3>${razones.length ? lista(razones) : '<p>No estoy de acuerdo con el fallo porque mis derechos siguen sin protección.</p>'}
    <h3>Petición</h3><p>Revocar el fallo y conceder la tutela, con las órdenes que pedí. Derechos que pido proteger: ${esc(derecho(c.derecho).texto)}</p>
    <h3>Notificaciones</h3><p>${dondeRecibe(c)}</p>
    ${firmaJudicial(c)}
    ${pie}
  </article>`;
}

// c: caso de tutela ganada (municipio, entidad, rad = fecha de notificación del fallo) y orden (lo que mandó el juez, opcional).
function docDesacato(c, hoy) {
  const orden = c.orden?.replace(/\.$/, '') || 'lo que consta en el fallo, del que adjunto copia';
  return `<article class="doc">
    <p>${esc(c.municipio)}, ${fechaDoc(hoy)}</p>
    <p>Señor(a)<br><b>Juez ${linea}</b><br>(el mismo juzgado que decidió la tutela)<br>${esc(c.municipio)}</p>
    <p><b>Referencia:</b> Solicitud de incidente de desacato<br><b>Radicado:</b> ${linea}<br><b>Accionante:</b> ${accionante(c)}<br><b>Accionada:</b> ${esc(c.entidad)}</p>
    <h3>Hechos</h3>${lista([
      `El ${fechaDoc(deIso(c.rad))} me notificaron el fallo que concedió la tutela y ordenó a ${c.entidad}: ${orden}.`,
      `El plazo que dio el juez para cumplir ya pasó y ${c.entidad} no ha cumplido.`,
    ])}
    <h3>Peticiones</h3>${lista([
      `Requerir a ${c.entidad} y a su superior para que cumplan el fallo de inmediato (artículo 27 del Decreto 2591 de 1991).`,
      'Abrir incidente de desacato contra el responsable de cumplir el fallo e imponer las sanciones del artículo 52 del Decreto 2591 de 1991.',
    ])}
    <h3>Pruebas</h3><p>Copia del fallo de tutela.</p>
    <h3>Notificaciones</h3><p>${dondeRecibe(c)}</p>
    ${firmaJudicial(c)}
    ${pie}
  </article>`;
}

// Cierre del reclamo y del recurso: dónde recibe la respuesta y firma.
const cierre = c => `<p><b>Recibiré respuesta en:</b> ${esc(c.modo === 'envio'
    ? `Vereda ${c.vereda}, ${c.municipio}. Correo: ${CORREO_SERVICIO} (servicio que autoricé para recibir y reenviarme la respuesta).`
    : `Vereda ${c.vereda}, ${c.municipio}.${c.direccion ? ` Dirección o correo: ${c.direccion}.` : ` Otra dirección o correo: ${linea}`}`)}${c.telefono ? ` Teléfono: ${esc(c.telefono)}.` : ''}</p>
    <p>Atentamente,</p>
    <p class="firma">${c.modo === 'envio' ? `Enviado con autorización del usuario. Código ${c.codigo}` : linea}<br>${esc(c.nombre || 'Nombre:')}<br>C.C. ${esc(c.cedula || '')}</p>`;
const usuario = c => `Yo, ${esc(c.nombre || linea)}, identificado(a) con cédula de ciudadanía n.º ${esc(c.cedula || linea)}, usuario(a) del servicio de ${esc(valor(c, 'servicio'))}, cuenta o contrato n.º ${esc(c.cuenta || linea)},`;

// Ley 142 de 1994, arts. 152 a 159. c: servicio, motivo, entidad (empresa), correo, cuenta, vereda, municipio, desde, palabras, peticiones, modo.
function docReclamo(c, hoy) {
  const m = de(MOTIVOS_SP, c.motivo);
  const hechos = [m?.hecho && llenar(m.hecho, c), c.palabras].filter(Boolean);
  return `<article class="doc">
    <p>${esc(c.municipio)}, ${fechaDoc(hoy)}</p>
    <p>Señores<br><b>${esc(c.entidad)}</b><br>Oficina de Peticiones, Quejas y Recursos${c.correo ? `<br>${esc(c.correo)}` : ''}</p>
    <p><b>Asunto:</b> Reclamo sobre el servicio de ${esc(valor(c, 'servicio'))}</p>
    <p>${usuario(c)} presento el siguiente reclamo (artículos 152 y siguientes de la Ley 142 de 1994):</p>
    <h3>Hechos</h3>${lista(hechos)}
    <h3>Peticiones</h3>${lista(c.peticiones.map(p => p.texto ?? p))}
    <p>La empresa debe responder dentro de los ${TIPOS.servicios_publicos.plazo} días hábiles siguientes a la presentación de este reclamo. Si no responde en ese plazo, se entiende que lo resolvió a mi favor (silencio administrativo positivo, artículo 158 de la Ley 142 de 1994).</p>
    ${cierre(c)}
    ${pie}
  </article>`;
}

// c: como el reclamo, más notif (fecha en que le notificaron la respuesta negativa), razones y palabras.
function docRecurso(c, hoy) {
  const razones = [...(c.razones || []), c.palabras].filter(Boolean);
  return `<article class="doc">
    <p>${esc(c.municipio)}, ${fechaDoc(hoy)}</p>
    <p>Señores<br><b>${esc(c.entidad)}</b><br>Oficina de Peticiones, Quejas y Recursos${c.correo ? `<br>${esc(c.correo)}` : ''}</p>
    <p><b>Asunto:</b> Recurso de reposición y, en subsidio, de apelación</p>
    <p>${usuario(c)} presento recurso de reposición y, en subsidio, de apelación ante la Superintendencia de Servicios Públicos Domiciliarios, contra la decisión sobre mi reclamo que me fue notificada el ${fechaDoc(deIso(c.notif))} (artículos 154 y 159 de la Ley 142 de 1994). Lo presento dentro de los ${TIPOS.recurso_servicios.presentar} días hábiles siguientes a la notificación.</p>
    <h3>Razones</h3>${lista(razones)}
    <h3>Peticiones</h3>${lista([
      'Revocar la decisión y resolver mi reclamo a mi favor.',
      'Si no la revoca, enviar el expediente a la Superintendencia de Servicios Públicos Domiciliarios para que resuelva la apelación.',
    ])}
    <p>La empresa debe resolver este recurso dentro de los ${TIPOS.recurso_servicios.plazo} días hábiles siguientes. Si no lo hace, se entiende resuelto a mi favor (silencio administrativo positivo, artículo 158 de la Ley 142 de 1994).</p>
    ${cierre(c)}
    ${pie}
  </article>`;
}
