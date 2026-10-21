# Canal telefónico: el mismo agente por llamada

Estado al 21-oct-2026: **ya existe el agente telefónico** ("MiDerecho teléfono", `agent_3901m5fd72hyedssc8h6r4gznevn`, ver `prompt-telefono.md`) y la llamada **saliente** que pide la persona desde la app (`prototipo/api/llamar.js`: ahora o agendada). Falta la cuenta de Twilio y el número: pasos exactos en `docs/llamadas-y-notificaciones.md` §2. La parte de llamadas **entrantes** y el documento por teléfono (§2, herramienta `/api/voz/documento`) sigue solo preparada. Precios de `investigacion/11-agente-de-voz.md` (§1.2, §2.2 y §5.2); reconfirmarlos el día de la compra.

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
