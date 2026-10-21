import { FilePen, BookOpen, Scale, MapPin, TriangleAlert } from 'lucide-react';
import { derechoInfo } from '@miderecho/nucleo/derechos';
import { DichoDeOtraForma, Normas, BotonVoz } from './comunes.jsx';
import { ir, memoria } from '../lib/ruta.js';

// Resultado del asistente, con la misma estructura de las fichas de derechos del Figma.
// "Qué dice la ley" y las normas vienen de contenido fijo (o.ley), no de la IA.
export default function Orientacion({ o, guardada = false }) {
  const d = derechoInfo(o.derecho);
  const lectura = [o.tema, o.resumen, o.dicho_de_otra_forma, 'Pasos a seguir:', ...(o.pasos || [])].filter(Boolean).join('. ');
  const crear = () => { memoria.orientacion = o; ir('documento', o.documento); };

  return (
    <div className="orientacion">
      <section className="tarjeta clara">
        <div className="fila-titulo"><h2>{o.tema}</h2><BotonVoz texto={lectura} /></div>
        {o.resumen && <p className="texto">{o.resumen}</p>}
      </section>

      {o.dicho_de_otra_forma && <DichoDeOtraForma titulo="Qué significa para ti">{o.dicho_de_otra_forma}</DichoDeOtraForma>}

      {o.posible_vulneracion && (
        <section className="bloque-ley">
          <h2><Scale size={18} aria-hidden /> Qué derecho podría estar en juego</h2>
          <p className="texto">{o.posible_vulneracion}</p>
        </section>
      )}

      {o.ley && (
        <>
          <section className="bloque-ley">
            <h2>Qué dice la ley?</h2>
            <p className="texto">{o.ley.texto}</p>
          </section>
          <Normas fuente={o.ley.fuente}>{o.ley.normas}</Normas>
        </>
      )}

      <section className="tarjeta clara">
        <h2>Pasos a seguir</h2>
        <ol className="pasos">{o.pasos?.map((p, i) => <li key={i}>{p}</li>)}</ol>
        {o.silencio && <p className="suave">{o.silencio}</p>}
      </section>

      {o.donde_acudir?.length > 0 && (
        <section className="tarjeta clara">
          <h2><MapPin size={18} aria-hidden /> A dónde puedes acudir</h2>
          <ul className="lista-simple">{o.donde_acudir.map(x => <li key={x}>{x}</li>)}</ul>
        </section>
      )}

      {o.buscar_abogado_si && (
        <section className="tarjeta tierra">
          <h2><TriangleAlert size={18} aria-hidden /> Cuándo buscar ayuda profesional</h2>
          <p className="suave">{o.buscar_abogado_si} Los consultorios jurídicos de las universidades y la Personería orientan gratis.</p>
        </section>
      )}

      {o.documento && o.documento !== 'ninguno' && !guardada && (
        <button className="btn-primario" onClick={crear}><FilePen size={20} aria-hidden /> Crear el documento: {o.documento_titulo}</button>
      )}
      {o.documento && o.documento !== 'ninguno' && guardada && (
        <button className="btn-primario" onClick={() => { memoria.orientacion = null; ir('documento', o.documento); }}><FilePen size={20} aria-hidden /> Crear: {o.documento_titulo}</button>
      )}
      {d && (
        <button className="tarjeta cta" onClick={() => ir('derechos', d.id)}>
          <BookOpen size={22} aria-hidden />
          <span><b>Aprende más: {d.menu}</b><small>Con historieta. Funciona sin internet</small></span>
        </button>
      )}
      <p className="nota-modo">{o.aviso || 'Esto es información general, no consejo de abogado.'}</p>
    </div>
  );
}
