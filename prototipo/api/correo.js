// POST /api/correo { tipo, datos, destino, copia? }: envía por correo (Resend) un documento que arma este servidor con las plantillas del núcleo.
// No es un relevo de correo: no recibe HTML ni destinatarios libres. destino es una clave de directorio.js ('alcaldia:Ovejas',
// 'juzgado:Ovejas', 'juzgado:Chaparral:2', 'ant'); un correo escrito a mano solo pasa si está en CORREOS_DEMO o con PERMITIR_CORREO_ABIERTO=1.
// El documento es el mismo que la persona vio en la app (mismos datos y plantilla); arriba va una carta corta de remisión.
// Sin RESEND_API_KEY todo queda en modo simulado: se valida y se arma el documento, pero no sale nada.
// El documento va en el cuerpo del correo (HTML y texto). ponytail: sin PDF adjunto; agregarlo con un generador mínimo o pdf-lib si un juzgado lo exige.
import { createHash } from 'node:crypto';
import { atender, falla, contar, redisListo, hoyColombia, limiteDiario } from './_comun.js';
import { TIPOS, generarDocumento, esc, NOMBRE, TEMAS, SERVICIOS, MOTIVOS_SP, DERECHOS, SALUD_NIEGA, DIRECTORIO, paraJuzgado, deIso } from '@miderecho/nucleo';

const env = process.env;
// ponytail: 30 por hora y red tolera el Wi-Fi de una reunión de la Junta; 25 al día por destinatario frena el abuso contra una entidad.
export const POR_RED_HORA = 30, POR_DESTINO_DIA = 25;

