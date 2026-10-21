# Agente de voz en la v2 y avisos con plantillas fijas

Estado al 21-oct-2026. Rama `claude/voz-v2-avisos-c14c86`. Complementa `docs/comunicaciones.md` (Twilio, Redis, límites) y `agente/` (prompt y configuración del agente).

## 1. Qué hay

| Pieza | Dónde | Qué hace |
|---|---|---|
| Modo voz | `apps/web/src/componentes/ModoVoz.jsx`, `apps/web/src/lib/agenteVoz.js`, cambios mínimos en `pantallas/Asistente.jsx` | Botón **Hablar en vez de escribir** en "Tu situación". Aviso claro antes del micrófono (con **Escuchar el aviso**), sesión firmada, estados ("Conectando…", "Te escucho", "El asistente está hablando…") y **Colgar**. `#/asistente/voz` lo abre directo, sin relato escrito |
| Herramientas de cliente | `agenteVoz.js` | Solo dos: `contar_al_asistente` (entrega al asistente de la app lo que entendió y devuelve su respuesta) y `activar_protocolo_riesgo` |
| Avisos | `prototipo/api/_avisos.js`, `sms.js`, `whatsapp.js` | `POST /api/sms` y `/api/whatsapp` con `{ plantilla, telefono, datos }`. Sin texto libre |
| "Avísame por mensaje" | `apps/web/src/componentes/AvisoListo.jsx` | SMS o WhatsApp con "su documento quedó listo" y el código, con autorización expresa. **No está enlazado todavía** (ver §7) |
| Herramientas del agente telefónico | `prototipo/api/_herramientas.js`, vía `/api/elevenlabs-sesion?herramienta=…` | `orientar`, `documento`, `plazo` y `aviso`, protegidas con secreto. Listas, sin registrar en ElevenLabs (`agente/telefono.md`, §5) |
| Pruebas | `prototipo/api/_test-agente-avisos.mjs` | Avisos, herramientas de servidor y de cliente, en modo simulado y con Twilio falso |

Preview probado: https://miderecho-324h9g4a9-jjgg310s-projects.vercel.app (sin claves: voz "no disponible", avisos simulados, herramientas cerradas con 503).

## 2. Reglas que cumple

- **El agente no puede aceptar, borrar, enviar ni cerrar nada.** No existe herramienta para eso: el objeto de herramientas está congelado con dos acciones (se filtra por acción, no por el texto de un botón). El aviso de voz y la autorización del SMS los toca la persona.
- **Filtro de privacidad del núcleo** (`limpiar`) en los dos sentidos: lo que el agente manda al asistente y lo que vuelve al agente. Al conectar, el agente recibe la última respuesta del asistente, no el relato.
- **Protocolo de riesgo:** si lo detecta el agente o si `/api/asistente` responde `riesgo`, la pantalla muestra la ayuda fija del núcleo (`AYUDA_RIESGO`) y no se manda nada más al asistente hasta colgar.
- **La llamada vive en la pantalla del Asistente.** Al salir (por ejemplo, a "Crear el documento", donde se piden nombre y cédula) se cuelga. Mientras dura no hay caja de texto ni opciones para tocar, así el micrófono no oye a nadie dictando su cédula.
- **Sin `ELEVENLABS_API_KEY`**, el modo voz dice "El asistente de voz no está disponible ahora. Puedes seguir escribiendo." y no descarga el SDK. La app sigue igual.
- **Avisos sin texto libre:** plantillas cerradas en el servidor; cualquier clave distinta de `plantilla`, `telefono` y `datos` (por ejemplo `texto` o `pdfUrl`) da 400. Cada dato tiene formato cerrado (código `A-Z0-9` de 4 a 12, fecha `AAAA-MM-DD` real, hora `HH:MM`). Nada del caso: ni tema, ni entidad, ni nombre.
- **Se conservan las protecciones de `_comun.js`** (sin tocar ese archivo): solo celulares colombianos, `NUMEROS_DEMO` con falla cerrada, 60 por hora por red, 10 por día por número, `LIMITE_DIARIO`, solo JSON y solo desde el propio sitio. Logs sin número completo ni texto.

## 3. Plantillas

Sin tildes para caber en un SMS (GSM-7, menos de 160 caracteres):

| Plantilla | Datos | Texto |
|---|---|---|
| `documento_listo` | `codigo` | Su documento K7P2 quedo listo. Si necesita ayuda, vaya con su lider o a la Personeria. |
| `plazo` | `codigo`, `fecha` | Caso K7P2: el plazo vence el 30-nov. Si la entidad no le ha respondido, avise a su lider. |
| `llamada_agendada` | `fecha`, `hora` | A las 9:30 a. m. del 22-oct le llamaremos. Si usted no la pidio, ignore este mensaje. |

