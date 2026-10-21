# Agente de voz en la v2 y avisos con plantillas fijas

Estado al 21-oct-2026. Rama `claude/voz-v2-avisos-c14c86`. Complementa `docs/comunicaciones.md` (Twilio, Redis, límites) y `agente/` (prompt y configuración del agente).

## 1. Qué hay

| Pieza | Dónde | Qué hace |
|---|---|---|
| Modo voz | `apps/web/src/componentes/ModoVoz.jsx`, `apps/web/src/lib/agenteVoz.js`, cambios mínimos en `pantallas/Asistente.jsx` | Botón **Hablar en vez de escribir** en "Tu situación". Aviso claro antes del micrófono (con **Escuchar el aviso**), sesión firmada, estados ("Conectando…", "Te escucho", "El asistente está hablando…") y **Colgar**. `#/asistente/voz` lo abre directo, sin relato escrito |
| Herramientas de cliente | `agenteVoz.js` | Solo dos: `contar_al_asistente` (entrega al asistente de la app lo que entendió y devuelve su respuesta) y `activar_protocolo_riesgo` |
| Avisos | `prototipo/api/_avisos.js` (`manejarAviso(canal)`), `sms.js`, `whatsapp.js` | `POST /api/sms` y `/api/whatsapp` con `{ plantilla, telefono, datos }`. Sin texto libre |
| "Avísame por mensaje" | `apps/web/src/componentes/AvisoListo.jsx` | SMS o WhatsApp con "su documento quedó listo" y el código, con autorización expresa. **No está enlazado todavía** (ver §7) |
| Herramientas del agente telefónico | `prototipo/api/_herramientas.js` (`herramienta(req, res)`), hoy vía `/api/elevenlabs-sesion?herramienta=…` | `orientar`, `documento`, `plazo`, `aviso` y `riesgo`, protegidas con secreto. Listas, sin registrar en ElevenLabs (`agente/telefono.md`, §5) |
| Pruebas | `prototipo/api/_test-agente-avisos.mjs` | Avisos, herramientas de servidor y de cliente, en modo simulado y con Twilio falso |

Preview probado: https://miderecho-psga3rkwx-jjgg310s-projects.vercel.app (sin claves: voz "no disponible", sesión sin aviso aceptado 400, avisos simulados, herramientas cerradas con 503).

## 2. Reglas que cumple

- **El agente no puede aceptar, borrar, enviar ni cerrar nada.** No existe herramienta para eso: el objeto de herramientas está congelado con dos acciones (se filtra por acción, no por el texto de un botón). El aviso de voz y la autorización del SMS los toca la persona.
- **Filtro de privacidad del núcleo** (`limpiar`) en los dos sentidos: lo que el agente manda al asistente y lo que vuelve al agente. Al conectar, el agente recibe la última respuesta del asistente, no el relato.
- **Lo jurídico que dice el agente es fijo:** en la orientación recibe la frase aprobada del documento y "qué dice la ley" del contenido validado (`o.ley.texto`), y los lee textual. Los pasos que redacta el modelo se quedan en la pantalla (con su bocina).
- **Protocolo de riesgo por regla fija:** la app aplica `hayRiesgo()` del núcleo a la transcripción de lo que dice la PERSONA (`onMessage` del SDK con `source: 'user'`), no al resumen del modelo. Si hay peligro, muestra la ayuda fija (`AYUDA_RIESGO`), bloquea `contar_al_asistente`, descarta una respuesta del asistente que llegue tarde y avisa al agente con `sendContextualUpdate`. También se activa si lo detecta el agente o si `/api/asistente` responde `riesgo`. La transcripción no se guarda ni se registra.
  - **Confirmado con retención cero** (21-oct-2026): el agente tiene `user_transcript` en `client_events`, el SDK 1.26.0 lo entrega como `onMessage({ source: 'user', role: 'user', message })`, y una conversación de prueba con audio sintético contra el agente de pruebas (retención cero activa) recibió el evento. La retención cero solo cambia lo que ElevenLabs guarda, no lo que manda en vivo. Ojo: si la persona habla encima del agente, el comienzo de la frase se puede perder (la regla ve lo que el servicio transcribe).
