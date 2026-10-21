import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Encabezado, Titulo, OpcionesRapidas } from '../componentes/comunes.jsx';
import { CONSENTIMIENTO } from '../lib/api.js';
import { RESPONSABLE, CONTACTO, conContactoHablado } from '@miderecho/nucleo/contenido';
import { memoria } from '../lib/ruta.js';

// Aviso y autorización antes de mandar algo a la inteligencia artificial (Ley 1581 art. 12; Decreto 1377 arts. 5 y 7:
// dato sensible, autorización previa y expresa). Se pide una vez por conversación y vive solo en memoria: en un celular
// compartido, la autorización de una persona no sirve para la siguiente. La versión va en cada envío a /api/asistente.
export const consintio = () => memoria.consentimiento === CONSENTIMIENTO;

const PUNTOS = [
  'Para entender su caso y orientarle, lo que escriba o dicte va a una inteligencia artificial: Claude (de Anthropic) o Gemini (de Google), según la que esté activa, en Estados Unidos.',
  'Si usa el dictado por voz, el audio pasa por el servicio de voz de Google.',
  'Antes de enviarlo intentamos quitar cédulas, teléfonos y correos, pero el filtro no atrapa todo: no escriba nombres, cédulas ni direcciones.',
  'Si cuenta algo de su salud, es un dato sensible. Contarlo es opcional. No guardamos la conversación.',
  `Responsable: ${RESPONSABLE} Puede conocer, corregir o borrar sus datos y retirar esta autorización cuando quiera, llamando o escribiendo al ${CONTACTO}.`,
];
const LECTURA = conContactoHablado(`Antes de usar el asistente. ${PUNTOS.join(' ')} ¿Acepta?`);

// La tarjeta del aviso, para la pantalla del asistente y para Inicio (antes del primer dictado).
export function AvisoIA({ alAceptar, alRechazar }) {
  const aceptar = () => { memoria.consentimiento = CONSENTIMIENTO; alAceptar(); };
  return (<>
    <section className="tarjeta clara" aria-labelledby="aviso-ia">
      <h2 id="aviso-ia"><ShieldCheck size={22} aria-hidden /> Antes de usar el asistente</h2>
      <ul className="lista-simple">{PUNTOS.map(p => <li key={p}>{p}</li>)}</ul>
    </section>
    <button className="btn-primario" onClick={aceptar}>Sí, acepto</button>
    <button className="btn-secundario" onClick={alRechazar}>No, prefiero elegir una opción</button>
    <a className="btn-enlace" href="#/politica">Ver la política de datos en historieta</a>
    <a className="btn-enlace" href="#/politica/completa">Ver la política completa</a>
  </>);
}

export default function Consentimiento({ alAceptar }) {
  const [no, setNo] = useState(false);
  // Sin autorización no sale nada: se descarta el relato y se ofrecen los caminos sin inteligencia artificial.
  const rechazar = () => { memoria.conversacion = null; setNo(true); };
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura={no ? 'No enviamos nada. Puede seguir sin inteligencia artificial: crear un documento o conocer sus derechos.' : LECTURA}>{no ? 'No enviamos nada' : 'Antes de enviar'}</Titulo>
      {no ? <>
        <p className="texto">Puede seguir sin inteligencia artificial:</p>
        <OpcionesRapidas />
      </> : <AvisoIA alAceptar={alAceptar} alRechazar={rechazar} />}
    </main>
  );
}
