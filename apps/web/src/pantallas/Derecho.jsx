import { MessageCircle, FilePen, Sprout } from 'lucide-react';
import { derechoInfo } from '@miderecho/nucleo/derechos';
import { Encabezado, Titulo, DichoDeOtraForma, LeyDesplegable, BotonVoz, ICONOS_DERECHO } from '../componentes/comunes.jsx';
import { useConexion } from '../lib/conexion.jsx';
import { ir, memoria } from '../lib/ruta.js';
import Buho from '../componentes/Buho.jsx';

// Cada cuadro es una viñeta con texto real (nítido, se lee en voz alta y no gasta datos): el búho cuenta la escena
// y los personajes hablan en globos. La pose del búho va con el momento de la historia; [pose, ancho, alto] de public/buho/.
const POSES = [['lupa', 197, 255], ['pensando', 202, 253], ['ley', 198, 244], ['documento', 203, 246]];
// Botón de cada ficha: abre el documento o la ruta de la carta venta.
const ACCIONES = { peticion: ['Hacer un derecho de petición', FilePen], servicios_publicos: ['Hacer un reclamo a la empresa', FilePen], carta: ['¿Su carta venta lo hace dueño?', Sprout] };
const lecturaCuadro = (q, n) => [`Cuadro ${n}: ${q.titulo}.`, q.texto, ...(q.dice || []).map(([quien, t]) => `${quien}: ${t}`),
  q.lista && `${q.listaTitulo} ${q.lista.join(' ')}`, q.pasos && `Pasos que puede seguir: ${q.pasos.join(' ')}`].filter(Boolean).join(' ');

// Orden: historieta → dicho de otra forma → qué hacer → la ley (plegada).
export default function Derecho({ id }) {
  const d = derechoInfo(id);
  const { enLinea } = useConexion();
  if (!d) return <main className="pantalla"><Encabezado /><Titulo>No encontramos ese tema</Titulo></main>;
  const prota = d.cuadros?.[0].texto.split(' ')[0];   // "Ana se siente mal…": sus globos van a la derecha
  // Conversación nueva: vuelve a preguntar si hay peligro y a pedir la autorización de la IA.
  const contar = () => { Object.assign(memoria, { conversacion: [{ rol: 'persona', texto: d.consulta }], sinPeligro: false, consentimiento: null }); ir('asistente'); };
  const hacer = () => { memoria.orientacion = null; d.accion === 'carta' ? ir('carta') : ir('documento', d.accion); };
  const [txtAccion, IconoAccion] = ACCIONES[d.accion] || [];
  // La ruta de la carta venta funciona sin internet y es la respuesta principal de Tierras: va primero.
  const ruta = d.accion === 'carta';
  const accion = txtAccion && <button className={ruta ? 'btn-primario' : 'btn-secundario'} onClick={hacer}><IconoAccion size={20} aria-hidden /> {txtAccion}</button>;
  const lectura = d.cuadros ? d.cuadros.map((q, i) => lecturaCuadro(q, i + 1)).join(' ') : `${d.descripcion} Qué puede hacer: ${d.pasos.join(' ')}`;

  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo icono={ICONOS_DERECHO[d.icono]} lectura={`${d.titulo}. ${lectura}`}>{d.titulo}</Titulo>

      {/* Fichas sin historieta (todavía): la explicación y qué puede hacer. */}
      {!d.cuadros && (
        <section className="tarjeta clara">
          <div className="fila-titulo"><h2><Buho pose="ley" ancho={40} /> Qué puede hacer</h2><BotonVoz texto={`Qué puede hacer. ${d.pasos.join(' ')}`} /></div>
          <p className="texto">{d.descripcion}</p>
          <ol className="pasos">{d.pasos.map(x => <li key={x}>{x}</li>)}</ol>
        </section>
      )}
      {d.cuadros && <ol className="historieta" aria-label="Historieta">
        {d.cuadros.map((q, i) => {
          const [pose, w, h] = POSES[i];
          return (
            <li key={i} className="vineta">
              <div className="vineta-barra">
                <h2><span className="numero">{i + 1}</span> {q.titulo}</h2>
                <BotonVoz texto={lecturaCuadro(q, i + 1)} />
              </div>
              <div className="vineta-escena">
                <img src={`buho/${pose}.webp`} alt="" width={76} height={Math.round(76 * h / w)} loading={i ? 'lazy' : undefined} />
                <p className="globo-buho">{q.texto}</p>
              </div>
              {q.dice && <ul className="globos">{q.dice.map(([quien, t]) => (
                <li key={quien} className={`globo-persona${quien.startsWith(prota) ? ' prota' : ''}${quien.endsWith('piensa') ? ' piensa' : ''}`}><b>{quien}</b>{t}</li>
              ))}</ul>}
              {q.lista && <div className="vineta-lista"><b>{q.listaTitulo}</b><ul className="lista-simple">{q.lista.map(x => <li key={x}>{x}</li>)}</ul></div>}
              {q.pasos && <div className="vineta-lista"><b>Pasos que puede seguir:</b><ol className="pasos">{q.pasos.map(x => <li key={x}>{x}</li>)}</ol></div>}
            </li>
          );
        })}
      </ol>}

      <DichoDeOtraForma>{d.dichoDeOtraForma}</DichoDeOtraForma>

      {ruta && accion}
      <button className={ruta ? 'btn-secundario' : 'btn-primario'} onClick={contar}><MessageCircle size={22} aria-hidden /> ¿Le está pasando algo así? Cuéntenos</button>
      {!enLinea && <p className="nota-privacidad">Está sin internet: le responde el modo básico, sin inteligencia artificial.</p>}
      {!ruta && accion}

      <LeyDesplegable texto={d.queDiceLaLey} normas={d.normas} fuente={d.fuente}>
        {d.cuadros && <p className="texto">{d.descripcion}</p>}
      </LeyDesplegable>
    </main>
  );
}
