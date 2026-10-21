// Avisos de los plazos y llamada del asistente (lógica en lib/avisos.js).
// - AvisoPlazos: en Inicio, plazos que vencen hoy o mañana (sin internet).
// - ElegirAvisos: "¿Cómo quiere que le avisemos?" al guardar un caso y en Mis casos. Autorización expresa por canal.
// - EstadoAvisos: en cada caso de Mis casos, qué avisos tiene y botón para cambiarlos.
// - LlamadaAsistente: en Mis casos, "Que el asistente lo llame" ahora o a una hora escogida.
import { useState } from 'react';
import { AlertTriangle, Bell, Phone } from 'lucide-react';
import { deIso } from '@miderecho/nucleo';
import { BotonVoz } from './comunes.jsx';
import { almacen } from '../lib/almacen.js';
import { ir } from '../lib/ruta.js';
import { CANALES, fechasAviso, nuevoCodigo, activarPush, programar, cancelarAvisos, plazosCercanos, llamadaAgendada, pedirLlamada, cancelarLlamada } from '../lib/avisos.js';

const corta = f => 'el ' + deIso(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
const enLista = xs => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`;
const MES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaSms = f => { const d = deIso(f); return `${d.getDate()}-${MES3[d.getMonth()]}`; };   // como lo escribe el cron
const celularValido = s => /^(\+?57)?3\d{9}$/.test(s.replace(/[\s().-]/g, ''));
const TELEFONO = ['sms', 'whatsapp', 'llamada'];
const AUTORIZA = {
  push: 'Acepto notificaciones en este celular',
  sms: 'Acepto SMS a mi celular',
  whatsapp: 'Acepto mensajes de WhatsApp a mi celular',
  llamada: 'Acepto una llamada con voz grabada (sirve si prefiere escuchar)',
};

// El texto "Le recordaremos el…" solo si de verdad hay un canal activo.
export function resumenAvisos(caso) {
  const fechas = fechasAviso(caso).map(corta), canales = Object.keys(caso.avisos || {}).map(k => CANALES[k]);
  if (!fechas.length) return canales.length ? 'Ya pasaron las fechas de los avisos.' : '';
  return canales.length ? `Le recordaremos ${enLista(fechas)} por ${enLista(canales)}.` : `Abra Mis casos ${enLista(fechas)} para revisar su plazo.`;
}

export function AvisoPlazos() {
  const lineas = plazosCercanos(almacen.casos());
  if (!lineas.length) return null;
  return (
    <section className="tarjeta tierra" role="alert">
      <AlertTriangle size={20} aria-hidden />
      <h2>Plazos para revisar <BotonVoz texto={lineas.join(' ')} /></h2>
      {lineas.map(l => <p key={l} className="suave">{l}</p>)}
      <button className="btn-secundario" onClick={() => ir('casos')}>Ver mis casos</button>
    </section>
  );
}

export function ElegirAvisos({ caso: inicial, alGuardar, tarjeta = true }) {
  const [caso, setCaso] = useState(() => ({ ...inicial, codigo: inicial.codigo || nuevoCodigo() }));
  const activos = caso.avisos || {};
  const [sel, setSel] = useState(() => Object.fromEntries(Object.keys(CANALES).map(k => [k, k in activos])));
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState(null);   // null | 'guardando' | { errores, simulado }
  const fechas = fechasAviso(caso);
  const pideTelefono = TELEFONO.some(k => sel[k] && !(k in activos));
  const cambio = Object.keys(CANALES).some(k => sel[k] !== (k in activos));
  const listo = cambio && (!pideTelefono || celularValido(telefono)) && estado !== 'guardando';
  const ejemplo = fechas.length && `Caso ${caso.codigo}: recordatorio del ${fechaSms(fechas[0])}. Si la entidad no le ha respondido, avise a su lider.`;
  const lectura = `¿Cómo quiere que le avisemos? ${resumenAvisos({ ...caso, avisos: {} })} Puede escoger notificación en este celular, SMS, WhatsApp o una llamada con voz grabada. Cada aviso dice solo el código del caso y la fecha.`;

  const guardar = async e => {
    e.preventDefault();
    setEstado('guardando');
    const avisos = { ...activos }, errores = [];
    let simulado = false;
    for (const k of Object.keys(avisos)) if (!sel[k]) { cancelarAvisos({ codigo: caso.codigo, avisos: { [k]: avisos[k] } }); delete avisos[k]; }
    if (sel.push && !('push' in avisos)) {
      const a = await activarPush();   // primero: el permiso del navegador necesita el toque
      const r = a.ok && !a.simulado ? await programar(caso, 'push', { suscripcion: a.suscripcion }) : a;
      if (r.ok) { avisos.push = r.token || ''; simulado ||= !!r.simulado; } else errores.push(`Notificación: ${r.error}`);
    }
    for (const k of TELEFONO) if (sel[k] && !(k in avisos)) {
      const r = await programar(caso, k, { telefono });
      if (r.ok) { avisos[k] = r.token; simulado ||= !!r.simulado; } else errores.push(`${CANALES[k][0].toUpperCase() + CANALES[k].slice(1)}: ${r.error}`);
    }
    const nuevo = { ...caso, avisos };
    almacen.guardarCaso(nuevo);
    setCaso(nuevo);
    setSel(Object.fromEntries(Object.keys(CANALES).map(k => [k, k in avisos])));
    setTelefono('');   // el número no se guarda en el celular
    setEstado({ errores, simulado });
    alGuardar?.(nuevo);
  };

  if (!fechas.length) return null;
  return (
    <section className={tarjeta ? 'tarjeta clara' : ''}>
      <form className="formulario" onSubmit={guardar}>
        <h2>¿Cómo quiere que le avisemos? <BotonVoz texto={lectura} /></h2>
        <p className="suave">Escoja una o varias formas. Cada aviso dice solo el código del caso ({caso.codigo}) y la fecha, por ejemplo: «{ejemplo}»</p>
        {Object.keys(CANALES).map(k => (
          <label key={k} className="check grande">
            <input type="checkbox" checked={sel[k]} onChange={e => setSel(s => ({ ...s, [k]: e.target.checked }))} /> {AUTORIZA[k]}
          </label>
        ))}
        {sel.push && !('push' in activos) && <small className="ayuda">La notificación se ve aunque el celular esté bloqueado. Si otra persona usa este celular, piénselo.</small>}
        {pideTelefono && (
          <div className="campo">
            <span className="etiqueta">Su celular</span>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="Ej.: 310 123 4567" aria-label="Su celular" />
            {telefono && !celularValido(telefono) && <small className="ayuda error">Debe tener 10 dígitos y empezar por 3.</small>}
            <small className="ayuda">Al marcar, usted autoriza usar este número solo para estos avisos. No se guarda en este celular; en el servidor queda cifrado y se borra 3 días después del último aviso.</small>
          </div>
        )}
        <button className="btn-primario" type="submit" disabled={!listo}>{estado === 'guardando' ? 'Guardando…' : 'Guardar avisos'}</button>
        {tarjeta && <p className="plazo" role="status"><Bell size={16} aria-hidden /><span>{resumenAvisos(caso)}</span></p>}
        {estado?.simulado && <p className="nota-privacidad">Modo de prueba: el servidor todavía no tiene las claves, así que no se envía nada de verdad.</p>}
        {estado?.errores?.map(x => <p key={x} className="aviso-error">{x}</p>)}
        <small className="ayuda">Puede quitar los avisos cuando quiera: desmarque y guarde, o borre el caso.</small>
      </form>
    </section>
  );
}

export function EstadoAvisos({ caso, alCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const resumen = resumenAvisos(caso);
  if (!resumen) return null;
  return (<>
    <p className="plazo"><Bell size={16} aria-hidden /><span>{resumen}{caso.codigo && Object.keys(caso.avisos || {}).length ? ` Código ${caso.codigo}.` : ''}</span></p>
    {abierto
      ? <ElegirAvisos caso={caso} tarjeta={false} alGuardar={alCambiar} />
      : <button className="btn-secundario" onClick={() => setAbierto(true)}>{Object.keys(caso.avisos || {}).length ? 'Cambiar avisos' : 'Activar avisos'}</button>}
  </>);
}

// ---------- llamada del asistente ----------
const SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const colombia = () => new Date(Date.now() - 5 * 3600e3);   // Colombia no cambia de hora: UTC-5 (se leen los campos UTC)
const enHorario = () => { const h = colombia().getUTCHours(); return h >= 8 && h < 19; };
const hora = h => `${h > 12 ? h - 12 : h} ${h < 12 ? 'a. m.' : h === 12 ? 'm.' : 'p. m.'}`;
const diaLargo = d => `${SEMANA[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
const punto = s => (s.endsWith('.') ? s : s + '.');   // "a las 9 a. m." ya termina en punto

// Franjas de una hora, de 8 a. m. a 6 p. m.; hoy, solo las que empiezan en más de 10 minutos. Hasta 6 días adelante.
function franjas() {
  const ahora = colombia(), minutos = ahora.getUTCHours() * 60 + ahora.getUTCMinutes();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ahora.getTime() + i * 864e5), horas = [];
    for (let h = 8; h <= 18; h++) if (i || h * 60 >= minutos + 10) horas.push(h);
    return { dia: d.toISOString().slice(0, 10), nombre: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : diaLargo(d), fecha: d, horas };
  }).filter(f => f.horas.length);
}

