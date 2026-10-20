# 05. Formato ganador, canales y estrategia de adopción

Frente: mejor formato/canal para el MVP y estrategia de adopción comunitaria (Legal Design, Acceso a la Justicia, bajo consumo de datos).
Fecha de la investigación: 20 de octubre de 2026. Contexto: hackathon en Colombia.
Alcance: solo este frente. Competidores, población, modelo de negocio y marco legal los cubren otros informes; aquí solo se toca lo necesario para decidir el formato.

**Leyenda de confianza** (se usa en todo el documento):
- **[V]** Verificado en una fuente primaria u oficial abierta durante esta investigación.
- **[S]** Fuente secundaria (prensa, blog, proveedor, resumen de buscador). Útil pero hay que confirmar.
- **[NV]** No verificado: inferencia, conocimiento técnico general o dato que no pude confirmar. Está marcado explícitamente.

---

## 0. Resumen ejecutivo

**Formato recomendado:** un **asistente de WhatsApp "voz primero"** con flujos guiados (botones y listas), notas de voz pregrabadas, generación del documento en PDF y **seguimiento automático del plazo**; con **respaldo SMS mínimo** (solo código de caso y fecha, sin datos personales); y un **kit para líderes** (credencial con QR, volante con pictogramas, guiones de radio y de audios, protocolo de seguridad). La radio comunitaria y el impreso con QR son los amplificadores, no el producto.

**Por qué:**
1. WhatsApp es el único canal que combina alcance real (~92 % de los usuarios de internet en Colombia [S]), **audio** (no exige leer), **entrega de documentos** (PDF), **botones/listas** (menos tecleo) y **costo marginal casi nulo** para la organización.
2. Un caso completo cabe en **~0,3 a 0,45 MB** (cálculo propio con audios Opus medidos; ver 2.3). SMS, USSD y voz no pueden entregar el documento; la PWA exige leer y primera carga con datos.
3. El "último metro" lo resuelve el **líder** como intermediario alfabetizado y de confianza (evidencia de paralegales comunitarios y de LegalApp + Puntos Vive Digital, sección 5).
4. Riesgos que condicionan el diseño: (a) Meta empezó a **cobrar los mensajes de servicio el 1 de octubre de 2026** (primeros 1.000/mes por número gratis); (b) Meta prohíbe **chatbots de IA de propósito general** en su API, así que el bot debe ser un flujo estructurado, no un chat libre; (c) el **zero-rating** de WhatsApp fue declarado inconstitucional (C-206/2025), por lo que los planes "WhatsApp gratis" tienden a desaparecer; (d) **riesgo físico para líderes sociales** (Indepaz: 87 asesinados entre enero y el 30 de julio de 2026), que obliga a una marca personal prudente, colectiva y opcional.

**Hallazgos que cambian decisiones:**
- El texto oficial de la Ley 1755/2015 (art. 14) dice "quince (15) días siguientes"; la lectura de **días hábiles** viene de la regla general de cómputo (ver 4.4). El bot debe calcular con calendario de festivos.
- El derecho de petición **es gratuito y no requiere abogado** (Ley 1755, art. 13 del texto consultado) [V]. Eso reduce el riesgo de "ejercicio ilegal de la abogacía" para el generador de documentos, pero no el riesgo reputacional/regulatorio de prometer más de lo que la herramienta hace (caso DoNotPay/FTC, 4.5).
- Las SMS en español con tildes (á, í, ó, ú) **no caben en el alfabeto GSM-7**, así que cada segmento baja de 160 a 70 caracteres [NV, conocimiento técnico estándar]. El SMS debe escribirse sin tildes.

---

## 1. Punto de partida: conectividad, alfabetización y mensajería en Colombia

| Dato | Valor | Fuente / confianza |
|---|---|---|
| Hogares rurales con internet | 56,9 % (vs 78,8 % urbano) en la medición reportada; la prensa rotula el año como 2025 y el calendario DANE lo ubica en ECV 2024 (publicada 19-jun-2025): **verificar año** | [S] https://www.bluradio.com/tecnologia/mas-de-3-5-millones-de-nuevos-hogares-rurales-cuentan-con-internet-segun-el-dane-rg10 |
| Hogares en centros poblados y rural disperso con internet (2022) | 32,2 % (nacional 59,5 %) | [S] https://www.valoraanalitik.com/internet-en-colombia-en-2022-el-59-de-hogares-aumentaron-su-conexion/ |
| Hogares con al menos un celular en centros poblados y rural disperso (2022) | 89,8 % (no distingue smartphone de celular básico) | [S] mismo enlace |
| Personas de 5+ con smartphone (nacional, 2022) | 87,1 %; celular convencional 13,2 % | [S] mismo enlace |
| Calidad percibida y conexión móvil en rural (2020) | 46,8 % de hogares rurales la considera "mala"; conexión móvil 60,9 % de las conexiones rurales; solo 10,4 % tiene computador/tableta | [S] https://dplnews.com/?p=117433 (ENTIC 2020, desactualizado) |
| Barrera principal para no tener internet (2022) | Costo (52,5 % nacional); en rural la 2.ª es falta de cobertura (2020) | [S] enlaces anteriores |
| Usuarios de internet (fin 2025) | 41,7 M (77,8 %); 22,2 % sin internet | [S] https://datareportal.com/reports/digital-2026-colombia |
| Alcance de WhatsApp entre usuarios de internet | 92,4 % (Digital 2025 vía Portafolio; otro resumen dice "más de 92 %") | [S] https://www.portafolio.co/tendencias/cuanto-tiempo-pasan-los-colombianos-usando-las-redes-sociales-ranking-lo-revela-624776 |
| Analfabetismo (GEIH 2025, 10+ años) | 4 % nacional; **9,3 % rural vs 2,6 % urbano**; La Guajira rural 21,7 %, Chocó rural 16,7 %, Sucre rural 14,7 %; <2 % bajo los 35 años, 9,4 % a los 65-69, 16,1 % a los 75-79 | [S] https://www.portafolio.co/economia/regiones/la-geografia-que-define-quien-aprende-a-leer-en-colombia-75-de-los-analfabetas-en-colombia-se-reconoce-campesino-502222 (informe 137 del LEE, Javeriana) |
| Analfabetas que se reconocen campesinos | 75 % (titular; el artículo no explica el cálculo) | [S] mismo enlace |
| Analfabetismo funcional rural | No encontré cifra | [NV] |

