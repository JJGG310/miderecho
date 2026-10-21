// Arma MiDerecho-hackathon.pptx a partir del Canva del equipo, la investigación y los clips de Remotion.
// Uso: npm run pptx (antes: npm run render en video/ si cambiaron las escenas).
//
// Para pasar a otra plantilla: los colores y fuentes están en TEMA, los marcos en los 3 diseños
// (PORTADA, CONTENIDO, OSCURO) y cada lámina usa colores del tema, así que se cambian en un solo lugar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const SALIDA = path.join(AQUI, 'MiDerecho-hackathon.pptx');
const buhoPng = (p) => path.join(RAIZ, 'identidad/buho', `${p}.png`);

const TEMA = {
  name: 'MiDerecho',
  headFontFace: 'Georgia',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '2B2A27', lt1: 'FFFFFF', dk2: '264933', lt2: 'FFF5E4',
    accent1: '264933', // verde de la pañoleta y la app
    accent2: '4F7A5A', // verde medio
    accent3: 'E3EADC', // salvia clara (tarjetas)
    accent4: 'E3C48F', // arena (sol del logo)
    accent5: '3D3935', // carbón (cajas del Canva)
    accent6: 'B3412E', // rojo (plazos vencidos)
    hlink: '264933', folHlink: '4F7A5A',
  },
};
const SUAVE = '6B675F'; // texto secundario

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13,33 × 7,5 pulgadas
pres.title = 'MiDerecho: la justicia empieza por entender tus derechos';
pres.author = 'Valentina Quintero, Juan Diego Balanta y Juan José Gallego';
pres.theme = { headFontFace: TEMA.headFontFace, bodyFontFace: TEMA.bodyFontFace };
const C = pres.SchemeColor;

// --- Diseños (marcos) ---
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { color: C.background2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 5.0, y: 2.05, w: 4.6, h: 2.1, fontFace: TEMA.bodyFontFace, fontSize: 40, bold: true, color: C.text1, align: 'left', valign: 'bottom', margin: 0 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTENIDO',
  background: { color: C.background2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.13, h: 1.2, fontSize: 30, bold: true, color: C.text1, align: 'center', valign: 'middle', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: 12.33, y: 6.95, w: 0.5, h: 0.3, fontSize: 10, color: SUAVE, align: 'right' },
});
pres.defineSlideMaster({
  title: 'OSCURO',
  background: { color: C.accent1 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 1.6, w: 7.6, h: 2.0, fontSize: 44, bold: true, color: C.background2, align: 'left', valign: 'bottom', margin: 0 }, text: '' } },
  ],
});

// --- Piezas que se repiten ---
const sombra = () => ({ type: 'outer', color: '264933', opacity: 0.14, blur: 8, offset: 2, angle: 90 });
const tarjeta = (s, x, y, w, h, fill = C.background1, conSombra = true) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.18, fill: { color: fill }, line: { type: 'none' }, shadow: conSombra ? sombra() : undefined });
const texto = (s, t, o) => s.addText(t, { isTextBox: true, margin: 0, valign: 'top', fontSize: 16, color: C.text1, ...o });
const vinetas = (s, items, o) =>
  texto(s, items.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1 } })), { paraSpaceAfter: 10, ...o });
const nota = (s, t) => texto(s, t, { x: 0.6, y: 6.85, w: 11.4, h: 0.35, fontSize: 11, color: SUAVE, valign: 'middle' });

// Tamaños en píxeles de las poses (para no deformarlas).
const POSES = { saludo: [355, 420], ley: [198, 244], lupa: [197, 255], corazon: [231, 253], pensando: [217, 253], documento: [203, 246], computador: [250, 247], 'avatar-curioso': [242, 204], 'avatar-amigable': [241, 217], 'avatar-sabio': [250, 223] };
// El PNG de «saludo» trae una franja de otra pose en el borde derecho: se recorta.
const RECORTE = { saludo: 0.04 };
const buho = (s, pose, x, y, h) => {
  const w = (h * POSES[pose][0]) / POSES[pose][1];
  const sizing = RECORTE[pose] ? { type: 'crop', x: 0, y: 0, w: w * (1 - RECORTE[pose]), h } : undefined;
  s.addImage({ path: buhoPng(pose), x, y, w, h, sizing, altText: `Búho de MiDerecho (${pose})` });
};

