import { ArrowLeft, Volume2, VolumeX, House, FolderClock, History, User, FileMinus, BookOpen, HeartPulse, BriefcaseBusiness, Landmark, Users, ShieldCheck, Lightbulb } from 'lucide-react';
import { useConexion } from '../lib/conexion.jsx';
import { useLectura } from '../lib/voz.js';
import { ir, atras } from '../lib/ruta.js';

export const ICONOS_DERECHO = { salud: HeartPulse, trabajo: BriefcaseBusiness, vivienda: House, peticion: Landmark, igualdad: Users, otros: ShieldCheck };

// Logo + interruptor de conexión (Figma: "image 2" y "Switch").
export function Encabezado() {
  const { enLinea, red, alternar } = useConexion();
  return (
    <header className="encabezado">
      <button className="logo" onClick={() => ir('inicio')} aria-label="MiDerecho, ir al inicio">
        <img src="figma/logo.png" alt="MiDerecho" width="123" height="26" />
      </button>
      <button
        className={`interruptor ${enLinea ? 'on' : ''}`}
        role="switch"
        aria-checked={enLinea}
        aria-label={enLinea ? 'Con conexión. Tocar para usar sin conexión' : red ? 'Sin conexión (modo demo). Tocar para conectar' : 'Sin conexión'}
        onClick={alternar}
      ><span /></button>
    </header>
  );
}

export function BotonVoz({ texto, className = '' }) {
  const { leyendo, alternar } = useLectura();
  const Icono = leyendo ? VolumeX : Volume2;
  return (
    <button className={`btn-voz ${className}`} onClick={() => alternar(typeof texto === 'function' ? texto() : texto)} aria-label={leyendo ? 'Parar la lectura' : 'Escuchar'}>
      <Icono size={16} />
    </button>
  );
}

// Título de pantalla: flecha atrás, ícono opcional, título y bocina.
export function Titulo({ children, icono: Icono, volver = true, lectura }) {
  return (
    <div className="titulo">
      {volver && <button className="btn-atras" onClick={atras} aria-label="Volver"><ArrowLeft size={24} strokeWidth={2.5} /></button>}
      {Icono && <Icono className="titulo-icono" size={24} strokeWidth={2.2} aria-hidden />}
      <h1>{children}</h1>
      {lectura && <BotonVoz texto={lectura} />}
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

// "Prefieres elegir una opción?" — Crear un documento / Conocer mis derechos.
export function OpcionesRapidas() {
  const { enLinea } = useConexion();
  return (
    <div className="opciones-rapidas">
      <button className="tarjeta opcion" disabled={!enLinea} onClick={() => ir('documento')}>
        <span className="opcion-cabeza"><FileMinus size={24} aria-hidden />{!enLinea && <span className="insignia">Deshabilitada</span>}</span>
        <b>Crear un documento</b>
        <small>Peticiones y otros escritos</small>
      </button>
      <button className="tarjeta opcion" onClick={() => ir('derechos')}>
        <span className="opcion-cabeza"><BookOpen size={24} aria-hidden /></span>
        <b>Conocer mis derechos</b>
        <small>Explicaciones sencillas</small>
      </button>
    </div>
  );
}

export function DichoDeOtraForma({ children, titulo = 'Dicho de otra forma' }) {
  return (
    <section className="tarjeta oliva">
      <Lightbulb size={20} strokeWidth={1.6} aria-hidden />
      <h2>{titulo}</h2>
      <p className="suave">{children}</p>
    </section>
  );
}

export function Normas({ children, fuente }) {
  return (
    <section className="tarjeta tierra">
      <h2>Normas para consultar</h2>
      <p className="suave">{children}</p>
      {fuente && <p className="suave">Fuente oficial: <a href={fuente.url} target="_blank" rel="noreferrer">{fuente.texto}</a></p>}
    </section>
  );
}
