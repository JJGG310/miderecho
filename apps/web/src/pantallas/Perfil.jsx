import { useState } from 'react';
import { Trash2, ShieldCheck } from 'lucide-react';
import { AVISO, AYUDA_RIESGO } from '@miderecho/nucleo';
import { Encabezado, BarraNav } from '../componentes/comunes.jsx';
import { almacen } from '../lib/almacen.js';
import { ir } from '../lib/ruta.js';
import { cancelarTodo } from '../lib/avisos.js';   // cancela también los recordatorios del servidor y la suscripción push

export default function Perfil() {
  const [modoVoz, setModoVoz] = useState(() => almacen.pref('modoVoz', false));
  const [borrado, setBorrado] = useState(false);
  return (
    <main className="pantalla con-nav">
      <Encabezado />
      <div className="titulo sin-atras"><h1>Perfil</h1></div>
      <p className="texto">No necesitas cuenta. Todo lo que guardas queda solo en este celular.</p>

      <section className="tarjeta clara">
        <label className="check grande"><input type="checkbox" checked={modoVoz} onChange={e => { setModoVoz(e.target.checked); almacen.setPref('modoVoz', e.target.checked); }} /> Leer en voz alta las respuestas del asistente</label>
      </section>

      <section className="tarjeta oliva">
        <ShieldCheck size={20} aria-hidden />
        <h2>Tu privacidad</h2>
        <div className="suave aviso" dangerouslySetInnerHTML={{ __html: AVISO }} />
        <button className="btn-secundario" onClick={() => ir('politica')}>Ver la política de datos en historieta</button>
      </section>

      <section className="tarjeta tierra">
        <h2>Si estás en peligro</h2>
        <div className="suave aviso" dangerouslySetInnerHTML={{ __html: AYUDA_RIESGO }} />
      </section>

      <button className="btn-peligro" onClick={() => { cancelarTodo(); almacen.borrarTodo(); setBorrado(true); setModoVoz(false); }}><Trash2 size={18} aria-hidden /> Borrar todo de este celular</button>
      {borrado && <p className="nota-privacidad" role="status">Listo. Borramos tus casos, tu historial y tus preferencias.</p>}
      <BarraNav actual="perfil" />
    </main>
  );
}
