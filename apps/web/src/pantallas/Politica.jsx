// Política de datos: historieta interactiva (Legal Design) en #/politica y política completa (Decreto 1377 de 2013, art. 13)
// en #/politica/completa. Los dibujos son SVG hechos a mano, sin imágenes, para no gastar datos.
// La política completa es la de docs/politica-de-datos.md sin las marcas [validar]: si cambia una, cambie la otra.
import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Volume2, VolumeX, ArrowLeft, ArrowRight, FileText, Check, X } from 'lucide-react';
import { Encabezado, Titulo } from '../componentes/comunes.jsx';
import { hablar, callar } from '../lib/voz.js';
import { almacen } from '../lib/almacen.js';
import { ir, atras } from '../lib/ruta.js';
import './politica.css';

const ORG = '[Organización]', CONTACTO = '[contacto]', VIGENCIA = '21 de octubre de 2026';

// ---------- dibujos (escena de 320 × 170) ----------
const T = '#1f2a24', VERDE = '#264933', TIERRA = '#a8743a', ROJO = '#b23b3b';
const PIEL = '#9c6644', PELO = '#2b211c', CAMISA = '#2f7f8f', PAJA = '#e9c46a';
const en = (x, y, s, svg) => `<g transform="translate(${x} ${y}) scale(${s})">${svg}</g>`;
const campo = '<path d="M0 132q50-26 105-8t110-6 105 4V170H0z" fill="#c9d6bf"/><circle cx="292" cy="26" r="14" fill="#f2c879"/>';

// El asistente es un globo de diálogo del color de sus respuestas en el chat. Sus estados van en data-estado del <svg>.
const asis = (x, y, s = 1.3) => en(x, y, s, `<g class="pc-asis">
  <ellipse cx="32" cy="66" rx="15" ry="3" fill="${T}" opacity=".15" stroke="none"/>
  <g class="pc-flota"><path d="M32 6c14.4 0 26 10.3 26 23S46.4 52 32 52c-3 0-5.9-.4-8.6-1.3L12 56l2.6-10.2C9.3 41.6 6 35.7 6 29 6 16.3 17.6 6 32 6z" fill="#cbd3bf" stroke="${VERDE}"/>
    <g class="pc-ojos" fill="${T}" stroke="none"><circle cx="23" cy="26" r="4.2"/><circle cx="41" cy="26" r="4.2"/></g>
    <path class="pc-boca" d="M24 36q8 6 16 0" stroke="${VERDE}" stroke-width="3.5" fill="none"/>
    <ellipse class="pc-boca-abierta" cx="32" cy="37.5" rx="5.5" ry="4.5" fill="${VERDE}" stroke="none"/>
    <g class="pc-signo"><circle cx="54" cy="10" r="9" fill="#e07b39"/><path d="M54 5v6m0 3.5v.5" stroke="#fff" stroke-width="3"/></g></g></g>`);

// Doña Rosa, campesina con sombrero y trenza.
const brazo = (d, x, y) => `<path d="${d}" stroke-width="13" fill="none"/><path d="${d}" stroke="${CAMISA}" stroke-width="8" fill="none"/><circle cx="${x}" cy="${y}" r="6" fill="${PIEL}"/>`;
const sostiene = cosa => `<path d="M24 124q-8 22 12 22" stroke-width="13" fill="none"/><path d="M24 124q-8 22 12 22" stroke="${CAMISA}" stroke-width="8" fill="none"/>${cosa}<circle cx="38" cy="145" r="6" fill="${PIEL}"/>`;
const BOCAS = { sonrie: 'M44 89q6 5 12 0', duda: 'M45 91q5-3 10 1', triste: 'M44 93q6-5 12 0' };
const BRAZOS = {
  cel: sostiene(`<rect x="31" y="116" width="18" height="29" rx="3" fill="${T}"/><rect x="34" y="120" width="12" height="19" fill="#9fd3e6" stroke="none"/>`),
  papel: sostiene('<path d="M22 108h20l6 6v32H22z" fill="#fff"/><path d="M27 120h16M27 127h16M27 134h10" stroke-width="2"/>'),
  arriba: brazo('M76 122q18-14 13-42', 89, 76),
  menton: brazo('M75 124q4-20-16-24', 57, 99),
  senala: brazo('M24 124q-12 0-22-12', 1, 110),
};
const rosa = (x, y, boca = 'sonrie', brazos = '') => en(x, y, .95, `
  <path d="M32 70q-14 28-6 58" stroke="${PELO}" stroke-width="10" fill="none"/>
  <path d="M14 172q2-54 36-62 34 8 36 62z" fill="${CAMISA}"/><path d="M43 98h14v14H43z" fill="${PIEL}"/>
  <circle cx="50" cy="80" r="22" fill="${PIEL}"/><path d="M28 80q0-20 22-20t22 20q-10-10-22-10t-22 10z" fill="${PELO}" stroke="none"/>
  <path d="M33 61q1-25 17-25t17 25z" fill="${PAJA}"/><ellipse cx="50" cy="61" rx="40" ry="8.5" fill="${PAJA}"/><path d="M35 54h30" stroke="#7a3e1d" stroke-width="4"/>
  <g fill="${T}" stroke="none"><circle cx="42.5" cy="80" r="2.7"/><circle cx="57.5" cy="80" r="2.7"/></g>
  <g fill="#d98a6a" stroke="none"><circle cx="36" cy="88" r="3.5"/><circle cx="64" cy="88" r="3.5"/></g>
  ${boca === 'o' ? `<ellipse cx="50" cy="91" rx="3" ry="3.6" fill="${T}"/>` : `<path d="${BOCAS[boca]}" fill="none"/>`}${BRAZOS[brazos] || ''}`);

