import { NOMBRE, AVISO, AYUDA_RIESGO, MUNICIPIOS, TEMAS, PETICIONES_EXTRA, PLAZOS, CARTA, DERECHOS, SALUD_NIEGA, RAZONES_IMPUGNACION, SERVICIOS, MOTIVOS_SP, RAZONES_RECURSO, EXPLICA } from './contenido.js';
import { sumarHabiles, habilesEntre, iso, deIso } from './plazos.js';
import { TIPOS, generarDocumento, plantillaHecho, valor, llenar, esc } from './plantillas.js';
import { programarRecordatorios, cancelarRecordatorios } from './comunicaciones.js';

const $ = s => document.querySelector(s);
const main = $('#app');
const KEY = 'pc-datos';
const acciones = {}, formularios = {};
let clave = null, salt = null, casos = [];   // casos guardados: cifrados con la clave del usuario
let caso = null;                            // borrador del caso actual: solo en memoria, nunca se guarda (nombre, cédula, hechos, salud)
let sel = null;                             // código del caso abierto en "Mis casos"
let docActual = '', textoVoz = '', diasDemo = 0, alFecha = null;
let modoVoz = localStorage.getItem('modoVoz') === '1';

// ---------- utilidades ----------
const hoy = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diasDemo); };
const fechaLarga = d => d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fechaCorta = d => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaSms = d => `${d.getDate()}-${MESES[d.getMonth()]}`;   // SMS sin tildes (GSM-7)
const nuevoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const tema = id => TEMAS.find(t => t.id === id);
const de = (xs, id) => xs.find(x => x.id === id);
const buscar = cod => casos.find(c => c.codigo === cod);
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const esTutela = c => c.tipo.startsWith('tutela');
const esServicio = c => c.tipo === 'servicios_publicos' || c.tipo === 'recurso_servicios';
const lo = c => esServicio(c) ? 'lo' : 'la';   // el reclamo, el recurso; la petición, la tutela
const checks = (name, xs, marcadas = 0) => xs.map((x, i) => `<label class="check"><input type="checkbox" name="${name}" value="${i}" ${i < marcadas ? 'checked' : ''}> ${esc(x)}</label>`).join('');

function aviso(msg) {
  const a = $('#aviso');
  a.textContent = msg;
  a.classList.add('ver');
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => a.classList.remove('ver'), 3500);
  if (modoVoz) hablar(msg);
}

// ---------- asistente y voz ----------
let estadoBase = 'reposo';
const ponerEstado = e => { $('#asistente').dataset.estado = e; };

function hablar(texto) {
  const s = window.speechSynthesis;
  if (!s) return;
  s.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.onstart = () => ponerEstado('hablando');
  u.onend = u.onerror = () => ponerEstado(estadoBase);
  const voces = s.getVoices();
  u.voice = voces.find(v => v.lang === 'es-CO') || voces.find(v => v.lang.startsWith('es')) || null;
  u.lang = u.voice?.lang || 'es-CO';
  u.rate = 0.95;
  s.speak(u);
}
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
const botonDictar = campo => Reconocimiento
  ? `<button type="button" class="secundario" data-accion="dictar" data-val="${campo}">🎤 Dictar en vez de escribir</button><p class="nota">El dictado usa el servicio de voz del celular y necesita internet.</p>`
  : '';
acciones.dictar = campo => {
  const r = new Reconocimiento();
  r.lang = 'es-CO';
  r.onresult = e => { const el = document.getElementsByName(campo)[0]; el.value = (el.value ? el.value + ' ' : '') + e.results[0][0].transcript; };
  r.onerror = () => aviso('No pude escuchar. Revise el internet o escriba.');
  window.speechSynthesis?.cancel();
  r.start();
  aviso('Hable ahora…');
};
acciones.leer = () => hablar(textoVoz);
acciones.voz = () => {
  if (!window.speechSynthesis) return aviso('Este celular no puede leer en voz alta');
  modoVoz = !modoVoz;
  localStorage.setItem('modoVoz', modoVoz ? '1' : '0');
  pintarVoz();
  modoVoz ? hablar(textoVoz) : speechSynthesis.cancel();
};
const pintarVoz = () => $('#btn-voz').setAttribute('aria-pressed', modoVoz);

// ---------- almacenamiento cifrado ----------
// ponytail: un PIN de 4 dígitos se puede forzar con el teléfono en la mano; en producción usar la llave segura del sistema (Android Keystore).
const cod = new TextEncoder(), decod = new TextDecoder();
const b64 = u8 => btoa(String.fromCharCode(...u8));
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function derivar(pin, sal) {
  const base = await crypto.subtle.importKey('raw', cod.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sal, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function guardar() {
  if (!clave) throw new Error('App bloqueada: no se guarda nada');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, clave, cod.encode(JSON.stringify(casos))));
  localStorage.setItem(KEY, JSON.stringify({ salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
}
// Con una clave errada decrypt falla y no se toca nada: la app sigue bloqueada y nadie puede recifrar los casos con esa clave.
async function abrir(pin) {
  const s = JSON.parse(localStorage.getItem(KEY)), sal = deB64(s.salt), k = await derivar(pin, sal);
  const leidos = JSON.parse(decod.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(s.iv) }, k, deB64(s.ct))));
  leidos.forEach(c => { c.tipo ||= 'peticion'; });   // casos guardados antes de que hubiera varios documentos
  salt = sal; clave = k; casos = leidos;
}

// ---------- pantallas ----------
function pantalla(titulo, cuerpo = '', opciones = [], estado = 'reposo') {
  estadoBase = estado;
  ponerEstado(estado);
  main.innerHTML = `<h1 tabindex="-1">${esc(titulo)}</h1><div class="cuerpo">${cuerpo}</div>` + (opciones.length
    ? `<div class="opciones">${opciones.map(o => `<button class="op ${o.clase || ''}" data-accion="${o.accion}" data-val="${esc(o.val ?? '')}" ${o.off ? 'disabled' : ''}>${o.icono ? `<span class="ico" aria-hidden="true">${o.icono}</span>` : ''}<span><b>${esc(o.txt)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></button>`).join('')}</div>`
    : '');
  textoVoz = [titulo, main.querySelector('.cuerpo').innerText, opciones.length && 'Opciones: ' + opciones.map(o => o.txt).join('. ')].filter(Boolean).join('. ');
  main.querySelector('h1').focus();
  window.scrollTo(0, 0);
  if (modoVoz) hablar(textoVoz);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-accion]');
  if (b && acciones[b.dataset.accion]) acciones[b.dataset.accion](b.dataset.val, b);
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  formularios[e.target.dataset.form]?.(Object.fromEntries(fd), fd);
});

// Pantalla con un selector de fecha; fn recibe la fecha elegida.
function pedirFecha(titulo, nota, fn, opciones = []) {
  alFecha = fn;
  pantalla(titulo, `${nota ? `<p class="nota">${nota}</p>` : ''}<form data-form="fecha" class="form"><input type="date" name="fecha" max="${iso(hoy())}" value="${iso(hoy())}" aria-label="${esc(titulo)}" required><button class="principal">Guardar la fecha</button></form>`, opciones);
}
formularios.fecha = ({ fecha }) => alFecha(deIso(fecha));

// ---------- clave ----------
function pantallaPin() {
  const nuevo = !localStorage.getItem(KEY);
  const campo = (n, ph) => `<input name="${n}" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required autocomplete="off" placeholder="${ph}" aria-label="${ph}">`;
  pantalla(nuevo ? 'Bienvenido. Cree su clave' : 'Escriba su clave',
    `<p>${nuevo ? 'Elija 4 números. Protegen los casos guardados en este celular, por si alguien más lo usa.' : 'Para ver los casos guardados en este celular.'}</p>
     <form data-form="pin" class="form">${campo('pin', 'Clave de 4 números')}${nuevo ? campo('pin2', 'Repita la clave') : ''}<button class="principal">Entrar</button></form>
     ${nuevo ? '' : '<button class="enlace" data-accion="borrar">Olvidé la clave (borra todo)</button>'}`);
}
formularios.pin = async ({ pin, pin2 }) => {
  try {
    if (!localStorage.getItem(KEY)) {
      if (pin !== pin2) return aviso('Las claves no son iguales');
      salt = crypto.getRandomValues(new Uint8Array(16));
      clave = await derivar(pin, salt);
      casos = [];
      await guardar();
    } else await abrir(pin);
    procesarCola();
    caso ? siguiente() : inicio();   // si el agente de voz arrancó un caso con la app bloqueada, sigue ahí
  } catch { aviso('Clave incorrecta'); }
};
acciones.pin = () => pantallaPin();
// Descarta el borrador y el documento, que pueden tener nombre, cédula o datos de salud.
const olvidar = () => { caso = null; docActual = ''; $('#imprimir').innerHTML = ''; };
addEventListener('afterprint', () => { $('#imprimir').innerHTML = ''; });
acciones.bloquear = () => {
  clave = null; casos = []; olvidar();
  window.speechSynthesis?.cancel();
  pantallaPin();
};

