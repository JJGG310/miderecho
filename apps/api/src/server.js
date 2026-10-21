import express from 'express';
import { app, IA } from './app.js';
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
  console.log('Asistente:', IA === 'simulada' ? 'modo simulado (ver docs/ia.md para activar Claude o Gemini)' : IA);
});
