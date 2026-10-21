import { useEffect, useState } from 'react';
import { Mic, ArrowUp, WifiOff, FolderOpen } from 'lucide-react';
import { Encabezado, BotonVoz, OpcionesRapidas, Aviso } from '../componentes/comunes.jsx';
import Buho, { NOMBRE_BUHO } from '../componentes/Buho.jsx';
import { AvisoPlazos } from '../componentes/Avisos.jsx';
import { AvisoIA, consintio } from './Consentimiento.jsx';
import { useConexion } from '../lib/conexion.jsx';
import { useDictado, hayDictado } from '../lib/voz.js';
import { useAbierta } from '../lib/almacen.js';
import { cargarEjemplos, hayEjemplos, quitarEjemplos } from '../lib/ejemplos.js';
import { ir, memoria } from '../lib/ruta.js';
import { limpiar } from '@miderecho/nucleo/privacidad';

const PRESENTA = `¡Hola! Soy ${NOMBRE_BUHO} y le ayudo a hacer valer sus derechos.`;
const SALUDO = PRESENTA + ' ¿Qué necesita resolver hoy? No necesita saber de leyes. Cuéntenos qué está pasando: puede escribir o contarlo con su voz.';

export default function Inicio() {
  const { enLinea } = useConexion();
  const [texto, setTexto] = useState(memoria.borrador || '');
  const cambiar = v => { setTexto(v); memoria.borrador = v; };
  const dictado = useDictado(t => setTexto(x => (memoria.borrador = (x ? x + ' ' : '') + t)));
  // Cada conversación nueva vuelve a preguntar si hay alguien en peligro y vuelve a pedir la autorización de la IA.
  useEffect(() => { memoria.sinPeligro = false; memoria.consentimiento = null; }, []);
  // El dictado manda el audio a Google: antes del primer dictado se muestra el aviso.
  const [aviso, setAviso] = useState(false);
  const dictar = () => (consintio() || dictado.escuchando ? dictado.alternar() : setAviso(true));
  const conTexto = !!texto.trim();
  // Casos de ejemplo (inventados) para conocer Mis casos: uno por vencer y uno vencido que ofrece la tutela.
  const abierta = useAbierta();
  const [quitados, setQuitados] = useState(false);
  const verEjemplo = () => { cargarEjemplos(); ir('casos'); };

  const enviar = () => {
    if (!conTexto) return;
    // Lo que se muestra y se envía ya va sin cédulas, teléfonos ni correos.
    memoria.conversacion = [{ rol: 'persona', texto: limpiar(texto.trim()).texto }];
    memoria.borrador = '';
    ir('asistente');
  };

  if (aviso) return (
    <main className="pantalla">
      <Encabezado />
      <AvisoIA alAceptar={() => { setAviso(false); dictado.alternar(); }} alRechazar={() => setAviso(false)} />
    </main>
  );

  return (
    <main className="pantalla inicio">
      <Encabezado />
      <Buho pose="saludo" ancho={76} primera className="buho-respira">{PRESENTA}</Buho>
      <h1 className="saludo"><span>¿Qué necesita resolver hoy?</span><BotonVoz texto={SALUDO} /></h1>
      <AvisoPlazos />
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
            <button className="btn-mini mic" onClick={dictar} aria-label="Seguir contando con la voz"><Mic size={24} aria-hidden /></button>
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
          : <button className="btn-primario" onClick={dictar}><Mic size={24} aria-hidden /> Contar con mi voz</button>)}

      <h2 className="subtitulo">¿Prefiere elegir una opción?</h2>
      <OpcionesRapidas />
      <button className="btn-secundario" onClick={verEjemplo}><FolderOpen size={22} aria-hidden /> Ver un caso de ejemplo</button>
      {abierta && hayEjemplos() && <button className="btn-enlace" onClick={() => { quitarEjemplos(); setQuitados(true); }}>Quitar los casos de ejemplo</button>}
      {quitados && <Aviso alCerrar={() => setQuitados(false)}>Listo. Se quitaron los casos de ejemplo.</Aviso>}
    </main>
  );
}
