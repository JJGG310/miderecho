// POST /api/recordatorios { codigo, telefono, canal, fechas, mensaje } y DELETE /api/recordatorios?codigo=...
// Guarda solo el código, el canal, las fechas y, cifrados, el teléfono y el mensaje. Se borra tras el último envío o al cancelar.
// La app debe pedir antes la autorización expresa de la persona para recibir recordatorios.
import { atender, falla, celular, texto, gsm, proteger, cifrar, descifrar, recordatorios, redisListo, simulado, oculto, hoyColombia } from './_comun.js';

export default async function handler(req, res) {
  return atender(req, res, {
    async POST(b) {
      const codigo = codigoDe(b.codigo), tel = celular(b.telefono), fechas = fechasDe(b.fechas);
      if (!['sms', 'whatsapp', 'llamada'].includes(b.canal)) throw falla(400, 'Canal inválido: sms, whatsapp o llamada');
      const mensaje = b.mensaje ? texto(b.canal === 'sms' ? gsm(String(b.mensaje)) : b.mensaje, 160)
        : `Recordatorio del caso ${codigo}. Si no le han respondido, avise a su lider.`;
      await proteger(req, tel);
      const previo = await recordatorios.leer(codigo);
      if (previo && JSON.parse(descifrar(previo.c)).tel !== tel) throw falla(409, 'Ese código ya tiene recordatorios con otro número');
      await recordatorios.guardar(codigo, { canal: b.canal, fechas, c: cifrar(JSON.stringify({ tel, mensaje })) });
      console.log(`[recordatorios] ${fechas.length} fecha(s) por ${b.canal} a ${oculto(tel)}`);
      return { ok: true, simulado: !redisListo() || simulado(b.canal) };
    },
    async DELETE() {
      const codigo = codigoDe(req.query?.codigo);
      await proteger(req);
      await recordatorios.borrar(codigo);
      return { ok: true, simulado: !redisListo() };
    },
  });
}

function codigoDe(c) {
  c = String(c ?? '');
  if (!/^[A-Z0-9]{4,12}$/.test(c)) throw falla(400, 'Código de caso inválido');
  return c;
}

// De 1 a 6 fechas AAAA-MM-DD, desde hoy (hora de Colombia) y dentro de un año.
function fechasDe(fechas) {
  const hoy = hoyColombia(), tope = new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10);
  const valida = f => /^\d{4}-\d{2}-\d{2}$/.test(f) && !isNaN(new Date(f)) && new Date(f).toISOString().startsWith(f) && f >= hoy && f <= tope;
  if (!Array.isArray(fechas) || !fechas.length || fechas.length > 6 || !fechas.every(valida))
    throw falla(400, 'Fechas inválidas: de 1 a 6, con formato AAAA-MM-DD, desde hoy y dentro de un año');
  return [...new Set(fechas)].sort();
}