**Lectura para el diseño:**
- El analfabetismo formal es bajo en adultos menores de 35 y sube mucho en mayores de 65. El perfil típico del líder (adulto activo) sabe leer; **quienes más necesitan el servicio y menos leen son los vecinos mayores**. De ahí el patrón "líder alfabetizado como puente + audio para el vecino".
- El alfabetismo formal no mide **alfabetismo jurídico** (entender un oficio de la alcaldía). El diseño debe asumir baja comprensión de lenguaje legal incluso en quien sabe leer. No encontré una métrica colombiana de analfabetismo funcional [NV].
- **Zero-rating:** la Sentencia C-206 de 2025 declaró inexequible el segmento del art. 56 de la Ley 1450/2011 que permitía planes con apps gratis (p. ej. WhatsApp); los operadores tienen un año para ajustar sin interrumpir servicio ni subir precios a quienes ya tienen el beneficio; tres magistrados salvaron voto advirtiendo que ensancha la brecha en prepago. [S] https://www.elcolombiano.com/negocios/corte-internet-gratis-colombia-cambios-usuarios-operadores-LO27835835. Implicación: no asumir que "WhatsApp es gratis" en el prepago rural; **el diseño debe ser frugal en MB** (audios cortos, PDF liviano, sin video). La fecha exacta en que cada operador cambia sus planes: [NV].
- **Cobertura rural:** la prensa reporta mejor señal de Claro fuera de las ciudades y menor cobertura rural de Tigo [S, blogs: https://www.expat.com/es/guia/america-del-sur/colombia/13935-comunicaciones-en-colombia.html]. No es evidencia sólida; usar solo como hipótesis para elegir zona piloto.

---

## 2. Comparativa técnica de canales

### 2.1 Matriz de canales

Escala de "facilidad MVP hackathon": Alta = funcionando en horas con herramientas gratuitas; Media = días o trámites; Baja = requiere acuerdos con operadores o infraestructura.

| Canal | Teléfono / requisito | Datos por interacción | Costo para la organización | Alfabetización requerida | Facilidad MVP | Limitaciones clave |
|---|---|---|---|---|---|---|
| **WhatsApp: bot con texto, botones y listas** | Smartphone con WhatsApp y datos/wifi | Texto <1 KB por mensaje [S: guías de terceros]; muy bajo | Por mensaje entregado (ver 2.2). Respuestas dentro de 24 h: primeros 1.000/mes por número gratis desde 1-oct-2026 [V] | Media-baja con botones (máx. 3 botones de respuesta; listas de hasta 10 filas) [V] | **Alta** (número de prueba de Meta gratis a 5 destinatarios [V]; sandbox de Twilio [V]) | Ventana de 24 h; plantillas aprobadas para escribir primero; política contra IA de propósito general; verificación del negocio para producción |
| **WhatsApp: notas de voz (entrada y salida)** | Igual | ~59 KB por 30 s a 16 kbps Opus (medido por mí con ffmpeg; el bitrate real de la app del usuario [NV]) | Igual a un mensaje | **Ninguna** para escuchar y responder | **Alta** salida (TTS/audios pregrabados); **Media** entrada (transcripción) | Salida: Ogg+Opus mono; ícono de reproducción solo si ≤512 KB; máx. 16 MB [V]. Entrada: ASR sobre acentos rurales y ruido [NV, ver 3.4] |
| **WhatsApp Flows** (formularios nativos) | Versión reciente de WhatsApp (mínimo exacto [NV]) | Bajo | Se envía como mensaje | Media (formulario con campos) | **Media**: requiere negocio verificado y alta calidad de mensajes [V] | Pantallas con máx. 10 opciones, tareas de ≤5 min, endpoint con timeout de 10 s [V]. Sin soporte garantizado en teléfonos viejos [NV] |
| **WhatsApp catálogos** | n/a | n/a | n/a | n/a | Irrelevante | Es una función de comercio; no aporta a este caso |
| **SMS** | **Cualquier celular**, sin datos | 0 MB | **USD 0,0592 por segmento saliente** en Colombia (Twilio) [V]; ~74× el costo de un mensaje utility de WhatsApp si se toma la tarifa de terceros (USD 0,0008) [S] | Lectura básica | **Media**: envío saliente fácil; bidireccional con código corto exige asignación CRC [V] | 160 caracteres solo en GSM-7; con tildes bajan a 70 [NV]. Sin cifrado. Proveedores se contradicen sobre SMS bidireccional en Colombia (AWS dice sí; Plivo dice no) [S] |
| **USSD** | Cualquier celular, sin datos | 0 MB | Definido por operador/agregador [NV] | Lectura de menús cortos | **Baja**: requiere acuerdo con operadores; Colombia asigna códigos cortos USSD/SMS vía CRC, con justificación de control de fraude [V]. Cobertura de Africa's Talking en Colombia [NV] | No entrega documentos; sesiones cortas; no sirve para audio |
| **IVR / llamada de voz** | Cualquier celular, incluso básico | 0 MB (consume minutos del usuario salvo línea gratuita [NV]) | Minutos de voz + número; Colombia figura con voz soportada en AWS [S] | **Ninguna** | **Media**: Twilio/ElevenLabs/Telnyx; disponibilidad de números colombianos [NV] | Lineal; no entrega documento (solo SMS con código); ASR de línea telefónica; ocupado/sin señal |
| **PWA offline-first** | Smartphone con navegador; primera carga con datos | Primera carga 0,5-2 MB [NV]; luego offline | Hosting trivial | **Alta** (leer y teclear) | **Media-baja** en 48 h | Fricción de instalar; sincronización; no llega a quien no lee; en iOS puede borrar datos locales [NV]. Útil como **herramienta del líder**, no del vecino |
| **Radio comunitaria** | Un radio | 0 MB | Pauta/convenio; muchas emisoras sin financiación [V: Dejusticia] | **Ninguna** | Media (relaciones, no código) | Unidireccional; difunde, no tramita; 188 municipios sin radio y 85 con información local escasa [V: Dejusticia] |
| **Impreso + QR** | Cámara con lector QR para usar; el impreso lo ve cualquiera | ~0 MB al escanear | Impresión | Baja si es pictográfico | **Alta** | Depende de smartphone para activar; vigilancia del lugar donde se pega |
| **Telegram** | Smartphone + app + datos | Bajo | Bot API gratis | Media | **Alta** técnicamente | En Colombia es 2.º en el ranking de mensajería pero sin cuota publicada [S]; el usuario rural no lo tiene. Solo sirve para prototipar |

Fuentes de la matriz: Meta [V] https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages, https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/interactive-list-messages, https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages, https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/guides/bestpractices, https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/gettingstarted; Twilio SMS Colombia [V] https://www.twilio.com/sms/pricing/co; Twilio sandbox [V] https://www.twilio.com/docs/whatsapp/sandbox; Meta get started [S buscador del doc oficial] https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started.md; CRC [V] https://www.crcom.gov.co/sites/default/files/normatividad/00008247.pdf y https://www.crcom.gov.co/sites/default/files/normatividad/00008218.pdf; AWS [S] https://docs.aws.amazon.com/end-user-messaging/latest/userguide/nx-supported-countries-south-america.html; Plivo [S] https://www.plivo.com/sms/coverage/co/; Infobip [S, fecha desconocida] https://infobip.com/news/colombia-portugal-and-bahrain-covered-with-2-way-sms; Africa's Talking [S] https://help.africastalking.com/en/articles/5306296-what-does-africa-s-talking-do (su sitio principal respondió 403); Telegram [S] https://www.wmtips.com/technologies/instant-messaging/country/co/; Dejusticia/El Espectador [V] https://www.elespectador.com/colombia-20/paz-y-memoria/las-radios-comunitarias-tienen-mucho-poder-para-proteger-el-liderazgo-social/.

### 2.2 WhatsApp Business Platform: lo que hay que saber en octubre de 2026

Todo [V] en https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing salvo donde se indique.

- **Facturación por mensaje** desde el 1-jul-2025 (se eliminó la facturación por conversación). Los mensajes que envía el usuario no se cobran.
- **Ventana de atención al cliente de 24 h:** se abre cuando el usuario escribe o llama y se reinicia con cada mensaje suyo. Dentro de ella se puede enviar contenido libre (texto, audio, PDF, botones). Fuera de ella solo **plantillas aprobadas**.
- **Cambio del 1-oct-2026 (hace 19 días):** los mensajes de servicio (respuestas libres dentro de la ventana) vuelven a cobrarse, con **1.000 gratis por número de negocio por mes** (sin acumulación) y cobro desde el 1.001. Sin método de pago registrado, lo que pase de 1.000 no se entrega. También se cobran los mensajes utility dentro de la ventana.
- **Exención para gobierno y ONG comunitarias:** la página dice que organizaciones sin ánimo de lucro comunitarias (incluida "participación cívica no partidista") y entidades de gobierno elegibles mantienen gratis los mensajes de servicio por encima de los 1.000, del 1-oct-2026 al 31-dic-2027. **No hay todavía proceso de solicitud** (Meta dice que lo anunciará; herramienta de verificación de elegibilidad prevista para el 30-oct-2026). Un buscador de segundas fuentes no encontró esta exención; la fuente oficial prevalece, pero **hay que confirmarla antes de presupuestar** [NV hasta que exista el proceso].
- **Tarifas Colombia:** la página oficial no muestra la tabla (está en el CSV/PDF del rate card). COP existe como moneda de facturación desde el 1-abr-2026; las tarifas utility y de autenticación de Colombia subieron el 1-oct-2025. Cifras de terceros (blog de Mercately): servicio y utility USD 0,0008 por mensaje, marketing USD 0,0125 [S] https://blog.mercately.com/?p=30248. **Usarlas solo como orden de magnitud.**
- **Ventana de entrada gratuita** (anuncio "Click to WhatsApp" o botón de la página de Facebook): la página oficial consultada dice que puede quedar abierta **hasta 7 días**, mientras que blogs de terceros dicen 72 horas. [Contradicción: verificar].
- **Costo ilustrativo por caso** (cálculo propio con tarifas de terceros [S]): ~15 mensajes de servicio dentro de la sesión + 4 plantillas utility de recordatorio ≈ 4 × USD 0,0008 ≈ **USD 0,003** de plantillas; los 15 mensajes de servicio entran en el cupo gratuito hasta ~66 casos por mes y por número. Dos recordatorios SMS por el mismo caso costarían 2 × USD 0,0592 ≈ **USD 0,12**, unas 37 veces más. Conclusión: **WhatsApp primero, SMS solo como respaldo o por elección del usuario**.
- **Política de IA** (vigente desde el 15-ene-2026 para cuentas existentes): Meta prohíbe a proveedores de IA usar la API cuando el chatbot de propósito general es el producto principal. Se permiten bots específicos de un negocio, auxiliares a un servicio legítimo (soporte, citas, FAQs, seguimiento) [S] https://respond.io/blog/whatsapp-chatbot-policy-2026 y https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform. Además existe una "política de precios para proveedores de IA" aparte (efectiva 16-feb-2026; los términos no los pude leer) [V parcial]. **Implicación de diseño:** flujo determinista por pasos; el LLM solo transcribe, resume o redacta dentro de una plantilla. Eso cumple la política y además reduce el error jurídico (3.3).
- **Privacidad de la Cloud API** [V] https://developers.facebook.com/documentation/business-messaging/whatsapp/data-privacy-and-security: los mensajes viajan cifrados, pero la Cloud API **gestiona las llaves en nombre del negocio** (no es el cifrado extremo a extremo del WhatsApp personal); conserva datos hasta 30 días; Meta actúa como encargado; existe opción "Local Storage" en otro país; no usa los mensajes para dirigir anuncios automáticamente. Implicación: poca PII en el chat y borrado de lo que no se necesite.
- **Medios:** los IDs de medios devueltos por la API expiran a los 30 días y los de webhooks a los 7 días [S] https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media. Descargar al instante los audios entrantes y re-subir los audios fijos periódicamente (o enviarlos por enlace).
- **Recepción de un audio por el bot:** a partir del 17-mar-2026 los mensajes de voz generan webhook de "reproducido" [V] (útil como métrica de que el vecino escuchó).

### 2.3 Presupuesto de datos de un caso completo (medición propia)

Medido en esta sesión con `say` (voz Paulina), `ffmpeg` (Opus mono, 16 kHz) y `cupsfilter`:

| Elemento | Tamaño | Nota |
|---|---|---|
| Nota de voz de 30 s a 12 kbps | 45,8 KB | calidad aceptable para voz |
| Nota de voz de 30 s a 16 kbps | 59,1 KB | valor de referencia |
| Nota de voz de 30 s a 24 kbps | 84,6 KB | |
| PDF de una hoja (texto simple) | 18,8 KB | con logo/tipografías embebidas sube a 50-150 KB [NV] |
| Mensaje de texto | <1 KB | [S] |

Estimación de un caso: 3 audios del bot (3 × 59 KB) + 2 audios del usuario (~2 × 60 KB) + PDF (19-100 KB) + ~15 mensajes de texto (~15 KB) ≈ **0,33 a 0,41 MB**, más sobrecarga de protocolo que no medí [NV]. El umbral de 512 KB de Meta para que el audio muestre el botón de reproducir equivale a ~4,3 minutos a 16 kbps: sobra para audios de ≤60 s.

### 2.4 Herramientas para el MVP de hackathon

| Opción | Qué da | Límites [V] | Comentario |
|---|---|---|---|
| **Meta Cloud API con número de prueba** | Envío gratis a hasta 5 números verificados; plantilla `hello_world` | Solo 5 destinatarios; (hay fuentes que discrepan sobre un tope de 250 mensajes/24 h [S]) | Mejor opción para el demo real: es la API de producción |
| **Twilio WhatsApp Sandbox** | Un número compartido; cada usuario envía `join <código>` | Solo quien se unió; vence a los 3 días; 1 mensaje cada 3 s; solo plantillas de prueba fuera de ventana; pruebas funcionales, no de carga | Útil si el equipo ya conoce Twilio; pasar a producción exige remitente propio |
| **Webhook mínimo + máquina de estados + PDF** | Lo esencial | | Una función serverless, una tabla de casos, audios pregrabados una sola vez (TTS) y una librería de PDF. Sin framework de bots. |
| **Africa's Talking / Infobip / AWS End User Messaging / Twilio** para SMS y voz | SMS saliente; voz | Cobertura colombiana de USSD y SMS bidireccional: [NV] | Dejar SMS saliente de un solo sentido para la demo |
| **Telegram Bot API** | Prototipo instantáneo sin trámite | Público objetivo no lo usa | Solo para ensayar la lógica del flujo antes de tener WhatsApp |

Costos y trámites de producción a verificar con el equipo: verificación del negocio en Meta (documentos exactos [NV]; el prerrequisito para enviar Flows es "negocio verificado y calidad alta de mensajes" [V]); número dedicado; método de pago antes del 1.001.º mensaje de servicio.

### 2.5 Veredicto por canal

| Canal | Veredicto | Rol |
|---|---|---|
| WhatsApp (botones, listas, voz, PDF) | **Núcleo del MVP** | Producto |
| SMS | **Respaldo mínimo** (código de caso y fecha, sin datos personales) | Recordatorio |
| IVR/llamada | Fase 2 | Alcance a quien no tiene smartphone |
| USSD | No para el MVP | Depende de operadores y no entrega el documento |
| PWA | Solo como panel/herramienta del líder si sobra tiempo | Herramienta |
| Radio comunitaria | **Amplificador de adopción** | Difusión y confianza |
| Impreso + QR | **Puerta de entrada** | Kit del líder |
| Telegram | Descartado para usuarios finales | Prototipo |

---

## 3. Qué funciona con poblaciones de baja alfabetización

### 3.1 Evidencia revisada

1. **Representaciones para usuarios analfabetos.** Medhi, Prasad y Toyama (WWW 2007) mostraron síntomas de salud a 200 personas analfabetas en 10 formatos (texto, dibujo, foto, animación dibujada y video, con y sin voz). Resultados del resumen oficial: más detalle no implica mejor comprensión; **la voz generalmente acelera la comprensión**, pero **combinar audio y visual puede confundir**; lo dinámico vs lo estático depende del contexto. [V parcial: solo el resumen] https://archives.iw3c2.org/www2007/program/paper.php_id=764.html
2. **Interfaces sin texto.** Medhi Thies, Sagar y Toyama diseñaron interfaces sin texto con trabajadoras domésticas de Bangalore: los usuarios las preferían claramente a las de texto; confirmaron como necesarios **la retroalimentación por voz y los gráficos semi-abstractos**, y destacaron una **ayuda consistente** que antes se pasaba por alto. [V parcial: solo el resumen] https://www.microsoft.com/en-us/research/?p=160568 ; síntesis posterior: https://courses.cs.washington.edu/courses/cse490c/18au/readings/medhi-thies-2015.pdf
3. **IVR/voz gratuita a escala.** Servicio 3-2-1 (Viamo/Airtel) en Madagascar: análisis de uso con más de 3 millones de usuarios halló que muchos colgaban en la pantalla de inicio (posible miedo al cobro). Un piloto de "Daily Digest" que quitó opciones de menú reportó 8 % más usuarios activos y el doble de mensajes clave escuchados. [S; no verifiqué métodos] https://www.gsma.com/mobilefordevelopment/wp-content/uploads/2015/03/Making-the-Most-out-of-your-Data-in-M4D_Case-Study-on-Airtel-and-HNIs-3-2-1-Madagascar-Service.pdf y https://global.comminit.com/node/9567884. Lección: **menos opciones, aclarar que es gratis, dar un solo camino por defecto**.
4. **Notas de voz en Colombia.** Estudio en emisoras análogas de Manizales (58 participantes, 45 programas, 10 emisoras): 74 % usa WhatsApp a diario para producir y 83 % para interactuar con oyentes; la audiencia reemplazó la llamada al teléfono fijo por **notas de voz** que se emiten al aire. [V] https://dialnet.unirioja.es/descarga/articulo/6815727.pdf (Anagramas, 2018). **Límite:** es una ciudad, no zona rural dispersa.
5. **Voz y accesibilidad según Meta:** la documentación afirma que los mensajes de voz mejoran la accesibilidad para baja alfabetización [S, afirmación de proveedor].
6. **Brecha de evidencia:** no encontré estudios controlados sobre notas de voz de WhatsApp con campesinos colombianos, ni un estudio comparativo entre audio y texto para trámites legales. Lo tratamos como **hipótesis a validar en el piloto** (sección 5.6).

### 3.2 Principios de diseño derivados

1. **Audio primero, texto de apoyo:** cada paso importante tiene una nota de voz de ≤25 s (~58 palabras a ritmo normal) y 2-3 líneas de texto con la misma información. No poner audio, texto y mucha imagen a la vez.
2. **Una pregunta por mensaje**, con respuesta por botón, lista o audio.
3. **Pictogramas semi-abstractos** en el impreso y en las listas (gota para agua, cruz para salud, camino, casa/tierra), no fotos ni videos.
4. **Ayuda siempre visible:** palabra clave `AYUDA` o botón "Hablar con mi líder".
5. **Mensaje de gratuidad explícito:** "El servicio no le cobra nada" (cuidado: el consumo de datos corre por su plan y, con el fin del zero-rating, ya no será gratis en muchos prepagos; por eso decir "gasta muy pocos datos" en lugar de "no gasta datos").
6. **Sin menús largos:** máx. 3 botones o 7 filas de lista por paso (Meta permite hasta 10).
7. **Confirmación en voz alta de lo dicho:** el bot devuelve lo entendido ("Entendí que...") con botones Sí/No; es la barrera contra errores de transcripción.

### 3.3 Calidad de las respuestas jurídicas (por qué NO un chat libre)

Rúbrica del Stanford Legal Design Lab para respuestas de IA en ayuda legal [V] https://justiceinnovation.law.stanford.edu/measuring-what-matters-a-quality-rubric-for-legal-ai-answers/ : exactitud, **accionabilidad** (pasos concretos), empoderamiento y cautela estratégica. Hallazgos útiles: los usuarios valoran más saber qué hacer ahora que las citas; los **errores más dañinos son procesales** (plazos, juzgados, pasos de radicación); los descargos genéricos "consulte a un abogado" desaniman a quien no tiene abogado; hay que diagnosticar primero con preguntas aclaratorias y remitir a recursos reales. La iniciativa de IA y acceso a la justicia de Stanford mantiene una base de incidentes (reglas o formularios incorrectos, "alucinaciones" de leyes, entidades y líneas telefónicas) [V] https://justiceinnovation.law.stanford.edu/projects/ai-access-to-justice/.

Conclusión: **plazos y rutas salen de tablas verificadas por abogados, nunca del modelo**.

### 3.4 Transcripción de audios rurales (riesgo abierto)

No pude verificar el desempeño de modelos de voz-a-texto con español rural colombiano y ruido de fondo (se agotó el cupo de búsquedas de la sesión) [NV]. Plan: probar con 20-30 audios reales de vecinos en la Fase 0, medir errores en nombres propios y cifras, y mantener siempre la **confirmación Sí/No** y la alternativa de botones/escritura asistida por el líder.

---

## 4. Legal Design y lenguaje claro: principios, métodos y conversión de un derecho de petición en flujo

### 4.1 Legal Design (Stanford Legal Design Lab, Margaret Hagan)

- **Definición** (atribuida a Hagan en un artículo en neerlandés, https://www.jubel.be/legal-design-geen-fantasie-maar-wetenschap/): aplicar diseño centrado en las personas al mundo jurídico para que los sistemas y servicios sean más usables y centrados en el cliente [S]. Laboratorio: https://justiceinnovation.law.stanford.edu/ ; libro abierto de Hagan *Law by Design*: https://www.lawbydesign.co/design-process/ ; ensayo sobre diseño participativo (Hagan, Daedalus 2019): https://www.amacad.org/publication/daedalus/participatory-design-innovation-access-justice ; *Law + Design Workbook* (2017, CC BY-NC-SA): https://atjlibrary.org/node/1476/resource-law-design-workbook-hagen-2017
- **Proceso en cinco etapas** (resumen del capítulo "Design Process for Lawyers") [V]: (1) descubrimiento y comprensión (entrevistas, observación, "caminar una milla" por el servicio); (2) síntesis (mapas de recorrido, requisitos de "debe/no debe", pregunta "¿Cómo podríamos...?"); (3) lluvia de ideas y construcción (prototipos de baja fidelidad: storyboard de 8 cuadros); (4) prueba e iteración (usabilidad, utilidad, valor; "considerar la no acción"); (5) escalar (versión 1 acotada, piloto con hipótesis central, promesa de marca). La frase "Descubrir, definir, desarrollar, entregar" **no** es de Hagan según lo que pude confirmar; es el "doble diamante" británico [NV].
- **Guías de prueba con usuarios** del laboratorio: https://justiceinnovation.law.stanford.edu/resources/evaluation/user-testing/
- **Guías visuales** (líneas de tiempo, flujogramas, storyboards del "viaje" del usuario, código QR a guía en línea + contacto humano para quien se sienta abrumado): https://justiceinnovation.law.stanford.edu/projects/visual-guides/ [V; sin resultados medidos en la página]
- **Mensajería de texto para trámites jurídicos:** *Wise Messenger* envía recordatorios de audiencias con consentimiento y estudio aleatorizado (recordatorios 10, 5 y 1 días antes); la página no publica resultados de asistencia. [V] https://justiceinnovation.law.stanford.edu/projects/messenger/ y https://justiceinnovation.law.stanford.edu/projects/messenger/study . Es el antecedente directo del módulo de **recordatorio de plazos**: no hay evidencia publicada de su efecto en esas páginas, así que hay que medirlo en nuestro piloto.

### 4.2 Lenguaje claro en Colombia

- **Guía de lenguaje claro para servidores públicos de Colombia** (DNP, Programa Nacional de Servicio al Ciudadano, 2015) [V, texto leído] https://sigi.sic.gov.co/SIGI/files/mod_documentos/anexos/221/GUIA%20DEL%20LENGUAJE%20CLARO.pdf . Método de cuatro pasos: **organizar, escribir, revisar y validar**. Reglas útiles para los mensajes del bot: identificar al lector; estructura básica (apertura/contexto, cuerpo, cierre con qué debe hacer); **encabezados** que guían; listas con números cuando el orden importa; tablas "si... entonces..." para criterios de decisión; diagramas de flujo para secuencias no lineales; oraciones cortas; voz activa; palabras sencillas (p. ej. "hacer" en vez de "efectuar"; "aclarar" en vez de "clarificar"); quitar palabras innecesarias; **validar el texto con la audiencia** mediante entrevistas o grupos focales. Ejemplo de la propia guía: palabras como "radicación", "peticionario" o "contestación" alejan al ciudadano.
- **Marco:** CONPES 3785 de 2013 y Ley 1712 de 2014 sobre transparencia; hay un proyecto de ley 282 de 2025 Cámara sobre promoción del lenguaje claro cuyo estado no pude confirmar; y se cita el art. 28 de la Ley 2052 de 2020 como obligación de lenguaje claro en el trato con la ciudadanía [S, descripción de un proyecto] https://www.asuntoslegales.com.co/consultorio/transformacion-de-la-comunicacion-juridica-un-nuevo-estandar-internacional-para-la-implementacion-del-lenguaje-claro-4234060 . El estado vigente de estas normas: [NV].
- **Estándar internacional:** ISO 24495-2:2025 (lenguaje claro, parte 2: comunicación jurídica), emitida en agosto de 2025: cubre términos técnicos jurídicos, estructura, diseño y explicación de procesos que las personas deben seguir para ejercer derechos [S: mismo artículo de Asuntos Legales]. Sirve de referencia para decir "nuestro documento sigue un estándar internacional".
- **Corte Constitucional:** no hallé una guía propia de la Corte sobre lenguaje claro [NV]. Sí hay jurisprudencia: la T-311 de 2024 vincula el lenguaje claro y comprensible con la motivación de decisiones administrativas; la T-478 de 2015 lo trata como garantía del debido proceso en decisiones que afectan a niños; varias providencias ordenaron "traducir" sentencias a formatos de lectura fácil para personas con discapacidad (A-173/14, T-573/16, T-410/21, T-357/23, T-133/25) [S: análisis de abogados y de Uniandes] https://franciscofajardoabogados.com/corte-constitucional-insta-a-las-autoridades-administrativas-a-cumplir-con-el-deber-de-motivacion-de-sus-decisiones-empleando-un-lenguaje-claro-y-comprensible/ y https://derecho.uniandes.edu.co/sentencias-lenguaje-claro-y-lectura-facil-mecanismos-de-acceso-justicia . En ese foro de Uniandes se defendió además que el lenguaje claro no elimina los términos técnicos: se mantienen cuando son necesarios y se explican.
- **Lectura fácil** (cognitiva) es distinta de lenguaje claro: añade tamaño de letra, frases cortas y pictogramas [S, mismo artículo]. Nuestro impreso pictográfico se acerca a lectura fácil; el documento radicado debe cumplir lenguaje claro.

### 4.3 Antecedente colombiano: LegalApp y mediación presencial

- **LegalApp** (Ministerio de Justicia): más de 260 rutas de justicia y más de 4,8 millones de usuarios orientados según OGP (cifras de 2016-2021) [S] https://www.opengovpartnership.org/stories/legalapp-colombia-legal-guidance-with-just-one-click/ (la página respondió 403; datos de resultados de búsqueda).
- **Alianza LegalApp + Puntos Vive Digital:** más de 2.400 ciudadanos orientados en ~6 meses, más de 210 sesiones, red de 848 puntos en 27 departamentos, 25 formatos descargables sin abogado; los encargados de los puntos actuaron como "puente de comunicación" y se concluyó que **la facilitación presencial ayuda a usar las herramientas, no solo a encontrarlas**. [V] https://mintic.gov.co/portal/inicio/Sala-de-prensa/Noticias/15159:Alianza-entre-LegalApp-y-Puntos-Vive-Digital-ha-orientado-juridicamente-a-mas-de-2-400-colombianos
- Diferencia a explotar: LegalApp orienta en una web (lectura y datos); nuestro formato conversa por audio, **genera el documento** y **vigila el plazo**.

### 4.4 Del derecho de petición al flujo guiado: mapa legal-a-conversación

Texto de la Ley 1755 de 2015 leído en el PDF de la Unidad de Víctimas [V] https://www.unidadvictimas.gov.co/wp-content/uploads/Documentos/ley/Ley_1755_2015.pdf . El marco legal completo lo cubre el informe de marco legal; aquí solo se extrae lo que dicta el diseño:

| Regla legal (Ley 1755/2015) | Qué hace el bot |
|---|---|
| El ejercicio del derecho de petición es gratuito y no requiere abogado | Mensaje ancla: "Es gratis y no necesita abogado" |
| Art. 15: puede presentarse verbalmente (con constancia) o por escrito por cualquier medio idóneo; ninguna autoridad puede negarse a recibir y radicar peticiones respetuosas (par. 2) | Paso "cómo radicarlo": opciones y frase para exigir el recibido |
| Art. 16: contenido mínimo = autoridad destinataria, nombres y apellidos completos y documento de identidad, dirección para recibir correspondencia, objeto, razones, relación de documentos, firma cuando fuere el caso | Las preguntas del bot son **exactamente** estos campos, en este orden |
| Art. 16 pars. 1-2: la autoridad no puede rechazar por fundamentación inadecuada o incompleta | Quita miedo: "no tiene que citar leyes" |
| Art. 14: regla general **15 días** siguientes a la recepción; **10 días** para documentos e información (si no responde, se entiende aceptada y las copias salen en 3 días); **30 días** para consultas | Selecciona plazo según el tipo de petición |
| Art. 14 parágrafo: si no puede resolver, debe avisar **antes del vencimiento**, con motivos y nuevo plazo razonable, que no exceda el doble del inicial | Rama de seguimiento "me avisaron que necesitan más tiempo" |
| Art. 17: si está incompleta, la autoridad requiere dentro de 10 días y el peticionario tiene máximo 1 mes para completar; si no, hay desistimiento tácito | Rama "me pidieron más datos": recordar el mes |
| Art. 19: rechazo si es irrespetuosa; devolución solo si no se entiende (10 días para aclarar) | Revisión de tono del texto generado |
| Art. 20: atención prioritaria para derechos fundamentales con perjuicio irremediable y peligro para la vida o integridad | Pregunta de urgencia al inicio |
| Art. 21: si la autoridad no es competente, informa y remite en 5 días; el plazo corre desde que la recibe la competente | Frase tranquilizadora "si se equivoca de entidad, igual se la deben pasar" |

**Sobre "días hábiles" [con discrepancia]:** el texto leído de la Ley 1755 dice "quince (15) días siguientes", sin la palabra "hábiles". Las fuentes de los resultados de búsqueda indican que (a) la regla general de cómputo suprime festivos y vacancias en los plazos de días (art. 62 de la Ley 4 de 1913, según un resultado de Función Pública), y (b) un concepto de Función Pública de 2022 afirma 15 días hábiles tras la Ley 2207 de 2022 (que derogó el art. 5 del Decreto 491 de 2020, que había ampliado los plazos a 30 y 20 días durante la emergencia sanitaria). Algunas fuentes no concuerdan entre sí. [S/NV: abrir y citar los textos oficiales antes de afirmarlo en el demo]. **Decisión de diseño:** el bot muestra "15 días hábiles (sin contar sábados, domingos ni festivos)" y permite que el equipo jurídico cambie la regla en un solo parámetro.

**Ejemplo de cálculo (ejecutado en esta sesión):** radicación el lunes 9-nov-2026; festivos supuestos en el periodo: 16-nov (Independencia de Cartagena trasladada) y 8-dic [la lista de festivos 2026 es de conocimiento general y debe verificarse con el calendario oficial; NV]:
- 10 días hábiles: martes 24-nov-2026.
- **15 días hábiles: martes 1-dic-2026.**
- 30 días hábiles: miércoles 23-dic-2026 (también es el tope de una prórroga: el doble de 15).
- Recordatorios propuestos: día hábil 7 (jue 19-nov), día 12 (jue 26-nov), día 15 (vence, mar 1-dic) y día 16 (mié 2-dic) con "¿le respondieron?".

**Siguiente paso si no hay respuesta** (insistencia, queja ante Personería/Procuraduría, tutela, eventual silencio positivo solo para documentos): lo define el informe de marco legal. En el flujo se deja como rama parametrizable.

### 4.5 Límites éticos de un generador de documentos

- FTC contra DoNotPay ("el primer abogado robot del mundo"): orden final de 16-ene-2025, USD 193.000 y prohibición de afirmar equivalencia con un abogado sin evidencia sólida; la queja decía que no probó la calidad de sus documentos ni empleó expertos jurídicos. [S] https://about.getcoai.com/news/ftc-bans-donotpays-ai-lawyer-claims-and-orders-refunds . Nuestras promesas deben ser "ayuda a redactar y a hacer seguimiento", no "reemplaza a un abogado".
- India lanzó un chatbot oficial por WhatsApp (Nyaya Setu) que da orientación preliminar y aclara que redacción y representación siguen requiriendo abogado inscrito; las fuentes que hallé no traen datos de resultados y discrepan en la fecha de lanzamiento [S] https://www.outlookbusiness.com/ampstories/news/how-does-nyaya-setu-work-on-whatsapp-to-provide-instant-legal-guidance-explained . Un artículo de la Universidad de Núñez describe un chatbot cognitivo "Justo Bolívar" para acceso a la justicia en comunidades rurales de Bolívar; no pude abrirlo ni confirmar si usa WhatsApp [S] https://revistas.uninunez.edu.co/ergaomnes/es/article/download/2687/1819/6335 .
- Respaldo humano: toda ruta ambigua o de alto riesgo escala a una persona (Personería, consultorio jurídico, Defensoría). Los convenios concretos: [NV].

---

## 5. Estrategia de adopción comunitaria

### 5.1 Qué dice la evidencia sobre intermediarios de confianza

| Evidencia | Hallazgo | Confianza |
|---|---|---|
| Liberia, ensayo aleatorizado (Carter Center; Siddiqi y Sandefur) de paralegales comunitarios | "Impactos fuertes y robustos" en resultados de justicia; mejoras en seguridad alimentaria de hogares (+0,24 DE) y de niños (+0,38 DE); los autores lo llaman evidencia preliminar | [V resumen de seminario] https://fsi.stanford.edu/node/11025 |
| Mozambique, estudio de caso (BMC Public Health 2020; 24 casos) de paralegales de Namati en salud | Sentimiento de empoderamiento y mejoras concretas rápidas; cambios "incipientes" en la relación usuarios-sistema; no mide efectividad poblacional | [V resumen] https://pubmed.ncbi.nlm.nih.gov/32650772/ |
| Namati/Timap (Sierra Leona) | Cifras de escala y resultados autoinformados (p. ej. ~4.100 disputas resueltas en 2013); sin evaluación independiente hallada | [S, autoinforme] https://namati.org/wp-content/uploads/2015/02/Namati-who-we-are-how-we-work-where-were-going.pdf |
| Radio interactiva + SMS (AFRRI, Farm Radio International; 25 emisoras en 5 países) | Un SMS semanal 30 min antes del programa elevó la audiencia hasta 20 %; comunidades que participaron en el diseño adoptaron prácticas ~4 veces más que las de solo escucha (asociación, no causalidad) | [S, autoinforme] https://commbox.org/document/the-new-age-of-radio-how-icts-are-changing-rural-radio-in-africa |
| Digital Green (video con facilitadores locales; Bihar, 420 aldeas) | Diseño aleatorizado de extensión mediada por grupos de autoayuda; magnitudes no recuperadas; un estudio previo preliminar reportó 6-7 veces más adopción que la extensión tradicional | [S] https://www.povertyactionlab.org/print/pdf/node/2061?lang=en y https://digitalgreen.org/wp-content/uploads/2023/12/DG-Evidence-Review_Final-Report.pdf |
| LegalApp + Puntos Vive Digital | 2.400+ personas en 6 meses con facilitación presencial | [V] ver 4.3 |

**Lectura:** el patrón repetido es **intermediario local + herramienta simple + recordatorio**. No hay evidencia rigurosa de que un bot por sí solo cambie conducta de comunidades rurales; hay evidencia razonable de que el intermediario sí.

### 5.2 Intermediarios disponibles en Colombia

- **Juntas de Acción Comunal:** ~65.000 en el país según el Ministerio del Interior y el Instituto de Acción Comunal (cifra citada en un comunicado de la Gobernación de Cundinamarca; ~300.000 comunales inscritos en Cundinamarca según otro comunicado) [S] https://www.cundinamarca.gov.co/noticias/mas-de-4500-organismos-comunales-elegiran-a-sus-nuevos-dignatarios-en-116-municipios-de-cundinamarca . Cifra nacional oficial: [NV].
- **Conciliadores en equidad:** 8.328 en 242 municipios (boletín del Ministerio de Justicia, dato de 2016) [S] https://ambitojuridico.com/sites/default/files/BancoMedios/Archivos/minjusticia-boletindeprensa-reformaleydeconciliacion.pdf . **Jueces de paz:** 989 según cifras de la Rama Judicial reportadas por la Secretaría de Seguridad de Bogotá (trabajo ad honórem) [S] https://bogota.gov.co/mi-ciudad/seguridad/bogota-hace-un-llamado-promover-la-financiacion-de-los-jueces-de-paz . No hallé una categoría nacional de "paralegal comunitario" [NV]. Estas figuras ya tienen legitimidad jurídica y comunitaria, y encajan como primer público del piloto.
- **Radios comunitarias y de paz:** en zonas apartadas con poca señal, la radio es compañía y puente [S] https://radionacional.co/cultura/dia-mundial-de-la-radio-radio-comunitaria-en-el-cauca-la-voz-que-construye-paz ; estudio de cuatro emisoras comunitarias del Cauca en promoción de paz [S, resultado de búsqueda]. **Riesgos:** falta de financiación y capacitación, y 188 municipios sin ninguna radio [V Dejusticia]. Las 20 "Emisoras de Paz" (más de 463.000 personas de audiencia; 11 municipios según otra fuente) enfrentan en 2026 una controversia por la **suspensión de la programación local** y la Defensoría pidió reevaluarla [S] https://www.lasillavacia.com/en-vivo/defensoria-del-pueblo-pide-reevaluar-la-suspension-de-20-emisoras-de-paz/ (la página respondió 429 al leerla; datos del resultado de búsqueda). **No depender de una sola red de emisoras.**
- **Otros espacios de confianza:** iglesias, mercados campesinos, colegios rurales, puntos Vive Digital, Personerías y consultorios jurídicos. **No hallé evidencia colombiana de adopción de herramientas digitales por estos canales** [NV]; se proponen como hipótesis de piloto, no como hechos.

### 5.3 Marca y comunicación: marca de la herramienta y marca personal del líder

**Riesgo previo (condiciona todo):** Indepaz registró **87 líderes y defensores asesinados entre el 1 de enero y el 30 de julio de 2026** (121 en el mismo periodo de 2025) y **114 hasta fines de septiembre** según su último corte reportado; la Defensoría contó 112 entre enero y agosto; Indepaz acumula 1.978 desde 2016. [S] https://www.asuntoslegales.com.co/actualidad/entre-enero-y-agosto-fueron-asesinados-112-lideres-sociales-y-se-registraron-86-masacres-4491309 y https://www.eluniversal.com.co/colombia/2026/08/03/asesinatos-de-lideres-sociales-golpean-a-432-municipios-de-colombia-segun-indepaz/ (cifras cambian con la fecha de corte). Visibilidad pública puede proteger o exponer. Por tanto:

1. **Marca colectiva primero, rostro opcional después.** La marca es la red ("Promotores/as de Derechos de [vereda o municipio]") y el líder decide si aparece con nombre y foto; por defecto, credencial con apodo/rol y número de promotor.
2. **Vocería voluntaria y acotada:** el líder presenta una herramienta ("Pregúntele al asistente"), no denuncia casos; guion que no menciona actores armados ni conflictos locales.
3. **Cero datos de casos en grupos ni en material público.** Los tableros del líder muestran conteos y códigos, no nombres ni contenidos.
4. **Coordinar con Defensoría/Personería** antes de usar su sello (alianza real, no uso del logo sin permiso) [NV: no hay convenio].
5. Si el equipo quiere un "efecto marca personal", usar **reconocimiento público de la comunidad** (p. ej. "vereda con más peticiones respondidas") en agregados y no individuales.

**Proposición de marca de la herramienta** (ejemplos, no validados; verificar disponibilidad de nombre y dominio): "Pida Claro", "Mi Petición", "La Voz de la Vereda". Tono: cercano, respetuoso, sin jerga; trato de usted; nombre propio y voz humana grabada (no robótica) para generar confianza; acento neutral colombiano. Probar el nombre con hablantes de cada región.

**Mensajes ancla (lenguaje claro):**
1. "Pedir algo a una entidad es un derecho. Es gratis y no necesita abogado."
2. "Hable, no escriba. Le armamos su documento en pocos minutos."
3. "La entidad tiene 15 días hábiles para responderle. Nosotros le recordamos." (aclarar que son 10 días si pide copias y 30 si hace una consulta)

**Gamificación y reconocimiento:** no encontré evidencia robusta de gamificación en contextos comunitarios jurídicos [NV]. Propuesta prudente, a medir: insignias colectivas por hitos ("10 peticiones respondidas en su vereda"), certificado de "Promotor/a formado/a" firmado con aliados (Personería, universidad, consultorio jurídico) si aceptan, y reconocimiento en la emisora local. Evitar rankings individuales por el riesgo de seguridad.

### 5.4 Kit para líderes

1. **Credencial con QR** (enlace `wa.me` con mensaje inicial "Hola, vengo de [líder/vereda]" para atribuir la adopción; el formato exacto del enlace: [NV]).
2. **Volante/cartel pictográfico** en tres pasos: Hable, Reciba su documento, Reciba recordatorios; con QR y un número para quien no tenga smartphone (el líder).
3. **Tarjeta de bolsillo** "Cómo se cuenta el plazo" (15, 10 y 30 días hábiles) con espacio para anotar la fecha de radicación.
4. **Cuatro audios plantilla de 20-30 s** para sus grupos de WhatsApp (qué es, cómo se usa, historia de un caso real anonimizado, recordatorio de plazos).
5. **Guion de radio** de 30 y 60 s y un "micrófono abierto" semanal de 10 min (cápsula "Pregunta de la semana").
6. **Protocolo de seguridad digital de una hoja:** no pegar cédulas ni fotos de documentos en grupos; usar el código de caso; borrar audios del celular compartido; bloqueo de pantalla; qué hacer si le amenazan. (Contenido a validar con una organización de seguridad digital; no pude verificar la guía de Karisma en esta sesión [NV].)
7. **Modo asistente:** el líder puede abrir el bot desde su teléfono "con" el vecino; el vecino es quien da su consentimiento y el bot lo trata como usuario distinto.
8. **Tablero semanal** (por WhatsApp): casos activos, plazos de la semana, tasa de respuesta; sin datos personales.

### 5.5 Plan de lanzamiento por fases

| Fase | Tiempo | Qué se hace | Canales | Mensaje | Métricas de salida |
|---|---|---|---|---|---|
| **0. Co-diseño y pruebas** | Semanas 0-2 (en paralelo al hackathon) | 2-3 líderes como co-diseñadores; 8-10 vecinos prueban el flujo (guía de pruebas con usuarios de Stanford); validar lenguaje con método "validar" de la guía DNP; probar transcripción con 20-30 audios reales | Presencial, WhatsApp | "Ayúdenos a que esto sirva de verdad" | Comprensión ≥80 % (¿qué hace ahora? ¿cuándo vence?); tiempo a documento <8 min; 0 fallas críticas de plazo |
| **1. Piloto semilla** | Semanas 3-8 | 1-2 municipios con JAC activas y una emisora comunitaria; 10-15 líderes (JAC, conciliadores, jueces de paz); formación de 2 h con kit; meta 100-200 casos | Líder a vecino, impreso/QR, grupos de WhatsApp, 1 emisora | Mensajes ancla 1-3 | Peticiones radicadas con constancia; % que vuelve al recordatorio; % de respuestas dentro del plazo; MB por caso; satisfacción del líder |
| **2. Radio y alianzas** | Meses 3-6 | Capsulas semanales en 3-5 emisoras; Personería/Defensoría regional y consultorio jurídico como respaldo humano; probar iglesias, mercados campesinos y colegios rurales (hipótesis) | Radio + SMS de aviso del programa (patrón AFRRI) + cartelería | "Escuche, pregunte, reciba su documento" | Casos por 1.000 habitantes; % de nuevos usuarios que llegan por radio vs líder; retención de líderes a 60 días |
| **3. Escala por red** | Meses 6-12 | Cada líder formado forma a otro (modelo en cascada); IVR para quien no tiene smartphone; reportes agregados para incidencia | Red de promotores; IVR; panel web | "Una vereda más con respuesta" | Líderes activos/mes; casos por líder; costo por caso; incidentes de privacidad = 0 |

### 5.6 Métricas (hipótesis de partida, a recalibrar con el piloto)

- **Norte:** peticiones **con respuesta recibida dentro del plazo** por cada 100 iniciadas.
- **Activación:** % de conversaciones que llegan a un PDF generado (meta inicial 60 %).
- **Comprensión:** % que contesta bien "¿qué debe hacer ahora?" y "¿cuándo vence?" (≥80 %).
- **Eficiencia de datos:** MB medios por caso (<0,5 MB) y mensajes de servicio por caso.
- **Seguimiento:** % que confirma radicación con foto del sello; % que contesta el recordatorio del día 16.
- **Líderes:** activados, casos por líder por mes, retención 30/60/90 días.
- **Equidad:** % de usuarios con >60 años o que usaron solo audio.
- **Seguridad:** incidentes de datos = 0; tiempo medio de borrado tras cierre de caso.
- **Comparaciones:** audio vs texto (A/B) en tiempo y errores; con y sin líder presente; con y sin recordatorio SMS.

---

## 6. Recomendación final: el formato ganador del MVP

### 6.1 Arquitectura en capas

1. **Capa núcleo, WhatsApp "voz primero":** flujo determinista de 12 pasos, audios pregrabados por paso, botones y listas, confirmación de lo entendido, PDF, recordatorios por plantilla utility. Si hay tiempo y negocio verificado, un **Flow** nativo para los datos de identificación (una pantalla, ≤10 opciones).
2. **Capa de respaldo:** SMS saliente sin tildes: "Peticion 4F7K vence el 1-dic. Si no responden, avise por WhatsApp." (66 caracteres, un segmento GSM-7). Respuesta por palabra clave si el proveedor lo permite [NV]. Nunca nombres, cédula ni contenido.
3. **Capa humana:** el líder (modo asistente, tablero) y la Personería/consultorio jurídico como respaldo.
4. **Capa de difusión:** radio, impreso/QR, credencial.
5. **Capa de datos:** el mínimo; un identificador de caso; borrado programado; audio eliminado tras transcribir; sin cédula en logs; proveedor de IA sin retención de datos de entrenamiento [NV: confirmar contrato]; considerar "Local Storage" de la Cloud API.

### 6.2 Puntuación comparada (juicio propio, escala 1-5; 5 = mejor)

| Criterio | WhatsApp voz+PDF | SMS | USSD | IVR | PWA | Radio |
|---|---|---|---|---|---|---|
| Alcance real en rural | 4 | 5 | 5 | 5 | 2 | 4 |
| Sirve sin leer | 5 | 2 | 1 | 5 | 1 | 5 |
| Entrega el documento | 5 | 1 | 1 | 1 | 4 | 1 |
| Seguimiento de plazos | 5 | 4 | 2 | 3 | 3 | 1 |
| Bajo consumo de datos | 4 | 5 | 5 | 5 | 3 | 5 |
| Facilidad MVP | 5 | 3 | 1 | 3 | 2 | 2 |
| Costo por caso | 5 | 2 | 3 | 3 | 5 | 3 |
| Privacidad | 3 | 1 | 2 | 2 | 4 | 5 (no recoge datos) |
| **Total** | **36** | 23 | 20 | 27 | 24 | 26 |

(Las puntuaciones son criterio del autor, no datos; sirven para mostrar la lógica de decisión.) Radio y SMS puntúan alto en alcance, pero no tramitan nada; por eso son amplificador y respaldo.

### 6.3 Qué NO hacer en el MVP

- No lanzar un chat libre "pregúntame lo que quieras": choca con la política de Meta y con la evidencia de errores procesales graves.
- No depender de USSD (acuerdos con operadores) ni de una PWA como producto del vecino.
- No enviar el documento a la entidad en nombre del usuario sin su orden explícita y sin revisión legal; en el MVP el usuario o su líder lo radica.
- No poner nombres de líderes ni de veredas en piezas públicas sin su decisión informada.
- No prometer "gratis" sin matizar el consumo de datos.

### 6.4 Alcance realista para 48 horas

- **Sí:** número de prueba de Meta (o sandbox de Twilio), webhook, máquina de estados con los pasos 1-12, 8-10 audios pregrabados con TTS en español, PDF de una hoja, cálculo de plazos con tabla de festivos 2026, recordatorio simulado (plantilla de prueba), SMS saliente de un solo sentido, un QR y un volante, guion de radio de 30 s.
- **Simular y declarar como simulado:** envío a la entidad, radicación, Flow, IVR.
- **Pendiente de producción:** verificación del negocio, método de pago, exención de Meta para ONG (si aplica), convenios con Personería y emisoras, revisión jurídica de las plantillas y rutas.

---

## 7. Ejemplo de flujo conversacional: derecho de petición (12 pasos)

Caso ficticio: don Jairo, vereda La Esperanza; la tubería del acueducto veredal lleva tres meses rota y la alcaldía no responde. Texto del bot en lenguaje claro (trato de usted, frases cortas). Cada paso lleva texto breve y, cuando se indica, una **nota de voz de ≤25 s** con el mismo contenido. Los límites de UI respetan lo verificado de Meta: hasta 3 botones de respuesta; listas de máx. 10 filas con título ≤24 caracteres y descripción ≤72; textos de botón de lista ≤20 caracteres.

**1. Entrada (QR del líder o enlace) y presentación**
- Usuario: "Hola" (o un mensaje precargado por el QR).
- Bot (texto + voz 20 s): "Hola, soy el asistente de la red de promotores de su vereda. Le ayudo a escribir un derecho de petición. Es gratis y no necesita abogado."
- Botones: [Empezar] [Cómo funciona] [Hablar con mi líder]
- Principio: gratuidad y confianza desde el primer mensaje; una sola acción principal.

**2. Consentimiento breve y claro** *(texto exacto a validar por el informe de marco legal)*
- Bot (texto + voz): "Para hacer su documento necesito su nombre y su cédula. Solo los uso para esto y los borro 30 días después de cerrar su caso. ¿Está de acuerdo?"
- Botones: [Sí, estoy de acuerdo] [Más información] [No]
- Dato: se guarda la aceptación con fecha y hora; si elige "No", el bot ofrece hablar con su líder.

**3. Cómo prefiere contestar**
- Bot: "¿Cómo prefiere contestarme?"
- Botones: [Con audios] [Escribiendo] [Con mi líder al lado]
- Se guarda la preferencia; si elige audios, las siguientes preguntas se piden por voz y se confirman con botones.

**4. Urgencia y tema**
- Bot (voz): "Primero una pregunta importante: ¿hay riesgo para la vida o la salud de alguien hoy?"
- Botones: [Sí] [No] [No sé]
- Si responde "Sí": "Si hay peligro ahora, llame ya al 123 o vaya a urgencias. Después le ayudo con el documento, y lo marco como prioritario" (art. 20; número de emergencias a validar [NV]).
- Luego lista "¿De qué se trata?": "Salud: medicinas/citas", "Agua y servicios", "Vías y caminos", "Ayudas y subsidios", "Víctimas", "Tierras", "Educación", "Otro asunto". Cada fila con una descripción de ≤72 caracteres.

**5. A quién se lo pedimos**
- Bot (texto + voz): "¿A quién le va a pedir? Escoja una o dígamelo con un audio." (lista con sugerencias según el tema: alcaldía, empresa de acueducto, EPS, etc.; opción "No sé").
- Nota de tranquilidad: "Si se equivoca de entidad, esa entidad debe pasar su petición a la correcta en 5 días." (art. 21)
- Si no sabe, el bot propone la más probable y se lo confirma.

**6. Qué pasó (los hechos)**
- Bot (voz): "Cuénteme qué pasó, en un audio de hasta 1 minuto. Diga desde cuándo, dónde y a quién le afecta."
- Usuario: audio.
- Bot: transcribe y devuelve tres frases: "Entendí esto: 1) La tubería del acueducto de la vereda La Esperanza está rota desde hace tres meses. 2) No tenemos agua para cocinar ni para los niños. 3) Ya preguntamos en la alcaldía y no nos han respondido." Botones: [Así es] [Quiero cambiar algo]
- Principio: confirmar lo entendido.

**7. Qué quiere que hagan (la petición)**
- Bot: "¿Qué quiere que hagan? Puede escoger hasta 3." Lista: "Que lo arreglen", "Que me den una fecha", "Que me den copia de un documento", "Que me expliquen por qué", "Otra cosa (audio)".
- El bot adapta el plazo: copias o información = 10 días; consulta = 30; el resto = 15.
- Regla: la petición va numerada y en verbo de acción ("Reparar...", "Informar la fecha...").

**8. Datos de quien firma** *(campos del art. 16)*
- Bot (cuatro preguntas cortas, una por mensaje): nombre completo; número de cédula; dónde recibe la respuesta (vereda, dirección, correo o WhatsApp); teléfono.
- Cada dato se muestra en texto grande para confirmar. Cédula y dirección se guardan cifradas el tiempo mínimo.
- El bot aclara: "No tiene que citar leyes. La entidad no puede rechazar su petición por eso."

**9. Pruebas (opcional)**
- Bot: "¿Tiene fotos o papeles que ayuden? Envíelos ahora o toque [No tengo]."
- Se registran como lista de anexos; las fotos se comprimen; no se guardan después del cierre.

**10. Vista previa del documento**
- Bot: envía el **PDF de una hoja** (~20-100 KB), una **nota de voz de ~40 s que lo lee** y un resumen en texto: "Su documento dice: 1) Reparar la tubería... 2) Informar la fecha...".
- Botones: [Está bien] [Quiero cambiar algo] [Copiar a mano].
- Estructura del PDF (guía DNP): asunto en la primera línea; hechos en 3-5 frases; peticiones numeradas; una línea de fundamento ("Derecho de petición, artículo 23 de la Constitución y Ley 1755 de 2015"); relación de anexos; datos para recibir respuesta; espacio para firma.
- La opción "Copiar a mano" entrega una versión de letra grande para quien no tenga cómo imprimir.

**11. Dónde y cómo entregarlo**
- Bot (voz + texto): "Tiene tres formas: 1) Correo de la alcaldía: [correo]. 2) Ventanilla de la alcaldía: pida el sello de recibido y el número de radicado. 3) Con su líder o la Personería. Nadie puede negarse a recibirla. Tome una foto del sello y mándemela, yo la guardo."
- Botones: [Ya la entregué] [Entregaré después] [Necesito ayuda]
- Control de comprensión: "¿Entendió qué hacer ahora?" [Sí] [No, repetir en audio].

**12. Plazo y seguimiento**
- Bot (voz + texto): "¿Cuándo la entregó?" [Hoy] [Ayer] [Otra fecha].
- Con radicación el 9-nov-2026: "La alcaldía debe responder a más tardar el **martes 1 de diciembre de 2026** (15 días hábiles, sin contar sábados, domingos ni festivos). Le aviso tres veces y el último día le pregunto si le respondieron."
- Recordatorios (plantilla utility por WhatsApp; SMS de respaldo si el usuario lo pidió): jue 19-nov ("Faltan 8 días hábiles"), jue 26-nov ("Faltan 3 días hábiles"), mar 1-dic ("Hoy vence el plazo"), mié 2-dic ("¿Le respondieron?" [Sí, recibí] [No] [Me pidieron algo más]).
- Ramas del día 16:
  - "Recibí respuesta": el bot pide una foto de la respuesta y pregunta si resolvió su problema; cierra el caso y programa el borrado.
  - "No me han respondido": explica los pasos siguientes (definidos por el informe de marco legal) y ofrece conectar con la Personería o el consultorio jurídico.
  - "Me avisaron que necesitan más tiempo": debe haber sido **antes** del vencimiento y el nuevo plazo no puede pasar del doble (hasta el 23-dic-2026 en este ejemplo).
  - "Me pidieron más datos": el bot recuerda el plazo de 1 mes para completarlos (art. 17).
- SMS de respaldo de ejemplo: "Peticion 4F7K vence el 1-dic. Si no responden, avise por WhatsApp."

**Qué mide este flujo:** abandono por paso, minutos hasta el PDF, MB por caso, audios entregados/reproducidos (webhook de "reproducido"), % que confirma el sello, % que responde el día 16, comprensión en el paso 11.

---

## 8. Vacíos, supuestos y cosas por verificar

1. **Tarifas oficiales de Colombia** (rate card en COP) y confirmación de que el precio del mensaje de servicio es el de utility: solo cifras de terceros. Verificar en el rate card de Meta.
2. **Exención de mensajes de servicio para ONG comunitarias y gobierno** (1-oct-2026 a 31-dic-2027): descrita en la página de Meta, sin proceso de solicitud aún; no confirmada por segundas fuentes.
3. **Ventana de entrada gratuita:** 7 días (página de Meta) vs 72 horas (blogs).
4. **Requisitos exactos de la verificación del negocio** y de Flows (versión mínima de WhatsApp, comportamiento en teléfonos viejos).
5. **USSD, SMS bidireccional y números de voz en Colombia:** proveedores se contradicen o no hay datos; Africa's Talking no se pudo abrir (403). Confirmar con cada proveedor y con la CRC.
6. **SMS en español:** el límite de 70 caracteres por la tilde es conocimiento técnico estándar (GSM 03.38), no probado en esta sesión.
7. **Precisión de la transcripción** con español rural; no se pudo buscar evidencia (cupo de búsquedas agotado).
8. **Cómputo de plazos:** texto de la Ley 1755 dice "días siguientes"; "hábiles" proviene de la regla general de cómputo y de conceptos de Función Pública; revisar Ley 4 de 1913 art. 62 y Ley 2207 de 2022 en fuente oficial; calendario de festivos 2026 sin verificar.
9. **Cifras de analfabetismo funcional y de uso de notas de voz entre campesinos colombianos:** no existen en lo que encontré.
10. **Gamificación y adopción por iglesias, mercados campesinos y colegios rurales:** sin evidencia hallada; son hipótesis de piloto.
11. **Número y estado de emisoras comunitarias** y de la red de Emisoras de Paz: sin dato oficial actual.
12. **Nombres de marca** sugeridos: sin búsqueda de disponibilidad.
13. **Consentimiento, tratamiento de datos de voz y retención:** dependen del informe de marco legal (Ley 1581 de 2012 y normas de la SIC); aquí solo se fijan principios de diseño.
14. **Convenios** con Personería, Defensoría, universidades y emisoras: supuestos, no existen aún.

---

## 9. Fuentes

**Plataformas y canales**
- Meta, precios WhatsApp Business Platform: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- Meta, mensajes de audio/voz: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages
- Meta, mensajes de lista interactiva: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/interactive-list-messages
- Meta, guía de envío de mensajes (botones de respuesta): https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
- Meta, Flows (inicio y buenas prácticas): https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/gettingstarted ; https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/guides/bestpractices ; índice: https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/llms.txt
- Meta, privacidad y seguridad de la Cloud API: https://developers.facebook.com/documentation/business-messaging/whatsapp/data-privacy-and-security
- Meta, medios: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media
- Meta, primeros pasos: https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started.md
- Twilio, sandbox de WhatsApp: https://www.twilio.com/docs/whatsapp/sandbox
- Twilio, precios SMS Colombia: https://www.twilio.com/sms/pricing/co ; lineamientos de código corto: https://twilio.com/guidelines/co/short-code
- AWS End User Messaging, países de Sudamérica: https://docs.aws.amazon.com/end-user-messaging/latest/userguide/nx-supported-countries-south-america.html
- Plivo, cobertura Colombia: https://www.plivo.com/sms/coverage/co/ ; Infobip: https://infobip.com/news/colombia-portugal-and-bahrain-covered-with-2-way-sms ; Africa's Talking: https://help.africastalking.com/en/articles/5306296-what-does-africa-s-talking-do
- CRC (códigos cortos USSD/SMS): https://www.crcom.gov.co/sites/default/files/normatividad/00008247.pdf ; https://www.crcom.gov.co/sites/default/files/normatividad/00008218.pdf
- Mercately, cobro de mensajes de servicio: https://blog.mercately.com/?p=30248
- respond.io, política de chatbots 2026: https://respond.io/blog/whatsapp-chatbot-policy-2026 ; TechCrunch: https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform
- DataReportal Colombia 2026: https://datareportal.com/reports/digital-2026-colombia ; Portafolio: https://www.portafolio.co/tendencias/cuanto-tiempo-pasan-los-colombianos-usando-las-redes-sociales-ranking-lo-revela-624776 ; Telegram en Colombia: https://www.wmtips.com/technologies/instant-messaging/country/co/
- Zero-rating C-206/2025: https://www.elcolombiano.com/negocios/corte-internet-gratis-colombia-cambios-usuarios-operadores-LO27835835 ; https://www.enter.co/?p=572208

**Conectividad y alfabetización**
- DANE vía prensa: https://www.bluradio.com/tecnologia/mas-de-3-5-millones-de-nuevos-hogares-rurales-cuentan-con-internet-segun-el-dane-rg10 ; https://www.valoraanalitik.com/internet-en-colombia-en-2022-el-59-de-hogares-aumentaron-su-conexion/ ; https://dplnews.com/?p=117433
- Analfabetismo: https://www.portafolio.co/economia/regiones/la-geografia-que-define-quien-aprende-a-leer-en-colombia-75-de-los-analfabetas-en-colombia-se-reconoce-campesino-502222 ; informe LEE 137: https://www.javeriana.edu.co/recursosdb/d/lee/inf137-analfabetismo-dia-idioma-2026-lee

**Baja alfabetización y voz**
- Medhi, Prasad, Toyama (WWW 2007): https://archives.iw3c2.org/www2007/program/paper.php_id=764.html
- Medhi Thies, Sagar, Toyama (interfaces sin texto): https://www.microsoft.com/en-us/research/?p=160568 ; monografía de Medhi Thies (2015): https://courses.cs.washington.edu/courses/cse490c/18au/readings/medhi-thies-2015.pdf
- Viamo 3-2-1: https://www.gsma.com/mobilefordevelopment/wp-content/uploads/2015/03/Making-the-Most-out-of-your-Data-in-M4D_Case-Study-on-Airtel-and-HNIs-3-2-1-Madagascar-Service.pdf ; https://global.comminit.com/node/9567884
- WhatsApp y radio en Manizales: https://dialnet.unirioja.es/descarga/articulo/6815727.pdf ; https://revistas.udem.edu.co/index.php/anagramas/en/article/view/2263

**Legal Design y lenguaje claro**
- Stanford Legal Design Lab: https://justiceinnovation.law.stanford.edu/ ; Wise Messenger: https://justiceinnovation.law.stanford.edu/projects/messenger/ ; https://justiceinnovation.law.stanford.edu/projects/messenger/study ; guías visuales: https://justiceinnovation.law.stanford.edu/projects/visual-guides/ ; IA y acceso a la justicia: https://justiceinnovation.law.stanford.edu/projects/ai-access-to-justice/ ; rúbrica de calidad: https://justiceinnovation.law.stanford.edu/measuring-what-matters-a-quality-rubric-for-legal-ai-answers/ ; pruebas con usuarios: https://justiceinnovation.law.stanford.edu/resources/evaluation/user-testing/
- Hagan, *Law by Design*: https://www.lawbydesign.co/design-process/ ; Daedalus: https://www.amacad.org/publication/daedalus/participatory-design-innovation-access-justice ; Law + Design Workbook: https://atjlibrary.org/node/1476/resource-law-design-workbook-hagen-2017 ; https://www.openlawlab.com/2014/05/27/legal-design-workbook/
- DNP, Guía de lenguaje claro para servidores públicos de Colombia (copia SIC): https://sigi.sic.gov.co/SIGI/files/mod_documentos/anexos/221/GUIA%20DEL%20LENGUAJE%20CLARO.pdf ; compromiso OGP CO0029: https://www.opengovpartnership.org/members/colombia/commitments/CO0029 (403 al abrir; solo referencia del buscador)
- Asuntos Legales sobre ISO 24495-2: https://www.asuntoslegales.com.co/consultorio/transformacion-de-la-comunicacion-juridica-un-nuevo-estandar-internacional-para-la-implementacion-del-lenguaje-claro-4234060
- Jurisprudencia y lenguaje claro: https://franciscofajardoabogados.com/corte-constitucional-insta-a-las-autoridades-administrativas-a-cumplir-con-el-deber-de-motivacion-de-sus-decisiones-empleando-un-lenguaje-claro-y-comprensible/ ; https://derecho.uniandes.edu.co/sentencias-lenguaje-claro-y-lectura-facil-mecanismos-de-acceso-justicia
- Ley 1755 de 2015: https://www.unidadvictimas.gov.co/wp-content/uploads/Documentos/ley/Ley_1755_2015.pdf
- LegalApp: https://www.opengovpartnership.org/stories/legalapp-colombia-legal-guidance-with-just-one-click/ ; alianza con Puntos Vive Digital: https://mintic.gov.co/portal/inicio/Sala-de-prensa/Noticias/15159:Alianza-entre-LegalApp-y-Puntos-Vive-Digital-ha-orientado-juridicamente-a-mas-de-2-400-colombianos
- Nyaya Setu: https://www.outlookbusiness.com/ampstories/news/how-does-nyaya-setu-work-on-whatsapp-to-provide-instant-legal-guidance-explained ; Justo Bolívar: https://revistas.uninunez.edu.co/ergaomnes/es/article/download/2687/1819/6335 ; DoNotPay/FTC: https://about.getcoai.com/news/ftc-bans-donotpays-ai-lawyer-claims-and-orders-refunds

**Adopción comunitaria**
- Liberia (paralegales): https://fsi.stanford.edu/node/11025 ; IGC: https://www.theigc.org/project/law-without-lawyers-improving-access-to-justice-in-liberia-and-sierra-leone/
- Namati/Mozambique: https://pubmed.ncbi.nlm.nih.gov/32650772/ ; https://namati.org/wp-content/uploads/2015/02/Namati-who-we-are-how-we-work-where-were-going.pdf
- Digital Green: https://www.povertyactionlab.org/print/pdf/node/2061?lang=en ; https://digitalgreen.org/wp-content/uploads/2023/12/DG-Evidence-Review_Final-Report.pdf
- Farm Radio (AFRRI): https://commbox.org/document/the-new-age-of-radio-how-icts-are-changing-rural-radio-in-africa
- Radios comunitarias: https://www.elespectador.com/colombia-20/paz-y-memoria/las-radios-comunitarias-tienen-mucho-poder-para-proteger-el-liderazgo-social/ ; https://radionacional.co/cultura/dia-mundial-de-la-radio-radio-comunitaria-en-el-cauca-la-voz-que-construye-paz ; https://semana.com/mejor-colombia/articulo/emisoras-comunitarias-voces-de-paz-en-los-lugares-mas-apartados-de-colombia/202100/ ; https://www.lasillavacia.com/en-vivo/defensoria-del-pueblo-pide-reevaluar-la-suspension-de-20-emisoras-de-paz/ ; https://dplnews.com/?p=215279
- JAC: https://www.cundinamarca.gov.co/noticias/mas-de-4500-organismos-comunales-elegiran-a-sus-nuevos-dignatarios-en-116-municipios-de-cundinamarca
- Conciliadores y jueces de paz: https://ambitojuridico.com/sites/default/files/BancoMedios/Archivos/minjusticia-boletindeprensa-reformaleydeconciliacion.pdf ; https://bogota.gov.co/mi-ciudad/seguridad/bogota-hace-un-llamado-promover-la-financiacion-de-los-jueces-de-paz
- Líderes sociales (Indepaz y Defensoría): https://www.asuntoslegales.com.co/actualidad/entre-enero-y-agosto-fueron-asesinados-112-lideres-sociales-y-se-registraron-86-masacres-4491309 ; https://www.eluniversal.com.co/colombia/2026/08/03/asesinatos-de-lideres-sociales-golpean-a-432-municipios-de-colombia-segun-indepaz/ ; https://www.vanguardia.com/colombia/2026/08/03/la-violencia-contra-lideres-sociales-sigue-expandiendose-afecta-432-municipios-en-2026/
