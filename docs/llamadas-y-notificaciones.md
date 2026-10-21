# Llamadas y notificaciones

Estado (21-oct-2026): todo funciona en **modo simulado**. No hay claves de ElevenLabs, Twilio, QStash ni VAPID en Vercel, y no se ha hecho ninguna llamada real. La sección 2 dice exactamente qué hacer para la primera llamada de prueba.

## 1. Qué hay

| Pieza | Dónde | Qué hace |
|---|---|---|
| Llamada del asistente | `POST /api/llamar` `{ telefono, acepto: true, aviso: "llamada-v1", cuando?, codigo?, vence? }` (`prototipo/api/llamar.js`) | El agente **"MiDerecho teléfono"** de ElevenLabs llama a la persona por un número de Twilio importado en ElevenLabs. Sin `cuando`, llama ya; con `cuando` (`"2026-10-22T09:00-05:00"`, en punto o y media, desde 10 minutos y hasta 7 días), la agenda. Devuelve un `token` para cancelar. Una sola agendada por número: la nueva reemplaza la anterior. Si ElevenLabs falla, 502 (sin respaldo con voz leída: podría dejar el código en un buzón) |
| Cancelar la llamada agendada | `DELETE /api/llamar` `{ token }` | Borra el número cifrado; cuando QStash llegue, no pasa nada |
| Agendado | `PUT /api/llamar` `{ id }` (solo QStash, con firma) | Upstash QStash entrega el mensaje a la hora pedida y la función llama |
| Clave pública VAPID | `GET /api/recordatorios` → `{ clave }` | Para que el navegador se suscriba a las notificaciones (Web Push con cifrado RFC 8291 y firma VAPID hechos con `node:crypto`, sin librería) |
| Recordatorios por canal | `POST /api/recordatorios` `{ codigo, canal, telefono o suscripcion, fechas, vence, acepto: true, aviso: "avisos-v1" }` | `canal`: `push`, `sms`, `whatsapp` o `llamada`. Cada canal es un registro aparte (SMS y llamada del mismo caso conviven). El cron de las 8 a. m. manda: push "Su caso K7P2 vence mañana."; SMS con la plantilla de siempre; **llamada con voz leída** ("Le recordamos su caso K, 7, P, 2. El plazo vence el martes, 3 de noviembre…") |
| App v2 | `apps/web/src/lib/avisos.js` y `apps/web/src/componentes/Avisos.jsx` | "¿Cómo quiere que le avisemos?" al guardar el caso y en Mis casos; "Que el asistente lo llame" en Mis casos; aviso en Inicio si un plazo vence hoy o mañana (sin internet). Los tokens viven en `miderecho-avisos` (sin cifrar a propósito, fuera de los casos) y la cola en `miderecho-cancelar`; el caso guarda solo su código. **`cancelarTodo()`** cancela todo lo de este celular y anula la suscripción push: la integración la llama desde "Borrar todo" |
| Service worker | `apps/web/public/sw-avisos.js`, cargado por `vite-plugin-pwa` con `importScripts` | Muestra la notificación y, al tocarla, abre Mis casos |
| Agente telefónico | `agente/prompt-telefono.md`, `agente/configuracion-telefono.json` | `agent_3901m5fd72hyedssc8h6r4gznevn`, copia del agente web sin herramientas de pantalla |

**¿Por qué QStash y no el agendado de ElevenLabs?** ElevenLabs agenda llamadas con *batch calling* (`scheduled_time_unix`), pero su documentación dice que el **modo de retención cero no se puede usar en llamadas por lotes**, y el agente de MiDerecho lo tiene activo. El cron de Vercel Hobby corre una vez al día, así que no sirve para horas exactas. QStash entrega un mensaje firmado a la hora pedida (gratis: 1.000 mensajes al día, hasta 7 días de espera).

## 2. Llamada de prueba (pasos exactos, en orden)

### 2.1 Twilio