- **La llamada vive en la pantalla del Asistente.** Al salir (por ejemplo, a "Crear el documento", donde se piden nombre y cédula), al cerrar la app o al dejarla en segundo plano, se cuelga. Mientras dura no hay caja de texto ni opciones para tocar, así el micrófono no oye a nadie dictando su cédula.
- **Aviso antes de hablar** (versión `voz-v3`, con trato de usted y el responsable completado): máquina y no abogado; para qué; ElevenLabs con Gemini (también el modelo de respaldo, fijado en `gemini-2.5-flash`) y el asistente de la app con Claude o Gemini, según el que esté activo; que no se guarda la voz; que hablar de lo sensible es opcional; los derechos del titular (Ley 1581: conocer, actualizar, corregir, suprimir, revocar); enlace a `#/politica` (pantalla de la rama politica-comic). "Escuchar el aviso" dicta el celular de contacto dígito por dígito. **Prueba mínima de la aceptación:** el celular guarda `{ version, fecha }`; `/api/elevenlabs-sesion` solo da sesión con la versión vigente (`AVISO_VOZ`, la misma en la app y en el servidor; una vieja da 409 y la app se actualiza al recargar) y cuenta aceptaciones por versión y día, sin IP ni datos.
- **Sin `ELEVENLABS_API_KEY`**, el modo voz dice "El asistente de voz no está disponible ahora. Puedes seguir escribiendo." y no descarga el SDK. La app sigue igual.
- **Avisos sin texto libre:** plantillas cerradas en el servidor; cualquier clave distinta de `plantilla`, `telefono` y `datos` (por ejemplo `texto` o `pdfUrl`) da 400. Cada dato debe ser **texto** con formato exacto: código de 4 caracteres del generador de la app (`^[A-HJ-NP-Z2-9]{4}$`) y fecha `AAAA-MM-DD` que exista. Listas u objetos se rechazan. Nada del caso: ni tema, ni entidad, ni nombre.
- **Se conservan las protecciones de `_comun.js`** (sin tocar ese archivo): solo celulares colombianos, `NUMEROS_DEMO` con falla cerrada, 60 por hora por red, 10 por día por número, `LIMITE_DIARIO`, solo JSON y solo desde el propio sitio. Logs sin número completo ni texto.
- **Sesiones de voz limitadas con Redis:** `/api/elevenlabs-sesion` usa `contar()` de `_comun.js` (10 por IP por hora y 60 al día en total), compartido entre instancias cuando hay Upstash.

## 3. Plantillas

Sin tildes para caber en un SMS (GSM-7, menos de 160 caracteres):

| Plantilla | Datos | Texto |
|---|---|---|
| `documento_listo` | `codigo` | Su documento K7P2 quedo listo. Si necesita ayuda, vaya con su lider o a la Personeria. |
| `plazo` | `codigo`, `fecha` | Caso K7P2: el plazo vence el 30-nov. Si la entidad no le ha respondido, avise a su lider. |

Para cambiar un texto se edita `PLANTILLAS` en `_avisos.js` (y la plantilla aprobada de WhatsApp, si existe). El agente telefónico usa las dos, pero la fecha de `plazo` la calcula el servidor. (`llamada_agendada` se quitó: nadie la usaba.)

## 4. Variables de entorno (Vercel, Production y Preview)