// ---------- inicio ----------
const necesitaAtencion = (c, h) => (c.venc && deIso(c.venc) < h) || !!c.limite || c.estado === 'negada' || c.estado === 'por_recurrir';
function inicio() {
  olvidar();
  const abiertos = casos.filter(c => c.estado !== 'cerrado');
  const atencion = abiertos.filter(c => necesitaAtencion(c, hoy())).length;
  pantalla(NOMBRE, '<p>¿Qué necesita hoy?</p>', [
    { txt: 'Le pido algo a una entidad', sub: 'Derecho de petición a la alcaldía, la ANT u otra entidad. Gratis y sin abogado.', icono: '📄', accion: 'nuevo', val: 'peticion', clase: 'grande' },
    { txt: 'Me niegan la salud', sub: 'La EPS no me da la cita, el medicamento o la cirugía', icono: '🏥', accion: 'nuevo', val: 'tutela_salud', clase: 'grande' },
    { txt: 'Me cobraron mal el agua o la luz', sub: 'También si le cortaron el servicio o hay un daño', icono: '💡', accion: 'nuevo', val: 'servicios_publicos', clase: 'grande' },
    { txt: 'No me respetan otro derecho', sub: 'La pensión o ayuda con que vive, la escuela, una decisión sin escucharlo', icono: '⚖️', accion: 'nuevo', val: 'tutela', clase: 'grande' },
    { txt: `Mis casos (${abiertos.length})`, sub: atencion ? `${atencion === 1 ? '1 necesita' : `${atencion} necesitan`} atención: revise qué sigue` : 'Plazos y qué sigue', icono: '⏰', accion: 'casos', clase: atencion ? 'sugerida' : '' },
    { txt: '¿Su carta venta lo hace dueño?', sub: 'Qué vale su papel y cómo formalizar', icono: '🏡', accion: 'carta' },
    { txt: 'Cómo funciona', icono: '❓', accion: 'como' },
  ], atencion ? 'alerta' : 'reposo');
}
acciones.inicio = () => clave ? inicio() : pantallaPin();

// ---------- nuevo caso ----------
// Cada respuesta llena un dato del borrador y siguiente() muestra el primer paso que falte.
// Así se puede arrancar con datos ya conocidos (window.miderecho.iniciarCaso), sin saltarse el aviso ni la pregunta de riesgo.
function siguiente() {
  const c = caso, t = c.tipo, tutela = esTutela(c), sp = t === 'servicios_publicos';
  const pasos = [
    [!c.para, pasoPara],
    [!c.acepto, pasoAviso],
    [!c.sinRiesgo, pasoRiesgo],
    [tutela && !c.afectado, pasoAfectado],
    [t === 'peticion' && !c.temaId, () => elegirDe('¿De qué se trata?', 'temaId', TEMAS)],
    [!c.municipio || c.vereda == null, pasoMunicipio],
    [sp && !c.servicio, () => elegirDe('¿Qué servicio?', 'servicio', SERVICIOS)],
    [t === 'tutela' && !c.derecho, () => elegirDe('¿Qué derecho no le respetan?', 'derecho', DERECHOS.filter(d => d.icono))],
    [!c.entidad, pasoEntidad],
    [sp && !c.motivo, () => elegirDe(`¿Qué pasó con el servicio de ${de(SERVICIOS, c.servicio).titulo.toLowerCase()}?`, 'motivo', MOTIVOS_SP)],
    [t === 'tutela_salud' && !c.que, () => elegirDe(`¿Qué le niega ${c.entidad}?`, 'que', SALUD_NIEGA)],
    [tutela && !c.juramento, pasoJuramento],
    [tutela && !c.pidio && c.derecho !== 'peticion', pasoPidio],   // en la de petición ya se sabe que pidió
    [c.revisar || !hechosListos(c), pasoHechos],
    [tutela && !c.sigue, pasoSigue],
    [tutela && !c.urgente, pasoUrgente],
    [tutela && c.pidio === 'no' && c.urgente === 'no' && !c.seguir, pasoPrimero],
    [tutela && (LEJOS.includes(c.desde) || de(DERECHOS, c.derecho)?.otraVia) && !c.avisado, pasoAntes],
    [tutela && !c.pruebas, pasoPruebas],
    [(t === 'peticion' || sp) && !c.peticiones?.length, pasoPeticiones],
    [!tutela && !c.modo, pasoEntrega],
    [c.modo === 'envio' && !c.nombre, pasoDatos],
  ];
  (pasos.find(p => p[0])?.[1] || pasoVista)();
}
// Pantalla de una sola pregunta: cada botón llena caso[campo] y sigue.
const elegirDe = (titulo, campo, xs) => pantalla(titulo, '', xs.map(x => ({ txt: x.titulo, sub: x.sub ?? x.ayuda, icono: x.icono, accion: 'dato', val: `${campo}:${x.id}` })));
acciones.dato = v => { const [k, x] = v.split(':'); caso[k] = x; siguiente(); };

acciones.nuevo = tipo => { caso = null; iniciarCaso({ tipo: tipo || 'peticion' }); };
acciones.nuevoTierras = () => { caso = null; iniciarCaso({ tipo: 'peticion', tema: 'tierras' }); };

const pasoPara = () => pantalla('¿Para quién es este caso?', '', [
  { txt: 'Para mí', icono: '🙋', accion: 'dato', val: 'para:mi' },
  { txt: 'Para un vecino que está conmigo', sub: 'Usted le ayuda; él o ella decide', icono: '🤝', accion: 'dato', val: 'para:vecino' },
]);
const pasoAviso = () => pantalla('Antes de empezar',
  `${caso.para === 'vecino' ? '<p class="nota">Léale este aviso a su vecino, o toque 🔊 arriba. La decisión es de él o de ella.</p>' : ''}<div class="aviso-priv">${AVISO}</div>`, [
  { txt: 'Sí, acepto', icono: '✅', accion: 'dato', val: 'acepto:si', clase: 'principal' },
  { txt: 'No acepto', icono: '✋', accion: 'noAcepta' },
]);
acciones.noAcepta = () => {
  caso = null;
  pantalla('Está bien', '<p>No guardamos nada. Si quiere ayuda en persona, la Personería de su municipio atiende gratis.</p>', [{ txt: 'Volver al inicio', accion: 'inicio' }]);
};
const pasoRiesgo = () => pantalla('Una pregunta importante', '<p>¿Hay alguien en peligro hoy, o le han amenazado por reclamar?</p>', [
  { txt: 'No', icono: '👍', accion: 'dato', val: 'sinRiesgo:si' },
  { txt: 'Sí', icono: '⚠️', accion: 'riesgo', val: 'si', clase: 'peligro' },
  { txt: 'No sé', icono: '🤔', accion: 'riesgo', val: 'nose' },
]);
acciones.riesgo = v => {
  if (v === 'si') caso = null;   // con riesgo confirmado no se recoge nada más
  pantalla('Esto es serio. Busque ayuda ahora', AYUDA_RIESGO, v === 'nose'
    ? [{ txt: 'No hay peligro: seguir', accion: 'dato', val: 'sinRiesgo:si' }, { txt: 'Salir', accion: 'inicio' }]
    : [{ txt: 'Salir', accion: 'inicio' }], 'alerta');
};

function pasoMunicipio() {
  const otro = caso.municipio && !MUNICIPIOS.some(m => m.nombre === caso.municipio) ? caso.municipio : '';
  pantalla('¿Dónde vive?', `<form data-form="municipio" class="form">
    <label>Municipio<select name="municipio">${MUNICIPIOS.map(m => `<option ${m.nombre === caso.municipio ? 'selected' : ''}>${esc(m.nombre)}</option>`).join('')}<option value="" ${otro ? 'selected' : ''}>Otro municipio</option></select></label>
    <input name="otro" value="${esc(otro)}" placeholder="Si es otro municipio, escríbalo aquí" aria-label="Otro municipio">
    <label>Vereda<input name="vereda" required value="${esc(caso.vereda)}" placeholder="Nombre de su vereda"></label>
    <button class="principal">Continuar</button></form>`);
}
formularios.municipio = ({ municipio, otro, vereda }) => {
  caso.municipio = municipio || otro.trim();
  if (!caso.municipio) return aviso('Escriba su municipio');
  caso.vereda = vereda.trim();
  siguiente();
};

