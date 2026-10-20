// Asistente de voz de MiDerecho (ElevenLabs Agents). Módulo autónomo (CONTRATOS.md §4):
// agrega su botón, pide consentimiento y maneja la app solo a través de window.miderecho.
// No guarda audio ni transcripciones: nada de esto se escribe en el celular.
// Configuración del agente y cómo recrearlo: agente/README.md

const AGENTE = 'agent_8101m5dg7s5se9trrst6fjpvz52d';   // id público; el agente solo acepta los dominios del proyecto
// Versión exacta del SDK oficial y su huella (SRI): si el archivo del CDN cambia, el navegador no lo ejecuta.
const SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.26.0/dist/lib.iife.js';
const SDK_SRI = 'sha384-GAgUf1yx/dGreo/QTqLRVycB5sMQdsPKOmbMWlKec+fjMXzz+OXy4c6EfjB7Anb7';

// Valores que acepta iniciar_caso (los mismos de la herramienta en ElevenLabs).
const LISTAS = {
  tipo: ['peticion', 'tutela_salud', 'tutela', 'servicios_publicos'],
  tema: ['agua', 'vias', 'salud', 'ayudas', 'tierras', 'educacion', 'otro'],
  entidad: ['alcaldia', 'eps', 'ant'],
  desde: ['hace una semana', 'hace un mes', 'hace tres meses', 'hace seis meses', 'hace más de un año'],
};

document.head.insertAdjacentHTML('beforeend', `<style>
  body { padding-bottom: 5.5rem; }
  .av-boton { position: fixed; right: 1rem; bottom: 1rem; z-index: 6; min-height: 60px; padding: 0 1.3rem; border: none; border-radius: 999px;
    background: var(--verde, #1f6f4a); color: #fff; font: inherit; font-weight: 700; font-size: 1.05rem; box-shadow: 0 4px 14px rgba(0,0,0,.25); cursor: pointer; }
  .av-boton:focus-visible, .av-llamada button:focus-visible, .av-dialogo button:focus-visible { outline: 3px solid var(--tierra, #b5541b); outline-offset: 3px; }
  .av-dialogo { max-width: 32rem; width: calc(100% - 2rem); border: none; border-radius: 18px; padding: 1.3rem; color: var(--texto, #1d1b16); background: var(--fondo, #faf6ef); }
  .av-dialogo::backdrop { background: rgba(0,0,0,.5); }
  .av-dialogo h2 { margin: 0 0 .6rem; font-size: 1.3rem; }
  .av-dialogo ul { padding-left: 1.2rem; margin: 0 0 1rem; }
  .av-dialogo li { margin-bottom: .45rem; }
  .av-dialogo form { display: grid; gap: .6rem; }
  .av-llamada { position: fixed; left: 0; right: 0; bottom: 0; z-index: 6; display: flex; align-items: center; gap: .8rem; padding: .8rem 1rem;
    background: var(--texto, #1d1b16); color: #fff; box-shadow: 0 -4px 14px rgba(0,0,0,.25); }
  .av-llamada[hidden] { display: none; }
  .av-estado { flex: 1; margin: 0; font-weight: 600; font-size: 1.05rem; }
  .av-colgar { min-height: 64px; min-width: 9rem; padding: 0 1.2rem; border: none; border-radius: 999px; background: var(--rojo, #b3261e); color: #fff;
    font: inherit; font-weight: 800; font-size: 1.15rem; cursor: pointer; }
</style>`);

document.body.insertAdjacentHTML('beforeend', `
  <button type="button" class="av-boton" aria-haspopup="dialog"><span aria-hidden="true">🎙️</span> Hablar con el asistente</button>
  <dialog class="av-dialogo" aria-labelledby="av-titulo"></dialog>
  <div class="av-llamada" hidden><p class="av-estado" role="status" aria-live="polite"></p><button type="button" class="av-colgar">Colgar</button></div>`);

const boton = document.querySelector('.av-boton');
const dialogo = document.querySelector('.av-dialogo');
const barra = document.querySelector('.av-llamada');
const estado = barra.querySelector('.av-estado');
const asistente = document.getElementById('asistente');
let conversacion = null, cancelado = false, antes = null;

const CONSENTIMIENTO = `<h2 id="av-titulo">Antes de hablar</h2><ul>
  <li>El asistente es una <b>máquina</b>, no una persona, y <b>no es abogado</b>.</li>
  <li>Su voz pasa por un servicio externo, <b>ElevenLabs, en Estados Unidos</b>, para entenderla y contestarle.</li>
  <li>La app <b>no guarda</b> su voz ni lo que usted diga, y configuramos ese servicio para que no la grabe ni la guarde.</li>
  <li>No diga su cédula, su nombre ni su dirección. Esos datos se escriben a mano.</li>
  <li>Es <b>opcional</b>: puede usar la app tocando los botones, sin hablar. Hablar gasta datos de internet.</li></ul>
  <form method="dialog"><button class="principal" value="si">Sí, quiero hablar</button><button class="secundario" value="no">No, gracias</button></form>`;
const mensaje = (titulo, texto) => `<h2 id="av-titulo">${titulo}</h2><p>${texto}</p><form method="dialog"><button class="principal" value="ok">Entendido</button></form>`;
const SIN_RED = mensaje('Necesita internet', 'El asistente de voz necesita conexión a internet. El resto de la app funciona igual sin conexión: siga tocando los botones.');

