import { NOMBRE, VERIFICADO, CORREO_SERVICIO, AVISO, AYUDA_RIESGO, MUNICIPIOS, TEMAS, PETICIONES_EXTRA, PLAZOS, CARTA } from './contenido.js';
import { sumarHabiles, habilesEntre, iso, deIso } from './plazos.js';

const $ = s => document.querySelector(s);
const main = $('#app');
const KEY = 'pc-datos';
const acciones = {}, formularios = {};
let clave = null, salt = null, casos = [];   // casos guardados: cifrados con la clave del usuario
let caso = null;                            // borrador del caso actual: solo en memoria, nunca se guarda
let sel = null;                             // código del caso abierto en "Mis casos"
let docActual = '', textoVoz = '', diasDemo = 0;
let modoVoz = localStorage.getItem('modoVoz') === '1';

// ---------- utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hoy = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diasDemo); };
const fechaLarga = d => d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fechaDoc = d => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
const fechaCorta = d => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaSms = d => `${d.getDate()}-${MESES[d.getMonth()]}`;   // SMS sin tildes (GSM-7)
const nuevoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const tema = id => TEMAS.find(t => t.id === id);
const buscar = cod => casos.find(c => c.codigo === cod);
const linea = '______________________';

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
async function derivar(pin) {
  const base = await crypto.subtle.importKey('raw', cod.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function guardar() {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, clave, cod.encode(JSON.stringify(casos))));
  localStorage.setItem(KEY, JSON.stringify({ salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
}
async function abrir(pin) {
  const s = JSON.parse(localStorage.getItem(KEY));
  salt = deB64(s.salt);
  clave = await derivar(pin);
  casos = JSON.parse(decod.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(s.iv) }, clave, deB64(s.ct))));
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
      clave = await derivar(pin);
      casos = [];
      await guardar();
    } else await abrir(pin);
    procesarCola();
    inicio();
  } catch { aviso('Clave incorrecta'); }
};
acciones.pin = () => pantallaPin();
acciones.bloquear = () => { clave = null; casos = []; caso = null; window.speechSynthesis?.cancel(); pantallaPin(); };

// ---------- inicio ----------
function inicio() {
  caso = null;
  const abiertos = casos.filter(c => c.estado !== 'cerrado');
  const vencidos = abiertos.filter(c => c.venc && deIso(c.venc) < hoy()).length;
  pantalla(NOMBRE, '<p>¿Qué necesita hoy?</p>', [
    { txt: 'Hacer un derecho de petición', sub: 'Pedirle algo a una entidad. Es gratis y no necesita abogado.', icono: '📄', accion: 'nuevo', clase: 'grande principal' },
    { txt: `Mis casos (${abiertos.length})`, sub: vencidos ? `${vencidos} con plazo vencido: revise qué sigue` : 'Plazos y qué sigue', icono: '⏰', accion: 'casos', clase: vencidos ? 'sugerida' : '' },
    { txt: '¿Su carta venta lo hace dueño?', sub: 'Qué vale su papel y cómo formalizar', icono: '🏡', accion: 'carta' },
    { txt: 'Cómo funciona', icono: '❓', accion: 'como' },
  ], vencidos ? 'alerta' : 'reposo');
}
acciones.inicio = () => clave ? inicio() : pantallaPin();

// ---------- nuevo caso ----------
acciones.nuevo = temaId => {
  caso = { peticiones: [], temaId: temaId || null };
  pantalla('¿Para quién es este caso?', '', [
    { txt: 'Para mí', icono: '🙋', accion: 'para', val: 'mi' },
    { txt: 'Para un vecino que está conmigo', sub: 'Usted le ayuda; él o ella decide', icono: '🤝', accion: 'para', val: 'vecino' },
  ]);
};
acciones.nuevoTierras = () => acciones.nuevo('tierras');

