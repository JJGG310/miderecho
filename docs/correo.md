# Correo: "Envíenlo por mí" y tutela al juzgado por correo

Fecha: 21-oct-2026 (corregido tras la auditoría del mismo día). La app envía el documento por correo a la entidad o al juzgado y guarda una constancia con el caso. Mientras el servidor esté en modo simulado o de prueba, la app lo dice y no da el documento por entregado.

## 1. Qué hay

| Archivo | Qué hace |
|---|---|
| `prototipo/api/correo.js` | Función de Vercel. `GET /api/correo`: en qué modo está (`simulado`, `prueba`, `cerrado`, `verificar`, `libre`). `POST /api/correo { tipo, datos, destino, copia?, verificacion? }`: arma el documento con `generarDocumento` de `@miderecho/nucleo` y lo envía con Resend; responde `{ ok, simulado, copia, constancia: { id, fecha, para, entidad, simulado?, prueba? } }`. `POST { accion: 'codigo', telefono }`: código por SMS para el envío real abierto |
| `packages/nucleo/src/directorio.js` | Correos de las 15 alcaldías, de los juzgados de los 15 municipios y de la ANT, con fuente y `verificado`. Se exporta desde `@miderecho/nucleo` |
| `packages/nucleo/src/plantillas.js` | Con `porCorreo` (documento que se envía por correo): "Sin firma manuscrita (Ley 2213 de 2022, art. 2)" y "Tengo copia de … y los aportaré cuando el juzgado lo solicite" en vez de "Adjunto copia". Nada más cambia |
| `apps/web/src/componentes/EnvioCorreo.jsx` | Botón y panel de envío, verificación por código, cola sin conexión y constancia |
| `apps/web/src/pantallas/Documento.jsx`, `MisCasos.jsx` | Cambios mínimos: el panel en la vista del documento (que pasa a la versión que se envía al abrirlo), caso nuevo para la tutela de una petición, petición marcada, contador de 1.000 letras y la constancia en Mis casos |
| `apps/api/src/server.js` | En desarrollo (`npm run dev:api`), también atiende `/api/correo` |
| `prototipo/api/_test-correo.mjs` | Pruebas sin cuentas reales. Corre con `npm test` |

**Por qué Resend:** API REST simple (un `fetch`, sin SDK ni dependencias), plan gratis suficiente para el piloto, verificación de dominio con SPF y DKIM, y llave de idempotencia para no enviar dos veces el mismo documento.

## 2. Qué se envía y a quién

| Documento | Va a |
|---|---|
| Derecho de petición | La alcaldía del municipio o la ANT (directorio). A otra entidad, al correo que escriba la persona: solo si el servidor lo permite (lista del equipo, o envío abierto con dominio permitido) |
| Reclamo de servicios públicos | El correo de la empresa que escriba la persona, con las mismas reglas |
| Tutela de salud y tutela | El juzgado que recibe tutelas en el municipio (oficina de reparto si existe, si no el juzgado municipal). Nunca a un correo escrito a mano. Fuera de los 15 municipios no aparece el botón |
| Tutela por petición no respondida (desde Mis casos) | Igual que la tutela. Es un caso nuevo; la petición queda en Mis casos marcada "Ya hiciste la tutela" |

La app nueva todavía no tiene impugnación ni desacato; el directorio ya trae los juzgados que deciden (`juzgadosDe(municipio)`).

