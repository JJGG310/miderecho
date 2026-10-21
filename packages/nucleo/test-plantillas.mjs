// Prueba: node prototipo/test-plantillas.mjs
import assert from 'node:assert/strict';
import { TIPOS, generarDocumento } from './src/plantillas.js';
import { VERIFICADO, MOTIVOS_SP, EXPLICA, TEMAS, DERECHOS, SERVICIOS, SALUD_NIEGA, CARTA, CARTA_PREGUNTAS } from './src/contenido.js';
import { DERECHOS_INFO } from './src/derechos.js';
import { sumarHabiles, iso } from './src/plazos.js';

const HOY = new Date(2026, 9, 20);
const base = { municipio: 'Chaparral', vereda: 'La Esperanza', entidad: 'EPS <Sur>', desde: 'hace un mes', codigo: 'ABCD' };
const ejemplos = {
  peticion: { ...base, tipo: 'peticion', temaId: 'agua', entidad: 'Alcaldía de Chaparral', peticiones: [{ texto: 'Reparar el acueducto.', tipo: 'general' }], plazo: 15, modo: 'mano' },
  tutela_peticion: { ...base, rad: '2026-09-01', venc: '2026-09-22', peticiones: ['Reparar el acueducto.'], plazo: 15, modo: 'envio' },
  tutela_salud: { ...base, tipo: 'tutela_salud', derecho: 'salud', que: 'medicamento', detalle: 'insulina', pidio: 'negada', urgente: 'si', pruebas: ['Orden o fórmula médica'] },
  tutela: { ...base, tipo: 'tutela', derecho: 'minimo_vital', entidad: 'Colpensiones', detalle: 'la pensión', pidio: 'sin_respuesta', urgente: 'no', pruebas: [] },
  impugnacion: { ...base, derecho: 'salud', rad: '2026-10-09', razones: ['El juez no tuvo en cuenta las pruebas que presenté.'] },
  desacato: { ...base, rad: '2026-10-09', orden: 'entregar la insulina en 48 horas.' },
  servicios_publicos: { ...base, tipo: 'servicios_publicos', servicio: 'acueducto', motivo: 'cobro', entidad: 'Acueducto Regional', cuenta: '998877',
    peticiones: [{ texto: 'Revisar la factura y cobrarme solo lo que realmente consumí.' }], modo: 'envio', nombre: 'Ana Pérez', cedula: '12345678' },
  recurso_servicios: { ...base, tipo: 'recurso_servicios', servicio: 'energia', entidad: 'Electrificadora', notif: '2026-11-09', razones: [], palabras: 'El medidor está dañado.', modo: 'mano' },
};

// Hay plantilla para cada tipo y cada documento sale completo, sin datos sin llenar. La marca de borrador va en la app, no en el papel.
assert.deepEqual(Object.keys(ejemplos).sort(), Object.keys(TIPOS).sort());
const doc = {};
for (const [tipo, datos] of Object.entries(ejemplos)) {
  doc[tipo] = generarDocumento(tipo, datos, HOY);
  for (const malo of ['undefined', 'NaN', 'Invalid Date', '[object Object]', '{']) assert.ok(!doc[tipo].includes(malo), `${tipo}: contiene ${malo}`);
  assert.ok(!doc[tipo].includes(VERIFICADO), `${tipo}: la marca de borrador no debe salir en el papel`);
  assert.ok(!/soy abogad/i.test(doc[tipo]), tipo);
}
assert.ok(doc.tutela_salud.includes('EPS &lt;Sur&gt;') && !doc.tutela_salud.includes('<Sur>'), 'escapa el HTML');

