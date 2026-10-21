# IA del asistente: Claude o Gemini

El asistente (`/api/asistente`, código en `apps/api/src`) usa **un** proveedor, según las variables que existan:

1. **Claude** si hay `ANTHROPIC_API_KEY`.
2. Si no, **Gemini** si hay `GEMINI_API_KEY` **y** `GEMINI_PLAN` (`pago` o `gratis`). Sin `GEMINI_PLAN`, Gemini no se usa.
3. Si no, **modo básico** (reglas por palabras clave, `simulado.js`).

Si el proveedor falla en una conversación (cuota agotada, clave inválida, respuesta fuera del formato, más de 20 s sin respuesta), esa respuesta sale del modo básico con el aviso *"La IA no respondió; se usó el modo básico."* El demo no se cae. Claude y Gemini tienen el mismo tiempo límite (20 s) y no reintentan.

Para saber cuál está activo: `GET /api/salud` → `{ "ok": true, "ia": "claude" | "gemini" | "simulada", "modelo": "...", "plan": "pago" | "gratis" }` (`plan` solo con Gemini). Si hay clave de Gemini pero falta `GEMINI_PLAN`, `/api/salud` lo dice en `aviso`. Nunca muestra claves. Cada respuesta del asistente trae `fuente` (`claude`, `gemini`, `simulada` o `reglas`).

## Reglas iguales para los dos

- **Consentimiento:** la app manda `consentimiento: "ia-vN"` en el cuerpo de `POST /api/asistente` cuando la persona aceptó el aviso antes de usar la IA (la versión la define `apps/web`; el servidor acepta el patrón `ia-v` + 1 a 3 dígitos). Sin ese campo, el relato **no va a ningún proveedor**: contesta el modo básico con el aviso *"Para usar la inteligencia artificial primero debe aceptar el aviso."* El protocolo de riesgo por reglas funciona igual. Sin proveedor activo (modo básico) no hace falta.
- El mismo prompt (`prompt.js`: no es abogado, no inventa normas, no pide datos personales) y la misma herramienta `responder` (`orientacion.js`). Gemini la recibe como *function calling* obligatorio.
- Filtro de privacidad antes de enviar (cédulas, teléfonos y correos) y protocolo de riesgo por reglas fijas **antes** de llamar a la IA. Máximo 12 mensajes de 2.000 caracteres.
- **La salida se valida en el servidor** (`armarRespuesta`) contra el esquema de `responder`: solo acciones, documentos y derechos del catálogo, listas solo de textos, textos de máximo 600 caracteres y sin claves desconocidas. Si no cumple (por ejemplo, `orientar` sin orientación), contesta el modo básico. La IA no puede cambiar "Qué dice la ley", los plazos ni el aviso legal: salen de contenido fijo.
- Si Gemini bloquea el relato por seguridad (`SAFETY` o `PROHIBITED_CONTENT`), la app activa el **protocolo de riesgo** con la ayuda fija, no el modo básico. La seguridad de Gemini está en `BLOCK_ONLY_HIGH`: no bloquea relatos legítimos de violencia o salud.
- Los registros guardan el código de error, nunca lo que escribió la persona.

## Variables de Gemini

| Variable | Valor | Para qué |
|---|---|---|
| `GEMINI_API_KEY` | la clave | Activa Gemini (si no hay `ANTHROPIC_API_KEY`) |
| `GEMINI_PLAN` | `pago` o `gratis` | **Obligatoria.** `pago`: facturación activa en Google. `gratis`: solo para pruebas; cada respuesta lleva el aviso de abajo |
| `GEMINI_ENDPOINT` | `aistudio` (por defecto) o `vertex` | De dónde es la clave (ver abajo) |
| `GEMINI_MODEL` | `gemini-3.8-flash` (por defecto) | Modelo. Debe ser Gemini 3 o posterior. Más barato: `gemini-3.5-flash-lite` |

Los valores se limpian de espacios y mayúsculas (` Vertex ` sirve).

**Aviso con `GEMINI_PLAN=gratis`** (va en el campo `aviso` de cada respuesta y la app lo muestra debajo del chat): *"Modo de prueba: este asistente usa una versión gratuita de Gemini y Google puede usar lo que escriba para mejorar sus productos. No escriba datos reales de salud, nombres ni cédulas."*

### ¿La clave es de AI Studio o de Vertex?