const simulado = () => !env.RESEND_API_KEY;
const demo = () => String(env.CORREOS_DEMO || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
// Abierto a cualquier correo solo a propósito y, con envío real, con límites globales (Redis).
const abierto = () => env.PERMITIR_CORREO_ABIERTO === '1' && (simulado() || redisListo());
const red = req => {   // como en _comun.js: IPv6 por red (≈/64), no por dirección
  const a = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'sin-ip';
  return a.includes(':') ? a.split(':').slice(0, 4).join(':') : a;
};

export default async function handler(req, res) {
  return atender(req, res, {
    async POST(b) {
      const tipo = String(b.tipo ?? '');
      if (!Object.hasOwn(TIPOS, tipo)) throw falla(400, 'Tipo de documento desconocido');
      const d = limpiar(b.datos), dest = destino(b.destino, tipo);
      let doc;
      try { doc = generarDocumento(tipo, d, deIso(hoyColombia())); } catch { throw falla(400, 'Faltan datos para armar el documento'); }

      let copia = null;
      try { if (b.copia) copia = libre(b.copia); } catch { /* sin permiso para ese correo: va sin copia y la respuesta lo dice */ }
      // Con clave real y sin lista ni envío abierto, no sale nada. Con lista, lo del directorio llega al primer correo de la lista (prueba).
      const prueba = !simulado() && !abierto() && dest.clave !== 'libre';
      if (!simulado() && !abierto() && !demo().length) throw falla(503, 'Envíos reales cerrados: configure CORREOS_DEMO, o Redis y PERMITIR_CORREO_ABIERTO=1');
      const para = prueba ? demo()[0] : dest.correo;
      const entidad = dest.nombre || d.entidad || null;
      const correo = armar(tipo, d, doc, { para, copia, entidad, prueba, destino: dest.correo });

      let id = null;
      if (!simulado()) {
        await proteger(req, [dest.correo, copia].filter(Boolean));   // por la entidad, aunque en prueba llegue al equipo
        id = await resend(correo, `${tipo}-${d.codigo}-${createHash('sha256').update(correo.html).digest('hex').slice(0, 16)}`);
      }
      // En los logs solo el tipo y la clave del directorio: nunca nombres, cédula, hechos ni correos escritos a mano.
      console.log(`[correo] ${simulado() ? 'simulado' : 'enviado'}: ${tipo} a ${dest.clave}${prueba ? ' (prueba)' : ''}${copia ? ' + copia' : ''}`);
      return { ok: true, simulado: simulado(), copia: !!copia,
        constancia: { id, fecha: new Date(Date.now()).toISOString(), para, entidad, ...(simulado() && { simulado: true }), ...(prueba && { prueba: true }) } };
    },
  });
}

function destino(valor, tipo) {
  const v = String(valor ?? '').trim();
  if (!Object.hasOwn(DIRECTORIO, v)) return { clave: 'libre', nombre: null, correo: libre(v) };
  if (v.startsWith('juzgado:') !== paraJuzgado(tipo)) throw falla(400, 'Ese documento no se envía a esa entidad');
  return { clave: v, ...DIRECTORIO[v] };
}

// Un correo escrito a mano: solo los del equipo (CORREOS_DEMO) o con el envío abierto a propósito.
function libre(c) {
  c = String(c ?? '').trim().toLowerCase();
  if (c.length > 254 || !/^[^\s@<>()[\],;:"]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(c)) throw falla(400, 'Destino inválido: use una entidad del directorio');
  if (!demo().includes(c) && !abierto()) throw falla(403, 'Ese correo no está en nuestro directorio de entidades');
  return c;
}

// Solo los campos que usan las plantillas, con topes. Lo demás se descarta. Los ids se validan porque las plantillas los buscan en listas fijas.
const TEXTOS = { municipio: 100, vereda: 100, entidad: 200, correo: 254, cuenta: 40, nombre: 150, cedula: 20, telefono: 20, direccion: 200,
  desde: 40, palabras: 1000, detalle: 300, orden: 600, afectado: 10, pidio: 15, urgente: 2, rad: 10, venc: 10, notif: 10 };
const IDS = { temaId: TEMAS, servicio: SERVICIOS, motivo: MOTIVOS_SP, derecho: DERECHOS, que: SALUD_NIEGA };
const LISTAS = ['peticiones', 'razones', 'pruebas'];
const PLAZOS_VALIDOS = [10, 15, 20, 30];   // los de PLAZOS (contenido.js) y TIPOS (plantillas.js)
const corto = (t, max, k) => {
  t = String(t ?? '').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').trim();
  if (t.length > max) throw falla(400, `El campo ${k} es muy largo`);
  return t;
};
function limpiar(d) {
  if (!d || typeof d !== 'object') throw falla(400, 'Faltan los datos del documento');
  const c = {};
  for (const [k, max] of Object.entries(TEXTOS)) if (d[k] != null) c[k] = corto(d[k], max, k);
  for (const [k, xs] of Object.entries(IDS)) if (d[k] != null && d[k] !== '') {
    if (!xs.some(x => x.id === d[k])) throw falla(400, `Valor inválido en ${k}`);
    c[k] = d[k];
  }
  for (const k of LISTAS) if (d[k] != null) {
    if (!Array.isArray(d[k]) || d[k].length > 10) throw falla(400, `Lista inválida en ${k}`);
    c[k] = d[k].map(p => corto(p?.texto ?? p, 300, k)).filter(Boolean);
  }
  for (const k of ['rad', 'venc', 'notif']) if (c[k] && !/^\d{4}-\d{2}-\d{2}$/.test(c[k])) throw falla(400, `Fecha inválida en ${k}`);
  if (d.plazo != null) {
    c.plazo = Number(d.plazo);
    if (!PLAZOS_VALIDOS.includes(c.plazo)) throw falla(400, 'Plazo inválido');
  }
  c.modo = d.modo === 'envio' ? 'envio' : 'mano';   // 'envio' solo cambia textos de la plantilla (respuesta al buzón del servicio)
  c.codigo = String(d.codigo ?? '');
  if (!/^[A-Z2-9]{4}$/.test(c.codigo)) throw falla(400, 'Código del caso inválido');
  // Quien presenta debe quedar identificado (Ley 1755, art. 16; en la tutela, el accionante).
  if (!c.nombre || !/^[0-9.]{5,15}$/.test(c.cedula || '')) throw falla(400, 'Faltan el nombre y la cédula de quien presenta el documento');
  return c;
}

// Carta corta que acompaña el documento: quién lo presenta, que el servicio solo lo transmite y dónde responder.
// La respuesta va a los datos de contacto del documento; si la persona pidió copia, también se puede responder a su correo (reply_to).
// [validar] Decreto 2591 de 1991, art. 14, y Ley 2213 de 2022 (tutela por medios electrónicos, sin firma manuscrita); Ley 1755 de 2015, art. 15.
function armar(tipo, d, doc, { para, copia, entidad, prueba, destino }) {
  const T = TIPOS[tipo], juzgado = paraJuzgado(tipo), quien = `${esc(d.nombre)}, identificado(a) con cédula de ciudadanía n.º ${esc(d.cedula)}`;
  const que = { tutela: 'acción de tutela', tutela_salud: 'acción de tutela', tutela_peticion: 'acción de tutela', impugnacion: 'impugnación del fallo de tutela', desacato: 'solicitud de incidente de desacato' }[tipo] || T.titulo.toLowerCase();
  const urgente = d.urgente === 'si';
  const asunto = `${urgente ? 'URGENTE: ' : ''}${juzgado && tipo.startsWith('tutela') ? `Acción de tutela para reparto${urgente ? ' con medida provisional' : ''}` : T.titulo} · ${d.municipio} · código ${d.codigo}`;
  const intro = [
    prueba && `<p><b>[PRUEBA de ${esc(NOMBRE)}]</b> En uso real, este correo iría a ${esc(entidad)} (${esc(destino)}).</p>`,
    `<p>${juzgado ? 'Señor(a) Juez:' : `Señores ${esc(entidad)}:`}</p>`,
    `<p>Por solicitud y con autorización expresa de ${quien}, quien ${juzgado ? 'es el accionante' : 'es el peticionario'} y aprobó este texto, ${esc(NOMBRE)} transmite por medio electrónico la siguiente ${esc(que)}${juzgado ? ' (artículo 14 del Decreto 2591 de 1991 y Ley 2213 de 2022)' : tipo === 'peticion' ? ' (artículo 15 de la Ley 1755 de 2015)' : ''}. ${esc(NOMBRE)} no actúa como abogado ni como apoderado.</p>`,
    `<p>Para ${juzgado ? 'las notificaciones' : 'la respuesta'}, use los datos de contacto que aparecen en el documento${copia ? ` o el correo ${esc(copia)}` : ''}. Este buzón no recibe respuestas. Código del caso: ${esc(d.codigo)}.</p>`,
    urgente && '<p><b>La tutela pide una medida provisional (artículo 7 del Decreto 2591 de 1991).</b></p>',
  ].filter(Boolean).join('');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1d1b16;max-width:680px">${intro}<hr>${doc}</div>`;
  return { from: env.CORREO_REMITENTE || `${NOMBRE} <onboarding@resend.dev>`, to: [para], ...(copia && { bcc: [copia] }),
    ...(copia && { reply_to: copia }), subject: asunto, html, text: aTexto(intro + '\n\n' + doc) };
}

const ENTIDADES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
export const aTexto = h => h
  .replace(/<br>/g, '\n').replace(/<li>/g, '- ').replace(/<\/(p|h3|li|ol)>/g, '\n').replace(/<[^>]+>/g, '')
  .replace(/&(amp|lt|gt|quot|#39);/g, m => ENTIDADES[m])
  .replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

async function proteger(req, destinatarios) {
  if (await contar('correo-red:' + red(req), 3600) > POR_RED_HORA) throw falla(429, 'Demasiados envíos desde esta conexión. Intente en una hora');
  for (const p of destinatarios)
    if (await contar('correo-a:' + p, 86400) > POR_DESTINO_DIA) throw falla(429, 'Ese correo ya recibió muchos documentos hoy. Intente mañana');
  if (await contar('correo-total', 86400) > limiteDiario()) throw falla(429, 'Se alcanzó el límite de envíos de hoy');
}

// API REST de Resend, sin SDK. La llave de idempotencia (tipo, código y huella del texto) evita un segundo envío si la app reintenta
// el mismo documento, por ejemplo tras perder la señal: presentar dos veces la misma tutela puede tomarse como temeridad (Decreto 2591, art. 38).
async function resend(correo, llave) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': llave },
    body: JSON.stringify(correo),
  });
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.id) return j.id;
  console.error(`[correo] Resend respondió ${r.status} ${j.name ?? ''}`);   // el mensaje de Resend puede traer el destinatario: solo el código
  throw falla(502, `El servicio de correo no aceptó el envío (${j.name ?? r.status})`);
}