// Tutela de salud: derecho, hechos guiados, medida provisional (art. 7), juramento (art. 37) y pruebas
assert.match(doc.tutela_salud, /derechos fundamentales a la salud y a la vida en condiciones dignas/i);
assert.match(doc.tutela_salud, /Necesito un medicamento \(insulina\), que me ordenó mi médico tratante/);
assert.match(doc.tutela_salud, /me respondió que no/);
assert.match(doc.tutela_salud, /Medida provisional.*artículo 7 del Decreto 2591/s);
assert.match(doc.tutela_salud, /no he presentado otra acción de tutela respecto de los mismos hechos y derechos/);
assert.match(doc.tutela_salud, /Orden o fórmula médica/);
assert.match(doc.tutela_salud, /Vereda La Esperanza, Chaparral/);
// Tutela general: sin medida provisional si no es urgente
assert.match(doc.tutela, /mínimo vital/);
assert.match(doc.tutela, /Colpensiones suspendió o no me ha pagado la pensión/);
assert.ok(!doc.tutela.includes('Medida provisional'));
assert.match(doc.tutela, /Pido que se le solicite a Colpensiones la información/);
// La orden médica se menciona solo si la marcó como prueba
assert.match(doc.tutela_salud, /Así consta en la orden médica que adjunto\./);
const sinOrden = generarDocumento('tutela_salud', { ...ejemplos.tutela_salud, pruebas: [] }, HOY);
assert.ok(!sinOrden.includes('orden médica que adjunto'));
// Legitimación: en nombre propio, o en representación de un hijo o hija menor de edad
assert.match(doc.tutela_salud, /en nombre propio/);
const menor = generarDocumento('tutela_salud', { ...ejemplos.tutela_salud, afectado: 'menor' }, HOY);
assert.ok(!menor.includes('en nombre propio'));
assert.match(menor, /en representación de mi hijo\(a\) menor de edad/);
assert.match(menor, /Mi hijo\(a\) necesita un medicamento \(insulina\), que le ordenó su médico tratante/);
assert.match(menor, /grave riesgo la vida y la salud de mi hijo\(a\)/);
assert.match(menor, /Proteger los derechos fundamentales de mi hijo\(a\)/);
// Recurso ante la empresa solo contra cobros y cortes (Ley 142, art. 154)
assert.deepEqual(MOTIVOS_SP.filter(m => m.recurso).map(m => m.id), ['cobro', 'corte']);
// Las explicaciones no prometen resultados
for (const [k, t] of Object.entries(EXPLICA)) assert.ok(!/ganó|probablemente|negaría|más seguro|más fuerte/i.test(t), `EXPLICA.${k} promete un resultado`);
// El agente de voz manda tema con ids de TEMAS: en el menú de la tutela general solo 'educacion' coincide
// (tema 'salud' pasa a la tutela de salud), y ninguno coincide con un servicio o con lo que niega la EPS
const temas = TEMAS.map(t => t.id);
assert.deepEqual(DERECHOS.filter(d => d.icono && temas.includes(d.id)).map(d => d.id), ['educacion']);
assert.ok(![...SERVICIOS, ...SALUD_NIEGA].some(x => temas.includes(x.id)));

// Tutela por una petición hecha por fuera de la app
const tp = generarDocumento('tutela', { ...base, derecho: 'peticion', entidad: 'Alcaldía de Ataco', detalle: 'arreglar el puente' }, HOY);
assert.match(tp, /Le presenté a Alcaldía de Ataco un derecho de petición en el que pedí arreglar el puente/);
assert.match(tp, /respuesta de fondo, clara, precisa y congruente/);
// Impugnación (art. 31) y desacato (art. 52)
assert.match(doc.impugnacion, /notificado el 9 de octubre de 2026, dentro del término de tres \(3\) días del artículo 31/);
assert.match(doc.desacato, /entregar la insulina en 48 horas\./);
assert.match(doc.desacato, /artículo 52 del Decreto 2591/);
// Servicios públicos: reclamo con silencio positivo (art. 158) y recurso en 5 días hábiles
assert.match(doc.servicios_publicos, /servicio de acueducto, cuenta o contrato n\.º 998877/);
assert.match(doc.servicios_publicos, /15 días hábiles.*silencio administrativo positivo, artículo 158/s);
assert.match(doc.servicios_publicos, /Ana Pérez.*12345678/s);
assert.match(doc.recurso_servicios, /reposición y, en subsidio, de apelación/);
assert.match(doc.recurso_servicios, /notificada el 9 de noviembre de 2026.*dentro de los 5 días hábiles/s);
assert.match(doc.recurso_servicios, /El medidor está dañado\./);

// Plazos: 3 días hábiles para impugnar, 5 para el recurso, 15 para que la empresa responda
assert.equal(TIPOS.impugnacion.presentar, 3);
assert.equal(TIPOS.recurso_servicios.presentar, 5);
assert.equal(TIPOS.servicios_publicos.plazo, 15);
// Notificado el viernes 9-oct-2026: salta el festivo del 12-oct (Día de la Raza) -> jueves 15-oct
assert.equal(iso(sumarHabiles(new Date(2026, 9, 9), TIPOS.impugnacion.presentar)), '2026-10-15');
// Notificado el lunes 9-nov-2026: salta el festivo del 16-nov (Independencia de Cartagena) -> martes 17-nov
assert.equal(iso(sumarHabiles(new Date(2026, 10, 9), TIPOS.recurso_servicios.presentar)), '2026-11-17');
// Reclamo entregado el 9-nov-2026: la empresa responde a más tardar el 1-dic-2026, si no, silencio positivo
assert.equal(iso(sumarHabiles(new Date(2026, 10, 9), TIPOS.servicios_publicos.plazo)), '2026-12-01');

