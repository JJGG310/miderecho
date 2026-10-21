// Asistente de voz de MiDerecho (ElevenLabs Agents). Módulo autónomo (CONTRATOS.md §4):
// agrega su botón, pide consentimiento y maneja la app solo a través de window.miderecho.
// No guarda audio ni transcripciones: nada de esto se escribe en el celular.
// Configuración del agente y cómo recrearlo: agente/README.md

// El agente (agent_8101m5dg7s5se9trrst6fjpvz52d) exige sesión firmada: el token de cada conversación lo entrega
// api/elevenlabs-sesion.js, que guarda la clave en el servidor. Desde el navegador no se puede abrir sin ese token.
// Versión exacta del SDK oficial y su huella (SRI): si el archivo del CDN cambia, el navegador no lo ejecuta.
const SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.26.0/dist/lib.iife.js';
const SDK_SRI = 'sha384-GAgUf1yx/dGreo/QTqLRVycB5sMQdsPKOmbMWlKec+fjMXzz+OXy4c6EfjB7Anb7';

// Valores que acepta iniciar_caso (los mismos de la herramienta en ElevenLabs). tema depende del tipo (app.js, TEMA_DE).
const LISTAS = {
  tipo: ['peticion', 'tutela_salud', 'tutela', 'servicios_publicos'],
  tema: ['agua', 'vias', 'salud', 'ayudas', 'tierras', 'educacion', 'otro', 'acueducto', 'energia', 'gas', 'aseo',
    'minimo_vital', 'debido_proceso', 'peticion', 'otro_derecho', 'cita', 'medicamento', 'cirugia', 'examen', 'transporte', 'otra_cosa'],
  entidad: ['alcaldia', 'eps', 'ant'],
  desde: ['hace una semana', 'hace un mes', 'hace tres meses', 'hace seis meses', 'hace más de un año'],
};
// Botones que deja una decisión de la persona: los toca ella, nunca el agente.
const DE_LA_PERSONA = /borr|enviar|env[ií]en|acepto|cerrar|olvid/i;
// Campos donde la persona escribe (vereda, relato, nombre, cédula, clave): mientras estén en pantalla el micrófono se apaga.
const CAMPOS = 'input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=date]), textarea';

document.head.insertAdjacentHTML('beforeend', `<style>
  body { padding-bottom: 6.5rem; }
  .av-en-llamada #aviso { bottom: 7.5rem; }
  .av-boton { position: fixed; right: 1rem; bottom: 1rem; z-index: 6; min-height: 60px; padding: 0 1.3rem; border: none; border-radius: 999px;
    background: var(--verde, #1f6f4a); color: #fff; font: inherit; font-weight: 700; font-size: 1.05rem; box-shadow: 0 4px 14px rgba(0,0,0,.25); cursor: pointer; }
  .av-boton:focus-visible, .av-llamada button:focus-visible, .av-dialogo button:focus-visible { outline: 3px solid var(--tierra, #b5541b); outline-offset: 3px; }
  .av-dialogo { max-width: 32rem; width: calc(100% - 2rem); border: none; border-radius: 18px; padding: 1.3rem; color: var(--texto, #1d1b16); background: var(--fondo, #faf6ef); }
  .av-dialogo::backdrop { background: rgba(0,0,0,.5); }
  .av-dialogo h2 { margin: 0 0 .6rem; font-size: 1.3rem; }
  .av-dialogo ul { padding-left: 1.2rem; margin: 0 0 1rem; }
  .av-dialogo li { margin-bottom: .45rem; }
  .av-dialogo form { display: grid; gap: .6rem; }
  .av-llamada { position: fixed; left: 0; right: 0; bottom: 0; z-index: 6; display: flex; flex-wrap: wrap; align-items: center; gap: .6rem .8rem; padding: .8rem 1rem;
    background: var(--texto, #1d1b16); color: #fff; box-shadow: 0 -4px 14px rgba(0,0,0,.25); }
  .av-llamada[hidden], .av-llamada [hidden] { display: none; }
  .av-estado { flex: 1 1 12rem; margin: 0; font-weight: 600; font-size: 1.05rem; }
  .av-llamada button { min-height: 64px; padding: 0 1.2rem; border: none; border-radius: 999px; font: inherit; font-weight: 800; font-size: 1.1rem; cursor: pointer; }
  .av-colgar { min-width: 9rem; background: var(--rojo, #b3261e); color: #fff; }
  .av-termine { background: #fff; color: var(--texto, #1d1b16); }
  .av-oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
</style>`);