acciones.para = v => {
  caso.para = v;
  pantalla('Antes de empezar',
    `${v === 'vecino' ? '<p class="nota">Léale este aviso a su vecino, o toque 🔊 arriba. La decisión es de él o de ella.</p>' : ''}<div class="aviso-priv">${AVISO}</div>`, [
    { txt: 'Sí, acepto', icono: '✅', accion: 'acepta', clase: 'principal' },
    { txt: 'No acepto', icono: '✋', accion: 'noAcepta' },
  ]);
};
acciones.noAcepta = () => {
  caso = null;
  pantalla('Está bien', '<p>No guardamos nada. Si quiere ayuda en persona, la Personería de su municipio atiende gratis.</p>', [{ txt: 'Volver al inicio', accion: 'inicio' }]);
};
acciones.acepta = () => pantalla('Una pregunta importante', '<p>¿Hay alguien en peligro hoy, o le han amenazado por reclamar?</p>', [
  { txt: 'No', icono: '👍', accion: 'riesgo', val: 'no' },
  { txt: 'Sí', icono: '⚠️', accion: 'riesgo', val: 'si', clase: 'peligro' },
  { txt: 'No sé', icono: '🤔', accion: 'riesgo', val: 'nose' },
]);
acciones.riesgo = v => {
  if (v === 'no') return caso.temaId ? pasoMunicipio() : pasoTema();
  if (v === 'si') caso = null;   // con riesgo confirmado no se recoge nada más
  pantalla('Esto es serio. Busque ayuda ahora', AYUDA_RIESGO, v === 'nose'
    ? [{ txt: 'No hay peligro: seguir con la petición', accion: 'riesgo', val: 'no' }, { txt: 'Salir', accion: 'inicio' }]
    : [{ txt: 'Salir', accion: 'inicio' }], 'alerta');
};

function pasoTema() {
  pantalla('¿De qué se trata?', '', TEMAS.map(t => ({ txt: t.titulo, sub: t.ayuda, icono: t.icono, accion: 'tema', val: t.id })));
}
acciones.tema = id => { caso.temaId = id; pasoMunicipio(); };

function pasoMunicipio() {
  pantalla('¿Dónde vive?', `<form data-form="municipio" class="form">
    <label>Municipio<select name="municipio">${MUNICIPIOS.map(m => `<option ${m.nombre === caso.municipio ? 'selected' : ''}>${esc(m.nombre)}</option>`).join('')}<option value="">Otro municipio</option></select></label>
    <input name="otro" placeholder="Si es otro municipio, escríbalo aquí" aria-label="Otro municipio">
    <label>Vereda<input name="vereda" required value="${esc(caso.vereda)}" placeholder="Nombre de su vereda"></label>
    <button class="principal">Continuar</button></form>`);
}
formularios.municipio = ({ municipio, otro, vereda }) => {
  caso.municipio = municipio || otro.trim();
  if (!caso.municipio) return aviso('Escriba su municipio');
  caso.vereda = vereda.trim();
  pasoEntidad();
};

function pasoEntidad() {
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
  if (v === 'alcaldia' && m) { caso.entidad = `Alcaldía de ${caso.municipio}`; caso.correo = m.correo; return pasoHechos(); }
  const nombre = { alcaldia: `Alcaldía de ${caso.municipio}`, ant: 'Agencia Nacional de Tierras (ANT)' }[v] || '';
  pantalla('Datos de la entidad', `<form data-form="entidad" class="form">
    <label>Nombre de la entidad<input name="entidad" required value="${esc(nombre)}" placeholder="${v === 'eps' ? 'Nombre de su EPS' : ''}"></label>
    <label>Correo de la entidad (si lo sabe)<input name="correo" type="email"></label>
    <p class="nota">Sin correo, igual puede entregarla usted mismo.</p>
    <button class="principal">Continuar</button></form>`);
};
formularios.entidad = ({ entidad, correo }) => { caso.entidad = entidad.trim(); caso.correo = correo.trim(); pasoHechos(); };

const DESDE = ['hace una semana', 'hace un mes', 'hace tres meses', 'hace seis meses', 'hace más de un año'];
const llenar = (plantilla, c) => plantilla.replace('{vereda}', c.vereda).replace('{desde}', c.desde);
function pasoHechos() {
  const t = tema(caso.temaId);
  pantalla('¿Qué pasó?', `<form data-form="hechos" class="form">
    ${t.hecho ? `<p class="plantilla">${esc(t.hecho).replace('{vereda}', `<b>${esc(caso.vereda)}</b>`).replace('{desde}', '<b>[desde cuándo]</b>')}</p>
      <label>¿Desde cuándo?<select name="desde">${DESDE.map(d => `<option ${d === caso.desde ? 'selected' : ''}>${d}</option>`).join('')}</select></label>` : ''}
    <label>${t.hecho ? 'Si quiere, agregue algo con sus palabras (opcional)' : 'Cuente qué pasó, con sus palabras'}
      <textarea name="palabras" rows="4" maxlength="600" ${t.hecho ? '' : 'required'}>${esc(caso.palabras)}</textarea></label>
    ${botonDictar('palabras')}
    <p class="nota">No escriba nombres de otras personas ni nada que lo ponga en riesgo. Esto solo queda en este celular mientras arma el documento.</p>
    <button class="principal">Continuar</button></form>`);
}
formularios.hechos = ({ desde, palabras }) => { caso.desde = desde; caso.palabras = palabras.trim(); pasoPeticiones(); };

