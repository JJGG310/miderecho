// POST /api/llamada { telefono, mensaje }: llamada saliente que lee el mensaje en español latino (TwiML <Say>).
import { atender, falla, celular, texto, twiml, proteger, enviar } from './_comun.js';

export default async function handler(req, res) {
  return atender(req, res, {
    async POST(b) {
      const tel = celular(b.telefono), m = texto(b.mensaje, 400);
      if (twiml(m).length > 4000) throw falla(400, 'El mensaje es muy largo para la llamada');   // tope de Twilio para TwiML en línea
      await proteger(req, tel, 'llamada');
      return enviar('llamada', tel, m);
    },
  });
}
