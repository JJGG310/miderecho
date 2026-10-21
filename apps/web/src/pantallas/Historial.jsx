import { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Encabezado, Titulo, BotonVoz, Confirmar, Aviso, ICONOS_DERECHO } from '../componentes/comunes.jsx';
import { derechoInfo } from '@miderecho/nucleo/derechos';
import Orientacion from '../componentes/Orientacion.jsx';
import { almacen } from '../lib/almacen.js';
import { ir } from '../lib/ruta.js';

// Del historial solo se guarda lo fijo (categoría, derecho, documento y ley); los pasos se arman con contenido fijo,
// nunca con el texto libre de la IA.
const PASOS_DOC = t => [`Haga el documento con la app: ${t}.`, 'Entréguelo y pida la copia con sello o el número de recibido.', 'Anote ese día en Mis casos: le decimos hasta cuándo deben responder y qué sigue.'];
const conFijo = i => {
  const d = derechoInfo(i.derecho);
  return { ...i, dicho_de_otra_forma: d?.dichoDeOtraForma, pasos: i.documento && i.documento !== 'ninguno' ? PASOS_DOC(i.documento_titulo) : d?.cuadros.at(-1).pasos };
};

// Búsquedas guardadas (cifradas con la clave): se pueden consultar sin internet. Nunca el relato.
// Cada una tiene su dirección (#/historial/<id>), así el Atrás del celular vuelve a la lista.
export default function Historial({ id }) {
  const [items, setItems] = useState(almacen.historial);
  const [confirmar, setConfirmar] = useState(false);
  const [borrado, setBorrado] = useState(false);

  if (id) {
    const item = items.find(i => i.id === id);
    return (
      <main className="pantalla">
        <Encabezado />
        <Titulo>Búsqueda guardada</Titulo>
        {item ? <Orientacion o={conFijo(item)} guardada /> : <p className="texto">Esta búsqueda ya no está guardada.</p>}
      </main>
    );
  }

  return (
    <main className="pantalla">
      <Encabezado />
      <div className="titulo"><h1>Historial</h1><BotonVoz texto={'Historial. ' + (items.map(i => i.tema).join('. ') || 'Aún no tiene búsquedas guardadas.')} /></div>
      <p className="texto">Sus búsquedas guardadas. Puede verlas sin internet.</p>
      {items.length === 0 ? (
        <div className="vacio"><h2>Aún no hay búsquedas</h2><p className="texto">Cuando el asistente le oriente, la ruta queda guardada aquí. No guardamos lo que nos contó.</p></div>
      ) : (
        <section className="tarjeta clara lista-temas">
          <ul>
            {items.map(i => {
              const Icono = ICONOS_DERECHO[i.derecho] || ICONOS_DERECHO.otros;
              return (
                <li key={i.id}><button onClick={() => ir('historial', i.id)}>
                  <Icono className="tema-icono" size={28} aria-hidden />
                  <span className="tema-texto"><b>{i.tema}</b><small>{new Date(i.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}{i.documento_titulo ? ` · ${i.documento_titulo}` : ''}</small></span>
                  <ChevronRight size={22} aria-hidden />
                </button></li>
              );
            })}
          </ul>
        </section>
      )}
      {items.length > 0 && <button className="btn-peligro" onClick={() => setConfirmar(true)}><Trash2 size={20} aria-hidden /> Borrar historial</button>}
      {confirmar && (
        <Confirmar titulo="¿Borrar todo el historial?" alNo={() => setConfirmar(false)}
          alSi={() => { almacen.borrarHistorial(); setItems([]); setConfirmar(false); setBorrado(true); }}>
          {items.length === 1 ? 'Se borra la búsqueda guardada' : `Se borran las ${items.length} búsquedas guardadas`} de este celular. No se puede deshacer.
        </Confirmar>
      )}
      {borrado && <Aviso alCerrar={() => setBorrado(false)}>Listo. Se borró el historial.</Aviso>}
    </main>
  );
}