function pasoPeticiones() {
  const t = tema(caso.temaId);
  caso.opciones = [...(t.peticion ? [{ texto: t.peticion, tipo: 'general' }] : []), ...PETICIONES_EXTRA];
  pantalla('¿Qué quiere que hagan?', `<form data-form="peticiones" class="form">
    ${caso.opciones.map((p, i) => `<label class="check"><input type="checkbox" name="pet" value="${i}" ${i === 0 && t.peticion ? 'checked' : ''}> ${esc(p.texto)}</label>`).join('')}
    <label>Otra cosa (opcional)<input name="otra" maxlength="200"></label>
    <button class="principal">Continuar</button></form>`);
}
formularios.peticiones = ({ otra }, fd) => {
  caso.peticiones = fd.getAll('pet').map(i => caso.opciones[i]);
  if (otra.trim()) caso.peticiones.push({ texto: otra.trim(), tipo: 'general' });
  if (!caso.peticiones.length) return aviso('Escoja al menos una');
  // ponytail: con peticiones de tipos mezclados se usa el plazo general de 15 días; separar por petición si el abogado lo pide
  const tipos = [...new Set(caso.peticiones.map(p => p.tipo))];
  caso.plazo = tipos.length === 1 ? PLAZOS[tipos[0]] : PLAZOS.general;
  pantalla('¿Cómo quiere entregarla?', '', [
    { txt: 'Envíenla por mí', sub: caso.correo ? 'Se envía al correo de la entidad, sin viajar. Necesita su nombre y cédula, que se borran al enviar.' : 'No disponible: falta el correo de la entidad', icono: '📨', accion: 'entrega', val: 'envio', off: !caso.correo },
    { txt: 'La entrego yo', sub: 'Sale con espacios en blanco para llenar a mano y firmar. No pedimos ningún dato.', icono: '✍️', accion: 'entrega', val: 'mano' },
  ]);
};

acciones.entrega = v => {
  caso.modo = v;
  if (v === 'mano') return pasoVista();
  pantalla('Datos para enviar la petición', `<form data-form="datos" class="form">
    <label>Nombre completo<input name="nombre" required autocomplete="off"></label>
    <label>Número de cédula<input name="cedula" required inputmode="numeric" pattern="[0-9.]{5,15}" autocomplete="off"></label>
    <label>Celular para recordatorios por SMS (opcional)<input name="telefono" inputmode="tel" autocomplete="off"></label>
    <label class="check"><input type="checkbox" required> Autorizo a ${NOMBRE} a enviar esta petición en mi nombre y a recibir la respuesta para reenviármela.</label>
    <p class="nota">Estos datos solo están en este celular mientras se envía. Al enviar, se borran.</p>
    <button class="principal">Ver el documento</button></form>`);
};
formularios.datos = ({ nombre, cedula, telefono }) => { Object.assign(caso, { nombre: nombre.trim(), cedula: cedula.trim(), telefono: telefono.trim() }); pasoVista(); };