const papel = (x, y) => en(x, y, 1, '<path d="M0 0h24l8 8v34H0z" fill="#fff"/><path d="M24 0v8h8" fill="none"/><path d="M6 15h20M6 22h20M6 29h13" stroke-width="2"/>');
const sobre = (x, y, s = 1) => en(x, y, s, '<rect width="36" height="24" rx="2" fill="#fff"/><path d="M2 3l16 12L34 3" fill="none"/>');
const calendario = (x, y) => en(x, y, 1, `<rect y="4" width="34" height="30" rx="3" fill="#fff"/><path d="M0 14V7a3 3 0 0 1 3-3h28a3 3 0 0 1 3 3v7z" fill="${ROJO}"/><path d="M9 0v8M25 0v8" stroke-width="3"/>
  <g fill="${T}" stroke="none"><circle cx="9" cy="21" r="2"/><circle cx="17" cy="21" r="2"/><circle cx="25" cy="21" r="2"/><circle cx="9" cy="28" r="2"/><circle cx="17" cy="28" r="2"/></g>`);
const cedula = (x, y) => en(x, y, 1, '<rect width="46" height="30" rx="3" fill="#fff6c8"/><rect x="5" y="6" width="13" height="17" rx="2" fill="#c9d6bf"/><path d="M23 10h17M23 16h17M23 22h11" stroke-width="2"/>');
const corazon = (x, y) => en(x, y, 1, '<path d="M17 30C3 20 0 14 0 9a8.5 8.5 0 0 1 17-2 8.5 8.5 0 0 1 17 2c0 5-3 11-17 21z" fill="#f28b82"/><path d="M17 9v11M11.5 14.5h11" stroke="#fff" stroke-width="3.5"/>');
const relato = (x, y, s = 1) => en(x, y, s, '<path d="M5 0h30a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H16l-9 7 1-7H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5z" fill="#fff"/><path d="M9 9h22M9 16h15" stroke-width="2"/>');
const tache = (x, y, w, h) => `<path d="M${x} ${y}l${w} ${h}m0-${h}l-${w} ${h}" stroke="${ROJO}" stroke-width="4.5"/>`;
const celular = (x, y, pantalla) => en(x, y, 1, `<rect width="58" height="100" rx="9" fill="${T}"/><rect x="5" y="12" width="48" height="76" rx="3" fill="#fff5e4" stroke="none"/><circle cx="29" cy="94" r="2.5" fill="#8a8170" stroke="none"/>${pantalla}`);
const micro = (x, y) => en(x, y, 1, '<rect x="6" width="12" height="20" rx="6" fill="#fff"/><path d="M1 12a11 11 0 0 0 22 0M12 23v6M6 29h12" fill="none"/>');
const campana = (x, y) => en(x, y, 1, '<path d="M2 23c4-3 4-7 4-12a8 8 0 0 1 16 0c0 5 0 9 4 12z" fill="#f2c879"/><path d="M11 26a3 3 0 0 0 6 0" fill="none"/>');
const escudo = (x, y, s = 1) => en(x, y, s, `<path d="M24 0l22 8v16c0 16-10 26-22 32C12 50 2 40 2 24V8z" fill="${VERDE}"/><path d="M13 27l8 8 14-16" stroke="#fff" stroke-width="5" fill="none"/>`);
const fono = (x, y) => en(x, y, 1, '<path d="M9 0l7 1 3 12-6 4c3 7 8 12 15 15l4-6 12 3 1 7c0 3-3 5-6 5C18 41 0 23 0 7c0-3 3-6 6-6z" fill="#fff"/>');
const edificio = (x, y) => en(x, y, 1, '<path d="M0 22L36 2l36 20z" fill="#fff"/><path d="M4 22h64v6H4z" fill="#fff"/><g fill="#fff"><path d="M10 28h7v30h-7zM25 28h7v30h-7zM40 28h7v30h-7zM55 28h7v30h-7z"/></g><path d="M0 58h72v7H0z" fill="#fff"/>');
const brillo = (x, y) => `<path d="M${x} ${y - 7}v14M${x - 7} ${y}h14" stroke="${TIERRA}" stroke-width="3"/>`;
const flecha = (d, x, y, giro, color = T) => `<g stroke="${color}"><path d="${d}" fill="none" stroke-dasharray="6 6"/><path d="M-7-6L0 0l-7 6" fill="none" transform="translate(${x} ${y}) rotate(${giro})" stroke-width="3"/></g>`;
const signo = (x, y) => `<text x="${x}" y="${y}" font-size="38" font-weight="800" font-family="system-ui, sans-serif" fill="${TIERRA}" stroke="none">?</text>`;
const mundo = `<circle cx="160" cy="76" r="30" fill="#9fd3e6"/><path d="M140 60q10-12 22-6t6 14q-10 4-14 12t-12-4q-8-8-2-16zM170 88q10-4 13 5t-7 11q-8-2-6-16z" fill="#8cc084"/>
  <path d="M130 76h60" stroke-width="1.5" fill="none"/><ellipse cx="160" cy="76" rx="13" ry="30" fill="none" stroke-width="1.5"/>`;
