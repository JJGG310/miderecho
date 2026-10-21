# IA del asistente: Claude o Gemini

El asistente (`/api/asistente`, código en `apps/api/src`) usa **un** proveedor, según las variables que existan:

1. **Claude** si hay `ANTHROPIC_API_KEY`.
2. Si no, **Gemini** si hay `GEMINI_API_KEY`.
3. Si no, **modo básico** (reglas por palabras clave, `simulado.js`).

Si el proveedor falla en una conversación (cuota agotada, clave inválida, respuesta bloqueada, más de 20 s sin respuesta), esa respuesta sale del modo básico con el aviso *"La IA no respondió; se usó el modo básico."* El demo no se cae.

Para saber cuál está activo: `GET /api/salud` → `{ "ok": true, "ia": "claude" | "gemini" | "simulada", "modelo": "..." }`. Nunca muestra claves. Cada respuesta del asistente trae `fuente` (`claude`, `gemini`, `simulada` o `reglas`).

Las reglas son las mismas con los dos: el mismo prompt (`prompt.js`: no es abogado, no inventa normas, no pide datos personales), la misma herramienta `responder` (`orientacion.js`, Gemini la recibe como *function calling* obligatorio), el filtro de privacidad antes de enviar, el protocolo de riesgo por reglas fijas **antes** de llamar a la IA, máximo 12 mensajes de 2.000 caracteres, y los registros solo guardan el código de error, nunca lo que escribió la persona. "Qué dice la ley", plazos y documentos siguen saliendo de contenido fijo.

## Variables de Gemini

| Variable | Valor | Para qué |
|---|---|---|
| `GEMINI_API_KEY` | la clave | Activa Gemini (si no hay `ANTHROPIC_API_KEY`) |
| `GEMINI_ENDPOINT` | `aistudio` (por defecto) o `vertex` | De dónde es la clave (ver abajo) |
| `GEMINI_MODEL` | `gemini-3.8-flash` (por defecto) | Modelo. Debe ser Gemini 3 o posterior. Más barato: `gemini-3.5-flash-lite` |

### ¿La clave es de AI Studio o de Vertex?

**El prefijo no sirve para saberlo.** Las claves viejas de AI Studio empiezan por `AIza…`, pero ahora AI Studio solo entrega claves nuevas que empiezan por `AQ.…`, igual que otras claves de Google Cloud. Lo que cuenta es **dónde se creó**:

- En **aistudio.google.com** (botón *Get API key*) → `GEMINI_ENDPOINT=aistudio` (o no poner nada). Llama a `generativelanguage.googleapis.com` con la cabecera `x-goog-api-key`.
- En la **consola de Google Cloud**, en Vertex AI / Gemini Enterprise Agent Platform **modo express** → `GEMINI_ENDPOINT=vertex`. Llama a `aiplatform.googleapis.com` con `?key=`.

Si no se sabe, probar desde la terminal propia (la clave se pone en la variable, no se escribe en el comando):

```bash
export GEMINI_API_KEY='pegar-aquí'
# AI Studio
curl -s -H "x-goog-api-key: $GEMINI_API_KEY" -H 'Content-Type: application/json' \
  -d '{"contents":[{"role":"user","parts":[{"text":"hola"}]}]}' \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent | head -c 300
# Vertex modo express
curl -s -H 'Content-Type: application/json' \
  -d '{"contents":[{"role":"user","parts":[{"text":"hola"}]}]}' \
  "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.8-flash:generateContent?key=$GEMINI_API_KEY" | head -c 300
```

La que responda con `"candidates"` es la buena. Un error `API key not valid`, 401 o 403 indica que es la otra (o que la clave no tiene permiso para Gemini).

## Ponerla en Vercel

