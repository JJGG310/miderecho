// En Vercel las claves se guardaron como "elevenlabs" y "gemini": se aceptan esos nombres además de los largos.
for (const [largo, corto] of [['ELEVENLABS_API_KEY', 'elevenlabs'], ['GEMINI_API_KEY', 'gemini']])
  if (!process.env[largo] && process.env[corto]) process.env[largo] = process.env[corto];
// "twiilo": secreto de la API Key si existe TWILIO_API_KEY; si no, el Auth Token.
if (!process.env.TWILIO_API_SECRET && !process.env.TWILIO_AUTH_TOKEN && process.env.twiilo)
  process.env[process.env.TWILIO_API_KEY ? 'TWILIO_API_SECRET' : 'TWILIO_AUTH_TOKEN'] = process.env.twiilo;
