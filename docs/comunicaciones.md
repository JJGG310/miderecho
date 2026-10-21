# Comunicaciones: SMS, WhatsApp, llamadas y recordatorios

Estado (20-oct-2026): el código está listo y **funciona en modo simulado**. No se creó ninguna cuenta ni recurso de pago. Cuando se pongan las claves de Twilio y la base de datos en Vercel, los envíos pasan a ser reales sin cambiar el código.

## 1. Qué hay

| Ruta | Qué hace | Tope de texto |
|---|---|---|
| `POST /api/sms` `{ telefono, texto }` | Un SMS en GSM-7: conserva ñ, é, ü, ¿ y ¡, cambia á, í, ó, ú por la vocal sola y quita emojis y la comilla invertida, para que quepa en un solo mensaje | 160 posiciones (`^{}[]~\|€` ocupan dos) |
| `POST /api/whatsapp` `{ telefono, texto, pdfUrl? }` | Aviso o documento por WhatsApp (sandbox de Twilio para el demo). El PDF debe estar en el mismo sitio, con https | 1.000 |
| `POST /api/llamada` `{ telefono, mensaje }` | Llamada que lee el mensaje con voz neural de español latino (`Polly.Mia-Neural`, es-MX), con una pausa al inicio y el mensaje dos veces | 400 (y TwiML de máximo 4.000) |
| `POST /api/recordatorios` `{ codigo, telefono, canal, fechas }` → `{ ok, simulado, token }` | Programa de 1 a 6 recordatorios (`canal`: `sms`, `whatsapp` o `llamada`; `fechas`: `AAAA-MM-DD`, desde hoy y dentro de un año; hoy solo antes de las 8 a. m.). El texto lo arma el servidor con una plantilla fija; `mensaje` se ignora. Devuelve un `token` secreto que la app debe guardar con el caso | Fijo |
| `DELETE /api/recordatorios` `{ codigo, token }` | Cancela y borra los recordatorios de ese caso. Siempre responde igual, exista o no | |
| `GET /api/cron-recordatorios` | La llama Vercel Cron todos los días a las 13:00 UTC (8 a. m. en Colombia). Envía los recordatorios de hoy y los que quedaron de ayer, en tandas de 10 y máximo 40 segundos, y respeta `LIMITE_DIARIO`. Exige `Authorization: Bearer <CRON_SECRET>` | |

- Archivos: `prototipo/api/*.js` (una función por ruta, `_comun.js` con lo compartido), `prototipo/comunicaciones.js` (cliente del navegador), `prototipo/vercel.json` (cron) y `prototipo/api/_test-api.mjs` (pruebas; el guion bajo evita que Vercel lo publique).
- Todas responden `{ ok, simulado, error? }`. Solo aceptan `Content-Type: application/json` (si no, 415) y peticiones de la propia app (403 si `Origin` o `Sec-Fetch-Site` dicen otro sitio). Sin dependencias: Twilio y Redis se usan por su API REST con `fetch`.
- **Modo simulado:** si faltan `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` o el número de origen del canal, la función responde `{ ok: true, simulado: true }` y solo registra en el log el canal, los dos últimos dígitos del número y el largo del texto. En modo simulado no se aplica ningún límite (no se gasta nada); solo la validación.
- **Sin Redis**, los recordatorios y los límites viven en la memoria de la función: sirven para probar, pero se pierden cuando Vercel apaga la función.

## 2. Pasos para activarlo (en este orden)

1. Crear la base de datos gratis de Upstash desde Vercel (sección 6).
2. Generar `CLAVE_CIFRADO` y `CRON_SECRET` y ponerlas en Vercel (sección 7).
3. Crear la cuenta de Twilio, activar Colombia y anotar el SID, el token y el número (secciones 3 y 4).
4. Activar el sandbox de WhatsApp y unir los celulares del demo (sección 5).
5. Poner `NUMEROS_DEMO` con los celulares del equipo y `LIMITE_DIARIO=30` para el hackathon. **Sin `NUMEROS_DEMO`, los envíos reales quedan cerrados** (sección 9).
6. Volver a desplegar (las variables nuevas solo aplican a despliegues nuevos) y probar con `curl` (sección 11).

