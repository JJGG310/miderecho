import { useEffect, useState } from 'react';
import { Mic, ArrowUp, WifiOff } from 'lucide-react';
import { Encabezado, BotonVoz, OpcionesRapidas } from '../componentes/comunes.jsx';
import { useConexion } from '../lib/conexion.jsx';
import { useDictado, hayDictado } from '../lib/voz.js';
import { ir, memoria } from '../lib/ruta.js';
import { limpiar } from '@miderecho/nucleo/privacidad';

const SALUDO = '¡Hola! ¿Qué necesita resolver hoy? No necesita saber de leyes. Cuéntenos qué está pasando: puede escribir o contarlo con su voz.';

export default function Inicio() {
  const { enLinea } = useConexion();
  const [texto, setTexto] = useState(memoria.borrador || '');
  const cambiar = v => { setTexto(v); memoria.borrador = v; };
  const dictado = useDictado(t => setTexto(x => (memoria.borrador = (x ? x + ' ' : '') + t)));
  useEffect(() => { memoria.sinPeligro = false; }, []);   // cada caso nuevo vuelve a preguntar si hay alguien en peligro
  const conTexto = !!texto.trim();

  const enviar = () => {
    if (!conTexto) return;
    // Lo que se muestra y se envía ya va sin cédulas, teléfonos ni correos.
    memoria.conversacion = [{ rol: 'persona', texto: limpiar(texto.trim()).texto }];
    memoria.borrador = '';
    ir('asistente');
  };

  return (
    <main className="pantalla inicio">
      <Encabezado />
      <h1 className="saludo"><span>¡Hola! ¿Qué necesita resolver hoy?</span><BotonVoz texto={SALUDO} /></h1>
      <div className="caja-relato tarjeta">
        {enLinea ? (<>
          <textarea
            rows={3}
            value={texto}
            onChange={e => cambiar(e.target.value)}
            placeholder="Cuéntenos aquí qué le está pasando. No necesita saber de leyes."
            aria-label="Cuéntenos qué le está pasando"
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enviar(); }}
          />
          {conTexto && hayDictado && !dictado.escuchando && (
            <button className="btn-mini mic" onClick={dictado.alternar} aria-label="Seguir contando con la voz"><Mic size={24} aria-hidden /></button>
          )}
        </>) : (
          <div className="sin-conexion" role="status">
            <p className="sin-conexion-titulo"><WifiOff size={20} aria-hidden /> Está sin internet</p>
            <p>Cuando vuelva la señal, el asistente podrá ayudarle. Mientras tanto puede crear un documento, conocer sus derechos y ver sus casos.</p>
          </div>
        )}
      </div>

      {/* Un solo botón grande: contar con la voz o, si ya escribió, enviar. */}
      {enLinea && (dictado.escuchando
        ? <button className="btn-primario escuchando" onClick={dictado.alternar}><Mic size={24} aria-hidden /> Escuchando… toque para terminar</button>
        : conTexto || !hayDictado
          ? <button className="btn-primario" disabled={!conTexto} onClick={enviar}><ArrowUp size={24} aria-hidden /> Enviar</button>
          : <button className="btn-primario" onClick={dictado.alternar}><Mic size={24} aria-hidden /> Contar con mi voz</button>)}

      <h2 className="subtitulo">¿Prefiere elegir una opción?</h2>
      <OpcionesRapidas />
    </main>
  );
}
