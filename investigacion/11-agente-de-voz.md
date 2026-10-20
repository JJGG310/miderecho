# 11 - Agente de IA que habla (voz): canal, plataforma, diseño seguro y MVP

Fecha de la investigación: 20 de octubre de 2026. Frente: agregar al MVP (derecho de petición para campesinos de municipios PDET) un agente de IA conversacional por voz. Alcance: solo este frente. Lo jurídico de fondo está en `06-marco-legal-seguridad.md`, el formato base en `05-formato-canales-adopcion.md` y el consolidado en `00-informe-ejecutivo.md`.

**Aviso:** no soy abogado. Lo legal de este informe es investigación de apoyo, no concepto jurídico. Los puntos que dependen de un abogado quedan marcados.

**Leyenda de confianza** (la misma de los informes 05 y 06):
- **[V]** Verificado leyendo la página oficial o primaria durante esta investigación.
- **[S]** Fuente secundaria (prensa, blog, comparador, resumen de buscador). Útil, pero confirmar.
- **[NV]** No verificado: inferencia mía, conocimiento general o dato que no pude confirmar.

**Método:** unas 38 búsquedas y ~25 lecturas de página. Límites: la página de precios de OpenAI respondió 403 (usé la de `developers.openai.com`), la de precios de ConversationRelay dio 404, la documentación de guardrails de ElevenLabs no apareció y la página de IFPRI llegó vacía (dato tomado del resumen del buscador, marcado). Los precios de plataformas cambian cada trimestre: reconfirmar el día de la compra.

---

## 0. Resumen ejecutivo

**Veredicto:** sí vale la pena agregar el agente de voz, pero como **capa de conversación sobre el flujo determinista que ya existe**, no como un "chat libre con IA". El diferencial real es la **llamada telefónica normal**: la única vía que llega a los ~1,8 millones de hogares rurales sin internet y a quien solo tiene un celular básico. La evidencia internacional apunta a lo mismo: la línea gratuita captó ~34 % de los contactos virtuales de la Defensoría de Perú aun existiendo WhatsApp (sección 4).

**Recomendación en una línea:** agente en **ElevenLabs Agents** (flujo con nodos "Say" de texto fijo, nodos "Dispatch tool" que llaman a nuestro backend, voces colombianas), por **llamada telefónica con devolución de llamada** ("llamada perdida" y el sistema devuelve la llamada, propuesta mía [NV]) y como respaldo un widget web para el demo. El PDF sale del backend con plantillas validadas; a la persona le llega un **SMS con código** y lo recoge con su líder o en la Personería (o por WhatsApp si lo tiene).

**Costo por llamada de 9 minutos:** unos **USD 1,2 a 2,5** (COP 4.800 a 10.000 con 1 USD = COP 4.000, supuesto). Escenario central: USD 1,2 con devolución de llamada, USD 1,7 con número local entrante, USD 2,4 con línea 01-8000 vía Twilio. Es unas 15 a 45 veces el costo tecnológico de un caso por WhatsApp (COP 150-450) en el escenario central, pero cabe dentro de los COP 31.000 por caso del modelo de negocio (sección 5.2).

**Cinco cosas que cambian el diseño:**
1. **La transcripción (ASR) de voz rural por teléfono es el riesgo técnico número uno.** No existe benchmark neutral para español colombiano rural [NV]. La evidencia análoga es dura: en un agente de voz para campesinos de India, los modelos abiertos fallaron 50 % o más con dialecto y ruido [S], y en otro estudio la tasa de formularios completados cayó hasta 41 puntos al usar transcripciones reales en vez de perfectas [V, resumen]. Por eso el diseño usa respuestas cortas, confirmaciones y teclado (DTMF) para lo crítico.
2. **Un agente de voz con terceros contradice la regla del informe 06** ("no enviar texto libre del usuario a un LLM de terceros"), porque el audio pasa por el ASR y el LLM de la plataforma. No hay forma de evitarlo con una plataforma gestionada. Se resuelve con contrato de transmisión (Decreto 1377, arts. 24-25), modo de retención cero, datos mínimos y una conversación casi toda cerrada (sección 3.5). Para el hackathon: solo datos sintéticos.
3. **La línea 01-8000 no está garantizada como gratis para quien llama desde celular.** Una guía dice que depende del operador y del plan, y que algunas líneas no admiten llamadas desde móvil [S]. La devolución de llamada evita ese problema, pero tiene sus propias dudas (sección 1.2). No prometer "gratis" en el pitch sin verificar con operadores.
4. **El plan de ElevenLabs con "Zero Retention Mode" es solo para clientes empresariales seleccionados** [V]. En el hackathon se puede apagar el guardado de audio y poner retención en 0 días [V], pero no hay modo de retención cero. Eso decide qué se puede prometer en voz alta ("no guardamos nada") y qué no.
5. **Los metadatos de una llamada existen aunque no haya grabación.** El operador y el proveedor de telefonía guardan quién llamó y cuánto duró [NV]. Para un líder amenazado eso importa; se mitiga pero no se elimina (sección 3.5).

**Cómo se resuelven las cinco restricciones del encargo:**

| Restricción | Cómo se resuelve | Residuo de riesgo |
|---|---|---|
| (a) Meta prohíbe chatbots de IA de propósito general | El canal principal es la red telefónica normal, que no depende de Meta. En WhatsApp, el flujo sigue siendo determinista y de propósito específico. El numeral 4.7 de los términos (actualizados el 23-sep-2026) veta a los *proveedores de IA* cuando la IA es la funcionalidad principal; Meta dijo que no afecta a empresas que usan IA para atender clientes [V términos, S prensa] | Bajo-medio. Meta decide qué es "principal". Evitar presentar el producto como "asistente de IA" en la verificación del negocio |
| (b) Sin IA generativa en lo jurídico ni datos personales a LLM de terceros | El LLM solo escucha, entiende y elige un valor de una lista. Todo texto jurídico sale de nodos de texto fijo o de respuestas de nuestro backend, que el agente lee tal cual (sección 3.1) | El audio y la transcripción pasan por terceros; requiere contrato, retención cero y minimización (3.5) |
| (c) La voz puede ser dato biométrico | La Ley 1581 (art. 5) incluye los datos biométricos entre los sensibles [V]. La voz es dato personal; que sea biométrica depende de si se usa para identificar a alguien [NV, no hallé pronunciamiento de la SIC sobre voz]. Diseño: sin huella de voz, sin identificación por voz, sin clonación, sin guardar audio | Medio. Pedir concepto a un abogado |
| (d) Celular compartido y líderes amenazados | Pregunta inicial de "¿puede hablar con tranquilidad?", número de llamada con nombre neutro, SMS sin datos, sin llamadas de seguimiento salvo que la persona las pida, protocolo de riesgo alto (3.7) | El registro de llamadas del celular y los registros del operador siguen existiendo |
| (e) 43 % de hogares rurales sin internet | La llamada telefónica no usa datos. WhatsApp Calling descartado como canal principal porque sí consume datos | Costo por minuto y quién paga la llamada (1.2) |

---

## 1. Canales para el agente de voz

### 1.1 Matriz comparativa

| Canal | Qué necesita la persona | Datos móviles | Quién paga la llamada | Entrega del PDF | Privacidad | Calidad de audio para ASR | Facilidad en 48 h |
|---|---|---|---|---|---|---|---|
| **(i-a) Llamada a número local** | Cualquier celular, incluso básico | 0 | La persona (minutos de su plan) [NV el costo exacto] | Solo SMS con código | Registro de llamada en el celular y el operador; nada en un chat | Banda angosta de telefonía (8 kHz) [NV] | Media: la compra del número exige documentos [V] |
| **(i-b) Llamada a 01-8000** | Igual | 0 | Debería ser la organización, pero desde móvil puede cobrarse según operador y plan [S] | Igual | Igual | Igual | Baja: acuerdo con operador [NV] |
| **(i-c) Llamada perdida y devolución** (propuesta) | Igual | 0 | La organización (llamada saliente a móvil) | Igual | Igual, y el celular suena en la casa | Igual | Media-alta con Twilio o similar |
| **(ii) WhatsApp Business Calling** | Smartphone, WhatsApp y datos o wifi | ~0,3 a 1 MB por minuto [S]: 3 a 9 MB por llamada de 9 min | Llamadas iniciadas por el usuario: gratis para el negocio [V] | PDF en el mismo chat dentro de la ventana de 24 h [V en 05] | El chat queda en el teléfono; metadatos en Meta | Opus de banda ancha [V]: mejor que telefonía | Media: Cloud API, límite de mensajes alto, cola de aprobaciones |
| **(iii) Notas de voz de WhatsApp con IA** | Smartphone, WhatsApp y datos | ~60 KB por 30 s [V en 05] | Mensajes de servicio: ver 05 §2.2 | PDF en el mismo chat | Igual al anterior | Opus 16 kHz: mejor que PSTN, pero ruido rural [NV] | Alta (ya está en el plan) |
| **(iv) Web/app (widget de voz)** | Smartphone con navegador | Carga inicial + audio continuo [NV el consumo] | Datos de la persona | Descarga en pantalla | Depende de la plataforma | Buena (micrófono directo) | Alta: es lo más rápido para el demo |

### 1.2 Llamada telefónica normal: tres variantes