## 3. Cuenta de Twilio

1. Registrarse en <https://www.twilio.com/try-twilio> con un correo del equipo y **un celular colombiano**. La prueba gratis trae **US$15** de crédito, sin tarjeta, por 30 días (incluye 100 SMS, 100 mensajes de WhatsApp y 75 minutos de voz).
2. Límites de la prueba que afectan el demo:
   - Solo envía al **país del celular con que se registró** (por eso, uno colombiano) y solo a **5 números verificados**. Se agregan en *Console → Phone Numbers → Manage → Verified Caller IDs*, con un código por SMS.
   - El número de origen lo asigna Twilio; no se puede escoger.
   - Los SMS llegan con el prefijo "Sent from a Twilio trial account", que los vuelve de dos segmentos.
   - Llamadas de máximo 10 minutos. La documentación de la prueba describe las llamadas salientes por API solo con plantillas de Twilio; si `/api/llamada` responde un error de Twilio, hay que pasar la cuenta a pago (*Upgrade*, recarga inicial; las restricciones de la prueba desaparecen).
3. Activar Colombia: *Messaging → Settings → Geo permissions* y *Voice → Settings → Geo permissions*, marcar Colombia. Sin esto Twilio rechaza con los códigos 21408 (SMS) o 21215 (voz).
4. Copiar el **Account SID** y el **Auth Token** de la página principal de la consola (*Account Info*).
5. Poner una alerta de gasto: *Monitor → Usage triggers* (por ejemplo, avisar al correo si se gastan US$10 en un día) y no activar la recarga automática.

Errores de Twilio más comunes (la API responde `Twilio no aceptó el envío (código N)`): **21608** número no verificado en la prueba, **21408/21215** falta el permiso de Colombia, **21614** el número no recibe SMS (fijo), **63015** ese celular no se ha unido al sandbox de WhatsApp.

## 4. Qué número usar

- **¿Se puede enviar a Colombia desde un número de EE. UU.? Sí.** Twilio lo permite para SMS (número "internacional") y para llamadas. Un número de EE. UU. cuesta **US$1,15 al mes**. En la prueba gratis se usa el número que asigna Twilio.
- **SMS:** según la guía de Twilio para Colombia, el operador **reemplaza el remitente por un código corto**: la persona no ve el número de origen y no puede responder a él. La app debe avisar "le llegará un SMS de un número corto con el código de su caso". No se envían SMS a fijos.
- **Llamadas:** salen bien a celulares colombianos, pero Twilio no garantiza el identificador de llamada: la persona puede ver un número +1 desconocido y no contestar. Avisarle antes.
- **Número colombiano:** US$17,50 al mes y exige comprobante de dirección en la ciudad del indicativo. No hace falta para enviar; solo serviría para recibir llamadas (fase de piloto, ver `investigacion/11`, sección 1.2).
- No se admiten remitentes alfanuméricos ("MiDerecho") en Colombia.

## 5. Sandbox de WhatsApp

1. *Console → Messaging → Try it out → Send a WhatsApp message*. Aparece un código del tipo `join palabra-palabra`.
2. Cada celular del demo envía por WhatsApp ese texto al **+1 415 523 8886**. El sandbox solo entrega a quien se unió, y la unión **vence a los 3 días** (hay que repetir el `join`).
3. `TWILIO_WHATSAPP_FROM=+14155238886`.
4. **Ventana de 24 horas:** después de que la persona escribe, se le puede mandar texto libre y PDF por 24 horas. Fuera de esa ventana, Meta solo permite **plantillas aprobadas**. Para los recordatorios por WhatsApp (que llegan días después) se usa la plantilla de `TWILIO_WHATSAPP_PLANTILLA`, con el código del caso en `{{1}}` y la fecha (por ejemplo `30-nov`) en `{{2}}`. Plantilla sugerida (categoría *utility*, en el *Content Template Builder*): "Caso {{1}}: recordatorio del {{2}}. Si la entidad no le ha respondido, avise a su líder." Con envío real y sin plantilla, `/api/recordatorios` rechaza el canal `whatsapp`.
5. El sandbox envía como máximo 1 mensaje cada 3 segundos y es solo para pruebas. Para producción hace falta un remitente propio de WhatsApp con el negocio verificado en Meta.
6. **Política de Meta:** prohíbe los chatbots de IA de propósito general y pedir la cédula por WhatsApp. Este canal es solo para avisos y documentos.
7. **PDF por WhatsApp:** Twilio necesita una URL pública con https, en el mismo dominio de la app o en uno de `DOMINIOS_PDF`. Hoy la app arma el documento en el celular y no lo sube a ninguna parte; para mandarlo habría que subirlo (por ejemplo, a Vercel Blob) con un nombre al azar y borrarlo después de enviado. Eso no está en esta rama.

