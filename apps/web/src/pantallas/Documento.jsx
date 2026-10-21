import { useMemo, useState } from 'react';
import { FileText, Stethoscope, Lightbulb as Bombillo, Scale, Printer, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { TIPOS, generarDocumento, MUNICIPIOS, TEMAS, PETICIONES_EXTRA, PLAZOS, SERVICIOS, MOTIVOS_SP, SALUD_NIEGA, DERECHOS, EXPLICA, sumarHabiles, iso } from '@miderecho/nucleo';
import { Encabezado, Titulo, BotonVoz } from '../componentes/comunes.jsx';
import { almacen } from '../lib/almacen.js';
import { ir, memoria } from '../lib/ruta.js';

const DESDE = ['hace una semana', 'hace un mes', 'hace tres meses', 'hace seis meses', 'hace más de un año'];
const MENU = [
  ['peticion', FileText, 'Derecho de petición', 'Pedirle algo a la alcaldía, la EPS u otra entidad'],
  ['servicios_publicos', Bombillo, 'Reclamo de servicios públicos', 'Cobros de más, cortes o daños en agua, luz o gas'],
  ['tutela_salud', Stethoscope, 'Tutela de salud', 'La EPS niega algo urgente que ordenó el médico'],
  ['tutela', Scale, 'Tutela', 'Pedirle a un juez que proteja otro derecho'],
];

export default function Documento({ tipo }) {
  if (!tipo) return <Menu />;
  if (tipo === 'tutela_peticion') return <TutelaDeCaso />;
  if (!TIPOS[tipo]) { ir('documento'); return null; }
  return <Formulario tipo={tipo} />;
}

function Menu() {
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura="Crear un documento. Escoge qué necesitas: derecho de petición, reclamo de servicios públicos, tutela de salud o tutela.">Crear un documento</Titulo>
      <p className="texto">Escoge el documento. Si no sabes cuál, vuelve al inicio y cuéntanos qué pasa.</p>
      <section className="tarjeta clara lista-temas">
        <ul>
          {MENU.map(([id, Icono, t, s]) => (
            <li key={id}><button onClick={() => { memoria.orientacion = null; ir('documento', id); }}>
              <Icono className="tema-icono" size={28} strokeWidth={2} aria-hidden />
              <span className="tema-texto"><b>{t}</b><small>{s}</small></span>
              <ChevronRight size={20} aria-hidden />
            </button></li>
          ))}
        </ul>
      </section>
      <p className="nota-modo">Todos son gratis y no necesitan abogado. Plantillas en borrador, pendientes de validación jurídica.</p>
    </main>
  );
}

// Valores iniciales: lo que el asistente ya entendió (sin datos personales).
function inicial(tipo) {
  const d = memoria.orientacion?.documento === tipo ? memoria.orientacion.datos || {} : {};
  const base = { municipio: '', vereda: '', entidad: '', desde: d.desde || 'hace un mes', palabras: '', modo: 'mano' };
  if (tipo === 'peticion') {
    const tema = TEMAS.find(t => t.id === d.temaId) || TEMAS[0];
    return { ...base, temaId: tema.id, sel: tema.peticion ? [tema.peticion] : [] };
  }
  if (tipo === 'servicios_publicos') {
    const motivo = MOTIVOS_SP.find(m => m.id === d.motivo) || MOTIVOS_SP[0];
    return { ...base, servicio: d.servicio || 'acueducto', motivo: motivo.id, cuenta: '', sel: [...motivo.peticiones] };
  }
  if (tipo === 'tutela_salud') return { ...base, derecho: 'salud', que: d.que || 'cita', detalle: '', pidio: 'negada', urgente: d.urgente ? 'si' : 'no', afectado: 'propio', pruebas: [] };
  return { ...base, derecho: d.derecho || 'minimo_vital', detalle: '', pidio: 'sin_respuesta', urgente: 'no', afectado: 'propio', pruebas: [] };
}