**Datos duros de telefonía en Colombia:**
- **Twilio** soporta llamadas entrantes y salientes en Colombia, usa el prefijo gratuito +571800 y **no permite llamar a servicios de emergencia** [V: guía de voz de Twilio, 2026]. La salida con identificador de llamada local es "no garantizada", y las llamadas nacionales desde números que no son de Twilio son "mejor esfuerzo" [V].
- **Números:** los locales de Twilio exigen comprobante de dirección en la localidad del prefijo; los gratuitos aceptan una dirección de cualquier parte del mundo, pero también piden comprobante [V: página regulatoria de Twilio]. **Telnyx** pide solo nombre y dirección para locales y móviles, y copia de documento o certificado de registro para los gratuitos [V]; no confirma el rango 01-8000 como tal [NV]. En ambos casos el trámite documental puede no cerrarse en 48 horas.
- **Precios Twilio Colombia por minuto (USD)** [V]: entrante local 0,0945; entrante gratuito 0,1792; saliente a móvil 0,0377; saliente a fijo 0,0700. Número local 17,50 al mes; gratuito 25,00 al mes. La página lista además un "cargo por recibir llamadas" de +14 (local) y +25 (gratuito) al mes sin aclarar si se suma o está incluido: tomar USD 17,5-31,5 y 25-50 como rango. Telnyx anuncia números locales desde USD 13,50 al mes [V].
- **Quién paga al llamar:** una guía de Xataka dice que una línea 018000 es gratis desde fijo, pero desde celular puede generar cobro según operador y plan, y que algunas no están habilitadas para móviles [S]. DPL News reportó que la CRC modificó los esquemas de remuneración de las llamadas 01 800 para promover su uso desde fijo y móvil, sin detallar quién paga qué [S, fecha no clara]. **Conclusión: [NV] que sea gratis para el usuario en todos los operadores y planes.** Hay que preguntarlo a Claro, Movistar, Tigo, WOM y a la CRC.
- **Redes viejas:** la CRC dice no haber fijado fecha de apagado del 2G; Tigo ya no tiene estaciones 2G desde enero de 2025 [S: concepto CRC 2025]. Un celular básico solo 2G podría quedar sin voz en algunas zonas [NV].

**Variante A. Número local.** Simple y barato de montar. Contra: la persona paga minutos de celular a fijo por una llamada de ~9 minutos, justo la barrera que la línea pretende quitar. En Madagascar, el servicio 3-2-1 vio que muchos colgaban en la pantalla de inicio, posible miedo al cobro [S, citado en 05 §3.1]: **lo primero que debe decir el agente es que la llamada es gratis (si lo es)**.

**Variante B. 01-8000.** Es el estándar de servicio público gratuito. Contra: costo entrante casi doble (USD 0,1792/min en Twilio), trámite con operador y la incertidumbre de cobro desde móvil. Fase de escala, con convenio de MinJusticia o la entidad pagadora.

**Variante C. Llamada perdida y devolución (propuesta mía, no verificada).** La persona marca el número y cuelga; el sistema rechaza la llamada y llama de vuelta. Cálculo: la salida a móvil cuesta USD 0,0377/min frente a USD 0,0945 de la entrada local, y recibir llamadas no consume saldo [NV, conocimiento general]. A 9 minutos son USD 0,34 de telefonía frente a USD 0,85 (local) o USD 1,61 (gratuito). Es la forma más barata de que la llamada sea gratis para la persona sin depender de un 01-8000.
Condiciones por verificar antes de prometerla:
1. Que la persona pueda marcar sin saldo. Quien no tiene saldo ni para una llamada perdida no puede usarla (los operadores tienen servicios de "llámame" que podrían ayudar [NV]).
2. Que rechazar la llamada entrante no se facture [NV].
3. Que el identificador mostrado en la devolución sea reconocible. Twilio no lo garantiza [V], y la CRC tiene medidas contra el fraude telefónico [S].
4. **Autorización:** una llamada automatizada necesita autorización del titular, según un recordatorio de la SIC [S, fecha incierta], y la SIC multó a Movistar con COP 670 millones por contactar sin permiso [S]. La llamada perdida es una solicitud expresa, pero conviene que un abogado confirme que basta como autorización.
5. Que el timbre de una llamada devuelta en una casa con celular compartido no exponga a la persona: usar franjas horarias que la persona escoja.

### 1.3 WhatsApp Business Calling API

- **Disponibilidad** [V, documentación de Meta, 2026]: las llamadas iniciadas por el usuario están disponibles donde esté la Cloud API; las iniciadas por el negocio no están disponibles en EE. UU., Canadá, Egipto, Vietnam y Nigeria, así que Colombia queda cubierta. Se necesita un número de la Cloud API (no la app Business) y, para producción, un límite diario de mensajes de al menos 2.000 destinatarios únicos [V]; 360dialog dice 1.000 [S]: hay discrepancia. Soporta SIP, y códec Opus (G.711 se agregó en marzo de 2026) [V].
- **Precio** [V]: las llamadas iniciadas por el usuario son gratis; las iniciadas por el negocio se cobran por minuto en pulsos de 6 segundos, según país y volumen. Hay tarifas en COP desde el 1-abr-2026, pero **no obtuve la cifra por minuto para Colombia** [NV].
- **Reglas de permiso para llamar al usuario:** 1 solicitud de permiso por día y 2 por semana por pareja negocio-usuario; dos llamadas sin respuesta disparan un aviso y cuatro revocan el permiso [V]. La bitácora de cambios habla de 100 llamadas por usuario al día desde diciembre de 2025, lo que contradice lo anterior [V, conflicto].
- **Reglas de IA:** los términos de la plataforma (última actualización 23-sep-2026, sección 4.7) prohíben a los proveedores de IA, incluidos modelos de lenguaje y asistentes de propósito general, usar la plataforma cuando eso es la funcionalidad principal según Meta, y prohíben usar datos de la plataforma, aun anonimizados, para entrenar otros modelos [V]. La documentación de llamadas no trata reglas de IA ni grabación [V]. Meta dijo a TechCrunch que no afecta a empresas que usan IA para atender clientes [S].
- **Pros:** ventana de 24 h abierta por la llamada para mandar el PDF en el mismo chat [V en 05]; audio de mejor calidad; un solo número para bot y voz.
- **Contras:** exige smartphone, WhatsApp y datos (3 a 9 MB por llamada de 9 minutos según estimaciones no oficiales [S]), lo que **no sirve al 43 % sin internet**; deja rastro en el teléfono compartido; depende de Meta (cambios de tarifa, de política y de límites).
- **Veredicto:** opcional en la Fase 2, como alternativa para quien ya tiene datos. No es el canal principal.

### 1.4 Notas de voz de WhatsApp procesadas por IA

Ya están en el plan base (05 §3.4 y 00 §9). La IA transcribe en memoria, clasifica y el bot responde con audio pregrabado o sintetizado. Transcripción en tiempo real a USD 0,017 por minuto en OpenAI [V], es decir, ~USD 0,009 por una nota de 30 s. Alternativa para no mandar audio a terceros: Whisper alojado por nosotros (opción B del informe 00). Aquí el "habla" es asincrónico, no una conversación. Ventaja legal: sigue siendo un flujo con botones, así que encaja en la política de Meta. Se mantiene como capa de bajo costo, no como "agente de voz".

### 1.5 Web o app con voz

El widget de ElevenLabs o similar permite hablar desde el navegador. Es lo más rápido para el demo y sirve como respaldo si falla la telefonía en el escenario. También sirve para el celular o tableta del **líder** o de la Personería (modo asistido). No resuelve el problema de la persona sin internet. El consumo de datos del audio continuo no lo medí [NV].

### 1.6 Veredicto por etapa

| Etapa | Canal de voz | Por qué |
|---|---|---|
| Hackathon (48 h) | Widget web + un número de prueba (probablemente de EE. UU.) en la plataforma; devolución de llamada si da el tiempo | Los números colombianos exigen documentos; el widget no falla por telefonía |
| Piloto (3 municipios) | Número local con **devolución de llamada**; notas de voz de WhatsApp como capa de bajo costo | Llega a celulares básicos sin cobrar a la persona; costo controlado |
| Escala | 01-8000 con convenio de operador y entidad pagadora; WhatsApp Calling opcional | Estándar de servicio público, solo cuando haya quien lo pague |

---

## 2. Plataformas para un MVP de hackathon

### 2.1 Tabla resumen

| Plataforma | Costo plataforma por minuto | Todo incluido sin telefonía (aprox.) | Control del flujo | Retención / residencia | Telefonía Colombia | Facilidad en 48 h |
|---|---|---|---|---|---|---|
| **ElevenLabs Agents** | USD 0,08 en todos los planes (burst 0,16) [V]; LLM aparte | 0,08 a 0,125 [S el rango del LLM] | Flujos con nodos Say (texto literal), Dispatch tool (llamada garantizada), aristas por expresión (deterministas) [V] | Apagar audio y retención 0 días [V]; modo de retención cero solo empresarial [V]; residencia EE. UU. y UE [V] | Integración nativa con Twilio y troncal SIP; sin cargo propio de telefonía [V] | **Alta** |
| **Retell AI** | Voz 0,055 + LLM 0,003-0,064 + TTS 0,015-0,10 [V]; total típico 0,07-0,31 | 0,07 a 0,31 | Flujo por nodos, "más control pero no 100 % determinista" [V] | Retención personalizada solo en plan empresarial [V] | Troncal SIP propia sin cargo; en Latinoamérica solo lista México [V] | Alta-media |
| **Vapi** | 0,05 [V] + STT ~0,01 + LLM 0,008-0,045 + TTS 0,015-0,024 [V] | 0,08 a 0,13 | Los Workflows se retiraron el 18-ago-2026; el reemplazo son Squads con traspasos [S] | ZDR incluido con cualquier paquete de éxito (Core desde USD 29/mes) según su página [V]; un blog dice USD 1.000/mes [S, conflicto]; regiones no indicadas [V] | Telefonía aparte (Twilio, Telnyx, Vonage) [V] | Media |
| **OpenAI Realtime** | Audio por tokens: USD 32/64 por millón (modelo grande), 10/20 (mini) [V] | 0,06-0,11 grande, 0,02-0,05 mini [S estimación de terceros] | Total, pero hay que programar todo (estado, DTMF, transferencia) | ZDR: no verificado [NV] | SIP soportado según terceros [S] | Media |
| **Twilio Voice + ConversationRelay** | Voz: tarifas de Colombia arriba [V]; ConversationRelay: precio no obtenido [NV] | n/d | **Máximo**: el servidor es nuestro; se filtra el texto antes del LLM [V descripción] | Twilio no graba salvo que se active [NV]; STT Google o Deepgram, TTS Google, Amazon o ElevenLabs [V] | Números locales y gratuitos de Colombia [V] | Media-baja |
| **Bland AI** | Start 0,14; Build 0,12 + USD 299/mes; Scale 0,11 + USD 499/mes [S, sep-2026] | 0,11 a 0,14+ | No evaluado | Sin datos de español, LatAm ni residencia [NV] | Aparte | Media |

