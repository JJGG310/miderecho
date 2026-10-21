// API de MiDerecho. Express sin estado: no guarda relatos, nombres ni cédulas (investigacion/06).
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { limpiar, hayRiesgo, generarDocumento, TIPOS, sumarHabiles, habilesEntre, iso, deIso, AYUDA_RIESGO } from '@miderecho/nucleo';
import { SISTEMA } from './prompt.js';
import { HERRAMIENTA, armarRespuesta } from './orientacion.js';
import { responderSimulado } from './simulado.js';

const MODELO = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const claude = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
const MAX_MENSAJES = 12, MAX_TEXTO = 2000;

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '50kb' }));

// CORS solo para los orígenes configurados (la app en producción). En desarrollo Vite hace de proxy.
const ORIGENES = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use((req, res, next) => {
  const o = req.headers.origin;
  if (o && ORIGENES.includes(o)) {
    res.set({ 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' });
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/salud', (req, res) => res.json({ ok: true, ia: claude ? 'claude' : 'simulada', modelo: claude ? MODELO : null }));

// Conversación con el asistente. La app manda el historial (no se guarda en el servidor).
app.post('/api/asistente', async (req, res) => {
  const entrada = Array.isArray(req.body?.mensajes) ? req.body.mensajes : null;
  if (!entrada?.length) return res.status(400).json({ error: 'Falta "mensajes".' });
  // Segunda capa del filtro de privacidad (la primera corre en el celular).
  const mensajes = entrada.slice(-MAX_MENSAJES)
    .filter(m => m && typeof m.texto === 'string' && ['persona', 'asistente'].includes(m.rol))
    .map(m => ({ rol: m.rol, texto: limpiar(m.texto.slice(0, MAX_TEXTO)).texto }));
  if (mensajes.at(-1)?.rol !== 'persona') return res.status(400).json({ error: 'El último mensaje debe ser de la persona.' });

  // El protocolo de riesgo no espera a la IA.
  if (hayRiesgo(mensajes.filter(m => m.rol === 'persona').map(m => m.texto).join(' '))) {
    return res.json({ ...armarRespuesta({ accion: 'riesgo', mensaje: 'Lo que me cuentas es serio. No te voy a pedir más datos y no vamos a guardar nada de esto. Si hay peligro ahora mismo, llama al 123.' }), ayuda: AYUDA_RIESGO, fuente: 'reglas' });
  }

  try {
    let r, fuente = 'simulada';
    if (claude) {
      const msg = await claude.messages.create({
        model: MODELO,
        max_tokens: 1500,
        system: SISTEMA,
        tools: [HERRAMIENTA],
        tool_choice: { type: 'tool', name: 'responder' },
        messages: unirTurnos(mensajes),
      });
      r = msg.content.find(b => b.type === 'tool_use')?.input;
      fuente = 'claude';
    }
    if (!r?.accion) r = responderSimulado(mensajes);
    const out = armarRespuesta(r);
    if (out.riesgo) out.ayuda = AYUDA_RIESGO;
    res.json({ ...out, fuente });
  } catch (e) {
    console.error('asistente:', e.status || '', e.message);
    // Si la IA falla (sin saldo, sin red), el demo sigue con el modo simulado.
    res.json({ ...armarRespuesta(responderSimulado(mensajes)), fuente: 'simulada', aviso: 'La IA no respondió; se usó el modo básico.' });
  }
});

// La API de Anthropic exige turnos alternados que empiecen por "user".
function unirTurnos(mensajes) {
  const out = [];
  for (const m of mensajes) {
    const role = m.rol === 'persona' ? 'user' : 'assistant';
    if (out.at(-1)?.role === role) out.at(-1).content += '\n' + m.texto;
    else out.push({ role, content: m.texto });
  }
  while (out[0]?.role === 'assistant') out.shift();
  return out;
}

// Documento con las plantillas fijas. Para otros canales (WhatsApp, llamada); la app lo genera en el celular.
app.post('/api/documento', (req, res) => {
  const { tipo, datos } = req.body || {};
  if (!TIPOS[tipo]) return res.status(400).json({ error: `Tipo desconocido. Use: ${Object.keys(TIPOS).join(', ')}` });
  try {
    res.json({ tipo, titulo: TIPOS[tipo].titulo, html: generarDocumento(tipo, datos || {}) });
  } catch (e) {
    res.status(400).json({ error: 'Faltan datos para el documento: ' + e.message });
  }
});

// Plazo de respuesta en días hábiles colombianos.
app.post('/api/plazo', (req, res) => {
  const { dias, desde, hoy } = req.body || {};
  if (!Number.isInteger(dias) || !/^\d{4}-\d{2}-\d{2}$/.test(desde || '')) return res.status(400).json({ error: 'Use { dias: 15, desde: "AAAA-MM-DD" }.' });
  const vence = sumarHabiles(deIso(desde), dias);
  const hoyD = hoy ? deIso(hoy) : new Date();
  res.json({ vence: iso(vence), faltan: habilesEntre(hoyD, vence) });
});

app.use((req, res) => res.status(404).json({ error: 'No existe.' }));