function docPeticion(c) {
  const t = tema(c.temaId);
  const hechos = [t.hecho && llenar(t.hecho, c), c.palabras].filter(Boolean);
  const respuesta = c.modo === 'envio'
    ? `Vereda ${c.vereda}, ${c.municipio}. Correo: ${CORREO_SERVICIO} (servicio que autoricé para recibir y reenviarme la respuesta).`
    : `Vereda ${c.vereda}, ${c.municipio}. Otra dirección o correo: ${linea}`;
  return `<article class="doc">
    <p>${esc(c.municipio)}, ${fechaDoc(hoy())}</p>
    <p>Señores<br><b>${esc(c.entidad)}</b>${c.correo ? `<br>${esc(c.correo)}` : ''}</p>
    <p><b>Asunto:</b> Derecho de petición sobre ${esc(t.titulo.toLowerCase())}</p>
    <p>Yo, ${esc(c.nombre || linea)}, identificado(a) con cédula de ciudadanía n.º ${esc(c.cedula || linea)}, en ejercicio del derecho de petición (artículo 23 de la Constitución Política y Ley 1755 de 2015), presento la siguiente petición:</p>
    <h3>Hechos</h3><ol>${hechos.map(h => `<li>${esc(h)}</li>`).join('')}</ol>
    <h3>Peticiones</h3><ol>${c.peticiones.map(p => `<li>${esc(p.texto)}</li>`).join('')}</ol>
    <p>La respuesta debe darse dentro de los ${c.plazo} días hábiles siguientes a su recibo (artículo 14 de la Ley 1755 de 2015).</p>
    <p><b>Recibiré respuesta en:</b> ${esc(respuesta)}${c.telefono ? ` Teléfono: ${esc(c.telefono)}.` : ''}</p>
    <p>Atentamente,</p>
    <p class="firma">${c.modo === 'envio' ? `Enviada con autorización del peticionario. Código ${c.codigo}` : linea}<br>${esc(c.nombre || 'Nombre:')}<br>C.C. ${esc(c.cedula || '')}</p>
    <p class="pie">Documento preparado con ${NOMBRE}. ${VERIFICADO}. No es asesoría de abogado.</p>
  </article>`;
}