### 2.2 Ficha por plataforma

**ElevenLabs Agents (recomendada para el hackathon).**
- *Control:* el constructor visual de flujos tiene nodos **Say** (el agente dice un texto literal o uno generado por el LLM a partir de una descripción: usar siempre literal), **Dispatch tool** (ejecuta una herramienta con garantía de que se llama, a diferencia de las herramientas dentro de un subagente, con salidas de éxito y falla), **Update state**, transferencia a otro agente o a un número, y fin [V]. Las aristas pueden ser incondicionales, por expresión sobre variables (deterministas) o por condición de lenguaje natural evaluada por el LLM (la única no determinista) [V]. Cada nodo puede activar o desactivar herramientas y base de conocimiento, de modo que el agente solo ve lo que toca en ese paso [V]. La documentación habla de pruebas automáticas de agentes (llamadas a herramientas, traspasos, flujos, guardrails) [S]. La lista de herramientas de este entorno incluye `agents_update_guardrails`, lo que confirma que existe configuración de guardrails; no leí su detalle [NV].
- *Privacidad:* se puede apagar el guardado de audio y poner la retención en 0 días ("máxima privacidad") [V]. La redacción automática de datos sensibles en transcripción y audio es solo empresarial [V]. **Modo de retención cero**: solo "clientes empresariales seleccionados", se activa por agente, permite LLM de Gemini, Claude, OpenAI (solo con residencia UE o EE. UU.) y Qwen, y **no admite MCP** [V]. Residencia de datos en EE. UU. y UE; el procesamiento puede salir de la región por soporte o moderación [V]. No encontré región para Latinoamérica [NV].
- *Precio:* plan Creator USD 11/mes (275 min), Pro USD 99 (1.238 min), Business USD 990 (12.375 min); minuto adicional USD 0,08; llamadas por encima de la concurrencia, USD 0,16; texto, USD 0,003 por mensaje; sin cargo de telefonía de su parte [V]. Hay un programa de subvención para startups con 12 meses de uso [V; elegibilidad NV].
- *Voz:* la biblioteca tiene al menos 25 voces con acento colombiano para uso conversacional [V: listado desde el conector de ElevenLabs de esta sesión, 20-oct-2026], incluida una con acento andino nariñense (Pasto) descrita como apta para contenido jurídico y diálogos cotidianos. No escuché las muestras: calidad [NV]. Licencia comercial de cada voz de la biblioteca [NV].
- *ASR:* usa un modelo de transcripción afinado que la documentación no nombra [V]. Escuchar y medir (2.3).
- *Pegas:* sin retención cero en el hackathon; recepción de teclado telefónico (DTMF) del usuario no confirmada en la documentación que leí [NV] (la herramienta de tonos del teclado que figura en el conector es para enviar tonos). Probar esto primero.

**Retell AI (plan B).** Voz USD 0,055/min, LLM de USD 0,0032 (GPT 4.1 nano) a USD 0,064 (Claude 5 Sonnet, el recomendado en su página), TTS USD 0,015 con voces propias o de Cartesia y similares, y USD 0,04-0,10 con ElevenLabs; telefonía USD 0,015/min y troncal SIP propia sin cargo; 20 llamadas concurrentes gratis; USD 10 de crédito; ejemplo de la propia página: USD 0,11/min [V]. Su documentación aconseja empezar con un solo prompt y pasar a flujo por nodos cuando haga falta control o cumplimiento, aclarando que el flujo no hace todo determinista [V]. Los agentes "multi-prompt" quedan descontinuados (no se podrán crear desde el 15-dic-2026) [V]. En un estudio con 500 llamadas por plataforma de marzo de 2026 tuvo la menor latencia mediana entre Vapi, Retell y Bland [S, afiliación del estudio no verificada].

**Vapi.** Tarifa de alojamiento USD 0,05/min más modelos a costo; ejemplo de su página: 1.000 minutos al mes cuestan USD 82-129 [V]. Sus Workflows dejaron de ejecutarse el 18-ago-2026 y el reemplazo son Squads (miembros con herramientas de traspaso) [S]; es cambio reciente, así que hay documentación mezclada. El ZDR figura incluido con cualquier paquete de éxito en su página [V], pero un blog lo cuenta a USD 1.000 al mes [S]: pedir cotización. HIPAA, USD 2.000 al mes [V]. Menor ajuste para "texto fijo garantizado".

**OpenAI Realtime.** Modelo grande: USD 32 por millón de tokens de audio de entrada y USD 64 de salida; mini: USD 10 y USD 20; entrada en caché USD 0,40 y 0,30; transcripción en vivo USD 0,017/min [V]. Estimación de terceros: USD 0,06-0,11/min (grande) y USD 0,02-0,05/min (mini) con caché [S]. Es el más barato por minuto y el de menor latencia en un ranking abierto (~1,1-1,25 s) [S], pero hay que construir el orquestador, el teclado, las transferencias y el manejo de la llamada. Retención cero y calidad en español colombiano rural: [NV].

**Twilio Voice + ConversationRelay.** Twilio maneja la telefonía y la voz-a-texto y texto-a-voz, y manda texto por WebSocket a un servidor propio [V descripción]. STT con Google o Deepgram (por defecto Deepgram); TTS con Google, Amazon o ElevenLabs [V]. Voces en español vistas: es-MX y es-US; **es-CO no confirmado** [S]. Mayor control (un filtro nuestro puede quitar números largos y nombres antes de que el texto llegue al LLM, y el LLM nunca ve el audio), pero más código. Candidata para el piloto si el modo de retención cero de la plataforma gestionada no se consigue.

**Bland.** Orientada a llamadas de ventas salientes en EE. UU. [NV]; subió precios en diciembre de 2025; no encontré datos de español, residencia ni retención. No recomendada para este caso.

### 2.3 Español colombiano y acentos rurales: lo que sí y no se sabe

- **No existe un benchmark neutral de reconocimiento de voz para español colombiano rural por teléfono** [NV]. Mi búsqueda solo devolvió cifras de proveedor sobre conjuntos limpios: ElevenLabs Scribe v1 3,1 % de error de palabras en FLEURS y 5,5 % en Common Voice [S]; Whisper ~3-6 % en español limpio [S]. Esas cifras no sirven para una llamada de 8 kHz con ruido de finca.
- **Deepgram Nova-3 y Nova-2** soportan `es` y `es-419` (español latinoamericano), **no `es-CO`**; no listan modelo de telefonía para español (el `phonecall` es solo inglés) [V].
- **Evidencia análoga** (no es español): en un agente de voz que llama a campesinos telugu, los modelos de código abierto tuvieron 50 % o más de error por dialecto, jerga y ruido [S: resumen de IFPRI, abril 2026; no pude leer la página]. En el estudio de FormBharo (agente de voz en hindi para formularios en zonas rurales de India), la tasa de formularios completados cae hasta ~41 puntos cuando el LLM recibe transcripciones reales y no perfectas, y los controles basados en reglas recuperan gran parte de los errores [V: resumen de arXiv 2608.06027, 2026]. Los pilotos de asesoría agrícola con IA reportan que mantener una respuesta por debajo de 5 segundos es difícil con ASR de pocos recursos [V: arXiv 2601.11537, 2025]. El español es un idioma de muchos recursos, así que la cifra será menor, pero sin medida local no hay base.
- **Banda angosta:** un foro técnico sostiene que pasar de 8 kHz a 16 kHz mejora poco con buenos modelos; el ruido y la pérdida de paquetes pesan más [S, antiguo].
- **Prueba que hay que hacer en la primera mitad del hackathon:** 20-30 audios de llamadas reales (grabados por el equipo con un celular básico, ruido de calle o campo, acento de varias regiones, nombres de vereda y fechas) contra 2 o 3 configuraciones de ASR (la de la plataforma, Deepgram `es-419` y Whisper). Medir **aciertos de la variable que importa** (tema, entidad, mes), no el porcentaje de error de palabras.
- **Voz de salida (TTS):** ElevenLabs tiene muchas voces con acento colombiano (arriba) [V]. Cartesia soporta español; no confirmé voz colombiana [S]. Twilio ConversationRelay solo mostró es-MX y es-US [S]. En 05 §5.3 se recomendó voz humana grabada, no robótica: con un agente, la voz es sintética, así que **hay que decir que es una máquina** (3.3) y probar la voz con miembros de la comunidad. Clonar la voz de un promotor real necesitaría su autorización y plantea el problema de dato biométrico: evitarlo.

### 2.4 Latencia

