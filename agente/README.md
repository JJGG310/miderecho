# Agente de voz de MiDerecho

Agente conversacional en ElevenLabs que es la voz del Asistente de la v2: en la pantalla "Tu situación", la persona toca **Hablar en vez de escribir**, acepta el aviso y habla. El agente le pasa al asistente de la app (Claude, `apps/api`) lo que entendió y le lee lo que responde. La IA de voz conversa y resume; lo jurídico sale del asistente de la app, de sus textos fijos y de unas pocas frases fijas.

- **Agente:** `agent_8101m5dg7s5se9trrst6fjpvz52d` ("MiDerecho"). Exige **sesión firmada**: solo se abre con el token que entrega `prototipo/api/elevenlabs-sesion.js`.
- **Agente de pruebas:** `agent_3301m5e2amx2f9etc6k5hzwp7kct` ("MiDerecho (pruebas locales)"). Igual al principal, pero sin sesión firmada, solo `localhost`/`127.0.0.1`, con modo texto y 20 conversaciones al día. Si se cambia el principal, cambiar también este.
- **En la v2:** `apps/web/src/lib/agenteVoz.js` (SDK, sesión y herramientas, sin React) y `apps/web/src/componentes/ModoVoz.jsx` (aviso, estados y colgar). `#/asistente/voz` abre el modo voz directo, sin relato escrito.
- **Prototipo (referencia, ya no coincide con el agente):** `prototipo/agente-voz.js` usaba `window.miderecho` con las herramientas `iniciar_caso`, `pantalla_actual` y `elegir_opcion`.
- **Agente telefónico:** `agent_3901m5fd72hyedssc8h6r4gznevn` ("MiDerecho teléfono"). Copia del principal para llamadas salientes que pide la persona (`prototipo/api/llamar.js`): sin herramientas de pantalla, con las variables `codigo` y `vence`. Prompt en `prompt-telefono.md`, configuración en `configuracion-telefono.json`. Si se cambian las reglas del principal, cambiarlas también aquí.

| Archivo | Qué es |
|---|---|
| `prompt.md` | Prompt del sistema: protocolo de riesgo, frases fijas, botones que solo toca la persona, listas cerradas |
| `conocimiento.md` | Base de conocimiento en lenguaje claro (borrador sin validar por un consultorio jurídico) |
| `configuracion.json` | Todo lo demás para recrearlo: primer mensaje, voz, herramientas con ids, guardrails, privacidad, acceso, límites, SDK |
| `telefono.md` | Cómo pasar el agente a una línea de Twilio y registrar sus herramientas de servidor (§5). Solo preparado; el agente de llamadas salientes queda sin herramientas de documentos (decisión de integración) |
| `prompt-telefono.md`, `configuracion-telefono.json` | Agente telefónico: seguimiento de plazos y qué documento sirve, por llamada |

| `prueba.html` | Página de prueba con un `window.miderecho` falso que imita `app.js`. **No se publica** |
| `test-sesion.mjs` | Prueba de la función de sesión sin red: `node agente/test-sesion.mjs` |

Las pruebas de las herramientas (de cliente y de servidor) y de los avisos están en `prototipo/api/_test-agente-avisos.mjs`. Variables, costos y qué falta: `docs/agente-y-avisos.md`.

## Lo que la app hace por su cuenta (no depende del modelo)

