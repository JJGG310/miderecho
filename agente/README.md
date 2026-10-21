# Agente de voz de MiDerecho

Agente conversacional en ElevenLabs que habla con la persona y maneja la app a través de `window.miderecho` (CONTRATOS.md §1 y §4). La IA conversa, entiende y clasifica; lo jurídico sale de las plantillas de la app y de unas pocas frases fijas.

- **Agente:** `agent_8101m5dg7s5se9trrst6fjpvz52d` ("MiDerecho"). Exige **sesión firmada**: solo se abre con el token que entrega `prototipo/api/elevenlabs-sesion.js`.
- **Agente de pruebas:** `agent_3301m5e2amx2f9etc6k5hzwp7kct` ("MiDerecho (pruebas locales)"). Igual al principal, pero sin sesión firmada, solo `localhost`/`127.0.0.1`, con modo texto y 20 conversaciones al día. Si se cambia el principal, cambiar también este.
- **Agente telefónico:** `agent_3901m5fd72hyedssc8h6r4gznevn` ("MiDerecho teléfono"). Copia del principal para llamadas salientes que pide la persona (`prototipo/api/llamar.js`): sin herramientas de pantalla, con las variables `codigo` y `vence`. Prompt en `prompt-telefono.md`, configuración en `configuracion-telefono.json`. Si se cambian las reglas del principal, cambiarlas también aquí.
- **Módulo del navegador:** `prototipo/agente-voz.js`.

| Archivo | Qué es |
|---|---|
| `prompt.md` | Prompt del sistema: protocolo de riesgo, frases fijas, botones que solo toca la persona, listas cerradas |
| `conocimiento.md` | Base de conocimiento en lenguaje claro (borrador sin validar por un consultorio jurídico) |
| `configuracion.json` | Todo lo demás para recrearlo: primer mensaje, voz, herramientas con ids, guardrails, privacidad, acceso, límites, SDK |
| `telefono.md` | Cómo pasar este agente a una línea de Twilio |
| `prompt-telefono.md`, `configuracion-telefono.json` | Agente telefónico: seguimiento de plazos y qué documento sirve, por llamada |
| `prueba.html` | Página de prueba con un `window.miderecho` falso que imita `app.js`. **No se publica** |
| `test-sesion.mjs` | Prueba de la función de sesión sin red: `node agente/test-sesion.mjs` |

## Lo que el módulo hace por su cuenta (no depende del modelo)

- El agente no puede tocar nada en la pantalla del aviso de privacidad, ni el "No" de la pregunta de peligro, ni botones de enviar, borrar, cerrar u olvidar. Solo acepta el texto exacto de una opción visible.
- Al ver "Esto es serio…" o al llamar `activar_protocolo_riesgo`, bloquea todas las herramientas salvo "Salir" hasta colgar. Usa `window.miderecho.riesgo()` si existe.
- Apaga el micrófono mientras la pantalla tenga campos para escribir y lo reabre con "Ya terminé" o al cambiar de pantalla.
- Tapa números de 6 o más cifras de lo que lee de la pantalla.

## Variables de entorno (Vercel)

| Variable | Para qué |
|---|---|
| `ELEVENLABS_API_KEY` | Clave de ElevenLabs con permiso para agentes conversacionales. La usa solo `api/elevenlabs-sesion.js` para pedir el token de cada conversación. **Nunca en el repositorio.** Sin ella la función responde 503 y el botón dice "El asistente no está disponible" (la app sigue funcionando) |

## Probarlo

Desde la raíz del repo:

```bash
python3 -m http.server 8000
```

y abrir `http://localhost:8000/agente/prueba.html`. La caja de texto conversa con el agente de pruebas sin micrófono y la lista muestra cada llamada a `window.miderecho`. Para probar el agente principal con voz hace falta `vercel dev` (o un preview) con `ELEVENLABS_API_KEY`.

## Integración (sesión principal)

- `prototipo/index.html`, después de `app.js`: `<script type="module" src="agente-voz.js"></script>`
- `prototipo/sw.js`: agregar `'agente-voz.js'` a `ARCHIVOS` y subir `CACHE`. El SDK viene del CDN solo cuando la persona acepta hablar; el service worker no lo guarda. `api/` no se cachea.
- Vercel: poner `ELEVENLABS_API_KEY` en Production y Preview.
- Lo que el módulo espera de Documentos: `iniciarCaso({ tipo, tema, municipio, entidad, desde })` con `entidad` como clave (`alcaldia`, `eps`, `ant`); que la opción del aviso empiece por "Sí, acepto"; que la pregunta de peligro tenga "No", "Sí" y "No sé"; que la ayuda se titule "Esto es serio…"; y, cuando exista, `window.miderecho.riesgo()`.

## Pendientes

- **Clave:** crear la clave de ElevenLabs y ponerla en Vercel (`ELEVENLABS_API_KEY`). Hasta entonces el agente principal no abre en ningún lado, porque ya exige sesión firmada.
- **Voz:** la elegida ("Gabriel", acento andino nariñense, pausado) está en la biblioteca y el conector no puede agregarla. Agregarla a "Mis voces" en elevenlabs.io y cambiar `voice_id` en los dos agentes. Hoy usa "Cristian Sanchez" (paisa).
- **Audio real:** probado con un micrófono simulado en silencio (conecta, habla, silencia al escribir, cuelga). Falta una prueba hablando de verdad desde un celular, con ruido y acento rural.
- **Privacidad:** borrar desde el panel de ElevenLabs los resúmenes de las conversaciones de prueba anteriores al modo de retención cero (datos inventados).
- **Jurídico:** validar `conocimiento.md`, las frases fijas y el texto del protocolo de riesgo con un consultorio jurídico y con los aliados; completar "[Organización], [contacto]" en el consentimiento.