// Captura real de la app (860 × 1864 px) dentro de un celular.
const celular = (s, captura, x, y, h, alt) => {
  const w = (h - 0.2) * (860 / 1864) + 0.2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.32, fill: { color: '1E2A23' }, line: { type: 'none' }, shadow: sombra() });
  s.addImage({ path: path.join(AQUI, 'capturas', `${captura}.jpg`), x: x + 0.1, y: y + 0.1, w: w - 0.2, h: h - 0.2, altText: alt });
};

// Clip de Remotion: arranca solo al llegar a la lámina (ver reproduccionAutomatica).
const clip = (s, nombre, x = 5.35, y = 1.75, w = 7.38) => {
  const portada = fs.readFileSync(path.join(AQUI, 'clips', `${nombre}.png`)).toString('base64');
  s.addMedia({ type: 'video', path: path.join(AQUI, 'clips', `${nombre}.mp4`), cover: `data:image/png;base64,${portada}`, x, y, w, h: (w * 9) / 16, objectName: `Video ${nombre}` });
};

const cifra = (s, valor, descripcion, x, y, w, alineado = 'left', tam = 40) => {
  texto(s, valor, { x, y, w, h: 0.75, fontSize: tam, bold: true, color: C.accent1, align: alineado, valign: 'bottom' });
  texto(s, descripcion, { x, y: y + 0.82, w, h: 0.9, fontSize: 15, align: alineado });
};

const pasoDeFlujo = (s, n, puntos) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.85, w: 1.75, h: 0.42, rectRadius: 0.21, fill: { color: C.accent3 }, line: { type: 'none' } });
  texto(s, `PASO ${n} DE 6`, { x: 0.6, y: 1.85, w: 1.75, h: 0.42, fontSize: 13, bold: true, color: C.accent1, align: 'center', valign: 'middle', charSpacing: 1 });
  vinetas(s, puntos, { x: 0.6, y: 2.55, w: 4.45, h: 3.9, fontSize: 17 });
};

const lamina = (seccion, master = 'CONTENIDO') => pres.addSlide({ masterName: master, sectionTitle: seccion });

// ============ 1. Inicio ============
pres.addSection({ title: 'Inicio' });
{
  const s = lamina('Inicio', 'PORTADA');
  s.addImage({ path: path.join(RAIZ, 'apps/web/public/icon-512.png'), x: 0.7, y: 1.55, w: 4.1, h: 4.1, altText: 'Logo de MiDerecho: balanza sobre colinas' });
  s.addText('La justicia empieza por entender tus derechos', { placeholder: 'title' });
  texto(s, 'Orientación jurídica para el campo colombiano, con o sin internet.', { x: 5.0, y: 4.35, w: 4.4, h: 0.9, fontSize: 18, color: SUAVE });
  texto(s, 'Hackathon de acceso a la justicia · Reto 2: justicia rural con tecnología de bajo consumo de datos', { x: 0.7, y: 6.75, w: 9.0, h: 0.35, fontSize: 12, color: SUAVE });
  buho(s, 'saludo', 9.4, 2.55, 4.4);
  s.addNotes('Buenos días. Somos MiDerecho. Nuestra idea es simple: la justicia empieza por entender los derechos. Les vamos a mostrar cómo una persona en una vereda puede pedir, enviar y hacer seguimiento a un derecho de petición o una tutela sin abogado y sin viajar.');
}
{
  const s = lamina('Inicio');
  s.addText('NUESTRO EQUIPO', { placeholder: 'title' });
  [['avatar-curioso', 'Valentina Quintero'], ['avatar-amigable', 'Juan Diego Balanta'], ['avatar-sabio', 'Juan José Gallego']].forEach(([pose, nombre], i) => {
    const cx = 2.6 + i * 4.07;
    const h = 2.3, w = (h * POSES[pose][0]) / POSES[pose][1];
    buho(s, pose, cx - w / 2, 2.1, h);
    texto(s, nombre, { x: cx - 1.8, y: 4.65, w: 3.6, h: 0.45, fontSize: 22, bold: true, align: 'center' });
  });
  s.addNotes('Fotos: cambiar cada búho por la foto del Canva (clic derecho > Cambiar imagen).');
}