function pasoVista() {
  caso.codigo ||= nuevoCodigo();
  docActual = docPeticion(caso);
  pantalla('Su documento', `<p class="nota">Revíselo. Toque 🔊 arriba para escucharlo completo.</p>${docActual}`, caso.modo === 'envio'
    ? [{ txt: 'Enviar la petición', icono: '📨', accion: 'enviar', clase: 'principal' },
       { txt: 'Guardar una copia en PDF', icono: '🖨️', accion: 'imprimir' },
       { txt: 'Cambiar algo', icono: '✏️', accion: 'cambiar' }]
    : [{ txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
       { txt: 'Anotar cuándo la entregué', icono: '📅', accion: 'pasoEntregada' },
       { txt: 'Cambiar algo', icono: '✏️', accion: 'cambiar' }]);
}
acciones.cambiar = () => pasoHechos();
acciones.imprimir = () => { $('#imprimir').innerHTML = docActual; window.print(); };

// Guarda solo lo necesario para el seguimiento: sin nombre, cédula, vereda ni hechos.
function guardarCaso(estado, rad) {
  const c = { codigo: caso.codigo, temaId: caso.temaId, entidad: caso.entidad, correo: caso.correo, municipio: caso.municipio,
    modo: caso.modo, plazo: caso.plazo, peticiones: caso.peticiones.map(p => p.texto), sms: !!caso.telefono, estado };
  if (rad) fijarPlazo(c, rad);
  casos.push(c);
  caso = null;   // aquí se descarta el borrador con los datos personales
  guardar();
  return c;
}
const fijarPlazo = (c, rad) => { c.rad = iso(rad); c.venc = iso(sumarHabiles(rad, c.plazo)); };

function resumenPlazo(c) {
  const rad = deIso(c.rad), venc = deIso(c.venc);
  const recordatorios = [sumarHabiles(rad, c.plazo - 3), venc, sumarHabiles(rad, c.plazo + 1)];
  return `<div class="plazo"><p>La entidad debe responder a más tardar el</p><p class="fecha">${fechaLarga(venc)}</p><p class="nota">${c.plazo} días hábiles: sin contar sábados, domingos ni festivos.</p></div>
    <p>Le recordaremos el ${recordatorios.map(fechaCorta).join(', el ')}. Ese último día le preguntamos si le respondieron.</p>
    ${c.sms ? `<div class="simulado"><b>SMS (simulado):</b> Peticion ${c.codigo} vence el ${fechaSms(venc)}. Si no responden, avise a su lider.</div>` : ''}`;
}

acciones.enviar = () => {
  const sinRed = !navigator.onLine;
  // ponytail: en producción el correo sale de un servidor; si no hay red, el borrador con nombre y cédula espera cifrado hasta enviarse
  const c = guardarCaso(sinRed ? 'en_cola' : 'abierto', sinRed ? null : hoy());
  pantalla(sinRed ? 'Quedó lista para enviar' : 'Petición enviada', `
    ${sinRed ? '<p>No hay internet. La petición queda en cola y se envía sola apenas haya señal. El plazo empieza a contar ese día.</p>' : ''}
    <div class="simulado"><b>Simulado en el prototipo.</b> Se enviaría así:<br>Para: ${esc(c.correo)}<br>Asunto: Derecho de petición ${c.codigo}<br>Adjunto: peticion-${c.codigo}.pdf</div>
    ${sinRed ? '' : resumenPlazo(c)}
    <p class="nota">Su nombre y su cédula ya se borraron de este celular.</p>`,
  [{ txt: 'Ver mis casos', icono: '⏰', accion: 'casos' }, { txt: 'Volver al inicio', accion: 'inicio' }], 'exito');
};

acciones.pasoEntregada = () => pantalla('¿Cuándo la entregó?', `<p class="nota">Guarde el sello de recibido o el número de radicado: es su prueba.</p>
  <form data-form="entregada" class="form"><input type="date" name="fecha" max="${iso(hoy())}" value="${iso(hoy())}" aria-label="Fecha de entrega" required><button class="principal">Guardar la fecha</button></form>`,
  caso ? [{ txt: 'Todavía no la he entregado', sub: 'La guardamos y la anota después', icono: '⏳', accion: 'porEntregar' }] : []);
formularios.entregada = async ({ fecha }) => {
  const rad = deIso(fecha);
  let c;
  if (caso) c = guardarCaso('abierto', rad);
  else { c = buscar(sel); c.estado = 'abierto'; fijarPlazo(c, rad); await guardar(); }
  pantalla('Listo, quedó anotado', resumenPlazo(c), [{ txt: 'Ver mis casos', icono: '⏰', accion: 'casos' }, { txt: 'Volver al inicio', accion: 'inicio' }]);
};
acciones.porEntregar = () => { guardarCaso('por_entregar', null); aviso('Guardada. Cuando la entregue, anótelo en Mis casos.'); acciones.casos(); };

// ---------- mis casos y seguimiento ----------
acciones.casos = () => {
  caso = null;
  const h = hoy();
  const items = casos.map(c => {
    const t = tema(c.temaId);
    let estado, boton = null;
    if (c.estado === 'en_cola') estado = 'En cola: se envía cuando haya internet';
    else if (c.estado === 'por_entregar') { estado = 'Falta entregarla'; boton = ['Ya la entregué', 'yaEntregue']; }
    else {
      const venc = deIso(c.venc), vencido = venc < h, faltan = habilesEntre(h, venc);
      estado = vencido ? `Plazo vencido el ${fechaCorta(venc)}` : faltan ? `Faltan ${faltan} días hábiles (vence el ${fechaCorta(venc)})` : 'Hoy vence el plazo';
      boton = vencido ? ['¿Le respondieron? Vea qué sigue', 'respuesta'] : ['Ya me respondieron', 'respuesta'];
    }
    const vencido = c.venc && deIso(c.venc) < h;
    return `<li class="caso ${vencido ? 'vencido' : ''}"><span class="ico" aria-hidden="true">${t.icono}</span><div>
      <b>${esc(t.titulo)} · ${esc(c.entidad)}</b><small>Código ${c.codigo}</small><span>${estado}</span>
      ${boton ? `<button class="${vencido ? 'principal' : 'secundario'}" data-accion="${boton[1]}" data-val="${c.codigo}">${boton[0]}</button>` : ''}</div></li>`;
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
  pantalla(`¿Le llegó respuesta de ${c.entidad}?`,
    vencido ? '<p>El plazo ya venció. Cuéntenos qué pasó y le decimos qué sigue.</p>' : `<p>Todavía están en plazo hasta el ${fechaLarga(deIso(c.venc))}.</p>`, [
    { txt: 'Sí, y resolvió lo que pedí', icono: '🎉', accion: 'cerrar' },
    { txt: 'Sí, pero no contesta lo que pedí', sub: 'Respuesta incompleta o "está en estudio"', icono: '😕', accion: 'sinRespuesta' },
    { txt: 'Sí, me dijeron que no, con razones', icono: '✋', accion: 'negada' },
    vencido ? { txt: 'No me han respondido nada', icono: '🔕', accion: 'sinRespuesta', clase: 'sugerida' } : { txt: 'Todavía no', icono: '⏳', accion: 'casos' },
  ], vencido ? 'alerta' : 'reposo');
};
acciones.cerrar = async () => {
  casos = casos.filter(c => c.codigo !== sel);
  await guardar();
  pantalla('Caso cerrado', '<p>Lo borramos de este celular. Si vuelve a necesitar algo, aquí estamos.</p>', [{ txt: 'Volver al inicio', accion: 'inicio' }], 'exito');
};
acciones.negada = () => pantalla('La entidad sí cumplió con responder',
  '<p>Si le respondieron de fondo, aunque la respuesta sea un no, la entidad cumplió con el derecho de petición. Una tutela por este motivo probablemente sería negada.</p><p>Si no está de acuerdo con la decisión, puede presentar recursos contra ella. Pida orientación gratis en un consultorio jurídico o en la Personería.</p>',
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
  '<p>Las universidades con facultad de derecho tienen consultorios jurídicos gratuitos. Si en su municipio no hay, pueden atenderle de forma virtual. Lleve su petición y la prueba de entrega.</p>',
  [{ txt: 'Volver a mis casos', accion: 'casos' }]);

function docTutela(c) {
  return `<article class="doc">
    <p>Señor(a)<br><b>Juez de la República (reparto)</b><br>${esc(c.municipio)}</p>
    <p><b>Referencia:</b> Acción de tutela para proteger el derecho fundamental de petición<br><b>Accionante:</b> ${linea}, C.C. ${linea}<br><b>Accionada:</b> ${esc(c.entidad)}</p>
    <h3>Hechos</h3><ol>
      <li>El ${fechaDoc(deIso(c.rad))} presenté un derecho de petición ante ${esc(c.entidad)}, en el que solicité: ${c.peticiones.map(esc).join(' ')}</li>
      <li>El plazo de ${c.plazo} días hábiles del artículo 14 de la Ley 1755 de 2015 venció el ${fechaDoc(deIso(c.venc))}, y a la fecha no he recibido una respuesta de fondo.</li></ol>
    <h3>Derecho vulnerado</h3><p>Derecho fundamental de petición (artículo 23 de la Constitución Política y Ley 1755 de 2015).</p>
    <h3>Pretensión</h3><p>Que se ordene a ${esc(c.entidad)} dar una respuesta de fondo, clara, precisa y congruente a mi petición dentro de las 48 horas siguientes a la notificación del fallo.</p>
    <h3>Pruebas</h3><p>Copia del derecho de petición y de la constancia de entrega${c.modo === 'envio' ? ' (correo electrónico de envío)' : ''}.</p>
    <h3>Juramento</h3><p>Bajo la gravedad del juramento manifiesto que no he presentado otra acción de tutela por los mismos hechos.</p>
    <h3>Notificaciones</h3><p>${linea}</p>
    <p class="firma">${linea}<br>Firma<br>C.C. ${linea}</p>
    <p class="pie">Documento preparado con ${NOMBRE}. ${VERIFICADO}. No es asesoría de abogado.</p>
  </article>`;
}
acciones.tutela = () => {
  docActual = docTutela(buscar(sel));
  pantalla('Su tutela', `<p class="nota">Llene a mano sus datos, fírmela y llévela al juzgado de su municipio, o pídale a la Personería que la presente por usted. No necesita abogado. Lleve copia de la petición y la prueba de entrega.</p>${docActual}`, [
    { txt: 'Imprimir o guardar en PDF', icono: '🖨️', accion: 'imprimir', clase: 'principal' },
    { txt: 'Volver a mis casos', accion: 'casos' },
  ]);
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
    <li><b>Reciba su documento</b>: un derecho de petición listo.</li>
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
  localStorage.removeItem(KEY);
  clave = null; casos = []; caso = null;
  pantalla('Se borró todo', '<p>Ya no queda ningún caso en este celular. Si usó WhatsApp o SMS para este caso, borre también esos mensajes.</p>', [{ txt: 'Empezar de nuevo', accion: 'pin' }]);
};

// ---------- sin internet ----------
async function procesarCola() {
  if (!clave || !navigator.onLine) return;
  const cola = casos.filter(c => c.estado === 'en_cola');
  if (!cola.length) return;
  cola.forEach(c => { c.estado = 'abierto'; fijarPlazo(c, hoy()); });
  await guardar();
  if (main.querySelector('h1').innerText === 'Mis casos') acciones.casos();
  aviso(cola.length === 1 ? 'Se envió la petición que estaba en cola (simulado)' : `Se enviaron ${cola.length} peticiones que estaban en cola (simulado)`);
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