function pasoEntidad() {
  if (caso.tipo === 'tutela_salud') return formEntidad('¿Cuál es su EPS?', 'Nombre de su EPS');
  if (caso.tipo === 'tutela') return formEntidad('¿Quién no le respeta ese derecho?', 'Entidad o empresa', { ph: 'Ej.: Alcaldía, Colpensiones, Secretaría de Educación' });
  if (caso.tipo === 'servicios_publicos') return formEntidad('¿Qué empresa le presta el servicio?', 'Nombre de la empresa (está en la factura)', { correo: true, cuenta: true });
  const m = MUNICIPIOS.find(x => x.nombre === caso.municipio);
  const ops = [
    { txt: `Alcaldía de ${caso.municipio}`, sub: m ? m.correo : 'Correo por confirmar', icono: '🏛️', accion: 'entidad', val: 'alcaldia' },
    { txt: 'Mi EPS', sub: 'Salud', icono: '🏥', accion: 'entidad', val: 'eps' },
    { txt: 'Agencia Nacional de Tierras', sub: 'Formalización de predios', icono: '🌱', accion: 'entidad', val: 'ant' },
    { txt: 'Otra entidad', icono: '✏️', accion: 'entidad', val: 'otra' },
  ];
  const i = ops.findIndex(o => o.val === tema(caso.temaId).entidad);
  const sugerida = ops.splice(i, 1)[0];
  ops.unshift({ ...sugerida, clase: 'sugerida', sub: `Recomendada para su caso · ${sugerida.sub}` });
  pantalla('¿A quién le va a pedir?', '<p class="nota">Si se equivoca de entidad, esa entidad debe pasar su petición a la correcta.</p>', ops);
}
acciones.entidad = v => {
  const m = MUNICIPIOS.find(x => x.nombre === caso.municipio);
  if (v === 'alcaldia' && m) { caso.entidad = `Alcaldía de ${caso.municipio}`; caso.correo = m.correo; return siguiente(); }
  const nombre = { alcaldia: `Alcaldía de ${caso.municipio}`, ant: 'Agencia Nacional de Tierras (ANT)' }[v] || caso.previa || '';
  formEntidad('Datos de la entidad', 'Nombre de la entidad', { valor: nombre, ph: v === 'eps' ? 'Nombre de su EPS' : '', correo: true });
};
function formEntidad(titulo, etiqueta, { valor = '', ph = '', correo, cuenta } = {}) {
  pantalla(titulo, `<form data-form="entidad" class="form">
    <label>${etiqueta}<input name="entidad" required value="${esc(valor)}" placeholder="${esc(ph)}"></label>
    ${correo ? '<label>Correo de la entidad (si lo sabe)<input name="correo" type="email"></label><p class="nota">Sin correo, igual puede entregarlo usted mismo.</p>' : ''}
    ${cuenta ? '<label>Número de cuenta o contrato (está en la factura, opcional)<input name="cuenta" inputmode="numeric" autocomplete="off"></label>' : ''}
    <button class="principal">Continuar</button></form>`);
}
formularios.entidad = ({ entidad, correo = '', cuenta = '' }) => { caso.entidad = entidad.trim(); caso.correo = correo.trim(); caso.cuenta = cuenta.trim(); siguiente(); };

// ---------- preguntas de la tutela ----------
// Legitimación (Decreto 2591, art. 10): la persona afectada o quien representa a un menor. [validar] agencia oficiosa para otros adultos.
const pasoAfectado = () => pantalla('¿A quién le están negando el derecho?', '', [
  { txt: caso.para === 'vecino' ? 'A mi vecino, que la va a firmar' : 'A mí', icono: '🙋', accion: 'dato', val: 'afectado:propio' },
  { txt: 'A un hijo o hija menor de edad', sub: 'La firma el papá, la mamá o quien lo tiene a cargo', icono: '🧒', accion: 'dato', val: 'afectado:menor' },
  { txt: 'A otra persona adulta', icono: '👥', accion: 'otraPersona' },
]);
acciones.otraPersona = () => { caso = null; pantalla('La tutela la presenta la persona afectada', EXPLICA.otraPersona, [{ txt: 'Volver al inicio', accion: 'inicio' }]); };
const LEJOS = ['hace seis meses', 'hace más de un año'];
acciones.explicarDemora = () => { caso.avisado = 'si'; acciones.cambiar(); };
// Inmediatez y subsidiariedad en lenguaje claro antes de generar el documento.
function pasoAntes() {
  const d = de(DERECHOS, caso.derecho);
  const lejos = LEJOS.includes(caso.desde);
  pantalla('Antes de seguir', `${lejos ? EXPLICA.inmediatez : ''}${d.otraVia ? `<p>${d.otraVia}</p>` : ''}${EXPLICA.orientacion}`, [
    ...(lejos ? [{ txt: 'Escribir por qué no la presenté antes', icono: '✏️', accion: 'explicarDemora' }] : []),
    { txt: 'Seguir con la tutela', icono: '⚖️', accion: 'dato', val: 'avisado:si', clase: lejos ? '' : 'principal' },
    { txt: 'Volver al inicio', accion: 'inicio' },
  ]);
}
const pasoJuramento = () => pantalla('¿Ya presentó otra tutela por esto mismo?', `<p class="nota">${EXPLICA.juramento}</p>`, [
  { txt: 'No, es la primera', icono: '1️⃣', accion: 'dato', val: 'juramento:si' },
  { txt: 'Sí, ya presenté una', icono: '📂', accion: 'yaPresento' },
]);
acciones.yaPresento = () => pantalla('No presente otra igual', EXPLICA.yaPresento, [
  { txt: 'Anotar mi tutela en Mis casos', sub: 'Le avisamos qué sigue: impugnar o pedir el desacato', icono: '📅', accion: 'pasoEntregada', clase: 'principal' },
  { txt: 'Volver al inicio', accion: 'inicio' },
]);
// Subsidiariedad en lenguaje claro: ¿ya intentó resolverlo con la entidad?
const pasoPidio = () => pantalla(`¿Ya le pidió a ${caso.entidad} que lo solucionara?`, '<p class="nota">Por escrito, por teléfono o en la ventanilla.</p>', [
  { txt: 'Sí, y me dijeron que no', icono: '✋', accion: 'dato', val: 'pidio:negada' },
  { txt: 'Sí, pero no responden o lo aplazan', icono: '🔕', accion: 'dato', val: 'pidio:sin_respuesta' },
  { txt: 'Todavía no le he pedido', icono: '🤔', accion: 'dato', val: 'pidio:no' },
]);
// Inmediatez: la tutela es para algo que sigue pasando.
const pasoSigue = () => pantalla('¿El problema sigue hoy?', '', [
  { txt: 'Sí, sigue', sub: 'Todavía no me dan lo que necesito', icono: '⏳', accion: 'dato', val: 'sigue:si' },
  { txt: 'No, ya se solucionó', icono: '✅', accion: 'yaSolucionado' },
]);
acciones.yaSolucionado = () => { caso = null; pantalla('Entonces la tutela ya no hace falta', EXPLICA.hechoSuperado, [{ txt: 'Volver al inicio', accion: 'inicio' }]); };
// Medida provisional (Decreto 2591, art. 7)
const pasoUrgente = () => pantalla(caso.tipo === 'tutela_salud' ? '¿Su vida o su salud corren peligro si espera?' : '¿Le puede pasar algo grave si espera?',
  `<p>El juez tiene ${TIPOS.tutela.plazo} días hábiles para decidir.</p>`, [
  { txt: 'Sí, es urgente', sub: 'Le pedimos al juez una medida provisional: que ordene actuar de inmediato', icono: '🚨', accion: 'dato', val: 'urgente:si' },
  { txt: 'No, puedo esperar', icono: '🕐', accion: 'dato', val: 'urgente:no' },
]);
const pasoPrimero = () => pantalla(`Primero pídaselo a ${caso.entidad}`, EXPLICA.subsidiariedad, [
  { txt: 'Hacer primero el derecho de petición', sub: 'Así el juez ve que usted ya intentó resolverlo', icono: '📄', accion: 'peticionPrimero', clase: 'principal' },
  { txt: 'Seguir con la tutela de todos modos', icono: '⚖️', accion: 'dato', val: 'seguir:si' },
]);
acciones.peticionPrimero = () => {
  const { para, acepto, sinRiesgo, municipio, vereda, entidad, desde, detalle, palabras } = caso;
  caso = { tipo: 'peticion', temaId: caso.tipo === 'tutela_salud' ? 'salud' : 'otro', para, acepto, sinRiesgo, municipio, vereda, desde,
    palabras: [detalle, palabras].filter(Boolean).join('. '), previa: entidad };   // previa: se ofrece al escribir la entidad (y su correo)
  siguiente();
};
function pasoPruebas() {
  pantalla('¿Qué papeles tiene?', `<form data-form="pruebas" class="form"><p class="nota">Marque los que tenga. Lleve una copia de cada uno con la tutela.</p>
    ${checks('prueba', de(DERECHOS, caso.derecho).pruebas)}<button class="principal">Continuar</button></form>`);
}
formularios.pruebas = (_, fd) => { caso.pruebas = fd.getAll('prueba').map(i => de(DERECHOS, caso.derecho).pruebas[i]); siguiente(); };

