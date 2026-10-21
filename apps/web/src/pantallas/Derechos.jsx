import { BookOpen, ChevronRight } from 'lucide-react';
import { DERECHOS_INFO } from '@miderecho/nucleo/derechos';
import { Encabezado, Titulo, ICONOS_DERECHO } from '../componentes/comunes.jsx';
import { ir } from '../lib/ruta.js';

const LECTURA = 'Conoce tus derechos. Aprende qué derechos tienes, cómo reconocer cuándo pueden vulnerarlos y qué puedes hacer. Temas: ' + DERECHOS_INFO.map(d => d.menu).join(', ') + '.';

// "Derechos con Internet" y "Derechos Sin Internet" del Figma son la misma pantalla: todo funciona sin conexión.
export default function Derechos() {
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura={LECTURA}>Conoce tus derechos</Titulo>
      <p className="texto">Aprende qué derechos tienes, cómo reconocer cuándo pueden vulnerar y qué puedes hacer</p>

      <section className="tarjeta oliva">
        <BookOpen size={20} strokeWidth={1.6} aria-hidden />
        <h2>Aprende desde cero</h2>
        <p className="suave">Te explicamos tus derechos con palabras sencillas, ejemplos e historietas</p>
      </section>

      <section className="tarjeta clara lista-temas">
        <h2>Qué tema quieres conocer?</h2>
        <ul>
          {DERECHOS_INFO.map(d => {
            const Icono = ICONOS_DERECHO[d.icono];
            return (
              <li key={d.id}>
                <button onClick={() => ir('derechos', d.id)}>
                  <Icono className="tema-icono" size={30} strokeWidth={2} aria-hidden />
                  <span className="tema-texto"><b>{d.menu}</b><small>{d.sub}</small></span>
                  <ChevronRight size={20} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
