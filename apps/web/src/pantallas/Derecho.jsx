import { MessageCircle } from 'lucide-react';
import { derechoInfo } from '@miderecho/nucleo/derechos';
import { Encabezado, Titulo, DichoDeOtraForma, Normas, ICONOS_DERECHO } from '../componentes/comunes.jsx';
import { useConexion } from '../lib/conexion.jsx';
import { ir } from '../lib/ruta.js';

export default function Derecho({ id }) {
  const d = derechoInfo(id);
  const { enLinea } = useConexion();
  if (!d) return <main className="pantalla"><Encabezado /><Titulo>No encontramos ese tema</Titulo></main>;
  const lectura = `${d.titulo}. ${d.descripcion} Dicho de otra forma: ${d.dichoDeOtraForma} ¿Qué dice la ley? ${d.queDiceLaLey} La historia: ${d.historia}`;

  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo icono={ICONOS_DERECHO[d.icono]} lectura={lectura}>{d.titulo}</Titulo>
      <p className="texto">{d.descripcion}</p>

      <DichoDeOtraForma>{d.dichoDeOtraForma}</DichoDeOtraForma>

      <section className="bloque-ley">
        <h2>Qué dice la ley?</h2>
        <p className="texto">{d.queDiceLaLey}</p>
      </section>

      <Normas fuente={d.fuente}>{d.normas}</Normas>

      <figure className="comic">
        <img src={d.comic} alt={`Historieta: ${d.historia}`} loading="lazy" />
      </figure>

      {enLinea && (
        <button className="tarjeta cta" onClick={() => ir('inicio')}>
          <MessageCircle size={22} aria-hidden />
          <span><b>¿Te está pasando algo así?</b><small>Cuéntanos y te decimos qué puedes hacer</small></span>
        </button>
      )}
    </main>
  );
}
