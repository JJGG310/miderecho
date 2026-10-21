import { MessageCircle, FilePen } from 'lucide-react';
import { derechoInfo } from '@miderecho/nucleo/derechos';
import { Encabezado, Titulo, DichoDeOtraForma, LeyDesplegable, BotonVoz, ICONOS_DERECHO } from '../componentes/comunes.jsx';
import { useConexion } from '../lib/conexion.jsx';
import { ir, memoria } from '../lib/ruta.js';

// Proporción de los cuadros (ancho, alto): reserva el espacio antes de que carguen. Los WebP están al doble (unos 370 px).
const TAM = { salud: [185, 229] };
const lecturaCuadro = (q, n) => [`Cuadro ${n}: ${q.titulo}.`, q.texto, ...(q.dice || []).map(([quien, t]) => `${quien}: ${t}`),
  q.lista && `${q.listaTitulo} ${q.lista.join(' ')}`, q.pasos && `Pasos que puede seguir: ${q.pasos.join(' ')}`].filter(Boolean).join(' ');

// Orden: historieta → dicho de otra forma → qué hacer → la ley (plegada).
export default function Derecho({ id }) {
  const d = derechoInfo(id);
  const { enLinea } = useConexion();
  if (!d) return <main className="pantalla"><Encabezado /><Titulo>No encontramos ese tema</Titulo></main>;
  const [ancho, alto] = TAM[d.id] || [185, 157];
  // Conversación nueva: vuelve a preguntar si hay peligro y a pedir la autorización de la IA.
  const contar = () => { Object.assign(memoria, { conversacion: [{ rol: 'persona', texto: d.consulta }], sinPeligro: false, consentimiento: null }); ir('asistente'); };
  const peticion = () => { memoria.orientacion = null; ir('documento', 'peticion'); };

  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo icono={ICONOS_DERECHO[d.icono]} lectura={`${d.titulo}. ${d.cuadros.map((q, i) => lecturaCuadro(q, i + 1)).join(' ')}`}>{d.titulo}</Titulo>

      <ol className="historieta" aria-label="Historieta">
        {d.cuadros.map((q, i) => (
          <li key={i}>
            <img src={`figma/comic-${d.id}-${i + 1}.webp`} alt="" width={ancho} height={alto} loading={i ? 'lazy' : 'eager'} />
            <div className="cuadro-texto">
              <div className="fila-titulo"><h2><span className="numero">{i + 1}</span> {q.titulo}</h2><BotonVoz texto={lecturaCuadro(q, i + 1)} /></div>
              <p className="texto">{q.texto}</p>
              {q.dice?.map(([quien, t]) => <p key={quien} className="texto dialogo"><b>{quien}:</b> «{t}»</p>)}
              {q.lista && <><p className="texto"><b>{q.listaTitulo}</b></p><ul className="lista-simple">{q.lista.map(x => <li key={x}>{x}</li>)}</ul></>}
              {q.pasos && <ol className="pasos">{q.pasos.map(x => <li key={x}>{x}</li>)}</ol>}
            </div>
          </li>
        ))}
      </ol>

      <DichoDeOtraForma>{d.dichoDeOtraForma}</DichoDeOtraForma>

      {enLinea
        ? <button className="btn-primario" onClick={contar}><MessageCircle size={22} aria-hidden /> ¿Le está pasando algo así? Cuéntenos</button>
        : <p className="nota-privacidad">Cuando tenga internet, puede contarnos su caso y le decimos qué hacer.</p>}
      {d.accion === 'peticion' && (
        <button className={enLinea ? 'btn-secundario' : 'btn-primario'} onClick={peticion}><FilePen size={20} aria-hidden /> Hacer un derecho de petición</button>
      )}

      <LeyDesplegable texto={d.queDiceLaLey} normas={d.normas} fuente={d.fuente}>
        <p className="texto">{d.descripcion}</p>
      </LeyDesplegable>
    </main>
  );
}