function Formulario({ tipo }) {
  const [c, setC] = useState(() => inicial(tipo));
  // Pasos: el caso → tus datos (solo aquí se piden) → el documento.
  const [paso, setPaso] = useState('caso');
  const [persona, setPersona] = useState(PERSONA_VACIA);
  const set = (k, v) => setC(x => ({ ...x, [k]: v }));
  const alternar = (k, v) => setC(x => ({ ...x, [k]: x[k].includes(v) ? x[k].filter(y => y !== v) : [...x[k], v] }));
  const municipio = MUNICIPIOS.find(m => m.nombre === c.municipio);
  const t = TIPOS[tipo];

  // Peticiones disponibles y plazo según la Ley 1755 (10, 15 o 30 días hábiles).
  const tema = TEMAS.find(x => x.id === c.temaId);
  const opcionesPet = tipo === 'peticion' ? [tema?.peticion, ...PETICIONES_EXTRA.map(p => p.texto)].filter(Boolean)
    : tipo === 'servicios_publicos' ? MOTIVOS_SP.find(m => m.id === c.motivo)?.peticiones || [] : [];
  const plazo = useMemo(() => {
    if (tipo !== 'peticion') return t.plazo;
    const tipos = c.sel.map(s => PETICIONES_EXTRA.find(p => p.texto === s)?.tipo || 'general');
    if (tipos.includes('consulta')) return PLAZOS.consulta;
    return tipos.length && tipos.every(x => x === 'documentos') ? PLAZOS.documentos : PLAZOS.general;
  }, [tipo, c.sel, t.plazo]);
  const derecho = DERECHOS.find(d => d.id === c.derecho);
  const pruebasOpc = derecho?.pruebas || [];

  const entidadSugerida = tipo === 'peticion'
    ? ({ alcaldia: c.municipio ? `Alcaldía de ${c.municipio}` : 'Alcaldía municipal', eps: 'EPS', ant: 'Agencia Nacional de Tierras (ANT)' }[tema?.entidad] || '')
    : tipo === 'servicios_publicos' ? 'Empresa de servicios públicos' : tipo === 'tutela_salud' ? 'EPS' : '';
  const datos = {
    ...c, tipo, plazo,
    entidad: c.entidad || entidadSugerida,
    correo: tipo === 'peticion' && tema?.entidad === 'alcaldia' ? municipio?.correo : undefined,
    peticiones: c.sel?.map(texto => ({ texto })),
    municipio: c.municipio || '______',
    vereda: c.vereda || '______',
  };
  const listo = c.municipio && (tipo !== 'peticion' || c.sel.length) && (tipo !== 'servicios_publicos' || c.sel.length);

  if (paso === 'datos') return <DatosPersonales tipo={tipo} valores={persona} cambiar={setPersona} volver={() => setPaso('caso')} listo={() => setPaso('vista')} />;
  if (paso === 'vista') return <Vista tipo={tipo} datos={{ ...datos, ...personaParaDocumento(persona) }} volver={() => setPaso('datos')} />;

  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura={`${t.titulo}. Llena los datos. Tu nombre y tu cédula puedes escribirlos a mano en el papel.`}>{t.titulo}</Titulo>
      {memoria.orientacion?.documento === tipo && <p className="nota-privacidad">Ya llenamos lo que entendimos de tu situación. Revisa y completa.</p>}

      <form className="formulario" onSubmit={e => { e.preventDefault(); if (listo) setPaso('datos'); }}>
        {tipo === 'peticion' && (
          <Campo etiqueta="¿Sobre qué es?">
            <select value={c.temaId} onChange={e => { const nt = TEMAS.find(x => x.id === e.target.value); setC(x => ({ ...x, temaId: nt.id, sel: nt.peticion ? [nt.peticion] : [] })); }}>
              {TEMAS.map(x => <option key={x.id} value={x.id}>{x.icono} {x.titulo} — {x.ayuda}</option>)}
            </select>
          </Campo>
        )}
        {tipo === 'servicios_publicos' && (<>
          <Campo etiqueta="¿Qué servicio?">
            <div className="botones-opcion">{SERVICIOS.map(s => <button type="button" key={s.id} className={c.servicio === s.id ? 'sel' : ''} onClick={() => set('servicio', s.id)}>{s.icono} {s.titulo}</button>)}</div>
          </Campo>
          <Campo etiqueta="¿Qué pasó?">
            <select value={c.motivo} onChange={e => { const m = MOTIVOS_SP.find(x => x.id === e.target.value); setC(x => ({ ...x, motivo: m.id, sel: [...m.peticiones] })); }}>
              {MOTIVOS_SP.map(m => <option key={m.id} value={m.id}>{m.icono} {m.titulo} — {m.sub}</option>)}
            </select>
            {MOTIVOS_SP.find(m => m.id === c.motivo)?.nota && <small className="ayuda">{MOTIVOS_SP.find(m => m.id === c.motivo).nota}</small>}
          </Campo>
          <Campo etiqueta="Número de cuenta o contrato (está en la factura)"><input value={c.cuenta} onChange={e => set('cuenta', e.target.value)} placeholder="Opcional" /></Campo>
        </>)}
        {tipo === 'tutela_salud' && (<>
          <Campo etiqueta="¿Para quién es?">
            <div className="botones-opcion">{[['propio', 'Para mí'], ['menor', 'Para mi hijo o hija menor']].map(([v, l]) => <button type="button" key={v} className={c.afectado === v ? 'sel' : ''} onClick={() => set('afectado', v)}>{l}</button>)}</div>
          </Campo>
          <Campo etiqueta="¿Qué niega o demora la EPS?">
            <select value={c.que} onChange={e => set('que', e.target.value)}>{SALUD_NIEGA.map(s => <option key={s.id} value={s.id}>{s.icono} {s.titulo}</option>)}</select>
          </Campo>
          <Campo etiqueta="¿Cuál? (opcional)"><input value={c.detalle} onChange={e => set('detalle', e.target.value)} placeholder="Ej.: cita con cardiología, insulina" /></Campo>
        </>)}
        {tipo === 'tutela' && (<>
          <Campo etiqueta="¿Qué derecho?">
            <select value={c.derecho} onChange={e => setC(x => ({ ...x, derecho: e.target.value, pruebas: [] }))}>{DERECHOS.filter(d => d.icono).map(d => <option key={d.id} value={d.id}>{d.icono} {d.titulo} — {d.sub}</option>)}</select>
            {derecho?.otraVia && <small className="ayuda">{derecho.otraVia}</small>}
          </Campo>
          {derecho?.pregunta && <Campo etiqueta={derecho.pregunta}><input value={c.detalle} onChange={e => set('detalle', e.target.value)} placeholder={derecho.ejemplo} /></Campo>}
        </>)}

        <div className="fila-2">
          <Campo etiqueta="Municipio">
            <input list="municipios" value={c.municipio} onChange={e => set('municipio', e.target.value)} placeholder="Escoge o escribe" required />
            <datalist id="municipios">{MUNICIPIOS.map(m => <option key={m.nombre} value={m.nombre} />)}</datalist>
          </Campo>
          <Campo etiqueta="Vereda"><input value={c.vereda} onChange={e => set('vereda', e.target.value)} placeholder="Ej.: La Esperanza" /></Campo>
        </div>
        <Campo etiqueta={tipo === 'servicios_publicos' ? 'Empresa' : tipo === 'tutela_salud' ? 'Nombre de la EPS' : 'Entidad'}>
          <input value={c.entidad} onChange={e => set('entidad', e.target.value)} placeholder={entidadSugerida || 'Ej.: Colpensiones'} />
          {datos.correo && <small className="ayuda">Correo de la alcaldía: {datos.correo} (verificar antes de enviar)</small>}
        </Campo>
        <Campo etiqueta="¿Desde cuándo pasa?">
          <select value={c.desde} onChange={e => set('desde', e.target.value)}>{DESDE.map(x => <option key={x}>{x}</option>)}</select>
        </Campo>

        {(tipo === 'tutela_salud' || tipo === 'tutela') && (<>
          <Campo etiqueta="¿Ya le pediste a la entidad que lo solucionara?">
            <div className="botones-opcion">{[['negada', 'Sí, y me dijo que no'], ['sin_respuesta', 'Sí, y no me responde'], ['no', 'Todavía no']].map(([v, l]) => <button type="button" key={v} className={c.pidio === v ? 'sel' : ''} onClick={() => set('pidio', v)}>{l}</button>)}</div>
            {c.pidio === 'no' && <div className="ayuda" dangerouslySetInnerHTML={{ __html: EXPLICA.subsidiariedad }} />}
          </Campo>
          <Campo etiqueta="¿Es urgente? ¿Tu salud o tu vida corren riesgo si esperas?">
            <div className="botones-opcion">{[['si', 'Sí, es urgente'], ['no', 'No']].map(([v, l]) => <button type="button" key={v} className={c.urgente === v ? 'sel' : ''} onClick={() => set('urgente', v)}>{l}</button>)}</div>
          </Campo>
          <Campo etiqueta="¿Qué papeles tienes?">
            {pruebasOpc.map(p => <label key={p} className="check"><input type="checkbox" checked={c.pruebas.includes(p)} onChange={() => alternar('pruebas', p)} /> {p}</label>)}
          </Campo>
        </>)}

        {opcionesPet.length > 0 && (
          <Campo etiqueta="¿Qué pides?">
            {opcionesPet.map(p => <label key={p} className="check"><input type="checkbox" checked={c.sel.includes(p)} onChange={() => alternar('sel', p)} /> {p}</label>)}
            {tipo === 'peticion' && <small className="ayuda">La entidad debe responder en {plazo} días hábiles.</small>}
          </Campo>
        )}

        <Campo etiqueta="¿Quieres agregar algo con tus palabras? (opcional)">
          <textarea rows={3} value={c.palabras} onChange={e => set('palabras', e.target.value)} placeholder="Solo lo necesario. No escribas nombres de otras personas." />
        </Campo>


        <button className="btn-primario" type="submit" disabled={!listo}>Siguiente: tus datos</button>
        <p className="nota-modo">En el siguiente paso te pedimos nombre y cédula para el documento.</p>
      </form>
    </main>
  );
}