// Abre el diálogo y espera a que la persona toque un botón (o lo cierre con Esc).
function preguntar(html) {
  dialogo.innerHTML = html;
  dialogo.returnValue = '';
  dialogo.showModal();
  return new Promise(ok => dialogo.addEventListener('close', () => ok(dialogo.returnValue), { once: true }));
}

let sdk = null;
const cargarSDK = () => sdk ||= new Promise((ok, mal) => {
  const s = Object.assign(document.createElement('script'), { src: SDK, integrity: SDK_SRI, crossOrigin: 'anonymous' });
  s.onload = () => ok(window.ElevenLabsClient);
  s.onerror = () => { sdk = null; s.remove(); mal(new Error('No se pudo cargar el asistente')); };
  document.head.append(s);
});

// ---------- herramientas que el agente usa para manejar la app ----------
const app = () => {
  if (!window.miderecho) throw new Error('La app no está lista. Pídale a la persona que toque las opciones en la pantalla.');
  return window.miderecho;
};
// Lo que la pantalla muestra puede incluir la cédula o un teléfono (vista del documento): se tapan los números largos.
// ponytail: los nombres propios no se pueden tapar con certeza; lo ideal es que pantallaActual() no los incluya.
const tapar = s => String(s ?? '').replace(/\d[\d .-]{5,}\d/g, '[número oculto]').slice(0, 1500);
const pantalla = () => {
  const p = app().pantallaActual() || {};
  return { id: p.id, titulo: tapar(p.titulo), texto: tapar(p.texto), opciones: (p.opciones || []).map(tapar) };
};
// La app puede estar en "Modo voz": se calla para que no hable encima del agente.
const callarApp = () => window.speechSynthesis?.cancel();

const herramientas = {
  iniciar_caso: p => {
    const datos = {};
    for (const [k, valores] of Object.entries(LISTAS)) if (valores.includes(p?.[k])) datos[k] = p[k];
    if (typeof p?.municipio === 'string' && p.municipio.trim()) datos.municipio = p.municipio.trim().slice(0, 60);
    app().iniciarCaso(datos);
    callarApp();
    return pantalla();
  },
  pantalla_actual: () => pantalla(),
  elegir_opcion: ({ texto } = {}) => {
    // El consentimiento lo da la persona con su propio dedo, nunca el agente (un "sí" mal entendido no cuenta).
    if (/^\s*s[ií],?\s*acepto/i.test(texto)) return { ok: false, motivo: 'La persona debe tocar ella misma "Sí, acepto" en la pantalla.', pantalla: pantalla() };
    const ok = app().elegir(String(texto ?? ''));
    callarApp();
    return { ok, pantalla: pantalla() };
  },
};

// ---------- conversación ----------
function hablando(si) {
  if (!asistente) return;
  if (si && asistente.dataset.estado !== 'hablando') { antes = asistente.dataset.estado; asistente.dataset.estado = 'hablando'; }
  if (!si && asistente.dataset.estado === 'hablando') asistente.dataset.estado = antes || 'reposo';
}
function verLlamada(texto) {
  estado.textContent = texto;
  barra.hidden = !texto;
  boton.hidden = !!texto;
}
function terminada() {
  conversacion = null;
  hablando(false);
  verLlamada('');
  boton.focus();
}

async function empezar() {
  if (!navigator.onLine) return preguntar(SIN_RED);
  if (await preguntar(CONSENTIMIENTO) !== 'si') return;
  cancelado = false;
  verLlamada('Conectando…');
  barra.querySelector('button').focus();
  callarApp();
  try {
    const { Conversation } = await cargarSDK();
    conversacion = await Conversation.startSession({
      agentId: AGENTE,
      clientTools: herramientas,
      onModeChange: ({ mode }) => {
        hablando(mode === 'speaking');
        verLlamada(mode === 'speaking' ? 'El asistente está hablando…' : 'Le escucho. Hable cuando quiera.');
      },
      onDisconnect: d => {
        const error = d?.reason === 'error';
        terminada();
        if (error) preguntar(mensaje('Se cortó la conversación', 'Puede intentar de nuevo. La app sigue funcionando con los botones.'));
      },
      onError: m => console.warn('Asistente de voz:', m),
    });
    if (cancelado) conversacion.endSession();   // colgó mientras conectaba
  } catch (e) {
    terminada();
    if (cancelado) return;
    const sinMicrofono = e?.name === 'NotAllowedError' || e?.name === 'NotFoundError';
    preguntar(sinMicrofono
      ? mensaje('No pude usar el micrófono', 'Revise que el navegador tenga permiso para usar el micrófono. Puede seguir usando la app con los botones.')
      : navigator.onLine ? mensaje('El asistente no está disponible', 'Intente de nuevo en un rato. Puede seguir usando la app con los botones.') : SIN_RED);
  }
}

boton.addEventListener('click', empezar);
barra.querySelector('button').addEventListener('click', () => {
  if (conversacion) return conversacion.endSession();
  cancelado = true;
  terminada();
});
addEventListener('pagehide', () => conversacion?.endSession());

export { AGENTE, cargarSDK, herramientas };   // para agente/prueba.html