// ============ 2. El problema ============
pres.addSection({ title: 'El problema' });
{
  const s = lamina('El problema');
  s.addText('LA INFORMACIÓN JURÍDICA NO SIEMPRE ESTÁ AL ALCANCE DE TODOS', { placeholder: 'title' });
  texto(s, 'En las comunidades rurales, el acceso a la justicia puede verse limitado por tres barreras:', { x: 1.5, y: 1.7, w: 10.33, h: 0.5, fontSize: 19, align: 'center' });
  [
    ['Información compleja', '77%', 'de los problemas legales del país seguía sin resolverse en 2020'],
    ['Conectividad limitada', '1,8 millones', 'de hogares rurales siguen sin internet'],
    ['Desconocimiento de las herramientas', '93,1%', 'en el campo usa el celular para llamar; solo el 64,3% para mensajes'],
  ].forEach(([barrera, valor, desc], i) => {
    const x = 0.6 + i * 4.2;
    tarjeta(s, x, 2.55, 3.73, 1.2, C.accent5, false);
    texto(s, barrera, { x: x + 0.2, y: 2.55, w: 3.33, h: 1.2, fontSize: 21, bold: true, color: C.background2, align: 'center', valign: 'middle' });
    cifra(s, valor, desc, x, 3.95, 3.73, 'center');
  });
  nota(s, 'Fuentes: Encuesta de Necesidades Jurídicas 2020 (DNP-DANE); MinTIC 2025; DANE, ENTIC 2024.');
  s.addNotes('Tres barreras: la ley está escrita para abogados, la señal es mala y, aunque casi todos tienen celular, en el campo se usa para llamar más que para chatear. Por eso MiDerecho habla, funciona sin internet y explica en palabras sencillas.');
}
{
  const s = lamina('El problema');
  s.addText('EN LA VEREDA, LA JUSTICIA QUEDA LEJOS', { placeholder: 'title' });
  cifra(s, '432.658', 'tutelas en 2025 porque una entidad no respondió un derecho de petición: casi la mitad de todas', 0.6, 1.8, 4.45, 'left', 44);
  cifra(s, '2,99 millones', 'de personas viven en la zona rural de los municipios PDET', 0.6, 3.6, 4.45, 'left', 36);
  texto(s, 'Juez, personero e inspector están en la cabecera municipal. La vereda queda a horas de camino.', { x: 0.6, y: 5.4, w: 4.45, h: 0.9, fontSize: 16, italic: true, color: C.accent2 });
  clip(s, '1-problema');
  nota(s, 'Fuentes: Rama Judicial, Consejo Superior de la Judicatura (2025); informe ejecutivo del equipo, sección 4.');
  s.addNotes('El problema no es que no haya jueces: es la distancia. Y cuando la gente pide algo a una entidad, muchas veces no le responden. En 2025 hubo 432.658 tutelas solo porque una entidad no respondió un derecho de petición.');
}
{
  const s = lamina('El problema');
  s.addText('PERSONAS QUE NECESITAN ORIENTACIÓN CLARA Y ACCESIBLE', { placeholder: 'title' });
  texto(s, [
    { text: 'MiDerecho', options: { bold: true } },
    { text: ' está pensado principalmente para personas de comunidades rurales que necesitan comprender una situación jurídica, identificar sus opciones y saber cómo actuar, incluso cuando tienen poca experiencia con herramientas digitales.' },
  ], { x: 0.6, y: 1.85, w: 5.8, h: 2.1, fontSize: 19 });
  tarjeta(s, 0.6, 4.25, 5.8, 1.95, C.accent3, false);
  texto(s, 'Usuario principal', { x: 0.85, y: 4.45, w: 5.3, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
  texto(s, 'La persona líder de la vereda (presidente de la Junta de Acción Comunal o conciliador en equidad), que la usa con sus vecinos. Quien tenga celular propio también puede usarla sola.', { x: 0.85, y: 4.85, w: 5.3, h: 1.25, fontSize: 16 });
  [
    ['63.833', 'Juntas de Acción Comunal en el país: nuestro canal de llegada'],
    ['65,4%', 'tiene celular propio, aunque el 83,4% lo usa: el celular se comparte'],
    ['15,7%', 'de los hogares rurales tiene a alguien que no lee: por eso, voz'],
    ['14% + 9%', 'de los problemas rurales son de salud y de servicios públicos'],
  ].forEach(([valor, desc], i) => {
    const x = 6.85 + (i % 2) * 3.0, y = 1.85 + Math.floor(i / 2) * 2.25;
    tarjeta(s, x, y, 2.85, 2.05);
    texto(s, valor, { x: x + 0.22, y: y + 0.2, w: 2.45, h: 0.6, fontSize: 32, bold: true, color: C.accent1, valign: 'middle' });
    texto(s, desc, { x: x + 0.22, y: y + 0.85, w: 2.45, h: 1.1, fontSize: 14 });
  });
  nota(s, 'Fuentes: DANE; MinEducación 2026; Encuesta de Necesidades Jurídicas 2020 (zona rural).');
  s.addNotes('Nuestro usuario de entrada son las familias campesinas, y llegamos a ellas a través de quien ya las ayuda: la persona líder de la Junta de Acción Comunal. Diseñamos para celular compartido y para quien no lee.');
}

// ============ 3. La solución ============
pres.addSection({ title: 'La solución' });
{
  const s = lamina('La solución');
  s.addText('NUESTRA PROPUESTA DE SOLUCIÓN', { placeholder: 'title' });
  texto(s, 'Una herramienta de orientación jurídica que transforma información compleja en explicaciones sencillas, rutas de acción y documentos guiados, con funciones pensadas para conexiones limitadas.', { x: 0.6, y: 1.8, w: 7.2, h: 1.45, fontSize: 19 });
  const apps = [
    ['SIN INTERNET', 'Conozca sus derechos', ['Salud, trabajo, vivienda, peticiones e igualdad', 'Historietas y lectura en voz alta', '«¿Qué dice la ley?», con la norma'], C.accent3, C.text1],
    ['CON INTERNET', 'El ayudante con IA', ['Escucha el caso y orienta', 'Arma el documento', 'Lo envía y sigue el plazo'], C.accent1, C.background2],
  ];
  apps.forEach(([etiqueta, nombre, puntos, fondo, color], i) => {
    const x = 0.6 + i * 3.7;
    tarjeta(s, x, 3.5, 3.45, 3.0, fondo, false);
    texto(s, etiqueta, { x: x + 0.25, y: 3.7, w: 3.0, h: 0.3, fontSize: 13, bold: true, color, charSpacing: 1 });
    texto(s, nombre, { x: x + 0.25, y: 4.02, w: 3.0, h: 0.45, fontSize: 21, bold: true, color });
    vinetas(s, puntos, { x: x + 0.25, y: 4.6, w: 3.0, h: 1.8, fontSize: 15, color, paraSpaceAfter: 6 });
  });
  celular(s, 'inicio', 8.4, 1.6, 5.3, 'Pantalla de inicio de MiDerecho: ¿Qué necesita resolver hoy?');
  buho(s, 'saludo', 10.85, 4.55, 2.35);
  s.addNotes('MiDerecho son dos apps en una. Sin internet, cualquiera puede conocer sus derechos con historietas y voz. Con internet, un ayudante con IA escucha el caso, orienta, arma el documento, lo envía y sigue el plazo.');
}
{
  const s = lamina('La solución');
  s.addText('DEL LENGUAJE JURÍDICO AL LENGUAJE COTIDIANO', { placeholder: 'title' });
  texto(s, 'LEGAL DESIGN', { x: 0.6, y: 1.85, w: 4, h: 0.3, fontSize: 13, bold: true, color: C.accent2, charSpacing: 1 });
  vinetas(s, [
    'Explicaciones en palabras sencillas, sin términos de abogado.',
    'Historietas con situaciones de la vida diaria.',
    '«¿Qué dice la ley?»: la norma, organizada y con su fuente.',
    'Preguntas guiadas para entender qué necesita la persona.',
    'Instrucciones paso a paso para saber cómo actuar.',
    'Todo se puede escuchar en voz alta.',
  ], { x: 0.6, y: 2.3, w: 6.0, h: 4.3, fontSize: 18 });
  celular(s, 'derechos', 7.15, 1.6, 5.3, 'Pantalla Conozca sus derechos, con los temas');
  celular(s, 'salud', 10.05, 1.6, 5.3, 'Historieta del derecho a la salud');
  s.addNotes('Aplicamos Legal Design: nada de lenguaje de abogado. Cada derecho tiene una historieta, una explicación sencilla, qué dice la ley con su fuente y todo se puede escuchar.');
}
{
  const s = lamina('La solución');
  s.addText('NO NECESITAS SABER DE LEYES PARA COMENZAR', { placeholder: 'title' });
  texto(s, 'La aplicación acompaña al usuario mediante un flujo de preguntas sencillas que le permite explicar su situación y recibir orientación organizada.', { x: 1.5, y: 1.7, w: 10.33, h: 0.85, fontSize: 18, align: 'center' });
  [
    ['Identificar', 'Elegir el tipo de problema'],
    ['Contar', 'Escribir o grabar lo ocurrido'],
    ['Comprender', 'Saber qué derecho está en juego y a dónde acudir'],
    ['Actuar', 'Seguir una ruta y preparar un documento si hace falta'],
  ].forEach(([paso, desc], i) => {
    const x = 0.6 + i * 3.11;
    tarjeta(s, x, 2.85, 2.8, 2.6, C.accent3, false);
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: 3.1, w: 0.7, h: 0.7, fill: { color: C.accent1 }, line: { type: 'none' } });
    texto(s, String(i + 1), { x: x + 0.25, y: 3.1, w: 0.7, h: 0.7, fontSize: 26, bold: true, color: C.background2, align: 'center', valign: 'middle' });
    texto(s, paso, { x: x + 0.25, y: 4.0, w: 2.35, h: 0.45, fontSize: 22, bold: true, color: C.accent1 });
    texto(s, desc, { x: x + 0.25, y: 4.5, w: 2.35, h: 0.85, fontSize: 15 });
  });
  buho(s, 'lupa', 11.75, 5.5, 1.5);
  s.addNotes('La persona no necesita saber de leyes: identifica el problema, lo cuenta, entiende qué derecho tiene y actúa. Ahora les mostramos cada paso con un caso real: una EPS que no da una cita.');
}

