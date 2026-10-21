# Correo: "Envíenla por mí" y tutela al juzgado por correo

Fecha: 21-oct-2026. Hasta ahora "Envíenla por mí" era una simulación. Con esto la app envía de verdad el documento por correo a la entidad o al juzgado, y guarda una constancia de envío con el caso.

## 1. Qué hay

| Archivo | Qué hace |
|---|---|
| `prototipo/api/correo.js` | `POST /api/correo { tipo, datos, destino, copia? }`. Arma el documento en el servidor con `plantillas.js` y lo envía con Resend. Responde `{ ok, simulado, copia, constancia: { id, fecha, para, entidad } }` |
| `prototipo/directorio.js` | Correos de las 15 alcaldías, de los juzgados de los 15 municipios y de la ANT, con la fuente y `verificado`. Funciona en el navegador y en Node |
| `prototipo/app.js` | Flujo de entrega: envío real, opción "Envíenla al juzgado por correo", cola sin internet y constancia en Mis casos |
| `prototipo/api/_test-correo.mjs` | Pruebas sin cuentas reales: `node prototipo/api/_test-correo.mjs` |

**Por qué Resend:** API REST simple (un `fetch`, sin SDK ni dependencias), plan gratis suficiente para el piloto, verificación de dominio con SPF y DKIM, llave de idempotencia para no enviar dos veces el mismo documento y, si se necesita, buzones de entrada para recibir las respuestas (sección 7).

## 2. Qué se envía y a quién

| Documento | Botón | Va a |
|---|---|---|
| Derecho de petición | Envíenla por mí | La alcaldía del municipio o la ANT (directorio). A otra entidad, al correo que escribió la persona, sin verificar |
| Reclamo y recurso de servicios públicos | Envíenlo por mí | El correo de la empresa que escribió la persona (sin verificar: no hay empresas en el directorio) |
| Tutela de salud y tutela general | Envíenla al juzgado por correo | El juzgado que recibe tutelas en el municipio: la oficina de reparto si existe, si no el juzgado municipal |
| Tutela por petición no respondida (Mis casos) | Envíenla al juzgado por correo | Igual que la tutela |
| Impugnación y desacato (Mis casos) | Envíenla al juzgado por correo | El juzgado que decidió la tutela. Donde hay varios (El Carmen de Bolívar, Chaparral, San José del Guaviare), la persona lo escoge |

- **La persona siempre ve a qué entidad y a qué correo va**, antes de dar sus datos y antes de enviar. Si el correo no está verificado con una fuente oficial, la app lo dice.
- **Autorización expresa:** casilla obligatoria "Autorizo a MiDerecho a enviar este documento en mi nombre…". Copia a su correo: campo opcional y una casilla aparte.
- **El correo lleva**, arriba del documento, una carta corta: quién presenta (nombre y cédula), que MiDerecho solo transmite y no es abogado ni apoderado, la norma, el correo autorizado para la respuesta y el código del caso. Las tutelas urgentes llevan "URGENTE" y "medida provisional" en el asunto.
- **Documento en el cuerpo del correo** (HTML y texto plano), no en PDF adjunto: generar un PDF en el servidor pedía una dependencia nueva. Si un juzgado exige adjunto, se agrega con una librería como `pdf-lib`.
- **Constancia:** número de envío de Resend, fecha y hora, destinatario. Se guarda con el caso (no es dato sensible), se muestra al enviar, en Mis casos y como prueba de entrega en "Qué puede hacer ahora". Para tener prueba de recibo, el correo de respuesta de la entidad o un acuse; Resend también avisa entregas y rebotes por webhook (no está conectado).

## 3. Directorio de correos (`prototipo/directorio.js`)

