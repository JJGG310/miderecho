// "Envíalo por correo": a la entidad o, si es una tutela, al juzgado (prototipo/api/correo.js).
// Primero pregunta al servidor en qué modo está (GET /api/correo): si es simulado o de prueba, el botón lo dice y el caso NO
// se guarda como entregado. Al enviar, el documento completo (nombre, cédula, contacto y lo que contó la persona) pasa por el
// servidor de MiDerecho, que no lo guarda, y por Resend (Estados Unidos), que guarda una copia 30 días. En el celular solo queda
// la constancia (número de envío, fecha y destinatario). Sin señal, el envío espera en la cola cifrada (lib/cola.js), sale solo
// al volver la señal y el plazo empieza a contar ese día; mientras tanto el caso queda en Mis casos como "por enviar".
import { useCallback, useEffect, useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { DIRECTORIO, paraJuzgado, TIPOS, deIso, iso, sumarHabiles } from '@miderecho/nucleo';
import { useConexion } from '../lib/conexion.jsx';
import { almacen } from '../lib/almacen.js';
import { encolar, alEnviarse } from '../lib/cola.js';

const BASE = import.meta.env.VITE_API_URL || '';
const nuevoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const correoValido = s => /^[^\s@<>,;]+@[^\s@<>,;]+\.[a-z]{2,}$/i.test(String(s || '').trim());
const fechaHora = s => new Date(s).toLocaleString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

// A dónde va: una entidad de directorio.js (correo verificado) o, si no está ahí, el correo que escriba la persona.
export function destinoDe(tipo, d) {
  const clave = paraJuzgado(tipo) ? `juzgado:${d.municipio}`
    : d.entidad === `Alcaldía de ${d.municipio}` ? `alcaldia:${d.municipio}`
    : /Agencia Nacional de Tierras/i.test(d.entidad || '') ? 'ant' : '';
  return Object.hasOwn(DIRECTORIO, clave) ? { clave, ...DIRECTORIO[clave] } : null;
}

async function pedir(cuerpo) {
  try {
    const r = await fetch(`${BASE}/api/correo`, cuerpo
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout?.(20000) }
      : { signal: AbortSignal.timeout?.(10000) });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.ok ? j : { ok: false, error: j.error || `El servidor respondió ${r.status}` };
  } catch { return { ok: false, error: 'No se pudo conectar con el servidor' }; }
}

// Al salir de la cola: la constancia reemplaza al pendiente y el plazo cuenta desde ese día. Una prueba no cuenta como entregado.
const conPendiente = id => almacen.casos().find(c => c.envios?.some(k => k.pendiente === id));
const sinPendiente = (c, id, cambios) => almacen.guardarCaso({ ...c, envios: c.envios.filter(k => k.pendiente !== id), ...cambios });
alEnviarse('correo', (r, e) => {
  const c = conPendiente(e.id), k = { ...r.constancia, codigo: e.datos.datos.codigo }, hoy = new Date();
  if (!c) return;
  if (k.simulado || k.prueba) return sinPendiente(c, e.id, { envioFallido: 'No se envió de verdad (modo de prueba). Entréguelo a mano.' });
  sinPendiente(c, e.id, { envios: [...c.envios.filter(x => x.pendiente !== e.id), k], envioFallido: undefined, rad: iso(hoy), venc: c.plazo ? iso(sumarHabiles(hoy, c.plazo)) : c.venc });
}, (r, e) => {
  const c = conPendiente(e.id);
  if (c) sinPendiente(c, e.id, { envioFallido: `No se pudo enviar por correo: ${r.error}. Entréguelo a mano.` });
});

