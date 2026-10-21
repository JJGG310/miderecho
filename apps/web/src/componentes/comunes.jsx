import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, House, FolderClock, History, User, FileMinus, BookOpen, HeartPulse, BriefcaseBusiness, Landmark, Users, ShieldCheck, Lightbulb, Lock, Wifi, WifiOff, Sprout } from 'lucide-react';
import { iso, deIso } from '@miderecho/nucleo';
import { useConexion, useEnvios, DEMO } from '../lib/conexion.jsx';
import { cerrarMensajeEnvios } from '../lib/cola.js';
import { useLectura } from '../lib/voz.js';
import { almacen, useAbierta } from '../lib/almacen.js';
import { ir, atras, olvidar } from '../lib/ruta.js';
import Buho from './Buho.jsx';

export const ICONOS_DERECHO = { salud: HeartPulse, trabajo: BriefcaseBusiness, vivienda: House, peticion: Landmark, igualdad: Users, otros: ShieldCheck, servicios: Lightbulb, tierras: Sprout };

// Logo del Figma en SVG (nítido en cualquier pantalla). La hoja hace de punto de la "i".
function Logo() {
  return (
    <svg className="logo-svg" viewBox="0 0 124 28" role="img" aria-label="MiDerecho">
      <text x="0" y="25" fill="#667757" textLength="28" lengthAdjust="spacingAndGlyphs">Mı</text>
      <path d="M22.5 10.5c-.5-4.5 2-8.3 6.8-9.5.6 4.6-2 8.4-6.8 9.5z" fill="#c6a16d" />
      <text x="31" y="25" fill="#1a3a27" textLength="93" lengthAdjust="spacingAndGlyphs">Derecho</text>
    </svg>
  );
}

// Logo, "Con internet" o "Sin internet" (y cuántos envíos esperan señal), ayuda si hay peligro y Bloquear (si la clave está puesta).
export function Encabezado() {
  const { enLinea, forzado, alternar } = useConexion();
  const { pendientes, mensaje } = useEnvios();
  const abierta = useAbierta();
  const bloquear = () => { almacen.bloquear(); olvidar(); ir('inicio'); };
  return (<>
    <header className="encabezado">
      <button className="logo" onClick={() => ir('inicio')} aria-label="MiDerecho, ir al inicio"><Logo /></button>
      <div className="encabezado-acciones">
        <span className={`chip-estado ${enLinea ? 'con' : ''}`} role="status">
          {enLinea ? <Wifi size={18} aria-hidden /> : <WifiOff size={18} aria-hidden />} {enLinea ? 'Con internet' : 'Sin internet'}
          {pendientes > 0 && ` · ${pendientes} por enviar`}
        </span>
        {DEMO && <button className="interruptor" role="switch" aria-checked={!forzado} onClick={alternar}>Demo: {forzado ? 'sin' : 'con'} internet</button>}
        <button className="btn-encabezado peligro" onClick={() => ir('peligro')}>¿En peligro?</button>
        {abierta && <button className="btn-encabezado" onClick={bloquear} aria-label="Bloquear con la clave"><Lock size={18} aria-hidden /><span className="solo-ancho">Bloquear</span></button>}
      </div>
    </header>
    {mensaje && <p className="aviso-envios" role="status">{mensaje} <button onClick={cerrarMensajeEnvios} aria-label="Cerrar el aviso">Listo</button></p>}
  </>);
}

// audio: claves de textos fijos (packages/nucleo/src/lectura.js) para oírlos con la voz de la asistente; si no, la del celular.
export function BotonVoz({ texto, audio, className = '' }) {
  const { leyendo, alternar } = useLectura();
  const Icono = leyendo ? VolumeX : Volume2;
  return (
    <button className={`btn-voz ${className}`} onClick={() => alternar(typeof texto === 'function' ? texto() : texto, audio)} aria-label={leyendo ? 'Parar la lectura' : 'Escuchar'}>
      <Icono size={22} aria-hidden />
    </button>
  );
}

// Título de pantalla: flecha atrás, ícono opcional, título y bocina.
export function Titulo({ children, icono: Icono, volver = true, alVolver, lectura, audio }) {
  return (
    <div className="titulo">
      {volver && <button className="btn-atras" onClick={alVolver || atras} aria-label="Volver"><ArrowLeft size={26} strokeWidth={2.5} aria-hidden /></button>}
      {Icono && <Icono className="titulo-icono" size={26} strokeWidth={2.2} aria-hidden />}
      <h1>{children}</h1>
      {lectura && <BotonVoz texto={lectura} audio={audio} />}
    </div>
  );
}

