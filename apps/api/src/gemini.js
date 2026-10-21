// Gemini (Google) como segundo proveedor del asistente. API REST con fetch, sin SDK (docs/ia.md).
// Misma herramienta "responder" que Claude, como function calling obligatorio: devuelve el mismo formato.
import { SISTEMA } from './prompt.js';
import { HERRAMIENTA } from './orientacion.js';

export const MODELO_GEMINI = 'gemini-3.8-flash';
const ESPERA_MS = 20_000; // la función de Vercel corta a los 30 s (prototipo/vercel.json)

// Bloquea solo lo claramente dañino: relatos de violencia o de salud son temas legítimos de la app.
const SEGURIDAD = ['HARASSMENT', 'HATE_SPEECH', 'SEXUALLY_EXPLICIT', 'DANGEROUS_CONTENT']
  .map(c => ({ category: 'HARM_CATEGORY_' + c, threshold: 'BLOCK_ONLY_HIGH' }));

// turnos: [{ role: 'user'|'assistant', content }] ya filtrados y alternados (unirTurnos en app.js).
// Devuelve los argumentos de "responder" o lanza un error sin el contenido de los mensajes.
export async function pedirGemini(turnos, { clave, modelo = MODELO_GEMINI, vertex = false }) {
  const url = vertex
    ? `https://aiplatform.googleapis.com/v1/publishers/google/models/${modelo}:generateContent?key=${encodeURIComponent(clave)}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(vertex ? {} : { 'x-goog-api-key': clave }) },
    signal: AbortSignal.timeout(ESPERA_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SISTEMA }] },
      contents: turnos.map(t => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.content }] })),
      tools: [{ functionDeclarations: [{ name: HERRAMIENTA.name, description: HERRAMIENTA.description, parametersJsonSchema: HERRAMIENTA.input_schema }] }],
      toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: [HERRAMIENTA.name] } },
      safetySettings: SEGURIDAD,
      // thinkingLevel existe desde Gemini 3: con un modelo anterior la llamada falla y se usa el modo básico.
      generationConfig: { maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: 'LOW' } },
    }),
  });
  if (!res.ok) throw Object.assign(new Error('Gemini respondió ' + res.status), { status: res.status });
  const data = await res.json();
  const args = data.candidates?.[0]?.content?.parts?.find(p => p.functionCall)?.functionCall.args;
  if (!args?.accion) throw new Error('Gemini no usó la herramienta: ' + (data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || 'sin candidatos'));
  return args;
}