const filas = `<g fill="#fff">${[22, 42, 62].map(y => `<rect x="10" y="${y}" width="38" height="14" rx="3"/>`).join('')}</g><path d="M15 29h20M15 49h26M15 69h16" stroke-width="2"/>`;

// ---------- viñetas: a = asistente, r = doña Rosa, lista = puntos dentro de la viñeta. Globos de 90 caracteres o menos ----------
const NOMBRES = { a: 'Asistente', r: 'Doña Rosa' };
const PASOS = [
  { titulo: '¿Quién cuida sus datos?', escena: campo + asis(26, 44, 1.4) + signo(160, 70) + rosa(204, 6, 'duda', 'cel'), dialogo: [
    ['r', '¿Y quién va a ver lo que yo escriba en esta aplicación?'],
    ['a', 'Soy el asistente de MiDerecho. Soy una máquina, no una persona.'],
    ['a', `Quien responde por sus datos es ${ORG}.`],
    ['a', `Puede escribirle a ${CONTACTO}.`]] },
  { titulo: '¿Para qué usamos sus datos?', escena: campo + asis(14, 50, 1.25) + papel(118, 16) + sobre(160, 52) + calendario(116, 92) + brillo(176, 22) + rosa(212, 6, 'sonrie', 'cel'), dialogo: [
    ['r', '¿Y para qué necesitan mis datos?'],
    ['a', 'Para entender lo que le pasa y armar su documento.'],
    ['a', 'También para recordarle cuándo le deben responder.'],
    ['a', 'Nada más. No los vendemos ni los usamos para publicidad.']] },
  { titulo: 'Lo que no guardamos', escena: asis(10, 52, 1.25) + relato(106, 14) + tache(104, 12, 44, 34) + cedula(160, 56) + tache(158, 54, 50, 34) + papel(112, 100) + rosa(214, 6, 'o'), dialogo: [
    ['a', 'No guardamos la conversación con el asistente.'],
    ['a', 'El nombre y la cédula del documento no se guardan ni van a la inteligencia artificial.'],
    ['a', 'Solo van en el papel. No los escriba en el chat.'],
    ['r', '¿Y si guardo el documento en PDF?'],
    ['a', 'Ese archivo es suyo y queda donde lo guarde. Cuídelo.']] },
  { titulo: 'Lo que queda en su celular', escena: asis(10, 50, 1.25) + celular(124, 22, filas) + rosa(214, 6, 'sonrie', 'cel'), dialogo: [
    ['a', 'En este celular quedan sus casos: la entidad, el municipio, la vereda y las fechas.'],
    ['a', 'También el tema de cada consulta, aunque sea de salud.'],
    ['r', '¿Y si otra persona usa mi celular?'],
    ['a', 'Póngale clave, o bórrelo todo en Perfil con «Borrar todo de este celular».']] },
  { pregunta: 'Si otra persona usa su celular, ¿puede ver sus casos?', opciones: [['Sí, si no tiene clave', true], ['No, nunca', false]],
    explica: 'Sus casos quedan en este celular. Póngale clave o bórrelos en Perfil.' },
  { titulo: 'El asistente y otras empresas', fondo: 'cielo', escena: asis(8, 52, 1.2) + mundo + micro(112, 14) + relato(184, 10, .7) + sobre(110, 124, .8) + campana(190, 120)
      + flecha('M236 128q-20-30-42-44', 194, 84, 220) + rosa(214, 6, 'sonrie', 'cel'), dialogo: [
    ['a', 'Lo que me cuenta lo lee Claude, una inteligencia artificial.'],
    ['a', 'Claude es de la empresa Anthropic, en Estados Unidos.'],
    ['a', 'Antes intentamos quitar cédulas, teléfonos y correos, pero el filtro no atrapa todo.'],
    ['a', 'No escriba nombres, cédulas ni direcciones en el chat.'],
    ['r', '¿Y la voz, los mensajes y el correo?'],
    ['a', 'Cuando existan, pasarán por otras empresas, y solo si usted lo pide.']] },
  { pregunta: 'Antes de enviar su relato al asistente, ¿qué le quitamos?', opciones: [['Cédulas, teléfonos y correos, cuando el filtro los encuentra', true], ['Todo, también los nombres', false]],
    explica: 'Los nombres no se quitan y el filtro no atrapa todo. No escriba nombres, cédulas ni direcciones en el chat.' },
  { titulo: 'Lo delicado es opcional', escena: campo + asis(10, 46, 1.25) + `<rect x="114" y="14" width="66" height="96" rx="4" fill="#fff"/><g fill="#fff">${[34, 56, 78].map(y => `<rect x="122" y="${y - 7}" width="12" height="12" rx="2"/>`).join('')}</g><path d="M140 34h30M140 56h30M140 78h24" stroke-width="2"/>`
      + `<g stroke-width="4">${flecha('M120 120q36 26 70-4', 190, 116, -50, VERDE)}</g>` + rosa(212, 6, 'sonrie', 'arriba'), dialogo: [
    ['a', 'No tiene que contarnos si es víctima, su etnia, su religión o sus ideas políticas.'],
    ['a', 'Tampoco a qué organización pertenece.'],
    ['r', '¿Y si no lo digo?'],
    ['a', 'La app funciona igual.'],
    ['a', 'En la tutela de salud sí hay que contar el problema de salud: va en el documento.']] },
  { titulo: 'Sus derechos', estado: 'exito', escena: campo + asis(12, 46, 1.25) + escudo(132, 24, 1.4) + brillo(124, 30) + brillo(210, 70) + brillo(140, 112) + rosa(214, 6, 'sonrie', 'arriba'), dialogo: [
    ['a', 'Sobre sus datos, usted tiene derecho a:'],
    ['lista', [['Conocer', 'qué datos suyos tenemos.'], ['Corregirlos.', ''], ['Borrarlos.', ''], ['Retirar su permiso', 'cuando quiera.'],
      ['Quejarse', 'ante la Superintendencia de Industria y Comercio: la entidad del Estado que vigila que se cuiden los datos personales.']]],
    ['r', '¿Y eso me cuesta?'],
    ['a', 'No. Es gratis.']] },
  { titulo: '¿Cómo los hace valer?', escena: asis(8, 52, 1.2) + celular(118, 18, `<rect x="9" y="44" width="40" height="22" rx="11" fill="${ROJO}"/><path d="M21 49h16M26 49v-2h6v2M23 52l1.5 10h9l1.5-10" stroke="#fff" stroke-width="2" fill="none"/>`)
      + flecha('M180 60q14-20 10-30', 192, 30, -80) + sobre(176, 4, .8) + rosa(214, 6, 'sonrie', 'senala'), dialogo: [
    ['a', 'En Perfil, toque «Borrar todo de este celular»: se borran sus casos y su historial.'],
    ['a', `Eso no borra lo que tengan otras empresas. Para eso, escríbanos a ${CONTACTO}.`],
    ['a', 'Le respondemos en máximo 10 días hábiles, o 15 si es un reclamo.'],
    ['a', 'Días hábiles: no cuentan sábados, domingos ni festivos.'],
    ['r', '¿Y si no me responden?'],
    ['a', 'Puede quejarse ante la Superintendencia de Industria y Comercio.']] },
  { pregunta: 'Para borrar lo que quedó en este celular, ¿qué hace?', opciones: [['Toco «Borrar todo» en Perfil', true], ['Voy hasta la alcaldía', false]],
    explica: `Eso borra lo de este celular. Para lo que tengan otras empresas, escriba a ${CONTACTO}.` },
  { titulo: 'Si hay peligro', fondo: 'alerta', estado: 'alerta', escena: asis(10, 50, 1.25) + escudo(122, 18, 1.2) + `<circle cx="168" cy="118" r="24" fill="${ROJO}"/>` + fono(150, 100) + rosa(214, 6, 'triste', 'menton'), dialogo: [
    ['r', '¿Y si alguien me amenaza por reclamar?'],
    ['a', 'Si nos cuenta eso, la app deja de preguntar, no guarda nada y le dice a dónde acudir.'],
    ['a', 'Si hay peligro ahora, llame al 123.'],
    ['a', 'La Personería y la Defensoría del Pueblo pueden ayudarle a protegerse.']] },
  { titulo: 'No somos abogados', estado: 'exito', escena: campo + edificio(118, 52) + asis(10, 46, 1.25) + rosa(214, 6, 'sonrie', 'papel'), dialogo: [
    ['a', 'MiDerecho le da información y plantillas. No somos abogados.'],
    ['a', 'La Personería y los consultorios jurídicos atienden gratis y le pueden aconsejar.'],
    ['r', '¡Entendido! Gracias.']] },
];
const PREGUNTA_ESCENA = campo + asis(26, 44, 1.4) + signo(150, 66) + rosa(204, 6, 'duda', 'menton');
const PREGUNTAS = PASOS.filter(p => p.pregunta);

