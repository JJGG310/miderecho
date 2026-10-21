import express from 'express';
import { app } from './app.js';
import correo from '../../../prototipo/api/correo.js';   // en Vercel es una función aparte; aquí, para probar el envío en desarrollo

const PORT = process.env.PORT || 8787;
express().all('/api/correo', express.json({ limit: '50kb' }), correo).use(app).listen(PORT, () => {
  console.log(`MiDerecho API en http://localhost:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'Asistente: Claude' : 'Asistente: modo simulado (falta ANTHROPIC_API_KEY en apps/api/.env)');
});