// ---------- Tus datos para el documento ----------
// Se piden solo aquí, cuando la persona ya decidió hacer el documento. Viven en memoria mientras se arma:
// no van a la IA, no se envían al servidor y no se guardan en el celular (Mis casos guarda el caso sin ellos).
const PERSONA_VACIA = { nombre: '', cedula: '', direccion: '', telefono: '', aMano: false };
const personaParaDocumento = p => (p.aMano ? {} : { nombre: p.nombre.trim(), cedula: p.cedula.trim(), direccion: p.direccion.trim(), telefono: p.telefono.trim() });
const cedulaValida = s => /^\d{5,10}$/.test(s.replace(/[.\s]/g, ''));
const celularValido = s => !s.trim() || /^(\+?57)?3\d{9}$/.test(s.replace(/[\s-]/g, ''));

function DatosPersonales({ tipo, valores: p, cambiar, volver, listo }) {
  const set = (k, v) => cambiar(x => ({ ...x, [k]: v }));
  const judicial = tipo.startsWith('tutela') || tipo === 'impugnacion' || tipo === 'desacato';
  const quien = judicial ? 'el juez' : tipo === 'servicios_publicos' ? 'la empresa' : 'la entidad';
  const ok = p.aMano || (p.nombre.trim().length >= 5 && cedulaValida(p.cedula) && celularValido(p.telefono));
  const lectura = `Tus datos para el documento. Ahora sí necesitamos tu nombre y tu cédula, porque ${quien} debe saber quién pide y a dónde responderte. No se envían a la inteligencia artificial y no se guardan en este celular. Si prefieres, déjalos para llenarlos a mano en el papel.`;

  return (
    <main className="pantalla">
      <Encabezado />
      <div className="titulo">
        <button className="btn-atras" onClick={volver} aria-label="Volver al caso">←</button>
        <h1>Tus datos para el documento</h1>
        <BotonVoz texto={lectura} />
      </div>
      <section className="tarjeta oliva">
        <ShieldCheck size={20} aria-hidden />
        <h2>Por qué te los pedimos ahora</h2>
        <p className="suave">Para que el documento sea válido, {quien} debe saber quién lo presenta y dónde responderte. Estos datos solo van en el papel: <b>no se envían a la inteligencia artificial ni a ningún servidor, y no se guardan en este celular.</b></p>
      </section>

      <form className="formulario" onSubmit={e => { e.preventDefault(); if (ok) listo(); }}>
        <label className="check grande"><input type="checkbox" checked={p.aMano} onChange={e => set('aMano', e.target.checked)} /> Prefiero escribirlos a mano en el papel</label>

        {!p.aMano && (<>
          <Campo etiqueta="Nombre completo">
            <input value={p.nombre} onChange={e => set('nombre', e.target.value)} autoComplete="off" required placeholder="Como aparece en la cédula" />
            <small className="ayuda">{judicial ? 'El juez necesita saber quién presenta la tutela.' : 'La ley exige el nombre de quien hace la petición (Ley 1755 de 2015, art. 16).'}</small>
          </Campo>
          <Campo etiqueta="Número de cédula">
            <input value={p.cedula} onChange={e => set('cedula', e.target.value)} inputMode="numeric" autoComplete="off" required placeholder="Sin puntos" />
            {p.cedula && !cedulaValida(p.cedula) && <small className="ayuda error">Revisa el número: solo dígitos, entre 5 y 10.</small>}
            <small className="ayuda">Te identifica como la persona que pide.</small>
          </Campo>
          <Campo etiqueta="¿Dónde quieres recibir la respuesta? (opcional)">
            <input value={p.direccion} onChange={e => set('direccion', e.target.value)} autoComplete="off" placeholder="Dirección, finca o correo electrónico" />
            <small className="ayuda">{quien[0].toUpperCase() + quien.slice(1)} debe responderte ahí. Si lo dejas vacío, se pone la vereda y el municipio.</small>
          </Campo>
          <Campo etiqueta="Celular (opcional)">
            <input value={p.telefono} onChange={e => set('telefono', e.target.value)} inputMode="tel" autoComplete="off" placeholder="Ej.: 310 123 4567" />
            {!celularValido(p.telefono) && <small className="ayuda error">Revisa el número: debe tener 10 dígitos y empezar por 3.</small>}
            <small className="ayuda">Para que {quien} pueda contactarte sobre tu caso.</small>
          </Campo>
        </>)}
        {p.aMano && <p className="nota-privacidad">El documento saldrá con espacios en blanco. Llénalos a mano con tu nombre, cédula y celular antes de firmarlo.</p>}

        <button className="btn-primario" type="submit" disabled={!ok}>Ver el documento</button>
      </form>
    </main>
  );
}

function Campo({ etiqueta, children }) {
  return <div className="campo"><span className="etiqueta">{etiqueta}</span>{children}</div>;
}

// Vista previa, lectura en voz alta, imprimir o guardar en PDF, y anotar en Mis casos.
function Vista({ tipo, datos, volver, caso }) {
  const html = useMemo(() => generarDocumento(tipo, datos), [tipo, datos]);
  const [guardado, setGuardado] = useState(false);
  const t = TIPOS[tipo];
  const texto = () => new DOMParser().parseFromString(html, 'text/html').body.textContent.replace(/_{3,}/g, ' espacio en blanco ');

  const entregar = () => {
    const hoy = new Date();
    almacen.guardarCaso({
      id: crypto.randomUUID?.() || String(Date.now()),
      tipo, titulo: t.titulo, icono: t.icono,
      entidad: datos.entidad, municipio: datos.municipio, vereda: datos.vereda,
      rad: iso(hoy), venc: t.plazo ? iso(sumarHabiles(hoy, t.plazo)) : null, plazo: t.plazo || null,
      // Solo los textos de plantilla de lo que pidió: sirven para la tutela si no responden.
      peticiones: (datos.peticiones || []).map(p => p.texto), modo: 'mano', estado: 'esperando',
    });
    setGuardado(true);
  };

  return (
    <main className="pantalla">
      <Encabezado />
      <div className="titulo">
        <button className="btn-atras" onClick={volver} aria-label="Volver a editar">←</button>
        <h1>Tu documento</h1>
        <BotonVoz texto={texto} />
      </div>
      <div className="doc-papel" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="acciones-doc">
        <button className="btn-secundario" onClick={() => window.print()}><Printer size={18} aria-hidden /> Imprimir o guardar PDF</button>
        {!guardado && !caso && <button className="btn-primario" onClick={entregar}><CheckCircle2 size={18} aria-hidden /> Lo entregué hoy: avísame el plazo</button>}
        {guardado && <button className="btn-primario" onClick={() => ir('casos')}>Ver en Mis casos</button>}
      </div>
      <section className="tarjeta tierra">
        <h2>Cómo entregarlo</h2>
        <p className="suave">{tipo.startsWith('tutela')
          ? (datos.nombre ? 'Fírmala. Llévala con copia de tus papeles al juzgado de tu municipio (pide que la reciban para reparto) o preséntala por internet en Tutela en línea. La Personería puede ayudarte. No necesitas abogado.' : EXPLICA.presentarTutela)
          : `${datos.nombre ? 'Fírmalo' : 'Escribe a mano tu nombre, tu cédula y tu firma'}. Entrégalo en la entidad o envíalo a su correo, y pide el sello de recibido o el número de radicado: desde ese día cuenta el plazo.`}</p>
        {datos.urgente === 'si' && <p className="suave">{EXPLICA.urgente}</p>}
      </section>
    </main>
  );
}

// Tutela por un derecho de petición que no respondieron (sale desde Mis casos).
// Mis casos no guarda datos personales, así que se vuelven a pedir aquí.
function TutelaDeCaso() {
  const [persona, setPersona] = useState(PERSONA_VACIA);
  const [vista, setVista] = useState(false);
  const caso = memoria.caso;
  if (!caso) { ir('casos'); return null; }
  if (!vista) return <DatosPersonales tipo="tutela_peticion" valores={persona} cambiar={setPersona} volver={() => ir('casos')} listo={() => setVista(true)} />;
  return <Vista tipo="tutela_peticion" datos={{ ...caso, ...personaParaDocumento(persona) }} caso volver={() => setVista(false)} />;
}
