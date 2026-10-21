# Canal telefónico: el mismo agente por llamada

Estado al 21-oct-2026: **ya existe el agente telefónico** ("MiDerecho teléfono", `agent_3901m5fd72hyedssc8h6r4gznevn`, ver `prompt-telefono.md`) y la llamada **saliente** que pide la persona desde la app (`prototipo/api/llamar.js`: ahora o agendada). Falta la cuenta de Twilio y el número: pasos exactos en `docs/llamadas-y-notificaciones.md` §2. La parte de llamadas **entrantes** y el documento por teléfono (§2, herramienta `/api/voz/documento`) sigue solo preparada.

**Decisión de integración (21-oct-2026):** el agente de llamadas **salientes** (recordatorio del plazo y orientación de qué documento sirve) queda **sin herramientas de documentos**, como está en `prompt-telefono.md`. Las herramientas de servidor de la otra rama (agente de voz en la v2) quedan preparadas y sin registrar en este agente, para una fase posterior. Precios de `investigacion/11-agente-de-voz.md` (§1.2, §2.2 y §5.2); reconfirmarlos el día de la compra.

## 1. Conectar un número de Twilio al agente (integración nativa de ElevenLabs)

ElevenLabs maneja la llamada completa (voz a texto, LLM y texto a voz). Twilio solo pone el número.

1. Crear la cuenta de Twilio y comprar un número con voz y SMS. Para el demo sirve un número de EE. UU. (sale en minutos). Uno colombiano exige comprobante de dirección y puede tardar días (informe 11, §1.2).
2. En elevenlabs.io → Agents → **Phone numbers** → **Import number** → **Twilio**: etiqueta, número en formato +57…, **Account SID** y **Auth Token** de Twilio. ElevenLabs configura solo el webhook de voz del número.
   - El Auth Token es secreto: se pega solo en el panel de ElevenLabs. **Nunca va al repositorio.**
   - El conector de Claude puede listar y editar números (`agents_list_phone_numbers`, `agents_update_phone_number`), pero no importarlos: ese paso se hace en el panel.
3. Asignar al número el agente de teléfono (ver §2). Desde ahí, **llamadas entrantes**: quien marque habla con el agente.
4. **Llamadas salientes** (para la "llamada perdida y devolución" del informe 11, §1.2 variante C): `POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call` con `agent_id`, `agent_phone_number_id` y `to_number`. Lo llama el servidor (equipo Comunicaciones, `prototipo/api/`) con la clave de ElevenLabs guardada como variable de entorno de Vercel, nunca en el código.
5. En Twilio, revisar que **no** esté activada la grabación de llamadas.

## 2. Qué cambia frente al agente web

En el teléfono **no hay pantalla ni `window.miderecho`**: las herramientas de cliente (`iniciar_caso`, `pantalla_actual`, `elegir_opcion`) no sirven. Recomendación: **duplicar el agente** (`agents_duplicate`) como "MiDerecho teléfono" y cambiarle prompt y herramientas, en vez de meter las dos variantes en un solo prompt.

| Pieza | Web (hoy) | Teléfono |
|---|---|---|
| Consentimiento | La persona toca "Sí, acepto" en la pantalla | Por voz o tecla: "Marque 1 si está de acuerdo". La recepción de teclas (DTMF) aparece en la plataforma pero hay que probarla primero (informe 11, §6.7) |
| Documento | Lo arma la app con `plantillas.js` | Lo arma el **servidor** con el mismo `plantillas.js` (es puro y se importa desde Node, CONTRATOS.md §2) |
| Entrega | Imprimir o PDF en el celular | **SMS con código** para retirarlo con el líder o en la Personería, o PDF por WhatsApp si la persona lo pide |
| Datos que el agente recoge | Tipo, tema, municipio, entidad, desde | Lo mismo, más qué pide (opciones cerradas). Nunca nombre, cédula ni dirección: salen en blanco en el papel |
| Riesgo alto | Texto fijo y opción "Sí" en la app | Texto fijo y, solo con un aliado que haya aceptado, `transfer_to_number` a la Personería o la Defensoría |

