// Cliente del backend (apps/api). El relato pasa por el filtro de privacidad ANTES de salir del celular.
import { limpiar } from '@miderecho/nucleo/privacidad';

const BASE = import.meta.env.VITE_API_URL || '';

export async function preguntarAsistente(mensajes) {
  const limpios = mensajes.map(m => ({ rol: m.rol, texto: limpiar(m.texto).texto }));
  const r = await fetch(`${BASE}/api/asistente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensajes: limpios }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Error ${r.status}`);
  return r.json();
}