1. Crear la cuenta en <https://www.twilio.com/try-twilio> **con el celular colombiano de Juan José**: la prueba solo llama al país del número con que se registra, y ese número queda verificado solo.
2. *Phone Numbers → Manage → Buy a number*: un número de **EE. UU. con Voice** (sale en minutos; US$1,15 al mes, la prueba lo paga con el crédito). Uno colombiano pide documentos.
3. *Voice → Settings → Geo permissions*: marcar **Colombia** (si no, Twilio rechaza con el código 21215).
4. **Pasar la cuenta a pago (*Upgrade*)** antes de probar el agente. En la prueba, Twilio pone un mensaje en inglés al contestar y pide oprimir una tecla, solo llama a números verificados y bloquea parte del TwiML personalizado; la conexión del agente (`<Connect><Stream>`) puede no funcionar. Con pago esas restricciones desaparecen (recarga inicial de unos US$20; confirmar en la consola). No activar la recarga automática y poner una alerta de gasto (*Monitor → Usage triggers*).
5. Revisar que la grabación de llamadas esté apagada.
6. Mejor que el Auth Token de la cuenta: crear una **API Key** (*Account → API keys & tokens → Create API key*, tipo Standard) para ElevenLabs. Su SID empieza por `SK`.

### 2.2 ElevenLabs

1. Crear una clave en *Settings → API keys* con permiso para agentes conversacionales: es `ELEVENLABS_API_KEY` (sirve también para el agente web, `api/elevenlabs-sesion.js`).
2. *Agents → Phone numbers → Import number → Twilio*: etiqueta "MiDerecho", el número de EE. UU. en formato +1…, y el SID y el secreto de la API Key de Twilio. ElevenLabs configura solo el número. **El secreto se pega solo en el panel; nunca al repositorio ni al chat.**
3. Asignar al número el agente **"MiDerecho teléfono"** (sirve para las llamadas entrantes; las salientes lo eligen por API).
4. Sacar el **`ELEVENLABS_PHONE_NUMBER_ID`** (empieza por `phnum_`): pídale a Claude que lo lea con el conector de ElevenLabs (`agents_list_phone_numbers`), o en la terminal:
   ```bash
   curl -s https://api.elevenlabs.io/v1/convai/phone-numbers -H "xi-api-key: $ELEVENLABS_API_KEY"
   ```
5. Primera prueba sin la app: en el panel, el número → *Outbound call* → agente "MiDerecho teléfono" → el celular de Juan José → *Send Test Call*. Así se descarta un problema de Twilio antes de probar el servidor.

### 2.3 Vercel

Variables en Vercel → proyecto **miderecho** → *Settings → Environment Variables* (Production y Preview, las claves como *Sensitive*), y **volver a desplegar**:

| Variable | Valor | Para qué |
|---|---|---|
| `ELEVENLABS_API_KEY` | la clave del paso 2.2.1 | Llamada del agente y agente web |
| `ELEVENLABS_PHONE_NUMBER_ID` | `phnum_…` | Número desde el que llama el agente |
| `ELEVENLABS_AGENT_ID` | opcional | Otro agente; por defecto `agent_3901m5fd72hyedssc8h6r4gznevn` |
| `NUMEROS_DEMO` | el celular de Juan José (y los del equipo) | **Obligatoria para el agente**: sin esta lista no llama, aunque exista `PERMITIR_ENVIO_ABIERTO` |
| `LIMITE_DIARIO` | `30` | Tope de envíos y llamadas del día |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `CLAVE_CIFRADO`, `CRON_SECRET` | ver `docs/comunicaciones.md` §6 y §7 | Redis para límites, autorizaciones y llamadas agendadas |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | opcional | Recordatorios por SMS y por llamada con voz leída |
| `LIMITE_PUSH_DIARIO` | opcional (1000) | Cupo diario global de notificaciones push |
| `QSTASH_TOKEN`, `QSTASH_URL`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | de Upstash | Solo para **agendar**. Se crean en <https://console.upstash.com/qstash> (o con la integración de Upstash en el Marketplace de Vercel). Sin ellas, "Llámenme ahora" funciona y agendar responde 503 |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | ver 2.4 | Notificaciones push |

### 2.4 Claves VAPID (notificaciones)

Una sola vez, en la terminal (no se guardan en ningún archivo):

