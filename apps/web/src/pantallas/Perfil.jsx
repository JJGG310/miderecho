import { useState } from 'react';
import { Trash2, ShieldCheck, Phone } from 'lucide-react';
import { AVISO, AYUDA_RIESGO } from '@miderecho/nucleo';
import { Encabezado, Confirmar, Aviso } from '../componentes/comunes.jsx';
import { almacen } from '../lib/almacen.js';
import { olvidar } from '../lib/ruta.js';

export default function Perfil() {
  const [modoVoz, setModoVoz] = useState(() => almacen.pref('modoVoz', false));
  const [confirmar, setConfirmar] = useState(false);
  const [borrado, setBorrado] = useState(false);
  return (
    <main className="pantalla">
      <Encabezado />
      <div className="titulo"><h1>Perfil</h1></div>
      <p className="texto">No necesita cuenta. Lo que guarda queda solo en este celular, protegido con su clave.</p>

      <section className="tarjeta clara">
        <label className="check grande"><input type="checkbox" checked={modoVoz} onChange={e => { setModoVoz(e.target.checked); almacen.setPref('modoVoz', e.target.checked); }} /> Leer en voz alta las respuestas del asistente</label>
      </section>

      <section className="tarjeta oliva">
        <h2><ShieldCheck size={22} aria-hidden /> Su privacidad</h2>
        <div className="texto aviso" dangerouslySetInnerHTML={{ __html: AVISO }} />
      </section>

      <section className="tarjeta riesgo ayuda-riesgo">
        <h2>Si está en peligro</h2>
        <a className="btn-peligro lleno" href="tel:123"><Phone size={22} aria-hidden /> Llamar al 123</a>
        <div className="texto" dangerouslySetInnerHTML={{ __html: AYUDA_RIESGO }} />
      </section>

      <button className="btn-peligro" onClick={() => setConfirmar(true)}><Trash2 size={20} aria-hidden /> Borrar todo de este celular</button>
      {confirmar && (
        <Confirmar titulo="¿Borrar todo de este celular?" si="Sí, borrar todo" alNo={() => setConfirmar(false)}
          alSi={() => { almacen.borrarTodo(); olvidar(); setConfirmar(false); setModoVoz(false); setBorrado(true); }}>
          Se borran sus casos, su historial, su clave y sus preferencias. No se puede deshacer.
        </Confirmar>
      )}
      {borrado && <Aviso alCerrar={() => setBorrado(false)}>Listo. Borramos sus casos, su historial, su clave y sus preferencias.</Aviso>}
    </main>
  );
}
