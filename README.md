# MiDerecho

Hackathon, Reto 2: acceso a la justicia rural con tecnología de bajo consumo de datos ([enunciado](reto-2-enunciado.jpg)).

**Dos apps en una:**

1. **Sin conexión: "Conoce tus derechos".** Explicaciones "con plastilina" de salud, trabajo, vivienda, peticiones, igualdad y otros derechos, cada una con historieta, lectura en voz alta, "¿Qué dice la ley?" y normas. Todo queda guardado en el celular (PWA).
2. **Con internet: el ayudante con IA.** La persona cuenta lo que le pasa (escrito o dictado) y el asistente (Claude o Gemini) pregunta lo mínimo y orienta: qué significa, qué derecho podría estar en juego, pasos, a dónde acudir y qué documento sirve. Después arma el documento con plantillas fijas (derecho de petición, tutela de salud, tutela o reclamo de servicios públicos) y sigue el plazo en **Mis casos**. Si no responden, prepara la tutela.

Por qué esos documentos y no contratos laborales: [investigacion/13-justificacion-mecanismos.md](investigacion/13-justificacion-mecanismos.md).

## Estructura

| Carpeta | Qué hay |
|---|---|
| [`apps/web/`](apps/web/) | La app (React + Vite, PWA). Pantallas del Figma de Valentina |
| [`apps/api/`](apps/api/) | Backend (Node + Express): asistente con Claude o Gemini, documentos y plazos. No guarda nada |
| [`packages/nucleo/`](packages/nucleo/) | Lógica compartida y sin interfaz: plazos en días hábiles con festivos, plantillas de documentos, contenido jurídico, catálogo de derechos y filtro de privacidad. La usan la app y el backend (y servirá para WhatsApp o una llamada) |
| [`prototipo/`](prototipo/) | Prueba de concepto de Gallego (HTML sin compilación). Queda como referencia |
| [`investigacion/`](investigacion/) | Investigación. Empezar por el [informe ejecutivo](investigacion/00-informe-ejecutivo.md) |

## Correr localmente

Requiere Node 20 o superior.

```bash
npm install
cp apps/api/.env.example apps/api/.env   # y pegar la ANTHROPIC_API_KEY o la GEMINI_API_KEY
npm run dev:api     # http://localhost:8787
npm run dev:web     # http://localhost:5173 (en otra terminal)
npm test            # plazos, plantillas, privacidad y API
```

**Proveedor del asistente:** Claude si hay `ANTHROPIC_API_KEY`; si no, Gemini si hay `GEMINI_API_KEY`; si no, **"modo básico"** (reglas por palabras clave), así el demo no se cae si falla la IA o la red. Si la IA falla a mitad del demo (cuota, bloqueo, tiempo agotado), la API pasa sola al modo básico. `/api/salud` dice cuál está activo (`ia: "claude" | "gemini" | "simulada"`). Variables, costos y qué datos van a Google: [docs/ia.md](docs/ia.md).

Para probarlo en el celular: `npm run dev:web -- --host` y abrir la IP del computador en la misma red.

## Demo (guion corto)

1. **Inicio** → escribir: *"La EPS no me da la cita con el cardiólogo hace dos meses, mi cédula es 1.144.555.666"*. La cédula sale como `[número]`: el filtro de privacidad la quita antes de enviarla.
2. El asistente pregunta si es urgente → *"Sí, es urgente"* → orientación completa → **Crear el documento: Tutela de salud** → Municipio → **Ver el documento** → **Lo entregué hoy**.
3. **Mis casos** → activar *Modo demo: adelantar un mes* → en una petición vencida aparece **"No: crear la tutela"**.
4. Tocar el **interruptor** de arriba a la derecha → modo sin conexión: el asistente se apaga y **Conoce tus derechos** sigue funcionando completo, con historietas y voz.
5. **Riesgo:** *"Reclamé por la tierra y un grupo armado me amenazó"* → la app no pregunta más, no guarda nada y muestra a dónde acudir.

## Reglas que no se negocian (investigacion/06 y 12)

- La app **no es abogado**. La IA conversa, entiende y clasifica. "Qué dice la ley", los plazos y los documentos salen de **contenido fijo** que valida un consultorio jurídico.
- **Privacidad:** cédulas, teléfonos y correos se quitan en el celular y otra vez en el servidor antes de llegar a la IA. El servidor no guarda conversaciones. **Nombre, cédula, celular y dirección se piden solo al crear el documento** (paso "Tus datos para el documento"): van impresos en el papel, nunca a la IA ni al servidor, y no se guardan en el celular. También se pueden dejar en blanco y llenar a mano. En el celular solo quedan los casos (sin datos personales ni relato) y el tema de cada búsqueda. **Borrar todo** está en Perfil.
- **Protocolo de riesgo:** ante amenazas o grupos armados, corta antes de llamar a la IA y muestra a dónde acudir.

## Desplegar

El proyecto de Vercel existente (https://miderecho-two.vercel.app) tiene como raíz `prototipo/`. `prototipo/vercel.json` instala el monorepo, construye `apps/web` y publica ese resultado; las funciones `prototipo/api/asistente.js`, `documento.js`, `plazo.js` y `salud.js` sirven el backend de `apps/api`. Las funciones de Gallego (SMS, WhatsApp, llamadas, recordatorios, ElevenLabs) siguen en la misma carpeta.

- Variables en Vercel: `ANTHROPIC_API_KEY`, o `GEMINI_API_KEY` (+ `GEMINI_ENDPOINT` si es de Vertex). Sin ninguna, el asistente usa el modo básico. Ver [docs/ia.md](docs/ia.md).
- `prototipo/package.json` (`"type": "module"`) es necesario: sin él, Vercel compila las funciones a CommonJS y fallan al cargar.

## Pendientes

- **Imágenes del Figma en alta resolución:** las de `apps/web/public/figma/` (logo y las 6 historietas) salieron de capturas a 1x. Valentina: exportarlas a 2x o 3x con el mismo nombre y reemplazarlas.
- Íconos: se usan los de Lucide (los mismos trazos del Figma) en lugar de las imágenes, para que se vean nítidos.
- Validación jurídica de plantillas, plazos y textos (lista en `investigacion/00`, sección 12.5).
- El Figma usa "tú" y las plantillas heredadas del prototipo usan "usted": unificar.
