// POST /api/sms { plantilla, telefono, datos }: un SMS con texto fijo del servidor (plantillas de _avisos.js).
// No acepta texto libre: los SMS no van cifrados y solo pueden llevar el código del caso y fechas.
import { atender } from './_comun.js';
import { enviarAviso } from './_avisos.js';

export default async function handler(req, res) {
  return atender(req, res, { POST: b => enviarAviso(req, b, 'sms') });
}
