import { useEffect, useRef, useState } from 'react';
import { PhoneOff, Volume2, Mic } from 'lucide-react';
import { useConexion } from '../lib/conexion.jsx';
import { hablar, callar } from '../lib/voz.js';
import { cargarSDK, pedirSesion, crearHerramientas, contexto } from '../lib/agenteVoz.js';
import './voz.css';

// Consentimiento claro ANTES de tocar el micrófono (investigacion/11, §3.3). Lo puede escuchar sin internet.
const AVISO = [
  'El asistente de voz es una máquina, no una persona, y no es abogado.',
  'Tu voz pasa por servicios externos para entenderla y contestarte: ElevenLabs, en Estados Unidos, y el modelo Gemini, de Google. Lo que entienda se lo pasa al asistente de MiDerecho, sin cédulas, teléfonos ni correos.',
  'La app no guarda tu voz ni lo que digas, y el servicio está configurado para no grabarla ni guardarla. La voz no se usa para identificar a nadie.',
  'No digas tu cédula, tu nombre ni tu dirección. Esos datos se escriben a mano en el documento.',
  'Es opcional: puedes escribir en vez de hablar. Hablar gasta datos de internet.',
  'Responsable: [Organización], [contacto].',
];
const ERRORES = {
  red: 'El asistente de voz necesita internet. Puedes seguir escribiendo.',
  microfono: 'No pudimos usar el micrófono. Revisa que el navegador tenga permiso. Puedes seguir escribiendo.',
  corte: 'Se cortó la conversación. Puedes intentar de nuevo o seguir escribiendo.',
  general: 'El asistente de voz no está disponible ahora. Puedes seguir escribiendo.',
};

// "Hablar en vez de escribir" en la pantalla del Asistente. Vive solo en esa pantalla: al salir de ella, la llamada termina.
// mensajes y respuesta: estado del Asistente. responder(texto) y marcarRiesgo(): lo único que el agente puede hacer.
export default function ModoVoz({ mensajes, respuesta, responder, marcarRiesgo, alSalir }) {
  const { enLinea } = useConexion();
  const [fase, setFase] = useState('aviso');   // aviso | conectando | activa | error
  const [modo, setModo] = useState('listening');
  const [error, setError] = useState('');
  const conversacion = useRef(null), intento = useRef(0), titulo = useRef(null);
  const app = useRef();
  app.current = { responder, marcarRiesgo };   // siempre las funciones del último render (el historial cambia en cada turno)

  useEffect(() => { titulo.current?.focus(); }, [fase]);
  // Al salir de la pantalla o cerrar la app, se cuelga.
  useEffect(() => {
    const colgarYa = () => conversacion.current?.endSession();
    addEventListener('pagehide', colgarYa);
    return () => { intento.current++; removeEventListener('pagehide', colgarYa); colgarYa(); };
  }, []);

  const fallar = clave => { conversacion.current = null; setError(ERRORES[clave]); setFase('error'); };

  async function empezar() {
    if (!navigator.onLine || !enLinea) return fallar('red');
    const yo = ++intento.current, vigente = () => yo === intento.current;
    setFase('conectando');
    callar();
    try {
      const sesion = await pedirSesion();   // primero la sesión: sin clave en el servidor no se descarga el SDK
      if (!vigente()) return;
      const { Conversation } = await cargarSDK();
      if (!vigente()) return;
      const c = await Conversation.startSession({
        ...sesion,
        clientTools: crearHerramientas(() => app.current, { riesgo: respuesta?.accion === 'riesgo', alUsar: callar }),
        onModeChange: ({ mode }) => { if (yo === intento.current) { callar(); setModo(mode); } },
        onDisconnect: d => {
          if (yo !== intento.current) return;
          conversacion.current = null;
          d?.reason === 'error' ? fallar('corte') : alSalir();
        },
        onError: m => console.warn('Asistente de voz:', m),
      });
      if (!vigente()) return c.endSession();   // colgó mientras conectaba
      conversacion.current = c;
      c.sendContextualUpdate(contexto(mensajes, respuesta));
      setFase('activa');
    } catch (e) {
      if (!vigente()) return;
      fallar(e?.name === 'NotAllowedError' || e?.name === 'NotFoundError' ? 'microfono' : navigator.onLine ? 'general' : 'red');
    }
  }

  function colgar() {
    intento.current++;
    conversacion.current?.endSession();
    conversacion.current = null;
    alSalir();
  }

  if (fase === 'aviso') return (
    <section className="tarjeta clara aviso-voz" aria-labelledby="voz-titulo">
      <h2 id="voz-titulo" ref={titulo} tabIndex={-1}><Mic size={18} aria-hidden /> Antes de hablar</h2>
      <ul>{AVISO.map(t => <li key={t}>{t}</li>)}</ul>
      <div className="botones-voz">
        <button className="btn-secundario" onClick={() => hablar(AVISO.join(' '))}><Volume2 size={18} aria-hidden /> Escuchar el aviso</button>
        <button className="btn-primario" onClick={empezar} disabled={!enLinea}>Sí, quiero hablar</button>
        <button className="btn-secundario" onClick={() => { callar(); alSalir(); }}>No, gracias</button>
      </div>
    </section>
  );

  if (fase === 'error') return (
    <section className="tarjeta clara" role="alert" aria-labelledby="voz-titulo">
      <h2 id="voz-titulo" ref={titulo} tabIndex={-1}>Asistente de voz</h2>
      <p className="texto">{error}</p>
      <button className="btn-secundario" onClick={alSalir}>Seguir escribiendo</button>
    </section>
  );

  return (
    <div className={`voz-barra ${modo === 'speaking' ? 'hablando' : ''}`}>
      <p aria-live="polite" ref={titulo} tabIndex={-1}>
        {fase === 'conectando' ? 'Conectando…' : modo === 'speaking' ? 'El asistente está hablando…' : 'Te escucho. Habla cuando quieras.'}
      </p>
      <button className="voz-colgar" onClick={colgar}><PhoneOff size={18} aria-hidden /> Colgar</button>
    </div>
  );
}