| Variable | Para qué | Si falta |
|---|---|---|
| `ELEVENLABS_API_KEY` | Clave de ElevenLabs con permiso para agentes. Solo la usa `/api/elevenlabs-sesion` para pedir el token de cada conversación | El modo voz dice "no disponible" |
| `AGENTE_HERRAMIENTAS_SECRETO` | Secreto compartido de las herramientas del agente telefónico (32 caracteres o más). El mismo valor va en los *Secrets* de ElevenLabs y llega en la cabecera `x-miderecho-secreto` | Las herramientas responden 503 |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `TWILIO_WHATSAPP_FROM` | Las de `docs/comunicaciones.md` §7 | Modo simulado: `{ ok: true, simulado: true }` |
| `NUMEROS_DEMO` | Celulares del equipo. Con Twilio real, solo se envía a ellos | Envíos reales cerrados (503), salvo `PERMITIR_ENVIO_ABIERTO=1` con Redis. El `aviso` del agente telefónico la exige siempre hasta atar el número a la llamada |
| `LIMITE_DIARIO`, `PERMITIR_ENVIO_ABIERTO`, `CLAVE_CIFRADO`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Las de `docs/comunicaciones.md` §7. `CLAVE_CIFRADO` y Redis también cifran y guardan las variables del documento del agente telefónico (72 h) | Sin Redis, en memoria de cada instancia |
| `TWILIO_WA_DOCUMENTO_LISTO`, `TWILIO_WA_PLAZO` | `ContentSid` (`HX…`) de la plantilla aprobada por Meta de cada aviso, con las variables en el orden de la tabla de §3 (`{{1}}`, `{{2}}`). `TWILIO_WA_PLAZO` puede ser la misma de `TWILIO_WHATSAPP_PLANTILLA` | WhatsApp manda el texto como mensaje normal: sirve en el sandbox o dentro de las 24 h; fuera de ellas Twilio lo rechaza |
| `VITE_AGENTE_PRUEBAS` | **Solo desarrollo local**: id del agente de pruebas para usar la voz sin la clave. No existe en el build de producción | — |

`DOMINIOS_PDF` ya no se usa: `/api/whatsapp` no manda PDF.

## 5. Costos (precios de lista, en dólares; detalle en `docs/comunicaciones.md` §8 y `agente/telefono.md` §3)

| Concepto | Precio |
|---|---|
| Conversación de voz en la app (ElevenLabs Agents) | 0,08 por minuto (0,16 por encima de la concurrencia del plan) + LLM ≈ 0,01. Plan Creator: 11 al mes con 275 minutos |
| Una conversación típica en la app (4 a 6 minutos) | ≈ 0,35 a 0,55 |
| Aviso por SMS | 0,0592 (un segmento) |
| Aviso por WhatsApp | 0,005 de Twilio + ≈ 0,0008 de Meta por plantilla *utility* (cifra de terceros) |
| Llamada telefónica de 9 minutos con el agente | ≈ 1,15 a 2,42 según el tipo de línea (`agente/telefono.md` §3), más el SMS |
| Herramientas de servidor | 0 (Vercel y Upstash en plan gratis) |

Topes que frenan el gasto: el agente acepta 60 conversaciones al día y 3 a la vez (ElevenLabs), 10 sesiones por IP por hora (`/api/elevenlabs-sesion`) y los límites de envío de `_comun.js`.

## 6. Cómo probar

```bash
npm install
npm test
node prototipo/api/_test-agente-avisos.mjs
node prototipo/api/_test-api.mjs
node agente/test-sesion.mjs
npm run build
```

En el navegador, sin clave (lo que se probó, a 375 px): `npm run dev:api` y `npm run dev:web`, contar algo, **Hablar en vez de escribir** → aviso → **Sí, quiero hablar** → "no disponible" → **Seguir escribiendo**. Con voz de verdad en local: `VITE_AGENTE_PRUEBAS=agent_3301m5e2amx2f9etc6k5hzwp7kct npm run dev:web` (agente de pruebas, solo `localhost`).

Avisos en un preview (modo simulado mientras no haya Twilio):

```bash
curl -s https://<preview>/api/sms -H 'Content-Type: application/json' -d '{"plantilla":"documento_listo","telefono":"3001112233","datos":{"codigo":"K7P2"}}'
```

## 7. Para la integración

