import { useState } from 'react';
import { Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { habilesEntre, deIso, iso, sumarHabiles, llenar, esc, TIPOS, EXPLICA, MOTIVOS_SP } from '@miderecho/nucleo';
import { Encabezado, BotonVoz, OpcionesRapidas, Confirmar, Aviso, ElegirFecha, fechaLarga } from '../componentes/comunes.jsx';
import { EstadoAvisos, LlamadaAsistente } from '../componentes/Avisos.jsx';
import Buho from '../componentes/Buho.jsx';
import { Constancia } from '../componentes/EnvioCorreo.jsx';
import { cancelarAvisos } from '../lib/avisos.js';
import { almacen } from '../lib/almacen.js';
import { DEMO } from '../lib/conexion.jsx';
import { ir, memoria } from '../lib/ruta.js';

const fecha = s => deIso(s).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
const esTutela = c => c.tipo.startsWith('tutela');
const esServicio = c => c.tipo === 'servicios_publicos' || c.tipo === 'recurso_servicios';
const html = (plantilla, c) => ({ __html: llenar(plantilla, { entidad: esc(c.entidad) }) });
// Por fechas, no por horas: el día del vencimiento todavía no está vencido ("Hoy es el último día").
const faltanDe = (c, hoy) => (c.venc ? habilesEntre(deIso(iso(hoy)), deIso(c.venc)) : null);
const vencidoDe = (c, hoy) => !!c.venc && iso(hoy) > c.venc;

// Etiqueta del estado: [ícono, color, texto]. Verde: hay tiempo. Ámbar: vence pronto o hay que contestar algo. Rojo: plazo corto de la persona.
function etiqueta(c, hoy) {
  const faltan = faltanDe(c, hoy), vencido = vencidoDe(c, hoy), ultimo = c.venc === iso(hoy);
  if (c.estado === 'negada') return vencido ? ['⛔', 'rojo', 'Se venció el plazo para impugnar'] : ['⛔', 'rojo', ultimo ? 'Hoy es el último día para impugnar' : `Impugne a más tardar el ${fecha(c.venc)}`];
  if (c.estado === 'por_recurrir') return vencido ? ['⛔', 'rojo', 'Se venció el plazo para el recurso'] : ['⛔', 'rojo', ultimo ? 'Hoy es el último día para el recurso' : `Presente el recurso a más tardar el ${fecha(c.venc)}`];
  if (c.estado === 'tutela') return ['✅', 'verde', 'Ya hizo la tutela por esta petición'];
  if (c.estado === 'ganada') return ['✅', 'verde', 'El juez le dio la razón'];
  if (c.estado === 'desacato') return ['⏳', 'verde', `Pidió el desacato el ${fecha(c.rad)}`];
  if (c.estado === 'respondido') return ['✅', 'verde', 'Le respondieron'];
  if (faltan === null) return ['⏳', 'verde', 'Sin plazo'];
  if (vencido) return ['⚠️', 'ambar', esTutela(c) || c.estado === 'impugnada' ? 'El juez ya debía decidir' : 'Ya venció el plazo para responderle'];
  if (ultimo) return ['⚠️', 'ambar', 'Hoy es el último día'];
  return [faltan <= 3 ? '⚠️' : '⏳', faltan <= 3 ? 'ambar' : 'verde', `Faltan ${faltan} ${faltan === 1 ? 'día hábil' : 'días hábiles'}`];
}

export default function MisCasos() {
  const [casos, setCasos] = useState(almacen.casos);
  const [demo, setDemo] = useState(() => DEMO && almacen.pref('demo', false));
  const [borrar, setBorrar] = useState(null);   // caso a borrar (pide confirmación)
  const [aviso, setAviso] = useState(null);
  // Modo demo (solo con ?demo): muestra los casos como si ya hubiera pasado un mes, para la presentación.
  const hoy = demo ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) : new Date();
  const recargar = () => setCasos(almacen.casos());
  // Primero lo que vence antes; los que no tienen plazo, al final.
  const orden = [...casos].sort((a, b) => (a.venc || '9999').localeCompare(b.venc || '9999'));

  const lectura = casos.length
    ? 'Mis casos. ' + orden.map(c => `${c.titulo} a ${c.entidad}. ${etiqueta(c, hoy)[2]}.`).join(' ')
    : 'Mis casos. Aún no tiene casos. Cuando entregue un documento, aquí le recordamos el plazo y qué sigue.';

  return (
    <main className="pantalla">
      <Encabezado />
      <div className="titulo"><h1>Mis casos</h1><BotonVoz texto={lectura} /></div>
      <p className="texto">Los plazos de lo que ha entregado y qué hacer después.</p>

      {casos.length === 0 ? (
        <div className="vacio">
          <Buho pose="avatar-curioso" ancho={96} primera />
          <h2>Aún no tiene casos</h2>
          <p className="texto">Cuando entregue un documento, anote aquí el día: le recordamos el plazo y qué sigue.</p>
        </div>
      ) : (
        <ul className="casos">
          {orden.map(c => {
            const [icono, color, texto] = etiqueta(c, hoy);
            return (
              <li key={c.id} className={`tarjeta clara caso ${color === 'verde' ? '' : color}`}>
                <div className="caso-cabeza">
                  <span className="caso-icono" aria-hidden>{c.icono}</span>
                  <div><b>{c.titulo}{c.ejemplo && <span className="marca-ejemplo">Ejemplo</span>}</b><small>{[c.entidad, c.municipio].filter(x => x && x !== '______').join(' · ')}</small></div>
                  <button className="btn-icono" onClick={() => setBorrar(c)} aria-label={`Borrar el caso ${c.titulo}`}><Trash2 size={22} /></button>
                </div>
                <span className={`estado ${color}`}><span aria-hidden>{icono}</span> {texto}</span>
                {c.envios?.length > 0 && <Constancia k={c.envios.at(-1)} />}
                <Siguiente c={c} hoy={hoy} recargar={recargar} cerrar={() => setBorrar({ ...c, cerrar: true })} />
                {c.estado === 'esperando' && <EstadoAvisos caso={c} alCambiar={recargar} />}
              </li>
            );
          })}
        </ul>
      )}

      <LlamadaAsistente casos={casos} />
      {DEMO && <label className="demo"><input type="checkbox" checked={demo} onChange={e => { setDemo(e.target.checked); almacen.setPref('demo', e.target.checked); }} /> Modo demo: adelantar un mes</label>}
      <OpcionesRapidas />

      {borrar && (
        <Confirmar titulo={borrar.cerrar ? '¿Cerrar y borrar este caso?' : '¿Borrar este caso?'} alNo={() => setBorrar(null)}
          alSi={() => { almacen.borrarCaso(borrar.id); cancelarAvisos(borrar.codigo); recargar(); setBorrar(null); setAviso('Listo. Se borró el caso y se cancelaron sus recordatorios.'); }}>
          {borrar.titulo} a {borrar.entidad}. Se borra de este celular y se cancelan sus recordatorios.
        </Confirmar>
      )}
      {aviso && <Aviso alCerrar={() => setAviso(null)}>{aviso}</Aviso>}
    </main>
  );
}