No hay un benchmark independiente que compare estas plataformas con el mismo método. Datos disponibles, todos con afiliación o método dudoso [S]: un ranking abierto de mayo de 2026 pone a OpenAI Realtime y Retell en ~1,1-1,25 s, ElevenLabs ~2,2 s y Vapi ~2,75 s (sin unidades ni tamaño de muestra declarados); Telnyx publica 118 ms de ida y vuelta de red frente a 161 ms de Twilio (no es latencia de extremo a extremo). La regla práctica de los especialistas: menos de 800 ms se siente humano y más de 1,2 s suena a IVR viejo. En una persona mayor de campo, una pausa de 2 s puede interpretarse como que la línea se cayó: el agente debe decir "un momento" mientras consulta al backend. Los servidores de estas plataformas están en EE. UU. o UE, así que Colombia añade tiempo de ida y vuelta [NV]. **Medir en el sitio del demo.**

### 2.5 Veredicto de plataforma

1. **Hackathon:** ElevenLabs Agents. Es la única que combina nodos de texto fijo, herramientas garantizadas, aristas deterministas, voces colombianas, integración nativa con Twilio y widget web, todo configurable sin escribir un orquestador. Alternativa si falla: Retell (más barato en conjunto, flujo por nodos).
2. **Piloto:** decidir con la prueba de ASR y con una cotización de retención cero (ElevenLabs empresarial, Vapi Core o Twilio ConversationRelay con servidor propio).
3. Descartadas por ahora: Bland (sin datos de encaje) y OpenAI Realtime puro (más código para un equipo de 48 h).

---

## 3. Cómo hacer un agente de voz seguro para lo legal

### 3.1 Principio: el LLM conversa y clasifica; el backend decide y redacta

```
Persona (celular básico)
   |  llamada telefónica
   v
Telefonía (Twilio / Telnyx)           sin grabación; registro mínimo de la llamada
   |
   v
Plataforma de voz: ASR -> flujo de nodos -> TTS
   |  [Say] texto fijo validado  (saludo, aviso de IA, consentimiento, límites, cierre)
   |  [Subagente LLM acotado]    SOLO elige un valor de una lista cerrada
   |  [Dispatch tool] ---------- HTTPS ---------->  Backend propio (el mismo del bot de WhatsApp)
   |                                                 classify_route(variables)  -> id de plantilla + texto aprobado
   |                                                 compute_deadline(fecha,tipo) -> fecha con festivos
   |                                                 generate_document(variables) -> PDF con campos en blanco + código
   |                                                 send_sms(código)            -> sin tildes, sin datos personales
   |                                                 log_event(tipo)             -> sin contenido
   v
Entrega: SMS con código -> líder (modo asistido) o Personería imprime; o PDF por WhatsApp si lo pide
```

Regla de oro: **todo lo que el agente dice con contenido jurídico viene de un nodo Say o de la respuesta de una herramienta, y se lee textualmente.** El LLM nunca redacta una frase sobre derechos, plazos o procedimientos. Esto aplica la opción A del informe 00 (hechos armados con opciones y frases plantilla, nombre y cédula en blanco).

| Pregunta | Quién la responde | Cómo |
|---|---|---|
| ¿Qué quiso decir la persona? | LLM acotado | Elige un valor de una lista (tema, entidad, desde cuándo) o "no entendí" |
| ¿Qué ruta aplica y qué plantilla? | Backend | Tabla de decisión validada por consultorio jurídico |
| ¿Qué dice el texto legal? | Nodo Say o texto devuelto por el backend | Literal, versionado, con fecha de verificación |
| ¿Cuándo vence el plazo? | Backend | Calendario de festivos; 15 días hábiles, 10 si piden documentos, 30 si es consulta (00 §6) |
| ¿Hay riesgo alto? | Reglas fijas + pregunta directa + confirmación | Rama aparte (3.7) |
| ¿Es válido lo que entendió el agente? | La persona | Confirmación con tecla (1 sí, 2 no) |

Soporte en la evidencia: FormBharo combina LLM con **validación y control de flujo por reglas** y logra que modelos pequeños igualen o superen a los grandes en completar formularios [V, resumen]; Farm Vaidya limita las respuestas a contenidos verificados de universidades y gobierno [S]; el chatbot MyCity de Nueva York dio respuestas que llevaban a infringir la ley y la nueva administración lo desmontó en 2026 [V: The Markup]. En un agente de voz no se puede filtrar la salida a posteriori como en texto (la voz sale en tiempo real), así que **la prevención tiene que estar en el diseño, no en un filtro**.

### 3.2 Capas de protección (defensa en profundidad)

1. **Diseño:** el LLM solo clasifica; el contenido legal es de plantilla (arriba).
2. **Instrucciones:** lista de temas permitidos; si la herramienta no devolvió el texto, el agente no lo dice; respuesta fija para todo lo demás: "No puedo orientarle en eso. Puede acudir a la Personería o a un consultorio jurídico."
3. **Guardrails de la plataforma:** configurar los que ofrezca (ElevenLabs tiene configuración de guardrails; el detalle no lo pude leer [NV]).
4. **Pruebas adversariales antes del demo:** 30 a 50 preguntas trampa ("¿usted es abogado?", "¿si demando a la EPS gano?", "¿esto me sirve para una tutela?", "dígame qué hago si me amenazan", intentos de que ignore las reglas). Usar las pruebas automáticas de la plataforma.
5. **Medición sin guardar contenido:** con retención cero no se puede auditar conversaciones. Es un **intercambio real entre privacidad y auditoría**. Salida: auditar solo llamadas de prueba del equipo (sintéticas), y en producción medir con contadores (eventos por rama, pregunta final "¿le sirvió? 1 sí, 2 no").

**Frases que el agente nunca debe decir:** "soy abogado/a" o "asesor jurídico"; "le garantizo", "seguro le responden", "va a ganar", "tiene derecho a..." (salvo en texto aprobado); "le recomiendo demandar"; "esto reemplaza a un abogado"; "su caso es...". Nunca debe decir que es una persona: **siempre se presenta como asistente automático** (Decreto 196 de 1971, ver 06 §2.1). No encontré una norma colombiana vigente que obligue a avisar que se habla con una IA; hay proyectos de ley en trámite (043 de 2025 Senado, 324 de 2025 Cámara; 025 de 2026 Cámara) [S]; lo hacemos por ética y confianza.

### 3.3 Consentimiento por voz

El art. 12 de la Ley 1581 exige informar, al pedir la autorización, el tratamiento y su finalidad, los derechos del titular, quién es el responsable, y que es **facultativo responder preguntas sobre datos sensibles**; también hay que guardar prueba [V]. El art. 6 prohíbe tratar datos sensibles salvo excepciones, entre ellas la autorización explícita [V], y el art. 5 incluye los biométricos [V].

Guion de consentimiento (≈25 s), con la regla de Madagascar (decir primero que es gratis y pocas opciones):
- Primero: gratuidad (solo si es verdad: devolución de llamada o línea gratuita confirmada).
- Segundo: quién es el responsable (organización y un teléfono), para qué se usa la llamada, que no se pide cédula ni dirección, y que lo sensible (si es víctima, etnia, a qué organización pertenece) es opcional.
- Tercero: **tecla 1 para aceptar, 2 para no**. Preferir la tecla a "sí" hablado: deja evidencia clara y no depende del ASR. Si la plataforma no recibe teclas [NV], pedir "diga sí acepto" y repetir la respuesta antes de seguir.
- Cuarto: tecla 9 para escuchar la política completa; tecla asterisco en cualquier momento para borrar todo y colgar.
- Se guarda solo: HMAC del número, fecha-hora, versión del aviso y respuesta (clase P2 de 06 §5.2). No se guarda el audio de la aceptación.

Revisar con abogado: si una aceptación por tecla es suficiente como autorización previa, expresa e informada, y la redacción final del aviso de voz.

### 3.4 No grabar, borrar y qué ve cada tercero

| Capa | Qué ve | Cómo minimizar |
|---|---|---|
| Operador de telefonía | Número que llama, hora, duración [NV] | No se puede evitar; usar nombre de contacto neutro |
| Proveedor de telefonía (Twilio, Telnyx) | Igual, más el audio en tránsito | No activar grabación (Twilio no graba por defecto [NV]); revisar la consola |
| Plataforma de voz | Audio, transcripción, a veces guardados | Apagar guardado de audio, retención 0 días [V]; modo de retención cero si se contrata [V]; sin análisis ni "memoria" |
| LLM | Transcripción de lo que la persona dice | Modelos con retención cero; en ElevenLabs con retención cero se permiten Gemini, Claude y OpenAI (este último solo con residencia UE o EE. UU.) [V] |
| Nuestro backend | Variables (tema, entidad, fecha), código, HMAC | TTL; sin relato; sin cédula |

Contrato de transmisión con cada encargado (Decreto 1377, art. 25) y mini estudio de impacto de privacidad actualizado con la voz (06 §5.7 y Circular 002/2024 lineamiento IV). Que EE. UU. tenga nivel adecuado de protección [NV, 06 §1.5].

Sobre biometría: no se usa la voz para identificar a nadie, no se crean huellas de voz ni se activa reconocimiento de hablante, y no se clona ninguna voz. La SIC viene actuando con dureza sobre biometría (cierre de World Foundation en 2026 por captura de iris con consentimiento no libre, prohibición de exigir biometría en conjuntos residenciales, multa a Mercado Libre) [S]; no hay un pronunciamiento sobre voz [NV].

**Registro de llamadas del celular:** a diferencia de un chat de WhatsApp, una llamada no deja texto en el teléfono, pero sí un registro con el número. Nombre del número: neutro ("Línea Vereda" o similar), no "Derechos" ni "Justicia".

### 3.5 La contradicción con la regla "nada de datos personales a un LLM de terceros"