export function LlamadaAsistente({ casos }) {
  const [abierto, setAbierto] = useState(false);
  const [agendada, setAgendada] = useState(llamadaAgendada);
  const [fs] = useState(franjas);
  const [f, setF] = useState({ telefono: '', caso: '', dia: 0, hora: fs[0]?.horas[0], acepto: false });
  const [estado, setEstado] = useState(null);   // null | 'enviando' | { texto, simulado } | { error }
  const abiertos = casos.filter(c => c.estado === 'esperando' && c.venc);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const listo = celularValido(f.telefono) && f.acepto && estado !== 'enviando';
  const lectura = 'Que el asistente lo llame. El asistente automático de MiDerecho lo llama a su celular para recordarle sus plazos o decirle qué documento le puede servir. No es un abogado. Escriba su celular, escoja el día y la hora, y autorice la llamada.';

  const pedir = async ahora => {
    setEstado('enviando');
    let c = abiertos.find(x => x.id === f.caso);
    if (c && !c.codigo) { c = { ...c, codigo: nuevoCodigo() }; almacen.guardarCaso(c); }   // el mismo código que dirán los avisos
    const franja = fs[f.dia], texto = ahora ? '' : `${diaLargo(franja.fecha)}, ${f.hora === 13 ? 'a la' : 'a las'} ${hora(f.hora)}`;
    const r = await pedirLlamada({ telefono: f.telefono, acepto: f.acepto, codigo: c?.codigo, vence: c?.venc,
      cuando: ahora ? undefined : `${franja.dia}T${String(f.hora).padStart(2, '0')}:00-05:00`, texto });
    if (!r.ok) return setEstado({ error: r.error });
    setF(x => ({ ...x, telefono: '', acepto: false }));   // el número no se guarda en el celular
    setAgendada(llamadaAgendada());
    setEstado({ texto: ahora ? 'En unos segundos le entra una llamada. Contéstela: es el asistente automático de MiDerecho.' : `Lo llamamos el ${punto(texto)} Tenga el celular a la mano.`, simulado: r.simulado });
  };
  const cancelar = async () => { await cancelarLlamada(); setAgendada(null); setEstado({ texto: 'Llamada cancelada.' }); };

  return (
    <section className="tarjeta oliva"><div className="formulario">
      <Phone size={20} aria-hidden />
      <h2>Que el asistente lo llame <BotonVoz texto={lectura} /></h2>
      <p className="suave">El asistente automático de MiDerecho lo llama para recordarle sus plazos o decirle qué documento le puede servir. No es un abogado. Recibir la llamada no le cuesta.</p>
      {agendada && (<>
        <p className="plazo ok"><Phone size={16} aria-hidden /><span>Tiene una llamada agendada para el <b>{punto(agendada.texto)}</b></span></p>
        <button className="btn-secundario" onClick={cancelar}>Cancelar la llamada agendada</button>
      </>)}
      {estado?.texto && <p className="nota-privacidad" role="status">{estado.texto}</p>}
      {estado?.simulado && <p className="nota-privacidad">Modo de prueba: el servidor todavía no tiene las claves, así que no se hace la llamada de verdad.</p>}
      {!abierto ? <button className="btn-primario" onClick={() => setAbierto(true)}>Pedir una llamada</button> : (
        <form className="formulario" onSubmit={e => { e.preventDefault(); if (listo) pedir(e.nativeEvent.submitter?.value === 'ahora'); }}>
          <div className="campo">
            <span className="etiqueta">Su celular</span>
            <input value={f.telefono} onChange={e => set('telefono', e.target.value)} inputMode="tel" autoComplete="tel" placeholder="Ej.: 310 123 4567" aria-label="Su celular" required />
            {f.telefono && !celularValido(f.telefono) && <small className="ayuda error">Debe tener 10 dígitos y empezar por 3.</small>}
          </div>
          {abiertos.length > 0 && (
            <div className="campo">
              <span className="etiqueta">¿Sobre qué caso?</span>
              <select value={f.caso} onChange={e => set('caso', e.target.value)} aria-label="¿Sobre qué caso?">
                <option value="">Ninguno: quiero que me orienten</option>
                {abiertos.map(c => <option key={c.id} value={c.id}>{c.titulo} · {c.entidad}</option>)}
              </select>
            </div>
          )}
          <div className="fila-2">
            <div className="campo">
              <span className="etiqueta">Día</span>
              <select value={f.dia} onChange={e => setF(x => ({ ...x, dia: +e.target.value, hora: fs[+e.target.value].horas[0] }))} aria-label="Día">
                {fs.map((x, i) => <option key={x.dia} value={i}>{x.nombre}</option>)}
              </select>
            </div>
            <div className="campo">
              <span className="etiqueta">Hora de Colombia</span>
              <select value={f.hora} onChange={e => set('hora', +e.target.value)} aria-label="Hora de Colombia">
                {fs[f.dia]?.horas.map(h => <option key={h} value={h}>{hora(h)}</option>)}
              </select>
            </div>
          </div>
          <label className="check grande"><input type="checkbox" checked={f.acepto} onChange={e => set('acepto', e.target.checked)} /> Acepto que MiDerecho me llame a este número para esta llamada</label>
          <small className="ayuda">Su número no se guarda en este celular; en el servidor queda cifrado solo hasta la llamada. No le vamos a pedir su cédula ni su nombre. Puede llamarlo un número desconocido, incluso de otro país. Si contesta el buzón de voz, se cuelga sin dejar mensaje.</small>
          <button className="btn-primario" type="submit" value="agendar" disabled={!listo}>{estado === 'enviando' ? 'Un momento…' : 'Agendar la llamada'}</button>
          <button className="btn-secundario" type="submit" value="ahora" disabled={!listo || !enHorario()}>Llámenme ahora</button>
          {!enHorario() && <small className="ayuda">Ahora no podemos llamar: llamamos de 8 a. m. a 7 p. m.</small>}
          {estado?.error && <p className="aviso-error" role="alert">{estado.error}</p>}
        </form>
      )}
    </div></section>
  );
}
