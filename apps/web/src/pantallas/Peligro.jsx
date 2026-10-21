import { Phone, ShieldAlert } from 'lucide-react';
import { AYUDA_RIESGO } from '@miderecho/nucleo';
import { Encabezado, Titulo } from '../componentes/comunes.jsx';
import { ir, memoria, olvidar } from '../lib/ruta.js';

const LECTURA = 'Si hay peligro ahora, llame al 1 2 3. La Personería de su municipio o la Defensoría del Pueblo pueden activar rutas de protección.';

// Acceso "¿En peligro?" del encabezado. Funciona sin internet; la llamada al 123 no necesita datos.
export default function Peligro() {
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo icono={ShieldAlert} lectura={LECTURA}>¿Está en peligro?</Titulo>
      <a className="btn-peligro lleno" href="tel:123"><Phone size={22} aria-hidden /> Llamar al 123</a>
      <section className="tarjeta riesgo ayuda-riesgo">
        <h2>A dónde acudir</h2>
        <div className="texto" dangerouslySetInnerHTML={{ __html: AYUDA_RIESGO }} />
      </section>
    </main>
  );
}

// "¿Hay alguien en peligro?" antes de empezar con el asistente o con un documento.
// Si hay peligro, no se pregunta nada más del caso y se descarta lo escrito.
export function PreguntaPeligro({ alSeguir }) {
  const peligro = () => { olvidar(); ir('peligro'); };
  const no = () => { memoria.sinPeligro = true; alSeguir(); };
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura="Antes de empezar. ¿Hay alguien en peligro ahora? Por ejemplo, amenazas, un grupo armado o violencia en la casa.">Antes de empezar</Titulo>
      <section className="tarjeta clara">
        <h2>¿Hay alguien en peligro ahora?</h2>
        <p className="texto">Por ejemplo: amenazas, un grupo armado o violencia en la casa.</p>
      </section>
      <button className="btn-primario" onClick={no}>No, nadie está en peligro</button>
      <button className="btn-peligro" onClick={peligro}>Sí, hay peligro</button>
      <button className="btn-secundario" onClick={peligro}>No sé</button>
    </main>
  );
}