Con una plataforma gestionada, el audio llega al proveedor de ASR y la transcripción al LLM. Opciones, de más a menos privada:
1. **Solo teclado (DTMF), sin IA**, para las partes sensibles: es un IVR clásico. Sin ASR, sin LLM.
2. **Pipeline propio** (ConversationRelay): el LLM recibe solo texto filtrado (se eliminan secuencias de 6 o más dígitos), nunca el audio. El nombre propio no se filtra de forma confiable.
3. **Plataforma gestionada con retención cero**, contrato de transmisión y minimización.

**Recomendación:** modelo híbrido. La conversación abierta se limita a **1 o 2 turnos** ("cuénteme en una frase qué pasó") y todo lo demás se hace con preguntas cerradas y teclas. Las instrucciones piden no decir nombre, cédula ni dirección; si la persona los dice, el agente los ignora y vuelve al guion. En el hackathon: datos sintéticos, aviso en pantalla de que es un demo.

### 3.6 Cédula y datos personales por voz

- **No se pide la cédula, ni el nombre, ni la dirección por voz.** Salen en blanco en el PDF y la persona los escribe a mano (06 §5.3).
- Para enviar el SMS o el PDF hace falta un número de teléfono: en la llamada ya llega el número de origen. Si la persona quiere el PDF en otro WhatsApp (por ejemplo, el de un familiar), lo marca con el teclado y se guarda solo en memoria hasta enviarlo.
- Un número de WhatsApp que recibe un PDF puede estar en un celular compartido: el PDF y el SMS no deben decir tema ni nombre.

### 3.7 Protocolo de riesgo alto (amenazas)

Disparadores: (a) pregunta directa en el tercer turno ("¿hay alguien en peligro hoy, o le han amenazado por reclamar?"); (b) la clasificación del LLM detecta palabras de la lista construida con las organizaciones aliadas (amenaza, grupo armado, "me van a matar", desplazamiento, seguimiento); (c) la tecla 9 en cualquier momento.
**Cuidado con falsos positivos:** "me amenazaron con cortarme el agua" no es riesgo físico. Ante la duda, pregunta de confirmación: "¿Se refiere a una amenaza contra usted o su familia? Marque 1 si sí, 2 si no."

Al activarse:
1. El agente deja de preguntar y **no vuelve a llamar herramientas salvo el registro anónimo del evento**. No se genera documento con el hecho.
2. Texto fijo, corto: reconoce que es serio, dice que no se guardará lo contado, da los datos de ayuda y ofrece comunicar a la persona con un humano.
3. **No colgar de golpe** (la persona puede estar en una situación difícil): se le ofrece la transferencia o el número, se repite una vez y luego se termina la llamada.
4. Transferencia en caliente solo con un aliado que haya aceptado (Personería, Defensoría, Programa Somos Defensores). La transferencia revela el número de la persona: pedir tecla 1 para aceptar.
5. Números: Somos Defensores (proteccion@somosdefensores.org, tel. (057 1) 2814010 o 2813048 según su sitio) [V en 06 §4.4]. El número de emergencias (123) y los de líneas de protección **deben verificarse con los aliados antes de grabarlos en el guion** [NV].
6. Entrenar al equipo: un agente automatizado no sustituye el vínculo de confianza con el líder; no prometer protección.

### 3.8 Cómo se entrega el documento tras la llamada

| Opción | Cómo funciona | Para quién | Costo | Riesgo |
|---|---|---|---|---|
| **A. PDF por WhatsApp** | La persona marca un número de WhatsApp con el teclado; el bot manda el PDF (plantilla utility) | Tiene smartphone con WhatsApp | ~USD 0,0008 por plantilla [S] | PDF en chat compartido: sin tema ni nombre en el texto |
| **B. SMS con código** | "Peticion 4F7K lista. Retirela con su lider o en la Personeria." (sin tildes) | Cualquier celular | USD 0,0592 por segmento en Colombia (Twilio) [V en 05] | SMS sin cifrar: nada sensible |
| **C. Lectura en la llamada** | El agente lee en 2 o 3 frases lo que pide la petición | Todos | Ya incluido en la llamada | Poca memoria: sirve de apoyo, no de documento |
| **D. Recordatorio del plazo** | SMS o llamada corta cuando se acerca la fecha ("¿le respondieron? 1 sí, 2 no") | Quien lo pida | SMS ~USD 0,06 | Solo con autorización expresa y franja horaria elegida |

Recomendación: **B + C** como base, **A** si hay WhatsApp, **D** solo si la persona lo pide. El código se canjea en el **modo líder** (el bot de WhatsApp o la PWA del líder o la Personería): la persona dice o muestra su código, el líder o el funcionario lo escribe, el sistema genera el PDF y el audio que lo lee, y lo borra. Para esto el código debe sobrevivir más de 24 h (a veces un día de camino hasta la Personería): proponer **TTL de 72 h con solo variables no sensibles** (tema, entidad, fecha, opciones), sin relato ni datos personales. Es una excepción al TTL de 24 h de 06 §5.2: validar con quien lidere privacidad.

### 3.9 Pruebas mínimas

| Prueba | Qué se mide | Meta orientativa [NV] |
|---|---|---|
| ASR con 20-30 audios de teléfono | Aciertos de las variables clave (tema, entidad, mes) | ≥ 90 % después de la confirmación con tecla |
| Adversarial (30-50 preguntas) | Veces que dice algo prohibido | 0 |
| Riesgo alto | Detecta y deriva sin generar documento | 100 % en los casos del guion; pocos falsos positivos |
| Privacidad | No hay grabación en la telefonía ni en la plataforma; el asterisco borra todo | Verificación visual en las consolas |
| Latencia en el sitio del demo | Tiempo entre fin de frase y respuesta | < 1,5 s con aviso de espera si es mayor |
| Comprensión | 5 personas de la comunidad escuchan el aviso y repiten qué aceptan | La mayoría lo explica con sus palabras |

---

## 4. Evidencia: voz e IVR para justicia y servicios públicos

### 4.1 Líneas de voz para acceso a la justicia

| Caso | Qué es | Resultado | Lo que enseña | Confianza |
|---|---|---|---|---|
| **EmpowerLine (Malawi, Gender and Justice Unit)** | Línea gratuita IVR (marcación 4285) con información legal, rutas de denuncia y apoyo a sobrevivientes de violencia de género, anónima, en cuatro idiomas, más una app. Lanzada en abril de 2025 | Más de 2.859 usuarios en 2025; amplían idiomas vernáculos para no excluir por alfabetización y lengua. **Sin evaluación de resultados: no hay datos de comprensión, satisfacción ni uso por mujeres rurales** | Un IVR anónimo y gratuito es viable en un país de baja conectividad, pero el dato publicado es de alcance, no de efecto | [V] https://genderandjustice.org/?p=5767 |
| **Tele-Law (India)** | Un facilitador en un centro comunitario conecta por video o teléfono con un abogado del panel | 4,29 millones de mujeres atendidas (39,4 % del total; 33.866 emprendedoras de aldea; 734 abogados del panel, 300 mujeres) según respuesta del gobierno al Parlamento del 13-mar-2025. Monitoreo interno, sin evaluación independiente | Teléfono + intermediario local; la mujer facilitadora ayuda a que las mujeres usen el servicio | [V] fuente primaria, cifras de autor interesado |
| **Línea gratuita de la Defensoría del Pueblo de Perú (0800-15170)** | Orientación y quejas; desde fines de 2023 abierta hasta medianoche todos los días, además de WhatsApp | Entre el 1-jul-2022 y el 18-sep-2023, los canales virtuales recibieron 55.703 consultas y quejas, y **más de 19.000 (34 %) llegaron por la línea gratuita** | Aun con WhatsApp, la línea gratuita capta un tercio de los contactos. No es IA | [V] nota oficial gob.pe |
| **Citizens Advice (Reino Unido)** | (a) Escocia: asistente de voz que enruta a quien llama a la oficina local. (b) Inglaterra y Gales: Caddy, IA generativa para los asesores (no para el cliente), en 6 oficinas. (c) 2026: informe que pide "derecho a un humano" en servicios esenciales | (a) El proveedor dice 100 % de llamadas atendidas y 30 s de resolución; un directivo dice que la espera para conectar bajó a menos de un minuto y los costos de ~GBP 500.000 a menos de GBP 30.000 [S, autodeclarado]. (c) Pide que quien necesite un humano lo tenga: los chatbots pueden ser "un bloqueo" y crear servicio de dos niveles [S, no leí el informe] | Voz para enrutar y apoyar al asesor funciona; sustituir al humano en servicios esenciales genera rechazo | [S] |
| **Viamo 3-2-1 (Madagascar)** | IVR gratuito sobre Airtel | Muchos colgaban en la pantalla de inicio; quitar opciones aumentó 8 % los usuarios activos | Pocas opciones, decir que es gratis, camino único por defecto | [S] (ver 05 §3.1) |

### 4.2 Agentes de voz con IA en servicios públicos de Latinoamérica

- **Bogotá, Línea 195:** la Alcaldía dice que el modelo "integra reconocimiento automático de voz y procesamiento de lenguaje natural", impulsado con IA, y que desde su implementación el abandono de llamadas bajó de 7,9 % a 2,26 % [V: página de la Alcaldía]. La página no menciona IA generativa ni un agente llamado "Alex"; un medio especializado habla de un agente de voz con IA generativa que atiende hasta 1.000 llamadas simultáneas [S, no corroborado].
- **México, Ventanilla 24/7:** agente de IA del gobierno federal para trámites y dudas, desarrollado con capacidades propias; la prensa advierte riesgos de privacidad por datos sensibles como la CURP [S].
- **MinTIC Colombia, Robi y clasificación de PQR:** asistente de chat y modelos para clasificar peticiones, quejas y reclamos [S]. Es lo más cercano a nuestro tema, y es texto.
- **Hong Kong, línea 1823:** en agosto de 2026 se anunció voz-a-texto para reducir el tiempo de procesamiento después de la llamada en ~15 % [S].
- **No encontré** evaluaciones independientes, quejas formales ni retrocesos de agentes de voz con IA en servicios públicos latinoamericanos durante 2025-2026 [NV]. La ausencia de datos no es ausencia de problemas.

