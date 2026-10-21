import { CARTA, CARTA_PREGUNTAS, AVISO_ANT, CONCILIACION } from '@miderecho/nucleo';
import { Encabezado, Titulo } from '../componentes/comunes.jsx';
import Buho from '../componentes/Buho.jsx';
import { ir, memoria } from '../lib/ruta.js';

// Ruta "¿Su carta venta lo hace dueño?" (investigacion/09): hasta tres preguntas y una orientación con datos.
// No arma un contrato ni guarda nada. Si aplica, lleva al derecho de petición a la Agencia Nacional de Tierras.
// Cada paso tiene su dirección (#/carta/folio), así el Atrás del celular vuelve a la pregunta anterior.
const TITULO = '¿Su carta venta lo hace dueño?';
const NUMERO = { papel: 1, folio: 2, tiempo: 3 };

export default function Carta({ paso = 'papel' }) {
  if (Object.hasOwn(CARTA, paso)) return <Resultado fin={CARTA[paso]} />;
  const id = Object.hasOwn(CARTA_PREGUNTAS, paso) ? paso : 'papel';
  const { pregunta, ayuda, opciones } = CARTA_PREGUNTAS[id];
  return (
    <main className="pantalla">
      <Encabezado />
      <p className="paso">Pregunta {NUMERO[id]} de 3</p>
      <Titulo lectura={[TITULO, pregunta, ayuda, 'Opciones: ' + opciones.map(o => o[1]).join('. '), id === 'papel' && AVISO_ANT].filter(Boolean).join(' ')}>{TITULO}</Titulo>
      <Buho pose="pensando" ancho={64} primera>{pregunta}</Buho>
      {ayuda && <p className="texto">{ayuda}</p>}
      <div className="opciones-lista">
        {opciones.map(([icono, texto, destino, sub]) => (
          <button key={texto} onClick={() => ir('carta', destino)}>
            <span className="emoji" aria-hidden>{icono}</span>
            <span><b>{texto}</b>{sub && <small>{sub}</small>}</span>
          </button>
        ))}
      </div>
      {id === 'papel' && <p className="nota-privacidad">{AVISO_ANT}</p>}
    </main>
  );
}

function Resultado({ fin: [titulo, texto, ant] }) {
  // Lleva al derecho de petición con el tema Tierras ya elegido (dirigido a la ANT).
  const pedir = () => { memoria.orientacion = { documento: 'peticion', datos: { temaId: 'tierras' } }; ir('documento', 'peticion'); };
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura={[titulo, texto, ant && AVISO_ANT, CONCILIACION].filter(Boolean).join(' ')}>{titulo}</Titulo>
      <Buho pose="ley" ancho={64} primera>{texto}</Buho>
      {ant && <>
        <p className="nota-privacidad">{AVISO_ANT}</p>
        <button className="btn-primario" onClick={pedir}>Pedirle a la ANT que inicie mi formalización</button>
      </>}
      <p className="texto">{CONCILIACION}</p>
      <button className="btn-secundario" onClick={() => ir('carta')}>Volver a empezar</button>
      <p className="nota-modo">Es información general, no asesoría de abogado. Un consultorio jurídico o la Personería pueden revisar su caso gratis.</p>
    </main>
  );
}
