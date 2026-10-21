// POST /api/llamar { telefono, acepto: true, aviso, cuando?, codigo?, vence? } → { ok, simulado, via, token? }
//   via 'agente': el agente de voz "MiDerecho teléfono" (ElevenLabs) llama desde el número de Twilio importado en ElevenLabs.
//   via 'voz': sin agente configurado, Twilio llama y sigue el menú de voz de abajo (GET). Funciona con la cuenta de prueba
//   de Twilio, que bloquea <Stream> (lo que usa el agente) pero acepta <Say> y <Gather>, y no necesita Redis para llamar ya.
//   Sin `cuando`, llama ya. Con `cuando` ("2026-10-22T09:00-05:00": en punto o y media, desde 10 minutos y hasta 7 días)
//   la agenda: el número queda cifrado en Redis y Upstash QStash vuelve a esta ruta a esa hora (PUT), porque el cron de
//   Vercel Hobby corre una vez al día. El agendado de ElevenLabs (batch calling) no admite el modo de retención cero.
//   Solo de 8 a. m. a 7 p. m., hora de Colombia; solo a NUMEROS_DEMO; máximo LLAMADAS_POR_DIA por número; una sola agendada
//   por número (la nueva reemplaza la anterior). De la autorización se guarda el HMAC del número, la fecha y la versión del
//   texto que vio la persona (`aviso`, lo define la app junto al texto). Sin respaldo con voz leída: si el agente falla, 502
//   (una voz grabada podría dejar el código del caso en el buzón de un celular compartido).
// DELETE /api/llamar { token }: cancela la llamada agendada. Siempre responde igual, exista o no.
// PUT /api/llamar { id }: solo para QStash, con su firma (Upstash-Signature).
// GET /api/llamar?paso=&codigo=&vence= (lo pide Twilio; con la cuenta de prueba puede llegar como POST de formulario):
//   menú de voz sin estado y con texto fijo. Nada del caso se dice antes de que alguien oprima una tecla (un buzón de voz
//   no oprime). Luego: código y fecha, "¿le respondieron?" (1 sí, 2 no, 3 repetir, 4 asistente, 9 peligro) y la respuesta fija.
//   Con 4: aviso de IA, 1 para aceptar y conversación de hasta MAX_TURNOS (_ia-telefono.js). Solo si la llamada salió de
//   este servidor (`l`, sellado en el POST, 15 minutos). El estado viaja cifrado en la URL (`s`); no se guarda nada.
// GET /api/llamar?audio=… : la voz de ElevenLabs para <Play>. Solo textos que generó este servidor (sellados, 5 minutos).
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { limpiar, hayRiesgo } from '@miderecho/nucleo';
import { atender, falla, celular, proteger, cifrar, descifrar, hmac, kv, redisListo, simulado, oculto, fechaVoz, version, autorizacion,
  llamarConUrl, presentacionVoz, xml, hoyColombia } from './_comun.js';
import { sellar, abrir, responderIA, sintetizar, vozA_tiempo, MAX_TURNOS, MAX_SEGUNDOS } from './_ia-telefono.js';

const AGENTE = 'agent_3901m5fd72hyedssc8h6r4gznevn';   // "MiDerecho teléfono": agente/prompt-telefono.md y agente/telefono.md
const FUERA = 'Solo llamamos de 8 a. m. a 7 p. m., hora de Colombia';
const env = process.env;
const ahora = () => Math.floor(Date.now() / 1000);
const enHorario = seg => { const h = new Date((seg - 5 * 3600) * 1000).getUTCHours(); return h >= 8 && h < 19; };   // Colombia: UTC-5
const destino = req => `https://${req.headers.host}/api/llamar`;

