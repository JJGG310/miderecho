// Modo líder: la persona líder arma, en su celular, el documento de un vecino que está con ella (investigacion/00, §13).
// El vecino da el consentimiento; en el celular del líder no queda nada: ni el caso ni recordatorios, porque "el líder
// nunca guarda listas" (00, §6). El documento se descarga o se envía y ahí termina. Como el prototipo (prototipo/app.js:224).
import { useState } from 'react';
import { ShieldCheck, Volume2, User, Users, ChevronRight } from 'lucide-react';
import { RESPONSABLE, CONTACTO, conContactoHablado, sumarHabiles, iso } from '@miderecho/nucleo';
import { Encabezado, Titulo, BotonVoz, fechaLarga } from './comunes.jsx';
import Buho from './Buho.jsx';
import { hablar, callar } from '../lib/voz.js';
import { ir, olvidar } from '../lib/ruta.js';

const AVISO = [
  'MiDerecho es gratis. Da información y plantillas: no somos abogados.',
  'Sus datos (su nombre, su cédula y lo que cuente) solo sirven para escribir su documento. Van en el papel y no van a la inteligencia artificial. Si pide enviarlo por correo, le pediremos un permiso aparte.',
  'En el celular de su líder no se guarda nada: ni su caso, ni sus datos, ni recordatorios.',
  'Contarnos algo delicado (su salud, su etnia, si es víctima o a qué organización pertenece) es opcional.',
  `Responsable: ${RESPONSABLE} Para conocer, corregir o borrar sus datos, llame o escriba al ${CONTACTO}.`,
];
const LECTURA = conContactoHablado(`Aviso para su vecino. ${AVISO.join(' ')} ¿Acepta?`);
const terminar = () => { callar(); olvidar(); ir('inicio'); };

export function ParaQuien({ alElegir }) {
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura="¿Para quién es este documento? Para mí. O para un vecino que está conmigo: usted le ayuda y él o ella decide. En ese caso no se guarda nada en este celular.">¿Para quién es?</Titulo>
      <section className="tarjeta clara lista-temas">
        <ul>
          <li><button onClick={() => alElegir('mi')}>
            <User className="tema-icono" size={28} aria-hidden />
            <span className="tema-texto"><b>Para mí</b><small>Lo puede guardar en Mis casos</small></span>
            <ChevronRight size={22} aria-hidden />
          </button></li>
          {/* El aviso empieza a sonar con el toque: el vecino lo oye aunque no sepa leer. */}
          <li><button onClick={() => { hablar(LECTURA); alElegir('vecino'); }}>
            <Users className="tema-icono" size={28} aria-hidden />
            <span className="tema-texto"><b>Para un vecino que está conmigo</b><small>Usted le ayuda; él o ella decide. No se guarda nada en este celular.</small></span>
            <ChevronRight size={22} aria-hidden />
          </button></li>
        </ul>
      </section>
    </main>
  );
}

export function AvisoVecino({ alAceptar, alVolver }) {
  const [no, setNo] = useState(false);
  if (no) return (
    <main className="pantalla">
      <Encabezado />
      <Titulo alVolver={() => setNo(false)} lectura="Está bien. No guardamos nada. Si su vecino quiere ayuda en persona, la Personería de su municipio atiende gratis.">Está bien</Titulo>
      <p className="texto">No guardamos nada. Si su vecino quiere ayuda en persona, la Personería de su municipio atiende gratis.</p>
      <button className="btn-primario" onClick={terminar}>Volver al inicio</button>
    </main>
  );
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo alVolver={() => { callar(); alVolver(); }} lectura={LECTURA}>Aviso para su vecino</Titulo>
      <p className="nota-privacidad">Léale este aviso a su vecino, o toque «Escuchar el aviso». La decisión es de él o de ella.</p>
      <section className="tarjeta clara">
        <h2><ShieldCheck size={22} aria-hidden /> Antes de empezar</h2>
        <ul className="lista-simple">{AVISO.map(p => <li key={p}>{p}</li>)}</ul>
      </section>
      <button className="btn-secundario" onClick={() => hablar(LECTURA)}><Volume2 size={22} aria-hidden /> Escuchar el aviso</button>
      <button className="btn-primario" onClick={() => { callar(); alAceptar(); }}>Sí, acepto</button>
      <button className="btn-secundario" onClick={() => { callar(); setNo(true); }}>No acepto</button>
      <a className="btn-enlace" href="#/politica/completa">Ver la política de datos</a>
    </main>
  );
}

// Aviso en cada paso del documento del vecino.
export const NotaVecino = () => <p className="nota-privacidad">Documento de su vecino: no se guarda nada en este celular.</p>;

// Al final: cómo sigue el vecino su caso sin el celular del líder. quien: "La entidad debe responder", "El juez debe decidir"…
export function SeguimientoVecino({ quien, plazo, enviado }) {
  const venc = enviado && plazo ? iso(sumarHabiles(new Date(enviado.fecha), plazo)) : null;
  const pasos = [
    enviado ? 'Ya se envió. Anote el código del caso y el número de envío que salen arriba.'
      : 'Entréguelo y pida una copia con sello o el número de recibido. Guárdela: es su prueba.',
    plazo && (venc ? `${quien} a más tardar el ${fechaLarga(venc)}. Anote esa fecha.`
      : `${quien} en ${plazo} días hábiles desde el día en que lo entregue (no cuentan sábados, domingos ni festivos). Anote esa fecha en su copia.`),
    'Si no le responden a tiempo o la respuesta no le sirve, vuelva con su líder o vaya a la Personería: le ayudan gratis con el paso siguiente.',
    'Si tiene un celular propio con internet, puede abrir MiDerecho y anotar su caso en Mis casos para recibir avisos.',
  ].filter(Boolean);
  return (
    <section className="tarjeta oliva">
      <div className="fila-titulo"><h2><Buho pose="documento" ancho={44} /> Cómo seguir su caso</h2><BotonVoz texto={`Cómo seguir su caso. ${pasos.join(' ')}`} /></div>
      <ol className="pasos">{pasos.map(p => <li key={p}>{p}</li>)}</ol>
      <p className="texto">En este celular no quedó nada guardado. Al terminar, el documento se borra de la pantalla.</p>
      <button className="btn-primario" onClick={terminar}>Terminar</button>
    </section>
  );
}
