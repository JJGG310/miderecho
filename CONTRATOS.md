# Contratos entre equipos (fase de construcción, 20-oct-2026)

Tres sesiones trabajan en paralelo, cada una en su propia rama. Para no pisarse, **cada una solo edita sus archivos** y respeta las interfaces de abajo. La integración (unir ramas, `index.html`, `sw.js`, README, despliegue) la hace la sesión principal.

## Quién edita qué

| Equipo | Rama | Archivos propios | No tocar |
|---|---|---|---|
| **Documentos** | `documentos` | `prototipo/app.js`, `prototipo/contenido.js`, `prototipo/plantillas.js` (nuevo), `prototipo/plazos.js`, `prototipo/styles.css`, `prototipo/test-*.mjs` | `api/`, `agente-voz.js`, `index.html`, `sw.js` |
| **Comunicaciones** | `comunicaciones` | `prototipo/api/**` (nuevo), `prototipo/comunicaciones.js` (nuevo), `prototipo/vercel.json` (nuevo), `prototipo/package.json` (solo si es indispensable), `docs/comunicaciones.md` | `app.js`, `contenido.js`, `index.html`, `sw.js` |
| **Agente de voz** | `agente-voz` | `prototipo/agente-voz.js` (nuevo), `agente/**` (nuevo: prompt, configuración, base de conocimiento), recursos en la cuenta de ElevenLabs | `app.js`, `contenido.js`, `index.html`, `sw.js`, `styles.css` |
| **Integración** (sesión principal) | `main` | `prototipo/index.html`, `prototipo/sw.js`, `README.md`, `prototipo/README.md`, uniones | — |

Vercel publica `main` automáticamente (carpeta raíz del proyecto: `prototipo/`). Nadie hace push a `main`. Cada equipo puede hacer push de **su propia rama** para obtener un preview de Vercel.

## Interfaces

### 1. `window.miderecho` (lo implementa Documentos en `app.js`)

Para que el agente de voz pueda manejar la app:

```js
window.miderecho = {
  // Arranca un caso con lo que ya se sabe. Siempre pasa por el aviso de privacidad y la pregunta de riesgo
  // si no se han respondido en este caso, y luego salta al primer paso que falte.
  iniciarCaso({ tipo, tema, municipio, vereda, entidad, correo, desde, palabras, peticiones }),
  // tipo: 'peticion' | 'tutela_salud' | 'tutela' | 'servicios_publicos' | ...
  // Devuelve el texto de la pantalla actual (título, cuerpo y opciones), para que el agente sepa dónde está.
  pantallaActual() -> { id, titulo, texto, opciones: [texto] },
  // Toca una opción visible por su texto exacto (como si la persona la tocara).
  elegir(textoOpcion) -> boolean,
  // Protocolo de riesgo: descarta el borrador sin guardar nada y muestra la pantalla de ayuda.
  riesgo(),
};
```

El agente de voz **no** puede tocar por la persona: "Sí, acepto", el "No" de la pregunta de peligro, ni botones de borrar, enviar o cerrar.

### 2. `plantillas.js` (lo crea Documentos)

Funciones puras, sin DOM, importables desde el navegador **y desde Node** (para que el servidor y el agente telefónico las reutilicen después):

```js
export const TIPOS = { peticion: {...}, tutela: {...}, tutela_salud: {...}, impugnacion: {...}, desacato: {...}, servicios_publicos: {...} };
export function generarDocumento(tipo, datos, hoy) -> string  // HTML del documento
```

### 3. `comunicaciones.js` (lo crea Comunicaciones)

Cliente del navegador para el servidor. Todas devuelven `Promise<{ ok, simulado, error? }>`; si faltan las claves de Twilio en el servidor, responden `simulado: true` sin fallar:

```js
export function enviarSMS(telefono, texto)
export function enviarWhatsApp(telefono, texto, { pdfUrl } = {})
export function llamar(telefono, mensaje)                       // llamada con voz que lee el mensaje
export function programarRecordatorios({ codigo, telefono, canal, fechas, mensaje })  // canal: 'sms' | 'whatsapp' | 'llamada'; fechas: ['YYYY-MM-DD']; devuelve además { token }
export function cancelarRecordatorios(codigo, token)          // el token secreto que devolvió programarRecordatorios
```

### 4. `agente-voz.js` (lo crea Agente de voz)

Módulo autónomo: al cargarse agrega su propio botón "Hablar con el asistente" y maneja la conversación. Usa solo `window.miderecho` para llenar el caso. La sesión principal lo enlaza con un `<script type="module" src="agente-voz.js">`.

## Reglas comunes (no negociables, ver `investigacion/06` y `12`)

- La app **no es abogado**. Lo jurídico sale de plantillas fijas; la IA conversa, entiende y clasifica.
- **No guardar contenido sensible**: nombre, cédula, hechos y datos de salud viven solo en memoria mientras se arma el documento.
- **No pedir la cédula por voz ni por WhatsApp.**
- **Protocolo de riesgo alto**: ante amenazas, dejar de recolectar datos y mostrar a dónde acudir.
- Textos en español colombiano claro, trato de usted.
- Sin dependencias nuevas salvo que sean indispensables (el prototipo es HTML, CSS y JS sin compilación).