const textoDe = p => p.pregunta
  ? `Pregunta. ${p.pregunta} Opciones: ${p.opciones.map(o => o[0]).join('. ')}.`
  : [p.titulo.replace(/[^.?!]$/, '$&.'), ...p.dialogo.map(([q, t]) => q === 'lista' ? t.map(x => x.join(' ')).join('. ') : `${NOMBRES[q]}: ${t}`)].join(' ');

// Lectura en voz alta con estado (para que el asistente mueva la boca). turno: el aviso de una lectura cancelada no apaga la siguiente.
// Los datos por llenar ([Organización], [contacto]…) no se leen con corchetes.
function useLeer() {
  const [leyendo, setLeyendo] = useState(false);
  const turno = useRef(0);
  useEffect(() => () => callar(), []);
  const leer = texto => {
    const yo = ++turno.current;
    if (hablar(texto.replace(/\[[^\]]*\]/g, 'dato por completar'), () => yo === turno.current && setLeyendo(false))) setLeyendo(true);
  };
  const parar = () => { turno.current++; callar(); setLeyendo(false); };
  return { leyendo, leer, parar };
}

function BotonEscuchar({ leyendo, onClick }) {
  return (
    <button className="btn-secundario pc-boton" aria-pressed={leyendo} onClick={onClick}>
      {leyendo ? <VolumeX size={20} aria-hidden /> : <Volume2 size={20} aria-hidden />} {leyendo ? 'Parar' : 'Escuchar'}
    </button>
  );
}
const Salir = () => <button className="btn-secundario pc-boton" onClick={atras}><X size={20} aria-hidden /> Salir</button>;
const Borrador = () => <p className="pc-borrador">Borrador: falta validar con un abogado y completar los datos del responsable.</p>;