1. Vercel → proyecto de MiDerecho → **Settings → Environment Variables**.
2. Agregar `GEMINI_API_KEY` (marcar *Sensitive*) para **Production** (y **Preview** si se quiere probar ahí).
3. Si la clave es de Vertex, agregar también `GEMINI_ENDPOINT` = `vertex`.
4. Verificar que **no** exista `ANTHROPIC_API_KEY`; si existe, manda Claude.
5. **Redeploy** (las variables solo se aplican a despliegues nuevos).
6. Abrir `https://miderecho-two.vercel.app/api/salud`: debe decir `"ia": "gemini"`. Luego escribirle al asistente: la respuesta debe traer `"fuente": "gemini"`. Si trae `"simulada"` con aviso, mirar los registros de la función `api/asistente` en Vercel: aparece algo como `asistente: 403 Gemini respondió 403` o `Gemini no usó la herramienta: SAFETY`.

Con la CLI: `vercel env add GEMINI_API_KEY production` (pide el valor sin mostrarlo).

## Costos aproximados (octubre de 2026)

Cada turno manda unos 2.800 *tokens* (el prompt y el esquema fijo son unos 2.400) y recibe cerca de 1.000 (la respuesta más el razonamiento corto, `thinkingLevel: LOW`). Precios del plan de pago de la API de Gemini por millón de *tokens*:

| Modelo | Entrada | Salida | Por turno | 1.000 conversaciones de 3 turnos |
|---|---|---|---|---|
| `gemini-3.8-flash` (hasta el 31-dic-2026) | US$0,75 | US$3,75 | ≈ US$0,006 | ≈ US$18 |
| `gemini-3.8-flash` (desde el 1-ene-2027) | US$1,50 | US$7,50 | ≈ US$0,012 | ≈ US$35 |
| `gemini-3.5-flash-lite` | US$0,30 | US$2,50 | ≈ US$0,003 | ≈ US$10 |

Vertex AI cobra por su propia tabla de precios (parecida); revisar en la consola de Google Cloud. Fuente: ai.google.dev/gemini-api/docs/pricing.

**Usar el plan de pago, no el gratuito.** Los términos de la API de Gemini dicen que en el plan gratuito Google usa lo enviado para mejorar sus productos, que personas pueden revisarlo y que no se envíe información personal, sensible ni confidencial. Los relatos de MiDerecho hablan de salud, trabajo o tierras, así que en producción hay que activar la facturación del proyecto (en AI Studio: *Set up billing*). En el plan de pago Google dice que no usa los datos para mejorar sus productos y que los guarda "por un tiempo limitado" solo para detectar abusos. Vertex AI se rige por los términos de Google Cloud; confirmar en la consola que la cuenta no esté en un periodo de prueba con otras condiciones.

## Qué datos van a Google (para la política de datos)

Cuando Gemini está activo, el servidor de MiDerecho (Vercel) envía a **Google LLC (Estados Unidos)**, que puede procesarlos en servidores de EE. UU. u otros países:

- Las instrucciones fijas del asistente y el esquema de la respuesta (no son datos de la persona).
- Los **últimos 12 mensajes** de la conversación (máx. 2.000 caracteres cada uno), **después** del filtro de privacidad: cédulas y números largos, celulares y correos salen como `[número]`, `[teléfono]` y `[correo]`.

**No** se envían: el nombre, la cédula, el celular ni la dirección del paso "Tus datos para el documento" (nunca salen del celular), los documentos generados, los casos guardados, ni la IP de la persona (Google ve la del servidor). Los mensajes con señales de riesgo (amenazas, grupos armados, violencia) **no llegan a la IA**: los atiende el protocolo de riesgo con reglas fijas.

Ojo: el filtro no quita nombres propios ni lugares escritos dentro del relato ("mi vecino Pedro", "la vereda La Esperanza"). El prompt le pide a la IA no repetirlos, pero sí llegan a Google. La política de datos debe decir que el relato, sin cédulas, teléfonos ni correos, se transmite a un proveedor de IA en el exterior (Anthropic o Google, según cuál esté activo) solo para generar la respuesta, y que MiDerecho no lo guarda.
