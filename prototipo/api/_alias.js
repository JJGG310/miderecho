// En Vercel las claves se guardaron como "elevenlabs" y "gemini": se aceptan esos nombres además de los largos.
for (const [largo, corto] of [['ELEVENLABS_API_KEY', 'elevenlabs'], ['GEMINI_API_KEY', 'gemini']])
  if (!process.env[largo] && process.env[corto]) process.env[largo] = process.env[corto];
