import express from 'express';
import { app } from './app.js';

const PORT = process.env.PORT || 8787;

// Solo en local (npm run dev): delante del backend, las funciones de Vercel de llamadas y recordatorios (prototipo/api),
// en modo simulado mientras no haya claves en apps/api/.env. En producción las publica Vercel.
const local = express();
for (const ruta of ['llamar', 'recordatorios'])
  local.all(`/api/${ruta}`, express.json(), async (req, res) => (await import(`../../../prototipo/api/${ruta}.js`)).default(req, res));
local.use(app);

local.listen(PORT, () => {
  console.log(`MiDerecho API en http://localhost:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'Asistente: Claude' : 'Asistente: modo simulado (falta ANTHROPIC_API_KEY en apps/api/.env)');
});