// Datos de la persona (paso "Tus datos para el documento"): si los da, salen impresos; si no, queda la línea para llenar a mano
const persona = { nombre: 'Rosa Díaz', cedula: '30111222', telefono: '3001234567', direccion: 'Finca El Roble, vereda La Esperanza' };
for (const tipo of ['tutela_salud', 'tutela', 'impugnacion', 'desacato', 'tutela_peticion']) {
  const conDatos = generarDocumento(tipo, { ...ejemplos[tipo], ...persona }, HOY);
  assert.match(conDatos, /Accionante:<\/b> Rosa Díaz, C\.C\. 30111222/, tipo);
  assert.match(conDatos, /Finca El Roble, vereda La Esperanza\. Teléfono: 3001234567/, tipo);
  assert.match(doc[tipo], /Accionante:<\/b> _{5,}, C\.C\. _{5,}/, `${tipo} sin datos`);
}
const petConDatos = generarDocumento('peticion', { ...ejemplos.peticion, ...persona }, HOY);
assert.match(petConDatos, /Yo, Rosa Díaz, identificado\(a\) con cédula de ciudadanía n\.º 30111222/);
assert.match(petConDatos, /Dirección o correo: Finca El Roble/);
assert.match(petConDatos, /Teléfono: 3001234567/);

// Recurso desde un reclamo guardado en Mis casos (sin datos personales): notif = día en que la empresa dijo que no
const reclamoGuardado = { tipo: 'servicios_publicos', entidad: 'Aguas del Sur', municipio: 'Ovejas', vereda: 'El Limón', servicio: 'acueducto', motivo: 'cobro',
  modo: 'mano', estado: 'por_recurrir', rad: '2026-11-09', notif: '2026-11-09', venc: iso(sumarHabiles(new Date(2026, 10, 9), TIPOS.recurso_servicios.presentar)) };
assert.equal(reclamoGuardado.venc, '2026-11-17');   // 5 días hábiles, salta el festivo del 16 de noviembre
const recurso = generarDocumento('recurso_servicios', { ...reclamoGuardado, razones: ['El cobro no corresponde a lo que consumo normalmente.'], palabras: '' }, HOY);
assert.match(recurso, /usuario\(a\) del servicio de acueducto/);
assert.match(recurso, /notificada el 9 de noviembre de 2026.*dentro de los 5 días hábiles/s);
assert.match(recurso, /El cobro no corresponde a lo que consumo normalmente\./);
assert.ok(!/undefined|NaN|Invalid Date/.test(recurso));

// Ruta "¿Su carta venta lo hace dueño?": toda respuesta lleva a otra pregunta o a un resultado, y todo resultado se alcanza
const alcanzados = new Set(), porVer = ['papel'];
while (porVer.length) {
  const id = porVer.pop();
  for (const [, texto, destino] of CARTA_PREGUNTAS[id].opciones) {
    assert.ok(Object.hasOwn(CARTA_PREGUNTAS, destino) || Object.hasOwn(CARTA, destino), `"${texto}" lleva a "${destino}", que no existe`);
    if (Object.hasOwn(CARTA, destino)) alcanzados.add(destino); else porVer.push(destino);
  }
}
assert.deepEqual([...alcanzados].sort(), Object.keys(CARTA).sort());

// "Conocer mis derechos": cada ficha tiene historieta o pasos, y su botón abre algo que existe
for (const d of DERECHOS_INFO) {
  assert.ok(d.cuadros?.length || d.pasos?.length, `${d.id}: sin historieta ni pasos`);
  assert.ok(['ruta', 'carta'].includes(d.accion) || Object.hasOwn(TIPOS, d.accion), `${d.id}: acción ${d.accion}`);
  for (const k of ['titulo', 'menu', 'sub', 'icono', 'descripcion', 'dichoDeOtraForma', 'queDiceLaLey', 'normas', 'consulta']) assert.ok(d[k], `${d.id}: falta ${k}`);
}
assert.ok(DERECHOS_INFO.some(d => d.id === 'servicios' && d.accion === 'servicios_publicos'));
assert.ok(DERECHOS_INFO.some(d => d.id === 'tierras' && d.accion === 'carta'));

console.log('plantillas ok');