// Constancia de un envío real: en la pantalla del documento y en Mis casos. Si espera señal, lo dice.
export function Constancia({ k }) {
  if (k.pendiente) return (
    <p className="plazo"><Mail size={16} aria-hidden /><span>
      Sin señal: lo enviamos por correo a <b>{k.entidad}</b> ({k.para}) apenas vuelva. El plazo empieza a contar ese día.{k.codigo && <> · Código del caso: {k.codigo}</>}
    </span></p>
  );
  return (
    <p className="plazo ok"><Mail size={16} aria-hidden /><span>
      Enviado por correo a <b>{k.entidad}</b> ({k.para}) el {fechaHora(k.fecha)}
      {k.id && <> · Número de envío: {k.id}</>}{k.codigo && <> · Código del caso: {k.codigo}</>}
    </span></p>
  );
}

export default function EnvioCorreo({ tipo, datos, alAbrir, alEnviar }) {
  const { enLinea } = useConexion();
  const judicial = paraJuzgado(tipo), dest = destinoDe(tipo, datos);
  const [modo, setModo] = useState(null);   // lo que dice GET /api/correo; null mientras no se sepa
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ correo: '', copia: '', autorizaCopia: false, autoriza: false, codigo: '' });
  const [estado, setEstado] = useState(null);   // null | 'enviando' | 'cola' | { error } | { constancia, copia }
  const [codigoPedido, setCodigoPedido] = useState(false);
  const [codigo] = useState(() => datos.envios?.at(-1)?.codigo || nuevoCodigo());   // la tutela de una petición enviada sigue con su código
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  useEffect(() => { if (enLinea && !modo) pedir().then(j => j.ok && setModo(j)); }, [enLinea, modo]);

  const deMentira = modo?.simulado || modo?.prueba;
  const para = dest || (correoValido(f.correo) && { clave: f.correo.trim(), nombre: datos.entidad, correo: f.correo.trim(), verificado: false });
  const copia = f.autorizaCopia && correoValido(f.copia) ? f.copia.trim() : undefined;
  const copiaPermitida = modo?.libre !== false;   // en modo simulado o de prueba sin lista, el servidor no manda copias
  const avisos = [datos.telefono && `al celular ${datos.telefono}`, correoValido(datos.direccion) && `al correo ${datos.direccion}`, copiaPermitida && copia && `al correo ${copia}`].filter(Boolean);
  const previo = dest && almacen.casos().find(c => c.tipo === tipo && c.envios?.some(k => k.para === dest.correo));
  const listo = f.autoriza && para && (!judicial || avisos.length) && (!modo?.verificar || /^\d{6}$/.test(f.codigo));

  const enviar = useCallback(async () => {
    setEstado('enviando');
    const r = await pedir({ tipo, destino: para.clave, copia, datos: { ...datos, codigo }, ...(modo?.verificar && { verificacion: { codigo: f.codigo } }) });
    if (!r.ok) return setEstado({ error: r.error });
    const constancia = { ...r.constancia, codigo };
    if (!constancia.simulado && !constancia.prueba) alEnviar(constancia);   // una prueba no cuenta como entregado
    else alAbrir(null);   // y el documento vuelve a la versión para imprimir y firmar
    setEstado({ constancia, copia: copia && r.copia });
  }, [tipo, para, copia, datos, codigo, modo, f.codigo, alEnviar]);
  // Sin señal: a la cola cifrada, y el caso queda en Mis casos como "por enviar" (sale solo al volver la señal).
  const encolarCorreo = () => {
    const id = encolar('correo', { tipo, destino: para.clave, copia, datos: { ...datos, codigo }, ...(modo?.verificar && { verificacion: { codigo: f.codigo } }) });
    alEnviar({ pendiente: id, entidad: para.nombre || datos.entidad, para: para.correo, codigo, fecha: new Date().toISOString() });
    setEstado('cola');
  };

  if ((judicial && !dest) || modo?.cerrado) return null;   // sin juzgado en el directorio, o envíos cerrados: se entrega en persona
  const k = estado?.constancia;
  if (k && (k.simulado || k.prueba)) return (
    <section className="tarjeta riesgo">
      <AlertTriangle size={20} aria-hidden />
      <h2>No se envió de verdad (modo de prueba)</h2>
      <p className="suave">{k.prueba ? `El correo llegó al equipo de MiDerecho, no a ${k.entidad}.` : `No salió ningún correo: ${k.entidad} no recibió nada.`} Tu caso no quedó como entregado. Entrégalo a mano o guarda el PDF.</p>
    </section>
  );
  if (k) return (
    <section className="tarjeta oliva">
      <CheckCircle2 size={20} aria-hidden />
      <h2>{judicial ? 'Tutela enviada al juzgado' : 'Documento enviado'}</h2>
      <Constancia k={k} />
      {copia && <p className="suave">{estado.copia ? 'También enviamos una copia a tu correo.' : 'La copia a tu correo no se envió: ese correo no está autorizado.'}</p>}
      <p className="suave">Guarda el código {codigo}: con él puedes preguntar por tu caso.</p>
    </section>
  );
  if (!abierto) return (
    <button className="btn-secundario" onClick={() => { setAbierto(true); alAbrir({ porCorreo: true, ...(dest && !judicial && { entidad: dest.nombre, correo: dest.correo }) }); }}>
      <Mail size={18} aria-hidden /> {modo?.simulado ? `Probar envío (no llega ${judicial ? 'al juzgado' : 'a la entidad'})`
        : modo?.prueba ? 'Probar envío (llega al equipo, no a la entidad)' : judicial ? 'Envíenla al juzgado por correo' : 'Envíenlo por mí por correo'}
    </button>
  );

  const nombreDestino = dest?.nombre || datos.entidad || 'la entidad';
  const salud = tipo === 'tutela_salud' || datos.derecho === 'salud';
  if (!datos.nombre || !datos.cedula) return (
    <section className="tarjeta clara"><p className="suave">Para enviarlo necesitamos tu nombre y tu cédula en el documento. Vuelve atrás y escríbelos (o imprímelo y entrégalo a mano).</p></section>
  );
  return (
    <section className="tarjeta clara formulario">
      <h2><Mail size={18} aria-hidden /> {judicial ? 'Enviar la tutela al juzgado' : 'Enviar por correo'}</h2>
      {deMentira && <p className="nota-privacidad">Modo de prueba: {modo.prueba ? `el correo llega al equipo de MiDerecho, no a ${nombreDestino}` : `no sale ningún correo; ${nombreDestino} no recibe nada`}.</p>}
      {dest
        ? <p className="suave">Va a <b>{dest.nombre}</b>: {dest.correo}.{!dest.verificado && <> <b>Ojo:</b> este correo no lo hemos verificado con una fuente oficial; revisa que sea el de la entidad.</>}</p>
        : modo?.libre === false
          ? <p className="suave">{nombreDestino} no está en nuestro directorio. Imprímelo y entrégalo, o envíalo tú desde tu correo.</p>
          : <div className="campo">
              <span className="etiqueta">Correo de {nombreDestino}</span>
              <input type="email" value={f.correo} onChange={e => set('correo', e.target.value)} autoComplete="off" placeholder="Búscalo en la factura o en su página web" />
              <small className="ayuda">No está en nuestro directorio: no lo hemos verificado. Revisa que sea el correo oficial para peticiones o reclamos.{modo?.libre === 'lista' && ' En esta prueba solo llega a correos autorizados del equipo.'}</small>
            </div>}
      {previo && <p className="aviso-error"><AlertTriangle size={14} aria-hidden /> Ya enviaste {TIPOS[tipo].corto} a {dest.nombre} el {deIso(previo.rad).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}. {judicial ? 'Presentar dos veces la misma tutela puede traerte una sanción (temeridad).' : `Si no te han respondido, revisa el plazo en Mis casos antes de enviar${TIPOS[tipo].corto.startsWith('la') ? 'la' : 'lo'} otra vez.`}</p>}

      {/* [validar] Decreto 2591 de 1991, art. 14, y Ley 2213 de 2022: tutela por correo, sin abogado y sin firma a mano */}
      {judicial && <p className="suave">La tutela se puede presentar por correo, sin abogado y sin firma a mano (Decreto 2591 de 1991, artículo 14, y Ley 2213 de 2022).</p>}
      <div className="campo">
        <span className="etiqueta">Tu correo{judicial && !datos.telefono ? ', para que el juzgado te avise' : ', si quieres una copia (opcional)'}</span>
        <input type="email" value={f.copia} onChange={e => set('copia', e.target.value)} autoComplete="off" />
      </div>
      <label className="check"><input type="checkbox" checked={f.autorizaCopia} onChange={e => set('autorizaCopia', e.target.checked)} /> Envíenme una copia y que {judicial ? 'el juzgado' : 'la entidad'} me pueda responder a ese correo.</label>
      {judicial
        ? (avisos.length
          ? <p className="suave">El juzgado te avisará {avisos.join(' o ')}. Si el juez decide en tu contra, tienes solo <b>3 días hábiles</b> para impugnar desde que te avise: estate pendiente.</p>
          : <p className="aviso-error">Para que el juzgado te pueda avisar necesitamos tu celular o tu correo: vuelve y escribe tu celular{copiaPermitida ? ', o escribe tu correo arriba y marca la copia' : ''}.</p>)
        : <p className="suave">La respuesta llegará a lo que pusiste en el documento{copia ? ' y a tu correo' : ''}.</p>}

      {modo?.verificar && (datos.telefono
        ? <div className="campo">
            <span className="etiqueta">Código que te llega por SMS al {datos.telefono}</span>
            <button type="button" className="btn-secundario" onClick={async () => { const r = await pedir({ accion: 'codigo', telefono: datos.telefono }); r.ok ? setCodigoPedido(true) : setEstado({ error: r.error }); }}>{codigoPedido ? 'Enviarme otro código' : 'Enviarme el código'}</button>
            {codigoPedido && <input value={f.codigo} onChange={e => set('codigo', e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="6 números" />}
            <small className="ayuda">Así confirmamos que eres tú quien envía el documento.</small>
          </div>
        : <p className="aviso-error">Para enviarlo necesitamos confirmar tu celular con un código: vuelve y escríbelo en tus datos.</p>)}

      <label className="check"><input type="checkbox" checked={f.autoriza} onChange={e => set('autoriza', e.target.checked)} /> Autorizo a MiDerecho a enviar en mi nombre este documento completo a {nombreDestino}{para ? ` (${para.correo})` : ''}. Lleva mi nombre, mi cédula, mis datos de contacto y lo que conté{salud ? ', incluida información de mi salud' : ''}. El correo sale por Resend, un servicio de Estados Unidos que guarda una copia por 30 días. MiDerecho no lo guarda.</label>
      {estado === 'cola' && <p className="nota-privacidad" role="status">Sin señal: lo enviamos apenas vuelva. Mientras tanto queda guardado cifrado en este celular, con tu clave; puedes cerrar esta pantalla. En Mis casos verás cuándo salga.</p>}
      {estado?.error && <p className="aviso-error"><AlertTriangle size={14} aria-hidden /> {estado.error}. Puedes intentarlo otra vez o entregarlo a mano.</p>}
      <button className="btn-primario" disabled={!listo || estado === 'enviando' || estado === 'cola'} onClick={() => (enLinea ? enviar() : encolarCorreo())}>
        {estado === 'enviando' ? <><Loader2 className="girar" size={18} aria-hidden /> Enviando…</> : estado?.error ? 'Enviar de nuevo' : !enLinea ? 'Enviar apenas vuelva la señal' : deMentira ? 'Probar el envío' : 'Enviar ahora'}
      </button>
      <button className="btn-secundario" onClick={() => { setAbierto(false); setEstado(null); alAbrir(null); }}>Mejor no lo envío</button>
    </section>
  );
}
