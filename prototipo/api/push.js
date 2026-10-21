// GET /api/push → { ok, simulado, clave }: la clave pública VAPID que el navegador necesita para suscribirse a los avisos.
// POST /api/push { suscripcion } → manda ya un aviso de prueba a ese navegador, para confirmar que llegan.
// Los avisos de los plazos los programa POST /api/recordatorios con canal 'push' y los envía el cron (texto fijo).
import { atender, suscripcion, proteger, enviar, simulado } from './_comun.js';

export default async function handler(req, res) {
  return atender(req, res, {
    GET: async () => ({ ok: true, simulado: simulado('push'), clave: process.env.VAPID_PUBLIC_KEY || null }),
    async POST(b) {
      const s = suscripcion(b.suscripcion);
      await proteger(req, s, 'push');
      return enviar('push', s, 'Listo: así le van a llegar los avisos de sus plazos.');
    },
  });
}
