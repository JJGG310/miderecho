import { useEffect, useState } from 'react';
import { ProveedorConexion } from './lib/conexion.jsx';
import { useRuta } from './lib/ruta.js';
import Inicio from './pantallas/Inicio.jsx';
import Derechos from './pantallas/Derechos.jsx';
import Derecho from './pantallas/Derecho.jsx';
import Asistente from './pantallas/Asistente.jsx';
import Documento from './pantallas/Documento.jsx';
import MisCasos from './pantallas/MisCasos.jsx';
import Historial from './pantallas/Historial.jsx';
import Perfil from './pantallas/Perfil.jsx';
import Politica from './pantallas/Politica.jsx';

// Pantalla de carga del Figma ("Bandeja de Entrada App").
function Carga() {
  return (
    <main className="carga" aria-busy="true">
      <img src="figma/logo-splash.png" alt="MiDerecho" width="183" height="183" />
      <p>Tus derechos, explicados fácilmente</p>
      <div className="spinner" aria-hidden>{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--i': i }} />)}</div>
      <p className="suave-carga">Cargando tu espacio...</p>
    </main>
  );
}

function Pantallas() {
  const [p, a] = useRuta();
  switch (p) {
    case 'derechos': return a ? <Derecho id={a} /> : <Derechos />;
    case 'asistente': return <Asistente />;
    case 'documento': return <Documento tipo={a} key={a || 'menu'} />;
    case 'casos': return <MisCasos />;
    case 'historial': return <Historial />;
    case 'perfil': return <Perfil />;
    case 'politica': return <Politica completa={a === 'completa'} key={a || 'historieta'} />;
    default: return <Inicio />;
  }
}

export default function App() {
  const [cargando, setCargando] = useState(() => !sessionStorageGet('visto'));
  useEffect(() => {
    if (!cargando) return;
    const t = setTimeout(() => { setCargando(false); sessionStorageSet('visto', '1'); }, 1400);
    return () => clearTimeout(t);
  }, [cargando]);
  return <ProveedorConexion><div className="marco">{cargando ? <Carga /> : <Pantallas />}</div></ProveedorConexion>;
}

function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }
