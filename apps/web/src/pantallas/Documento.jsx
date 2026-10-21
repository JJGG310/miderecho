import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Stethoscope, Lightbulb as Bombillo, Scale, Printer, ChevronRight, ShieldCheck, CalendarCheck } from 'lucide-react';
import { TIPOS, generarDocumento, MUNICIPIOS, TEMAS, PETICIONES_EXTRA, PLAZOS, SERVICIOS, MOTIVOS_SP, SALUD_NIEGA, DERECHOS, EXPLICA, RAZONES_IMPUGNACION, RAZONES_RECURSO, VERIFICADO, sumarHabiles, iso } from '@miderecho/nucleo';
import { Encabezado, Titulo, BotonVoz, ElegirFecha, fechaLarga } from '../componentes/comunes.jsx';
import Buho from '../componentes/Buho.jsx';
import EnvioCorreo from '../componentes/EnvioCorreo.jsx';
import { ElegirAvisos } from '../componentes/Avisos.jsx';
import { FormClave } from './Clave.jsx';
import { cancelarAvisos } from '../lib/avisos.js';
import { almacen, useAbierta } from '../lib/almacen.js';
import { ir, memoria } from '../lib/ruta.js';

const DESDE = ['hace una semana', 'hace un mes', 'hace tres meses', 'hace seis meses', 'hace más de un año'];
// Título en lenguaje común; el nombre legal, en pequeño.
const MENU = [
  ['peticion', FileText, 'Pedirle algo a una entidad', 'Derecho de petición: alcaldía, EPS u otra entidad'],
  ['servicios_publicos', Bombillo, 'Me cobran mal o me cortaron el agua, la luz o el gas', 'Reclamo de servicios públicos'],
  ['tutela_salud', Stethoscope, 'La EPS me niega algo urgente', 'Tutela de salud'],
  ['tutela', Scale, 'No me respetan otro derecho', 'Tutela ante un juez'],
];
// Documentos que salen de un caso de Mis casos (memoria.caso).
const DE_CASO = ['tutela_peticion', 'impugnacion', 'desacato', 'recurso_servicios'];
const NOTA_BORRADOR = `${VERIFICADO}: falta que un consultorio jurídico la revise. Este aviso no sale en el papel.`;
// Reclamo "Otro problema", sin peticiones de plantilla.
const PIDE_REVISAR = 'Revisar mi caso y darme una respuesta de fondo, clara y por escrito.';
const judicialDe = tipo => tipo.startsWith('tutela') || tipo === 'impugnacion' || tipo === 'desacato';

export default function Documento({ tipo }) {
  if (!tipo) return <Menu />;
  if (DE_CASO.includes(tipo)) return <DeCaso tipo={tipo} />;
  if (!TIPOS[tipo]) { ir('documento'); return null; }
  return <Formulario tipo={tipo} />;
}

function Menu() {
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo lectura={`Crear un documento. ¿Qué necesita? ${MENU.map(m => m[2]).join('. ')}. Todos son gratis, no necesitan abogado y se arman sin internet.`}>Crear un documento</Titulo>
      <Buho pose="pensando" ancho={64} primera>¿Qué necesita? Si no sabe cuál, vuelva al inicio y cuéntenos qué pasa.</Buho>
      <section className="tarjeta clara lista-temas">
        <ul>
          {MENU.map(([id, Icono, t, s]) => (
            <li key={id}><button onClick={() => { memoria.orientacion = null; ir('documento', id); }}>
              <Icono className="tema-icono" size={28} strokeWidth={2} aria-hidden />
              <span className="tema-texto"><b>{t}</b><small>{s}</small></span>
              <ChevronRight size={22} aria-hidden />
            </button></li>
          ))}
        </ul>
      </section>
      <p className="nota-modo">Todos son gratis, no necesitan abogado y se arman sin internet.</p>
    </main>
  );
}

// Valores iniciales: solo lo que el asistente entendió del relato (sin datos personales). Lo demás queda vacío:
// la app no inventa qué niega la EPS, si es urgente ni desde cuándo pasa.
function inicial(tipo) {
  const d = memoria.orientacion?.documento === tipo ? memoria.orientacion.datos || {} : {};
  const base = { municipio: '', vereda: '', entidad: '', desde: DESDE.includes(d.desde) ? d.desde : '', palabras: '', modo: 'mano' };
  let c;
  if (tipo === 'peticion') {
    const tema = TEMAS.find(t => t.id === d.temaId);
    c = { ...base, temaId: tema?.id || '', sel: tema?.peticion ? [tema.peticion] : [] };
  } else if (tipo === 'servicios_publicos') {
    const motivo = MOTIVOS_SP.find(m => m.id === d.motivo);
    c = { ...base, servicio: SERVICIOS.some(s => s.id === d.servicio) ? d.servicio : '', motivo: motivo?.id || '', cuenta: '', sel: motivo ? (motivo.peticiones.length ? [...motivo.peticiones] : [PIDE_REVISAR]) : [] };
  } else if (tipo === 'tutela_salud') {
    c = { ...base, derecho: 'salud', que: SALUD_NIEGA.some(s => s.id === d.que) ? d.que : '', detalle: '', pidio: '', urgente: d.urgente === true ? 'si' : '', afectado: '', jurado: '', pruebas: [] };
  } else {
    c = { ...base, derecho: DERECHOS.some(x => x.icono && x.id === d.derecho) ? d.derecho : '', detalle: '', pidio: '', urgente: '', afectado: 'propio', jurado: '', pruebas: [] };
  }
  return { c, relato: ['temaId', 'servicio', 'motivo', 'que', 'derecho', 'desde', 'urgente'].filter(k => d[k] !== undefined && c[k]) };
}

const enfocar = k => {
  const el = document.getElementById('campo-' + k);
  el?.scrollIntoView({ block: 'center' });
  el?.querySelector('input, textarea, select, button')?.focus({ preventScroll: true });
};
const Relato = () => <span className="de-relato">✓ nos lo contó</span>;
const Falta = () => <p className="falta">Falta responder esto</p>;

// Pregunta con pocas opciones, todas a la vista (en vez de una lista desplegable que se corta).
function Opciones({ k, etiqueta, opciones, valor, elegir, lista, relato, falta, children }) {
  return (
    <fieldset className="campo" id={`campo-${k}`}>
      <legend className="etiqueta">{etiqueta}{relato && <Relato />}</legend>
      {falta && <Falta />}
      <div className={lista ? 'opciones-lista' : 'botones-opcion'}>
        {opciones.map(o => (
          <button type="button" key={o.id} className={valor === o.id ? 'sel' : ''} aria-pressed={valor === o.id} onClick={() => elegir(o.id)}>
            {o.icono && <span className="emoji" aria-hidden>{o.icono}</span>}
            {o.sub ? <span><b>{o.titulo}</b><small>{o.sub}</small></span> : o.titulo}
          </button>
        ))}
      </div>
      {children}
    </fieldset>
  );
}
function Casillas({ k, etiqueta, opciones, sel, alternar, falta, children }) {
  return (
    <fieldset className="campo" id={`campo-${k}`}>
      <legend className="etiqueta">{etiqueta}</legend>
      {falta && <Falta />}
      {opciones.map(p => <label key={p} className="check"><input type="checkbox" checked={sel.includes(p)} onChange={() => alternar(p)} /> {p}</label>)}
      {children}
    </fieldset>
  );
}
function Campo({ k, etiqueta, relato, falta, children }) {
  return <label className="campo" id={k && `campo-${k}`}><span className="etiqueta">{etiqueta}{relato && <Relato />}</span>{falta && <Falta />}{children}</label>;
}

// Pasos: 1 el caso → 2 dónde y desde cuándo → 3 sus datos (solo aquí se piden) → 4 el documento.
function Formulario({ tipo }) {
  const abierta = useAbierta();
  const [ini] = useState(() => inicial(tipo));
  const [c, setC] = useState(ini.c);
  const [paso, setPaso] = useState('caso');
  const [persona, setPersona] = useState(PERSONA_VACIA);
  const [faltan, setFaltan] = useState([]);
  const [id] = useState(() => crypto.randomUUID?.() || String(Date.now()));
  useEffect(() => { window.scrollTo(0, 0); setFaltan([]); }, [paso]);
  const set = (k, v) => setC(x => ({ ...x, [k]: v }));
  const alternar = (k, v) => setC(x => ({ ...x, [k]: x[k].includes(v) ? x[k].filter(y => y !== v) : [...x[k], v] }));
  const relato = k => ini.relato.includes(k) && c[k] === ini.c[k];
  const municipio = MUNICIPIOS.find(m => m.nombre === c.municipio);
  const t = TIPOS[tipo];
  const judicial = judicialDe(tipo);

  // Peticiones disponibles y plazo según la Ley 1755 (10, 15 o 30 días hábiles).
  const tema = TEMAS.find(x => x.id === c.temaId);
  const motivo = MOTIVOS_SP.find(m => m.id === c.motivo);
  const opcionesPet = tipo === 'peticion' ? [tema?.peticion, ...PETICIONES_EXTRA.map(p => p.texto)].filter(Boolean)
    : tipo === 'servicios_publicos' && motivo ? (motivo.peticiones.length ? motivo.peticiones : [PIDE_REVISAR]) : [];
  const plazo = useMemo(() => {
    if (tipo !== 'peticion') return t.plazo;
    const tipos = c.sel.map(s => PETICIONES_EXTRA.find(p => p.texto === s)?.tipo || 'general');
    if (tipos.includes('consulta')) return PLAZOS.consulta;
    return tipos.length && tipos.every(x => x === 'documentos') ? PLAZOS.documentos : PLAZOS.general;
  }, [tipo, c.sel, t.plazo]);
  const derecho = DERECHOS.find(d => d.id === c.derecho);
  const pruebasOpc = derecho?.pruebas || [];
  // Sin frase de plantilla para los hechos: hace falta que la persona lo cuente.
  const sinHecho = (tipo === 'peticion' && c.temaId === 'otro') || (tipo === 'servicios_publicos' && c.motivo === 'otro') || (tipo === 'tutela' && c.derecho === 'otro_derecho');

  const entidadSugerida = tipo === 'peticion'
    ? ({ alcaldia: c.municipio ? `Alcaldía de ${c.municipio}` : 'Alcaldía municipal', eps: 'EPS', ant: 'Agencia Nacional de Tierras (ANT)' }[tema?.entidad] || '')
    : tipo === 'servicios_publicos' ? 'Empresa de servicios públicos' : tipo === 'tutela_salud' ? 'EPS' : '';
  const datos = {
    ...c, tipo, plazo,
    entidad: c.entidad.trim() || entidadSugerida,
    correo: tipo === 'peticion' && tema?.entidad === 'alcaldia' ? municipio?.correo : undefined,
    peticiones: c.sel?.map(texto => ({ texto })),
    municipio: c.municipio.trim() || '______',
    vereda: c.vereda.trim() || '______',
  };

  const faltantes = () => {
    const f = [], pide = (vacio, k, nombre) => { if (vacio) f.push([k, nombre]); };
    if (paso === 'caso') {
      if (tipo === 'peticion') { pide(!c.temaId, 'temaId', 'sobre qué es'); pide(c.temaId && !c.sel.length, 'sel', 'qué pide'); }
      if (tipo === 'servicios_publicos') { pide(!c.servicio, 'servicio', 'qué servicio'); pide(!c.motivo, 'motivo', 'qué pasó'); pide(c.motivo && !c.sel.length, 'sel', 'qué pide'); }
      if (tipo === 'tutela_salud') { pide(!c.afectado, 'afectado', 'para quién es'); pide(!c.que, 'que', 'qué niega la EPS'); }
      if (tipo === 'tutela') { pide(!c.derecho, 'derecho', 'qué derecho'); pide(derecho?.hecho?.includes('{detalle}') && !c.detalle.trim(), 'detalle', derecho?.pregunta?.replace(/[¿?]/g, '').toLowerCase()); }
      if (judicial) { pide(!c.pidio, 'pidio', 'si ya le pidió a la entidad'); pide(!c.urgente, 'urgente', 'si es urgente'); pide(!c.jurado, 'jurado', 'si ya presentó otra tutela'); }
    } else {
      pide(!c.municipio.trim(), 'municipio', 'municipio'); pide(!c.desde, 'desde', 'desde cuándo pasa');
      pide(sinHecho && !c.palabras.trim(), 'palabras', 'qué pasó, con sus palabras');
    }
    return f;
  };
  // El botón siempre está activo: si falta algo, dice qué y lleva al primer campo vacío.
  const siguiente = e => {
    e.preventDefault();
    if (paso === 'caso' && c.jurado === 'si') { setFaltan([['jurado', 'No puede presentar otra tutela por lo mismo: mire arriba qué puede hacer']]); enfocar('jurado'); return; }
    const f = faltantes();
    if (f.length) { setFaltan(f); enfocar(f[0][0]); return; }
    setPaso(paso === 'caso' ? 'lugar' : 'datos');
  };
  // Después de tocar "Siguiente", se marca lo que sigue faltando (desaparece al responderlo).
  const pendientes = faltan.length ? faltantes() : [];
  const falta = k => pendientes.some(x => x[0] === k);
  const aviso = faltan[0]?.[0] === 'jurado' && c.jurado === 'si' ? <p className="falta" role="alert">{faltan[0][1]}</p>
    : pendientes.length > 0 && <p className="falta" role="alert">Falta: {pendientes.map(x => x[1]).join(', ')}.</p>;

  // "Ya presenté una tutela por esto": no se arma otra; se anota la que ya presentó para seguirla en Mis casos.
  const anotarTutela = f => {
    almacen.guardarCaso({ id, tipo, titulo: t.titulo, icono: t.icono, entidad: datos.entidad, municipio: c.municipio.trim(), derecho: c.derecho, rad: iso(f), venc: iso(sumarHabiles(f, t.plazo)), plazo: t.plazo, peticiones: [], modo: 'mano', estado: 'esperando' });
    ir('casos');
  };
  const entregar = (f, extra = {}) => {
    // Se mezcla con el caso ya guardado (anotado y luego enviado por correo) para no perder su código ni sus avisos.
    const previo = almacen.casos().find(x => x.id === id) || {};
    const caso = {
      ...previo,
      id, tipo, titulo: t.titulo, icono: t.icono,
      entidad: datos.entidad, municipio: datos.municipio, vereda: datos.vereda, derecho: c.derecho, servicio: c.servicio, motivo: c.motivo,
      rad: iso(f), venc: plazo ? iso(sumarHabiles(f, plazo)) : null, plazo: plazo || null,
      // Solo los textos de plantilla de lo que pidió: sirven para la tutela si no responden.
      peticiones: (datos.peticiones || []).map(p => p.texto), modo: 'mano', estado: 'esperando', ...extra,
    };
    almacen.guardarCaso(caso);
    return caso;
  };

  if (paso === 'datos') return <DatosPersonales tipo={tipo} valores={persona} cambiar={setPersona} volver={() => setPaso('lugar')} listo={() => setPaso('vista')} paso={[3, 4]} />;
  if (paso === 'vista') return <Vista tipo={tipo} datos={{ ...datos, ...personaParaDocumento(persona) }} volver={() => setPaso('datos')} alEntregar={entregar} paso={[4, 4]} />;

  const lugar = paso === 'lugar';
  return (
    <main className="pantalla">
      <Encabezado />
      <p className="paso">Paso {lugar ? 2 : 1} de 4: {lugar ? 'dónde y desde cuándo' : 'su caso'}</p>
      <Titulo alVolver={lugar ? () => setPaso('caso') : undefined} lectura={`${t.titulo}. Paso ${lugar ? 2 : 1} de 4. Responda las preguntas. Su nombre y su cédula se piden en el paso 3.`}>{t.titulo}</Titulo>
      {ini.relato.length > 0 && !lugar && <p className="nota-privacidad">Marcamos con ✓ lo que nos contó. Revise y complete lo demás.</p>}

      <form className="formulario" onSubmit={siguiente} noValidate>
        {!lugar && <>
          {tipo === 'peticion' && <>
            <Opciones k="temaId" etiqueta="¿Sobre qué es?" lista relato={relato('temaId')} falta={falta('temaId')} valor={c.temaId}
              opciones={TEMAS.map(x => ({ id: x.id, icono: x.icono, titulo: x.titulo, sub: x.ayuda }))}
              elegir={v => { const nt = TEMAS.find(x => x.id === v); setC(x => ({ ...x, temaId: v, sel: nt.peticion ? [nt.peticion] : [] })); }} />
            {c.temaId && (
              <Casillas k="sel" etiqueta="¿Qué pide?" opciones={opcionesPet} sel={c.sel} alternar={p => alternar('sel', p)} falta={falta('sel')}>
                <small className="ayuda">La entidad debe responder en {plazo} días hábiles.</small>
              </Casillas>
            )}
          </>}

          {tipo === 'servicios_publicos' && <>
            <Opciones k="servicio" etiqueta="¿Qué servicio?" opciones={SERVICIOS} valor={c.servicio} elegir={v => set('servicio', v)} relato={relato('servicio')} falta={falta('servicio')} />
            <Opciones k="motivo" etiqueta="¿Qué pasó?" lista opciones={MOTIVOS_SP} valor={c.motivo} relato={relato('motivo')} falta={falta('motivo')}
              elegir={v => { const m = MOTIVOS_SP.find(x => x.id === v); setC(x => ({ ...x, motivo: v, sel: m.peticiones.length ? [...m.peticiones] : [PIDE_REVISAR] })); }}>
              {motivo?.nota && <small className="ayuda">{motivo.nota}</small>}
            </Opciones>
            {c.motivo && <Casillas k="sel" etiqueta="¿Qué pide?" opciones={opcionesPet} sel={c.sel} alternar={p => alternar('sel', p)} falta={falta('sel')} />}
            <Campo k="cuenta" etiqueta="Número de cuenta o contrato (está en la factura; si no lo tiene, déjelo vacío)"><input value={c.cuenta} onChange={e => set('cuenta', e.target.value)} inputMode="numeric" autoComplete="off" /></Campo>
          </>}

          {tipo === 'tutela_salud' && <>
            <Opciones k="afectado" etiqueta="¿Para quién es?" valor={c.afectado} elegir={v => set('afectado', v)} falta={falta('afectado')}
              opciones={[{ id: 'propio', titulo: 'Para mí' }, { id: 'menor', titulo: 'Para mi hijo o hija menor de edad' }]} />
            <Opciones k="que" etiqueta="¿Qué niega o demora la EPS?" lista opciones={SALUD_NIEGA} valor={c.que} elegir={v => set('que', v)} relato={relato('que')} falta={falta('que')} />
            <Campo k="detalle" etiqueta="¿Cuál? Escriba el nombre si lo sabe (opcional)"><input value={c.detalle} onChange={e => set('detalle', e.target.value)} placeholder="Ej.: cita con cardiología, insulina" /></Campo>
          </>}

          {tipo === 'tutela' && <>
            <Opciones k="derecho" etiqueta="¿Qué derecho?" lista opciones={DERECHOS.filter(d => d.icono)} valor={c.derecho} relato={relato('derecho')} falta={falta('derecho')}
              elegir={v => setC(x => ({ ...x, derecho: v, pruebas: [] }))}>
              {derecho?.otraVia && <small className="ayuda">{derecho.otraVia}</small>}
            </Opciones>
            {derecho?.pregunta && <Campo k="detalle" etiqueta={derecho.pregunta} falta={falta('detalle')}><input value={c.detalle} onChange={e => set('detalle', e.target.value)} placeholder={derecho.ejemplo} /></Campo>}
          </>}

          {judicial && <>
            <Opciones k="pidio" etiqueta="¿Ya le pidió a la entidad que lo solucionara?" valor={c.pidio} elegir={v => set('pidio', v)} falta={falta('pidio')}
              opciones={[{ id: 'negada', titulo: 'Sí, y me dijo que no' }, { id: 'sin_respuesta', titulo: 'Sí, y no me responde' }, { id: 'no', titulo: 'Todavía no' }]}>
              {c.pidio === 'no' && <div className="ayuda" dangerouslySetInnerHTML={{ __html: EXPLICA.subsidiariedad }} />}
            </Opciones>
            <Opciones k="urgente" etiqueta={tipo === 'tutela_salud' ? '¿Es urgente? ¿La salud o la vida corren riesgo si espera?' : '¿Es urgente? ¿Esperar le causaría un daño grave?'}
              valor={c.urgente} elegir={v => set('urgente', v)} relato={relato('urgente')} falta={falta('urgente')}
              opciones={[{ id: 'si', titulo: 'Sí, es urgente' }, { id: 'no', titulo: 'No' }]} />
            <Opciones k="jurado" etiqueta="¿Ya presentó otra tutela por estos mismos hechos y derechos?" valor={c.jurado} elegir={v => set('jurado', v)} falta={falta('jurado')}
              opciones={[{ id: 'no', titulo: 'No, es la primera' }, { id: 'si', titulo: 'Sí, ya presenté una' }]}>
              <small className="ayuda">{EXPLICA.juramento} En el documento usted jura que no ha presentado otra.</small>
              {c.jurado === 'si' && <>
                <div className="ayuda" dangerouslySetInnerHTML={{ __html: EXPLICA.yaPresento }} />
                {abierta
                  ? <ElegirFecha etiqueta="¿Qué día presentó esa tutela?" boton="Anotar mi tutela en Mis casos" alGuardar={anotarTutela} />
                  : <FormClave enTarjeta motivo="Para anotar su tutela en Mis casos, escriba su clave." />}
              </>}
            </Opciones>
            {pruebasOpc.length > 0 && <Casillas k="pruebas" etiqueta="¿Qué papeles tiene? (opcional)" opciones={pruebasOpc} sel={c.pruebas} alternar={p => alternar('pruebas', p)} />}
          </>}
        </>}

        {lugar && <>
          <div className="fila-2">
            <Campo k="municipio" etiqueta="Municipio" falta={falta('municipio')}>
              <input list="municipios" value={c.municipio} onChange={e => set('municipio', e.target.value)} placeholder="Escriba o escoja" autoComplete="off" />
              <datalist id="municipios">{MUNICIPIOS.map(m => <option key={m.nombre} value={m.nombre} />)}</datalist>
            </Campo>
            <Campo k="vereda" etiqueta="Vereda (opcional)"><input value={c.vereda} onChange={e => set('vereda', e.target.value)} placeholder="Ej.: La Esperanza" autoComplete="off" /></Campo>
          </div>
          <Campo k="entidad" etiqueta={tipo === 'servicios_publicos' ? 'Nombre de la empresa' : tipo === 'tutela_salud' ? 'Nombre de la EPS' : 'Entidad'}>
            <input value={c.entidad} onChange={e => set('entidad', e.target.value)} placeholder={entidadSugerida || 'Ej.: Colpensiones'} autoComplete="off" />
            {tipo === 'tutela_salud' && <small className="ayuda">Está en su carné o en la orden médica. Si no lo sabe, saldrá "EPS".</small>}
            {datos.correo && <small className="ayuda">Correo de la alcaldía: {datos.correo} (verifíquelo antes de enviar)</small>}
          </Campo>
          <Opciones k="desde" etiqueta="¿Desde cuándo pasa?" valor={c.desde} elegir={v => set('desde', v)} relato={relato('desde')} falta={falta('desde')}
            opciones={DESDE.map(x => ({ id: x, titulo: x[0].toUpperCase() + x.slice(1) }))} />
          <Campo k="palabras" etiqueta={sinHecho ? 'Cuente qué pasó, con sus palabras' : '¿Quiere agregar algo con sus palabras? (opcional)'} falta={falta('palabras')}>
            <textarea rows={3} maxLength={1000} value={c.palabras} onChange={e => set('palabras', e.target.value)} placeholder="Solo lo necesario. No escriba nombres de otras personas." />
            <small className="ayuda">{c.palabras.length} de 1.000 letras</small>
          </Campo>
        </>}

        {aviso}
        <button className="btn-primario" type="submit">{lugar ? 'Siguiente: sus datos' : 'Siguiente'}</button>
        {lugar && <p className="nota-modo">En el siguiente paso le pedimos nombre y cédula para el documento.</p>}
      </form>
    </main>
  );
}

// ---------- Sus datos para el documento ----------
// Se piden solo aquí, cuando la persona ya decidió hacer el documento. Viven en memoria mientras se arma:
// no van a la IA, no se envían al servidor y no se guardan en el celular (Mis casos guarda el caso sin ellos).
const PERSONA_VACIA = { nombre: '', cedula: '', direccion: '', telefono: '', aMano: false };
const personaParaDocumento = p => (p.aMano ? {} : { nombre: p.nombre.trim(), cedula: p.cedula.trim(), direccion: p.direccion.trim(), telefono: p.telefono.trim() });
const cedulaValida = s => /^\d{5,10}$/.test(s.replace(/[.\s]/g, ''));
const celularValido = s => !s.trim() || /^(\+?57)?3\d{9}$/.test(s.replace(/[\s-]/g, ''));

function DatosPersonales({ tipo, valores: p, cambiar, volver, listo, paso }) {
  const [faltan, setFaltan] = useState([]);
  const set = (k, v) => cambiar(x => ({ ...x, [k]: v }));
  const judicial = judicialDe(tipo);
  const quien = judicial ? 'el juez' : tipo.includes('servicios') ? 'la empresa' : 'la entidad';
  const lectura = `Sus datos para el documento. Ahora sí necesitamos su nombre y su cédula, porque ${quien} debe saber quién pide y a dónde responderle. No se envían a la inteligencia artificial y no se guardan en este celular. Si prefiere, déjelos para llenarlos a mano en el papel.`;
  const enviar = e => {
    e.preventDefault();
    const f = p.aMano ? [] : [
      p.nombre.trim().length < 5 && ['nombre', 'nombre completo'],
      !cedulaValida(p.cedula) && ['cedula', 'número de cédula'],
      !celularValido(p.telefono) && ['telefono', 'celular (revise el número o déjelo vacío)'],
    ].filter(Boolean);
    if (f.length) { setFaltan(f); enfocar(f[0][0]); return; }
    listo();
  };
  const falta = k => faltan.some(x => x[0] === k) && !(k === 'nombre' ? p.nombre.trim().length >= 5 : k === 'cedula' ? cedulaValida(p.cedula) : celularValido(p.telefono));

  return (
    <main className="pantalla">
      <Encabezado />
      <p className="paso">Paso {paso[0]} de {paso[1]}: sus datos</p>
      <Titulo alVolver={volver} lectura={lectura}>Sus datos para el documento</Titulo>
      <section className="tarjeta oliva">
        <h2><ShieldCheck size={22} aria-hidden /> Por qué se los pedimos ahora</h2>
        <p className="texto">Para que el documento sea válido, {quien} debe saber quién lo presenta y dónde responderle. Estos datos solo van en el papel: <b>no se envían a la inteligencia artificial ni a ningún servidor (salvo que pida que enviemos el documento por correo), y no se guardan en este celular.</b></p>
      </section>

      <form className="formulario" onSubmit={enviar} noValidate>
        <label className="check grande"><input type="checkbox" checked={p.aMano} onChange={e => { set('aMano', e.target.checked); setFaltan([]); }} /> Prefiero escribirlos a mano en el papel</label>

        {!p.aMano && <>
          <Campo k="nombre" etiqueta="Nombre completo" falta={falta('nombre')}>
            <input value={p.nombre} onChange={e => set('nombre', e.target.value)} autoComplete="off" placeholder="Como aparece en la cédula" />
            <small className="ayuda">{judicial ? 'El juez necesita saber quién presenta el documento.' : 'La ley exige el nombre de quien hace la petición (Ley 1755 de 2015, art. 16).'}</small>
          </Campo>
          <Campo k="cedula" etiqueta="Número de cédula" falta={falta('cedula')}>
            <input value={p.cedula} onChange={e => set('cedula', e.target.value)} inputMode="numeric" autoComplete="off" placeholder="Sin puntos" />
            {p.cedula && !cedulaValida(p.cedula) && <small className="ayuda error">Revise el número: solo números, entre 5 y 10.</small>}
          </Campo>
          <Campo k="direccion" etiqueta="¿Dónde quiere recibir la respuesta? (opcional)">
            <input value={p.direccion} onChange={e => set('direccion', e.target.value)} autoComplete="off" placeholder="Dirección, finca o correo electrónico" />
            <small className="ayuda">{quien[0].toUpperCase() + quien.slice(1)} debe responderle ahí. Si lo deja vacío, se pone la vereda y el municipio.</small>
          </Campo>
          <Campo k="telefono" etiqueta="Celular (opcional)" falta={falta('telefono')}>
            <input value={p.telefono} onChange={e => set('telefono', e.target.value)} inputMode="tel" autoComplete="off" placeholder="Ej.: 310 123 4567" />
            {!celularValido(p.telefono) && <small className="ayuda error">Revise el número: debe tener 10 números y empezar por 3.</small>}
          </Campo>
        </>}
        {p.aMano && <p className="nota-privacidad">El documento saldrá con espacios en blanco. Llénelos a mano con su nombre, cédula y celular antes de firmarlo.</p>}

        {faltan.some(x => falta(x[0])) && !p.aMano && <p className="falta" role="alert">Falta: {faltan.filter(x => falta(x[0])).map(x => x[1]).join(', ')}.</p>}
        <button className="btn-primario" type="submit">Ver el documento</button>
      </form>
    </main>
  );
}

// Qué hacer con el documento, en orden.
function pasosEntrega(tipo, datos) {
  const firma = datos.nombre ? 'Fírmelo.' : 'Escriba a mano su nombre, su cédula y su celular, y fírmelo.';
  const entrega = {
    impugnacion: 'Entréguelo en el mismo juzgado que decidió la tutela. Escriba a mano el número del proceso (está en la decisión del juez).',
    desacato: 'Entréguelo en el mismo juzgado que decidió la tutela, con una copia de la decisión. Escriba a mano el número del proceso.',
  }[tipo] || (judicialDe(tipo)
    ? 'Llévelo al juzgado de su municipio con copia de sus papeles y pida que lo reciban «para reparto», o preséntelo en Tutela en línea. No necesita abogado.'
    : `Entréguelo en ${tipo.includes('servicios') ? 'la empresa' : 'la entidad'} o envíelo a su correo.`);
  return ['Guárdelo o imprímalo con el botón de abajo.', firma, entrega,
    'Pida una copia con sello o el número de recibido. Después anote aquí el día que lo entregó: desde ese día cuenta el plazo.'];
}

// Vista: qué hacer → guardar o imprimir (principal) → anotar el día de entrega o enviarlo por correo → el documento (plegado).
// Guardar el caso, enviarlo por correo y programar avisos piden la clave en este mismo paso: nada se guarda a medias.
function Vista({ tipo, datos: base, volver, alEntregar, paso }) {
  // Al abrir el envío por correo, el documento pasa a como se envía (sin firma a mano ni anexos, con la entidad del directorio).
  const [porCorreo, setPorCorreo] = useState(null);
  const datos = useMemo(() => (porCorreo ? { ...base, ...porCorreo } : base), [base, porCorreo]);
  const html = useMemo(() => generarDocumento(tipo, datos), [tipo, datos]);
  const [anotar, setAnotar] = useState(false);
  const [guardado, setGuardado] = useState(null);   // el caso guardado: ofrece los avisos del plazo
  const abierta = useAbierta();
  const papel = useRef(null);
  const pasos = pasosEntrega(tipo, datos);
  const quien = judicialDe(tipo) ? 'El juez debe decidir' : tipo.includes('servicios') ? 'La empresa debe responder' : 'La entidad debe responder';
  useEffect(() => {
    window.scrollTo(0, 0);
    const abrir = () => { if (papel.current) papel.current.open = true; };
    window.addEventListener('beforeprint', abrir);
    return () => window.removeEventListener('beforeprint', abrir);
  }, []);
  const imprimir = () => { papel.current.open = true; window.print(); };
  const texto = () => new DOMParser().parseFromString(html, 'text/html').body.textContent.replace(/_{3,}/g, ' espacio en blanco ');
  const entregar = (f, extra) => setGuardado(alEntregar(f, extra));

  return (
    <main className="pantalla">
      <Encabezado />
      <p className="paso">Paso {paso[0]} de {paso[1]}: su documento</p>
      <Titulo alVolver={volver} lectura={`Su documento está listo. Qué hacer ahora: ${pasos.join(' ')}`}>Su documento está listo</Titulo>
      <section className="tarjeta clara">
        <h2><Buho pose="documento" ancho={44} primera /> Qué hacer ahora</h2>
        <ol className="pasos">{pasos.map(x => <li key={x}>{x}</li>)}</ol>
        {datos.urgente === 'si' && <p className="texto"><b>{EXPLICA.urgente}</b></p>}
      </section>
      <button className="btn-primario" onClick={imprimir}><Printer size={22} aria-hidden /> Guardar o imprimir PDF</button>

      {!abierta ? (
        <FormClave enTarjeta motivo="Para anotarlo en Mis casos, enviarlo por correo o recibir avisos del plazo, escriba su clave. Si no la escribe, no se guarda nada." />
      ) : guardado ? (
        <section className="tarjeta oliva" role="status">
          <h2><Buho pose="corazon" ancho={44} /> Quedó guardado</h2>
          {guardado.venc && <p className="texto">{quien} a más tardar el <b>{fechaLarga(guardado.venc)}</b>.</p>}
          {guardado.venc && <ElegirAvisos caso={guardado} tarjeta={false} />}
          <button className="btn-secundario" onClick={() => ir('casos')}>Ver en Mis casos</button>
        </section>
      ) : anotar
        ? <ElegirFecha etiqueta="¿Qué día lo entregó?" boton="Guardar en Mis casos" alGuardar={f => entregar(f)} />
        : <button className="btn-secundario" onClick={() => setAnotar(true)}><CalendarCheck size={22} aria-hidden /> Ya lo entregué (elegir fecha)</button>}
      {abierta && <EnvioCorreo tipo={tipo} datos={datos} alAbrir={setPorCorreo} alEnviar={k => entregar(new Date(), { modo: 'envio', envios: [k] })} />}

      <details className="desplegable" ref={papel}>
        <summary><FileText size={22} aria-hidden /> Ver el documento</summary>
        <div className="fila-titulo"><p className="texto">Escuchar el documento</p><BotonVoz texto={texto} /></div>
        <div className="doc-papel" dangerouslySetInnerHTML={{ __html: html }} />
      </details>
      <p className="nota-modo">{NOTA_BORRADOR}</p>
    </main>
  );
}

// Documentos que siguen a un caso de Mis casos. Mis casos no guarda datos personales, así que se vuelven a pedir.
//   tutela_peticion: la petición no tuvo respuesta. impugnacion: el juez negó la tutela. desacato: ganó pero no cumplen.
//   recurso_servicios: la empresa negó el reclamo (cobro o corte); el caso pasa a ser el recurso.
function DeCaso({ tipo }) {
  const caso = memoria.caso;
  const [paso, setPaso] = useState('caso');
  const [extra, setExtra] = useState({ razones: [], palabras: '', orden: '', jurado: '' });
  const [faltaJurado, setFaltaJurado] = useState(false);
  const [faltaRazon, setFaltaRazon] = useState(false);
  const [persona, setPersona] = useState(PERSONA_VACIA);
  // La tutela de una petición es un caso nuevo (la petición queda marcada); la impugnación y el desacato siguen el mismo caso.
  const [id] = useState(() => (tipo === 'tutela_peticion' ? crypto.randomUUID?.() || String(Date.now()) : caso?.id));
  useEffect(() => { window.scrollTo(0, 0); }, [paso]);
  if (!caso) { ir('casos'); return null; }
  const t = TIPOS[tipo];
  const n = { caso: 1, datos: 2, vista: 3 }[paso];
  const entregar = (f, otro = {}) => {
    const cambios = tipo === 'tutela_peticion' ? { tipo, titulo: t.titulo, icono: t.icono, estado: 'esperando', plazo: t.plazo, envios: undefined, codigo: undefined }
      : tipo === 'impugnacion' ? { estado: 'impugnada', plazo: t.plazo }
      : tipo === 'recurso_servicios' ? { tipo, titulo: t.titulo, icono: t.icono, estado: 'esperando', plazo: t.plazo } : { estado: 'desacato', plazo: null };
    // Se mezcla con lo ya guardado (por ejemplo, si primero lo anotó y después lo envió por correo): no se pierde su código.
    const previo = almacen.casos().find(c => c.id === id) || caso;
    const nuevo = { ...previo, ...cambios, id, rad: iso(f), venc: cambios.plazo ? iso(sumarHabiles(f, cambios.plazo)) : null, ...otro };
    // Los recordatorios del plazo anterior ya no sirven.
    if (previo.codigo && previo.id === caso.id) cancelarAvisos(previo.codigo);
    if (tipo === 'tutela_peticion') { cancelarAvisos(caso.codigo); almacen.guardarCaso({ ...caso, estado: 'tutela' }); }
    almacen.guardarCaso(nuevo);
    return nuevo;
  };

  if (paso === 'datos') return <DatosPersonales tipo={tipo} valores={persona} cambiar={setPersona} volver={() => setPaso('caso')} listo={() => setPaso('vista')} paso={[n, 3]} />;
  if (paso === 'vista') return <Vista tipo={tipo} datos={{ ...caso, ...extra, ...personaParaDocumento(persona) }} volver={() => setPaso('datos')} alEntregar={entregar} paso={[n, 3]} />;

  const peticion = tipo === 'tutela_peticion', impugnacion = tipo === 'impugnacion', recurso = tipo === 'recurso_servicios';
  const razones = impugnacion ? RAZONES_IMPUGNACION : recurso ? RAZONES_RECURSO : null;
  const sinRazon = recurso && !extra.razones.length && !extra.palabras.trim();
  const siguiente = e => {
    e.preventDefault();
    if (peticion && extra.jurado !== 'no') { setFaltaJurado(true); enfocar('jurado'); return; }
    if (sinRazon) { setFaltaRazon(true); enfocar('razones'); return; }
    setPaso('datos');
  };
  return (
    <main className="pantalla">
      <Encabezado />
      <p className="paso">Paso 1 de 3: {peticion ? 'antes de empezar' : razones ? 'por qué no está de acuerdo' : 'qué ordenó el juez'}</p>
      <Titulo lectura={peticion ? '¿Ya presentó otra tutela por estos mismos hechos y derechos?' : impugnacion ? '¿Por qué no está de acuerdo con la decisión del juez? Marque las que apliquen. Si no sabe, igual puede impugnar.'
        : recurso ? `¿Por qué no está de acuerdo con la respuesta de la empresa? Tiene hasta el ${fechaLarga(caso.venc)} para presentarlo. ${EXPLICA.pagoRecurso}` : '¿Qué le ordenó el juez? ' + EXPLICA.desacato}>{t.titulo}</Titulo>
      <form className="formulario" onSubmit={siguiente} noValidate>
        {peticion && (
          <Opciones k="jurado" etiqueta="¿Ya presentó otra tutela por estos mismos hechos y derechos?" valor={extra.jurado} elegir={v => { setExtra(x => ({ ...x, jurado: v })); setFaltaJurado(false); }}
            falta={faltaJurado && !extra.jurado} opciones={[{ id: 'no', titulo: 'No, es la primera' }, { id: 'si', titulo: 'Sí, ya presenté una' }]}>
            <small className="ayuda">{EXPLICA.juramento} En el documento usted jura que no ha presentado otra.</small>
            {extra.jurado === 'si' && <div className="ayuda" dangerouslySetInnerHTML={{ __html: EXPLICA.yaPresento }} />}
          </Opciones>
        )}
        {razones && <>
          {recurso && <p className="texto"><b>Tiene hasta el {fechaLarga(caso.venc)} para presentarlo.</b> {EXPLICA.pagoRecurso}</p>}
          <Casillas k="razones" etiqueta={impugnacion ? '¿Por qué no está de acuerdo con la decisión del juez?' : '¿Por qué no está de acuerdo con la respuesta de la empresa?'}
            opciones={razones} sel={extra.razones} falta={faltaRazon && sinRazon}
            alternar={r => setExtra(x => ({ ...x, razones: x.razones.includes(r) ? x.razones.filter(y => y !== r) : [...x.razones, r] }))}>
            <small className="ayuda">{impugnacion ? 'Marque las que apliquen. Si no sabe, igual puede impugnar.' : 'Marque al menos una o escríbala abajo.'}</small>
          </Casillas>
          <Campo etiqueta={`Otra razón, con sus palabras${impugnacion ? ' (opcional)' : ''}`}><textarea rows={3} maxLength={1000} value={extra.palabras} onChange={e => setExtra(x => ({ ...x, palabras: e.target.value }))} /></Campo>
        </>}
        {tipo === 'desacato' && (
          <Campo etiqueta="Lo que ordenó el juez (opcional)">
            <textarea rows={3} maxLength={1000} value={extra.orden} onChange={e => setExtra(x => ({ ...x, orden: e.target.value }))} placeholder="Ej.: entregar el medicamento en 48 horas" />
            <small className="ayuda">{EXPLICA.desacato}</small>
          </Campo>
        )}
        {faltaJurado && extra.jurado === 'si' && <p className="falta" role="alert">No puede presentar otra tutela por lo mismo: mire arriba qué puede hacer.</p>}
        <button className="btn-primario" type="submit">Siguiente: sus datos</button>
      </form>
    </main>
  );
}
