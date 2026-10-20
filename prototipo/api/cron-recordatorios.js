// GET /api/cron-recordatorios: Vercel Cron la llama cada día a las 13:00 UTC (8 a. m. en Colombia; en el plan Hobby puede llegar hasta 59 min tarde).
// Envía los recordatorios de hoy (y los atrasados si un día falló el cron, una sola vez) y borra los que ya no tienen fechas.
import { atender, falla, descifrar, enviar, recordatorios, hoyColombia } from './_comun.js';

export default async function handler(req, res) {
  return atender(req, res, {
    async GET() {
      const secreto = process.env.CRON_SECRET;
      if (!secreto || req.headers.authorization !== `Bearer ${secreto}`) throw falla(401, 'No autorizado');
      const hoy = hoyColombia(), plantilla = process.env.TWILIO_WHATSAPP_PLANTILLA;
      let enviados = 0, fallidos = 0, borrados = 0;
      // ponytail: recorre todos en serie; con miles de recordatorios, indexar por fecha (ZSET) y enviar en paralelo.
      for (const [codigo, r] of await recordatorios.todos()) {
        const quedan = r.fechas.filter(f => f > hoy);
        if (quedan.length === r.fechas.length) continue;
        try {
          const { tel, mensaje } = JSON.parse(descifrar(r.c));
          await enviar(r.canal, tel, mensaje, { plantilla: r.canal === 'whatsapp' && plantilla && { sid: plantilla, variables: { 1: codigo } } });
          enviados++;
        } catch (e) { fallidos++; console.error('[cron] no se envió:', e.message); }   // sin reintento: mañana el aviso ya sería viejo
        if (quedan.length) await recordatorios.guardar(codigo, { ...r, fechas: quedan });
        else { await recordatorios.borrar(codigo); borrados++; }
      }
      return { ok: true, enviados, fallidos, borrados };
    },
  });
}