## 6. Dónde se guardan los recordatorios: Upstash Redis

**Por qué:** es la opción más simple. Se crea gratis desde el Marketplace de Vercel, se usa por REST sin instalar nada y sirve también para los contadores de los límites (que vencen solos).

1. En <https://vercel.com>, proyecto **miderecho** → *Storage* → *Create Database* → **Upstash for Redis** → plan **Free** → conectarla al proyecto (Production y Preview). Escoger la región más cercana a Colombia que ofrezca.
2. Vercel agrega solas `KV_REST_API_URL` y `KV_REST_API_TOKEN` (en algunas cuentas se llaman `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`; el código acepta las dos).
3. **No registrar tarjeta en Upstash:** con tarjeta la base pasa a pago por uso.

Plan gratis: 500.000 comandos al mes, 256 MB, sin tarjeta. Cada envío gasta unos 6 comandos, programar unos 15 y el cron 2 más 3 por recordatorio: sobra para el piloto.

Qué se guarda, y nada más:
- `rec:<id>` → `{ codigo, canal, fechas, c }`, donde `c` es el teléfono cifrado con **AES-256-GCM** e `id` es HMAC(código + token): dos casos con el mismo código no chocan y sin el token no se puede cancelar. Vence solo 3 días después de su última fecha; el cron lo borra antes, al enviar la última.
- `dia:<fecha>` → los `id` que salen ese día (vence 3 días después). El cron saca cada `id` antes de enviar, así que nunca envía dos veces, y nunca reescribe un registro: lo cancelado no revive.
- `num:<HMAC del número>` → los casos activos de ese número (máximo 3).
- Contadores `rl:<HMAC>:<ventana>` (por red, por número y total del día) y cupos `prog:<fecha>` por fecha, que vencen solos. Ni el número ni la IP quedan en claro.
- La clave sale de `CLAVE_CIFRADO`, que vive en Vercel, no en la base. Con Redis pero sin `CLAVE_CIFRADO`, las funciones fallan en vez de guardar teléfonos sin cifrar.

## 7. Variables de entorno

Dónde: Vercel → proyecto **miderecho** → *Settings* → *Environment Variables*. Marcar **Production** y **Preview**, guardar como *Sensitive* las claves y **volver a desplegar**. También sirve la terminal: `vercel env add NOMBRE production`.