- El agente solo tiene **dos acciones**: `contar_al_asistente` y `activar_protocolo_riesgo` (objeto congelado en `agenteVoz.js`). No existe herramienta para aceptar avisos o autorizaciones, borrar, enviar SMS o WhatsApp, crear el documento ni cerrar: se filtra por acción, no por el texto de un botón (lección de la auditoría).
- El consentimiento se acepta antes de abrir el micrófono, con botón "Escuchar el aviso" (voz del celular, sin internet).
- Todo texto pasa por `limpiar()` del núcleo: lo que el agente manda al asistente y lo que vuelve al agente (cédulas, teléfonos y correos salen como `[número]`, `[teléfono]`, `[correo]`). Al conectar, el agente recibe la última respuesta del asistente, no el relato.
- En la orientación, el agente solo recibe lo jurídico fijo: la frase aprobada del documento y "qué dice la ley" del contenido validado. Los pasos que redacta el modelo se quedan en la pantalla.
- **Riesgo por regla fija:** la app escucha la transcripción de lo que dice la persona (evento `user_transcript` del SDK, que llega con retención cero; confirmado en vivo) y le aplica `hayRiesgo()` del núcleo. Si hay peligro, muestra la ayuda, bloquea `contar_al_asistente` y avisa al agente, sin esperar al modelo. La transcripción no se guarda ni se registra. También se activa si lo detecta el agente o si `/api/asistente` responde `riesgo`.
- La llamada vive solo en la pantalla del Asistente: al salir (por ejemplo, a "Crear el documento", donde se piden nombre y cédula), al cerrar la app o al dejarla en segundo plano, se cuelga. Mientras dura, no hay caja de texto ni opciones para tocar.
- El aviso nombra a ElevenLabs, Gemini (también el modelo de respaldo, fijado en `gemini-2.5-flash`) y Claude; dice para qué, que hablar de lo sensible es opcional y los derechos del titular, y enlaza la política (`#/politica`). Se guarda prueba mínima de la aceptación (versión y fecha, sin datos).
- Sin `ELEVENLABS_API_KEY` en el servidor, dice "El asistente de voz no está disponible ahora" y no descarga el SDK.

## Variables de entorno (Vercel)

| Variable | Para qué |
|---|---|
| `ELEVENLABS_API_KEY` | Clave de ElevenLabs con permiso para agentes conversacionales. La usa solo `api/elevenlabs-sesion.js` para pedir el token de cada conversación. **Nunca en el repositorio.** Sin ella la función responde 503 y el botón dice "El asistente no está disponible" (la app sigue funcionando) |

## Probarlo

Sin clave, con el agente de pruebas (solo `localhost`) y la API local en otra terminal (`npm run dev:api`):

```bash
VITE_AGENTE_PRUEBAS=agent_3301m5e2amx2f9etc6k5hzwp7kct npm run dev:web
```

Abrir `http://localhost:5173`, contar algo, tocar **Hablar en vez de escribir** y aceptar. Con el agente principal hace falta un preview (o `vercel dev`) con `ELEVENLABS_API_KEY` y su dominio en la lista de `acceso.dominios_permitidos`.

## Integración

- Ya está en el Asistente de la v2. Opcional: un botón en Inicio que lleve a `#/asistente/voz` para hablar desde el principio.
- Vercel: poner `ELEVENLABS_API_KEY` en Production y Preview. El SDK viene del CDN solo cuando la persona acepta hablar; el service worker no lo guarda.

## Pendientes

- **Clave:** crear la clave de ElevenLabs y ponerla en Vercel (`ELEVENLABS_API_KEY`). Hasta entonces el agente principal no abre en ningún lado, porque ya exige sesión firmada.
- **Voz:** la elegida ("Gabriel", acento andino nariñense, pausado) está en la biblioteca y el conector no puede agregarla. Agregarla a "Mis voces" en elevenlabs.io y cambiar `voice_id` en los dos agentes. Hoy usa "Cristian Sanchez" (paisa).
- **Audio real en la v2:** probado sin clave (aviso, "no disponible", volver a escribir) y las herramientas con pruebas en Node. Falta una conversación real con la clave o con `VITE_AGENTE_PRUEBAS`, hablando desde un celular, con ruido y acento rural.
- **Privacidad:** borrar desde el panel de ElevenLabs los resúmenes de las conversaciones de prueba anteriores al modo de retención cero (datos inventados).
- **Jurídico:** validar `conocimiento.md`, las frases fijas y el texto del protocolo de riesgo con un consultorio jurídico y con los aliados; completar "[Organización], [contacto]" en el consentimiento.
