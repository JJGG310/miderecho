import { ChevronRight } from 'lucide-react';
import { DERECHOS_INFO } from '@miderecho/nucleo/derechos';
import { LECTURA_DERECHOS } from '@miderecho/nucleo/lectura';
import { Encabezado, Titulo, ICONOS_DERECHO } from '../componentes/comunes.jsx';
import Buho from '../componentes/Buho.jsx';
import { ir } from '../lib/ruta.js';


// "Derechos con Internet" y "Derechos Sin Internet" del Figma son la misma pantalla: todo funciona sin conexión.
export default function Derechos() {
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura={LECTURA_DERECHOS} audio={['derechos']}>Conozca sus derechos</Titulo>
      <Buho pose="ley" primera>Con palabras sencillas y con historietas: qué derechos tiene, cómo darse cuenta de que no se los respetan y qué puede hacer. Funciona sin internet.</Buho>

      <section className="tarjeta clara lista-temas">
        <h2 className="subtitulo">¿Qué tema quiere conocer?</h2>
        <ul>
          {DERECHOS_INFO.map(d => {
            const Icono = ICONOS_DERECHO[d.icono];
            return (
              <li key={d.id}>
                <button onClick={() => ir('derechos', d.id)}>
                  <Icono className="tema-icono" size={30} strokeWidth={2} aria-hidden />
                  <span className="tema-texto"><b>{d.menu}</b><small>{d.sub}</small></span>
                  <ChevronRight size={22} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
