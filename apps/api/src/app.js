// API de MiDerecho. Express sin estado: no guarda relatos, nombres ni cédulas (investigacion/06).
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { limpiar, hayRiesgo, generarDocumento, TIPOS, sumarHabiles, habilesEntre, iso, deIso, AYUDA_RIESGO } from '@miderecho/nucleo';
import { SISTEMA } from './prompt.js';
import { HERRAMIENTA, armarRespuesta, RESPUESTA_RIESGO } from './orientacion.js';
import { responderSimulado } from './simulado.js';
import { pedirGemini, MODELO_GEMINI } from './gemini.js';

// Proveedor: Claude si hay ANTHROPIC_API_KEY; si no, Gemini si hay GEMINI_API_KEY y GEMINI_PLAN (pago o gratis);
// si no, modo básico (docs/ia.md).
const env = k => (process.env[k] || '').trim();
const GEMINI = {
  clave: env('GEMINI_API_KEY'), modelo: env('GEMINI_MODEL') || MODELO_GEMINI,
  vertex: env('GEMINI_ENDPOINT').toLowerCase() === 'vertex', plan: env('GEMINI_PLAN').toLowerCase(),
};
export const IA = process.env.ANTHROPIC_API_KEY ? 'claude' : GEMINI.clave && ['pago', 'gratis'].includes(GEMINI.plan) ? 'gemini' : 'simulada';
const MODELO = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
// Sin reintentos y con tiempo límite, como Gemini: si no responde a tiempo, contesta el modo básico.
const claude = IA === 'claude' ? new Anthropic({ timeout: 20_000, maxRetries: 0 }) : null;
// En el plan gratis Google puede usar lo que se escriba: toda respuesta del asistente lo advierte.
const AVISO_GRATIS = IA === 'gemini' && GEMINI.plan === 'gratis'
  ? 'Modo de prueba: este asistente usa una versión gratuita de Gemini y Google puede usar lo que escriba para mejorar sus productos. No escriba datos reales de salud, nombres ni cédulas.'
  : null;
const enviar = (res, r) => res.json(AVISO_GRATIS ? { ...r, aviso: [r.aviso, AVISO_GRATIS].filter(Boolean).join(' ') } : r);
const MAX_MENSAJES = 12, MAX_TEXTO = 2000;
// La app manda la versión del aviso que la persona aceptó antes de usar la IA (la define apps/web).
const CONSENTIMIENTO = /^ia-v\d{1,3}$/;

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

app.get('/api/salud', (req, res) => res.json({
  ok: true, ia: IA, modelo: { claude: MODELO, gemini: GEMINI.modelo }[IA] || null,
  ...(IA === 'gemini' && { plan: GEMINI.plan }),
  ...(IA === 'simulada' && GEMINI.clave && { aviso: 'Hay GEMINI_API_KEY pero falta GEMINI_PLAN (pago o gratis): Gemini no se usa.' }),
}));

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
    return enviar(res, { ...armarRespuesta(RESPUESTA_RIESGO), ayuda: AYUDA_RIESGO, fuente: 'reglas' });
  }

  // Sin el aviso aceptado, el relato no va a ningún proveedor de IA: contesta el modo básico.
  if (IA !== 'simulada' && !CONSENTIMIENTO.test(typeof req.body.consentimiento === 'string' ? req.body.consentimiento : '')) {
    return enviar(res, { ...armarRespuesta(responderSimulado(mensajes)), fuente: 'simulada', aviso: 'Para usar la inteligencia artificial primero debe aceptar el aviso.' });
  }

  try {
    let r;
    if (IA === 'claude') {
      const msg = await claude.messages.create({
        model: MODELO,
        max_tokens: 1500,
        system: SISTEMA,
        tools: [HERRAMIENTA],
        tool_choice: { type: 'tool', name: 'responder' },
        messages: unirTurnos(mensajes),
      });
      r = msg.content.find(b => b.type === 'tool_use')?.input;
    }
    if (IA === 'gemini') r = await pedirGemini(unirTurnos(mensajes), GEMINI);
    if (IA === 'simulada') r = responderSimulado(mensajes);
    const out = armarRespuesta(r);
    if (!out) throw new Error('respuesta fuera del contrato de "responder"');
    if (out.riesgo) out.ayuda = AYUDA_RIESGO;
    enviar(res, { ...out, fuente: IA });
  } catch (e) {
    console.error('asistente:', IA, e.status || '', e.message);
    // Si la IA falla (sin saldo, sin red, respuesta inválida), el demo sigue con el modo simulado.
    enviar(res, { ...armarRespuesta(responderSimulado(mensajes)), fuente: 'simulada', aviso: 'La IA no respondió; se usó el modo básico.' });
  }
});

// La API de Anthropic exige turnos alternados que empiecen por "user" (Gemini también los acepta así).
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