// ---------- hechos, peticiones y entrega ----------
const DESDE = ['hace una semana', 'hace un mes', 'hace tres meses', 'hace seis meses', 'hace más de un año'];
const HUECOS = { desde: '[desde cuándo]', detalle: '[lo que escriba abajo]' };
function hechosListos(c) {
  if (c.tipo === 'recurso_servicios') return !!(c.razones?.length || c.palabras);
  const pl = plantillaHecho(c);
  if (!pl) return !!c.palabras && (!esTutela(c) || !!c.desde);
  return !!c.desde && (c.tipo !== 'tutela' || !!c.detalle);
}
function pasoHechos() {
  const c = caso;
  if (c.tipo === 'recurso_servicios') return pantalla('¿Por qué no está de acuerdo con la respuesta?', `<form data-form="hechos" class="form">
    <p class="nota">Tiene hasta el ${fechaLarga(deIso(c.limite))} para presentarlo. ${EXPLICA.pagoRecurso}</p>
    ${checks('razon', RAZONES_RECURSO)}
    <label>Otra razón, con sus palabras (opcional)<textarea name="palabras" rows="3" maxlength="600">${esc(c.palabras)}</textarea></label>
    ${botonDictar('palabras')}<button class="principal">Continuar</button></form>`);
  const pl = plantillaHecho(c), tutela = esTutela(c), d = tutela && de(DERECHOS, c.derecho), m = c.tipo === 'servicios_publicos' && de(MOTIVOS_SP, c.motivo);
  pantalla('¿Qué pasó?', `<form data-form="hechos" class="form">
    ${pl ? `<p class="plantilla">${esc(pl).replace(/\{(\w+)\}/g, (_, k) => `<b>${HUECOS[k] || esc(valor(c, k))}</b>`)}</p>` : ''}
    ${d?.pregunta ? `<label>${esc(d.pregunta)}<input name="detalle" ${c.tipo === 'tutela' ? 'required' : ''} maxlength="200" value="${esc(c.detalle)}" placeholder="${esc(d.ejemplo)}" autocomplete="off"></label>` : ''}
    ${pl || tutela ? `<label>¿Desde cuándo?<select name="desde">${DESDE.map(x => `<option ${x === c.desde ? 'selected' : ''}>${x}</option>`).join('')}</select></label>` : ''}
    <label>${pl ? 'Si quiere, agregue algo con sus palabras (opcional)' : 'Cuente qué pasó, con sus palabras'}
      <textarea name="palabras" rows="4" maxlength="600" ${pl ? '' : 'required'}>${esc(c.palabras)}</textarea></label>
    ${botonDictar('palabras')}
    ${m?.nota ? `<p class="nota">${m.nota}</p>` : ''}
    <p class="nota">${c.tipo === 'tutela_salud' ? 'Lo que escriba sobre su salud solo va en el documento: no se guarda en el celular.' : 'No escriba nombres de otras personas ni nada que lo ponga en riesgo. Esto solo queda en este celular mientras arma el documento.'}</p>
    <button class="principal">Continuar</button></form>`);
}
formularios.hechos = (v, fd) => {
  for (const k of ['desde', 'detalle', 'palabras']) if (k in v) caso[k] = v[k].trim();
  if (caso.tipo === 'recurso_servicios') caso.razones = fd.getAll('razon').map(i => RAZONES_RECURSO[i]);
  if (!hechosListos(caso)) return aviso('Escoja o escriba al menos una razón');
  caso.revisar = false;
  siguiente();
};

function pasoPeticiones() {
  const m = caso.tipo === 'servicios_publicos' && de(MOTIVOS_SP, caso.motivo);
  const base = m ? m.peticiones : [tema(caso.temaId).peticion].filter(Boolean);
  caso.opciones = [...base.map(texto => ({ texto, tipo: 'general' })), ...(m ? [] : PETICIONES_EXTRA)];
  pantalla('¿Qué quiere que hagan?', `<form data-form="peticiones" class="form">
    ${checks('pet', caso.opciones.map(p => p.texto), base.length)}
    <label>${caso.opciones.length ? 'Otra cosa (opcional)' : 'Escriba qué quiere que hagan'}<input name="otra" maxlength="200" ${caso.opciones.length ? '' : 'required'}></label>
    <button class="principal">Continuar</button></form>`);
}
formularios.peticiones = ({ otra }, fd) => {
  caso.peticiones = fd.getAll('pet').map(i => caso.opciones[i]);
  if (otra.trim()) caso.peticiones.push({ texto: otra.trim(), tipo: 'general' });
  if (!caso.peticiones.length) return aviso('Escoja al menos una');
  siguiente();
};
// ponytail: con peticiones de tipos mezclados se usa el plazo general de 15 días; separar por petición si el abogado lo pide
function plazoDe(c) {
  if (c.tipo !== 'peticion') return TIPOS[c.tipo].plazo;
  const tipos = [...new Set(c.peticiones.map(p => p.tipo))];
  return tipos.length === 1 ? PLAZOS[tipos[0]] : PLAZOS.general;
}

function pasoEntrega() {
  const l = lo(caso);
  pantalla(`¿Cómo quiere entregar${l}?`, '', [
    { txt: `Envíen${l} por mí`, sub: caso.correo ? 'Se envía al correo de la entidad, sin viajar. Necesita su nombre y cédula, que se borran al enviar.' : 'No disponible: falta el correo de la entidad', icono: '📨', accion: 'entrega', val: 'envio', off: !caso.correo },
    { txt: `${l === 'la' ? 'La' : 'Lo'} entrego yo`, sub: 'Sale con espacios en blanco para llenar a mano y firmar. No pedimos ningún dato.', icono: '✍️', accion: 'entrega', val: 'mano' },
  ]);
}
acciones.entrega = v => { caso.modo = v; siguiente(); };
const pasoDatos = () => pantalla('Datos para enviar el documento', `<form data-form="datos" class="form">
    <label>Nombre completo<input name="nombre" required autocomplete="off"></label>
    <label>Número de cédula<input name="cedula" required inputmode="numeric" pattern="[0-9.]{5,15}" autocomplete="off"></label>
    <label>Celular para recordatorios por SMS (opcional)<input name="telefono" inputmode="tel" autocomplete="off" placeholder="3001234567"></label>
    <label class="check"><input type="checkbox" name="recordar"> Autorizo que me envíen por SMS, a ese celular, los recordatorios del plazo. Solo llevan el código del caso y la fecha.</label>
    <label class="check"><input type="checkbox" required> Autorizo a ${NOMBRE} a enviar este documento en mi nombre y a recibir la respuesta para reenviármela.</label>
    <p class="nota">Estos datos solo están en este celular mientras se envía. Al enviar, se borran.</p>
    <button class="principal">Ver el documento</button></form>`);
formularios.datos = ({ nombre, cedula, telefono, recordar }) => { Object.assign(caso, { nombre: nombre.trim(), cedula: cedula.trim(), telefono: telefono.trim(), recordar: !!recordar }); siguiente(); };

