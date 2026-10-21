import { useEffect, useRef, useState } from 'react';
import { PhoneOff, Volume2, Mic } from 'lucide-react';
import { useConexion } from '../lib/conexion.jsx';
import { hablar, callar } from '../lib/voz.js';
import { almacen } from '../lib/almacen.js';
import { cargarSDK, pedirSesion, crearAgente, contexto, AVISO_VOZ, AVISO_RIESGO } from '../lib/agenteVoz.js';
import { RESPONSABLE, CONTACTO, conContactoHablado } from '@miderecho/nucleo/contenido';
import './voz.css';

// Aviso claro ANTES de tocar el micrófono (Ley 1581, art. 12; investigacion/11, §3.3). Si cambia, sube AVISO_VOZ.
// Lo puede escuchar sin internet, con la voz del celular.
const AVISO = [
  'La asistente de voz es una máquina, no una persona, y no es abogada.',
  'Para qué: solo para entender lo que le pasa, orientarle y ayudarle con su documento.',
  'Su voz pasa por servicios externos para entenderla y contestarle: ElevenLabs, en Estados Unidos, con el modelo Gemini, de Google (también el de respaldo). Lo que entienda se lo pasa al asistente de MiDerecho, que usa Claude (de Anthropic) o Gemini (de Google), según el que esté activo, sin cédulas, teléfonos ni correos.',
  'La app no guarda su voz ni lo que diga, y el servicio está configurado para no grabarla ni guardarla. La voz no se usa para identificar a nadie.',
  'No diga su cédula, su nombre ni su dirección. Esos datos se escriben a mano en el documento.',
  'Hablar de temas sensibles, como su salud, si es víctima o a qué grupo pertenece, es opcional: no tiene que responder.',
  'Usted tiene derecho a conocer, actualizar y corregir sus datos, a pedir que los borremos y a retirar esta autorización.',
  'Es opcional: puede escribir en vez de hablar. Hablar gasta datos de internet.',
  `Responsable: ${RESPONSABLE} Llame o escriba al ${CONTACTO}.`,
];
const AVISO_HABLADO = conContactoHablado(AVISO.join(' ')) + ' La política de datos completa está en el enlace de la pantalla.';
const ERRORES = {
  red: 'La asistente de voz necesita internet. Puede seguir escribiendo.',
  microfono: 'No pudimos usar el micrófono. Revise que el navegador tenga permiso. Puede seguir escribiendo.',
  corte: 'Se cortó la conversación. Puede intentar de nuevo o seguir escribiendo.',
  general: 'La asistente de voz no está disponible ahora. Puede seguir escribiendo.',
};

// "Hablar en vez de escribir" en la pantalla del Asistente. Vive solo en esa pantalla: al salir de ella, al cerrar la app
// o al dejarla en segundo plano, la llamada termina.
// mensajes y respuesta: estado del Asistente. responder(texto) y marcarRiesgo(): lo único que el agente puede hacer.
export default function ModoVoz({ mensajes, respuesta, responder, marcarRiesgo, alSalir }) {
  const { enLinea } = useConexion();
  const [fase, setFase] = useState('aviso');   // aviso | conectando | activa | error
  const [modo, setModo] = useState('listening');
  const [error, setError] = useState('');
  const conversacion = useRef(null), intento = useRef(0), titulo = useRef(null), faseActual = useRef(fase);
  faseActual.current = fase;
  const app = useRef();
  app.current = { responder, marcarRiesgo };   // siempre las funciones del último render (el historial cambia en cada turno)

  function colgar() {
    intento.current++;
    conversacion.current?.endSession();
    conversacion.current = null;
    alSalir();
  }

  useEffect(() => { titulo.current?.focus(); }, [fase]);
  useEffect(() => {
    const alOcultar = e => { if ((e.type === 'pagehide' || document.hidden) && ['conectando', 'activa'].includes(faseActual.current)) colgar(); };
    addEventListener('pagehide', alOcultar);
    document.addEventListener('visibilitychange', alOcultar);
    return () => {
      removeEventListener('pagehide', alOcultar);
      document.removeEventListener('visibilitychange', alOcultar);
      intento.current++;
      conversacion.current?.endSession();   // salió de la pantalla
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fallar = clave => { conversacion.current = null; setError(ERRORES[clave]); setFase('error'); };

  async function empezar() {
    if (!navigator.onLine || !enLinea) return fallar('red');
    // Prueba mínima de la aceptación en el celular: fecha y versión del aviso, sin datos de la persona.
    almacen.setPref('avisoVoz', { version: AVISO_VOZ, fecha: new Date().toISOString().slice(0, 10) });
    const yo = ++intento.current, vigente = () => yo === intento.current;
    setFase('conectando');
    callar();
    try {
      const sesion = await pedirSesion();   // primero la sesión: sin clave en el servidor no se descarga el SDK
      if (!vigente()) return;
      const { Conversation } = await cargarSDK();
      if (!vigente()) return;
      const agente = crearAgente(() => app.current, { riesgo: respuesta?.accion === 'riesgo', alUsar: callar });
      let c;
      c = await Conversation.startSession({
        ...sesion,
        clientTools: agente.herramientas,
        // Regla fija sobre lo que dijo la persona: si menciona peligro, la app activa el protocolo sin esperar al modelo.
        onMessage: m => { if (yo === intento.current && agente.escuchar(m)) c?.sendContextualUpdate(AVISO_RIESGO); },
        onModeChange: ({ mode }) => { if (yo === intento.current) { callar(); setModo(mode); } },
        onDisconnect: d => {
          if (yo !== intento.current) return;
          conversacion.current = null;
          d?.reason === 'error' ? fallar('corte') : alSalir();
        },
        onError: () => console.warn('Asistente de voz: error de conexión'),   // sin el detalle: podría traer texto de la conversación
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

  if (fase === 'aviso') return (
    <section className="tarjeta clara aviso-voz" aria-labelledby="voz-titulo">
      <h2 id="voz-titulo" ref={titulo} tabIndex={-1}><Mic size={18} aria-hidden /> Antes de hablar</h2>
      <ul>{AVISO.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="suave"><a href="#/politica">Ver la política de datos</a></p>
      <div className="botones-voz">
        <button className="btn-secundario" onClick={() => hablar(AVISO_HABLADO)}><Volume2 size={18} aria-hidden /> Escuchar el aviso</button>
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
        {fase === 'conectando' ? 'Conectando…' : modo === 'speaking' ? 'La asistente está hablando…' : 'Le escucho. Hable cuando quiera.'}
      </p>
      <button className="voz-colgar" onClick={colgar}><PhoneOff size={18} aria-hidden /> Colgar</button>
    </div>
  );
}