Para cambiar un texto se edita `PLANTILLAS` en `_avisos.js` (y la plantilla aprobada de WhatsApp, si existe). El agente telefónico solo puede usar `documento_listo` y `plazo`.

## 4. Variables de entorno (Vercel, Production y Preview)

| Variable | Para qué | Si falta |
|---|---|---|
| `ELEVENLABS_API_KEY` | Clave de ElevenLabs con permiso para agentes. Solo la usa `/api/elevenlabs-sesion` para pedir el token de cada conversación | El modo voz dice "no disponible" |
| `AGENTE_HERRAMIENTAS_SECRETO` | Secreto compartido de las herramientas del agente telefónico (32 caracteres o más). El mismo valor va en los *Secrets* de ElevenLabs y llega en la cabecera `x-miderecho-secreto` | Las herramientas responden 503 |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `TWILIO_WHATSAPP_FROM` | Las de `docs/comunicaciones.md` §7 | Modo simulado: `{ ok: true, simulado: true }` |
| `NUMEROS_DEMO` | Celulares del equipo. Con Twilio real, solo se envía a ellos | Envíos reales cerrados (503), salvo `PERMITIR_ENVIO_ABIERTO=1` con Redis |
| `LIMITE_DIARIO`, `PERMITIR_ENVIO_ABIERTO`, `CLAVE_CIFRADO`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Las de `docs/comunicaciones.md` §7. `CLAVE_CIFRADO` y Redis también cifran y guardan las variables del documento del agente telefónico (72 h) | Sin Redis, en memoria de cada instancia |
| `TWILIO_WA_DOCUMENTO_LISTO`, `TWILIO_WA_PLAZO`, `TWILIO_WA_LLAMADA_AGENDADA` | `ContentSid` (`HX…`) de la plantilla aprobada por Meta de cada aviso, con las variables en el orden de la tabla de §3 (`{{1}}`, `{{2}}`). `TWILIO_WA_PLAZO` puede ser la misma de `TWILIO_WHATSAPP_PLANTILLA` | WhatsApp manda el texto como mensaje normal: sirve en el sandbox o dentro de las 24 h; fuera de ellas Twilio lo rechaza |
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
3. **`/api/sms` y `/api/whatsapp` cambiaron de interfaz.** Si alguna otra pieza los llamaba con `{ telefono, texto }`, ahora recibe 400. Actualicé las líneas de `sms` y `whatsapp` de `prototipo/api/_test-api.mjs` (era de Comunicaciones) y la sección de `docs/comunicaciones.md` que habla de texto libre y `pdfUrl` queda desactualizada.
4. **Límite de funciones de Vercel:** las herramientas del agente van dentro de `/api/elevenlabs-sesion` para no sumar otra función. En `main` hay 10; con `correo.js`, `llamar.js` y `push.js` de las otras sesiones serían 13. El plan Hobby ha tenido un tope de 12 funciones por despliegue (no lo pude confirmar en la documentación actual): revisarlo en el primer despliegue con todo integrado. Si falla, `asistente.js`, `documento.js`, `plazo.js` y `salud.js` exportan la misma app de Express y se pueden unir en una.
5. **Dominio del preview en el agente:** el agente principal solo abre desde los dominios de `agente/configuracion.json` (`acceso.dominios_permitidos`). Para probar la voz en un preview hay que agregar su alias fijo en ElevenLabs (Agent → Security → Allowlist) y tener `ELEVENLABS_API_KEY` en Preview.

## 8. Qué falta para usarlo en vivo

- Poner `ELEVENLABS_API_KEY` en Vercel y probar una conversación real desde un celular, con ruido y acento rural (hoy probado sin clave y con pruebas en Node).
- Probar el agente con preguntas trampa (las 30 a 50 de `investigacion/11` §3.2) ahora que es la voz del asistente de la app.
- Twilio real: cuenta, número y `NUMEROS_DEMO` (`docs/comunicaciones.md` §2). Plantillas de WhatsApp aprobadas por Meta para cada aviso.
- Antes de abrir los avisos a cualquier número: verificación del número con código de un solo uso y captcha (`docs/comunicaciones.md` §9).
- Autorización: el SMS se manda solo con la casilla marcada, pero el servidor no guarda prueba de esa autorización (no guarda el número). Validar con abogado si basta para un envío único pedido por la persona.
- Teléfono: registrar las herramientas en el agente "MiDerecho teléfono" (`agente/telefono.md` §5) y construir el canje del código.
- Completar "[Organización], [contacto]" del aviso de voz y validar los textos con un consultorio jurídico.