### Herramienta de servidor nueva (la construye Comunicaciones; el agente solo la llama)

Webhook `POST /api/voz/documento` en `prototipo/api/`:

- **Entrada** (la manda el agente): `{ tipo, tema, municipio, entidad, desde, peticiones: [opción…] }` con los mismos valores cerrados de `configuracion.json`. El número de quien llama llega como variable de sistema de la llamada (`{{system__caller_id}}`); el agente no lo dicta.
- **Qué hace**: llama `generarDocumento(tipo, datos, hoy)` de `plantillas.js`; guarda solo variables no sensibles con un código de 4 caracteres y vencimiento de 72 horas (informe 11, §3.8); manda el SMS con `enviarSMS` de `comunicaciones.js` (o `enviarWhatsApp` con `pdfUrl`).
- **Salida** (el agente la lee tal cual): `{ codigo: "4F7K", resumen: "Pide que reparen…", plazo: "quince días hábiles" }`.
- **SMS sin datos**: `Peticion 4F7K lista. Retirela con su lider o en la Personeria.` Sin tildes, sin tema, sin nombre.
- **Seguridad**: una cabecera secreta que ElevenLabs manda en cada llamada a la herramienta (guardada en los *secrets* del agente) y que el servidor verifica. El número de teléfono se guarda solo como HMAC (informe 06, §5.2).

## 3. Costo por minuto (lista de precios, informe 11)

| Concepto | USD |
|---|---|
| ElevenLabs Agents (todos los planes) | 0,08 por minuto (0,16 si se pasa de la concurrencia del plan); el LLM se cobra aparte, unos 0,01 |
| Twilio Colombia, entrante a número local | 0,0945 por minuto |
| Twilio Colombia, entrante a número gratuito (01-8000) | 0,1792 por minuto |
| Twilio Colombia, saliente a celular (devolución de llamada) | 0,0377 por minuto |
| Número local / gratuito | 17,50 / 25,00 al mes (más un posible cargo de recepción: tomar 17,5-31,5 y 25-50) |
| SMS con el código | 0,0592 por segmento |

**Llamada típica de 9 minutos:** unos USD 1,15 con devolución de llamada, USD 1,66 con número local entrante y USD 2,42 con línea gratuita (COP 4.600 a 9.700 con 1 USD = COP 4.000), más el SMS. La telefonía pesa más que el LLM: acortar el guion y usar devolución de llamada baja más el costo que cambiar de modelo.

## 4. Pendientes antes de activarlo

- Probar recepción de teclas (DTMF) y la voz en una llamada real desde un celular básico.
- Confirmar con un abogado si aceptar con una tecla basta como autorización (informe 11, §3.3).
- Verificar con los aliados los números de ayuda del protocolo de riesgo antes de grabarlos.
- No prometer "llamada gratis" hasta tener devolución de llamada o 01-8000 confirmado con operadores.

## 5. Herramientas de servidor del agente telefónico (listas, sin registrar)

Estado al 21-oct-2026: el código está en `prototipo/api/_herramientas.js` y responde en la función que ya existe `/api/elevenlabs-sesion` (para no sumar otra función al límite del plan de Vercel; la integración puede enrutar `herramienta(req, res)` desde un despachador). **No están registradas en ningún agente** y no se ha llamado a nadie. Reemplazan la propuesta de "Herramienta de servidor nueva" de la §2.

En el teléfono no hay app: el agente escoge valores de listas cerradas y el servidor pone lo jurídico (plantillas, plazos con festivos, ley y frases fijas). Ninguna recibe ni guarda nombre, cédula, dirección o relato.

