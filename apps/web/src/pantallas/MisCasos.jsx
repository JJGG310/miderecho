import { useState } from 'react';
import { Trash2, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { habilesEntre, deIso } from '@miderecho/nucleo';
import { Encabezado, BarraNav, BotonVoz, OpcionesRapidas } from '../componentes/comunes.jsx';
import { EstadoAvisos, LlamadaAsistente } from '../componentes/Avisos.jsx';
import { cancelarAvisos } from '../lib/avisos.js';
import { almacen } from '../lib/almacen.js';
import { ir, memoria } from '../lib/ruta.js';

const fecha = s => deIso(s).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });

export default function MisCasos() {
  const [casos, setCasos] = useState(almacen.casos);
  const [demo, setDemo] = useState(() => almacen.pref('demo', false));
  // Modo demo: muestra los casos como si ya hubiera vencido el plazo (para la presentación).
  const hoy = demo ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) : new Date();
  const recargar = () => setCasos(almacen.casos());

  const lectura = casos.length
    ? 'Mis casos. ' + casos.map(c => `${c.titulo} a ${c.entidad}. ${c.venc ? (habilesEntre(hoy, deIso(c.venc)) > 0 ? `Faltan ${habilesEntre(hoy, deIso(c.venc))} días hábiles.` : 'Ya venció el plazo.') : ''}`).join(' ')
    : 'Mis casos. Aún no tienes casos. Cuando empieces a resolver una situación, podrás guardar aquí tus casos.';

  return (
    <main className="pantalla con-nav">
      <Encabezado />
      <div className="titulo sin-atras"><h1>Mis Casos</h1><BotonVoz texto={lectura} /></div>
      <p className="texto">Consulta y organiza los casos que has iniciado</p>

      {casos.length === 0 ? (
        <div className="vacio">
          <h2>Aún no tienes casos</h2>
          <p className="texto">Cuando empieces a resolver una situación, podrás guardar aquí tus casos y consultar su información cuando lo necesites.</p>
        </div>
      ) : (
        <ul className="casos">
          {casos.map(c => {
            const faltan = c.venc ? habilesEntre(hoy, deIso(c.venc)) : null;
            const vencido = faltan !== null && faltan <= 0;
            return (
              <li key={c.id} className={`tarjeta clara caso ${vencido ? 'vencido' : ''}`}>
                <div className="caso-cabeza">
                  <span className="caso-icono" aria-hidden>{c.icono}</span>
                  <div><b>{c.titulo}</b><small>{c.entidad} · {c.municipio}</small></div>
                  <button className="btn-icono" onClick={() => { almacen.borrarCaso(c.id); cancelarAvisos(c.codigo); recargar(); }} aria-label="Borrar caso"><Trash2 size={18} /></button>
                </div>
                <p className="suave">Entregado el {fecha(c.rad)}</p>
                {c.venc && !vencido && <p className="plazo"><Clock size={16} aria-hidden /><span>{c.tipo.startsWith('tutela') ? 'El juez debe decidir' : 'Te deben responder'} a más tardar el <b>{fecha(c.venc)}</b>. Faltan {faltan} días hábiles.</span></p>}
                {vencido && c.estado === 'esperando' && (
                  <>
                    <p className="plazo alerta"><AlertTriangle size={16} aria-hidden /><span>El plazo venció el {fecha(c.venc)}. ¿Te respondieron?</span></p>
                    <div className="botones-opcion">
                      <button onClick={() => { almacen.guardarCaso({ ...c, estado: 'respondido' }); cancelarAvisos(c.codigo); recargar(); }}>Sí, me respondieron</button>
                      {c.tipo === 'peticion'
                        ? <button className="sel" onClick={() => { memoria.caso = c; ir('documento', 'tutela_peticion'); }}>No: crear la tutela</button>
                        : <button className="sel" onClick={() => ir('inicio')}>No: ¿qué hago?</button>}
                    </div>
                  </>
                )}
                {c.estado === 'respondido' && <p className="plazo ok"><CheckCircle2 size={16} aria-hidden /><span>Te respondieron. Si la respuesta no resuelve tu caso, cuéntanos en Inicio.</span></p>}
                {c.estado === 'esperando' && <EstadoAvisos caso={c} alCambiar={recargar} />}
              </li>
            );
          })}
        </ul>
      )}

      <LlamadaAsistente casos={casos} />
      <label className="demo"><input type="checkbox" checked={demo} onChange={e => { setDemo(e.target.checked); almacen.setPref('demo', e.target.checked); }} /> Modo demo: adelantar un mes</label>
      <OpcionesRapidas />
      <BarraNav actual="casos" />
    </main>
  );
}