**El prefijo no sirve para saberlo.** Las claves viejas de AI Studio empiezan por `AIza…`, pero ahora AI Studio solo entrega claves nuevas que empiezan por `AQ.…`, igual que otras claves de Google Cloud. Lo que cuenta es **dónde se creó**:

- En **aistudio.google.com** (botón *Get API key*) → `GEMINI_ENDPOINT=aistudio` (o no poner nada). Llama a `generativelanguage.googleapis.com`.
- En la **consola de Google Cloud**, en Vertex AI / Gemini Enterprise Agent Platform **modo express** → `GEMINI_ENDPOINT=vertex`. Llama a `aiplatform.googleapis.com` (endpoint global).

En los dos casos la clave va en la cabecera `x-goog-api-key`, nunca en la URL.

## Verificar antes del demo (con el pedido real)

Desde la raíz del repositorio, después de `npm install`. `read -rs` pide la clave sin mostrarla y sin dejarla en el historial de la terminal. El cuerpo sale de `cuerpoGemini` (el mismo prompt, la herramienta con su esquema, `thinkingLevel` y la seguridad que usa la app):

```bash
read -rs GEMINI_API_KEY
```

```bash
node --input-type=module -e "const { cuerpoGemini } = await import('./apps/api/src/gemini.js'); console.log(JSON.stringify(cuerpoGemini([{ role: 'user', content: 'La EPS no me da la cita con el cardiólogo hace dos meses' }])))" | curl -s -H "x-goog-api-key: $GEMINI_API_KEY" -H 'Content-Type: application/json' -d @- https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent | grep -o '"accion": *"[a-z_]*"'
```

Con una clave de Vertex, cambiar la URL por `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.8-flash:generateContent`.

- Si imprime `"accion": "preguntar"` (o `orientar`), el endpoint, el modelo, la herramienta y el esquema funcionan.
- Si no imprime nada, quitar el `| grep …` final para ver el error. `API key not valid`, 401 o 403: probar el otro endpoint (o la clave no tiene permiso para Gemini). 400 con `thinking`: el modelo no es Gemini 3 o posterior. 429: cuota agotada.

## Ponerla en Vercel

1. Vercel → proyecto de MiDerecho → **Settings → Environment Variables**.
2. Agregar `GEMINI_API_KEY` (marcar *Sensitive*) y `GEMINI_PLAN` (`pago` o `gratis`) para **Production** (y **Preview** si se quiere probar ahí).
3. Si la clave es de Vertex, agregar también `GEMINI_ENDPOINT` = `vertex`.
4. Verificar que **no** exista `ANTHROPIC_API_KEY`; si existe, manda Claude.
5. **Redeploy** (las variables solo se aplican a despliegues nuevos).
6. Abrir `https://miderecho-two.vercel.app/api/salud`: debe decir `"ia": "gemini"` y el plan. Luego escribirle al asistente desde una versión de la app que envíe el consentimiento (si no, siempre contesta el modo básico pidiendo aceptar el aviso): la respuesta debe traer `"fuente": "gemini"`. Si trae `"simulada"` con aviso, mirar los registros de la función `api/asistente` en Vercel: aparece algo como `asistente: gemini 403 Gemini respondió 403` o `Gemini no usó la herramienta: RECITATION`.

Con la CLI: `vercel env add GEMINI_API_KEY production` (pide el valor sin mostrarlo).

## Costos aproximados (octubre de 2026)

Cada turno manda unos 2.800 *tokens* (el prompt y el esquema fijo son unos 2.400) y recibe cerca de 1.000 (la respuesta más el razonamiento corto, `thinkingLevel: LOW`). Precios del plan de pago de la API de Gemini por millón de *tokens*:

| Modelo | Entrada | Salida | Por turno | 1.000 conversaciones de 3 turnos |
|---|---|---|---|---|
| `gemini-3.8-flash` (hasta el 31-dic-2026) | US$0,75 | US$3,75 | ≈ US$0,006 | ≈ US$18 |
| `gemini-3.8-flash` (desde el 1-ene-2027) | US$1,50 | US$7,50 | ≈ US$0,012 | ≈ US$35 |
| `gemini-3.5-flash-lite` | US$0,30 | US$2,50 | ≈ US$0,003 | ≈ US$10 |

Vertex AI cobra por su propia tabla de precios (parecida); revisar en la consola de Google Cloud. Fuente: ai.google.dev/gemini-api/docs/pricing.

## Plan gratis o de pago

Según los términos de la API de Gemini:

- **Gratis:** Google usa lo enviado para mejorar sus productos, personas pueden revisarlo (desvinculado de la cuenta) y los términos piden **no enviar información personal, sensible ni confidencial**. Los relatos de MiDerecho hablan de salud, trabajo o tierras: `GEMINI_PLAN=gratis` es solo para pruebas sin datos reales, y por eso cada respuesta lo advierte.
- **De pago** (facturación activa del proyecto; en AI Studio: *Set up billing*): Google dice que no usa los datos para mejorar sus productos.

Vertex AI se rige por los términos de Google Cloud; confirmar en la consola que la cuenta express no esté en un periodo de prueba con otras condiciones.

## Qué datos van a Google (para la política de datos)

Cuando Gemini está activo, el servidor de MiDerecho (Vercel) envía a **Google LLC (Estados Unidos)**:

- Las instrucciones fijas del asistente y el esquema de la respuesta (no son datos de la persona).
- Los **últimos 12 mensajes** de la conversación (máx. 2.000 caracteres cada uno), **después** del filtro de privacidad: cédulas y números largos, celulares y correos salen como `[número]`, `[teléfono]` y `[correo]`.

**No** se envían: el nombre, la cédula, el celular ni la dirección del paso "Tus datos para el documento" (nunca salen del celular), los documentos generados, los casos guardados, ni la IP de la persona (Google ve la del servidor). Los mensajes con señales de riesgo (amenazas, grupos armados, violencia, violación, maltrato, "quitar la vida") **no llegan a la IA**: los atiende el protocolo de riesgo con reglas fijas.

Ojo: el filtro no quita nombres propios ni lugares escritos dentro del relato ("mi vecino Pedro", "la vereda La Esperanza"). El prompt le pide a la IA no repetirlos, pero sí llegan a Google. La política de datos (`docs/politica-de-datos.md` y la pantalla Política) ya dice "Claude (Anthropic) o Gemini (Google), según el que esté activo".

### Cuánto tiempo lo guarda Google

- **API de Gemini, plan de pago:** registra pedidos y respuestas "por un tiempo limitado", solo para detectar abusos y cumplir obligaciones legales. **No publica una cifra.** Además guarda una caché implícita de hasta 24 horas en memoria (no en disco). La API de Gemini no ofrece retención cero: para eso Google remite a Vertex AI.
- **Plan gratis:** lo usa para mejorar sus productos; los términos no fijan un plazo.
- **Vertex AI:** términos de Google Cloud; [validar] si se puede pedir retención cero para la cuenta.

[validar: pedir a Google la cifra por escrito antes del piloto y ponerla en la política.]

### Pendiente: contrato de transmisión

Con el plan de pago o Vertex, Google trata el relato por encargo de MiDerecho: es una **transmisión** internacional de datos que, según los arts. 24 y 25 del Decreto 1377 de 2013, necesita un **contrato de transmisión** con su contenido mínimo. Pendiente antes del piloto: aceptar los términos de tratamiento de datos de Google Cloud (Cloud Data Processing Addendum) en la consola y [validar] con el consultorio jurídico que cubran ese contenido mínimo. Con el plan gratis Google usa los datos para sus propios fines, así que no cabe como encargado: otra razón para usarlo solo en pruebas sin datos reales.

## Lugar de procesamiento: endpoint regional de Vertex

Hoy la app usa endpoints **globales** (`generativelanguage.googleapis.com` o `aiplatform.googleapis.com`). Google dice que el endpoint global **no garantiza** en qué región se procesa el pedido.

Para fijar el lugar hace falta Vertex AI con un **proyecto de Google Cloud completo** (el modo express solo funciona con el endpoint global) y el endpoint regional:

```
https://REGION-aiplatform.googleapis.com/v1/projects/PROYECTO/locations/REGION/publishers/google/models/gemini-3.8-flash:generateContent
```

- Regiones en EE. UU.: `us-central1` (Iowa), `us-east1`, `us-east4`, `us-east5`, `us-south1`, `us-west1`, `us-west4`. En Suramérica solo hay `southamerica-east1` (São Paulo); no hay región en Colombia.
- Gemini 3.8 Flash aparece disponible en endpoints regionales (tabla de ubicaciones de Vertex AI).
- Para usarlo: cambiar la URL de Vertex en `apps/api/src/gemini.js` (una línea) y [validar] que la clave del proyecto (ligada a una cuenta de servicio con permiso de Vertex AI) sirva en el endpoint regional; si no, hace falta autenticación con cuenta de servicio (OAuth) en lugar de clave.
