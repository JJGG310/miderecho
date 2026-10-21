import { lazy, Suspense, useEffect, useState } from 'react';
import { ProveedorConexion } from './lib/conexion.jsx';
import { useRuta, memoria } from './lib/ruta.js';
import { almacen, useAbierta } from './lib/almacen.js';
import { BarraNav } from './componentes/comunes.jsx';
import Inicio from './pantallas/Inicio.jsx';
import Derechos from './pantallas/Derechos.jsx';
import Derecho from './pantallas/Derecho.jsx';
import Asistente from './pantallas/Asistente.jsx';
import Documento from './pantallas/Documento.jsx';
import MisCasos from './pantallas/MisCasos.jsx';
import Historial from './pantallas/Historial.jsx';
import Perfil from './pantallas/Perfil.jsx';
import Carta from './pantallas/Carta.jsx';
import Clave from './pantallas/Clave.jsx';
import Peligro, { PreguntaPeligro } from './pantallas/Peligro.jsx';
import Consentimiento, { consintio } from './pantallas/Consentimiento.jsx';
// La política de datos se descarga solo cuando se abre (el service worker igual la guarda para usarla sin internet).
const Politica = lazy(() => import('./pantallas/Politica.jsx'));

// Documentos nuevos: antes de empezar se pregunta si hay alguien en peligro.
const NUEVOS = ['peticion', 'servicios_publicos', 'tutela_salud', 'tutela'];

function Pantallas({ p, a }) {
  const abierta = useAbierta();   // Mis casos e Historial solo se ven con la clave
  const [, seguir] = useState(0);
  const preguntar = !memoria.sinPeligro && (p === 'asistente' || (p === 'documento' && NUEVOS.includes(a)));
  if (preguntar) return <PreguntaPeligro alSeguir={() => seguir(n => n + 1)} />;
  // Antes de mandar algo a la inteligencia artificial, el aviso y la autorización (una vez por conversación).
  if (p === 'asistente' && !consintio()) return <Consentimiento alAceptar={() => seguir(n => n + 1)} />;
  switch (p) {
    case 'derechos': return a ? <Derecho id={a} /> : <Derechos />;
    case 'asistente': return <Asistente />;
    case 'documento': return <Documento tipo={a} key={a || 'menu'} />;
    case 'casos': return abierta ? <MisCasos /> : <Clave />;
    case 'historial': return abierta ? <Historial id={a} key={a || 'lista'} /> : <Clave />;
    case 'perfil': return <Perfil />;
    case 'peligro': return <Peligro />;
    case 'carta': return <Carta paso={a} />;
    case 'politica': return <Suspense fallback={<p className="pantalla texto">Cargando la política de datos…</p>}><Politica completa={a === 'completa'} key={a || 'historieta'} /></Suspense>;
    default: return <Inicio />;
  }
}

export default function App() {
  const [p, a] = useRuta();
  // Celular compartido: al salir de la app (otra app, pantalla apagada) se bloquean los casos y el historial.
  useEffect(() => {
    const salir = () => { if (document.hidden) almacen.bloquear(); };
    document.addEventListener('visibilitychange', salir);
    return () => document.removeEventListener('visibilitychange', salir);
  }, []);
  return (
    <ProveedorConexion>
      <div className="marco">
        <Pantallas p={p} a={a} />
        {/* La historieta de la política trae su propia barra (Anterior / Siguiente). */}
        {p !== 'politica' && <BarraNav actual={p} />}
      </div>
    </ProveedorConexion>
  );
}
