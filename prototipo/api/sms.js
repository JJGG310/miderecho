// POST /api/sms { telefono, texto }: un solo SMS (160 caracteres, sin tildes). Nunca nombres, cédula ni hechos: los SMS no van cifrados.
import { atender, celular, texto, gsm, proteger, enviar } from './_comun.js';

export default async function handler(req, res) {
  return atender(req, res, {
    async POST(b) {
      const tel = celular(b.telefono), t = texto(gsm(String(b.texto ?? '')), 160);
      await proteger(req, tel);
      return enviar('sms', tel, t);
    },
  });
}