| Herramienta | URL (POST, JSON) | Qué recibe | Qué devuelve |
|---|---|---|---|
| `orientar` | `/api/elevenlabs-sesion?herramienta=orientar` | `documento` (`peticion`, `tutela_salud`, `tutela`, `servicios_publicos`, `ninguno`), `urgente` (sí/no), `derecho` opcional (`salud`, `trabajo`, `vivienda`, `peticion`, `igualdad`, `otros`) | `documento`, `titulo`, `frase` fija, `plazo_dias_habiles`, `ley` (texto fijo), `aviso`. Sin urgencia, la tutela de salud pasa a petición a la EPS |
| `documento` | `…?herramienta=documento` | `conversacion` (**variable de sistema**), `tipo`, `municipio` (uno de los 15 de la lista del núcleo; sin tildes ni mayúsculas también vale), `desde` (`hace una semana` … `hace más de un año`) y según el tipo: `temaId` (`agua`, `vias`, `salud`, `ayudas`, `tierras`, `educacion`), `servicio` (`acueducto`, `energia`, `gas`, `aseo`) y `motivo` (`cobro`, `corte`, `dano`, `otro`), `que` (`cita`, `medicamento`, `cirugia`, `examen`, `transporte`, `otra_cosa`) y `urgente`, o `derecho` (`salud`, `minimo_vital`, `educacion`, `debido_proceso`, `peticion`, `otro_derecho`) | `codigo` de 4 caracteres y `deletreado`, `titulo`, `pide` (textos de plantilla), `para`, `plazo_dias_habiles`, `codigo_sirve_dias` (3). Arma el documento con `generarDocumento` del núcleo y guarda solo esas variables, cifradas, 72 horas, **atadas a la conversación** |
| `plazo` | `…?herramienta=plazo` | `tipo`, `desde` (AAAA-MM-DD, opcional: hoy) | `dias_habiles`, `vence` (AAAA-MM-DD), `vence_en_palabras` ("lunes, 3 de noviembre") |
| `aviso` | `…?herramienta=aviso` | `conversacion` (**variable de sistema**), `canal` (`sms` o `whatsapp`), `plantilla` (`documento_listo` o `plazo`), `codigo` (de un documento de **esta** llamada), `desde` opcional (día de entrega, solo `plazo`) y `telefono` (**variable de sistema**) | `{ ok, simulado }`. Texto fijo de `_avisos.js`. **La fecha del plazo la calcula el servidor** con el tipo guardado y `desde`; el modelo no puede mandar una fecha. Mismas protecciones que `/api/sms` y además exige `NUMEROS_DEMO` (ver abajo) |
| `riesgo` | `…?herramienta=riesgo` | `conversacion` (**variable de sistema**) | `{ ok, indicacion }`. Desde ahí `documento` y `aviso` responden 403 en esa llamada (24 h) |

### Seguridad

- Variable de entorno en Vercel: `AGENTE_HERRAMIENTAS_SECRETO`, 32 caracteres o más (por ejemplo, `openssl rand -base64 32`). Sin ella, o si es más corta, todas responden 503.
- ElevenLabs la manda en la cabecera `x-miderecho-secreto` de cada llamada. El servidor la compara en tiempo constante; si falta o no coincide, 401. **Nunca va al repositorio ni al prompt.**
- **Campos que no llena el modelo** (en ElevenLabs se configuran como *dynamic variable*, no con descripción): `conversacion` ← `system__conversation_id` (en las tres que la usan) y, en `aviso`, `telefono` ← `system__caller_id` si la llamada es **entrante** o `system__called_number` si es **saliente** (`/api/llamar` de la sesión de llamadas).
- **Código atado a la llamada:** `aviso` solo manda códigos que creó `documento` en la misma conversación (se guarda el HMAC del id de la conversación) y que no han vencido. Un código inventado o de otra llamada da 404.
- **Número atado a la llamada (pendiente):** el servidor todavía no comprueba que `telefono` sea el de quien llama; solo confía en que ElevenLabs lo llena con la variable de sistema. Por eso, con Twilio real, `aviso` **exige `NUMEROS_DEMO`** aunque `PERMITIR_ENVIO_ABIERTO` esté puesto. Para abrirlo: (1) configurar `telefono` como variable de sistema, como arriba; y (2) que el servidor lo verifique, por ejemplo pidiendo a ElevenLabs `GET /v1/convai/conversations/{conversacion}` con `ELEVENLABS_API_KEY` y comparando el número de la llamada en `metadata` (verificar qué queda visible con retención cero) o, sin depender de eso, firmando el número al iniciar la llamada saliente en `/api/llamar` y pasándolo como variable propia. Hasta entonces, solo `NUMEROS_DEMO`.
- Los logs solo dicen el canal y los dos últimos dígitos; nunca el código, el texto ni el número.
- El límite por IP de `_comun.js` (60 por hora) cuenta todas las llamadas de ElevenLabs juntas, porque llegan desde sus servidores. El freno real para el teléfono es el tope por número y el diario.