document.body.insertAdjacentHTML('beforeend', `
  <button type="button" class="av-boton" aria-haspopup="dialog"><span aria-hidden="true">🎙️</span> Hablar con el asistente</button>
  <dialog class="av-dialogo" aria-labelledby="av-titulo"></dialog>
  <p class="av-oculto" aria-live="polite"></p>
  <div class="av-llamada" hidden><p class="av-estado"></p>
    <button type="button" class="av-termine" hidden>Ya terminé de escribir</button><button type="button" class="av-colgar">Colgar</button></div>`);

const $ = s => document.querySelector(s);
const boton = $('.av-boton'), dialogo = $('.av-dialogo'), anuncio = $('.av-oculto');
const barra = $('.av-llamada'), estado = $('.av-estado'), termine = $('.av-termine'), colgar = $('.av-colgar');
const asistente = document.getElementById('asistente'), main = document.getElementById('app');
let conversacion = null, intento = 0, cancelado = false;
let fase = '', modo = 'listening', silenciado = false, enRiesgo = false, ultimaPantalla = null, antes = null;

const CONSENTIMIENTO = `<h2 id="av-titulo">Antes de hablar</h2><ul>
  <li>El asistente es una <b>máquina</b>, no una persona, y <b>no es abogado</b>.</li>
  <li>Su voz pasa por servicios externos para entenderla y contestarle: <b>ElevenLabs</b>, en Estados Unidos, y el modelo de lenguaje <b>Gemini</b>, de Google.</li>
  <li>La app <b>no guarda</b> su voz ni lo que usted diga, y configuramos ese servicio para que no la grabe ni la guarde. La voz <b>no se usa para identificar</b> a nadie.</li>
  <li>No diga su cédula, su nombre ni su dirección. Esos datos se escriben a mano.</li>
  <li>Es <b>opcional</b>: puede usar la app tocando los botones, sin hablar. Hablar gasta datos de internet.</li>
  <li>Responsable: [Organización], [contacto].</li></ul>
  <form method="dialog"><button type="button" class="secundario" data-leer>🔊 Escuchar este aviso</button>
    <button class="principal" value="si">Sí, quiero hablar</button><button class="secundario" value="no">No, gracias</button></form>`;
const mensaje = (titulo, texto) => `<h2 id="av-titulo">${titulo}</h2><p>${texto}</p><form method="dialog"><button class="principal" value="ok">Entendido</button></form>`;
const SIN_RED = mensaje('Necesita internet', 'El asistente de voz necesita conexión a internet. El resto de la app funciona igual sin conexión: siga tocando los botones.');

// La voz del celular lee el aviso sin internet.
function leer(texto) {
  const s = window.speechSynthesis;
  if (!s) return;
  s.cancel();
  s.speak(Object.assign(new SpeechSynthesisUtterance(texto), { lang: 'es-CO', rate: 0.95 }));
}
dialogo.addEventListener('click', e => { if (e.target.closest('[data-leer]')) leer(dialogo.querySelector('ul').innerText); });

// Abre el diálogo y espera a que la persona toque un botón (o lo cierre con Esc).
function preguntar(html) {
  dialogo.innerHTML = html;
  dialogo.returnValue = '';
  dialogo.showModal();
  return new Promise(ok => dialogo.addEventListener('close', () => { window.speechSynthesis?.cancel(); ok(dialogo.returnValue); }, { once: true }));
}

let sdk = null;
const cargarSDK = () => sdk ||= new Promise((ok, mal) => {
  const s = Object.assign(document.createElement('script'), { src: SDK, integrity: SDK_SRI, crossOrigin: 'anonymous' });
  const fallar = m => { clearTimeout(reloj); sdk = null; s.remove(); mal(new Error(m)); };
  const reloj = setTimeout(() => fallar('El asistente tardó demasiado en cargar'), 30000);
  s.onload = () => window.ElevenLabsClient?.Conversation ? (clearTimeout(reloj), ok(window.ElevenLabsClient)) : fallar('No se pudo cargar el asistente');
  s.onerror = () => fallar('No se pudo cargar el asistente');
  document.head.append(s);
});