// ============ 4. Así funciona (clips de Remotion) ============
pres.addSection({ title: 'Así funciona' });
const flujo = [
  ['CUENTA SU CASO CON SU VOZ', '2-voz', [
    'Escribe o toca «Contar con mi voz»: un asistente de voz conversa con la persona.',
    'La IA (Claude o Gemini) pregunta solo lo necesario.',
    'Antes de enviar el relato se quitan cédulas, teléfonos y correos, en el celular y en el servidor.',
  ], 'La persona cuenta lo que le pasa como se lo contaría a un vecino. Si dice su cédula, el filtro la cambia por [número] antes de que salga del celular.'],
  ['RECIBE ORIENTACIÓN CLARA', '3-orientacion', [
    'Qué significa lo que le pasa y qué derecho podría estar en juego.',
    'Los pasos a seguir y a dónde acudir.',
    '«Qué dice la ley» sale de contenido fijo, no de la IA.',
    'Para trabajo, vecinos o familia: una ruta sin documento.',
  ], 'La IA entiende y clasifica, pero lo jurídico sale de contenido fijo que revisa un consultorio jurídico. Así evitamos que la IA invente.'],
  ['EL DOCUMENTO QUEDA LISTO, SIN ABOGADO', '4-documento', [
    'Derecho de petición, tutela de salud y tutela o reclamo de servicios públicos.',
    'Plantillas fijas: lo que salió del relato viene marcado con ✓.',
    'Nombre y cédula se piden al final: van al papel, nunca a la IA.',
    'Se arma sin internet.',
  ], 'El documento sale de plantillas fijas. Elegimos petición, tutela y reclamo de servicios porque son los que resuelven los problemas rurales más comunes y no necesitan abogado.'],
  ['LO ENVÍA SIN VIAJAR', '5-envio', [
    'La ley acepta «cualquier medio idóneo» (Ley 1755 de 2015, art. 15).',
    'MiDerecho lo envía por correo a la alcaldía, la entidad o el juzgado.',
    'Sin señal, espera y sale apenas vuelve la conexión.',
    'La constancia queda en Mis casos.',
  ], 'Aquí ahorramos el viaje: la ley permite radicar por cualquier medio idóneo, y las alcaldías publican su correo. La persona no gasta el día ni el pasaje.'],
  ['NO SE LE PASA EL PLAZO', '6-plazo', [
    'Cuenta días hábiles con festivos: 15 para responder (10 si pide documentos, 30 si es una consulta).',
    'Avisa por SMS, WhatsApp, llamada o notificación.',
    'Los avisos solo llevan un código y la fecha, sin datos personales.',
  ], 'Nadie más en Colombia hace esto: contar el plazo y avisar. El SMS dice solo el código del caso y la fecha, porque el celular puede ser compartido.'],
  ['SI NO RESPONDEN, LA TUTELA', '7-tutela', [
    'Día 16 sin respuesta: la app prepara la tutela con lo que ya tiene.',
    'No necesita abogado y el juez decide en 10 días.',
    'Si el juez falla en contra, le muestra el plazo para impugnar.',
  ], 'Si no responden, el siguiente paso ya está listo. Y vale la pena: el 73% de las tutelas por derecho de petición terminan a favor de la persona.'],
];
flujo.forEach(([titulo, video, puntos, guion], i) => {
  const s = lamina('Así funciona');
  s.addText(titulo, { placeholder: 'title' });
  pasoDeFlujo(s, i + 1, puntos);
  clip(s, video);
  if (video === '7-tutela') nota(s, '73% = 177.531 tutelas concedidas + 138.738 «hecho superado», de 432.658 tutelas por derecho de petición (Rama Judicial, 2025).');
  s.addNotes(`${guion}\n\nEl video arranca solo al llegar a la lámina (dura unos 7 segundos).`);
});

