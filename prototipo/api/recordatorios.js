// POST /api/recordatorios { codigo, telefono, canal, fechas, acepto: true, aviso } → { ok, simulado, token }
//   `vence` (AAAA-MM-DD) es opcional y lo usan los textos de push y de llamada; push lleva `suscripcion` en vez de teléfono.
//   `aviso` es la versión del texto de autorización que vio la persona; con envío real queda la prueba por canal.
// DELETE /api/recordatorios { codigo, token }
// GET /api/recordatorios → { ok, simulado, clave }: la clave pública VAPID para suscribirse a las notificaciones push.
// Guarda el código, el canal, las fechas y el teléfono (o la suscripción) cifrado; el texto lo arma el cron con una plantilla fija.
// El registro se llama HMAC(código + token): el código va impreso en el documento, el token (128 bits) solo lo tiene la app.
// Cada registro vence solo 3 días después de su última fecha. La app debe pedir antes la autorización expresa de la persona.
import { randomBytes } from 'node:crypto';
import { atender, falla, celular, suscripcion, proteger, cifrar, hmac, incr, kv, redisListo, simulado, oculto, version, autorizacion,
  hoyColombia, horaColombia, limiteDiario, POR_NUMERO_DIA, CODIGOS_POR_NUMERO } from './_comun.js';

const dia = f => Date.parse(f + 'T00:00:00Z') / 1000;   // segundos al comienzo de la fecha
const idDe = (codigo, token) => hmac(`rec:${codigo}:${token}`);

export default async function handler(req, res) {
  return atender(req, res, {
    GET: async () => ({ ok: true, simulado: simulado('push'), clave: process.env.VAPID_PUBLIC_KEY || null }),
    async POST(b) {
      const codigo = codigoDe(b.codigo), canal = b.canal, push = canal === 'push';
      if (!['sms', 'whatsapp', 'llamada', 'push'].includes(canal)) throw falla(400, 'Canal inválido: sms, whatsapp, llamada o push');
      if (b.acepto !== true) throw falla(400, 'Falta la autorización para estos recordatorios');
      const aviso = version(b.aviso);
      const tel = push ? suscripcion(b.suscripcion) : celular(b.telefono), fechas = fechasDe(b.fechas), vence = push || b.vence ? venceDe(b.vence) : undefined;
      const real = !simulado(canal);
      if (real && canal === 'whatsapp' && !process.env.TWILIO_WHATSAPP_PLANTILLA)
        throw falla(400, 'Los recordatorios por WhatsApp necesitan una plantilla aprobada (TWILIO_WHATSAPP_PLANTILLA)');
      if (real && !process.env.CRON_SECRET) console.error('[recordatorios] falta CRON_SECRET: el cron no podrá enviar');
      await proteger(req, tel, canal);

      // Hasta CODIGOS_POR_NUMERO casos (códigos distintos) por número, 20 por celular en push (el líder ayuda a varios
      // vecinos). Solo se reemplaza el mismo código por el mismo canal (reintentos): SMS y llamada del mismo caso conviven.
      const h = hmac('num:' + tel), [ids] = await kv(['SMEMBERS', 'num:' + h]);
      const regs = (ids.length ? await kv(...ids.map(id => ['GET', 'rec:' + id])) : []).map(r => r && JSON.parse(r));
      const viejos = ids.filter((id, i) => !regs[i] || (regs[i].codigo === codigo && regs[i].canal === canal));
      const otros = new Set(regs.filter(r => r && r.codigo !== codigo).map(r => r.codigo));
      if (real && otros.size >= (push ? 20 : CODIGOS_POR_NUMERO)) throw falla(429, 'Este número ya tiene el máximo de casos con recordatorios');
      // Cada fecha gasta del cupo de ese día: en total (LIMITE_DIARIO) y por número. Push no cuesta: sin cupos.
      if (real && !push) for (const f of fechas)
        if (await incr('prog:' + f, dia(f) + 86400) > limiteDiario() || await incr(`prog:${f}:${h}`, dia(f) + 86400) > POR_NUMERO_DIA)
          throw falla(429, `No quedan cupos de recordatorios para el ${f}`);

      const token = randomBytes(16).toString('base64url'), id = idDe(codigo, token);
      await kv(
        ...viejos.flatMap(v => [['DEL', 'rec:' + v], ['SREM', 'num:' + h, v]]),
        ['SET', 'rec:' + id, JSON.stringify({ codigo, canal, fechas, vence, c: cifrar(tel) }), 'EXAT', dia(fechas.at(-1)) + 3 * 86400],
        ...fechas.flatMap(f => [['SADD', 'dia:' + f, id], ['EXPIREAT', 'dia:' + f, dia(f) + 3 * 86400]]),
        ['SADD', 'num:' + h, id], ['EXPIRE', 'num:' + h, 370 * 86400],
        ...(real ? [autorizacion(tel, aviso, canal)] : []),
      );
      console.log(`[recordatorios] ${fechas.length} fecha(s) por ${canal} a ${oculto(tel)}`);
      return { ok: true, simulado: !redisListo() || !real, token };
    },
    async DELETE(b) {
      const codigo = codigoDe(b.codigo), token = String(b.token ?? '');
      if (!/^[\w-]{22}$/.test(token)) throw falla(400, 'Token inválido');
      await kv(['DEL', 'rec:' + idDe(codigo, token)]);   // siempre responde igual: no revela si existía
      return { ok: true, simulado: !redisListo() };
    },
  });
}

function venceDe(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(dia(v)) || !new Date(dia(v) * 1000).toISOString().startsWith(v)) throw falla(400, 'Fecha de vencimiento inválida');
  return v;
}

function codigoDe(c) {
  c = String(c ?? '');
  if (!/^[A-Z0-9]{4,12}$/.test(c)) throw falla(400, 'Código de caso inválido');
  return c;
}

// De 1 a 6 fechas AAAA-MM-DD, desde hoy (hora de Colombia) y dentro de un año. Hoy solo antes del envío de las 8 a. m.
function fechasDe(fechas) {
  const hoy = hoyColombia(), tope = new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10);
  const valida = f => /^\d{4}-\d{2}-\d{2}$/.test(f) && !isNaN(dia(f)) && new Date(dia(f) * 1000).toISOString().startsWith(f) && f >= hoy && f <= tope;
  if (!Array.isArray(fechas) || !fechas.length || fechas.length > 6 || !fechas.every(valida))
    throw falla(400, 'Fechas inválidas: de 1 a 6, con formato AAAA-MM-DD, desde hoy y dentro de un año');
  if (fechas.includes(hoy) && horaColombia() >= 8) throw falla(400, 'El envío de hoy ya salió a las 8 a. m.: use fechas desde mañana');
  return [...new Set(fechas)].sort();
}
