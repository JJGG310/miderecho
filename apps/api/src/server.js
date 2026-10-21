import { app } from './app.js';

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`MiDerecho API en http://localhost:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'Asistente: Claude' : process.env.GEMINI_API_KEY ? 'Asistente: Gemini' : 'Asistente: modo simulado (falta ANTHROPIC_API_KEY o GEMINI_API_KEY en apps/api/.env)');
});