| Variable | Ejemplo | Para qué |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | `AC…` | Cuenta de Twilio |
| `TWILIO_AUTH_TOKEN` | (secreto) | Clave de Twilio |
| `TWILIO_FROM` | `+1…` | Número de origen para SMS y llamadas |
| `TWILIO_WHATSAPP_FROM` | `+14155238886` | Número de WhatsApp (el del sandbox) |
| `TWILIO_WHATSAPP_PLANTILLA` | `HX…` | Opcional: plantilla aprobada para recordatorios por WhatsApp |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | (los pone Vercel) | Upstash Redis |
| `CLAVE_CIFRADO` | salida de `openssl rand -base64 32` | Cifra los teléfonos (AES-GCM) y firma los contadores (HMAC). Si se cambia, los recordatorios guardados ya no se pueden leer y se descartan |
| `CRON_SECRET` | salida de `openssl rand -hex 32` | Vercel la manda sola al cron; protege `/api/cron-recordatorios` |
| `NUMEROS_DEMO` | `3001234567,3109876543` | Solo se envía a esos números. Usarla en el hackathon: sin ella (y sin `PERMITIR_ENVIO_ABIERTO`) los envíos reales quedan cerrados |
| `PERMITIR_ENVIO_ABIERTO` | `1` | Abre el envío a cualquier celular colombiano. Exige Redis. **No usar sin verificación del número** (sección 9) |
| `LIMITE_DIARIO` | `30` | Tope total de envíos por día y de recordatorios programados por fecha (100 si no está) |
| `DOMINIOS_PDF` | `x.public.blob.vercel-storage.com` | Opcional: otros dominios permitidos para `pdfUrl` |

El cron de Vercel solo corre en **producción** (no en los previews) y, en el plan Hobby, llega a cualquier minuto entre las 13:00 y las 13:59 UTC. Por eso, desde las 8 a. m. ya no se aceptan recordatorios para hoy. Si falta `CRON_SECRET`, el cron responde 401 y deja un error en los logs.

## 8. Costos aproximados (precios de lista de Twilio, octubre de 2026, en dólares)

| Concepto | Precio | Nota |
|---|---|---|
| SMS a Colombia | **0,0592 por segmento** | 160 caracteres sin tildes; con tildes el segmento baja a 70. Mensaje fallido: 0,001 |
| WhatsApp | **0,005 de Twilio** por mensaje + tarifa de Meta | Plantilla *utility* en Colombia ≈ 0,0008 y *marketing* ≈ 0,0125 (cifras de terceros, verificar). Respuestas dentro de las 24 h: 1.000 gratis al mes por número desde el 1-oct-2026 |
| Llamada saliente a celular colombiano | **0,0377 por minuto** | A fijo: 0,07. Se cobra por minuto iniciado |
| Voz neural (`<Say>`) | 0,0032 por cada 100 caracteres | Un mensaje de 300 caracteres leído dos veces ≈ 0,02 |
| Número de EE. UU. | 1,15 al mes | Número colombiano: 17,50 al mes, con documentos |
| Upstash Redis | 0 | Plan gratis |

Por caso, con 3 recordatorios: por SMS ≈ **0,18**; por WhatsApp ≈ **0,02**; por llamada de 1 minuto ≈ **0,17**. Los US$15 de la prueba alcanzan para unos 250 SMS o unas 250 llamadas de un minuto. Conclusión, igual que en `investigacion/05`: WhatsApp primero, SMS de respaldo, llamada para quien no lee.

## 9. Protección contra abuso

La app es pública: sin estas barreras, cualquiera podría usar las funciones para mandar SMS o llamadas a cualquier número y gastar el saldo.

- **Solo celulares colombianos:** 10 dígitos que empiezan por 3, con o sin +57. Se rechazan fijos y números de otros países.
- **Cerrado por defecto:** con claves reales de Twilio, solo se envía a `NUMEROS_DEMO`. Para abrirlo a cualquier número hay que poner `PERMITIR_ENVIO_ABIERTO=1` y tener Redis; si no, 503. **Antes de abrirlo en producción** hay que verificar cada número con un código de un solo uso (SMS que la persona devuelve en la app) y poner un captcha en la app; sin eso, cualquiera puede mandar texto libre a un tercero.
- **Límites (solo con envío real):** 60 solicitudes por hora por red (las IPv6 se agrupan por red, y el tope es alto para tolerar el CGNAT de los operadores y el Wi-Fi del evento), 10 envíos por día al mismo número y `LIMITE_DIARIO` en total. Con Redis valen para todas las funciones; sin Redis, cada instancia lleva su cuenta.
- **Recordatorios:** máximo 3 casos activos por número (el mismo código con el mismo número se reemplaza); cada fecha gasta del cupo de ese día, en total (`LIMITE_DIARIO`) y por número (10); el cron también se detiene al llegar a `LIMITE_DIARIO`. El texto es fijo (código y fecha): nadie puede usar los recordatorios para mandar texto libre.
- **Topes de texto:** 160 (SMS), 1.000 (WhatsApp) y 400 (llamada).
- **PDF solo del propio sitio**, para que nadie use el número para repartir archivos ajenos.
- **Cancelar exige el token** de 128 bits que recibió la app al programar. El código del caso no basta (va impreso en el documento) y la respuesta no revela si el registro existía.
- **Cron** protegido con `CRON_SECRET`.
- **Logs** sin el contenido de los mensajes ni números completos (solo `***67`). Los errores de Twilio se registran solo por su código, porque su texto incluye el número.
- **Solo desde la app:** se rechaza lo que no sea `application/json` (415), así un formulario HTML de otro sitio no puede disparar envíos, y lo que traiga `Origin` o `Sec-Fetch-Site` de otro sitio (403); se aceptan el propio dominio y `localhost`. Esto frena a otros sitios web, no a un script: contra eso están el cierre por defecto y los límites.