const NAV = [
  ['inicio', 'Inicio', House],
  ['casos', 'Mis casos', FolderClock],
  ['historial', 'Historial', History],
  ['perfil', 'Perfil', User],
];
export function BarraNav({ actual }) {
  return (
    <nav className="barra-nav" aria-label="Menú principal">
      {NAV.map(([id, txt, Icono]) => (
        <button key={id} className={actual === id ? 'activo' : ''} onClick={() => ir(id)} aria-current={actual === id ? 'page' : undefined}>
          <Icono size={28} strokeWidth={1.8} aria-hidden />
          <span>{txt}</span>
        </button>
      ))}
    </nav>
  );
}

// "¿Prefiere elegir una opción?" Los documentos se arman sin internet: las plantillas están en el celular.
export function OpcionesRapidas() {
  return (
    <div className="opciones-rapidas">
      <button className="tarjeta opcion" onClick={() => ir('documento')}>
        <FileMinus size={26} aria-hidden />
        <b>Crear un documento</b>
        <small>Gratis y sin abogado</small>
      </button>
      <button className="tarjeta opcion" onClick={() => ir('derechos')}>
        <BookOpen size={26} aria-hidden />
        <b>Conocer mis derechos</b>
        <small>Con historietas</small>
      </button>
    </div>
  );
}

export function DichoDeOtraForma({ children, titulo = 'Dicho de otra forma', audio }) {
  return (
    <section className="tarjeta oliva">
      <div className="fila-titulo"><h2><Lightbulb size={22} strokeWidth={1.8} aria-hidden /> {titulo}</h2><BotonVoz texto={`${titulo}. ${children}`} audio={audio} /></div>
      <p className="texto">{children}</p>
    </section>
  );
}

// La ley va al final y plegada: primero lo que la persona entiende y puede hacer.
export function LeyDesplegable({ texto, normas, fuente, children }) {
  return (
    <details className="desplegable">
      <summary><Buho pose="ley" ancho={40} /> Ver qué dice la ley</summary>
      {children}
      {texto && <p className="texto">{texto}</p>}
      {normas && <p className="texto"><b>Normas para consultar:</b> {normas}</p>}
      {fuente && <p className="texto"><a href={fuente.url} target="_blank" rel="noreferrer">{fuente.texto}</a> (necesita internet)</p>}
    </details>
  );
}

// Antes de borrar: la opción segura va primero y es la principal. Al cerrar, el foco vuelve al botón que la abrió.
// Si el navegador no tiene showModal, se muestra igual como capa fija (clase sin-modal).
export function Confirmar({ titulo, children, si = 'Sí, borrar', alSi, alNo }) {
  const ref = useRef(null);
  const [modal] = useState(() => typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype);
  const [antes] = useState(() => document.activeElement);   // el botón que la abrió
  useEffect(() => {
    if (modal && !ref.current?.open) ref.current?.showModal();
    ref.current?.querySelector('button')?.focus();   // "No, dejarlo"
    return () => antes?.focus?.();
  }, [modal, antes]);
  return (
    <dialog ref={ref} className={`confirmar${modal ? '' : ' sin-modal'}`} open={!modal || undefined} aria-modal="true" aria-labelledby="confirmar-titulo"
      onCancel={e => { e.preventDefault(); alNo(); }} onKeyDown={e => { if (!modal && e.key === 'Escape') alNo(); }}>
      <h2 id="confirmar-titulo">{titulo}</h2>
      {children && <p className="texto">{children}</p>}
      <button type="button" className="btn-primario" onClick={alNo}>No, dejarlo</button>
      <button type="button" className="btn-peligro" onClick={alSi}>{si}</button>
    </dialog>
  );
}

// Aviso corto que flota encima de la barra de abajo y se va solo.
export function Aviso({ children, alCerrar }) {
  const cerrar = useRef(alCerrar);
  cerrar.current = alCerrar;
  useEffect(() => { const t = setTimeout(() => cerrar.current(), 5000); return () => clearTimeout(t); }, []);
  return <p className="aviso-flotante" role="status">{children}</p>;
}

// Selector de fecha (hoy o antes). hoy: la fecha de "hoy" (en modo demo puede ir adelantada).
// Sin <form>: se usa dentro de otros formularios.
export function ElegirFecha({ etiqueta, boton = 'Guardar la fecha', hoy = new Date(), alGuardar }) {
  const max = iso(hoy);
  const [f, setF] = useState(max);
  return (
    <div className="elegir-fecha">
      <label className="campo"><span className="etiqueta">{etiqueta}</span><input type="date" value={f} max={max} onChange={e => setF(e.target.value)} /></label>
      <button className="btn-secundario" type="button" disabled={!f || f > max} onClick={() => alGuardar(deIso(f))}>{boton}</button>
    </div>
  );
}

// Fecha para leer: "lunes 3 de noviembre".
export const fechaLarga = s => deIso(s).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