export default async function handler(req, res) {
  // Twilio pide el TwiML por GET o, con la cuenta de prueba, por POST de formulario; la app siempre manda JSON.
  if (req.method === 'GET' && req.query?.audio) return audio(req, res);
  if (req.method === 'GET' || /x-www-form-urlencoded/i.test(req.headers['content-type'] || '')) return menuDeVoz(req, res);
  return atender(req, res, {
    async POST(b) {
      const tel = celular(b.telefono), datos = { codigo: codigoDe(b.codigo), vence: venceDe(b.vence) };
      if (b.acepto !== true) throw falla(400, 'Falta la autorización para llamar a este número');
      const aviso = version(b.aviso), cuando = b.cuando == null || b.cuando === '' ? null : cuandoDe(b.cuando);
      const canal = simulado('agente') ? 'voz' : 'agente', real = !simulado(canal);
      if (!cuando && !enHorario(ahora())) throw falla(400, FUERA);
      if (cuando && real && !(env.QSTASH_TOKEN && redisListo())) throw falla(503, 'Para agendar llamadas faltan QSTASH_TOKEN y Redis en el servidor');
      await proteger(req, tel, canal);
      if (real) await kv(autorizacion(tel, aviso, canal));
      if (!cuando) return llamar(tel, datos, req.headers.host);

      const token = randomBytes(16).toString('base64url'), id = hmac('llam:' + token);
      if (real) {
        // Una sola agendada por número: la anterior se borra y, cuando QStash la traiga, no pasa nada.
        const h = 'llamnum:' + hmac('num:' + tel), [anterior] = await kv(['GET', h]);
        await kv(...(anterior ? [['DEL', 'llam:' + anterior]] : []), ['SET', 'llam:' + id, JSON.stringify({ ...datos, c: cifrar(tel) }), 'EXAT', cuando + 3600],
          ['SET', h, id, 'EXAT', cuando + 3600]);
        const r = await fetch(`${env.QSTASH_URL || 'https://qstash.upstash.io'}/v2/publish/${destino(req)}`, {
          method: 'POST', body: JSON.stringify({ id }), signal: AbortSignal.timeout(8000),
          headers: { Authorization: 'Bearer ' + env.QSTASH_TOKEN, 'Content-Type': 'application/json', 'Upstash-Method': 'PUT', 'Upstash-Not-Before': String(cuando) },
        }).catch(() => ({ ok: false, status: 'sin respuesta' }));
        if (!r.ok) {
          await kv(['DEL', 'llam:' + id]);
          console.error(`[llamar] QStash respondió ${r.status}`);
          throw falla(502, 'No se pudo agendar la llamada');
        }
      }
      console.log(`[llamar] agendada${real ? '' : ' (simulado)'} a ${oculto(tel)}`);
      return { ok: true, simulado: !real, via: canal, token };
    },
    async DELETE(b) {
      const token = String(b.token ?? '');
      if (!/^[\w-]{22}$/.test(token)) throw falla(400, 'Token inválido');
      await kv(['DEL', 'llam:' + hmac('llam:' + token)]);
      return { ok: true, simulado: simulado('agente') && simulado('voz') };
    },
    async PUT(b) {
      firmaQstash(req, b);
      const id = String(b.id ?? ''), [txt] = await kv(['GET', 'llam:' + id], ['DEL', 'llam:' + id]);   // se borra antes: nunca llama dos veces
      if (!txt) return { ok: true, simulado: false };   // cancelada o vencida
      if (!enHorario(ahora())) {
        console.error('[llamar] QStash llegó fuera del horario: no se llama');
        return { ok: true, simulado: false };
      }
      const r = JSON.parse(txt);
      return llamar(descifrar(r.c), r, req.headers.host);
    },
  });
}

async function llamar(tel, { codigo, vence }, host) {
  if (simulado('agente')) {
    // `l`: prueba de que la llamada salió de aquí (pasó por proteger); sin ella el menú no ofrece la asistente con IA.
    if (!simulado('voz')) return { ...await llamarConUrl(tel, urlVoz(host, { codigo, vence, l: sellar({ e: ahora() + 900 }) })), via: 'voz' };
    console.log(`[llamar] simulado a ${oculto(tel)}`);
    return { ok: true, simulado: true, via: 'voz' };
  }
  const r = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: env.ELEVENLABS_AGENT_ID || AGENTE, agent_phone_number_id: env.ELEVENLABS_PHONE_NUMBER_ID, to_number: tel,
      // Solo datos no sensibles: el código letra por letra (así lo lee la voz) y la fecha en palabras.
      conversation_initiation_client_data: { dynamic_variables: {
        codigo: codigo ? [...codigo].join(', ') : 'ninguno',
        vence: vence ? fechaVoz(vence) : 'ninguna',
      } },
      // Sin grabación; si contesta un buzón de voz, cuelga sin hablar (el celular puede ser compartido).
      telephony_call_config: { ringing_timeout_secs: 40, twilio_call_recording_enabled: false,
        twilio_machine_detection: { mode: 'enable', actions: [{ action: 'hang_up', answered_by: ['machine_start', 'fax'] }] } },
    }),
  }).catch(() => ({ ok: false, status: 'sin respuesta', json: async () => ({}) }));
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) {   // el mensaje de ElevenLabs puede traer el número: solo el estado
    console.error(`[llamar] ElevenLabs no hizo la llamada: ${r.status}`);
    throw falla(502, `No se pudo hacer la llamada (código ${r.status})`);
  }
  console.log(`[llamar] llamando a ${oculto(tel)}`);
  return { ok: true, simulado: false, via: 'agente' };
}