1. **Enlazar `AvisoListo`** donde se muestra el documento terminado (`Documento.jsx`, vista "Tu documento", o en Mis casos): `<AvisoListo codigo={caso.codigo} />`. Los casos de la v2 todavía no tienen código: al guardar el caso, agregar `codigo` con el mismo generador del prototipo (`prototipo/app.js`, `nuevoCodigo`: 4 caracteres de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`). Es el mismo código que usan los recordatorios.
2. **Opcional:** un botón en Inicio hacia `#/asistente/voz` para hablar desde el principio.
3. **Despachador:** los manejadores quedan como funciones exportadas en archivos con guion bajo: `manejarAviso('sms' | 'whatsapp')` en `_avisos.js` y `herramienta(req, res)` en `_herramientas.js`. El de la sesión es el `default` de `elevenlabs-sesion.js`.
4. **`/api/sms` y `/api/whatsapp` cambiaron de interfaz.** Si alguna otra pieza los llamaba con `{ telefono, texto }`, ahora recibe 400. Actualicé las líneas de `sms` y `whatsapp` de `prototipo/api/_test-api.mjs` (era de Comunicaciones) y la sección de `docs/comunicaciones.md` que habla de texto libre y `pdfUrl` queda desactualizada.
5. **Límite de funciones de Vercel:** las herramientas del agente van dentro de `/api/elevenlabs-sesion` para no sumar otra función. En `main` hay 10; con `correo.js`, `llamar.js` y `push.js` de las otras sesiones serían 13. El plan Hobby ha tenido un tope de 12 funciones por despliegue (no lo pude confirmar en la documentación actual): revisarlo en el primer despliegue con todo integrado. Si falla, `asistente.js`, `documento.js`, `plazo.js` y `salud.js` exportan la misma app de Express y se pueden unir en una.
6. **Dominio del preview en el agente:** el agente principal solo abre desde los dominios de `agente/configuracion.json` (`acceso.dominios_permitidos`). Para probar la voz en un preview hay que agregar su alias fijo en ElevenLabs (Agent → Security → Allowlist) y tener `ELEVENLABS_API_KEY` en Preview.

## 8. Prueba en producción (21-oct-2026)

En https://miderecho-two.vercel.app con el navegador integrado, a 375 px. Se usó un micrófono simulado en silencio, para no captar audio real del computador, y el texto se mandó con `sendUserMessage` del SDK.

- **Funcionó:** relato inventado → "¿Hay alguien en peligro?" → aviso de la IA → `#/asistente/voz` → aviso de voz → `/api/elevenlabs-sesion` 200 → conexión WebRTC → saludo del agente → el agente llamó `contar_al_asistente` → `/api/asistente` 200 → leyó con trato de usted el mensaje, la frase fija de la tutela de salud, la ley fija y el aviso → la pantalla mostró la orientación y "Crear el documento". Sin errores en la consola.
- **Se corrigió:** el agente metía la etiqueta `[happy]` (modo expresivo de la voz); se apagó en los dos agentes.
- **Se observó:** la llamada se corta sola a los 60 s sin voz (`colgar_tras_silencio_s`); después de que el asistente orienta por escrito ya no aparece "Hablar en vez de escribir" (se entra por `#/asistente/voz`).
- **No se pudo probar:** hablar con un micrófono real ni oír el audio (el navegador integrado no lo permite de forma útil); la transcripción del acento rural.

## 9. Qué falta para usarlo en vivo

- Poner `ELEVENLABS_API_KEY` en Vercel y probar una conversación real desde un celular, con ruido y acento rural (hoy probado sin clave y con pruebas en Node).
- Probar el agente con preguntas trampa (las 30 a 50 de `investigacion/11` §3.2) ahora que es la voz del asistente de la app.
- Twilio real: cuenta, número y `NUMEROS_DEMO` (`docs/comunicaciones.md` §2). Plantillas de WhatsApp aprobadas por Meta para cada aviso.
- Antes de abrir los avisos a cualquier número: verificación del número con código de un solo uso y captcha (`docs/comunicaciones.md` §9).
- Autorización: el SMS se manda solo con la casilla marcada, pero el servidor no guarda prueba de esa autorización (no guarda el número). Validar con abogado si basta para un envío único pedido por la persona.
- Teléfono: registrar las herramientas en el agente "MiDerecho teléfono" (`agente/telefono.md` §5) y construir el canje del código.
- Validar los textos del aviso de voz con un consultorio jurídico (responsable ya completado: MiDerecho S.A.S., 316 807 7161; aviso `voz-v3`).
- El enlace `#/politica` del aviso funciona cuando se una la rama politica-comic.