// Qué sigue en cada caso, según el estado y el plazo (como el prototipo: fallo, impugnación y desacato).
function Siguiente({ c, hoy, recargar, cerrar }) {
  const [pregunta, setPregunta] = useState(null);   // 'favor' | 'contra' | 'aviso' | 'no' | 'negado'
  // Al cambiar de estado, los recordatorios del plazo anterior ya no sirven: se cancelan.
  const guardar = cambios => { cancelarAvisos(c.codigo); almacen.guardarCaso({ ...c, ...cambios }); setPregunta(null); recargar(); };
  const preparar = tipo => { memoria.caso = c; ir('documento', tipo); };
  const vencido = vencidoDe(c, hoy);
  const quien = esTutela(c) || c.estado === 'impugnada' ? 'El juez debe decidir' : esServicio(c) ? 'La empresa debe responderle' : 'La entidad debe responderle';
  const entregado = <p className="suave">Entregado el {fecha(c.rad)}</p>;

  if (c.estado === 'negada') return vencido ? (
    <div className="siguiente">
      <div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.impugnacionVencida }} />
      <button className="btn-secundario" onClick={cerrar}>Cerrar el caso</button>
    </div>
  ) : (
    <div className="siguiente">
      <div className="urgente" role="alert">
        <span>Tiene muy poco tiempo. Presente la impugnación a más tardar el</span>
        <span className="fecha">{fechaLarga(c.venc)}</span>
        <span>Son {TIPOS.impugnacion.presentar} días hábiles. No espere al último día.</span>
      </div>
      <div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.impugnar }} />
      <button className="btn-primario" onClick={() => preparar('impugnacion')}>Preparar la impugnación</button>
    </div>
  );

  // Reclamo de servicios públicos negado: 5 días hábiles para el recurso (Ley 142, art. 154), como la impugnación.
  if (c.estado === 'por_recurrir') return vencido ? (
    <div className="siguiente">
      <div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.recursoVencido }} />
      <button className="btn-secundario" onClick={cerrar}>Cerrar el caso</button>
    </div>
  ) : (
    <div className="siguiente">
      <div className="urgente" role="alert">
        <span>Tiene muy poco tiempo. Presente el recurso a más tardar el</span>
        <span className="fecha">{fechaLarga(c.venc)}</span>
        <span>Son {TIPOS.recurso_servicios.presentar} días hábiles. No espere al último día.</span>
      </div>
      <div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.recurso }} />
      <p className="texto">{EXPLICA.pagoRecurso}</p>
      <button className="btn-primario" onClick={() => preparar('recurso_servicios')}>Preparar el recurso</button>
    </div>
  );

  if (c.estado === 'ganada') return (
    <div className="siguiente">
      <div className="fila-buho"><Buho pose="corazon" ancho={48} /><div className="texto" dangerouslySetInnerHTML={html(EXPLICA.ganada, c)} /></div>
      <p className="texto"><b>¿Ya cumplió {c.entidad}?</b></p>
      <div className="botones-opcion">
        <button onClick={cerrar}>Sí, ya cumplió</button>
        <button className="sel" onClick={() => preparar('desacato')}>No: pedir el desacato</button>
      </div>
    </div>
  );

  if (c.estado === 'desacato') return (
    <div className="siguiente">
      <div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.desacatoYa }} />
      <button className="btn-secundario" onClick={cerrar}>Cerrar el caso</button>
    </div>
  );

  if (c.estado === 'tutela') return <p className="plazo ok"><CheckCircle2 size={20} aria-hidden /><span>La tutela por esta petición está en Mis casos.</span></p>;
  if (c.estado === 'respondido') return <p className="plazo ok"><CheckCircle2 size={20} aria-hidden /><span>Si la respuesta no resuelve su caso, cuéntenos en Inicio.</span></p>;

  // Servicios públicos: la empresa puede contestar antes del plazo y, si dice que no, solo hay 5 días hábiles para el recurso.
  // Por eso se pregunta desde el primer día. El recurso procede contra cobros y cortes (Ley 142, art. 154); sin motivo guardado, se ofrece.
  if (esServicio(c)) {
    const recurrible = !c.motivo || MOTIVOS_SP.find(m => m.id === c.motivo)?.recurso;
    return (
      <div className="siguiente">
        {entregado}
        {!vencido && c.venc && <p className="plazo"><Clock size={20} aria-hidden /><span>{quien} a más tardar el <b>{fechaLarga(c.venc)}</b>.</span></p>}
        <p className="texto"><b>{vencido ? '¿Le respondieron?' : '¿Ya le respondió la empresa?'}</b></p>
        {!pregunta && (
          <div className="opciones-lista">
            <button onClick={() => guardar({ estado: 'respondido' })}><span className="emoji" aria-hidden>🎉</span><span><b>Sí, me dio la razón</b></span></button>
            <button onClick={() => setPregunta('negado')}><span className="emoji" aria-hidden>✋</span><span><b>Sí, pero me dijo que no</b></span></button>
            {vencido && <button onClick={() => setPregunta('no')}><span className="emoji" aria-hidden>🔕</span><span><b>No me respondieron</b></span></button>}
          </div>
        )}
        {pregunta === 'negado' && (c.tipo === 'recurso_servicios'
          ? <><div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.apelacion }} /><button className="btn-secundario" onClick={cerrar}>Cerrar el caso</button></>
          : !recurrible
            ? <><div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.sinRecurso }} /><button className="btn-secundario" onClick={cerrar}>Cerrar el caso</button></>
            : <ElegirFecha hoy={hoy} etiqueta="¿Qué día le avisaron la respuesta de la empresa?" boton="Guardar y ver el plazo"
                alGuardar={f => guardar({ estado: 'por_recurrir', rad: iso(f), notif: iso(f), venc: iso(sumarHabiles(f, TIPOS.recurso_servicios.presentar)), plazo: TIPOS.recurso_servicios.presentar })} />)}
        {pregunta === 'no' && <div className="texto" dangerouslySetInnerHTML={html(EXPLICA.silencio, c)} />}
        {pregunta && <button className="btn-enlace" onClick={() => setPregunta(null)}>Volver a las opciones</button>}
      </div>
    );
  }

  // Esperando (o impugnada): todavía hay plazo.
  if (!vencido) return <>{entregado}{c.venc && <p className="plazo"><Clock size={20} aria-hidden /><span>{quien} a más tardar el <b>{fechaLarga(c.venc)}</b>.</span></p>}</>;

  // Venció el plazo del juez: ¿qué decidió?
  if (esTutela(c) || c.estado === 'impugnada') return (
    <div className="siguiente">
      {entregado}
      <p className="texto"><b>¿Qué decidió el juez?</b></p>
      {!pregunta && (
        <div className="opciones-lista">
          <button onClick={() => setPregunta('favor')}><span className="emoji" aria-hidden>🎉</span><span><b>A mi favor</b><small>El juez me dio la razón</small></span></button>
          <button onClick={() => setPregunta('contra')}><span className="emoji" aria-hidden>✋</span><span><b>En contra</b><small>El juez me negó la tutela</small></span></button>
          <button onClick={() => setPregunta('aviso')}><span className="emoji" aria-hidden>⏳</span><span><b>No me han avisado</b></span></button>
        </div>
      )}
      {pregunta === 'favor' && <ElegirFecha hoy={hoy} etiqueta="¿Qué día le avisaron la decisión del juez?" alGuardar={f => guardar({ estado: 'ganada', rad: iso(f), venc: null })} />}
      {pregunta === 'contra' && (c.estado === 'impugnada'
        ? <><div className="texto" dangerouslySetInnerHTML={{ __html: EXPLICA.negadaDosVeces }} /><button className="btn-secundario" onClick={cerrar}>Cerrar el caso</button></>
        : <ElegirFecha hoy={hoy} etiqueta="¿Qué día le avisaron la decisión del juez?" boton="Guardar y ver el plazo"
            alGuardar={f => guardar({ estado: 'negada', rad: iso(f), venc: iso(sumarHabiles(f, TIPOS.impugnacion.presentar)), plazo: TIPOS.impugnacion.presentar })} />)}
      {pregunta === 'aviso' && <p className="texto">El juzgado le avisa la decisión por correo, por teléfono o en persona. Pregunte en el juzgado con su número de recibido, o pida ayuda en la Personería.</p>}
      {pregunta && <button className="btn-enlace" onClick={() => setPregunta(null)}>Volver a las opciones</button>}
    </div>
  );

  // Venció el plazo de la entidad o la empresa: ¿le respondieron?
  return (
    <div className="siguiente">
      {entregado}
      <p className="texto"><b>¿Le respondieron?</b></p>
      <div className="botones-opcion">
        <button onClick={() => guardar({ estado: 'respondido' })}>Sí, me respondieron</button>
        {c.tipo === 'peticion'
          ? <button className="sel" onClick={() => preparar('tutela_peticion')}>No: crear la tutela</button>
          : <button className="sel" onClick={() => setPregunta('no')}>No me respondieron</button>}
      </div>
      {pregunta === 'no' && <div className="texto" dangerouslySetInnerHTML={html(EXPLICA.silencio, c)} />}
    </div>
  );
}