### Registrarlas en el agente "MiDerecho teléfono" (`agent_3901m5fd72hyedssc8h6r4gznevn`)

1. Generar el secreto y ponerlo en Vercel (Production y Preview) como `AGENTE_HERRAMIENTAS_SECRETO`. Volver a desplegar.
2. En elevenlabs.io → Agents → **Secrets**, crear el secreto `miderecho_herramientas` con el mismo valor.
3. Crear cinco herramientas tipo **Webhook** (en el panel o con el conector: `agents_create_tool` con `type: "webhook"`):
   - Método `POST`, URL `https://miderecho-two.vercel.app/api/elevenlabs-sesion?herramienta=<nombre>` (o el alias fijo del preview para probar).
   - Cabecera `x-miderecho-secreto` → tipo **Secret** → `miderecho_herramientas` (en la API: `request_headers: { "x-miderecho-secreto": { "secret_id": "<id>" } }`).
   - Cuerpo con los campos de la tabla, como `enum` cuando son listas cerradas. `conversacion` y `telefono` con **dynamic variable** (ver Seguridad), nunca con descripción para el modelo.
   - Tiempo máximo 20 s; `orientar` y `plazo` con "pre_tool_speech" apagado (responden al instante).
4. Agregar los cinco `tool_id` al agente de teléfono (`agents_update_prompt_settings` con `tool_ids`, que reemplaza la lista completa: incluir las que ya tenga) y en su prompt indicar: confirmar el tema; `orientar` y leer textual `frase` y `ley`; si la persona quiere el documento, preguntar el municipio y desde cuándo, llamar `documento` y deletrear el código; `plazo` si pregunta cuándo le deben responder; `aviso` solo si la persona acepta de palabra que le manden el código por SMS o WhatsApp; ante amenazas o peligro, `riesgo` y el texto fijo del protocolo, sin más herramientas.
5. Probar primero con el preview y `NUMEROS_DEMO` del equipo. Las pruebas sin red están en `node prototipo/api/_test-agente-avisos.mjs`.

### Lo que falta para usarlas en vivo

- **Atar el número a la llamada** en el servidor (arriba). Mientras tanto, solo `NUMEROS_DEMO`.
- **Canje del código:** hoy el código guarda las variables del documento 72 horas, pero todavía no hay pantalla para que el líder o la Personería lo escriban y vuelvan a generar el documento. Es lo siguiente para cerrar el flujo telefónico (con límite de intentos por IP: 4 caracteres son pocos para adivinar).
- **Riesgo por regla en el teléfono:** en la web la app aplica `hayRiesgo()` a la transcripción; en el teléfono no hay cliente, así que depende de que el agente llame `riesgo`. Si se quiere regla fija también ahí, usar el webhook de transcripción de ElevenLabs (verificar que funcione con retención cero).
- Autorización por voz del aviso: validar con abogado si basta que la persona acepte de palabra (informe 11, §3.3).
