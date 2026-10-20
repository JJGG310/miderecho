// POST /api/llamada { telefono, mensaje }: llamada saliente que lee el mensaje en español latino (TwiML <Say>).
import { atender, celular, texto, proteger, enviar } from './_comun.js';

export default async function handler(req, res) {
  return atender(req, res, {
    async POST(b) {
      const tel = celular(b.telefono), m = texto(b.mensaje, 400);
      await proteger(req, tel);
      return enviar('llamada', tel, m);
    },
  });
}