// ---------- menú de voz (Twilio, sin agente) ----------
// Textos fijos, los mismos de agente/prompt-telefono.md. Voz neural de español latino.
const urlVoz = (host, { codigo, vence, l, s }, paso) => {
  const q = new URLSearchParams(Object.entries({ paso, codigo, vence, l, s }).filter(([, v]) => v));
  return `https://${host}/api/llamar${q.size ? '?' + q : ''}`;
};
const decir = t => `<Say language="es-MX" voice="Polly.Mia-Neural">${xml(t)}</Say>`;
// La asistente habla con la voz de ElevenLabs (audio sellado que pide Twilio) o, si no se pudo generar, con la de Twilio.
const voz = async (t, host) => await vozA_tiempo(t)
  ? `<Play>${xml(`https://${host}/api/llamar?audio=${sellar({ t, e: ahora() + 300 })}`)}</Play>` : decir(t);
const escuchar = (accion, dentro) => `<Gather input="speech" language="es-CO" speechTimeout="auto" timeout="7" action="${accion}" method="GET">${dentro}</Gather>`;
// Versión del aviso de IA (avisoIA, avisoGoogle, avisoGratis y aceptar): si cambia el texto, cambia la versión.
const VERSION_IA = 'ia-telefono-v1';
const TEXTOS = {
  llave: 'Hola. Tiene un recordatorio de un servicio automático. Para escucharlo, oprima cualquier tecla.',
  nadie: 'No recibimos respuesta. Hasta luego.',
  opciones: 'Si ya le respondieron, oprima 1 o diga sí. Si no le han respondido, oprima 2 o diga no. Para escuchar de nuevo, oprima 3. Si está en peligro, oprima 9.',
  respondieron: 'Qué bien. Abra MiDerecho, entre a Mis casos y anote qué le respondieron. La app le dice qué sigue.',
  aTiempo: 'Todavía están a tiempo de responderle. Si llega esa fecha y no le han respondido, abra Mis casos en la app: ahí le ayuda con el siguiente paso.',
  vencido: 'Si ya pasó la fecha y no le respondieron, abra Mis casos en la app: le ayuda a preparar el siguiente documento, sin abogado. Esto es información general, no consejo de abogado.',
  sinFecha: 'Si no le han respondido, abra Mis casos en la app: ahí le ayuda con el siguiente paso.',
  orienta: 'Para saber qué documento le sirve, abra MiDerecho y cuéntele a la app qué pasa, o pídale ayuda a su líder o a la Personería.',
  noEntendi: 'No le entendí.',
  conAsistente: 'Para hablar con la asistente, oprima 4 o diga asistente.',
  avisoIA: 'Le habla la asistente de MiDerecho. Es un asistente automático con inteligencia artificial: no es una persona ni un abogado. No diga su nombre, su cédula ni datos de otras personas.',
  avisoGoogle: 'Lo que diga lo transcribe Twilio y lo procesa Google para responderle.',
  avisoGratis: 'Como es una versión gratuita, Google puede usar lo que diga para mejorar sus productos.',
  aceptar: 'Para aceptar y hablar con ella, oprima 1. Si no, cuelgue cuando quiera.',
  pregunta: 'Cuénteme en pocas palabras qué necesita, sin nombres ni números.',
  noEscucho: 'Parece que no le escucho. Si necesita algo más, abra MiDerecho o pídale ayuda a su líder. Hasta luego.',
  tiempo: 'Se nos acabó el tiempo de esta llamada.',
  riesgo: 'Si hay peligro ahora mismo, llame al uno, dos, tres. La Personería de su municipio o la Defensoría del Pueblo pueden activar rutas de protección. También puede escribir al Programa Somos Defensores, al correo proteccion arroba somosdefensores punto org.',
  cierre: 'Recuerde que soy un asistente automático. Para una duda legal, acuda a la Personería o a un consultorio jurídico. Hasta luego.',
  error: 'No pudimos leer este recordatorio. Abra la app MiDerecho. Hasta luego.',
};
// Tecla o palabra → opción. La palabra solo cuenta después de la primera tecla (un buzón de voz también "habla").
const opcion = (digito, dicho = '') => {
  const d = dicho.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();   // "Sí." → "si."
  return digito || (/peligro|amenaz/.test(d) ? '9' : /asistente|hablar/.test(d) ? '4' : /repet|otra vez/.test(d) ? '3' : /\bno\b/.test(d) ? '2' : /\b(si|ya)\b/.test(d) ? '1' : '');
};