```bash
node -e "const k=require('crypto').generateKeyPairSync('ec',{namedCurve:'prime256v1'}).privateKey.export({format:'jwk'});console.log('VAPID_PUBLIC_KEY='+Buffer.concat([Buffer.from([4]),Buffer.from(k.x,'base64url'),Buffer.from(k.y,'base64url')]).toString('base64url'));console.log('VAPID_PRIVATE_KEY='+k.d)"
```

`VAPID_SUBJECT` es un correo del equipo con `mailto:` delante (por ejemplo `mailto:equipo@…`). Si se cambian las claves, las suscripciones existentes dejan de servir (la app las vuelve a pedir al activar avisos).

### 2.5 Probar

1. Producción (los previews de Vercel piden iniciar sesión, y QStash no puede entrar a ellos): abrir la app → **Mis casos → Que el asistente lo llame** → celular, autorizar → **Llámenme ahora** (de 8 a. m. a 7 p. m.).
2. O con curl (mismo dominio, JSON):
   ```bash
   curl -X POST https://miderecho-two.vercel.app/api/llamar -H 'Content-Type: application/json' -H 'Origin: https://miderecho-two.vercel.app' -d '{"telefono":"3XXXXXXXXX","acepto":true,"codigo":"K7P2","vence":"2026-11-03"}'
   ```
3. Agendar: lo mismo con `"cuando":"2026-10-22T09:00-05:00"`; se ve en <https://console.upstash.com/qstash> → *Messages*.
4. Si algo falla, la respuesta trae solo el código (`No se pudo hacer la llamada (código 422)`); el detalle está en los logs de Vercel sin el número.

## 3. Costos (precios de lista, octubre de 2026, en dólares)

| Concepto | USD |
|---|---|
| ElevenLabs Agents | 0,08 por minuto (más ~0,01 del modelo de lenguaje) |
| Twilio, llamada saliente a celular colombiano | 0,0377 por minuto |
| Twilio, detección de buzón de voz (cuelga si contesta una grabadora) | ~0,0075 por llamada |
| Número de EE. UU. en Twilio | 1,15 al mes |
| Recordatorio por llamada con voz leída | 0,0377 por minuto + 0,0032 por cada 100 caracteres leídos |
| QStash | 0 (plan gratis: 1.000 mensajes al día); 1 por cada 100.000 después |
| Push (Web Push) | 0 |

**Llamada del agente de 5 minutos:** unos US$0,65 (≈ COP 2.600 con 1 USD = COP 4.000). El agente corta a los 10 minutos y tiene topes en ElevenLabs: 2 llamadas a la vez y 30 al día. **Recordatorio por llamada con voz leída de 1 minuto:** unos US$0,05.

**Límite de funciones de Vercel Hobby (12):** se quitaron `api/llamada.js` (texto libre, sin horario y sin uso en la v2) y `api/push.js` (la clave pública pasó al GET de recordatorios). Quedan las de esta rama: `llamar` y `recordatorios`, más las que ya había.

Fuentes de precios: `investigacion/11-agente-de-voz.md` §5.2 y `docs/comunicaciones.md` §8; reconfirmar el día de la compra.

## 4. Protecciones (las mismas de las demás funciones, más algunas propias)

