import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mic, ShieldAlert, Loader2, AudioLines } from 'lucide-react';
import { Encabezado, Titulo, BotonVoz } from '../componentes/comunes.jsx';
import Orientacion from '../componentes/Orientacion.jsx';
import ModoVoz from '../componentes/ModoVoz.jsx';
import { preguntarAsistente } from '../lib/api.js';
import { useConexion } from '../lib/conexion.jsx';
import { useDictado, hayDictado, hablar } from '../lib/voz.js';
import { almacen } from '../lib/almacen.js';
import { ir, memoria, useRuta } from '../lib/ruta.js';
import { limpiar } from '@miderecho/nucleo/privacidad';
import { AYUDA_RIESGO } from '@miderecho/nucleo/contenido';

// El ayudante con IA: la persona cuenta lo que pasa, el asistente pregunta lo mínimo y orienta.
// #/asistente/voz abre directo "Hablar en vez de escribir" (ModoVoz), aunque todavía no haya relato.
export default function Asistente() {
  const { enLinea } = useConexion();
  const [, modo] = useRuta();
  const [voz, setVoz] = useState(modo === 'voz');
  const [mensajes, setMensajes] = useState(() => memoria.conversacion || []);
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [texto, setTexto] = useState('');
  const fin = useRef(null);
  const iniciado = useRef(false);
  const enRiesgo = useRef(false);   // lo activa el modo voz: desde ahí no se muestra ni se guarda otra respuesta
  const dictado = useDictado(t => setTexto(x => (x ? x + ' ' : '') + t));

  const consultar = async lista => {
    setCargando(true); setError(null);
    try {
      const r = await preguntarAsistente(lista);
      if (enRiesgo.current) return null;
      const nueva = [...lista, { rol: 'asistente', texto: r.mensaje }];
      setMensajes(nueva);
      memoria.conversacion = nueva;
      setRespuesta(r);
      if (r.accion === 'orientar') { memoria.orientacion = r.orientacion; almacen.guardarOrientacion(r.orientacion); }
      if (almacen.pref('modoVoz', false) && !voz) hablar(r.mensaje);
      return r;
    } catch (e) {
      setError(navigator.onLine ? 'No pudimos hablar con el asistente. Intenta de nuevo.' : 'Se perdió la conexión. Tu relato no se envió.');
      return null;
    } finally { setCargando(false); }
  };

  // Primera respuesta al llegar desde Inicio.
  useEffect(() => {
    if (!mensajes.length) { if (!voz) ir('inicio'); return; }
    if (iniciado.current) return; // StrictMode monta dos veces en desarrollo
    iniciado.current = true;
    if (mensajes.at(-1).rol === 'persona' && enLinea) consultar(mensajes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [mensajes, cargando, respuesta]);

  const responder = t => {
    if (!t.trim() || cargando) return null;
    const lista = [...mensajes, { rol: 'persona', texto: limpiar(t.trim()).texto }];
    setMensajes(lista); setTexto(''); setRespuesta(null);
    return consultar(lista);
  };
  // El agente de voz detectó peligro: la misma ayuda fija que manda el servidor, sin llamar a la IA.
  const marcarRiesgo = () => { enRiesgo.current = true; setRespuesta({ accion: 'riesgo', riesgo: true, ayuda: AYUDA_RIESGO }); };

  const riesgo = respuesta?.accion === 'riesgo';
  const orientado = respuesta?.accion === 'orientar';

  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura={() => mensajes.filter(m => m.rol === 'asistente').map(m => m.texto).join(' ')}>Tu situación</Titulo>
      <p className="nota-privacidad">Antes de enviar, quitamos cédulas, teléfonos y correos. No guardamos lo que nos cuentas.</p>

      <div className="chat" aria-live="polite">
        {mensajes.map((m, i) => (
          <div key={i} className={`burbuja ${m.rol}`}>
            {m.texto}
            {m.rol === 'asistente' && <BotonVoz texto={m.texto} className="voz-burbuja" />}
          </div>
        ))}
        {cargando && <div className="burbuja asistente cargando"><Loader2 className="girar" size={16} aria-hidden /> Pensando…</div>}
        {error && <div className="aviso-error" role="alert">{error} <button onClick={() => consultar(mensajes)}>Reintentar</button></div>}
      </div>

      {riesgo && (
        <section className="tarjeta riesgo" role="alert">
          <ShieldAlert size={22} aria-hidden />
          <h2>A dónde acudir</h2>
          <div dangerouslySetInnerHTML={{ __html: respuesta.ayuda }} />
          <button className="btn-secundario" onClick={() => { memoria.conversacion = null; setMensajes([]); ir('inicio'); }}>Salir sin guardar</button>
        </section>
      )}

      {respuesta?.accion === 'preguntar' && respuesta.opciones?.length > 0 && !cargando && !voz && (
        <div className="chips">
          {respuesta.opciones.map(o => <button key={o} className="chip" onClick={() => responder(o)}>{o}</button>)}
        </div>
      )}

      {orientado && <Orientacion o={respuesta.orientacion} />}

      {!riesgo && !orientado && !voz && (
        <div className="caja-respuesta tarjeta">
          <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder={enLinea ? 'Escribe tu respuesta...' : 'Sin conexión'} disabled={!enLinea} rows={2} aria-label="Tu respuesta" />
          <button className={`btn-mini mic ${dictado.escuchando ? 'escuchando' : ''}`} disabled={!enLinea || !hayDictado} onClick={dictado.alternar} aria-label="Dictar con la voz"><Mic size={16} /></button>
          <button className="btn-mini enviar" disabled={!enLinea || !texto.trim() || cargando} onClick={() => responder(texto)} aria-label="Enviar"><ArrowUp size={16} /></button>
        </div>
      )}
      {!riesgo && !orientado && !voz && <button className="btn-secundario" disabled={!enLinea} onClick={() => setVoz(true)}><AudioLines size={18} aria-hidden /> Hablar en vez de escribir</button>}
      {voz && <ModoVoz mensajes={mensajes} respuesta={respuesta} responder={responder} marcarRiesgo={marcarRiesgo} alSalir={() => setVoz(false)} />}
      {respuesta?.fuente === 'simulada' && <p className="nota-modo">Modo básico (sin IA){respuesta.aviso ? `: ${respuesta.aviso}` : ''}</p>}
      {respuesta?.aviso && respuesta.fuente !== 'simulada' && <p className="nota-modo" role="note">{respuesta.aviso}</p>}
      <div ref={fin} />
    </main>
  );
}