- **Modo visible.** La app pregunta el modo al servidor antes de mostrar el botón. En modo simulado dice "Probar envío (no llega al juzgado)" o "(no llega a la entidad)"; con la lista del equipo, "Probar envío (llega al equipo, no a la entidad)". Después de una prueba muestra "No se envió de verdad (modo de prueba): entrégalo a mano o guarda el PDF", **no guarda el caso como entregado** y el documento vuelve a la versión para imprimir y firmar. Con los envíos cerrados no aparece el botón.
- **Se ve exactamente lo que se envía.** Al abrir el panel, la vista pasa a la versión por correo (sin firma manuscrita, sin anexos que no van, con el nombre y el correo de la entidad del directorio). Si la persona dice "Mejor no lo envío", vuelve la versión para imprimir.
- **El juzgado tiene que poder avisarle.** Para enviar al juzgado hace falta un celular en el documento, un correo en la dirección o un correo para la copia (que queda como `reply_to`). Sin ninguno, la app y el servidor no envían. La app dice a dónde llegará el aviso y recuerda que si el fallo es en contra solo hay **3 días hábiles para impugnar**.
- **Autorización expresa y honesta:** "Autorizo a MiDerecho a enviar en mi nombre este documento completo a [entidad] ([correo]). Lleva mi nombre, mi cédula, mis datos de contacto y lo que conté (incluida información de mi salud, en la tutela de salud). El correo sale por Resend, un servicio de Estados Unidos que guarda una copia por 30 días. MiDerecho no lo guarda." Copia a su correo: campo y casilla aparte.
- **Aviso de duplicado:** si en Mis casos ya hay un envío del mismo documento a la misma entidad, lo dice antes de enviar (en tutelas: puede tomarse como temeridad).
- **Arriba del documento va una carta corta**: quién presenta (nombre y cédula), que MiDerecho solo transmite y no es abogado ni apoderado, la norma, a dónde responder o notificar (celular o correo de la persona) y el código del caso. Las tutelas urgentes llevan "URGENTE" y "medida provisional" en el asunto.
- **Documento en el cuerpo del correo** (HTML y texto plano), no en PDF adjunto: generar un PDF en el servidor pedía una dependencia nueva. Si un juzgado exige adjunto, se agrega con una librería como `pdf-lib`.
- **Constancia (solo de envíos reales):** número de envío de Resend, fecha y hora, destinatario y código del caso. Se guarda con el caso en `envios` y se muestra al enviar y en Mis casos.

## 3. Directorio de correos (`packages/nucleo/src/directorio.js`)