- Solo celulares de Colombia, solo JSON y solo desde la propia app (415/403); en modo simulado, sin límites.
- **Falla cerrada:** con claves reales, el agente solo llama a `NUMEROS_DEMO` (aunque exista `PERMITIR_ENVIO_ABIERTO`); SMS y WhatsApp siguen la regla de `docs/comunicaciones.md` §9.
- Límites: por red; **2 llamadas al día por número** (agente o voz leída, aparte del tope de SMS); 10 envíos al día por número; `LIMITE_DIARIO` en total; `LIMITE_PUSH_DIARIO` para push; topes del agente en ElevenLabs. Todas las llamadas a servicios externos cortan a los 8 segundos.
- Recordatorios: hasta 3 casos (códigos distintos) por número, 20 por celular en push; el mismo código por el mismo canal se reemplaza, otro canal no.
- **Horario:** 8 a. m. a 7 p. m., hora de Colombia, para llamar ya y para agendar (la última franja es 6:30 p. m.). Si QStash llega tarde y fuera del horario, no llama.
- **Autorización expresa:** sin `acepto: true` y la versión del texto (`aviso`) no hay llamada ni recordatorio. En Redis queda la prueba mínima **por canal**: HMAC del número, fecha y hora, versión del aviso, respuesta y canal; nada más (370 días). Las versiones están junto a los textos en `Avisos.jsx` (`VERSION_AVISOS`, `VERSION_LLAMADA`). La app muestra responsable (`[Organización], [contacto]`, por completar; la lectura en voz alta no lee los corchetes), terceros (Twilio; ElevenLabs y su modelo de lenguaje; el servicio de notificaciones del navegador; fuera de Colombia), derechos y el enlace a `#/politica`.
- La llamada agendada guarda el número **cifrado** (AES-GCM) hasta una hora después de la franja; QStash solo recibe un identificador. Se borra antes de llamar, así un reintento nunca llama dos veces.
- QStash: firma HS256 con la clave actual o la siguiente, para esta URL, vigente y con el hash del cuerpo.
- Al agente solo le llegan variables no sensibles: el código letra por letra y la fecha en palabras. Sin grabación, retención cero en ElevenLabs y, si contesta un buzón de voz, cuelga sin hablar. El recordatorio con voz leída sí puede quedar en el buzón: la app lo advierte en esa opción.
- Cron: lo que cuesta va primero y push al final; las llamadas con voz leída solo salen de 8 a. m. a 7 p. m. (si no, esperan a la próxima corrida).
- Push: solo servicios de push conocidos (Google, Mozilla, Apple, Microsoft), para que nadie use el servidor para llamar a otras URL. Título neutro ("Recordatorio") y texto fijo con el código y la fecha. Si el navegador quitó el permiso (410), el registro se borra.
- La app no guarda nunca el número. Los tokens viven en su propia clave, sin cifrar a propósito, para poder cancelar aunque la app esté bloqueada o se olvide la clave. **Cola de cancelación** (`miderecho-cancelar`): se cancela al borrar el caso, al marcar que le respondieron y con `cancelarTodo()`; si no hay señal, se reintenta al volver y cada vez que se abre la app.
- Logs sin números, suscripciones, códigos ni textos (lo revisan las pruebas).

## 5. Pruebas

```bash
npm test
```

`npm test` corre también `prototipo/api/_test-api.mjs`, `_test-llamadas.mjs` y `apps/web/test-avisos.mjs`. En local, `npm run dev:api` sirve `/api/llamar` y `/api/recordatorios` delante del backend (modo simulado); `/api/sms`, `/api/whatsapp` y el cron solo funcionan desplegados en Vercel.

`_test-llamadas.mjs` prueba sin cuentas reales y con reloj fijo: validaciones, horario, franjas, autorización, falla cerrada y lista blanca, límites, el formato exacto para ElevenLabs, la prueba de la autorización, el agendado con QStash (firma, reintento, cancelación, una sola agendada por número, fuera de horario, QStash caído), que no hay respaldo con voz leída, el tope de 2 llamadas al día, los canales que conviven y los códigos distintos, la autorización por canal, el recordatorio por llamada solo en horario, push al final del cron y su cupo, el cifrado push con el **ejemplo del RFC 8291 byte por byte**, la firma VAPID, el descifrado como lo haría el navegador, el cron con push (antes, el día, después y 410) y los logs. `test-avisos.mjs` prueba los tokens en su propia clave, la cola de cancelación, `cancelarTodo()` (con la suscripción push), las fechas, el aviso local, la llamada agendada y el service worker.

## 6. Pendientes

- Las claves y la primera llamada real (sección 2). La prueba con el celular de Juan José la coordina la sesión principal.
- Probar la notificación push en un Android real con Chrome (el navegador integrado de Claude no permite notificaciones).
- WhatsApp por recordatorio sigue necesitando la plantilla aprobada (`TWILIO_WHATSAPP_PLANTILLA`); sin ella, con envío real, el servidor rechaza ese canal y la app lo muestra.
- Validar con un abogado el texto de autorización (`llamada-v1`) y si la prueba mínima basta (Ley 1581, art. 9; Decreto 1377, art. 7).
- El agente telefónico usa la misma voz que el web ("Cristian Sanchez", paisa); cambiarla en los dos si se agrega "Gabriel" (ver `agente/README.md`).