- **Alcaldías (15):** los correos de `contenido.js`, revisados el 20-oct-2026 en el sitio de cada alcaldía (`investigacion/08`, sección 3). Chaparral queda **sin verificar** porque su página mezcla dos dominios.
- **Juzgados (15 municipios):** "Directorio de cuentas de correo electrónico" de la Rama Judicial ([ramajudicial.gov.co/directorio-cuentas-de-correo-electronico](https://www.ramajudicial.gov.co/directorio-cuentas-de-correo-electronico)), consultado el 21-oct-2026. Todos verificados. En 12 municipios hay un solo juzgado promiscuo municipal. Chaparral y San José del Guaviare tienen oficina de reparto. El Carmen de Bolívar tiene dos juzgados promiscuos municipales y el directorio no muestra oficina de reparto: la tutela nueva va al Juzgado 1 [validar].
- **ANT:** `atencionalciudadano@ant.gov.co`, de su Carta de trato digno (actualizada a 2025), que también da `info@ant.gov.co`. Las tutelas contra la ANT no van a ese correo: van al juzgado.
- **Faltan:** EPS y empresas de servicios públicos. Casi todas las EPS reciben PQRS por formulario web. Hasta agregarlas, esos envíos van al correo que escribe la persona y solo salen si el envío abierto está activado (sección 5).
- **Antes del piloto:** confirmar por teléfono con cada alcaldía y juzgado que el correo recibe peticiones o tutelas, y volver a revisar cada 3 meses (los correos cambian).

## 4. Pasos para activarlo (en este orden)

1. **Crear la cuenta** en [resend.com](https://resend.com) con el correo del equipo. Crear una API key con permiso "Sending access".
2. **Sin dominio propio, solo para probar:** el remitente `onboarding@resend.dev` solo puede enviar al correo con el que se creó la cuenta. Poner ese correo en `CORREOS_DEMO`.
3. **Con dominio propio (necesario para enviar a entidades):** en Resend → Domains → Add domain (mejor un subdominio, por ejemplo `envios.midominio.co`). Copiar en el DNS del dominio los registros que muestra Resend: MX y TXT de SPF, y TXT de DKIM. Agregar un registro DMARC (`_dmarc`, `v=DMARC1; p=none;` para empezar). Esperar a que Resend marque el dominio como verificado. Sin SPF, DKIM y DMARC, los correos a entidades del Estado suelen caer en spam.
4. **Variables en Vercel** (Settings → Environment Variables), sección 5.
5. **Probar con la lista del equipo** (`CORREOS_DEMO`): lo del directorio llega al primer correo de la lista, marcado como prueba, y no a la entidad.
6. **Solo para producción:** Redis (el mismo de los recordatorios, `docs/comunicaciones.md`, sección 6) y `PERMITIR_CORREO_ABIERTO=1`. Desde ahí los documentos llegan a las entidades de verdad.

## 5. Variables de entorno

| Variable | Para qué | Ejemplo |
|---|---|---|
| `RESEND_API_KEY` | Sin ella todo es simulado: se valida y se arma el documento, pero no sale nada | `re_…` |
| `CORREO_REMITENTE` | Remitente, del dominio verificado. Sin ella, `MiDerecho <onboarding@resend.dev>` | `MiDerecho <envios@envios.midominio.co>` |
| `CORREOS_DEMO` | Correos del equipo, separados por comas. Con clave real y sin envío abierto, lo del directorio llega al primero de la lista | `ana@equipo.co,juan@equipo.co` |
| `PERMITIR_CORREO_ABIERTO` | `1` = envío real a las entidades y a correos escritos a mano. Con clave real exige Redis | `1` |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `CLAVE_CIFRADO` | Redis y clave de los límites, compartidos con `docs/comunicaciones.md` | |
| `LIMITE_DIARIO` | Tope de envíos al día (compartido con SMS como valor, con contador aparte). Por defecto 100 | `100` |

**Cerrado por defecto:** con `RESEND_API_KEY` y sin `CORREOS_DEMO` ni (`PERMITIR_CORREO_ABIERTO=1` y Redis), la función responde 503 y no envía nada.

## 6. Protección contra abuso

La función no puede usarse como relevo de correo:

- **No recibe HTML, asunto ni destinatarios.** Recibe `tipo`, `datos` y `destino`, y arma el documento con las plantillas fijas. Solo pasan los campos que usan las plantillas, con topes de largo; los ids (tema, servicio, derecho…) se validan contra las listas de `contenido.js`; el código del caso y el plazo, con formato fijo. Todo lo que escribe la persona va escapado.
- **`destino` es una clave del directorio.** Un correo escrito a mano solo pasa si está en `CORREOS_DEMO` o con el envío abierto; si no, 403. Un documento judicial solo va a un juzgado y uno administrativo solo a una entidad.
- **La copia** a la persona sigue las mismas reglas que un correo escrito a mano; si no está permitida, el documento sale sin copia y la app lo dice.
- **Límites (solo con envío real):** 30 por hora por red (IPv6 por red), 25 al día por entidad o correo de destino, y `LIMITE_DIARIO` en total. Con Redis valen para todas las instancias.
- **Reintentos:** la llave de idempotencia (tipo, código y huella del texto) hace que Resend no envíe dos veces el mismo documento en 24 horas. Importa en tutelas: presentar dos veces la misma puede tomarse como temeridad (Decreto 2591, art. 38).
- **Solo desde la app:** como las demás funciones (`_comun.js`): solo JSON (415), mismo origen (403), solo POST (405).
- **Logs:** solo el tipo y la clave del directorio (`[correo] enviado: peticion a alcaldia:Ovejas`). Nunca nombres, cédula, hechos, datos de salud ni correos escritos a mano. Los errores de Resend se registran solo por su código, porque su mensaje puede traer el destinatario.
- **Antes de abrir en producción:** captcha en la app y verificación del celular o del correo de quien envía. Sin eso, cualquiera puede presentar documentos a nombre de otra persona (la cédula no se verifica).

## 7. Privacidad, cola sin internet y respuestas

- **Nombre y cédula viven solo en memoria** hasta enviar: viajan al servidor en el envío, que no los guarda ni los registra, y la app los borra al terminar. En el celular, el caso guarda solo lo de siempre, más la constancia.
- **Sin internet:** el documento queda en cola **en la memoria de la app** y se envía solo al volver la señal. No se guarda en el celular porque lleva nombre y cédula. **Si la persona cierra la app antes de tener señal, el envío se pierde**: el caso queda como "No se envió" en Mis casos, con la opción de anotar que lo entregó ella. La app lo advierte al dejarlo en cola. Impugnación y desacato no hacen cola: necesitan señal (o se imprimen).
- **Resend guarda los correos enviados 30 días** en su panel (plan gratis), con el documento completo. Es una transmisión internacional de datos personales (Estados Unidos): hace falta el contrato de transmisión y avisarlo en el aviso de privacidad (`investigacion/06`, sección 1.5). Después del demo, borrar los correos de prueba.
- **Falta el buzón de respuestas.** Los documentos dicen que la respuesta llega a `CORREO_SERVICIO` (`contenido.js`), que hoy es `respuestas@miderecho.example` y no existe. El correo se envía con ese `reply_to`. Antes de enviar a entidades reales hay que: (1) cambiarlo por un buzón real del dominio verificado (Resend tiene buzones de entrada, o una cuenta de correo normal), y (2) que alguien reenvíe cada respuesta a la persona el mismo día. **En tutelas es crítico:** la notificación del fallo llega a ese buzón y la persona tiene 3 días para impugnar.

## 8. Costos (precios de lista de Resend, octubre de 2026, en dólares)

| Plan | Precio | Correos |
|---|---|---|
| Free | 0 | 3.000 al mes, máximo 100 al día |
| Pro | 20 al mes | 50.000 al mes, sin tope diario |
| Pro | 35 al mes | 100.000 al mes |

Una copia a la persona cuenta como un correo más. Para el piloto alcanza el plan gratis. El dominio se paga aparte. Fuente: [resend.com/pricing](https://resend.com/pricing).

## 9. Puntos para validar con un abogado

1. **Envío en nombre de la persona.** Si MiDerecho, al enviar el correo, es solo un medio de transmisión o cae en representación o agencia oficiosa; qué consecuencia tiene para exigir poder, para la legitimación en la tutela y para el ejercicio ilegal de la abogacía (Decreto 196 de 1971). El texto dice que la persona es el peticionario o el accionante y que MiDerecho solo transmite (`investigacion/08`, secciones 2 y 6).
2. **Validez de la tutela por correo.** Decreto 2591 de 1991, art. 14 (sin formalidades) y Ley 2213 de 2022 (actuaciones por medios electrónicos, sin firma manuscrita). Confirmar que basta con nombre y cédula en el correo, sin firma; que vale desde una cuenta que no es de la persona; y que las plantillas de tutela, que hoy dejan en blanco el nombre del accionante, sirven así con la carta de remisión (o pedirle al equipo de Documentos que las llenen cuando se envían).
3. **Reparto y competencia.** Si la tutela nueva puede ir al juzgado municipal o a la oficina de reparto del directorio, o si contra entidades nacionales (Nueva EPS, ANT) debe ir al juez del circuito (Decreto 333 de 2021). En El Carmen de Bolívar, a cuál de los dos juzgados.
4. **Constancia de envío.** Si el número de envío, la fecha y la hora del proveedor sirven como prueba de radicación (Ley 1755, art. 15, par. 1; CPACA, arts. 61 y 62) o hace falta acuse de recibo o correo certificado.
5. **Correo para notificaciones.** Si el buzón del servicio vale como dirección de notificación autorizada (CPACA, art. 56) y qué responsabilidad asume el servicio si una notificación no se reenvía a tiempo.
6. **Autorización y datos.** Texto de la autorización expresa, de la copia por correo y del aviso de privacidad sobre la transmisión a Resend.

## 10. Cómo probar

```bash
node prototipo/api/_test-correo.mjs
```

Prueba sin cuentas reales y con reloj fijo. Modo simulado: constancia, destinos del directorio (alcaldía, juzgado, ANT), rechazo de correos sin lista (403) y de destinos inválidos (400), cada documento a su tipo de entidad, copia sin permiso, validación de datos (nombre, cédula, código, plazo, ids, listas, largos, fechas), 415, 403 y 405, sin límites en simulado. Con un `fetch` falso que imita a Resend: cierre por defecto (503, también con envío abierto sin Redis), envío de prueba al equipo, formato exacto de la llamada, documento armado en el servidor (datos, escape de HTML, nada de lo que mande el cliente por fuera), llave de idempotencia, copia oculta, tutela urgente al juzgado, error de Resend, límites por entidad, por red y diario, y que ningún log tenga datos personales ni correos.

En el navegador: con `python3 -m http.server` la función responde 501 y la app muestra "No se pudo enviar". Para recorrer el flujo completo hace falta un preview de Vercel (sin clave, en modo simulado).

```bash
curl -X POST https://<preview>.vercel.app/api/correo -H 'Content-Type: application/json' -d '{"tipo":"peticion","destino":"alcaldia:Ovejas","datos":{"codigo":"K7P2","temaId":"vias","municipio":"Ovejas","vereda":"La Peña","desde":"hace un mes","peticiones":["Reparar el camino."],"plazo":15,"nombre":"Prueba","cedula":"12345678"}}'
```