- **Alcaldías (15):** los correos de `contenido.js`, revisados el 20-oct-2026 en el sitio de cada alcaldía (`investigacion/08`, sección 3). Chaparral queda **sin verificar** porque su página mezcla dos dominios.
- **Juzgados (15 municipios):** "Directorio de cuentas de correo electrónico" de la Rama Judicial ([ramajudicial.gov.co/directorio-cuentas-de-correo-electronico](https://www.ramajudicial.gov.co/directorio-cuentas-de-correo-electronico)), consultado el 21-oct-2026. En 12 municipios hay un solo juzgado promiscuo municipal. Chaparral y San José del Guaviare tienen oficina de reparto. El Carmen de Bolívar tiene dos juzgados promiscuos municipales y el directorio no muestra oficina de reparto: la tutela nueva va al Juzgado 1 [validar]. El **Juzgado 2 de El Carmen** aparece en ese directorio, pero la auditoría no lo pudo confirmar: queda **sin verificar**.
- **ANT:** `atencionalciudadano@ant.gov.co`, de su Carta de trato digno (actualizada a 2025), que también da `info@ant.gov.co`. Las tutelas contra la ANT no van a ese correo: van al juzgado.
- **Faltan:** EPS y empresas de servicios públicos. Casi todas las EPS reciben PQRS por formulario web.
- **Antes del piloto:** confirmar por teléfono con cada alcaldía y juzgado que el correo recibe peticiones o tutelas, y volver a revisar cada 3 meses.

## 4. Pasos para activarlo (en este orden)

1. **Crear la cuenta** en [resend.com](https://resend.com) con el correo del equipo. Crear una API key con permiso "Sending access".
2. **Sin dominio propio, solo para probar:** el remitente `onboarding@resend.dev` solo puede enviar al correo con el que se creó la cuenta. Poner ese correo en `CORREOS_DEMO`.
3. **Con dominio propio (necesario para enviar a entidades):** en Resend → Domains → Add domain (mejor un subdominio, por ejemplo `envios.midominio.co`). Copiar en el DNS los registros que muestra Resend (MX y TXT de SPF, TXT de DKIM) y agregar DMARC (`_dmarc`, `v=DMARC1; p=none;`). Sin SPF, DKIM y DMARC, los correos a entidades del Estado suelen caer en spam.
4. **Probar con la lista del equipo** (`CORREOS_DEMO`): lo del directorio llega al primer correo de la lista, marcado como prueba, y no a la entidad. La app lo presenta como prueba.
5. **Antes de cualquier envío real a entidades:** firmar con Resend el acuerdo de tratamiento de datos (DPA) que sirva como contrato de transmisión internacional (Ley 1581 de 2012 y Decreto 1377 de 2013; `investigacion/06`, sección 1.5), actualizar el aviso de privacidad y validar con abogado la sección 9.
6. **Producción:** Redis y `CLAVE_CIFRADO` (los mismos de `docs/comunicaciones.md`), Twilio con SMS abiertos (`PERMITIR_ENVIO_ABIERTO=1`) para los códigos, `PERMITIR_CORREO_ABIERTO=1` y `DOMINIOS_CORREO`. Sin Twilio, el envío abierto queda bloqueado con un error claro.

## 5. Variables de entorno

| Variable | Para qué | Ejemplo |
|---|---|---|
| `RESEND_API_KEY` | Sin ella todo es simulado: se valida y se arma el documento, pero no sale nada | `re_…` |
| `CORREO_REMITENTE` | Remitente, del dominio verificado. Sin ella, `MiDerecho <onboarding@resend.dev>` | `MiDerecho <envios@envios.midominio.co>` |
| `CORREOS_DEMO` | Correos del equipo, separados por comas. Con clave real y sin envío abierto, lo del directorio llega al primero de la lista (prueba) | `ana@equipo.co,juan@equipo.co` |
| `PERMITIR_CORREO_ABIERTO` | `1` = envío real a las entidades. Con clave real exige Redis y celular verificado por SMS | `1` |
| `DOMINIOS_CORREO` | Con envío abierto, dominios permitidos para correos de entidad escritos a mano. Por defecto `gov.co` | `gov.co,afinia.com.co` |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `CLAVE_CIFRADO` | Redis y clave de límites y códigos, compartidos con `docs/comunicaciones.md` | |
| `TWILIO_*`, `PERMITIR_ENVIO_ABIERTO` o `NUMEROS_DEMO` | SMS de los códigos de verificación (`docs/comunicaciones.md`) | |
| `LIMITE_DIARIO` | Tope de envíos al día (mismo valor que los SMS, con contadores aparte). Por defecto 100 | `100` |

**Cerrado por defecto:** con `RESEND_API_KEY` y sin `CORREOS_DEMO` ni (`PERMITIR_CORREO_ABIERTO=1` y Redis), la función responde 503 y la app no muestra el botón.

## 6. Protección contra abuso

- **No es un relevo de correo.** No recibe HTML, asunto ni destinatarios: recibe `tipo`, `datos` y `destino`, y arma el documento con las plantillas fijas. Solo pasan los campos que usan las plantillas, con topes de largo; los ids se validan contra las listas de `contenido.js`; código del caso y plazo con formato fijo; la cédula sin espacios; todo lo que escribe la persona va escapado. En los campos de una línea se quitan los saltos de línea, y en el asunto solo van municipios de la lista.
- **`destino` es una clave del directorio.** Con una entidad del directorio, el documento lleva su nombre y su correo, y el municipio del documento debe ser el de esa alcaldía o ese juzgado. Un documento judicial solo va a un juzgado del directorio y uno administrativo solo a una entidad.
- **Correos escritos a mano:** los de `CORREOS_DEMO` o, con envío abierto, solo de `DOMINIOS_CORREO` y nunca para un juzgado. La copia a la persona sigue las mismas reglas (sin dominio, con envío abierto); si no está permitida, el documento sale sin copia y la app lo dice.
- **Envío abierto = celular verificado.** Con clave real y `PERMITIR_CORREO_ABIERTO=1`, cada envío exige un código de 6 dígitos que llega por SMS al celular del documento: vence en 10 minutos, sirve una sola vez, 5 intentos por 10 minutos y 5 códigos al día por número, más los límites de los SMS (`_comun.js`).
- **Límites (solo con envío real):** 10 por hora por red (IPv6 por red), 25 al día por entidad o correo, y `LIMITE_DIARIO` en total, del que peticiones y reclamos usan hasta el 80 %: el 20 % queda para tutelas, y lo administrativo rechazado no gasta esa reserva. Con Redis valen para todas las instancias.
- **Reintentos:** la llave de idempotencia (tipo, código y huella del texto) hace que Resend no envíe dos veces el mismo documento en 24 horas.
- **Solo desde la app:** solo JSON (415), mismo origen (403), solo GET y POST (405).
- **Logs:** solo el tipo y la clave del directorio (`[correo] enviado: peticion a alcaldia:Ovejas`). Nunca nombres, cédula, hechos, datos de salud, códigos ni correos escritos a mano. Los errores de Resend se registran solo por su código.

## 7. Privacidad, cola sin conexión y respuestas

- **Qué sale del celular y a dónde:** solo si la persona autoriza el envío, el documento completo (nombre, cédula, contacto y relato, también datos de salud en la tutela de salud) pasa por el servidor de MiDerecho, que no lo guarda ni lo registra, y por Resend, que lo guarda 30 días en Estados Unidos. Así lo dice la casilla de autorización. En el celular, el caso guarda lo mismo de antes más la constancia.
- **Contrato de transmisión:** antes de envíos reales hay que firmar con Resend el acuerdo de tratamiento de datos y anunciarlo en el aviso de privacidad (es una transmisión internacional de datos personales, incluidos datos sensibles de salud).
- **Sin conexión:** el envío queda en cola en la memoria de la pantalla y sale solo cuando vuelve la conexión. No se guarda en el celular porque lleva nombre y cédula: si la persona cierra la pantalla antes, tiene que enviarlo de nuevo, y la app lo advierte.
- **Respuestas:** van a los datos de contacto del documento y, si la persona pidió copia, a su correo (`reply_to`). El remitente no recibe respuestas. Para el juzgado, el envío exige un celular o un correo de la persona.

## 8. Costos (precios de lista de Resend, octubre de 2026, en dólares)

| Plan | Precio | Correos |
|---|---|---|
| Free | 0 | 3.000 al mes, máximo 100 al día |
| Pro | 20 al mes | 50.000 al mes, sin tope diario |
| Pro | 35 al mes | 100.000 al mes |

Una copia a la persona cuenta como un correo más. Cada código de verificación es un SMS (costos en `docs/comunicaciones.md`). Para el piloto alcanza el plan gratis. Fuente: [resend.com/pricing](https://resend.com/pricing).

## 9. Puntos para validar con un abogado

1. **Envío en nombre de la persona.** Si MiDerecho, al enviar el correo, es solo un medio de transmisión o cae en representación o agencia oficiosa; qué consecuencia tiene para exigir poder, para la legitimación en la tutela y para el ejercicio ilegal de la abogacía (Decreto 196 de 1971). El texto dice que la persona es el peticionario o el accionante y que MiDerecho solo transmite (`investigacion/08`, secciones 2 y 6).
2. **Validez de la tutela por correo.** Decreto 2591 de 1991, art. 14 (sin formalidades) y Ley 2213 de 2022 (actuaciones por medios electrónicos, sin firma manuscrita). Confirmar que basta con nombre y cédula, "Sin firma manuscrita (Ley 2213 de 2022, art. 2)" y "las pruebas las aportaré cuando el juzgado lo solicite"; y que vale desde una cuenta que no es de la persona.
3. **Reparto y competencia.** Si la tutela nueva puede ir al juzgado municipal o a la oficina de reparto del directorio, o si contra entidades nacionales (Nueva EPS, ANT) debe ir al juez del circuito (Decreto 333 de 2021). En El Carmen de Bolívar, a cuál de los dos juzgados.
4. **Constancia de envío.** Si el número de envío, la fecha y la hora del proveedor sirven como prueba de radicación (Ley 1755, art. 15, par. 1; CPACA, arts. 61 y 62) o hace falta acuse de recibo o correo certificado.
5. **Notificaciones.** Si basta con el celular o el correo de la persona que van en la carta y en el documento (Ley 2213, arts. 3 y 8).
6. **Autorización y datos.** Texto de la autorización expresa (incluida la de datos de salud), de la copia por correo, del aviso de privacidad y del contrato de transmisión con Resend.

## 10. Cómo probar

```bash
npm test
```

Incluye `node prototipo/api/_test-correo.mjs`, sin cuentas reales y con reloj fijo. Directorio: las 15 alcaldías, los 15 juzgados y el Juzgado 2 de El Carmen sin verificar. Modo simulado: `GET` del modo, constancia simulada, destinos del directorio, rechazo de correos sin lista (403) y de destinos inválidos (400), cada documento a su tipo de entidad y a su municipio, contacto obligatorio para el juzgado (celular, correo en la dirección o copia permitida; un fijo no sirve), copia sin permiso, validación de datos y cédula con espacios, 415, 403 y 405, envío abierto con dominios permitidos y sin correos a mano para juzgados. Con un `fetch` falso que imita a Resend: cierre por defecto, modo de prueba, formato exacto de la llamada, documento armado en el servidor (nombre de la entidad del directorio, escape de HTML, modo y contacto, sin saltos de línea en encabezados), idempotencia, copia oculta y `reply_to`, tutela urgente sin firma manuscrita ni anexos, error de Resend, límites por entidad y por red, y la reserva del 20 % para tutelas. Con Redis y Twilio falsos: código por SMS, código errado, de un solo uso, dominio no permitido, juzgado solo del directorio y demasiados intentos. Y que ningún log tenga datos personales, códigos ni correos.

**En desarrollo:** `npm run dev:api` también atiende `/api/correo` (modo simulado si no hay `RESEND_API_KEY` en el entorno), así que con `npm run dev:web` se recorre el flujo completo.