// Cómo se abre cada sesión. agente/prueba.html lo cambia para usar el agente de pruebas.
const config = {
  async sesion() {
    const r = await fetch('/api/elevenlabs-sesion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!r.ok) throw new Error('Sin sesión del asistente: ' + r.status);
    return { conversationToken: (await r.json()).token, connectionType: 'webrtc' };
  },
};

// ---------- herramientas que el agente usa para manejar la app ----------
const app = () => {
  if (!window.miderecho) throw new Error('La app no está lista. Pídale a la persona que toque las opciones en la pantalla.');
  return window.miderecho;
};
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();   // igual que app.js
// Por si la pantalla muestra una cédula o un teléfono: se tapan los números largos.
// ponytail: los nombres propios no se pueden tapar con certeza; pantallaActual() de app.js ya deja fuera el documento.
const tapar = s => String(s ?? '').replace(/\d[\d .-]{4,}\d/g, '[número oculto]').slice(0, 1500);
const ver = p => ({ id: p.id, titulo: tapar(p.titulo), texto: tapar(p.texto), opciones: (p.opciones || []).map(tapar) });
const pantalla = () => ver(app().pantallaActual() || {});
const esPreguntaPeligro = p => /peligro/i.test(p.texto) && (p.opciones || []).map(norm).includes('no se');
const callarApp = () => window.speechSynthesis?.cancel();   // la app puede estar en "Modo voz": que no hable encima del agente
const BLOQUEO_RIESGO = { ok: false, motivo: 'Protocolo de riesgo activo: no se sigue con el caso. Dé los datos de ayuda y, si la persona quiere, elija "Salir".' };
const negar = (motivo, p) => ({ ok: false, motivo, pantalla: ver(p) });

const herramientas = {
  iniciar_caso: d => {
    if (enRiesgo) return BLOQUEO_RIESGO;
    const datos = {};
    for (const [k, valores] of Object.entries(LISTAS)) if (valores.includes(d?.[k])) datos[k] = d[k];
    if (typeof d?.municipio === 'string' && d.municipio.trim()) datos.municipio = d.municipio.trim().slice(0, 60);
    app().iniciarCaso(datos);
    callarApp();
    return pantalla();
  },
  pantalla_actual: () => enRiesgo ? BLOQUEO_RIESGO : pantalla(),
  elegir_opcion: ({ texto } = {}) => {
    if (enRiesgo && norm(texto) !== 'salir') return BLOQUEO_RIESGO;
    const p = app().pantallaActual() || {}, ops = p.opciones || [];
    // El aviso de privacidad lo responde la persona: en esa pantalla el agente no toca nada (elegir() acepta coincidencias parciales).
    if (ops.some(o => /^s[ií],?\s*acepto/i.test(o))) return negar('En el aviso de privacidad la persona toca ella misma "Sí, acepto" o "No acepto".', p);
    const o = ops.find(o => norm(o) === norm(texto));   // solo una opción exacta de la pantalla
    if (!o) return negar('Esa opción no está en la pantalla. Use el texto exacto de una de las opciones.', p);
    if (DE_LA_PERSONA.test(o)) return negar(`"${o}" lo toca la persona en la pantalla.`, p);
    if (esPreguntaPeligro(p) && !['si', 'no se'].includes(norm(o))) return negar('A la pregunta de peligro, el "No" lo toca la persona en la pantalla.', p);
    if (esPreguntaPeligro(p)) enRiesgo = true;   // "Sí" o "No sé": desde aquí solo ayuda
    const ok = app().elegir(o);
    callarApp();
    return { ok, pantalla: pantalla() };
  },
  activar_protocolo_riesgo: () => {
    enRiesgo = true;
    if (typeof window.miderecho?.riesgo === 'function') window.miderecho.riesgo();   // descarta el borrador y muestra la ayuda
    callarApp();
    return { ok: true, indicacion: 'No haga más preguntas del caso ni use otras herramientas. Diga el texto fijo del protocolo de riesgo.' };
  },
};

// ---------- pantalla de la app durante la llamada ----------
function silenciar(si) {
  if (silenciado === si || !conversacion) return;
  silenciado = si;
  conversacion.setMicMuted(si);
  if (!si) conversacion.sendContextualUpdate('La persona terminó de escribir en la pantalla. Use pantalla_actual para ver dónde va.');
  pintar();
}
// Cada pantalla nueva: ¿hay campos para escribir? ¿es la ayuda de riesgo?
new MutationObserver(() => {
  if (!conversacion || !main) return;
  const titulo = main.querySelector('h1')?.textContent || '';
  if (/^Esto es serio/i.test(titulo)) enRiesgo = true;
  if (titulo === ultimaPantalla) return;
  ultimaPantalla = titulo;
  silenciar(!!main.querySelector(CAMPOS));
}).observe(main || document.createElement('i'), { childList: true });

// ---------- conversación ----------
function hablando(si) {
  if (!asistente || asistente.dataset.estado === 'alerta') return;   // la alerta de la app manda
  if (si && asistente.dataset.estado !== 'hablando') { antes = asistente.dataset.estado; asistente.dataset.estado = 'hablando'; }
  if (!si && asistente.dataset.estado === 'hablando') asistente.dataset.estado = antes || 'reposo';
}
function pintar() {
  estado.textContent = fase === 'conectando' ? 'Conectando…'
    : silenciado ? 'Micrófono apagado mientras escribe. Toque "Ya terminé" cuando acabe.'
    : modo === 'speaking' ? 'El asistente está hablando…' : 'Le escucho. Hable cuando quiera.';
  barra.hidden = !fase;
  boton.hidden = !!fase;
  termine.hidden = !silenciado;
  document.body.classList.toggle('av-en-llamada', !!fase);
}
function terminada() {
  conversacion = null;
  fase = ''; silenciado = false; enRiesgo = false; ultimaPantalla = null; modo = 'listening';
  hablando(false);
  pintar();
  anuncio.textContent = 'Conversación terminada';
  boton.focus();
}

async function empezar() {
  if (!navigator.onLine) return preguntar(SIN_RED);
  if (await preguntar(CONSENTIMIENTO) !== 'si') return;
  const yo = ++intento, vigente = () => yo === intento && !cancelado;
  cancelado = false;
  fase = 'conectando'; enRiesgo = false; silenciado = false;
  pintar();
  anuncio.textContent = 'Conectando';
  colgar.focus();
  callarApp();
  try {
    const { Conversation } = await cargarSDK();
    if (!vigente()) return;
    const sesion = await config.sesion();
    if (!vigente()) return;
    const c = await Conversation.startSession({
      ...sesion,
      clientTools: herramientas,
      onModeChange: ({ mode }) => {
        if (yo !== intento) return;
        callarApp();
        modo = mode;
        hablando(mode === 'speaking');
        pintar();
      },
      onDisconnect: d => {
        if (yo !== intento) return;
        terminada();
        if (d?.reason === 'error') preguntar(mensaje('Se cortó la conversación', 'Puede intentar de nuevo. La app sigue funcionando con los botones.'));
      },
      onError: m => console.warn('Asistente de voz:', m),
    });
    if (!vigente()) return c.endSession();   // colgó mientras conectaba
    conversacion = c;
    fase = 'activa';
    ultimaPantalla = main?.querySelector('h1')?.textContent ?? null;
    silenciar(!!main?.querySelector(CAMPOS));
    pintar();
  } catch (e) {
    if (!vigente()) return;
    terminada();
    const sinMicrofono = e?.name === 'NotAllowedError' || e?.name === 'NotFoundError';
    preguntar(sinMicrofono
      ? mensaje('No pude usar el micrófono', 'Revise que el navegador tenga permiso para usar el micrófono. Puede seguir usando la app con los botones.')
      : navigator.onLine ? mensaje('El asistente no está disponible', 'Intente de nuevo en un rato. Puede seguir usando la app con los botones.') : SIN_RED);
  }
}

boton.addEventListener('click', empezar);
termine.addEventListener('click', () => silenciar(false));
colgar.addEventListener('click', () => {
  if (conversacion) return conversacion.endSession();
  cancelado = true;
  terminada();
});
addEventListener('pagehide', () => conversacion?.endSession());

export { cargarSDK, config, herramientas };   // para agente/prueba.html