// ============ 5. Por qué funciona ============
pres.addSection({ title: 'Por qué funciona' });
{
  const s = lamina('Por qué funciona');
  s.addText('LA ORIENTACIÓN NO DEBERÍA DEPENDER SIEMPRE DE INTERNET', { placeholder: 'title' });
  [
    ['Sin conexión', ['Consultar los derechos guardados.', 'Leer y escuchar las historietas.', 'Crear el documento con las plantillas.', 'Ver Mis casos y sus plazos.'], C.accent4, C.text1],
    ['Con conexión', ['Hablar con el asistente (IA y voz).', 'Enviar el documento por correo.', 'Recibir avisos por SMS, WhatsApp o llamada.', 'Si la IA falla, sigue en modo básico.'], C.accent1, C.background2],
  ].forEach(([nombre, puntos, fondo, color], i) => {
    const x = 0.6 + i * 6.23;
    tarjeta(s, x, 1.85, 5.9, 3.7, fondo, false);
    texto(s, nombre, { x: x + 0.35, y: 2.1, w: 5.2, h: 0.5, fontSize: 24, bold: true, color });
    vinetas(s, puntos, { x: x + 0.35, y: 2.75, w: 5.2, h: 2.6, fontSize: 18, color });
  });
  buho(s, 'computador', 0.6, 5.75, 1.2);
  texto(s, 'Es una app web (PWA): se abre con un enlace, se instala sin tienda de aplicaciones y queda guardada en el celular.', { x: 1.95, y: 5.85, w: 10.7, h: 0.9, fontSize: 17, valign: 'middle' });
  s.addNotes('Lo esencial funciona sin internet. Cuando hay señal, se suman la voz, el envío y los avisos. Y si la IA falla a mitad de camino, la app pasa sola a un modo básico: el demo no se cae.');
}
{
  const s = lamina('Por qué funciona');
  s.addText('CUIDAMOS A QUIEN LA USA', { placeholder: 'title' });
  buho(s, 'ley', 0.7, 2.25, 3.9);
  [
    ['No reemplaza al abogado', 'La IA conversa y clasifica. Leyes, plazos y documentos salen de contenido fijo que valida un consultorio jurídico.'],
    ['Sus datos no viajan', 'Cédula, teléfono y correo se quitan antes de llegar a la IA. El servidor no guarda conversaciones.'],
    ['Celular compartido', 'Los casos quedan cifrados con una clave de 4 números, y «Borrar todo» está en Perfil.'],
    ['Protocolo de riesgo', 'Ante amenazas o grupos armados, no pregunta más, no guarda nada y muestra a dónde acudir.'],
  ].forEach(([t, d], i) => {
    const x = 4.4 + (i % 2) * 4.24, y = 1.85 + Math.floor(i / 2) * 2.45;
    tarjeta(s, x, y, 4.09, 2.2);
    texto(s, t, { x: x + 0.3, y: y + 0.25, w: 3.5, h: 0.45, fontSize: 19, bold: true, color: C.accent1 });
    texto(s, d, { x: x + 0.3, y: y + 0.78, w: 3.5, h: 1.3, fontSize: 15 });
  });
  s.addNotes('La confianza es el producto. No nos llamamos abogados, lo jurídico es contenido fijo y validado, los datos personales nunca llegan a la IA y, si hay riesgo para la persona, la app se detiene y la lleva a quien puede protegerla.');
}
{
  const s = lamina('Por qué funciona');
  s.addText('NADIE MÁS HACE EL CAMINO COMPLETO', { placeholder: 'title' });
  texto(s, 'De 43 productos revisados en Colombia y el mundo, ninguno une orientación, documento, envío y seguimiento del plazo.', { x: 0.6, y: 1.7, w: 12.13, h: 0.5, fontSize: 18, align: 'center' });
  const si = '✓', no = '—';
  const enc = { bold: true, color: C.background2, fill: { color: C.accent1 }, align: 'center', valign: 'middle', fontSize: 14 };
  const celda = (t, extra = {}) => ({ text: t, options: { align: 'center', valign: 'middle', fontSize: 16, ...extra } });
  const fila = (nombre, valores, extra = {}) => [{ text: nombre, options: { valign: 'middle', fontSize: 16, bold: true, ...extra } }, ...valores.map((v) => celda(v, extra))];
  const mi = { fill: { color: C.accent3 }, bold: true, color: C.accent1 };
  s.addTable([
    [{ text: 'Producto', options: { ...enc, align: 'left' } }, ...['Orienta', 'Arma el documento', 'Lo envía', 'Sigue el plazo', 'Sin internet', 'Costo'].map((t) => ({ text: t, options: enc }))],
    fila('LegalApp (MinJusticia)', [si, si, no, no, si, 'Gratis']),
    fila('Tuteladora (ONG Temblores)', [no, si, no, no, no, 'Gratis']),
    fila('WAIAS (con abogados)', [si, no, no, no, no, '$85.000']),
    fila('MiDerecho', [si, si, si, si, si, 'Gratis'], mi),
  ], { x: 0.6, y: 2.45, w: 12.13, colW: [3.1, 1.45, 1.75, 1.4, 1.55, 1.4, 1.48], rowH: 0.58, color: C.text1, fill: { color: C.background1 }, border: { type: 'solid', pt: 1, color: 'E4DCCB' }, margin: 0.08 });
  buho(s, 'lupa', 0.7, 5.6, 1.35);
  texto(s, 'LegalApp intentó ser una app para todos y quedó sin actualizar desde 2019. MiDerecho es la herramienta de quien la comunidad ya busca cuando tiene un problema: su líder.', { x: 1.95, y: 5.65, w: 10.7, h: 1.0, fontSize: 17, italic: true, color: C.accent2, valign: 'middle' });
  s.addNotes('Revisamos 43 productos. Hay quien orienta y hay quien genera documentos, pero nadie envía el documento ni sigue el plazo. Esa es nuestra diferencia.');
}
{
  const s = lamina('Por qué funciona');
  s.addText('LLEGA DE LA MANO DE LOS LÍDERES', { placeholder: 'title' });
  texto(s, 'La persona líder abre MiDerecho con el vecino al lado. El vecino decide y da el consentimiento; el líder no guarda listas.', { x: 0.6, y: 1.85, w: 5.5, h: 1.2, fontSize: 18 });
  vinetas(s, [
    'Marca colectiva: «Promotores de derechos de la vereda». El rostro del líder es opcional, por seguridad.',
    'Incentivo por caso cerrado y reconocimiento con la Personería o una universidad.',
    'Piloto sugerido: Montes de María, Sur del Tolima o Macarena-Guaviare.',
  ], { x: 0.6, y: 3.2, w: 5.5, h: 3.3, fontSize: 16 });
  texto(s, 'KIT PARA LÍDERES', { x: 6.55, y: 1.85, w: 6, h: 0.3, fontSize: 13, bold: true, color: C.accent2, charSpacing: 1 });
  ['Credencial con código QR', 'Volante con pictogramas', 'Tarjeta de plazos', 'Audios para grupos de WhatsApp', 'Guion de radio de 30 segundos', 'Protocolo de seguridad de una hoja'].forEach((t, i) => {
    const x = 6.55 + (i % 3) * 2.07, y = 2.3 + Math.floor(i / 3) * 1.6;
    tarjeta(s, x, y, 1.92, 1.42, C.accent3, false);
    texto(s, t, { x: x + 0.15, y, w: 1.62, h: 1.42, fontSize: 15, bold: true, color: C.accent1, align: 'center', valign: 'middle' });
  });
  buho(s, 'corazon', 11.45, 5.5, 1.5);
  s.addNotes('Lo que funciona en el mundo es una persona de confianza apoyada por tecnología, no un bot solo. Por eso llegamos con los líderes de las Juntas de Acción Comunal, con un kit sencillo y cuidando su seguridad.');
}
{
  const s = lamina('Por qué funciona');
  s.addText('EL CAMPESINO NO PAGA', { placeholder: 'title' });
  [
    ['$0', 'para la persona que usa MiDerecho'],
    ['$29 millones', 'por municipio al año: licencia ($15 millones) y promotores ($14 millones)'],
    ['$55-62 mil', 'por caso, frente a $85.000 de una consulta privada'],
  ].forEach(([valor, desc], i) => {
    const x = 0.6 + i * 4.14;
    tarjeta(s, x, 1.85, 3.85, 2.35);
    texto(s, valor, { x: x + 0.3, y: 2.05, w: 3.25, h: 0.8, fontSize: 34, bold: true, color: C.accent1, valign: 'middle' });
    texto(s, desc, { x: x + 0.3, y: 2.95, w: 3.25, h: 1.1, fontSize: 16 });
  });
  texto(s, [
    { text: 'Paga el Estado: ', options: { bold: true } },
    { text: 'el Ministerio de Justicia (programa Sistemas Locales de Justicia), gobernaciones y alcaldías PDET, con la cooperación internacional como contrapartida. La Ley 2430 de 2024 pide llevar la justicia al campo «procurando el uso de las TIC».' },
  ], { x: 0.6, y: 4.6, w: 9.8, h: 1.6, fontSize: 18 });
  buho(s, 'documento', 11.0, 4.35, 2.2);
  nota(s, 'Pesos colombianos. Costos estimados por el equipo (informe ejecutivo, sección 12.4); se validan en el piloto.');
  s.addNotes('El campesino no paga. Paga el Estado, que por ley tiene que llevar la justicia al campo con tecnología. Con promotores pagados, un caso cuesta menos que una consulta privada.');
}

