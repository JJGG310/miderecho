import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Encabezado, Titulo, OpcionesRapidas } from '../componentes/comunes.jsx';
import { almacen } from '../lib/almacen.js';
import { memoria } from '../lib/ruta.js';

// Aviso antes del primer envío al asistente (Decreto 1377 de 2013, arts. 5 y 7: dato sensible, autorización previa).
// Se recuerda en el celular con la versión y la fecha; si cambia el texto, se sube la versión y se vuelve a preguntar.
const VERSION = 1;
export const consintio = () => almacen.pref('consentimiento')?.version === VERSION;

const PUNTOS = [
  'Lo que escriba va a una inteligencia artificial (Claude, de la empresa Anthropic, en Estados Unidos).',
  'Antes quitamos cédulas, teléfonos y correos. Aun así, no escriba nombres ni cédulas.',
  'Si habla de su salud, es un dato sensible. Contarlo es opcional.',
  'No guardamos lo que escribe.',
];

export default function Consentimiento({ alAceptar }) {
  const [no, setNo] = useState(false);
  const aceptar = () => { almacen.setPref('consentimiento', { version: VERSION, fecha: new Date().toISOString() }); alAceptar(); };
  // Sin autorización no sale nada: se descarta el relato y se ofrecen los caminos sin inteligencia artificial.
  const rechazar = () => { memoria.conversacion = null; setNo(true); };

  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo icono={ShieldCheck} lectura={`Antes de enviar. ${PUNTOS.join(' ')} ¿Acepta?`}>Antes de enviar</Titulo>
      {no ? <>
        <p className="texto">Listo, no enviamos nada. Puede seguir sin inteligencia artificial:</p>
        <OpcionesRapidas />
      </> : <>
        <section className="tarjeta clara">
          <ul className="lista-simple">{PUNTOS.map(p => <li key={p}>{p}</li>)}</ul>
        </section>
        <button className="btn-primario" onClick={aceptar}>Sí, acepto</button>
        <button className="btn-secundario" onClick={rechazar}>No, prefiero elegir una opción</button>
        <a className="btn-enlace" href="#/politica">Ver la política de datos</a>
      </>}
    </main>
  );
}
