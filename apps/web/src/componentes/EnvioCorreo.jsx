// "Envíalo por correo": a la entidad o, si es una tutela, al juzgado (prototipo/api/correo.js).
// El servidor arma el mismo documento con las plantillas del núcleo, lo envía y responde con una constancia
// (número de envío, fecha y destinatario) que se guarda con el caso. Nombre y cédula pasan por el servidor
// solo para enviarlo: no se guardan ni quedan en los registros. Sin conexión, el envío espera en memoria.
import { useCallback, useEffect, useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { DIRECTORIO, paraJuzgado } from '@miderecho/nucleo';
import { useConexion } from '../lib/conexion.jsx';

const BASE = import.meta.env.VITE_API_URL || '';
const nuevoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const correoValido = s => /^[^\s@<>,;]+@[^\s@<>,;]+\.[a-z]{2,}$/i.test(s.trim());
const fechaHora = s => new Date(s).toLocaleString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

// A dónde va: una entidad de directorio.js (correo verificado) o, si no está ahí, el correo que escriba la persona.
export function destinoDe(tipo, d) {
  const clave = paraJuzgado(tipo) ? `juzgado:${d.municipio}`
    : d.entidad === `Alcaldía de ${d.municipio}` ? `alcaldia:${d.municipio}`
    : /Agencia Nacional de Tierras/i.test(d.entidad || '') ? 'ant' : '';
  return Object.hasOwn(DIRECTORIO, clave) ? { clave, ...DIRECTORIO[clave] } : null;
}

async function enviarCorreo(cuerpo) {
  try {
    const r = await fetch(`${BASE}/api/correo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout?.(20000) });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.ok ? j : { ok: false, error: j.error || `El servidor respondió ${r.status}` };
  } catch { return { ok: false, error: 'No se pudo conectar con el servidor' }; }
}

// Constancia de envío: en la pantalla del documento y en Mis casos.
export function Constancia({ k }) {
  return (
    <p className="plazo ok"><Mail size={16} aria-hidden /><span>
      {k.simulado ? 'Envío de prueba (no salió ningún correo)' : k.prueba ? 'Enviado al correo del equipo (prueba)' : 'Enviado por correo'} a <b>{k.entidad}</b> ({k.para}) el {fechaHora(k.fecha)}
      {k.id && <> · Número de envío: {k.id}</>}{k.codigo && <> · Código del caso: {k.codigo}</>}
    </span></p>
  );
}

export default function EnvioCorreo({ tipo, datos, alEnviar }) {
  const { enLinea } = useConexion();
  const judicial = paraJuzgado(tipo), dest = destinoDe(tipo, datos);
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ correo: '', copia: '', autorizaCopia: false, autoriza: false });
  const [estado, setEstado] = useState(null);   // null | 'enviando' | 'cola' | { error } | { constancia, copia }
  const [codigo] = useState(() => datos.envios?.at(-1)?.codigo || nuevoCodigo());   // la tutela de una petición enviada sigue con su código
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const para = dest || (correoValido(f.correo) && { clave: f.correo.trim(), nombre: datos.entidad, correo: f.correo.trim(), verificado: false });
  const copia = f.autorizaCopia && correoValido(f.copia) ? f.copia.trim() : undefined;
  const conDatos = datos.nombre && datos.cedula;

  const enviar = useCallback(async () => {
    setEstado('enviando');
    const r = await enviarCorreo({ tipo, destino: para.clave, copia, datos: { ...datos, codigo } });
    if (!r.ok) return setEstado({ error: r.error });
    const constancia = { ...r.constancia, codigo };
    alEnviar(constancia);
    setEstado({ constancia, copia: copia && r.copia });
  }, [tipo, para, copia, datos, codigo, alEnviar]);
  // En cola: sale solo apenas vuelve la conexión, mientras esta pantalla siga abierta.
  useEffect(() => { if (estado === 'cola' && enLinea) enviar(); }, [estado, enLinea, enviar]);

  if (judicial && !dest) return null;   // sin juzgado en el directorio para ese municipio: se entrega en persona
  if (estado?.constancia) return (
    <section className="tarjeta oliva">
      <CheckCircle2 size={20} aria-hidden />
      <h2>{judicial ? 'Tutela enviada al juzgado' : 'Documento enviado'}</h2>
      <Constancia k={estado.constancia} />
      {copia && <p className="suave">{estado.copia ? 'También enviamos una copia a tu correo.' : 'La copia a tu correo no se envió: en esta prueba solo llega a correos autorizados.'}</p>}
      <p className="suave">Tu nombre y tu cédula no se guardaron. Guarda el código {codigo}: con él puedes preguntar por tu caso.</p>
    </section>
  );
  if (!abierto) return (
    <button className="btn-secundario" onClick={() => setAbierto(true)}>
      <Mail size={18} aria-hidden /> {judicial ? 'Envíenla al juzgado por correo' : 'Envíenlo por mí por correo'}
    </button>
  );

  const nombreDestino = dest?.nombre || datos.entidad || 'la entidad';
  return (
    <section className="tarjeta clara formulario">
      <h2><Mail size={18} aria-hidden /> {judicial ? 'Enviar la tutela al juzgado' : 'Enviar por correo'}</h2>
      {!conDatos ? (
        <p className="suave">Para enviarlo necesitamos tu nombre y tu cédula en el documento. Vuelve atrás y escríbelos (o imprímelo y entrégalo a mano).</p>
      ) : (<>
        {dest
          ? <p className="suave">Va a <b>{dest.nombre}</b>: {dest.correo}.{!dest.verificado && <> <b>Ojo:</b> este correo no lo hemos verificado con una fuente oficial; revisa que sea el de la entidad.</>}</p>
          : <div className="campo">
              <span className="etiqueta">Correo de {nombreDestino}</span>
              <input type="email" value={f.correo} onChange={e => set('correo', e.target.value)} autoComplete="off" placeholder="Búscalo en la factura o en su página web" />
              <small className="ayuda">No está en nuestro directorio: no lo hemos verificado. Revisa que sea el correo oficial para peticiones o reclamos.</small>
            </div>}
        {/* [validar] Decreto 2591 de 1991, art. 14, y Ley 2213 de 2022: tutela por correo, sin abogado y sin firma a mano */}
        {judicial && <p className="suave">La tutela se puede presentar por correo, sin abogado y sin firma a mano (Decreto 2591 de 1991, artículo 14, y Ley 2213 de 2022). El juzgado te avisa a los datos de contacto que pusiste en el documento.</p>}
        <div className="campo">
          <span className="etiqueta">Tu correo, si quieres una copia (opcional)</span>
          <input type="email" value={f.copia} onChange={e => set('copia', e.target.value)} autoComplete="off" />
        </div>
        <label className="check"><input type="checkbox" checked={f.autorizaCopia} onChange={e => set('autorizaCopia', e.target.checked)} /> Envíenme una copia y que {judicial ? 'el juzgado' : 'la entidad'} me pueda responder a ese correo.</label>
        <label className="check"><input type="checkbox" checked={f.autoriza} onChange={e => set('autoriza', e.target.checked)} /> Autorizo a MiDerecho a enviar este documento en mi nombre a {nombreDestino}. Mi nombre y mi cédula pasan por su servidor solo para enviarlo y no se guardan.</label>
        {estado === 'cola' && <p className="nota-privacidad">Sin conexión: se envía solo apenas vuelva la señal. No cierres esta pantalla; si la cierras, tendrás que enviarlo de nuevo.</p>}
        {estado?.error && <p className="aviso-error"><AlertTriangle size={14} aria-hidden /> {estado.error}. Puedes intentarlo otra vez o entregarlo a mano.</p>}
        <button className="btn-primario" disabled={!f.autoriza || !para || estado === 'enviando' || estado === 'cola'} onClick={() => (enLinea ? enviar() : setEstado('cola'))}>
          {estado === 'enviando' ? <><Loader2 className="girar" size={18} aria-hidden /> Enviando…</> : estado?.error ? 'Enviar de nuevo' : 'Enviar ahora'}
        </button>
      </>)}
    </section>
  );
}
