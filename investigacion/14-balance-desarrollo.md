# 14. Balance: lo que pedía la investigación frente a lo que hace el sistema hoy

21-oct-2026. Se cruzaron los informes 00 a 13 con el código de `main` (commit f1289de) y con la app en línea (https://miderecho-two.vercel.app). Cada función se revisó en el código, no en los README. `npm test` pasa completo. En línea se consultaron `/api/salud`, `/api/correo` y la sesión del agente de voz.

El archivo de origen de cada dato va entre paréntesis. Si una cifra no está en la investigación, se dice.

---

## 0. En pocas líneas

- **Le pegamos al corazón:** ruta, documento y seguimiento del plazo en un solo flujo. Ningún producto revisado lo hace (01, §4.5), y el dolor tiene cifra: **432.658 tutelas por derechos de petición no respondidos en 2025** (07, 13).
- **Lo más valioso:** la escalera de documentos con plazos en días hábiles, la voz, la privacidad y el protocolo de riesgo, y el funcionamiento sin internet.
- **Lo más flojo:** quien no tiene smartphone hoy no tiene cómo entrar. La línea telefónica entrante no está conectada y el **modo líder no pasó a la app nueva**. Además, el envío por correo **está cerrado en producción**: el botón "Envíenlo por mí" no aparece.
- **Lo que sobra:** cuatro canales de recordatorio, dos proveedores de IA y unas 1.600 líneas del prototipo viejo que ya no se publican.

---

## 1. Le pegamos

| Lo que pedía la investigación | Dato que lo respalda | Dónde está en el código | En línea hoy |
|---|---|---|---|
| **Seguir el plazo y decir qué sigue** ("ya le deben responder; si no, este es el paso") | 432.658 tutelas por petición en 2025, el 45-48% del total; el 73% terminó con respuesta u orden a favor (07, 13) | `packages/nucleo/src/plazos.js:32` (días hábiles con festivos, Ley 51 de 1983). `apps/web/src/lib/avisos.js:77` (3 avisos: 3 días antes, el día del vencimiento y el día siguiente). `apps/web/src/pantallas/MisCasos.jsx:173` ("¿Le respondieron?" → tutela) | Funciona. Los SMS, WhatsApp y llamadas reales solo llegan a números de prueba |
| **Plazos de 10, 15 y 30 días hábiles** según lo que se pide | Ley 1755, art. 14, y art. 62 de la Ley 4 de 1913 (00, §6) | `packages/nucleo/src/contenido.js:76` y cálculo en `Documento.jsx` | Funciona |
| **Escalera de documentos**: petición → tutela → impugnación → desacato | 12, §3 y §4 (recomendado "construir ya") | `packages/nucleo/src/plantillas.js:24`: petición, tutela por petición, tutela de salud, tutela general, impugnación (3 días), desacato y reclamo de servicios públicos | 7 documentos se pueden hacer desde la app |
| **Tutela de salud primero** | Salud es el segundo derecho más invocado: 378.895 tutelas en 2025 (13) | Tutela de salud con medida provisional y "¿Qué le niega la EPS?", incluido el transporte (`contenido.js`, `SALUD_NIEGA`) | Funciona |
| **Reclamo de servicios públicos** con silencio administrativo positivo | Es el 9% de los problemas rurales, y el 46% de quienes no actúan dice que es por demora y trámites (13). Ley 142, art. 158 | `plantillas.js` (`docReclamo`); `MisCasos.jsx:180` explica el silencio positivo | Funciona |
| **No hacer plantilla de contrato laboral** | Trabajo es el 3% de los problemas rurales (ENJ 2020) y el 83% del empleo rural es informal (13) | `apps/api/src/prompt.js`: documento "ninguno" con ruta a la Inspección de Trabajo | Funciona |
| **Radicar sin viajar, por correo** | La ley acepta "cualquier medio idóneo" (Ley 1755, art. 15). Las 15 alcaldías PDET revisadas publican correo y ninguna recibe por WhatsApp (08) | `packages/nucleo/src/directorio.js` (15 alcaldías, juzgados y ANT), `prototipo/api/correo.js`, `apps/web/src/componentes/EnvioCorreo.jsx` | **Cerrado** (ver 3.1, punto 1) |
| **Voz primero** | En lo rural, el 93,1% usa el celular para llamar y solo el 64,3% para mensajes. Analfabetismo rural del 10,4%, y en el 15,7% de los hogares rurales hay alguien que no lee (10) | Lectura en voz alta de cada pantalla (`apps/web/src/lib/voz.js`), dictado en Inicio y modo voz con ElevenLabs (`componentes/ModoVoz.jsx`, `lib/agenteVoz.js`) | El agente de voz abre sesión (probado hoy) |
| **Pocos datos y sin internet** | El 56,9% de los hogares rurales tiene internet y ~1,8 millones no (03). Un caso por WhatsApp gasta 0,33-0,41 MB (05, §2.3) | PWA con todo guardado en el celular (`vite-plugin-pwa`). Los documentos, los derechos y Mis casos funcionan sin señal | La instalación descarga **~0,72 MB comprimidos una sola vez** (medido hoy); después, armar un documento no gasta datos. El consumo del asistente con IA no está medido |
| **Celular compartido** | El 83,4% usa celular, pero solo el 65,4% tiene uno propio (03) | Casos cifrados con clave de 4 números (`apps/web/src/lib/almacen.js`); bloqueo al salir de la app (`App.jsx`); "Tiene un plazo cerca" sin decir de qué; nombre y cédula solo en el papel (`Documento.jsx:312`); **Borrar todo** también cancela los avisos del servidor (`lib/avisos.js:158`) | Funciona |
| **Nada de datos personales a la IA; la IA no redacta la ley** | Reglas 2 y 3 (00, §7). La FTC multó a DoNotPay con USD 193.000 por prometer de más (00, §2) | Filtro de cédulas, teléfonos y correos en el celular y en el servidor (`packages/nucleo/src/privacidad.js:15`). "Qué dice la ley" sale de texto fijo (`apps/api/src/orientacion.js:59`). La IA solo conversa y clasifica | Funciona (Gemini, plan gratis: ver 3.1, punto 7) |
| **Protocolo de riesgo alto** | Indepaz cuenta 1.978 líderes asesinados desde 2016 (03) | "¿Hay alguien en peligro?" antes del asistente y de cada documento (`pantallas/Peligro.jsx`). Una regla fija detecta amenazas sin esperar a la IA (`privacidad.js:23`, `apps/api/src/app.js:61`), también en la voz (`agenteVoz.js:100`) | Funciona |
| **Aviso y autorización antes de pedir datos** | Entre los competidores, solo Tuteladora tiene un paso de autorización (01, §4.8). Checklist 06, §6, puntos 1, 2 y 4 | `pantallas/Consentimiento.jsx` antes de la IA; el servidor exige la versión del aviso (`app.js:67`). Autorización por canal en los recordatorios (`componentes/Avisos.jsx`). Responsable nombrado (`contenido.js:9`). Política en historieta (`pantallas/Politica.jsx`) | Funciona |
| **SMS sin datos personales**: solo código y fecha | 00, §6 | Texto fijo armado por el servidor ("Caso 4F7K: el plazo vence el…"); se rechaza el texto libre (`prototipo/api/_avisos.js:21`) | Funciona con números de prueba |
| **Tierras: derecho de petición a la ANT** | El 9,5% de los hogares PDET ocupa la tierra de hecho (03) | Tema "Tierras" → ANT, con su correo verificado (`contenido.js:47`, `directorio.js`) | Funciona |

---

## 2. Lo que más vale para el jurado y para los usuarios

| Frente a… | Lo que hacen ellos (01, 02) | Lo que hacemos distinto |
|---|---|---|
| **Tuteladora** (Temblores) | Formulario web que genera la tutela en PDF. No hace seguimiento | 7 documentos encadenados. La app sabe qué sigue y cuándo vence cada paso, incluidos los 3 días para impugnar |
| **LegalApp** (MinJusticia) | Guías sin conexión y lectura en voz alta. App de iPhone sin actualizar desde 2019 y con 2,0 estrellas | La ruta termina en un documento listo y en un plazo vigilado, no solo en una guía |
| **WAIAS** | 85.000 COP por consulta con abogado | Gratis para la persona. Con promotores pagados, el costo estimado es de COP 55.000-62.000 por caso (00, §12.4) |
| **Sophie** (Brasil) | Cadena de recordatorios para citas | La misma cadena, aplicada a plazos legales con festivos colombianos |
| **DoNotPay** (EE. UU.) | "Abogado robot", multado | La IA no redacta la ley ni promete resultados. Dice "No somos abogados" en el aviso, y las plantillas están marcadas como borrador |

**Lo que más pesa con el jurado** (el reto pide bajo consumo de datos, Legal Design, adopción por líderes y protección de datos):

1. **Ruta + documento + plazo en un solo flujo.** Es la brecha que nadie cubre (01, §4.5) y la cifra de tutelas la respalda.
2. **Voz.** Ningún producto colombiano acepta ni responde notas de voz (00, §3). LegalApp solo lee en voz alta; nosotros, además, tenemos dictado y un agente que conversa.
3. **Privacidad como diseño, no como texto legal.** Riesgo detectado por regla fija, nombre y cédula que no se guardan, cifrado local, Borrar todo y la política en historieta. Es el eslabón más débil de la competencia (01, §4.8).
4. **Silencio administrativo positivo.** Es una regla a favor del usuario que casi nadie conoce (12), y la app la explica y la usa.
5. **Sin internet después de instalar.** Unos 0,72 MB una sola vez, frente a 0,33-0,41 MB por cada caso en un bot de WhatsApp (05).

---

## 3. Falta o está flojo

Esfuerzo: **bajo** = menos de 2 horas; **medio** = medio día; **alto** = varios días.

### 3.1 Antes del hackathon (ordenado por impacto y esfuerzo)

| # | Brecha | Dato | Esfuerzo | Qué hacer |
|---|---|---|---|---|
| 1 | **El envío por correo está cerrado en producción.** `GET /api/correo` responde `cerrado: true` (hay clave de Resend, pero no hay `CORREOS_DEMO`), y `EnvioCorreo.jsx:77` oculta el botón. En el demo no se ve el "sin viajar" | Es el eslabón 4 de la solución (08) y está en el pitch (00, §10) | Bajo (configuración) | Poner `CORREOS_DEMO` en Vercel con el correo del equipo y redesplegar. Probar un envío de punta a punta antes de presentar |
| 2 | **Quien no tiene smartphone no tiene puerta de entrada.** No hay línea entrante y no hay modo líder | El 65,4% tiene celular propio y el 93,1% lo usa para llamar (03, 10). El usuario principal decidido es el líder (00, §13) | Bajo-medio | **Modo líder mínimo:** "¿Para quién es? Para mí / Para un vecino que está conmigo", con el aviso leído al vecino. Existía en el prototipo viejo (`prototipo/app.js:224`). Ojo: en modo vecino no guardar el caso en el celular del líder, porque "el líder nunca guarda listas" (00, §6). Hoy Mis casos lo guardaría |
| 3 | **"Contratos" no tiene respuesta visible.** El reto los nombra, pero la ruta "¿Su carta venta lo hace dueño?" no está en la app nueva | El 52% de la tenencia rural tiene indicios de informalidad y la carta venta no transfiere la propiedad (09, UPRA 2020) | Bajo | El texto ya está en el núcleo (`contenido.js:79`, `CARTA`) y la pantalla existía en `prototipo/app.js:768`. Pasarla a la app nueva. Así, la respuesta del jurado sobre contratos es "ruta sin documento, con datos" |
| 4 | **Falta la voz de la gente** | Casi todo es investigación secundaria (13, §3) | Bajo (30-60 min) | Hacer las 5 a 10 llamadas con el guion de 3 preguntas (13, §4) y llevar el conteo a la presentación |
| 5 | **La transcripción del acento rural no está probada** | No hay benchmark para el español rural por teléfono (00, §12.3, D4) | Bajo (1-2 h) | Probar 10-20 audios grabados por el equipo y mostrar la tasa de error con honestidad. No encontré esa prueba en el repositorio |
| 6 | **Catálogo "Conocer mis derechos" sin Servicios públicos ni Tierras** | Servicios públicos es el 9% de los problemas rurales (ENJ) y Tierras el 10% (HiiL). El informe 13, §2, pide agregarlos | Bajo-medio (sin historietas) | Agregar las dos fichas en `packages/nucleo/src/derechos.js`. Las historietas pueden esperar |
| 7 | **La IA está en el plan gratis de Gemini**: Google puede usar lo que se escribe (la app lo advierte en cada respuesta) | Checklist 06, §6, punto 9: "sin datos personales o sin LLM" | Bajo | En el demo, usar solo datos inventados (D3). Antes de cualquier usuario real, pasar a un plan de pago o a Claude (ver 3.2) |
| 8 | **El recurso de servicios públicos no se puede abrir.** La plantilla existe (`plantillas.js`, `recurso_servicios`), pero ninguna pantalla llega a ella | Si la empresa dice que no, hay 5 días hábiles para recurrir (Ley 142, art. 154; 12, §2) | Medio | En Mis casos, para un reclamo negado, ofrecer "Preparar el recurso", como ya se hace con la impugnación |
| 9 | **El asistente tutea; el resto de la app trata de usted** | La investigación pide trato de usted (05, §5.3) | Bajo | Cambiar `apps/api/src/prompt.js` ("Tuteas"), `EnvioCorreo.jsx` y `ModoVoz.jsx`. Si cambia el aviso de voz, subir su versión |

### 3.2 Después del hackathon

| # | Brecha | Dato | Esfuerzo |
|---|---|---|---|
| 1 | **Línea telefónica entrante con devolución de llamada** ("llamada perdida y le devolvemos la llamada"). El agente telefónico y sus herramientas existen (`agente/telefono.md`, `prototipo/api/_herramientas.js`), pero falta el número de Twilio y registrar las herramientas. Con un número de EE. UU. se podría mostrar en el demo en pocas horas | El 84,1% de los rurales prefiere hacer trámites en persona o por teléfono (10). Una llamada de 9 minutos cuesta ~COP 6.600 (rango 4.800-10.000) (00, §12.4) | Medio |
| 2 | **Validación jurídica de plantillas, plazos y envío en nombre de la persona.** Todas las plantillas dicen "borrador pendiente de validación" | Lista de 7 puntos (00, §12.5). El caso DoNotPay muestra el riesgo (00, §2) | Alto (depende del consultorio) |
| 3 | **No medimos nada.** Por diseño no se guarda nada en el servidor, así que no hay cómo mostrarle impacto a quien paga | La métrica norte es peticiones con respuesta dentro del plazo por cada 100 (05, §5.6). Namati convierte cada caso en un dato para incidencia (00, §2) | Medio: conteos anónimos por municipio y tipo de documento, sin datos personales |
| 4 | **Kit y activación de líderes** (credencial con QR, volante, tarjeta de plazos, guion de radio, incentivo) | Capacitar no es activar: en Haqdarshak, de 5.077 capacitadas solo ~1.000 quedaron activas (00, §2). Presupuesto del promotor de ~COP 33.000 por caso (00, §12.4) | Material, no código. Puede que lo estén cubriendo las sesiones de la landing y de la presentación |
| 5 | **Respuesta de la alcaldía en nuestro buzón** (D2). Hoy el correo dice "Este buzón no recibe respuestas", y la respuesta va a la dirección que escriba la persona | Así, el seguimiento no depende de que la persona avise (00, §12.3) | Medio, y requiere validación legal |
| 6 | **Supervigilancia en la Personería** como alternativa a la tutela el día 16 | Es gratis y la Personería responde en 5 días hábiles (00, §12.2) | Bajo |
| 7 | **Prueba de la autorización de la IA.** Para los recordatorios reales sí se guarda (HMAC + versión del aviso); para la IA solo se verifica la versión | Decreto 1377, art. 8 (06, §6, punto 3) | Bajo |
| 8 | **Una pregunta por pantalla.** Los formularios tienen varias preguntas por paso | 05, §3.2 recomienda una por mensaje. Probar con usuarios antes de cambiar | Medio |
| 9 | **Clave de 4 números.** Se puede adivinar con el celular en la mano; el propio código lo dice (`almacen.js:27`) | Celular compartido (03) | Alto (el código propone la llave segura del sistema, como Android Keystore) |
| 10 | **Fase 2 de documentos**: acción popular para la JAC, recursos, habeas data, amparo de pobreza | 12, §2 | Alto |

---

## 4. Lo que hicimos que la investigación no pedía (posible sobre-ingeniería)

| Qué | Por qué sobra o pesa | Recomendación |
|---|---|---|
| **Cuatro canales de recordatorio** (push, SMS, WhatsApp, llamada con voz grabada) y **Web Push programado a mano** (`prototipo/api/_comun.js:229`, criptografía sin librería) | La investigación pedía SMS con código y fecha (00, §6). WhatsApp exige plantillas aprobadas por Meta y, desde el 1-oct-2026, cobra los mensajes de servicio después de 1.000 gratis al mes (00, §5) | Congelar. En el demo, mostrar un solo canal. No agregar más |
| **Dos proveedores de IA** (Claude y Gemini) más el modo básico | La IA solo clasifica (00, §7). Con un proveedor de pago y el modo básico de respaldo basta. Además, el que está activo hoy es Gemini en plan gratis, que choca con nuestro diferencial de privacidad (`docs/ia.md`: Google usa lo enviado y pide no mandar datos personales) | Quedarse con uno de pago después del hackathon y borrar el otro |
| **Llamada saliente agendada** (QStash) desde Mis casos | Solo la pide quien ya tiene la app. Vale la pena si se vuelve la **devolución de llamada** para el vecino sin smartphone (11, variante C) | Mantener y reutilizarla para el punto 1 de 3.2 |
| **Tutelas por correo al juzgado** y directorio de juzgados | La investigación cubrió el correo a las alcaldías (08), no a los juzgados. El reparto puede ir a otro juez según el Decreto 333 de 2021, marcado [validar] en `directorio.js` | Mantener, pero no mostrarlo como "probado" hasta validarlo con abogado |
| **Código muerto del prototipo viejo**: `prototipo/app.js` (856 líneas), `agente-voz.js` (257, ya no coincide con el agente) y copias de `plantillas.js`, `contenido.js` y `plazos.js` del núcleo. Unas 1.600 líneas que Vercel no publica | Confunde y se desactualiza. Ojo: ahí viven el modo líder y la ruta de la carta venta | Pasar esas dos pantallas a la app nueva (3.1, puntos 2 y 3) y después borrarlo |
| **`componentes/AvisoListo.jsx`** (60 líneas) | Ninguna pantalla lo usa | Usarlo o borrarlo |
| **Anti-abuso de producción** (Redis, topes, código por SMS para el envío abierto) | Es útil, pero se construyó antes de tener usuarios | No invertir más hasta el piloto |

**No es sobra:** la política en historieta. La investigación pedía una política de una página (06), pero la historieta es Legal Design puro y le habla al jurado.

**Decisión que conviene poder defender:** la investigación descartó la app instalable para el MVP (00, §6) por el antecedente de LegalApp. El equipo la eligió (00, §13) porque la usuaria principal es la persona líder. Ese argumento solo se sostiene si existe el modo líder (3.1, punto 2).