function pasoVista() {
  caso.codigo ||= nuevoCodigo();
  caso.plazo = plazoDe(caso);
  docActual = generarDocumento(caso.tipo, caso, hoy());
  if (esTutela(caso)) return pantalla('Su tutela', `<p class="nota">${EXPLICA.presentarTutela}${caso.urgente === 'si' ? ' ' + EXPLICA.urgente : ''}</p>${docActual}`, [
    { txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
    { txt: 'Anotar cuándo la presenté', sub: 'Le avisamos cuándo debe decidir el juez', icono: '📅', accion: 'pasoEntregada' },
    { txt: 'Cambiar algo', icono: '✏️', accion: 'cambiar' }]);
  pantalla('Su documento', `<p class="nota">Revíselo. Toque 🔊 arriba para escucharlo completo.</p>${docActual}`, caso.modo === 'envio'
    ? [{ txt: `Enviar ${TIPOS[caso.tipo].corto}`, icono: '📨', accion: 'enviar', clase: 'principal' },
       { txt: 'Guardar una copia en PDF', icono: '🖨️', accion: 'imprimir' },
       { txt: 'Cambiar algo', icono: '✏️', accion: 'cambiar' }]
    : [{ txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
       { txt: `Anotar cuándo ${lo(caso)} entregué`, icono: '📅', accion: 'pasoEntregada' },
       { txt: 'Cambiar algo', icono: '✏️', accion: 'cambiar' }]);
}
acciones.cambiar = () => {
  caso.revisar = true;
  if (!esTutela(caso)) caso.peticiones = caso.modo = caso.nombre = null;
  siguiente();
};
acciones.imprimir = () => { $('#imprimir').innerHTML = docActual; window.print(); };

// Guarda solo lo necesario para el seguimiento: sin nombre, cédula, vereda, hechos ni datos de salud.
function guardarCaso(estado, rad) {
  const t = caso.tipo;
  const c = { codigo: caso.codigo ||= nuevoCodigo(), tipo: t, temaId: caso.temaId, servicio: caso.servicio, motivo: caso.motivo, derecho: caso.derecho,
    entidad: caso.entidad, correo: caso.correo, municipio: caso.municipio, modo: caso.modo, plazo: caso.plazo || TIPOS[t].plazo,
    peticiones: t === 'peticion' || t === 'servicios_publicos' ? caso.peticiones?.map(p => p.texto) : undefined,   // en tutelas pueden traer datos de salud
    limite: caso.limite, sms: !!(caso.telefono && caso.recordar), estado };
  const tel = c.sms && caso.telefono;
  if (rad) fijarPlazo(c, rad);
  casos = casos.filter(x => x.codigo !== c.codigo);   // el recurso reemplaza al reclamo del que viene
  casos.push(c);
  caso = null;   // aquí se descarta el borrador con los datos personales
  guardar();
  if (tel && rad) programar(c, tel);
  return c;
}
// El número va al servidor (cifrado allá) y no se guarda en el celular: aquí solo queda el token para cancelar.
// ponytail: si el caso quedó en cola sin internet, no se programan recordatorios (el número ya se borró).
const fechasRecordatorio = c => [sumarHabiles(deIso(c.rad), c.plazo - 3), deIso(c.venc), sumarHabiles(deIso(c.rad), c.plazo + 1)];
async function programar(c, telefono) {
  const fechas = fechasRecordatorio(c).map(iso).filter(f => f > iso(hoy()));
  const r = await programarRecordatorios({ codigo: c.codigo, telefono, canal: 'sms', fechas });
  if (r.ok) { c.token = r.token; await guardar(); }
  else { c.sms = false; document.getElementById('nota-sms')?.remove(); }
  aviso(r.ok ? (r.simulado ? 'Recordatorios por SMS listos (modo de prueba: no se envían)' : 'Recordatorios por SMS programados') : `No se pudieron programar los SMS: ${r.error}`);
}
const cancelarSms = c => c?.token && cancelarRecordatorios(c.codigo, c.token);
const fijarPlazo = (c, rad, n = c.plazo) => { c.rad = iso(rad); c.venc = iso(sumarHabiles(rad, n)); delete c.limite; };

function resumenPlazo(c) {
  const venc = deIso(c.venc), tutela = esTutela(c);
  const recordatorios = fechasRecordatorio(c);
  return `<div class="plazo"><p>${tutela ? 'El juez debe decidir' : `La ${esServicio(c) ? 'empresa' : 'entidad'} debe responder`} a más tardar el</p><p class="fecha">${fechaLarga(venc)}</p><p class="nota">${c.plazo} días hábiles: sin contar sábados, domingos ni festivos.</p></div>
    ${esServicio(c) ? `<p>${EXPLICA.silencioCorto}</p>` : ''}
    <p>Le recordaremos el ${recordatorios.map(fechaCorta).join(', el ')}. Ese último día le preguntamos ${tutela ? 'qué decidió el juez' : 'si le respondieron'}.</p>
    ${c.sms ? `<p class="nota" id="nota-sms">Esos recordatorios también le llegan por SMS al celular que nos dio, por ejemplo: "Caso ${c.codigo} vence el ${fechaSms(venc)}".</p>` : ''}`;
}

acciones.enviar = () => {
  const sinRed = !navigator.onLine, T = TIPOS[caso.tipo];
  // ponytail: en producción el correo sale de un servidor; si no hay red, el borrador con nombre y cédula espera cifrado hasta enviarse
  const c = guardarCaso(sinRed ? 'en_cola' : 'abierto', sinRed ? null : hoy());
  pantalla(sinRed ? 'Quedó en cola para enviar' : `${T.titulo}: enviado`, `
    ${sinRed ? '<p>No hay internet. Queda en cola y se envía apenas haya señal. El plazo empieza a contar ese día.</p>' : ''}
    <div class="simulado"><b>Simulado en el prototipo.</b> Se enviaría así:<br>Para: ${esc(c.correo)}<br>Asunto: ${T.titulo} ${c.codigo}<br>Adjunto: ${c.tipo}-${c.codigo}.pdf</div>
    ${sinRed ? '' : resumenPlazo(c)}
    <p class="nota">Su nombre y su cédula ya se borraron de este celular.</p>`,
  [{ txt: 'Ver mis casos', icono: '⏰', accion: 'casos' }, { txt: 'Volver al inicio', accion: 'inicio' }], 'exito');
};

acciones.pasoEntregada = () => {
  const c = caso || buscar(sel), l = lo(c);
  pedirFecha(esTutela(c) ? '¿Cuándo la presentó?' : `¿Cuándo ${l} entregó?`,
    esTutela(c) ? 'Guarde la constancia de recibido o el número del proceso: es su prueba.' : 'Guarde el sello de recibido o el número de radicado: es su prueba.',
    entregada,
    caso ? [{ txt: esTutela(c) ? 'Todavía no la he presentado' : `Todavía no ${l} he entregado`, sub: 'Le recordamos el caso, pero el documento no se guarda', icono: '⏳', accion: 'porEntregar' }] : []);
};
async function entregada(rad) {
  let c;
  if (caso) c = guardarCaso(esTutela(caso) ? 'presentada' : 'abierto', rad);
  else { c = buscar(sel); c.estado = esTutela(c) ? 'presentada' : 'abierto'; fijarPlazo(c, rad); await guardar(); }
  pantalla('Listo, quedó anotado', resumenPlazo(c), [{ txt: 'Ver mis casos', icono: '⏰', accion: 'casos' }, { txt: 'Volver al inicio', accion: 'inicio' }]);
}
acciones.porEntregar = () => {
  guardarCaso('por_entregar', null);
  pantalla('Quedó en Mis casos', '<p><b>Guarde o imprima el documento ahora: no lo guardamos.</b> Cuando lo entregue, anote la fecha en Mis casos.</p>', [
    { txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
    { txt: 'Ver mis casos', icono: '⏰', accion: 'casos' },
  ]);
};

// ---------- mis casos y seguimiento ----------
// [texto del estado, botón, acción del botón]
function estadoCaso(c, h) {
  const venc = c.venc && deIso(c.venc), vencido = venc && venc < h, faltan = venc && habilesEntre(h, venc);
  switch (c.estado) {
    case 'en_cola': return ['En cola: se envía cuando haya internet'];
    case 'por_entregar': return esTutela(c) ? ['Falta presentarla', 'Ya la presenté', 'yaEntregue']
      : [c.limite ? (deIso(c.limite) < h ? `Se venció el plazo para entregar${lo(c)} (${fechaCorta(deIso(c.limite))})` : `Urgente: entrégue${lo(c)} a más tardar el ${fechaLarga(deIso(c.limite))}`) : `Falta entregar${lo(c)}`,
        `Ya ${lo(c)} entregué`, 'yaEntregue'];
    // [validar] en segunda instancia los 20 días cuentan desde que el juez recibe el expediente: la fecha es aproximada
    case 'presentada': case 'impugnada': return [vencido ? `El juez debía decidir hacia el ${fechaCorta(venc)}` : `El juez decide hacia el ${fechaCorta(venc)}`, '¿Qué decidió el juez?', 'fallo'];
    case 'negada': return [vencido ? `Se venció el plazo para impugnar (${fechaCorta(venc)})` : `Urgente: impugne a más tardar el ${fechaLarga(venc)}`, 'Preparar la impugnación', 'impugnar'];
    case 'por_recurrir': return [vencido ? `Se venció el plazo del recurso (${fechaCorta(venc)})` : `Urgente: presente el recurso a más tardar el ${fechaLarga(venc)}`, 'Preparar el recurso', 'recurso'];
    case 'ganada': return ['El juez le dio la razón', '¿Cumplieron? Vea qué sigue', 'cumplio'];
    case 'desacato': return [`Pidió el desacato el ${fechaCorta(deIso(c.rad))}`, '¿Cumplieron? Vea qué sigue', 'cumplio'];
    default: return [vencido ? `Plazo vencido el ${fechaCorta(venc)}` : faltan ? `Faltan ${faltan} días hábiles (vence el ${fechaCorta(venc)})` : 'Hoy vence el plazo',
      vencido ? '¿Le respondieron? Vea qué sigue' : 'Ya me respondieron', 'respuesta'];
  }
}
acciones.casos = () => {
  olvidar();
  const h = hoy();
  const items = casos.map(c => {
    const t = c.tipo === 'peticion' ? tema(c.temaId) : TIPOS[c.tipo], [estado, boton, accion] = estadoCaso(c, h), atencion = necesitaAtencion(c, h);
    return `<li class="caso ${atencion ? 'vencido' : ''}"><span class="ico" aria-hidden="true">${t.icono}</span><div>
      <b>${esc(t.titulo)} · ${esc(c.entidad)}</b><small>Código ${c.codigo}</small><span>${estado}</span>
      ${boton ? `<button class="${atencion ? 'principal' : 'secundario'}" data-accion="${accion}" data-val="${c.codigo}">${boton}</button>` : ''}</div></li>`;
  }).join('');
  pantalla('Mis casos', (items ? `<ul class="casos">${items}</ul>` : '<p>Todavía no tiene casos guardados.</p>') +
    `<div class="demo"><b>Modo demo</b> (para la presentación): adelantar el calendario
      <div><button data-accion="demo" data-val="7">+7 días</button><button data-accion="demo" data-val="30">+30 días</button><button data-accion="demo" data-val="0">Volver a hoy</button></div>
      ${diasDemo ? `<p>Calendario adelantado ${diasDemo} días: hoy es ${fechaLarga(h)}.</p>` : ''}</div>`,
    [{ txt: 'Volver al inicio', accion: 'inicio' }]);
};
acciones.demo = v => { diasDemo = v === '0' ? 0 : diasDemo + Number(v); acciones.casos(); };
acciones.yaEntregue = c => { sel = c; acciones.pasoEntregada(); };

acciones.respuesta = cod => {
  sel = cod;
  const c = buscar(cod), vencido = deIso(c.venc) < hoy();
  const ultima = vencido
    ? { txt: 'No me han respondido nada', icono: '🔕', accion: esServicio(c) ? 'silencio' : 'sinRespuesta', clase: 'sugerida' }
    : { txt: 'Todavía no', icono: '⏳', accion: 'casos' };
  pantalla(`¿Le llegó respuesta de ${c.entidad}?`,
    vencido ? '<p>El plazo ya venció. Cuéntenos qué pasó y le decimos qué sigue.</p>' : `<p>Todavía están en plazo hasta el ${fechaLarga(deIso(c.venc))}.</p>`, esServicio(c) ? [
    { txt: 'Sí, y me dieron la razón', icono: '🎉', accion: 'cerrar' },
    { txt: 'Sí, pero me lo negaron', sub: c.tipo === 'recurso_servicios' ? 'Su apelación pasa a la Superservicios' : de(MOTIVOS_SP, c.motivo)?.recurso ? `Tiene ${TIPOS.recurso_servicios.presentar} días hábiles para presentar un recurso` : '', icono: '✋', accion: 'spNegado' },
    ultima,
  ] : [
    { txt: 'Sí, y resolvió lo que pedí', icono: '🎉', accion: 'cerrar' },
    { txt: 'Sí, pero no contesta lo que pedí', sub: 'Respuesta incompleta o "está en estudio"', icono: '😕', accion: 'sinRespuesta' },
    { txt: 'Sí, me dijeron que no, con razones', icono: '✋', accion: 'negada' },
    ultima,
  ], vencido ? 'alerta' : 'reposo');
};
acciones.cerrar = async () => {
  cancelarSms(buscar(sel));
  casos = casos.filter(c => c.codigo !== sel);
  await guardar();
  pantalla('Caso cerrado', '<p>Lo borramos de este celular. Si vuelve a necesitar algo, aquí estamos.</p>', [{ txt: 'Volver al inicio', accion: 'inicio' }], 'exito');
};
acciones.negada = () => pantalla('La entidad sí cumplió con responder',
  '<p>Si le respondieron de fondo, aunque la respuesta sea un no, la entidad cumplió con el derecho de petición. En ese caso la tutela por falta de respuesta no es el camino.</p><p>Si no está de acuerdo con la decisión, puede presentar recursos contra ella. Pida orientación gratis en un consultorio jurídico o en la Personería.</p>',
  [{ txt: 'Cerrar y borrar el caso', accion: 'cerrar' }, { txt: 'Volver a mis casos', accion: 'casos' }]);
acciones.sinRespuesta = () => {
  if (buscar(sel).modo === 'envio') return siguientesPasos();
  pantalla('¿Tiene la prueba de entrega?', '<p>El sello de recibido, una foto, el número de radicado o el correo con que la envió.</p>', [
    { txt: 'Sí, la tengo', icono: '✅', accion: 'conPrueba' },
    { txt: 'No la tengo', icono: '❌', accion: 'sinPrueba' },
  ]);
};
acciones.conPrueba = () => siguientesPasos();
acciones.sinPrueba = () => pantalla('Primero, consiga la prueba',
  '<p>Pida en la ventanilla de la entidad una copia con el sello o el número de radicado. Si no la encuentran, puede presentar la petición de nuevo, esta vez guardando la constancia.</p>',
  [{ txt: 'Hacer la petición de nuevo', accion: 'nuevo' }, { txt: 'Volver a mis casos', accion: 'casos' }]);

function siguientesPasos() {
  const c = buscar(sel);
  pantalla('Qué puede hacer ahora', `<p>${c.modo === 'envio' ? 'Su prueba de entrega es el correo que enviamos. ' : ''}Tiene caminos gratuitos y puede usarlos al tiempo:</p>`, [
    { txt: 'Preparar una tutela', sub: 'Obliga a la entidad a responder. Sin abogado. El juez decide en 10 días.', icono: '⚖️', accion: 'tutela', clase: 'principal' },
    { txt: 'Pedir ayuda a la Personería', sub: 'Le exigen a la entidad que responda', icono: '🏛️', accion: 'personeria' },
    { txt: 'Hablar con un consultorio jurídico', sub: 'Orientación gratuita de una universidad', icono: '🎓', accion: 'consultorio' },
  ]);
}
acciones.personeria = () => {
  const c = buscar(sel);
  pantalla(`Personería de ${c.municipio}`,
    `<p>Vaya o escriba a la Personería de ${esc(c.municipio)} con una copia de su petición y la prueba de entrega. Pida que hagan <b>vigilancia</b> a su derecho de petición: ellos le exigen a la entidad que responda, y la entidad tiene 5 días hábiles para contestarles.</p><p>Si la entidad sigue sin responder, la Personería también puede ayudarle a presentar la tutela.</p>`,
    [{ txt: 'Preparar la tutela de una vez', icono: '⚖️', accion: 'tutela' }, { txt: 'Volver a mis casos', accion: 'casos' }]);
};
acciones.consultorio = () => pantalla('Consultorios jurídicos',
  '<p>Las universidades con facultad de derecho tienen consultorios jurídicos gratuitos. Si en su municipio no hay, pueden atenderle de forma virtual. Lleve los papeles de su caso y la prueba de entrega.</p>',
  [{ txt: 'Volver a mis casos', accion: 'casos' }]);

acciones.tutela = () => {
  docActual = generarDocumento('tutela_peticion', buscar(sel), hoy());
  pantalla('Su tutela', `<p class="nota">Llene a mano sus datos, fírmela y llévela al juzgado de su municipio, o pídale a la Personería que la presente por usted. No necesita abogado. Lleve copia de la petición y la prueba de entrega.</p>${docActual}`, [
    { txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
    { txt: 'Anotar cuándo la presenté', sub: 'Le avisamos cuándo debe decidir el juez', icono: '📅', accion: 'anotarTutela' },
    { txt: 'Volver a mis casos', accion: 'casos' },
  ]);
};
// La petición no respondida pasa a ser una tutela en seguimiento, con el mismo código.
acciones.anotarTutela = () => pedirFecha('¿Cuándo presentó la tutela?', 'Guarde la constancia de recibido o el número del proceso: es su prueba.', rad => {
  Object.assign(buscar(sel), { tipo: 'tutela_peticion', derecho: 'peticion', plazo: TIPOS.tutela_peticion.plazo });
  entregada(rad);
});

// ---------- seguimiento de la tutela: fallo, impugnación y desacato ----------
acciones.fallo = cod => {
  sel = cod;
  pantalla('¿Qué decidió el juez?', '<p>El juzgado le avisa la decisión (la notifica) por correo, por teléfono o en persona.</p>', [
    { txt: 'A mi favor', sub: 'El juez me dio la razón (concedió la tutela)', icono: '🎉', accion: 'falloSi' },
    { txt: 'En contra', sub: 'El juez me negó la tutela', icono: '✋', accion: 'falloNo' },
    { txt: 'Todavía no me han avisado', icono: '⏳', accion: 'casos' },
  ]);
};
acciones.falloSi = () => pedirFecha('¿Qué día le notificaron el fallo?', null, async f => {
  const c = buscar(sel);
  Object.assign(c, { estado: 'ganada', rad: iso(f) });
  delete c.venc;
  await guardar();
  pantalla('El juez le dio la razón', llenar(EXPLICA.ganada, { entidad: esc(c.entidad) }), [
    { txt: 'Ya cumplieron', icono: '🎉', accion: 'cerrar' },
    { txt: 'No han cumplido: pedir el desacato', icono: '🔔', accion: 'desacato' },
    { txt: 'Volver a mis casos', accion: 'casos' },
  ], 'exito');
});
acciones.falloNo = () => {
  if (buscar(sel).estado === 'impugnada') return pantalla('El juez de segunda instancia también la negó', EXPLICA.negadaDosVeces,
    [{ txt: 'Hablar con un consultorio jurídico', icono: '🎓', accion: 'consultorio' }, { txt: 'Cerrar y borrar el caso', accion: 'cerrar' }]);
  pedirFecha('¿Qué día le notificaron el fallo?', `Desde ese día tiene solo ${TIPOS.impugnacion.presentar} días hábiles para impugnar.`, async f => {
    const c = buscar(sel);
    c.estado = 'negada';
    fijarPlazo(c, f, TIPOS.impugnacion.presentar);
    await guardar();
    plazoUrgente(c);
  });
};
// Plazos cortos (impugnación y recurso): se avisan desde el primer momento, no solo en el recordatorio.
function plazoUrgente(c) {
  const imp = c.estado === 'negada', doc = imp ? 'la impugnación' : 'el recurso';
  pantalla(`Tiene muy poco tiempo para ${imp ? 'impugnar' : 'el recurso'}`,
    `<div class="plazo urgente"><p>Presente ${doc} a más tardar el</p><p class="fecha">${fechaLarga(deIso(c.venc))}</p><p class="nota">${imp ? TIPOS.impugnacion.presentar : TIPOS.recurso_servicios.presentar} días hábiles. No espere al último día.</p></div>${imp ? EXPLICA.impugnar : EXPLICA.recurso}`,
    [{ txt: `Preparar ${doc} ahora`, icono: '✍️', accion: imp ? 'impugnar' : 'recurso', val: c.codigo, clase: 'principal' },
     { txt: 'Volver a mis casos', accion: 'casos' }], 'alerta');
}
acciones.impugnar = cod => {
  sel = cod;
  if (deIso(buscar(sel).venc) < hoy()) return pantalla('Se venció el plazo para impugnar', EXPLICA.impugnacionVencida,
    [{ txt: 'Hablar con un consultorio jurídico', icono: '🎓', accion: 'consultorio' }, { txt: 'Cerrar y borrar el caso', accion: 'cerrar' }]);
  pantalla('¿Por qué no está de acuerdo con el fallo?', `<form data-form="impugnacion" class="form">
    <p class="nota">Marque las que apliquen. Si no sabe, igual puede impugnar.</p>
    ${checks('razon', RAZONES_IMPUGNACION)}
    <label>Otra razón, con sus palabras (opcional)<textarea name="palabras" rows="3" maxlength="600"></textarea></label>
    ${botonDictar('palabras')}<button class="principal">Ver la impugnación</button></form>`);
};
formularios.impugnacion = ({ palabras }, fd) => {
  docActual = generarDocumento('impugnacion', { ...buscar(sel), razones: fd.getAll('razon').map(i => RAZONES_IMPUGNACION[i]), palabras: palabras.trim() }, hoy());
  pantalla('Su impugnación', `<p class="nota">${EXPLICA.presentarImpugnacion}</p>${docActual}`, [
    { txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
    { txt: 'Anotar cuándo la presenté', icono: '📅', accion: 'anotar', val: 'impugnada' },
    { txt: 'Volver a mis casos', accion: 'casos' },
  ]);
};
acciones.cumplio = cod => {
  sel = cod;
  const c = buscar(cod);
  pantalla(`¿Ya cumplió ${c.entidad} lo que ordenó el juez?`, '', [
    { txt: 'Sí, ya cumplió', icono: '🎉', accion: 'cerrar' },
    { txt: 'No ha cumplido', icono: '🔔', accion: c.estado === 'desacato' ? 'desacatoYa' : 'desacato', clase: 'sugerida' },
    { txt: 'Volver a mis casos', accion: 'casos' },
  ]);
};
acciones.desacato = () => pantalla('¿Qué le ordenó el juez?', `<form data-form="desacato" class="form">
    <p class="nota">${EXPLICA.desacato}</p>
    <label>Lo que ordenó el juez (opcional)<textarea name="orden" rows="3" maxlength="400" placeholder="Ej.: entregar el medicamento en 48 horas"></textarea></label>
    ${botonDictar('orden')}<button class="principal">Ver la solicitud</button></form>`);
formularios.desacato = ({ orden }) => {
  docActual = generarDocumento('desacato', { ...buscar(sel), orden: orden.trim() }, hoy());
  pantalla('Su solicitud de desacato', `<p class="nota">${EXPLICA.presentarDesacato}</p>${docActual}`, [
    { txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
    { txt: 'Anotar cuándo lo pedí', icono: '📅', accion: 'anotar', val: 'desacato' },
    { txt: 'Volver a mis casos', accion: 'casos' },
  ]);
};
acciones.desacatoYa = () => pantalla('Ya pidió el desacato', EXPLICA.desacatoYa,
  [{ txt: 'Cerrar y borrar el caso', accion: 'cerrar' }, { txt: 'Volver a mis casos', accion: 'casos' }]);
acciones.anotar = estado => pedirFecha(estado === 'impugnada' ? '¿Cuándo presentó la impugnación?' : '¿Cuándo pidió el desacato?', 'Guarde la constancia de recibido: es su prueba.', async f => {
  const c = buscar(sel);
  c.estado = estado;
  if (estado === 'impugnada') { c.plazo = TIPOS.impugnacion.plazo; fijarPlazo(c, f); } else { c.rad = iso(f); delete c.venc; }
  await guardar();
  pantalla('Listo, quedó anotado', estado === 'impugnada' ? resumenPlazo(c) : EXPLICA.desacatoAnotado,
    [{ txt: 'Ver mis casos', icono: '⏰', accion: 'casos' }, { txt: 'Volver al inicio', accion: 'inicio' }]);
});

// ---------- seguimiento de servicios públicos: silencio positivo y recurso ----------
acciones.silencio = () => pantalla('La ley entiende que la empresa le dio la razón', llenar(EXPLICA.silencio, { entidad: esc(buscar(sel).entidad) }), [
  { txt: 'Ya lo reconocieron: cerrar el caso', icono: '🎉', accion: 'cerrar' },
  { txt: 'Volver a mis casos', accion: 'casos' },
], 'exito');
acciones.spNegado = () => {
  const cerrarOVolver = [{ txt: 'Cerrar y borrar el caso', accion: 'cerrar' }, { txt: 'Volver a mis casos', accion: 'casos' }];
  if (buscar(sel).tipo === 'recurso_servicios') return pantalla('Su apelación pasa a la Superservicios', EXPLICA.apelacion, cerrarOVolver);
  if (!de(MOTIVOS_SP, buscar(sel).motivo)?.recurso) return pantalla('Para este reclamo no hay recurso ante la empresa', EXPLICA.sinRecurso, cerrarOVolver);
  pedirFecha('¿Qué día le notificaron la respuesta?', `Desde ese día tiene solo ${TIPOS.recurso_servicios.presentar} días hábiles para presentar el recurso.`, async f => {
    const c = buscar(sel);
    c.estado = 'por_recurrir';
    fijarPlazo(c, f, TIPOS.recurso_servicios.presentar);
    await guardar();
    plazoUrgente(c);
  });
};
// El recurso se arma como un caso nuevo (mismo código) que reemplaza al reclamo al guardarse.
acciones.recurso = cod => {
  sel = cod;
  const c = buscar(cod);
  if (deIso(c.venc) < hoy()) return pantalla('Se venció el plazo del recurso', EXPLICA.recursoVencido,
    [{ txt: 'Cerrar y borrar el caso', accion: 'cerrar' }, { txt: 'Volver a mis casos', accion: 'casos' }]);
  caso = { tipo: 'recurso_servicios', para: 'mi', acepto: 'si', sinRiesgo: 'si', codigo: c.codigo, municipio: c.municipio,
    entidad: c.entidad, correo: c.correo, servicio: c.servicio, notif: c.rad, limite: c.venc };
  siguiente();
};

// ---------- ruta carta venta ----------
const AVISO_ANT = '<p class="nota">Nadie puede cobrarle por tramitar su formalización ante la Agencia Nacional de Tierras. Si le piden plata, es una estafa.</p>';
acciones.carta = () => pantalla('¿Qué papel tiene del predio?', AVISO_ANT, [
  { txt: 'Carta venta o papel privado', icono: '📃', accion: 'carta2' },
  { txt: 'Promesa de compraventa', icono: '🤝', accion: 'carta2' },
  { txt: 'Escritura sin registrar', icono: '📜', accion: 'cartaFin', val: 'sinregistro' },
  { txt: 'Escritura registrada', icono: '✅', accion: 'cartaFin', val: 'registrada' },
  { txt: 'No tengo nada escrito', icono: '🤷', accion: 'carta2' },
]);
acciones.carta2 = () => pantalla('¿El predio tiene certificado de tradición y libertad?', '<p>Es el documento de la Oficina de Registro que muestra la historia del predio (folio de matrícula).</p>', [
  { txt: 'Sí, tiene folio', icono: '📁', accion: 'carta3' },
  { txt: 'No, o no sé', sub: 'Podría ser un baldío de la Nación', icono: '❓', accion: 'cartaFin', val: 'baldio' },
]);
acciones.carta3 = () => pantalla('¿Cuánto tiempo lleva usted o su familia en el predio, sin que nadie lo reclame?', '', [
  { txt: 'Menos de 5 años', icono: '🌱', accion: 'cartaFin', val: 'poco' },
  { txt: '5 años o más', icono: '🌳', accion: 'cartaFin', val: 'posesion' },
]);
acciones.cartaFin = v => {
  const [titulo, texto, ant] = CARTA[v];
  pantalla(titulo, `<p>${texto}</p>${ant ? AVISO_ANT : ''}<p class="nota">¿Problemas de linderos o de paso con un vecino? La conciliación en equidad es gratuita y el acuerdo tiene fuerza legal.</p>`, [
    ...(ant ? [{ txt: 'Pedirle a la ANT que inicie mi formalización', sub: 'Le armamos el derecho de petición', icono: '📄', accion: 'nuevoTierras', clase: 'principal' }] : []),
    { txt: 'Volver al inicio', accion: 'inicio' },
  ]);
};

// ---------- información y borrado ----------
acciones.como = () => pantalla('Cómo funciona', `<ol class="pasos">
    <li><b>Cuente su caso</b> tocando botones o hablando.</li>
    <li><b>Reciba su documento</b>: un derecho de petición, una tutela o un reclamo, listo.</li>
    <li><b>Envíelo sin viajar</b>, o entréguelo usted.</li>
    <li><b>Le avisamos</b> cuándo le deben responder y qué hacer si no lo hacen.</li></ol>
  <p>Pedirle algo a una entidad es un derecho. Es gratis y no necesita abogado.</p>
  <p class="nota">${NOMBRE} da información general y plantillas; no es un abogado. Funciona sin internet, salvo para enviar y dictar. Guarda lo mínimo, protegido con su clave, y puede borrarlo todo cuando quiera. Con el botón "Modo voz" la app le lee todo en voz alta.</p>`,
  [{ txt: 'Volver al inicio', accion: 'inicio' }]);

acciones.borrar = () => pantalla('¿Borrar todo?', '<p>Se borran todos los casos y su clave de este celular. No se puede deshacer.</p>', [
  { txt: 'Sí, borrar todo', icono: '🗑️', accion: 'borrarSi', clase: 'peligro' },
  { txt: 'Cancelar', accion: 'inicio' },
]);
acciones.borrarSi = () => {
  casos.forEach(cancelarSms);
  localStorage.removeItem(KEY);
  clave = null; casos = []; olvidar();
  pantalla('Se borró todo', '<p>Ya no queda ningún caso en este celular. Si usó WhatsApp o SMS para este caso, borre también esos mensajes.</p>', [{ txt: 'Empezar de nuevo', accion: 'pin' }]);
};

// ---------- interfaz para el agente de voz (CONTRATOS.md, sección 1) ----------
// tema según el documento: petición → TEMAS, servicios → SERVICIOS, tutela → DERECHOS del menú, tutela de salud → SALUD_NIEGA.
const TEMA_DE = { peticion: ['temaId', TEMAS], servicios_publicos: ['servicio', SERVICIOS], tutela: ['derecho', DERECHOS.filter(d => d.icono)], tutela_salud: ['que', SALUD_NIEGA] };
function iniciarCaso(datos) {
  datos ??= {};
  const tipo = datos.tipo === 'tutela' && datos.tema === 'salud' ? 'tutela_salud' : datos.tipo || caso?.tipo || 'peticion';
  if (!Object.hasOwn(TEMA_DE, tipo)) return clave ? acciones.casos() : pantallaPin();   // impugnación, desacato y recurso siguen desde Mis casos
  if (caso?.tipo !== tipo) caso = { tipo, derecho: tipo === 'tutela_salud' ? 'salud' : undefined };   // otro documento: caso nuevo
  const [campo, lista] = TEMA_DE[tipo];
  if (lista.some(x => x.id === datos.tema)) caso[campo] = datos.tema;
  const m = MUNICIPIOS.find(x => norm(x.nombre) === norm(datos.municipio)), municipio = m?.nombre || datos.municipio || caso.municipio;
  // El agente de voz manda la entidad como clave (alcaldia, eps, ant). El nombre de la EPS lo escribe la persona.
  const k = norm(datos.entidad), entidad = { alcaldia: municipio ? `Alcaldía de ${municipio}` : '', eps: '', ant: 'Agencia Nacional de Tierras (ANT)' }[k] ?? datos.entidad;
  const correo = datos.correo || (k === 'alcaldia' ? MUNICIPIOS.find(x => x.nombre === municipio)?.correo : undefined);
  const nuevos = { municipio: m?.nombre || datos.municipio, vereda: datos.vereda, entidad, correo, desde: datos.desde,
    palabras: datos.palabras, detalle: datos.detalle,
    peticiones: datos.peticiones && !tipo.startsWith('tutela') ? [].concat(datos.peticiones).map(p => ({ texto: String(p?.texto ?? p).trim(), tipo: 'general' })).filter(p => p.texto) : undefined };
  for (const [k, v] of Object.entries(nuevos)) if (v != null && v !== '' && !(Array.isArray(v) && !v.length)) caso[k] = typeof v === 'string' ? v.trim() : v;
  clave ? siguiente() : pantallaPin();
}
const opcionesVisibles = () => [...main.querySelectorAll('button:not(:disabled), label.check')]
  .map(el => ({ el, texto: (el.querySelector('b') || el).innerText.trim() }));
window.miderecho = {
  iniciarCaso,
  // El documento no se incluye: tiene nombre, cédula o datos de salud que no deben salir del celular.
  pantallaActual() {
    const titulo = main.querySelector('h1').textContent;
    const texto = [...main.querySelector('.cuerpo').children]
      .map(el => el.matches('.doc') ? '[Aquí está el documento. No se comparte con el asistente para proteger sus datos.]' : el.innerText).join('\n');
    return { id: norm(titulo).replace(/ /g, '-'), titulo, texto: texto.replace(/[ \t]+/g, ' ').trim(), opciones: opcionesVisibles().map(o => o.texto) };
  },
  // Solo coincidencia exacta, sin importar mayúsculas, tildes ni espacios: nunca "parecida" (aviso de privacidad, riesgo).
  elegir(texto) {
    const q = norm(texto), o = q && opcionesVisibles().find(o => norm(o.texto) === q);
    o?.el.click();
    return !!o;
  },
  // Amenaza a mitad del caso: descarta el borrador sin guardar nada y muestra la ayuda del protocolo de riesgo.
  riesgo() { olvidar(); acciones.riesgo('si'); },
};

// ---------- sin internet ----------
async function procesarCola() {
  if (!clave || !navigator.onLine) return;
  const cola = casos.filter(c => c.estado === 'en_cola');
  if (!cola.length) return;
  cola.forEach(c => { c.estado = 'abierto'; fijarPlazo(c, hoy()); });
  await guardar();
  if (main.querySelector('h1').innerText === 'Mis casos') acciones.casos();
  aviso(cola.length === 1 ? 'Se envió el documento que estaba en cola (simulado)' : `Se enviaron ${cola.length} documentos que estaban en cola (simulado)`);
}
const pintarRed = () => { $('#estado-red').textContent = navigator.onLine ? 'Con internet' : 'Sin internet: la app sigue funcionando'; };
addEventListener('online', () => { pintarRed(); procesarCola(); });
addEventListener('offline', pintarRed);

// ---------- arranque ----------
pintarVoz();
pintarRed();
window.speechSynthesis?.getVoices();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
pantallaPin();
