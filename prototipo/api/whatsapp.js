// POST /api/whatsapp { telefono, texto, pdfUrl? }: solo avisos y documentos, nunca un chat libre con IA (política de Meta).
// En el sandbox de Twilio llega solo a quien envió "join <código>"; fuera de la ventana de 24 h, solo con plantilla aprobada.
import { atender, falla, celular, texto, proteger, enviar } from './_comun.js';

export default async function handler(req, res) {
  return atender(req, res, {
    async POST(b) {
      const tel = celular(b.telefono), t = texto(b.texto, 1000);
      const pdfUrl = b.pdfUrl ? pdfPropio(b.pdfUrl, req.headers.host) : undefined;
      await proteger(req, tel, 'whatsapp');
      return enviar('whatsapp', tel, t, { pdfUrl });
    },
  });
}

// El PDF debe estar en este mismo sitio (o en DOMINIOS_PDF): así nadie usa el número para repartir archivos ajenos.
function pdfPropio(url, host) {
  let u;
  try { u = new URL(url); } catch { throw falla(400, 'pdfUrl inválida'); }
  const permitidos = [host, ...String(process.env.DOMINIOS_PDF || '').split(',').map(d => d.trim())].filter(Boolean);
  if (u.protocol !== 'https:' || !permitidos.includes(u.host)) throw falla(400, 'El PDF debe estar en este mismo sitio, con https');
  return u.href;
}
