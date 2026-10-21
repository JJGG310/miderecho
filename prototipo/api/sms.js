// POST /api/sms { plantilla, telefono, datos }: un SMS con texto fijo del servidor (plantillas de _avisos.js).
// No acepta texto libre: los SMS no van cifrados y solo pueden llevar el código del caso y una fecha.
import { manejarAviso } from './_avisos.js';

export default manejarAviso('sms');
