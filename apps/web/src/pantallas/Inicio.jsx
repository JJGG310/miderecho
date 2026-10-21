import { useState } from 'react';
import { Paperclip, Mic, ArrowUp, WifiOff } from 'lucide-react';
import { Encabezado, BarraNav, BotonVoz, OpcionesRapidas } from '../componentes/comunes.jsx';
import { AvisoPlazos } from '../componentes/Avisos.jsx';
import { useConexion } from '../lib/conexion.jsx';
import { useDictado, hayDictado } from '../lib/voz.js';
import { ir, memoria } from '../lib/ruta.js';
import { limpiar } from '@miderecho/nucleo/privacidad';

const SALUDO = 'Hola. ¿Qué necesitas resolver hoy? No necesitas conocer términos legales. Cuéntanos qué está pasando.';

export default function Inicio() {
  const { enLinea } = useConexion();
  const [texto, setTexto] = useState(memoria.borrador || '');
  const [adjunto, setAdjunto] = useState(null);
  const dictado = useDictado(t => setTexto(x => (x ? x + ' ' : '') + t));

  const cambiar = v => { setTexto(v); memoria.borrador = v; };
  const enviar = () => {
    if (!texto.trim()) return;
    // Lo que se muestra y se envía ya va sin cédulas, teléfonos ni correos.
    memoria.conversacion = [{ rol: 'persona', texto: limpiar(texto.trim()).texto }];
    memoria.adjunto = adjunto;
    memoria.borrador = '';
    ir('asistente');
  };

  return (
    <main className="pantalla con-nav">
      <Encabezado />
      <h1 className="saludo">Hola! <span aria-hidden>👋🏼</span> <BotonVoz texto={SALUDO} /><br />Qué necesitas resolver hoy?</h1>
      <p className="texto">No necesitas conocer términos legales. Cuéntanos qué está pasando.</p>
      <AvisoPlazos />

      <div className="caja-relato tarjeta">
        {enLinea ? (
          <textarea
            value={texto}
            onChange={e => cambiar(e.target.value)}
            placeholder="Escribe aquí lo que te está pasando..."
            aria-label="Cuéntanos qué te está pasando"
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enviar(); }}
          />
        ) : (
          <div className="sin-conexion" role="status">
            <p className="sin-conexion-titulo"><WifiOff size={18} aria-hidden /> Estás sin conexión</p>
            <p>Cuando vuelvas a tener internet, podremos ayudarte a analizar tu situación. Mientras tanto, puedes consultar tus derechos y las búsquedas que hayas guardado</p>
          </div>
        )}
        <div className="caja-acciones">
          <label className={`adjuntar ${!enLinea ? 'apagado' : ''}`}>
            <Paperclip size={16} aria-hidden />
            <span>{adjunto ? adjunto : 'Adjuntar archivo'}</span>
            <input type="file" accept="image/*,application/pdf" disabled={!enLinea} hidden onChange={e => setAdjunto(e.target.files?.[0]?.name || null)} />
          </label>
          <button className={`btn-mini mic ${dictado.escuchando ? 'escuchando' : ''}`} disabled={!enLinea || !hayDictado} onClick={dictado.alternar} aria-label={dictado.escuchando ? 'Parar el dictado' : 'Dictar con la voz'}>
            <Mic size={16} />
          </button>
          <button className="btn-mini enviar" disabled={!enLinea || !texto.trim()} onClick={enviar} aria-label="Enviar">
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      <h2 className="subtitulo">Prefieres elegir una opción?</h2>
      <OpcionesRapidas />
      <BarraNav actual="inicio" />
    </main>
  );
}
