# MiDerecho: prototipo

App web instalable (PWA) que ayuda a hacer un **derecho de petición**, enviarlo sin viajar, seguir el plazo de respuesta y preparar la **tutela** si la entidad no responde. Funciona sin internet y lee todo en voz alta. Base: la investigación en `../investigacion/00-informe-ejecutivo.md`.

**En línea:** https://miderecho-two.vercel.app · Proyecto en Vercel: https://vercel.com/jjgg310s-projects/miderecho

## Cómo abrirla

```bash
python3 -m http.server 8080 --bind 127.0.0.1 --directory prototipo
```

Luego abrir http://127.0.0.1:8080 (en el celular: misma red y la IP del computador, o publicarla en cualquier hosting estático). En Chrome Android aparece "Instalar app".

Pruebas: `node prototipo/test-plazos.mjs`, `node prototipo/test-plantillas.mjs` y `node prototipo/api/_test-api.mjs`. Las funciones de `api/` solo corren en Vercel; con el servidor local de Python responden 501.

## Qué hace

| Pantalla | Qué hace |
|---|---|
| Clave de 4 números | Cifra los casos guardados en el celular (AES-GCM). Botón 🔒 para bloquear rápido |
| Para mí / para un vecino | Modo líder: la persona líder ayuda y el vecino decide (consentimiento) |
| Aviso de privacidad | En lenguaje claro, antes de pedir cualquier dato |
| ¿Hay peligro? | Protocolo de riesgo alto: corta el flujo, no guarda nada y muestra a dónde acudir |
| Tema → municipio → entidad | Botones grandes; 15 municipios PDET con el correo real de su alcaldía |
| Hechos | Frases plantilla con la vereda y la fecha, más texto libre opcional o dictado por voz |
| Peticiones | Opciones listas; el plazo cambia según el tipo (10, 15 o 30 días hábiles) |
| Entrega | **"Envíenla por mí"** (pide nombre y cédula y los borra al enviar) o **"La entrego yo"** (PDF con espacios en blanco, sin datos) |
| Documento | Vista previa, lectura en voz alta e imprimir o guardar en PDF |
| Mis casos | Días hábiles que faltan, con festivos colombianos calculados para cualquier año |
| Día 16 | ¿Le respondieron? → cerrar, recursos, Personería o **tutela generada** |
| ¿Su carta venta lo hace dueño? | Ruta de 3 preguntas que lleva a formalizar o a pedirle a la ANT con un derecho de petición |
| Borrar todo | Elimina casos y clave del celular |

**Documentos (desde la versión 2):** derecho de petición, tutela de salud (con medida provisional), tutela por otros derechos fundamentales, tutela por petición no respondida, impugnación del fallo, incidente de desacato, y reclamo y recurso ante la empresa de servicios públicos. Las plantillas están en `plantillas.js`, que funciona en el navegador y en Node. Análisis legal: `../investigacion/12-documentos-sin-abogado.md`.

**Agente conversacional de voz:** botón "Hablar con el asistente" (`agente-voz.js`, agente de ElevenLabs). Antes de abrir el micrófono pide consentimiento. No puede tocar por la persona "Sí, acepto", el "No" de la pregunta de peligro, ni botones de borrar o enviar. Necesita `ELEVENLABS_API_KEY` en Vercel; detalles en `../agente/README.md`.

**SMS, WhatsApp, llamadas y recordatorios:** funciones de Vercel en `api/` con Twilio y cliente en `comunicaciones.js`. Los recordatorios del plazo se programan solo si la persona los autoriza expresamente; el número queda cifrado en el servidor y el celular guarda únicamente un token para cancelarlos. Sin claves, todo corre en modo simulado. Configuración y variables: `../docs/comunicaciones.md`.

**Voz del sistema:** 🔊 lee la pantalla; **Modo voz** lee cada pantalla sola; 🎤 dicta (necesita internet). El asistente de la barra cambia de estado (reposo, hablando, alerta, éxito), con el mismo patrón que Nauti en GambaMantis.

**Modo demo** (en Mis casos): adelanta el calendario para mostrar el vencimiento y la tutela en la presentación.

## Qué está simulado

- El **envío del correo** a la alcaldía: se muestra, no se envía. Falta un proveedor de correo y su función en `api/`.
- **SMS, WhatsApp y llamadas:** el código está listo, pero sin claves de Twilio corren en modo simulado.
- **Agente de voz:** no abre hasta poner `ELEVENLABS_API_KEY` en Vercel.
- La cola **sin internet**: la petición queda en cola y se "envía" al volver la señal.

## Qué falta para producción

1. Validación jurídica de las plantillas, los plazos y las rutas (lista en `../investigacion/00`, sección 12.5).
2. Servidor para el envío por correo y los SMS, con autorización expresa y borrado inmediato.
3. Agente de voz conversacional (ElevenLabs Agents, ver `../investigacion/11`) cuando haya internet; hoy la voz es la del sistema del celular.
4. Clave más fuerte (llave segura del sistema en Android) y revisión de seguridad.
5. Verificar los correos de las alcaldías y los números de ayuda antes de usarlos.

## Archivos

`index.html` estructura · `styles.css` diseño · `app.js` pantallas y lógica · `contenido.js` textos jurídicos y municipios (lo que revisa el abogado) · `plantillas.js` documentos · `plazos.js` días hábiles y festivos · `comunicaciones.js` cliente de SMS, WhatsApp y llamadas · `agente-voz.js` asistente de voz · `api/` funciones de servidor · `sw.js` funcionamiento sin internet · `test-*.mjs` pruebas
