import { FilePen, BookOpen, MapPin, TriangleAlert } from 'lucide-react';
import { derechoInfo } from '@miderecho/nucleo/derechos';
import { DichoDeOtraForma, LeyDesplegable, BotonVoz } from './comunes.jsx';
import { ir, memoria } from '../lib/ruta.js';

// Resultado del asistente. Orden: lo que entendimos → dicho de otra forma → pasos y documento → a dónde acudir → la ley (plegada).
// "Qué dice la ley" y las normas vienen de contenido fijo (o.ley), no de la IA.
export default function Orientacion({ o, guardada = false }) {
  const d = derechoInfo(o.derecho);
  const lectura = [o.tema, o.resumen, 'Pasos a seguir:', ...(o.pasos || [])].filter(Boolean).join('. ');
  const hayDocumento = o.documento && o.documento !== 'ninguno';
  // Desde el historial no hay datos del relato: el formulario empieza vacío.
  const crear = () => { memoria.orientacion = guardada ? null : o; ir('documento', o.documento); };

  return (
    <div className="orientacion">
      <section className="tarjeta clara">
        <div className="fila-titulo"><h2>{o.tema}</h2><BotonVoz texto={lectura} /></div>
        {o.resumen && <p className="texto">{o.resumen}</p>}
      </section>

      {o.dicho_de_otra_forma && <DichoDeOtraForma titulo="Qué significa para usted">{o.dicho_de_otra_forma}</DichoDeOtraForma>}

      <section className="tarjeta clara">
        <div className="fila-titulo"><h2>Pasos a seguir</h2><BotonVoz texto={['Pasos a seguir', ...(o.pasos || [])].join('. ')} /></div>
        <ol className="pasos">{o.pasos?.map((p, i) => <li key={i}>{p}</li>)}</ol>
        {o.silencio && <p className="texto">{o.silencio}</p>}
      </section>
      {hayDocumento && <button className="btn-primario" onClick={crear}><FilePen size={22} aria-hidden /> Crear el documento: {o.documento_titulo}</button>}

      {o.donde_acudir?.length > 0 && (
        <section className="tarjeta clara">
          <h2><MapPin size={20} aria-hidden /> A dónde puede acudir</h2>
          <ul className="lista-simple">{o.donde_acudir.map(x => <li key={x}>{x}</li>)}</ul>
        </section>
      )}

      {o.buscar_abogado_si && (
        <section className="tarjeta tierra">
          <h2><TriangleAlert size={20} aria-hidden /> Cuándo buscar ayuda profesional</h2>
          <p className="texto">{o.buscar_abogado_si} Los consultorios jurídicos de las universidades y la Personería orientan gratis.</p>
        </section>
      )}

      {(o.ley || o.posible_vulneracion) && (
        <LeyDesplegable texto={o.ley?.texto} normas={o.ley?.normas} fuente={o.ley?.fuente}>
          {o.posible_vulneracion && <p className="texto"><b>Qué derecho podría estar en juego:</b> {o.posible_vulneracion}</p>}
        </LeyDesplegable>
      )}

      {d && (
        <button className="tarjeta cta" onClick={() => ir('derechos', d.id)}>
          <BookOpen size={24} aria-hidden />
          <span><b>Aprenda más: {d.menu}</b><small>Con historieta. Funciona sin internet</small></span>
        </button>
      )}
      <p className="nota-modo">{o.aviso || 'Esto es información general, no consejo de abogado.'}</p>
    </div>
  );
}