function useEscape() {
  useEffect(() => {
    const f = e => { if (e.key === 'Escape') atras(); };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);
}

export default function Politica({ completa }) {
  useEscape();
  return completa ? <Completa /> : <Historieta />;
}

function Historieta() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(0);
  const [elegida, setElegida] = useState(null);
  const { leyendo, leer, parar } = useLeer();
  const cabeza = useRef(null), x0 = useRef(null), respuesta = useRef(null);
  const p = PASOS[i], ultimo = i === PASOS.length - 1;

  const mover = n => { if (n < 0 || n >= PASOS.length) return; parar(); setElegida(null); setDir(n > i ? 1 : -1); setI(n); };
  useEffect(() => {
    window.scrollTo(0, 0);
    cabeza.current?.focus({ preventScroll: true });
    if (almacen.pref('modoVoz', false)) leer(textoDe(PASOS[i]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  useEffect(() => {
    const f = e => { if (e.key === 'ArrowRight') mover(i + 1); if (e.key === 'ArrowLeft') mover(i - 1); };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  });

  const responder = n => {
    setElegida(n);
    requestAnimationFrame(() => respuesta.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    if (almacen.pref('modoVoz', false) || leyendo) leer((p.opciones[n][1] ? '¡Correcto! ' : 'No es así. ') + p.explica);
  };
  const acerto = elegida !== null && p.opciones[elegida][1];
  const base = acerto ? 'exito' : p.estado || 'reposo';
  // Deslizar el dedo: a la izquierda avanza, a la derecha retrocede. El desplazamiento vertical sigue normal (touch-action: pan-y).
  const soltar = e => {
    if (x0.current === null) return;
    const dx = e.clientX - x0.current.x, dy = e.clientY - x0.current.y;
    x0.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) mover(i + (dx < 0 ? 1 : -1));
  };

  return (
    <main className="pantalla pc">
      <Encabezado />
      <Titulo icono={ShieldCheck}>Sus datos</Titulo>
      <Borrador />
      <div className="pc-arriba">
        <div className="pc-avance">
          <div className="pc-barra" role="progressbar" aria-label="Avance" aria-valuemin={1} aria-valuemax={PASOS.length} aria-valuenow={i + 1} aria-valuetext={`${i + 1} de ${PASOS.length}`}>
            <span style={{ width: `${(i + 1) / PASOS.length * 100}%` }} />
          </div>
          <span className="suave" aria-hidden>{i + 1} de {PASOS.length}</span>
        </div>
        <BotonEscuchar leyendo={leyendo} onClick={() => (leyendo ? parar() : leer(textoDe(p)))} />
        <Salir />
      </div>

      <article key={i} className={`pc-vineta${dir ? ' pc-entra' : ''}`} style={{ '--pc-dx': `${dir * 30}px` }}
        onPointerDown={e => { x0.current = { x: e.clientX, y: e.clientY }; }} onPointerUp={soltar} onPointerCancel={() => { x0.current = null; }}>
        <h2 ref={cabeza} tabIndex={-1}>
          {p.pregunta
            ? <><span className="pc-num" aria-hidden>?</span>Pregunta {PREGUNTAS.indexOf(p) + 1} de {PREGUNTAS.length}</>
            : <><span className="pc-num" aria-hidden>{PASOS.slice(0, i + 1).filter(x => !x.pregunta).length}</span>{p.titulo}</>}
        </h2>
        <svg className={`pc-escena ${p.fondo || ''}`} data-estado={leyendo && base !== 'alerta' ? 'hablando' : base} viewBox="0 0 320 170" aria-hidden="true" focusable="false"
          stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: p.escena || PREGUNTA_ESCENA }} />
        <ul className="pc-globos">
          {p.pregunta
            ? <li className="pc-globo a"><span className="pc-oculto">{NOMBRES.a}: </span>{p.pregunta}</li>
            : p.dialogo.map(([q, t], n) => q === 'lista'
              ? <li key={n}><ul className="pc-lista">{t.map(([b, resto]) => <li key={b}><Check size={18} aria-hidden /><span><b>{b}</b> {resto}</span></li>)}</ul></li>
              : <li key={n} className={`pc-globo ${q}`}><span className="pc-oculto">{NOMBRES[q]}: </span>{t}</li>)}
        </ul>
        {p.pregunta && <>
          <div className="pc-opciones">
            {p.opciones.map(([t, bien], n) => (
              <button key={t} className={`pc-op ${elegida === n ? (bien ? 'bien' : 'mal') : ''}`} aria-pressed={elegida === n} onClick={() => responder(n)}>{t}</button>
            ))}
          </div>
          <p ref={respuesta} className={`pc-respuesta ${acerto ? '' : 'mal'}`} role="status">{elegida !== null && `${acerto ? '¡Correcto! ' : 'No es así. '}${p.explica}`}</p>
        </>}
      </article>

      {ultimo && (
        <div className="pc-fin">
          <button className="btn-primario" onClick={atras}><Check size={20} aria-hidden /> Entendí</button>
          <button className="btn-secundario" onClick={() => ir('politica', 'completa')}><FileText size={20} aria-hidden /> Ver la política completa</button>
        </div>
      )}
      <nav className="pc-nav" aria-label="Viñetas">
        <button className="btn-secundario" onClick={() => mover(i - 1)} disabled={i === 0}><ArrowLeft size={20} aria-hidden /> Atrás</button>
        {!ultimo && <button className="btn-primario" onClick={() => mover(i + 1)}>Siguiente <ArrowRight size={20} aria-hidden /></button>}
      </nav>
    </main>
  );
}

// ---------- política completa ----------
const PRONTO = <i>(todavía no disponible en esta versión)</i>;
const SECCIONES = [
  ['1. Quién es el responsable de sus datos', <>
    <ul><li><b>Responsable:</b> {ORG}.</li><li><b>Domicilio y dirección:</b> [dirección].</li><li><b>Correo y teléfono:</b> {CONTACTO}.</li></ul>
    <p>MiDerecho es un servicio gratuito de información y plantillas para que usted mismo entienda sus derechos y haga documentos como el derecho de petición, la tutela o el reclamo de servicios públicos.</p></>],
  ['2. Para qué usamos sus datos', <>
    <p>Solo para esto:</p>
    <ol><li>Entender lo que le pasa y orientarle, con el asistente.</li><li>Armar el documento que usted pide.</li>
      <li>Llevar la cuenta del plazo en Mis casos y guardar sus consultas en Historial.</li>
      <li>Si usted lo pide {PRONTO}: enviar el documento por correo, recordarle el plazo por SMS, WhatsApp, llamada o aviso en el celular, o hablar con el asistente por voz. Cada una de estas funciones le pedirá un permiso aparte.</li></ol>
    <p>No vendemos ni prestamos sus datos, no los usamos para publicidad y no armamos perfiles de nadie.</p></>],
  ['3. Qué datos usamos, dónde quedan y cuánto tiempo', <ul>
    <li><b>Lo que le cuenta al asistente</b> (escrito o dictado): sale de su celular hacia nuestro servidor y hacia Claude, la inteligencia artificial de Anthropic, en Estados Unidos. Antes intentamos quitar cédulas, teléfonos y correos, pero el filtro no atrapa todo y no quita nombres: no los escriba en el chat. Nuestro servidor no lo guarda, y la conversación se borra del celular al cerrar la app. Anthropic puede conservarlo por un tiempo limitado, según sus condiciones.</li>
    <li><b>Su nombre, su cédula, dónde recibir la respuesta y su celular</b>, que se piden al crear el documento: solo están en la memoria del celular mientras arma el documento, y van impresos en el papel. No van a la inteligencia artificial ni al servidor, y no se guardan. También puede dejarlos en blanco y llenarlos a mano.</li>
    <li><b>Lo que escribe en el formulario del documento</b>, como lo que pasó o lo de su salud: va en el documento. La app no guarda ese texto.</li>
    <li><b>En este celular:</b> Mis casos (el tipo de documento, la entidad, el municipio y la vereda, lo que pidió, las fechas del plazo y en qué va), Historial (el tema de cada consulta, aunque sea de salud, el derecho, el documento sugerido, los pasos y a dónde acudir; las últimas 30) y sus preferencias (leer en voz alta, modo sin conexión). Se quedan hasta que usted los borre. Si otras personas usan su celular, póngale clave o bórrelos en Perfil.</li>
    <li><b>Si pide recordatorios</b> {PRONTO}: su número de celular se guarda cifrado en nuestro servidor (Upstash), con el código del caso, el canal y las fechas, y se borra 3 días después del último recordatorio. Para frenar abusos, una huella cifrada del número (no el número) dura hasta 370 días.</li>
    <li><b>Si pide que enviemos el documento por correo</b> {PRONTO}: el documento, con su nombre y su cédula, pasa por nuestro servidor y por Resend, en Estados Unidos, hasta la entidad. No guardamos copia.</li>
    <li><b>Registros técnicos:</b> si algo falla, el servidor anota el tipo de error, sin lo que usted escribió. El servicio que aloja la app ve la dirección de internet (IP) de su celular, como cualquier página web.</li></ul>],
  ['4. Lo que no guardamos', <>
    <ul><li>La conversación con el asistente.</li><li>Su nombre, su cédula, su celular ni su dirección.</li><li>Su voz.</li><li>Listas de usuarios o de contactos.</li></ul>
    <p>Ojo: Mis casos y el Historial sí pueden mostrar el tema de su caso, incluso si es de salud (punto 3).</p>
    <p>Si guarda o imprime el documento en PDF, ese archivo es suyo y queda donde lo guarde: cuídelo.</p></>],
  ['5. Otras empresas y otros países', <>
    <p>Para algunas funciones usamos empresas que tratan datos por encargo nuestro. Varias están en Estados Unidos:</p>
    <ul><li><b>Asistente:</b> Claude, de Anthropic (Estados Unidos). Recibe lo que usted le cuenta, después del filtro.</li>
      <li><b>Dictar con el micrófono:</b> el servicio de dictado de su navegador (en Android, Google). Recibe su voz mientras dicta.</li>
      <li><b>Alojamiento de la app y del servidor:</b> Vercel (Estados Unidos). Recibe la dirección IP y lo que pasa por el servidor.</li></ul>
    <p>Solo cuando usted lo pida {PRONTO}:</p>
    <ul><li><b>Asistente de voz:</b> ElevenLabs (Estados Unidos) y el modelo Gemini, de Google. Reciben su voz y lo que diga.</li>
      <li><b>SMS, WhatsApp y llamadas:</b> Twilio (Estados Unidos); WhatsApp es de Meta. Reciben su número, el código del caso, la fecha y un texto fijo.</li>
      <li><b>Envío del documento por correo:</b> Resend (Estados Unidos). Recibe el documento completo, con su nombre y su cédula, y el correo de la entidad.</li>
      <li><b>Avisos en el celular:</b> el servicio de avisos de su navegador (Google, Apple o Mozilla), si usted da permiso. Recibe el código del caso, la fecha y un texto fijo.</li>
      <li><b>Recordatorios guardados:</b> Upstash. Recibe su número cifrado, el código del caso, el canal y las fechas.</li></ul>
    <p>Estas empresas solo deben usar sus datos para prestar ese servicio.</p></>],
  ['6. Datos delicados (sensibles) y datos de niños', <>
    <p>La ley llama <b>datos sensibles</b> a los de salud, origen étnico, religión, ideas políticas, pertenencia a sindicatos u organizaciones sociales o de derechos humanos, vida sexual y los biométricos (como la huella o la cara). También tratamos con ese cuidado si usted es víctima.</p>
    <ul><li>Contarnos esos temas es <b>opcional</b>: no tiene que hacerlo y la app funciona igual.</li>
      <li>En la tutela de salud sí hay que contar el problema de salud: va en el documento. En Mis casos queda que es una tutela de salud y a qué EPS va.</li>
      <li>Si le cuenta al asistente algo de su salud, le llega a Claude después del filtro. No guardamos la conversación, pero el tema de la consulta puede quedar en el Historial.</li>
      <li>No usamos su voz para reconocerle ni para identificar a nadie.</li>
      <li>Si el caso es de un niño, niña o adolescente, la persona adulta escribe sus datos solo en el documento, y la app no los guarda.</li></ul></>],
  ['7. Sus derechos', <>
    <p>Sobre sus datos, usted tiene derecho a:</p>
    <ul><li><b>Conocer</b> qué datos suyos tenemos y cómo los usamos.</li><li><b>Corregir</b> o actualizar sus datos.</li>
      <li><b>Borrar</b> sus datos, cuando no haya un deber legal de conservarlos.</li><li><b>Retirar su autorización</b> (revocarla) en cualquier momento.</li>
      <li><b>Pedir prueba</b> de la autorización que nos dio.</li>
      <li><b>Quejarse ante la Superintendencia de Industria y Comercio (SIC)</b>, la entidad del Estado que vigila que se cuiden los datos personales, si no respetamos sus derechos.</li></ul>
    <p>Todo esto es gratis.</p></>],
  ['8. Cómo ejercer sus derechos', <>
    <p><b>En su celular, de inmediato:</b></p>
    <ul><li>En <b>Perfil</b>, toque <b>«Borrar todo de este celular»</b>: se borran sus casos, su historial y sus preferencias. Eso borra lo que hay en este celular, no lo que tengan otras empresas.</li>
      <li>En <b>Historial</b> puede borrar sus consultas, y en <b>Mis casos</b>, cada caso.</li></ul>
    <p><b>Escribiéndonos a {CONTACTO}:</b> cuéntenos qué quiere (conocer, corregir, borrar, retirar la autorización o reclamar). Si es sobre recordatorios, dé el código del caso y el número de celular. No necesita mandar su cédula.</p>
    <ul><li><b>Consultas</b> (conocer sus datos): le respondemos en máximo 10 días hábiles. Si no alcanzamos, le avisamos y respondemos en máximo 5 días hábiles más.</li>
      <li><b>Reclamos</b> (corregir, borrar, retirar la autorización o quejarse de un incumplimiento): le respondemos en máximo 15 días hábiles. Si no alcanzamos, le avisamos y respondemos en máximo 8 días hábiles más. Si falta información, se la pedimos dentro de los 5 días siguientes; si pasan 2 meses sin que la envíe, entendemos que desistió.</li>
      <li><b>Días hábiles</b> son los de lunes a viernes, sin contar festivos.</li></ul>
    <p><b>Ante la SIC:</b> si no le respondimos o no está de acuerdo, puede quejarse ante la Superintendencia de Industria y Comercio, en www.sic.gov.co. Primero debe hacer la consulta o el reclamo ante nosotros.</p></>],
  ['9. Quién atiende sus peticiones', <p>El [área de protección de datos] de {ORG}, en {CONTACTO}. Atiende consultas, reclamos y pedidos para conocer, corregir o borrar sus datos y para retirar la autorización.</p>],
  ['10. Cómo cuidamos sus datos', <ul>
    <li>Antes de que su relato llegue a la inteligencia artificial, intentamos quitar cédulas, teléfonos y correos en el celular y otra vez en el servidor. El filtro no atrapa todo y no quita nombres.</li>
    <li>El servidor no guarda conversaciones, nombres ni cédulas.</li><li>La conexión con el servidor va cifrada (HTTPS).</li>
    <li>Lo que queda en este celular se puede proteger: póngale clave o bórrelo en Perfil.</li>
    <li>Para leer en voz alta usamos, si las hay, las voces del propio celular, que no mandan el texto a internet.</li>
    <li>Los SMS no van cifrados: por eso solo llevarán el código del caso y la fecha.</li>
    <li>No podemos borrar los mensajes que ya le llegaron ni evitar capturas de pantalla. Bórrelos usted si comparte el celular.</li>
    <li><b>Nunca le pediremos su cédula</b> por WhatsApp, SMS o llamada. Si alguien se la pide a nombre de MiDerecho, no la dé.</li></ul>],
  ['11. Si hay peligro', <>
    <p>Si usted cuenta que alguien está en peligro o que le han amenazado, la app deja de preguntar, no guarda nada y le muestra a dónde acudir. Cuando reconoce palabras de amenaza, ese mensaje no se envía a la inteligencia artificial.</p>
    <ul><li>Si hay peligro ahora, llame al <b>123</b>.</li><li>La <b>Personería</b> de su municipio o la <b>Defensoría del Pueblo</b> pueden activar rutas de protección.</li>
      <li><b>Programa Somos Defensores</b>: proteccion@somosdefensores.org.</li></ul></>],
  ['12. No somos abogados', <p>MiDerecho da información general y plantillas. No somos abogados ni reemplazamos a uno, y no prometemos resultados. Para un consejo sobre su caso, la Personería y los consultorios jurídicos de las universidades atienden gratis.</p>],
  ['13. Vigencia y cambios', <p>Versión 1, vigente desde el {VIGENCIA}, mientras MiDerecho funcione. Sus datos se guardan solo el tiempo que dice el punto 3. Si cambiamos esta política, le avisaremos en la app antes de que el cambio empiece a regir.</p>],
];

function Completa() {
  const { leyendo, leer, parar } = useLeer();
  const caja = useRef(null);
  const textoAbierto = () => {
    const abiertos = [...caja.current.querySelectorAll('details[open]')];
    return abiertos.length ? abiertos.map(d => d.innerText).join('. ')
      : 'Política de datos. Toque un título para abrirlo. Los títulos son: ' + SECCIONES.map(s => s[0]).join('. ');
  };
  return (
    <main className="pantalla pc">
      <Encabezado />
      <Titulo icono={ShieldCheck}>Política de datos</Titulo>
      <Borrador />
      <p className="texto"><b>Versión 1</b>, vigente desde el {VIGENCIA}. Ley 1581 de 2012 y Decreto 1377 de 2013.</p>
      <p className="suave">Toque cada título para abrirlo. Con «Escuchar» la app le lee lo que tenga abierto.</p>
      <div className="pc-arriba"><BotonEscuchar leyendo={leyendo} onClick={() => (leyendo ? parar() : leer(textoAbierto()))} /><Salir /></div>
      <div ref={caja} className="pc-politica">
        {SECCIONES.map(([t, c]) => <details key={t} className="tarjeta clara"><summary>{t}</summary><div className="texto">{c}</div></details>)}
      </div>
      <button className="btn-secundario" onClick={() => ir('politica')}><ShieldCheck size={20} aria-hidden /> Ver la historieta</button>
    </main>
  );
}
