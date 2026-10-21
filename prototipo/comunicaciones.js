// Cliente del navegador para las funciones de /api (interfaz en CONTRATOS.md, sección 3).
// Nunca lanza errores: sin internet o si el servidor falla, devuelve { ok: false, error } y la app sigue.
async function pedir(ruta, method, datos) {
  if (!navigator.onLine) return { ok: false, simulado: false, error: 'Sin internet' };
  try {
    const r = await fetch('api/' + ruta, {
      method, headers: { 'Content-Type': 'application/json' }, body: datos && JSON.stringify(datos),
      signal: AbortSignal.timeout?.(15000),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.ok === true ? j : { ok: false, simulado: false, error: j.error || `El servidor respondió ${r.status}` };
  } catch {
    return { ok: false, simulado: false, error: 'No se pudo conectar con el servidor' };
  }
}

export function enviarSMS(telefono, texto) {
  return pedir('sms', 'POST', { telefono, texto });
}
export function enviarWhatsApp(telefono, texto, { pdfUrl } = {}) {
  return pedir('whatsapp', 'POST', { telefono, texto, pdfUrl });
}
// canal: 'sms' | 'whatsapp' | 'llamada'; fechas: ['AAAA-MM-DD']. Solo con autorización expresa de la persona.
// Devuelve además `token`: guárdelo con el caso, porque sin él no se puede cancelar.
// `mensaje` se ignora: el servidor arma el texto con una plantilla fija (código y fecha).
export function programarRecordatorios({ codigo, telefono, canal, fechas }) {
  return pedir('recordatorios', 'POST', { codigo, telefono, canal, fechas });
}
export function cancelarRecordatorios(codigo, token) {
  return pedir('recordatorios', 'DELETE', { codigo, token });
}