### 4.3 Voz con IA y población rural de baja alfabetización

- **Iniciativa AIEP (Kenia y Bihar, 2025):** cinco prototipos de asesoría agrícola con voz (IVR, WhatsApp, app) y LLM con recuperación sobre contenido curado; estudio con 800 agricultores, NPS ~60; los problemas fueron latencia (difícil bajar de 5 s) y ASR y traducción de pocos recursos [V: arXiv 2601.11537].
- **Farm Vaidya (India, IFPRI 2026):** agente de voz que llama a agricultores en telugu; los modelos abiertos de ASR tuvieron 50 % o más de error por dialecto y ruido; para el riesgo de respuestas erróneas (dosis de pesticida), limitaron al agente a asesorías verificadas y crearon más de 5.000 preguntas de prueba [S: resumen del buscador; la página no se pudo leer].
- **FormBharo (India, 2026):** agente de voz en hindi que llena formularios por llamada con reglas deterministas; piloto con ARMMAN; prueba con 960 llamadas simuladas; hasta -41 puntos en formularios completados con transcripciones reales [V: resumen arXiv 2608.06027]. No dice cuántas personas reales participaron en el piloto.

### 4.4 Fallos y quejas (a tener presentes)

- **MyCity (Nueva York):** chatbot de la ciudad que daba consejos que llevaban a infringir la ley; costó cerca de USD 600.000 solo en infraestructura; el alcalde lo calificó de "inutilizable" y anunció retirarlo (enero-febrero de 2026) [V: The Markup, StateScoop]. Es texto, pero es el caso más cercano a "IA que da información legal pública".
- **DoNotPay (EE. UU.):** multa de la FTC por prometer de más con IA (informe 00).
- **Citizens Advice (2026):** advierte del riesgo de que la automatización bloquee el acceso de quienes más necesitan un humano [S].

### 4.5 Lecciones

1. La **línea gratuita y la voz** son canales de acceso reales y masivos; el estudio de caso de Perú es el más fuerte (34 %).
2. Los pilotos de voz con IA con población rural tienen el **mismo cuello de botella: ASR y latencia**, no el LLM.
3. Donde hay riesgo de daño (salud, plaguicidas, derecho), los equipos que funcionan **limitan al agente a contenido verificado y a reglas deterministas**.
4. Siempre debe existir la **salida a un humano** (derecho a un humano, 2026).
5. Falta evidencia de efectos; ni EmpowerLine ni Tele-Law publican evaluaciones independientes. No prometer impacto en el pitch; prometer una medición.

---

## 5. Recomendación para el MVP

### 5.1 Arquitectura recomendada

- **Canal (demo):** widget web en el escenario + un número telefónico de prueba; devolución de llamada si da el tiempo.
- **Canal (piloto):** número local con llamada perdida y devolución; 01-8000 solo después de confirmar con operadores quién paga.
- **Plataforma:** ElevenLabs Agents con flujo de nodos: Say (aviso, consentimiento, límites, cierre), subagente LLM acotado (solo elige valores de lista), Dispatch tool (clasificar ruta, calcular plazo, generar documento, enviar SMS), rama de riesgo alto con transferencia.
- **Backend:** el mismo del bot de WhatsApp (máquina de estados + plantillas + PDF en blanco + calendario de festivos). Cuatro herramientas HTTP.
- **Entrega:** SMS con código + modo líder; PDF por WhatsApp si la persona lo pide.
- **Privacidad:** audio no guardado, retención 0 días, sin grabación en telefonía, HMAC del número, variables con TTL de 72 h, comando de borrado por tecla.
- **Capa humana:** consultorio jurídico valida las plantillas y los textos fijos; Personería y Defensoría como destino de derivación.

### 5.2 Costo por llamada de 8 a 10 minutos

**Supuestos:** 9 minutos; 1 USD = COP 4.000 (supuesto, ajustar); tarifas de lista de octubre de 2026 de las páginas oficiales citadas; LLM de bajo costo (USD 0,01/min en ElevenLabs, rango de terceros USD 0,0005 a 0,0446); SMS de código a USD 0,0592; sin contar el costo fijo mensual ni el trabajo humano.

| Escenario | USD/min | USD por llamada de 9 min (8 a 10 min) | COP aprox. por llamada de 9 min |
|---|---|---|---|
| ElevenLabs + devolución de llamada (Twilio saliente a móvil 0,0377) | 0,128 | **1,15** (1,02-1,28) | 4.600 |
| ElevenLabs + número local entrante (Twilio 0,0945) | 0,185 | **1,66** (1,48-1,85) | 6.600 |
| ElevenLabs + línea gratuita entrante (Twilio 0,1792) | 0,269 | **2,42** (2,15-2,69) | 9.700 |
| Retell + Twilio local (0,0732-0,11 de plataforma, con SIP gratis) | 0,168-0,205 | 1,51-1,84 | 6.000-7.400 |
| Vapi + Twilio local | 0,176-0,223 | 1,59-2,01 | 6.300-8.000 |
| OpenAI Realtime mini + Twilio local | 0,115-0,145 | 1,03-1,30 | 4.100-5.200 |
| OpenAI Realtime (modelo grande) + Twilio local | 0,155-0,205 | 1,39-1,84 | 5.600-7.400 |

- Sumar el SMS de código: USD 0,06 (COP ~240) y, si el PDF va por WhatsApp, ~USD 0,001.
- **Fijos mensuales:** número local USD 17,5-31,5 y gratuito USD 25-50 en Twilio; plan de ElevenLabs desde USD 11 (Creator) a 99 (Pro); a USD 0,08 por minuto el plan Pro equivale al precio adicional. Retención cero empresarial y Vapi Core: cotizar.
- **Sensibilidad:** el costo de telefonía es la mitad o más de la llamada. Reducir minutos (teclas, frases cortas) y usar la devolución de llamada tienen más efecto que cambiar de LLM.
- **Escala:** 1.000 llamadas al mes de 9 min ≈ USD 1.700 (≈ COP 6,8 millones) con el escenario del medio.
- **Comparación con el modelo de negocio (00 §5):** COP 4.600-9.700 por llamada es 15 a 30 % del precio ilustrativo de COP 31.000 por caso y unas 15 a 45 veces (escenario central, COP 6.600) el costo tecnológico de un caso por WhatsApp (COP 150-450). Mensaje para el pitch: **la voz es el canal premium para quien no puede usar WhatsApp, no el canal por defecto**.
- Cifras no verificadas: tarifa de WhatsApp Calling en COP, tarifa de 01-8000 con operador colombiano, costo de ConversationRelay, precio de retención cero.

### 5.3 Plan de 48 horas

| Horas | Tarea | Notas |
|---|---|---|
| 0-4 | Cuatro herramientas HTTP en el backend (clasificar, plazo, documento, SMS) reutilizando lo del bot | `compute_deadline` con festivos; PDF en blanco |
| 4-10 | Agente en ElevenLabs: voz colombiana, nodos Say con textos validados, subagente con lista cerrada, Dispatch tools | Texto literal en todos los Say |
| 10-14 | **Prueba temprana de teclas (DTMF) y de teléfono real** | Si no recibe teclas: confirmación hablada |
| 14-20 | Telefonía: número de prueba, y devolución de llamada si hay tiempo | No esperar un número colombiano en 48 h |
| 20-28 | Prueba de ASR con 20-30 audios + adversarial | Ajustar listas y frases de confirmación |
| 28-36 | Rama de riesgo alto, consentimiento por tecla, borrado con asterisco, SMS con código, canje en modo líder | |
| 36-44 | Panel de privacidad (qué se guarda y qué no), ensayo del demo con celular básico | Grabar video de respaldo |
| 44-48 | Pitch | Plan B: widget web y video |

Atajo: el conector de ElevenLabs de esta sesión lista herramientas para crear agentes, flujos, guardrails y pruebas [NV, no probado]; podrían configurarse desde Claude Code.

### 5.4 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| ASR falla con acento y ruido | Alta | Alto | Preguntas cerradas, teclas, confirmación, prueba previa, salida a humano |
| El agente dice algo jurídico no aprobado | Media | Alto | Nodos de texto fijo y salida de herramientas; sin LLM generativo en lo legal; pruebas adversariales |
| Audio o transcripción en terceros contra la regla de 06 | Alta | Medio-alto | Contrato de transmisión, retención cero, conversación casi cerrada, sin PII; opción de pipeline propio |
| Prometer "no guardamos nada" sin poder cumplirlo | Media | Alto (SIC) | Redactar el aviso según lo que realmente se configure; revisar con abogado |
| Línea 01-8000 cobrada al usuario o inhabilitada desde móvil | Media | Medio | Verificar con operadores; usar devolución de llamada |
| Metadatos de la llamada y celular compartido | Alta | Alto en contextos de amenaza | Nombre neutro, SMS sin datos, preguntar si puede hablar, sin llamadas de seguimiento no pedidas |
| Falso positivo o falso negativo de riesgo | Media | Alto | Pregunta directa + confirmación + tecla 9 + revisión con aliados |
| Costo por llamada más alto de lo esperado | Media | Medio | Medir minutos, acortar guion, devolución de llamada, plan con minutos incluidos |
| Meta cambia reglas de IA o de llamadas | Baja-media | Medio | Canal principal fuera de Meta |
| Desconfianza hacia "un robot" | Media | Medio | Decirlo desde el inicio, voz cálida colombiana, salida a humano con tecla 0 |
| Fallo de telefonía en el escenario | Media | Alto | Widget web y video de respaldo |
| Nadie atiende la derivación humana | Media | Alto | Acuerdo previo con la Personería y organizaciones; no activar transferencia si no hay quien conteste |

