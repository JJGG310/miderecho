import { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Encabezado, BarraNav, BotonVoz, ICONOS_DERECHO } from '../componentes/comunes.jsx';
import Orientacion from '../componentes/Orientacion.jsx';
import { almacen } from '../lib/almacen.js';

// Búsquedas guardadas: se pueden consultar sin internet. Solo el tema y la ruta, nunca el relato.
export default function Historial() {
  const [items, setItems] = useState(almacen.historial);
  const [abierto, setAbierto] = useState(null);

  if (abierto) return (
    <main className="pantalla">
      <Encabezado />
      <div className="titulo"><button className="btn-atras" onClick={() => setAbierto(null)} aria-label="Volver">←</button><h1>Búsqueda guardada</h1></div>
      <Orientacion o={abierto} guardada />
    </main>
  );

  return (
    <main className="pantalla con-nav">
      <Encabezado />
      <div className="titulo sin-atras"><h1>Historial</h1><BotonVoz texto={'Historial. ' + (items.map(i => i.tema).join('. ') || 'Aún no tienes búsquedas guardadas.')} /></div>
      <p className="texto">Tus búsquedas guardadas. Puedes verlas sin internet.</p>
      {items.length === 0 ? (
        <div className="vacio"><h2>Aún no hay búsquedas</h2><p className="texto">Cuando el asistente te oriente, la ruta queda guardada aquí. No guardamos lo que nos contaste.</p></div>
      ) : (
        <section className="tarjeta clara lista-temas">
          <ul>
            {items.map(i => {
              const Icono = ICONOS_DERECHO[i.derecho] || ICONOS_DERECHO.otros;
              return (
                <li key={i.id}><button onClick={() => setAbierto(i)}>
                  <Icono className="tema-icono" size={28} aria-hidden />
                  <span className="tema-texto"><b>{i.tema}</b><small>{new Date(i.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}{i.documento_titulo ? ` · ${i.documento_titulo}` : ''}</small></span>
                  <ChevronRight size={20} aria-hidden />
                </button></li>
              );
            })}
          </ul>
        </section>
      )}
      {items.length > 0 && <button className="btn-secundario" onClick={() => { almacen.borrarHistorial(); setItems([]); }}><Trash2 size={16} aria-hidden /> Borrar historial</button>}
      <BarraNav actual="historial" />
    </main>
  );
}