## 10. Límites legales y de privacidad

- **Autorización expresa antes de cualquier recordatorio** (Ley 1581 de 2012 y Decreto 1377 de 2013: previa, expresa e informada). En la app debe ser una casilla aparte y sin marcar, del tipo "Quiero que me recuerden las fechas por SMS a este número", con el canal y la hora. La SIC ya multó a un operador por contactar sin permiso (ver `investigacion/11`, sección 1.2). La prueba de la autorización queda hoy solo en el celular; validar con quien lidere privacidad si hace falta guardar una prueba seudónima (`investigacion/06`, sección 5.6).
- **Solo mensajes que la persona pidió.** Nada de promociones ni envíos masivos.
- **Horario:** el cron envía a las 8 a. m. (hora de Colombia) y las fechas de la app son días hábiles. Los SMS y las llamadas inmediatas los dispara la misma persona desde la app. Como regla, no contactar fuera de lunes a viernes de 7 a. m. a 7 p. m. ni sábados después de las 3 p. m. (es el horario de la Ley 2300 de 2023 para cobranzas; aplicarlo aquí es una buena práctica, por validar con un abogado). Twilio también pide escribir solo en horario diurno.
- **Contenido:** en SMS y WhatsApp, solo el código del caso y la fecha. Nunca nombres, cédula, entidad, tema ni hechos: los SMS no van cifrados y el celular puede ser compartido o revisado (`investigacion/06`, sección 4.3). Los recordatorios usan siempre: `Caso 4F7K: recordatorio del 1-dic. Si la entidad no le ha respondido, avise a su lider.`
- **Borrado:** el servidor borra el registro tras el último recordatorio o al cancelar. Twilio guarda en su consola el registro de cada mensaje (número y texto): después del demo, borrarlos en *Monitor → Logs* o por API (`DELETE /Messages/{Sid}`). Meta conserva los mensajes de WhatsApp hasta 30 días.
- **Transferencia internacional:** Twilio y Upstash procesan los datos fuera de Colombia. Para el piloto hacen falta los acuerdos de transmisión con ellos (`investigacion/06`, sección 1.5).

## 11. Cómo probar

```bash
node prototipo/api/_test-api.mjs
```

Prueba, sin cuentas reales y con reloj fijo: modo simulado sin límites, 415 y 403, números inválidos, topes de texto, GSM-7, TwiML de 4.000, PDF de otro dominio, recordatorios (fechas, hoy después de las 8 a. m., token, mismo código en dos casos, cancelación sin revelar, cron sin repetir ni revivir, lo atrasado de ayer, vencimiento a los 3 días, falta de `CRON_SECRET`) y, con un `fetch` falso que imita a Twilio y a Upstash: cierre por defecto, formato exacto de cada envío real, error de Twilio, lista blanca, límites por red, por número y diario, plantilla de WhatsApp, casos activos por número, cupos por fecha, cron con `LIMITE_DIARIO` y que en los logs no aparezcan números ni textos.