### 5.5 Qué demostrar en el pitch

1. **Una llamada en vivo desde un celular básico** (en altavoz): llamada perdida, devolución, guion completo de ~3 minutos resumidos, SMS con código. El mensaje: **"sin datos, sin smartphone, sin escribir"**.
2. **La mitad más importante: lo que el agente NO hace.** Pregunta trampa en vivo ("¿usted es abogado? ¿si demando gano?") y la respuesta fija. Muestra que el contenido jurídico sale de plantilla y no de la IA.
3. **Riesgo alto:** simular "me amenazaron"; el agente deja de pedir datos y ofrece comunicar con un humano.
4. **Canje del código con el líder:** el PDF sale en la tableta del líder con el audio que lo lee y el plazo calculado.
5. **Panel de privacidad:** no se graba, retención 0 días, qué ve cada tercero y qué no.
6. **Datos de respaldo:** Perú, 34 % de los contactos por la línea gratuita; 43 % de hogares rurales sin internet; tabla de costo por llamada; lo que no sabemos (ASR rural) y cómo lo vamos a medir en el piloto.
7. **Cuidado con las cifras:** no decir "gratis para el campesino" sin confirmar la devolución de llamada o el 01-8000; no decir "no guardamos nada" si no se contrató retención cero.

**Preguntas probables del jurado:** ¿por qué no solo WhatsApp? (los 43 % sin internet y el caso de Perú); ¿qué pasa si la IA se equivoca? (no redacta lo jurídico, confirma con teclas, deriva a humano); ¿quién paga la llamada? (la organización con la devolución de llamada; ver costos); ¿es legal grabar la voz? (no se graba; la SIC es estricta con biométricos); ¿por qué no un chat libre con IA? (Meta lo prohíbe, el riesgo jurídico, DoNotPay y MyCity).

### 5.6 Guion de llamada de ejemplo (8 turnos y una rama de riesgo)

Caso ficticio: don Jairo, vereda La Esperanza, con celular básico; la tubería del acueducto veredal lleva tres meses rota. Leyenda: **[S]** nodo Say de texto fijo validado; **[L]** subagente LLM acotado; **[T]** herramienta del backend; **[DTMF]** respuesta por tecla.

| # | Quién | Texto | Nodo | Nota |
|---|---|---|---|---|
| 1 | Agente | "Buenas tardes. Le habla el asistente automático de la Red de Promotores de Derechos de su vereda. Soy una máquina, no una persona, y no soy abogado. Esta llamada no le cuesta nada. Si hay alguien cerca y prefiere no hablar, cuelgue; puede volver a llamar cuando esté tranquilo." | [S] | La frase de gratuidad solo si es cierta (devolución de llamada o línea gratuita confirmada) |
| 2 | Agente | "Para ayudarle necesito su permiso. No grabamos esta llamada. No le voy a pedir su cédula ni su dirección. Solo usaremos su número para mandarle un mensaje con un código. Lo que sea sensible es opcional. Si está de acuerdo, marque 1; si no, marque 2. Para borrar todo y salir, marque asterisco." | [S] [DTMF] | Registro: aceptación, fecha-hora, versión. Ajustar "no grabamos" a la configuración real |
| 3 | Agente / Jairo | "Primero una pregunta importante: ¿le han amenazado o hay alguien en peligro por este reclamo? Marque 1 si sí, 2 si no." Jairo: "2". | [S] [DTMF] | Si 1: rama de riesgo (abajo) |
| 4 | Agente / Jairo | "Cuénteme en una frase sobre qué quiere reclamar." Jairo: "Pues es que el tubo del acueducto de la vereda lleva tres meses roto y la alcaldía no responde." Agente: "Entendí: el servicio de agua de su vereda lleva unos tres meses dañado. ¿Es correcto? Marque 1 si sí, 2 si no." | [L] elige tema = acueducto y desde = 3 meses; [DTMF] | Único turno abierto. Si el ASR duda, ofrece lista: "Marque 1 para agua, 2 para salud, 3 para otro trámite" |
| 5 | Agente | "Para esto sirve un derecho de petición. Es gratis, no necesita abogado y la entidad debe contestarle por escrito. Normalmente tiene 15 días hábiles. Esto es información general, no consejo jurídico. ¿A quién se la dirigimos? Marque 1 para la alcaldía, 2 para la empresa de acueducto, 3 si no sabe." | [T] `classify_route` y `compute_deadline` devuelven el texto, el agente lo lee literal; [DTMF] | La tecla evita errores con nombres de entidades |
| 6 | Agente / Jairo | "¿Qué quiere que hagan? Marque 1 para que arreglen el tubo, 2 para que le informen cuándo lo arreglarán, 3 para las dos cosas." Jairo: "3". | [S] [DTMF] | Hechos por plantilla, sin relato libre (opción A del informe 00) |
| 7 | Agente | "Listo, armé su petición. Su nombre, su cédula y su firma los escribe usted a mano. En resumen pide: que reparen la tubería del acueducto de la vereda y que le informen por escrito la fecha de la reparación. Su código es 4, efe, 7, ka. Se lo mando por mensaje de texto. Con ese código, su líder o la Personería se la imprimen." | [T] `generate_document`, `send_sms` | SMS: "Peticion 4F7K lista. Retirela con su lider o en la Personeria." Sin tildes, sin tema |
| 8 | Agente | "Entregue la petición en la ventanilla de la alcaldía y pida el sello de recibido: desde ese día cuentan los 15 días hábiles. ¿Quiere que le avisemos cuando se acerque la fecha? Marque 1 para sí. Recuerde que soy un asistente automático: para una duda legal acuda a la Personería o a un consultorio jurídico. Para hablar con una persona, marque 0. Gracias por llamar." | [S] [DTMF] | Seguimiento solo con la tecla 1 y franja horaria a elegir |

**Rama de riesgo alto (si en el turno 3 marcó 1, o en cualquier momento se activa):**
"Lo que me cuenta es serio. No le voy a pedir más datos ni voy a guardar nada de lo que diga. Si hay peligro ahora mismo, llame al [número de emergencias, verificar]. Para protección, puede comunicarse con [Defensoría / Personería / Somos Defensores, números verificados con los aliados]. ¿Quiere que lo comuniquemos ahora con una persona? Marque 1 para sí, o cuelgue cuando quiera."
→ Tecla 1: transferencia (solo con aliado confirmado). Sin tecla: repetir los datos una vez y terminar. Se registra solo el evento anónimo "riesgo alto".

### 5.7 Cambios sugeridos al informe ejecutivo (00)

- Fila de §6 "Descartados para el MVP": mantener "chat libre con IA" descartado. Agregar una capa de voz con las condiciones de este informe.
- Regla legal 3 de §7: matizar. "Nada de datos personales a un LLM de terceros" no puede cumplirse al pie de la letra con una plataforma de voz gestionada; la regla pasa a "sin datos personales en la conversación, sin guardado, con contrato y retención cero".
- Pitch (§10): no decir "gratis" para la llamada hasta verificarlo, y poner la voz como canal para quien no tiene internet. Frase posible: "Una llamada, sin datos y sin escribir; la IA conversa, la ley sale de plantillas revisadas por un consultorio jurídico."
- Verificar (§11): agregar el costo y la gratuidad real de la línea 01-8000 desde celular; el precio de retención cero; la prueba de ASR con voces rurales.

---

## 6. Vacíos y cosas por verificar

1. **Quién paga la llamada a un 01-8000 desde un celular** (por operador y por plan, prepago incluido) y el costo de contratar la línea con Claro, Movistar, Tigo, WOM o ETB. No encontré tarifas ni resolución que lo aclare.
2. **Devolución de llamada:** si rechazar la llamada entrante no se factura, qué identificador ve la persona, si la CRC o la SIC la consideran llamada automatizada que requiere autorización adicional, y si los operadores tienen servicios de "llámame" para quien no tiene saldo.
3. **Rendimiento del ASR** con español colombiano rural por teléfono: no existe dato; hay que medirlo.
4. **Voz como dato biométrico:** no hallé pronunciamiento de la SIC. Pedir concepto.
5. **Aceptación por tecla como autorización suficiente** y texto final del aviso de voz: abogado.
6. **Retención cero:** precio y plazo de contratación en ElevenLabs empresarial, Vapi y otras; ZDR de OpenAI Realtime; cómo configura Retell la retención fuera del plan empresarial.
7. **Recepción de teclas (DTMF) en ElevenLabs Agents:** no confirmada en lo que leí.
8. **Tarifa de WhatsApp Calling en COP**; límite exacto de mensajes que exige producción (2.000 según Meta, 1.000 según un proveedor); cuántas llamadas por usuario al día se permiten (la documentación se contradice).
9. **Licencia comercial** de las voces de la biblioteca de ElevenLabs y calidad real de las muestras colombianas.
10. **Números de ayuda para el guion de riesgo:** emergencias, Defensoría, líneas de protección. Confirmar con los aliados antes de grabarlos.
11. **Tiempo de entrega de un número colombiano** en Twilio y Telnyx (documentos y plazo).
12. **Cobertura:** si los celulares básicos de la zona piloto se quedan sin voz con el retiro de 2G; consultar a los operadores.
13. **Datos de Citizens Advice Scotland:** cifras autodeclaradas por proveedor, sin fecha clara; no usar en el pitch sin verificar.
14. **EmpowerLine y Tele-Law:** sin evaluación independiente de resultados.
15. **Estado de los proyectos de ley de IA en Colombia** y si alguno obliga a avisar que se habla con una IA.