export async function menuDeVoz(req, res) {
  const q = { ...(req.query || {}), ...(req.body && typeof req.body === 'object' ? req.body : {}) };
  let cuerpo;
  try {
    const datos = { codigo: codigoDe(q.codigo), vence: venceDe(q.vence), l: q.l }, host = req.headers.host, hoy = hoyColombia();
    const a = (paso, s) => xml(urlVoz(host, { ...datos, s }, paso));
    const conIA = abrir(q.l)?.e > ahora();   // la llamada salió de este servidor hace menos de 15 minutos
    const riesgo = async () => await voz(TEXTOS.riesgo, host) + decir('Repito.') + decir(TEXTOS.riesgo) + decir('Cuídese. Hasta luego.');
    if (!q.paso) {
      cuerpo = `<Pause length="1"/><Gather input="dtmf" numDigits="1" timeout="10" action="${a('1')}" method="GET">${decir(TEXTOS.llave)}</Gather>${decir(TEXTOS.nadie)}`;
    } else if (q.paso === '1') {
      const menu = t => `<Gather input="dtmf speech" numDigits="1" timeout="8" speechTimeout="auto" language="es-CO" hints="sí, no, repetir, asistente" action="${a('2')}" method="GET">${decir(t)}</Gather>`;
      cuerpo = decir(presentacionVoz(datos.codigo, datos.vence, hoy)) + (datos.codigo
        ? menu(TEXTOS.opciones + (conIA ? ' ' + TEXTOS.conAsistente : '')) + decir(TEXTOS.cierre)
        : (conIA ? menu(TEXTOS.conAsistente) : '') + decir(TEXTOS.orienta) + decir(TEXTOS.cierre));
    } else if (q.paso === '2') {
      const o = opcion(q.Digits, q.SpeechResult);
      cuerpo = o === '1' ? decir(TEXTOS.respondieron) + decir(TEXTOS.cierre)
        : o === '2' ? decir(!datos.vence ? TEXTOS.sinFecha : hoy > datos.vence ? TEXTOS.vencido : TEXTOS.aTiempo) + decir(TEXTOS.cierre)
        : o === '9' ? decir(TEXTOS.riesgo) + decir('Repito.') + decir(TEXTOS.riesgo) + decir('Cuídese. Hasta luego.')
        : o === '4' && conIA ? `<Gather input="dtmf" numDigits="1" timeout="8" action="${a('ia')}" method="GET">${await voz(avisoIA(), host)}</Gather>${decir(TEXTOS.cierre)}`
        : `${o === '3' ? '' : decir(TEXTOS.noEntendi)}<Redirect method="GET">${a('1')}</Redirect>`;
    } else if (q.paso === 'ia' && conIA && q.Digits === '1') {
      // Aceptó hablar con la IA: prueba mínima de esa autorización (seudónimo del número que contestó, fecha y versión).
      try { await kv(autorizacion(celular(q.To || q.Called), VERSION_IA, 'ia')); } catch { /* sin número de Twilio: sigue */ }
      const s = sellar({ c: datos.codigo, v: datos.vence, h: [], n: 0, i: ahora() });
      const [pregunta, nadie] = await Promise.all([voz(TEXTOS.pregunta, host), voz(TEXTOS.noEscucho, host)]);
      cuerpo = escuchar(a('turno', s), pregunta) + nadie;
    } else if (q.paso === 'turno' && conIA) {
      const st = abrir(q.s), dicho = String(q.SpeechResult ?? '').slice(0, 500).trim();
      if (!st || ahora() - st.i > MAX_SEGUNDOS + 120) cuerpo = decir(TEXTOS.cierre);
      else if (!dicho) cuerpo = await voz(TEXTOS.noEscucho, host);
      else {
        const texto = limpiar(dicho).texto, historial = [...st.h, { rol: 'persona', texto }];
        const r = hayRiesgo(texto) ? { riesgo: true } : await responderIA(historial, contexto(st, hoy));
        const n = st.n + 1, ultimo = r.fin || n >= MAX_TURNOS || ahora() - st.i > MAX_SEGUNDOS;
        if (r.riesgo || ultimo) console.log(`[ia-telefono] fin tras ${n} turno(s)${r.riesgo ? ' (riesgo)' : ''}`);   // solo la cantidad
        if (r.riesgo) cuerpo = await riesgo();
        else if (ultimo) cuerpo = (await Promise.all([r.texto, !r.fin && TEXTOS.tiempo, TEXTOS.cierre].filter(Boolean).map(t => voz(t, host)))).join('');
        else {
          const h = [...historial, { rol: 'asistente', texto: r.texto }].slice(-4).map(m => ({ ...m, texto: m.texto.slice(0, 300) }));
          const [dice, nadie] = await Promise.all([voz(r.texto, host), voz(TEXTOS.noEscucho, host)]);
          cuerpo = escuchar(a('turno', sellar({ ...st, h, n })), dice) + nadie;
        }
      }
    } else {
      cuerpo = decir(TEXTOS.cierre);
    }
  } catch {
    cuerpo = decir(TEXTOS.error);   // Twilio necesita TwiML aunque los datos vengan mal
  }
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response>${cuerpo}<Hangup/></Response>`);
}

// Lo que se dice antes de conversar: qué es, qué no decir, quién procesa la voz (si hay Gemini) y cómo aceptar.
const avisoIA = () => {
  const plan = (process.env.GEMINI_PLAN || '').trim().toLowerCase(), gemini = !!(process.env.GEMINI_API_KEY || '').trim() && ['pago', 'gratis'].includes(plan);
  return [TEXTOS.avisoIA, gemini && TEXTOS.avisoGoogle, gemini && plan === 'gratis' && TEXTOS.avisoGratis, TEXTOS.aceptar].filter(Boolean).join(' ');
};
// Contexto para la IA, sin datos sensibles: el código y la fecha (o que no hay caso) y la fecha de hoy.
const contexto = ({ c, v }, hoy) => `hoy es ${fechaVoz(hoy)}. ${c ? `La persona tiene el caso ${[...c].join(', ')}${v ? `, cuyo plazo ${hoy > v ? 'venció' : 'vence'} el ${fechaVoz(v)}` : ''}.` : 'La persona no tiene un caso abierto.'}`;

// GET /api/llamar?audio=…: el mp3 de ElevenLabs para <Play>. Solo abre textos sellados aquí y vigentes (5 minutos).
async function audio(req, res) {
  const a = abrir(req.query.audio);
  if (!a || !(a.e > ahora()) || typeof a.t !== 'string') return res.status(403).send('');
  const mp3 = await sintetizar(a.t);
  if (!mp3) return res.status(502).send('');
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'private, max-age=300');
  res.status(200).send(mp3);
}

// JWT HS256 de QStash: firmado con la clave actual o la siguiente, para esta URL, vigente y con el hash de este cuerpo.
// ponytail: el cuerpo se rehace con JSON.stringify; vale porque lo publicamos nosotros como {"id":"..."}.
function firmaQstash(req, b) {
  const [h, p, firma = ''] = String(req.headers['upstash-signature'] ?? '').split('.');
  const igual = (a, z) => a.length === z.length && timingSafeEqual(Buffer.from(a), Buffer.from(z));
  const claves = [env.QSTASH_CURRENT_SIGNING_KEY, env.QSTASH_NEXT_SIGNING_KEY].filter(Boolean);
  if (!p || !claves.some(k => igual(createHmac('sha256', k).update(h + '.' + p).digest('base64url'), firma))) throw falla(401, 'Firma inválida');
  const c = JSON.parse(Buffer.from(p, 'base64url')), t = ahora();
  const cuerpo = createHash('sha256').update(JSON.stringify(b)).digest('base64url');
  if (c.iss !== 'Upstash' || c.sub !== destino(req) || t > c.exp + 60 || t < c.nbf - 60 || String(c.body).replace(/=+$/, '') !== cuerpo)
    throw falla(401, 'Firma inválida');
}

function codigoDe(c) {
  if (c == null || c === '') return null;
  if (!/^[A-Z0-9]{4,12}$/.test(c)) throw falla(400, 'Código de caso inválido');
  return c;
}
function venceDe(v) {
  if (v == null || v === '') return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) && Date.parse(v + 'T00:00Z');
  if (!d || new Date(d).toISOString().slice(0, 10) !== v) throw falla(400, 'Fecha de vencimiento inválida');
  return v;
}
function cuandoDe(c) {
  const s = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(c) && Date.parse(c) / 1000;
  if (!s || s % 1800) throw falla(400, 'Hora inválida: escoja una franja en punto o y media');
  if (s < ahora() + 600 || s > ahora() + 7 * 86400) throw falla(400, 'La llamada se puede agendar desde dentro de 10 minutos y hasta 7 días');
  if (!enHorario(s)) throw falla(400, FUERA);
  return s;
}
