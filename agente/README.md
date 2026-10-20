# Agente de voz de MiDerecho

Agente conversacional en ElevenLabs que habla con la persona y maneja la app a través de `window.miderecho` (CONTRATOS.md §1 y §4). La IA conversa, entiende y clasifica; lo jurídico sale de las plantillas de la app.

- **Agente:** `agent_8101m5dg7s5se9trrst6fjpvz52d` ("MiDerecho", español). El id es público; no hay claves en el repo.
- **Módulo del navegador:** `prototipo/agente-voz.js`.

| Archivo | Qué es |
|---|---|
| `prompt.md` | Prompt del sistema (diseño seguro del informe 11, protocolo de riesgo, listas cerradas) |
| `conocimiento.md` | Base de conocimiento en lenguaje claro (borrador sin validar por un consultorio jurídico) |
| `configuracion.json` | Todo lo demás para recrearlo: primer mensaje, voz, herramientas con ids, guardrails, privacidad, dominios, límites, SDK |
| `telefono.md` | Cómo pasar este agente a una línea de Twilio (solo preparado) |
| `prueba.html` | Página de prueba con un `window.miderecho` falso. **No se publica** |

## Recrearlo

Con el conector de ElevenLabs (o el panel): crear el agente con `prompt.md`, el primer mensaje y la voz de `configuracion.json`; crear la base de conocimiento con `conocimiento.md` en modo *prompt*; crear las tres herramientas de cliente con los parámetros de `configuracion.json`; y copiar guardrails, privacidad, dominios, límites y turnos. Si cambia el id, actualizar `AGENTE` en `prototipo/agente-voz.js`.

## Probarlo

Desde la raíz del repo:

```bash
python3 -m http.server 8000
```

y abrir `http://localhost:8000/agente/prueba.html`. La caja de texto conversa con el agente real sin micrófono y la lista muestra cada llamada a `window.miderecho`.

## Integración (sesión principal)

- `prototipo/index.html`, después de `app.js`: `<script type="module" src="agente-voz.js"></script>`
- `prototipo/sw.js`: agregar `'agente-voz.js'` a `ARCHIVOS` y subir `CACHE` (por ejemplo `miderecho-v4`). El SDK viene del CDN solo cuando la persona acepta hablar; el service worker no lo guarda.
- Lo que el módulo espera de Documentos: `tipo` ∈ peticion, tutela_salud, tutela, servicios_publicos; `tema` = ids de `TEMAS`; `entidad` ∈ alcaldia, eps, ant; `desde` = textos de `DESDE`; que la opción del aviso siga empezando por "Sí, acepto" (el agente no puede tocarla). Lo ideal es que `pantallaActual()` no incluya nombre ni cédula: el módulo tapa los números largos, pero no puede tapar nombres.

## Pendientes

- **Voz:** la elegida ("Gabriel", acento andino nariñense, pausado) está en la biblioteca y el conector no puede agregarla. Agregarla a "Mis voces" en elevenlabs.io y cambiar `voice_id`. Hoy usa "Cristian Sanchez" (paisa), la única colombiana ya en la cuenta.
- **Dominios:** `*.vercel.app` deja usar el agente desde cualquier sitio de Vercel si ElevenLabs acepta el comodín. La protección real es la sesión firmada (`enable_auth` + un endpoint en `api/` que pida el token con la clave): pendiente con Comunicaciones. Mientras tanto limitan el gasto: 60 conversaciones al día, 3 a la vez, sin ráfagas, 10 minutos por conversación.
- **Audio real:** probado con un micrófono simulado en silencio (conecta, habla, cambia de estado, cuelga). Falta una prueba hablando de verdad desde un celular, con ruido y acento rural.
- **Privacidad:** borrar desde el panel de ElevenLabs los resúmenes de las conversaciones de prueba anteriores al modo de retención cero (datos inventados).
- **Jurídico:** validar `conocimiento.md` y los textos fijos con un consultorio jurídico; confirmar con los aliados los datos de ayuda del protocolo de riesgo.