---

## 7. Fuentes

**Canales y WhatsApp**
- Meta, WhatsApp Business Calling API, documentación (2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/calling
- Meta, precios de Calling API (2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/pricing/
- Meta, Términos de la Plataforma de WhatsApp Business, sección 4.7, actualizados el 23-sep-2026: https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform
- TechCrunch, cambio de términos de WhatsApp sobre chatbots de propósito general (2025): https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform ; réplica: https://tech.yahoo.com/ai/meta-ai/articles/whatssapp-changes-terms-bar-general-141214399.html
- 360dialog, Calling API (2026): https://docs.360dialog.com/docs/waba-basics/calling-api
- WATI, precios de llamadas de WhatsApp (2026): https://www.wati.io/blog/whatsapp-business-calling-pricing
- Consumo de datos de llamadas de WhatsApp (estimaciones no oficiales): https://breezesim.com/blogs/news/whatsapp-call-data-usage ; https://www.firsty.app/help/general/how-much-data-does-whatsapp-use

**Telefonía en Colombia**
- Twilio, guía de voz de Colombia (2026): https://www.twilio.com/en-us/guidelines/co/colombia--voice-guidelines---twilio
- Twilio, requisitos regulatorios de Colombia (2026): https://www.twilio.com/en-us/guidelines/co/regulatory
- Twilio, precios de voz de Colombia (2026): https://www.twilio.com/en-us/voice/pricing/co
- Telnyx, números de Colombia (2026): https://telnyx.com/phone-numbers/colombia ; requisitos: https://support.telnyx.com/en/articles/5464069-colombia-did-requirements ; PSTN en Latinoamérica (2024): https://telnyx.com/release-notes/pstn-replacement-latam
- Xataka Colombia, llamar a una línea 018000 desde celular: https://www.xataka.com.co/celulares/como-llamar-a-numero-018000-celular-colombia
- DPL News, CRC y esquemas de remuneración de llamadas 01 800: https://dplnews.com/?p=21646
- CRC, concepto sobre el apagado de 2G (2025): https://normograma.com/crc/compilacion/docs/concepto_crc_0500959_2025.htm

**Plataformas**
- ElevenLabs Agents, precios (2026): https://elevenlabs.io/pricing/agents
- ElevenLabs, flujos de trabajo de agentes: https://elevenlabs.io/docs/eleven-agents/customization/agent-workflows
- ElevenLabs, modo de retención cero: https://elevenlabs.io/docs/developer-guides/zero-retention-mode ; residencia de datos: https://elevenlabs.io/docs/overview/administration/data-residency ; privacidad de agentes: https://elevenlabs.io/docs/agents-platform/customization/privacy
- ElevenLabs, visión general de agentes: https://elevenlabs.io/docs/eleven-agents/overview
- ElevenLabs, costos de LLM en agentes (tercero): https://www.getmacha.com/blog/elevenlabs-agents-pricing-explained
- Voces colombianas: listado de la biblioteca de ElevenLabs consultado el 20-oct-2026 con el conector de esta sesión (acento `es-colombian`)
- Retell, precios (2026): https://retellai.com/pricing ; tipo de agente: https://docs.retellai.com/build/choose-agent-type ; aviso de descontinuación: https://docs.retellai.com/deprecation-notice/2026/12-15_multi_prompt_agents
- Vapi, precios (2026): https://vapi.ai/pricing ; migración de Workflows a Squads: https://docs.vapi.ai/workflows/legacy-migration ; análisis de terceros: https://zeeg.me/en/blog/post/vapi-ai-pricing
- OpenAI, precios de la API Realtime (2026): https://developers.openai.com/api/docs/pricing ; estimaciones por minuto de terceros: https://aireiter.com/blog/openai-realtime-api-pricing ; https://www.forasoft.com/blog/article/openai-realtime-api-pricing
- Twilio ConversationRelay, documentación: https://www.twilio.com/docs/voice/twiml/connect/conversationrelay ; configuración de voz: https://www.twilio.com/docs/voice/conversationrelay/voice-configuration
- Bland, precios (sep-2026): https://www.getmacha.com/blog/bland-ai-pricing-explained ; https://www.cloudtalk.io/bland-ai-pricing/
- Deepgram, modelos e idiomas: https://developers.deepgram.com/docs/models-languages-overview
- ElevenLabs, transcripción en español (cifras de proveedor): https://elevenlabs.io/speech-to-text/spanish ; guía de transcripción en español: https://convertaudiototext.com/blog/spanish-transcription-guide
- Cartesia, Latinoamérica: https://cartesia.ai/regions/latin-america
- Latencia: https://benchmarklist.com/benchmarks/voice_benchmark_ai/ ; https://telnyx.com/resources/voice-ai-latency-benchmark ; https://www.morphllm.com/best-ai-voice-agent-platforms

**Evidencia**
- Gender and Justice Unit, informe anual 2025 (EmpowerLine): https://genderandjustice.org/?p=5767 ; lanzamiento: https://manaonline.gov.mw/index.php/sports/item/9365-gender-justice-unit-launches-toll-free-line
- Tele-Law, respuesta del gobierno a la Rajya Sabha, 13-mar-2025: https://rsdebate.nic.in/bitstream/123456789/757486/1/PQ_267_13032025_U1707_p1151_p1152.pdf
- Defensoría del Pueblo de Perú, ampliación de la línea gratuita y WhatsApp (2023): https://www.gob.pe/institucion/defensoria/noticias/951220-defensoria-del-pueblo-amplia-horario-de-atencion-hasta-la-medianoche-de-lunes-a-domingo-a-traves-de-la-linea-gratuita-y-el-whatsapp
- Citizens Advice Scotland, ruteo por voz (proveedor y directivo): https://digileaders.substack.com/p/how-ai-saved-400kyear-for-citizens ; https://futurescot.com/?p=22408 ; Caddy: https://tnaqa.mirrorweb.com/ukgwa/20260702051918mp_/https://ai.gov.uk/knowledge-hub/tools/caddy ; "derecho a un humano" (sep-2026): https://www.resultsense.com/news/2026-09-22-citizens-advice-right-to-human-chatbots/
- Alcaldía de Bogotá, Línea 195 con IA: https://bogota.gov.co/mi-ciudad/gestion-publica/en-bogota-la-ia-salva-vidas-agiliza-servicios-y-moderniza-la-ciudad ; nota de prensa especializada: https://www.itsitio.com/co/?p=181177
- Xataka México, Ventanilla 24/7 (2026): https://www.xataka.com.mx/robotica-e-ia/gobierno-mexico-quiere-atender-tramites-ia-burocracia-ventanilla-24-7-promete-resolverlos-minutos
- Hong Kong, línea 1823 (ago-2026): https://news.tvb.com/en/1191780-DigitalPolicyOfficestepsupAIuseon1823govhotline
- Virginia Legal Aid Society, piloto de ingreso por voz con IA (ene-2026): https://cpo.soar.com/articles/7350900/Virginia-Legal-Aid-Society-pilots-voice-based-AI-intake-after-900000-gift ; Stanford, AI for Legal Help: https://justiceinnovation.law.stanford.edu/courses/ai-for-legal-help/
- Iniciativa AIEP, aprendizajes técnicos (arXiv, 2025): https://www.arxiv.org/abs/2601.11537
- FormBharo, agente de voz para formularios en India (arXiv, 2026): https://arxiv.org/abs/2608.06027
- IFPRI, voz con IA generativa en asesoría agrícola (abr-2026; página no legible, dato del resumen del buscador): https://southasia.ifpri.info/2026/04/23/generative-ai-powered-voice-technology-in-agricultural-advisory-services-lessons-from-india/
- The Markup, MyCity (30-ene-2026): https://themarkup.org/artificial-intelligence/2026/01/30/mamdani-to-kill-the-nyc-ai-chatbot-we-caught-telling-businesses-to-break-the-law ; StateScoop: https://statescoop.com/mamdani-kill-nyc-ai-chatbot/

**Marco legal**
- Ley 1581 de 2012, arts. 3, 5, 6 y 12: https://relatoria.colombiacompra.gov.co/normativa/ley-1581-de-2012/?print=pdf
- SIC y datos biométricos (2026): https://www.asuntoslegales.com.co/consultorio/realmente-es-necesario-tener-ese-dato-sensible-4164724 ; https://www.eltiempo.com/justicia/servicios/la-sic-prohibe-a-las-administraciones-exigir-datos-biometricos-para-ingresar-a-conjuntos-residenciales-3575752 ; cierre de World Foundation: https://www.enter.co/?p=585156
- SIC y llamadas automatizadas (fecha incierta): https://www.asuntoslegales.com.co/actualidad/sic-recordo-que-las-llamadas-automatizadas-deben-contar-con-autorizacion-del-titular-3034493 ; multa a Movistar (2025): https://www.vanguardia.com/colombia/2025/10/29/multa-millonaria-a-movistar-por-bombardear-a-usuarios-con-llamadas-y-mensajes/
- Proyectos de ley de IA: https://dplnews.com/?p=283212 ; https://www.redjurista.com/Compilaciones2018/gacetasCongreso/2026/gc_0878_2026.pdf
- Informes internos: `00-informe-ejecutivo.md`, `05-formato-canales-adopcion.md` (secciones 2.1, 2.2, 3, 6.4, 7), `06-marco-legal-seguridad.md` (secciones 1.5, 1.7, 4.4, 5.2-5.7)