Contra un despliegue (cambiar la URL; los previews de Vercel piden iniciar sesión o un enlace de acceso):

```bash
curl -X POST https://miderecho-two.vercel.app/api/sms -H 'Content-Type: application/json' -d '{"telefono":"3001234567","texto":"Peticion ABCD vence el 1-dic."}'
```

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://miderecho-two.vercel.app/api/cron-recordatorios
```

## 12. Cómo conectarlo con `app.js` (para la integración)

1. En `app.js`: `import { programarRecordatorios, cancelarRecordatorios } from './comunicaciones.js';` y agregar `comunicaciones.js` a la lista `ARCHIVOS` de `sw.js` (y cambiar `CACHE`).
2. En el formulario `datos`, junto al celular: una casilla aparte, sin marcar, de autorización para recordatorios (y, si se quiere, el canal: SMS, WhatsApp o llamada).
3. En `acciones.enviar`, **antes** de `guardarCaso` (que borra `caso`), guardar el teléfono y la autorización; después de guardar, si hay autorización:

   ```js
   const rad = deIso(c.rad), venc = deIso(c.venc);
   const fechas = [sumarHabiles(rad, c.plazo - 3), venc, sumarHabiles(rad, c.plazo + 1)].map(iso);   // las mismas de resumenPlazo
   programarRecordatorios({ codigo: c.codigo, telefono, canal: 'sms', fechas: fechas.filter(f => f > iso(hoy())) })
     .then(r => r.ok ? (c.token = r.token, guardar()) : aviso('No se pudieron programar los recordatorios: ' + r.error));
   ```

   El `token` se guarda con el caso (cifrado con la clave de la app): sin él no se puede cancelar. Mostrar "(simulado)" si `r.simulado`. El filtro quita las fechas pasadas y la de hoy, que el servidor rechaza después de las 8 a. m.
4. Casos en cola sin internet (`procesarCola`): hoy no conservan el teléfono; si se quieren recordatorios, el teléfono debe quedar en el borrador cifrado hasta que se programen.
5. En `acciones.cerrar` y `acciones.borrarSi`: `cancelarRecordatorios(c.codigo, c.token)` por cada caso con `token`, sin esperar la respuesta para no frenar la pantalla.
6. El cliente nunca lanza errores: sin internet, sin servidor o si la respuesta no trae `ok`, devuelve `{ ok: false, simulado: false, error }`.
7. **Cambio de interfaz frente a CONTRATOS.md (aprobado por integración):** `programarRecordatorios` devuelve también `token`, ignora `mensaje`, y `cancelarRecordatorios(codigo, token)` pide el token.

## Fuentes

- Twilio, guía de SMS para Colombia: <https://www.twilio.com/en-us/guidelines/co/sms>
- Twilio, precios de SMS en Colombia: <https://www.twilio.com/en-us/sms/pricing/co>
- Twilio, precios de voz en Colombia: <https://www.twilio.com/en-us/voice/pricing/co>; voz y texto a voz en EE. UU. (número de US$1,15 y precios de `<Say>`): <https://www.twilio.com/en-us/voice/pricing/us>, <https://www.twilio.com/en-us/sms/pricing/us>
- Twilio, precios de WhatsApp: <https://www.twilio.com/en-us/whatsapp/pricing>
- Twilio, voces de `<Say>`: <https://www.twilio.com/docs/voice/twiml/say/text-speech>
- Twilio, cuenta de prueba: <https://www.twilio.com/docs/usage/trials>, <https://www.twilio.com/docs/usage/trials/try-out-voice>
- Twilio, sandbox de WhatsApp: <https://www.twilio.com/docs/whatsapp/sandbox>
- Vercel, Cron Jobs (plan Hobby: una vez al día, ±59 min): <https://vercel.com/docs/cron-jobs/usage-and-pricing>
- Upstash, precios de Redis: <https://upstash.com/pricing/redis>
- `investigacion/05` (secciones 2 y 6.1), `investigacion/06` (secciones 0, 4, 5 y 6) e `investigacion/11` (secciones 1, 3.8 y 5.2) de este repositorio.
