import express from 'express';
import { app } from './app.js';
import correo from '../../../prototipo/api/correo.js';   // en Vercel es una función aparte; aquí, para probar el envío en desarrollo

const PORT = process.env.PORT || 8787;

// Solo en local (npm run dev): delante del backend, las funciones de Vercel de correo, llamadas y recordatorios (prototipo/api),
// en modo simulado mientras no haya claves en apps/api/.env. En producción las publica Vercel.
const local = express();
local.all('/api/correo', express.json({ limit: '50kb' }), correo);
for (const ruta of ['llamar', 'recordatorios'])
  local.all(`/api/${ruta}`, express.json(), async (req, res) => (await import(`../../../prototipo/api/${ruta}.js`)).default(req, res));
local.use(app);

local.listen(PORT, () => {
  console.log(`MiDerecho API en http://localhost:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'Asistente: Claude' : process.env.GEMINI_API_KEY ? 'Asistente: Gemini' : 'Asistente: modo simulado (falta ANTHROPIC_API_KEY o GEMINI_API_KEY en apps/api/.env)');
});
