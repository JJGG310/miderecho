// GET /api/cron-recordatorios: Vercel Cron la llama a diario a las 13:00 UTC (8 a. m. en Colombia; en Hobby, hasta 59 min tarde).
// Envía los recordatorios de hoy y los que quedaron de ayer (SMS, WhatsApp, llamada o push), con texto fijo (código y fecha),
// en tandas y con tiempo límite. Primero lo que cuesta (SMS, WhatsApp, llamada) y al final push; las llamadas solo de
// 8 a. m. a 7 p. m. (fuera de ese horario se quedan en el día y salen en la próxima corrida, como "ayer").
// Nunca reescribe un registro: si lo cancelan mientras corre, no revive.
import { atender, falla, descifrar, enviar, kv, contar, simulado, limiteDiario, limitePush, horarioVoz, hoyColombia, textoLlamada } from './_comun.js';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const corta = f => `${+f.slice(8)}-${MESES[f.slice(5, 7) - 1]}`;
export const textoRecordatorio = (codigo, f) => `Caso ${codigo}: recordatorio del ${corta(f)}. Si la entidad no le ha respondido, avise a su lider.`;
// Aviso push: solo el código y cuándo vence (se ve con la pantalla bloqueada).
const larga = f => new Date(f + 'T12:00Z').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', timeZone: 'UTC' });
export const textoPush = (codigo, f, vence) => f > vence ? `Se venció el plazo del caso ${codigo}. Abra MiDerecho para ver qué sigue.`
  : `Su caso ${codigo} vence ${f === vence ? 'hoy' : Date.parse(vence) - Date.parse(f) === 864e5 ? 'mañana' : 'el ' + larga(vence)}.`;

export default async function handler(req, res) {
  return atender(req, res, {
    async GET() {
      const secreto = process.env.CRON_SECRET;
      if (!secreto) console.error('[cron] falta CRON_SECRET: no se envía ningún recordatorio');
      if (!secreto || req.headers.authorization !== `Bearer ${secreto}`) throw falla(401, 'No autorizado');
      const hoy = hoyColombia(), ayer = new Date(Date.parse(hoy) - 864e5).toISOString().slice(0, 10), inicio = Date.now();
      const cuenta = { enviados: 0, fallidos: 0, omitidos: 0, pendientes: 0 };
      for (const f of [ayer, hoy]) {
        const [todos] = await kv(['SMEMBERS', 'dia:' + f]);
        const regs = todos.length ? await kv(...todos.map(id => ['GET', 'rec:' + id])) : [];
        const lista = todos.map((id, i) => ({ id, canal: regs[i] && JSON.parse(regs[i]).canal }));
        const ids = lista.filter(x => x.canal !== 'llamada' || horarioVoz()).sort((a, b) => (a.canal === 'push') - (b.canal === 'push')).map(x => x.id);
        cuenta.omitidos += lista.length - ids.length;
        for (let i = 0; i < ids.length; i += 10) {
          if (Date.now() - inicio > 40e3) { cuenta.pendientes += ids.length - i; break; }   // lo que falte sale mañana, como "ayer"
          await Promise.all(ids.slice(i, i + 10).map(id => procesar(id, f, hoy, cuenta)));
        }
      }
      console.log('[cron]', JSON.stringify(cuenta));
      return { ok: true, ...cuenta };
    },
  });
}

async function procesar(id, f, hoy, cuenta) {
  const [txt] = await kv(['GET', 'rec:' + id], ['SREM', 'dia:' + f, id]);   // sale del día antes de enviar: nunca va dos veces
  if (!txt) return;   // cancelado o vencido
  const r = JSON.parse(txt), plantilla = process.env.TWILIO_WHATSAPP_PLANTILLA, push = r.canal === 'push';
  if (!simulado(r.canal) && await contar(push ? 'push-total' : 'total', 86400) > (push ? limitePush() : limiteDiario())) return void cuenta.omitidos++;
  try {
    const texto = push ? textoPush(r.codigo, f, r.vence) : r.canal === 'llamada' ? textoLlamada(r.codigo, r.vence, f) : textoRecordatorio(r.codigo, f);
    await enviar(r.canal, descifrar(r.c), texto,
      { plantilla: r.canal === 'whatsapp' && plantilla && { sid: plantilla, variables: { 1: r.codigo, 2: corta(f) } } });
    cuenta.enviados++;
  } catch (e) {
    cuenta.fallidos++;
    console.error('[cron] no se envió:', e.message);
    if (e.status === 410) return void await kv(['DEL', 'rec:' + id]);   // el navegador quitó el permiso: no se insiste
  }
  if (r.fechas.at(-1) <= hoy) await kv(['DEL', 'rec:' + id]);   // era el último: se borra ya
}