// ============ 6. Cierre ============
pres.addSection({ title: 'Cierre' });
{
  const s = lamina('Cierre', 'OSCURO');
  s.addText('GRACIAS POR SU ATENCIÓN', { placeholder: 'title' });
  texto(s, 'Pruébela: miderecho-two.vercel.app', { x: 0.8, y: 3.9, w: 7.6, h: 0.6, fontSize: 26, bold: true, color: C.accent4, hyperlink: { url: 'https://miderecho-two.vercel.app' } });
  texto(s, 'Valentina Quintero · Juan Diego Balanta · Juan José Gallego', { x: 0.8, y: 4.65, w: 7.6, h: 0.45, fontSize: 17, color: C.background2 });
  buho(s, 'corazon', 9.0, 1.7, 4.3);
  s.addNotes('Gracias. La app está en línea: pueden probarla en miderecho-two.vercel.app.');
}

await pres.writeFile({ fileName: SALIDA });

// --- Ajustes que pptxgenjs no hace: colores del tema y videos que arrancan solos ---
const zip = await JSZip.loadAsync(fs.readFileSync(SALIDA));
const SLOTS = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
const tema = 'ppt/theme/theme1.xml';
zip.file(tema, (await zip.file(tema).async('string'))
  .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, `<a:clrScheme name="${TEMA.name}">${SLOTS.map((k) => `<a:${k}><a:srgbClr val="${TEMA.colors[k]}"/></a:${k}>`).join('')}</a:clrScheme>`)
  .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, `$1${TEMA.name}"`));

// "Iniciar: automáticamente" de PowerPoint para el video de cada lámina.
const reproduccionAutomatica = (spid) => `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="1" fill="hold"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq><p:video><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cMediaNode></p:video></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
for (const nombre of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
  const xml = await zip.file(nombre).async('string');
  const video = xml.match(/<p:pic>\s*<p:nvPicPr><p:cNvPr id="(\d+)"(?:(?!<\/p:pic>)[\s\S])*?<a:videoFile/);
  if (!video) continue;
  // pptxgenjs le da al video un id que ya usa otra forma: se le pone uno libre antes de animarlo.
  const id = Math.max(...[...xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map((m) => Number(m[1]))) + 1;
  const pic = video[0].replace(`<p:cNvPr id="${video[1]}"`, `<p:cNvPr id="${id}"`);
  zip.file(nombre, xml.replace(video[0], pic).replace('</p:sld>', `${reproduccionAutomatica(id)}</p:sld>`));
}
fs.writeFileSync(SALIDA, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log(`Listo: ${path.relative(process.cwd(), SALIDA)}`);
