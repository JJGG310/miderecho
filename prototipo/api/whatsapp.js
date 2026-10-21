// POST /api/whatsapp { plantilla, telefono, datos }: el mismo aviso de sms.js por WhatsApp. Nunca un chat libre con IA
// (política de Meta). En el sandbox de Twilio llega solo a quien envió "join <código>"; fuera de la ventana de 24 h
// hace falta la plantilla aprobada de cada aviso en TWILIO_WA_<NOMBRE> (docs/agente-y-avisos.md).
import { manejarAviso } from './_avisos.js';

export default manejarAviso('whatsapp');
