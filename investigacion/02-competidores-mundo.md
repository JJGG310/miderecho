# 02 - Competidores y referentes en el resto del mundo (acceso a la justicia con canales de bajo consumo)

Fecha de la investigación: 20 de octubre de 2026.
Alcance: África, Asia, Norteamérica, Europa y Oceanía. Colombia y Latinoamérica los cubre otro frente (aquí solo se menciona, sin investigar, que Signpost opera allá).

## 0. Cómo leer este informe (método y nivel de confianza)

Cada dato lleva una etiqueta de verificación:

- **[V]** Verificado abriendo la fuente primaria u oficial (sitio del operador, documento gubernamental, paper revisado por pares, comunicado de un regulador).
- **[S]** Verificado en una fuente secundaria (prensa, directorios, ONG o donantes terceros).
- **[AUTO]** Cifra autoinformada por el operador. No hay evaluación independiente que la respalde.
- **[BUSC]** Dato que vi en el resumen de un buscador pero cuya fuente no pude abrir (403, 404 o error). Tómalo con cautela.
- **[NV]** No verificado.

Las URLs de operador marcadas "(no abierta)" son direcciones que conozco o que aparecieron en resultados de búsqueda, pero que no pude abrir para confirmar.

Limitaciones honestas:

- El cupo de búsquedas web de la sesión se agotó antes de terminar algunas verificaciones. Quedaron pendientes: detalles del piloto de IA de Signpost, el chatbot LIA de Legal Aid of North Carolina, el soporte de WhatsApp en RapidPro, Spot y Court Forms Online (Suffolk LIT Lab) y una fuente oficial (PIB) de Nyaya Setu. Se listan en la sección 6.
- Casi ningún producto tiene evaluación de impacto independiente. Las excepciones son el piloto de paralegales penales de Timap (Sierra Leona, Universidad de Oxford) y el estudio de Namati en Mozambique (BMC Public Health). Todo lo demás son cifras de los propios operadores.
- No encontré ningún servicio legal operativo por **USSD** que pudiera verificar. Molao365, EmpowerLine y la Grassroots Justice Network de Sudáfrica lo mencionan como plan o integración futura. Es un hallazgo relevante para el diseño (ver sección 4).
- No encontré incidentes de brechas de datos documentados en los productos revisados. Eso no significa que no existan. La afirmación de "cero brechas" de GJU es autoinformada.

## 1. Hallazgos clave (resumen ejecutivo)

1. **Lo que escala en zonas rurales es "intermediario humano + tecnología", no tecnología sola.** Tele-Law (India) usa operadores de centros de servicio en cada panchayat y voluntarios paralegales. Haqdarshak (India) usa agentes mujeres con app offline. Namati y Timap usan paralegales comunitarios. BarefootLaw tuvo que construir cajas físicas porque el canal digital solo llegaba a hombres urbanos (solo 6% de usuarios eran mujeres).
2. **El canal dominante de bajo consumo es la voz, no el SMS ni el USSD.** Citizens Advice (Reino Unido) atiende a 1,7 millones de personas por teléfono, frente a 928 mil por correo o chat. Tele-Law es voz o video asistido. EmpowerLine (Malawi) es un IVR gratuito. M-Haki (Kenia) usa SMS con respuesta humana en 48 horas.
3. **La mayor causa de muerte o parálisis es la dependencia de un solo donante.** M-Haki perdió el financiamiento de la embajada de Países Bajos en diciembre de 2019 y Kituo cha Sheria dijo que cobraría una "tarifa mínima" si no conseguía otro. Rechtwijzer (Países Bajos) cerró en 2017 por falta de tracción comercial y de subsidio público.
4. **Los modelos con ingreso diversificado duran más.** Haqdarshak vende B2B2C (RSE de empresas), cobra tarifas pequeñas por trámite y aspira a 20-30% de ingresos B2C. Sheria Kiganjani combina información gratuita con tarifas escalonadas por consulta con abogado.
5. **La IA generativa sin control ya tiene costo regulatorio y de calidad.** DoNotPay pagó 193.000 USD y no puede afirmar que reemplaza a un abogado sin evidencia (FTC, 2025). Una auditoría de un chatbot de tribunales de Nevada encontró que solo ~46% de las respuestas eran útiles y accionables (1% dañinas). Las herramientas con mejor reputación (JusticeBot, A2J Author, Gateway) son guiadas y deterministas.
6. **El riesgo de "ejercicio ilegal de la abogacía" es real.** Upsolve (EE.UU.) ganó una medida cautelar en 2022, pero el Segundo Circuito la anuló en 2025 y la Corte Suprema no aceptó revisarla en marzo de 2026 [BUSC]. Hay que diseñar el producto como información jurídica y elaboración guiada de documentos con abogado o consultorio jurídico en el circuito.
7. **La privacidad por diseño ya es una ventaja competitiva comprobable.** EmpowerLine promete anonimato sin registro. U-Report es anónimo. Justice Connect Gateway no recoge datos identificables hasta que el usuario acepta. Josef ofrece residencia de datos regional y certificaciones SOC 2 y GDPR.
8. **Hay piezas de código abierto reutilizables que evitan construir desde cero.** docassemble (MIT, con interfaz SMS), RapidPro (bien público digital de UNICEF, 5.000 millones de mensajes) y A2J Author (gratuito para tribunales y organizaciones legales).
9. **El legal design con evidencia más clara en entornos rurales de baja alfabetización es el contrato ilustrado** (Sudáfrica, trabajadores agrícolas) y el contenido en audio, video y lenguas locales (Nyaaya).

## 2. Fichas de productos (orden: África, Asia, Norteamérica, Europa, Oceanía, infraestructura global)

---

### 2.1 BarefootLaw (Uganda)

- **Operador:** BarefootLaw, organización sin ánimo de lucro de Kampala fundada en 2012 por Gerald Abila (algunas fuentes dicen 2013) [V/S].
- **URL:** https://www.barefootlaw.org
- **Canales:** nacieron con SMS y luego Facebook, Twitter, Skype y una línea de llamadas 24 horas [S, VOA, fecha no confirmada]; hoy también líneas gratuitas, radio comunitaria, divulgación presencial, TikTok, YouTube e Instagram [V] y las **BarefootLaw Boxes (LawBox)**: contenedores marítimos solares con computadores, internet y videollamada a abogados voluntarios en Kampala [V/S].
- **Offline / poco dato:** SMS, radio y llamadas son de bajo consumo. La Box sí necesita internet, pero se aisló de los cortes de luz con un microred solar de 14,25 kW en Bala, distrito de Kole (otras fuentes dicen 14,8 kW y 64,8 kWh de baterías; las fuentes discrepan) [S].
- **Flujo de usuario:** la persona contacta por teléfono, Facebook o la Box; el equipo la empareja con abogados voluntarios o pro bono; la ayuda va desde la consulta inicial hasta la intervención en procesos, sin costo [S, Rights CoLab]. En la Box hay mediación presencial con apoyo remoto de abogados [S]. Winnie, la IA de 2019, es una herramienta interna: paralegales o abogados asistentes clasifican la consulta, la IA sugiere un borrador de respuesta a partir de datos históricos y el abogado jefe aprueba (descripción de un proyecto de DSSG, en futuro, sin resultados medidos) [V].
- **Temas:** disputas de tierras entre agricultores, violencia doméstica, disputas de propiedad, resolución de conflictos, redacción de testamentos. En la Box de Bala: robo de ganado, pastoreo en terreno ajeno, contratos laborales incumplidos, linderos [S].
- **Modelo de negocio:** gratis para el usuario. Se sostiene con abogados voluntarios (pro bono o low bono) y donantes. La microred de Bala la financió SELF y una cuarta Box solar la financia la Morgridge Family Foundation (2025) [S/BUSC]. No hay presupuesto publicado.
- **Tracción [AUTO]:** unos 100 asuntos al día; más de 940.000 usuarios con información legal; cerca de 18.000 casos resueltos de forma conclusiva; meta de 50 millones de africanos para 2030 (Rights CoLab). "Casi un millón" de personas en la primera década (The Hague).
- **Estado:** activo (cobertura de agosto de 2026) [S].
- **Fortalezas:** reconocimiento institucional amplio; combina digital con presencia física; la IA ayuda a los abogados sin reemplazarlos; la Box genera un efecto secundario (energía para juzgados y policía vecinos).
- **Debilidades / lecciones de fracaso:**
  - En la etapa SMS, la demanda superó la capacidad de respuesta [V].
  - Un artículo de 2026 afirma que el SMS "falló por limitaciones técnicas" [S, una sola fuente].
  - En la etapa Facebook, los usuarios eran sobre todo hombres urbanos, solo 6% mujeres, con internet por debajo de 15% en el país en ese momento [V]. De ahí nació la Box.
  - Tiempo medio de respuesta de abogados de 72 horas, con meta de 24 [BUSC].
  - La Box depende de energía e internet, y sin la microred se caía el servicio [V].
- **Qué podemos robarle:**
  - El pipeline "paralegal clasifica, IA redacta borrador, abogado aprueba" para nuestro backend, desde el día uno.
  - Un **punto de justicia** en el salón comunal, la escuela o la sede de la Junta de Acción Comunal, con kit solar mínimo, para llegar a quien no tiene datos (validar infraestructura con el frente de Colombia).
  - Contenido en radio y en lenguaje de "escenarios locales", y una meta explícita de llegar a mujeres con un indicador propio.
  - Mediación como puerta de salida antes que el litigio (sugiere rutas de conciliación).

---

### 2.2 M-Haki, de Kituo cha Sheria (Kenia)

- **Operador:** Kituo cha Sheria ("Centre for Law" según Africa Legal), ONG fundada en 1973 por estudiantes de derecho de la Universidad de Nairobi [V]. M-Haki arrancó en 2016 [S].
- **URL:** https://m-haki.co.ke (al abrirla el 20-oct-2026 devolvió un error; estado actual **[NV]**). Ficha: https://civictech.africa/initiative/m-haki/
- **Canal:** SMS al número 0700777333. La pregunta se publica automáticamente en el sitio web, alojado en la plataforma Ushahidi [V, The Star 2020].
- **Offline / poco dato:** funciona con un celular básico y tarifa SMS estándar.
- **Flujo:** el usuario envía su pregunta por SMS; llega al sitio; un abogado (Kituo tiene abogados en Mombasa, Pangani y su sede) responde, normalmente en **48 horas**; el sitio tiene un mapa y categorías [V].
- **Temas:** tierras y sucesión, derechos laborales, refugiados y migración forzada, vivienda y desalojos, y una categoría general (jefes locales que piden sobornos, mala conducta policial o de abogados) [V].
- **Modelo de negocio:** lo financiaba la embajada de Países Bajos hasta diciembre de 2019; Kituo dijo en junio de 2020 que buscaría nuevo financiamiento o cobraría una "tarifa mínima" [V]. El artículo de Africa Legal dice que Kituo "enfrenta constantemente la reducción de apoyo de donantes" [V].
- **Tracción:** 1.156 asuntos recibidos por SMS entre enero y junio de 2021, y la versión de Ushahidi estaba desactualizada, con mejoras de confidencialidad e integración con Facebook pendientes de una versión nueva (informe anual 2022 vía Land Portal) [BUSC]. Red de Kituo: 16 centros de justicia, más de 14.000 paralegales comunitarios y 3.000 en cárceles, según Africa Legal [S, cifra alta; tómala con cautela].
- **Estado:** listado como activo al 8-mar-2022 [S]. Hoy **[NV]**.
- **Fortalezas:** SMS universal; datos agregados utilizables para incidencia; soporte de una red de paralegales ya existente.
- **Debilidades / lecciones:** dependencia de un solo donante; respuesta en 48 horas es lenta para urgencias; la pregunta se publica en un sitio público, lo que choca con la confidencialidad (la propia ONG lo reconoce como mejora pendiente); plataforma sin mantenimiento.
- **Qué podemos robarle:** el esquema "SMS entra, ticket categorizado sale, abogado responde con SLA claro"; la categorización temática para enrutar; el uso de datos agregados (mapa de problemas por vereda) como producto para incidencia; y, como contraejemplo, publicar consultas sin anonimizar y depender de un único financiador.

---

### 2.3 EmpowerLine, de la Gender and Justice Unit (Malawi)

- **Operador:** Gender and Justice Unit (GJU), fundada por la jurista Sarai Chisala-Tempelhoff. Lanzó EmpowerLine en abril de 2025 [BUSC/V].
- **URL:** https://genderandjustice.org (lanzamiento: https://genderandjustice.org/?p=1562)
- **Canal:** **IVR gratuito** (línea 4285 según los resultados de búsqueda y el informe 2025) que funciona en celulares básicos, más una app móvil [V]. El USSD figura solo como integración futura posible [V].
- **Offline / poco dato:** no requiere internet ni smartphone.
- **Flujo:** la persona llama, elige idioma entre chichewa, chitumbuka, chiyao e inglés, y navega por menús de voz. El servicio es **anónimo, sin registro ni rastro de datos** (afirmación del operador) [V/AUTO]. Hay 30 enlaces comunitarios con bicicletas y más de 500 "campeones" comunitarios que difunden el servicio [V/AUTO].
- **Temas:** violencia basada en género (la más consultada, 12% de las llamadas en vivo), derecho de familia (custodia y manutención), derechos sobre la propiedad, apoyo en embarazo [V].
- **Modelo de negocio:** apoyo plurianual de la Irene M. Staehelin Foundation; aval del Ministerio y conversaciones para integrarlo al presupuesto público [V/AUTO].
- **Tracción [AUTO, con cifras que se contradicen]:** 560 interacciones en vivo en unos 2,5 meses (promedio de 7,5 llamadas por día; 91,9% en lenguas locales; 78% de finalización; 2,2 minutos de duración media) según la página de lanzamiento. El informe anual 2025 dice "más de 2.859 usuarios". Una entrevista de Nation Online habla de unas 450 mujeres y 185 hombres [BUSC]. Disponibilidad de 99,2% autoinformada.
- **Estado:** activo; ganó el Segal Foundation Fighting for Justice Award 2026 [BUSC].
- **Fortalezas:** voz en lenguas locales, anonimato real, respaldo institucional (policía, judicatura, autoridades tradicionales promueven la línea) [V].
- **Debilidades:** volumen bajo; métricas inconsistentes entre documentos del propio operador (señal de que la instrumentación de analítica no estaba lista); hay discrepancia sobre quién llama: techtrendske dice que la mayoría de llamantes son hombres que consultan por herencia y manutención, mientras la página de lanzamiento de GJU dice 61,8% mujeres entre quienes dieron datos demográficos [AUTO]; un anuncio fue leído como "solo para mujeres" y generó reacción adversa [S].
- **Qué podemos robarle:** anonimato por diseño ("sin registro, sin rastro"); menús de voz en la lengua local; la figura del **enlace comunitario con bicicleta** como puente entre la línea y la persona; y el consejo opuesto: definir desde el inicio qué es un "usuario" y medirlo igual en todos los informes.

---

### 2.4 Sheria Kiganjani (Tanzania)

- **Operador:** Sheria Kiganjani Company Ltd., de Dar es Salaam, fundada en 2018 por Neema Magimba y cofundadores [S].
- **URL:** https://sheriakiganjani.co.tz (no abierta). Ficha: https://techindex.law.stanford.edu/companies/sheria-kiganjani
- **Canales:** web, app móvil, **SMS e IVR**, en suajili e inglés [S, Stanford CodeX TechIndex]. Chat con abogado las 24 horas y mapa de abogados cercanos [BUSC, VC4A].
- **Offline / poco dato:** SMS e IVR son de bajo consumo; no hay datos de cómo funcionan.
- **Flujo:** información jurídica simplificada gratuita, plantillas de documentos y conexión con profesionales verificados [S].
- **Modelo de negocio:** comisión por transacción y servicios; clientes objetivo: firmas de abogados y consumidores [S]. Un artículo dice que se asoció con Vodacom para aparecer dentro de la app M-Pesa con tarifas escalonadas por consulta, mientras la información básica sigue gratuita [S, una sola fuente; no pude confirmarlo en otra: **[NV]**].
- **Tracción [AUTO, BUSC]:** más de 2 millones de tanzanos alcanzados y más de 800 consultas legales al mes.
- **Estado:** listado como activo [S].
- **Fortalezas:** multicanal con IVR/SMS; modelo freemium; directorio de abogados.
- **Debilidades:** no hay cifras independientes ni confirmación de que el IVR y el SMS estén operativos hoy.
- **Qué podemos robarle:** el esquema **información gratis + trámite pago** distribuido por un canal financiero de uso masivo (si esa alianza se confirma, el equivalente colombiano serían billeteras móviles; validar con el otro frente); mapa de abogados y consultorios jurídicos cercanos.

---

### 2.5 Namati y Timap for Justice (Sierra Leona, Mozambique, Kenia, India, Myanmar, otros)

- **Operador:** Namati (organización de "empoderamiento legal" fundada en 2011 por Vivek Maru, que también cofundó Timap en 2003). Timap for Justice (Sierra Leona) es el programa pionero. En Mozambique, Namati pasó a ser una organización independiente llamada **Matimba** [V].
- **URL:** https://namati.org · Red: https://grassrootsjusticenetwork.org
- **Canal:** paralegales comunitarios presenciales. Sus herramientas de datos son un **formulario de ingreso en papel más una plataforma web multiusuario** de registro de casos (Sierra Leona); también exploraron Casebox [S]. No encontré una app offline propia de Namati.
- **Offline / poco dato:** el modelo no depende de conectividad; los datos se digitalizan después.
- **Flujo:** el paralegal vive en la comunidad, recibe el caso, lo registra en un formulario estándar y un registro de acciones, negocia o media con la autoridad, escala a un abogado si es necesario y el caso entra a una base de datos usada para incidencia en políticas [V/S]. En Mozambique, los "Health Advocates" trabajan con Comités de Salud de la Aldea y agrupan como **caso colectivo** cualquier problema que afecte a más de 10 personas [V].
- **Temas:** tierras y medio ambiente, salud, ciudadanía, y en Timap además justicia penal en comisarías y cárceles.
- **Modelo de negocio:** donantes y fundaciones; no hay cifras de costo por caso en las páginas revisadas [V].
- **Tracción:**
  - Namati y socios: más de 5 millones de personas beneficiadas y más de 75 cambios en leyes y políticas [AUTO].
  - **Mozambique [V, BMC Public Health 2020, revisado por pares]:** 41 Health Advocates en 19 de los 128 distritos; **3.706 de 4.877 casos resueltos (≈76%)** entre marzo de 2013 y marzo de 2019; casi la mitad de los clientes entrevistados quería más seguimiento.
  - **Timap penal [V, evaluación cuasiexperimental de la Universidad de Oxford, ficha de OSJI 2013]:** reducción de **20%** en la proporción de detenidos en prisión preventiva y aumento de **13%** en el uso de fianza policial; unos 10 paralegales llegaron a ~70% de las personas que pasaban por las comisarías de 3 distritos. En 2011 Sierra Leona aprobó su primera Ley de Asistencia Legal, que reconoce a los paralegales.
- **Estado:** activo (Namati publicó un informe de impacto 2025). No pude confirmar el estado actual de Timap como organización: **[NV]**.
- **Fortalezas:** es el modelo con mejor evidencia de impacto; costo bajo en lugares con pocos abogados (Sierra Leona tenía menos de 400 abogados, uno por cada ~15.000 personas); los datos de casos se convierten en leyes y políticas.
- **Debilidades:** depende de financiamiento filantrópico; fallas de seguimiento al cliente; los funcionarios desconfían al principio y la confianza toma años; las soluciones locales a veces dependen de ciclos presupuestales.
- **Qué podemos robarle:**
  - Currículo de paralegal comunitario, registro de caso en papel que luego se digitaliza y registro de acciones.
  - **Casos colectivos** (por ejemplo, un derecho de petición colectivo de una vereda por una vía o un servicio).
  - Cerrar el ciclo con el cliente (aviso de resultado), porque la mitad quería más seguimiento.
  - Convertir los datos agregados en incidencia ante la autoridad local.
  - Empezar con líderes sociales como paralegales: es exactamente lo que valida esta evidencia.

---

### 2.6 Haqdarshak (India)

- **Operador:** Haqdarshak Empowerment Solutions (HESPL), empresa social con fines de lucro, India [V].
- **URL:** https://haqdarshak.com (devolvió 503 al abrirla). Ficha: https://acumen.org/case-studies/haqdarshak/ y https://solve.mit.edu/solutions/84965
- **Canales:** agentes de campo ("Haqdarshaks", en su mayoría mujeres de grupos de ahorro) que visitan hogares con una **app Android híbrida que funciona offline**, en 12 a 14+ idiomas, con un motor de elegibilidad sobre más de 7.000 programas gubernamentales, un chatbot de WhatsApp y una "tarjeta Yojana" con código QR que enlaza al perfil del ciudadano [V, Solve]. Buscador de bienestar con voz y texto en idiomas indios [S, NITI Aayog].
- **Offline / poco dato:** sí (app offline, QR impreso).
- **Flujo:** el agente tamiza gratis a la familia, identifica los programas a los que califica, revisa documentos y puede tramitar la solicitud por una tarifa pequeña; el ciudadano también puede aplicar solo [V].
- **Temas:** acceso a beneficios y derechos sociales (pensiones, seguros, becas, documentos) más que justicia en sentido estricto. Es el análogo más cercano a "derechos de petición y trámites".
- **Modelo de negocio [V, Solve, AUTO]:** B2B2C (empresas, filantropías y organizaciones de impacto financian por RSE; clientes 2023-24: Colgate Palmolive, Tata Steel, Hindustan Unilever); transición hacia B2C con tarifas a ciudadanos; ingresos de 1,4 millones USD (2020-21) a 4,2 millones USD (2023-24); proyección de 20-30% de ingresos B2C. Inversionistas: Acumen, Beyond Capital, 3i Partners, Upaya, Innovating Justice Fund (HiiL), Village Capital. Compromiso 2025 en la Clinton Global Initiative: 100 millones de familias en India, Kenia, Brasil, Indonesia y Sudáfrica [BUSC].
- **Tracción [AUTO, cifras que cambian por fecha]:** Acumen: 6,3 millones de ciudadanos, 2.100 millones USD en beneficios desbloqueados, más de 25.000 agentes formadas. Solve: más de 6 millones de ciudadanos, 699 distritos, 45.000+ agentes (80% mujeres). NITI Aayog: 7,6 millones de familias, 21 estados, 2.200 millones USD, 52.000 agentes (36.000 mujeres).
- **Ingreso del agente [AUTO]:** promedio de 3.300 rupias al mes por 70-75 horas de trabajo (resumen de LEAD/IFMR [BUSC]); una agente destacada gana unas 10.000 rupias (~120 USD) [V, Acumen]; encuesta propia de 2020: 90% dice poder mejorar el ingreso familiar y 94% siente más respeto en su comunidad.
- **Estado:** activo, en expansión (planea Kenia) [V].
- **Fortalezas:** modelo de negocio probado con empresas pagando; mujeres como agentes (un estudio Lean Data de Omidyar les hizo cambiar de agentes hombres a mujeres); app offline.
- **Debilidades / lecciones:**
  - En el piloto de Chhattisgarh se capacitó a 5.077 mujeres de grupos de ahorro, pero solo ~1.000 estaban activas y habían recibido más de 100.000 solicitudes (LEAD [BUSC]). Capacitar no es activar.
  - Ingreso bajo por agente.
  - Sin evaluación independiente publicada; cifras de beneficios "desbloqueados" son estimaciones.
- **Qué podemos robarle:**
  - **Tarjeta de ruta con QR** (impresa o por WhatsApp) que lleva el perfil y el trámite.
  - Motor de elegibilidad simple (árbol de decisión) para rutas legales.
  - Financiar con RSE de empresas del territorio (agro, energía, minería) y cobrar tarifas mínimas por trámite asistido.
  - Ingreso por trámite para el líder agente (incentivo económico, no solo voluntariado).
  - Prueba Lean Data en la validación del piloto.

---

### 2.7 Tele-Law, Nyaya Bandhu y Nyaya Setu (India, gobierno)

- **Operador:** Ministerio de Derecho y Justicia, Departamento de Justicia, bajo el esquema DISHA; CSC e-Governance Services para la red de centros [V].
- **URL:** https://tele-law.in (no abierta) · Ficha oficial PIB: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2023/sep/doc202391247601.pdf
- **Canales:** videoconferencia o teléfono en **Centros de Servicio Común (CSC) a nivel de panchayat**; app ciudadana "Tele-Law" desde el 13-nov-2021 en inglés y los 22 idiomas oficiales; **Nyaya Setu por WhatsApp** (número 7217711814, aparece como "Tele-Law"), anunciado alrededor del 1-ene-2026, que da información y orientación básica, no asesoría personalizada [V/S]. La fecha de inicio de Nyaya Setu es inconsistente entre fuentes (agosto de 2024 en unas, agosto de 2025 en otras) y el número difiere en una fuente: **[NV] fecha exacta**.
- **Offline / poco dato:** es asistido y presencial en el último tramo; el ciudadano puede usar el teléfono del centro.
- **Flujo [V]:** el ciudadano llega al CSC; el **Village Level Entrepreneur (VLE)** que lo opera lo registra con un abogado del panel; los **Para Legal Volunteers (PLV)**, preferiblemente mujeres, hacen divulgación y puente; el abogado da asesoría previa al litigio por video o teléfono; un tablero en tiempo real registra la naturaleza de los casos.
- **Temas:** asesoría previa al litigio sobre disputas civiles y familiares, violencia doméstica, derecho penal básico [S].
- **Modelo de negocio:** gratuito para el ciudadano en la versión actual; financiado por el gobierno. Antes, solo quienes calificaban a la ayuda legal gratuita no pagaban y los demás una tarifa nominal [BUSC]. Tele-Law 2.0 (25-ago-2023) se fusiona con **Nyaya Bandhu** (abogados pro bono) [V].
- **Tracción:**
  - Inició el 20-abr-2017 con 1.800 CSC en 170 distritos de 11 estados.
  - 50,33 lakh (≈5 millones) de beneficiarios a 30-ago-2023 [V, PIB].
  - 1.08.69.661 (≈10,9 millones) a febrero de 2025, según respuesta parlamentaria [BUSC]; 8.783 abogados pro bono registrados en Nyaya Bandhu a enero de 2025 [BUSC].
  - Meta oficial: 1 crore (10 millones) para 2026, que según estos datos ya superó.
  - Inconsistencia: el PIB habla de 2,5 lakh CSC y una respuesta parlamentaria habla de 2,5 lakh gram panchayats; no pude conciliarlo.
- **Estado:** activo [V].
- **Fortalezas:** escala nacional; usa infraestructura existente (CSC); las mujeres voluntarias paralegales son un puente de confianza; tablero de datos en tiempo real.
- **Debilidades:** no encontré evaluación independiente de calidad; el contenido de Nyaya Setu se describe como información, no asesoría; los reportes iniciales de usuarios mencionan errores de acceso [S].
- **Qué podemos robarle:** apoyarse en **puntos digitales comunitarios ya existentes** (casas comunales, puntos de conectividad, bibliotecas; validar cuáles existen en Colombia con el otro frente), el rol del facilitador local y de la voluntaria paralegal, y un tablero abierto que muestre tipos de casos para pedir respaldo institucional.

---

### 2.8 Nyaaya (India)

- **Operador:** Nyaaya, incubado en el Vidhi Centre for Legal Policy; fundado en noviembre de 2016 por impulso de Rohini Nilekani [V].
- **URL:** https://nyaaya.org/about/
- **Canales:** sitio de acceso abierto en inglés, hindi y kannada, con contenido escrito, **audio y video**; un helpline por WhatsApp (la página lo menciona, no pude confirmar los detalles de operación) [V].
- **Offline / poco dato:** la página no menciona formatos offline ni PDF.
- **Flujo / contenido:** explicaciones jurídicas en nueve temas, guías paso a paso, formularios y plantillas, glosario, preguntas frecuentes y una sección "Pregunta a Nyaaya" [V].
- **Estrategia comunitaria [V]:** contenido adaptado por audiencia y difundido por organizaciones aliadas y líderes comunitarios convertidos en **"campeones legales"**; **Samvidhaan Fellows** (abogados de distrito) apoyan a comunidades de base; red de abogados, expertos y estudiantes (voluntarios de cuatro universidades de derecho).
- **Modelo de negocio:** filantrópico (Rohini Nilekani Philanthropies, Tata Trusts, Rahul Matthan). No hay cifras publicadas.
- **Tracción:** la página no entrega métricas de usuarios.
- **Estado:** activo (sitio accesible al 20-oct-2026).
- **Fortalezas:** contenido en lengua local con formato audiovisual; reconoce que más de 30 crore de indios no saben leer y solo 10,6% habla inglés, y por eso agrega intermediarios.
- **Debilidades:** sin métricas; el helpline de WhatsApp no está documentado.
- **Qué podemos robarle:** **líderes como "campeones legales"** con capacitación corta; **fellows abogados por municipio** (equivalente a consultorios jurídicos universitarios y personerías); contenido en audio para población con baja lectura; plantillas descargables.

---

### 2.9 DoNotPay (EE.UU.)

- **Operador:** DoNotPay, Inc. (consumidor, suscripción).
- **URL:** https://donotpay.com (no abierta)
- **Canal:** app web y móvil por suscripción. No es un producto para población rural ni de bajo dato.
- **Flujo:** servicio por suscripción que se promocionaba como "el primer abogado robot del mundo" [V, FTC]. El detalle del tipo de trámites que automatiza (cartas y reclamos de consumo) es descripción general, no verificada en las fuentes que abrí [NV].
- **Modelo:** suscripción pagada por el usuario.
- **Hecho verificado [V, FTC]:** la FTC presentó la queja en septiembre de 2024 y aprobó la orden final 5-0 el 16-ene-2025 (anunciada el 11-feb-2025). Alegó que DoNotPay no probó que su IA igualara el desempeño de un abogado ni contrató abogados para probar calidad y exactitud. Orden: **193.000 USD** de reparación; notificar a quienes se suscribieron entre 2021 y 2023; prohibido afirmar que equivale o supera a un abogado sin evidencia sólida.
- **Estado:** operando, bajo la orden de la FTC. Estado comercial actual **[NV]**.
- **Fortalezas:** hizo visible el valor de automatizar cartas y trámites repetitivos.
- **Debilidades / lección central:** prometer más de lo que se probó. No hubo pruebas de calidad independientes.
- **Qué podemos robarle (a modo de advertencia):** nunca decir "reemplaza al abogado"; documentar pruebas de calidad con abogados antes de lanzar; mostrar siempre "esto es información, no asesoría" y la ruta a una persona.

---

### 2.10 A2J Author y LawHelp Interactive (EE.UU.)

- **Operador:** CALI (Center for Computer-Assisted Legal Instruction) y el Center for Access to Justice & Technology de IIT Chicago-Kent.
- **URL:** https://kentlaw.iit.edu/institutes-centers/center-for-access-to-justice-and-technology/a2j-author · https://www.cali.org/content/a2j-author
- **Canal:** web. No hay interfaz SMS. El soporte móvil no está documentado en las páginas que abrí.
- **Flujo [V]:** entrevistas guiadas con preguntas en lenguaje sencillo, una por vez, que ensamblan un documento listo para imprimir y presentar. La investigación detrás de la herramienta concluye que **las entrevistas simples funcionan mejor** para este público.
- **Modelo:** gratuito para tribunales, facultades de derecho y organizaciones de servicios legales [V].
- **Tracción [AUTO, BUSC]:** más de 1.000 entrevistas guiadas activas en el servidor nacional (LawHelp Interactive y a2j.org); usado más de 7 millones de veces desde 2005; más de 4 millones de personas y más de 2,6 millones de documentos generados (las cifras no se concilian). En 2014 se informaba que LawHelp Interactive había ayudado a casi 2,5 millones de personas en menos de 10 años.
- **Estado:** activo.
- **Fortalezas:** gratuito; metodología con investigación de usabilidad; los abogados y estudiantes pueden crear entrevistas.
- **Debilidades:** no es móvil/SMS por diseño; se centra en formularios judiciales de EE.UU.
- **Qué podemos robarle:** la interfaz "una pregunta por pantalla" y la salida como **documento imprimible** (derecho de petición listo para firmar e imprimir en el punto digital o la papelería del pueblo).

---

### 2.11 docassemble y Assembly Line (EE.UU., código abierto)

- **Operador:** proyecto de código abierto creado por el abogado y programador Jonathan Pyle; Assembly Line es un paquete de docassemble del Suffolk University Law School LIT Lab [S].
- **URL:** https://docassemble.org · https://docassemble.org/docs/sms.html
- **Canal [V]:** entrevista web **y también interfaz SMS completa** (el usuario inicia una entrevista enviando una palabra clave a un número de Twilio y sigue hasta terminar). Soporta varios idiomas.
- **Costo [V]:** software gratuito con licencia MIT; los costos son de alojamiento y del proveedor de SMS.
- **Flujo:** las entrevistas se escriben en YAML con Markdown y Python simple; un abogado sin ser programador puede escribirlas [V].
- **Offline:** la página no lo trata; es un servidor web.
- **Tracción:** no verificada en las páginas oficiales. La relación con Massachusetts Court Forms Online quedó pendiente de verificar **[NV]**.
- **Fortalezas:** reutilizable; interfaz SMS nativa; multilingüe; sin licencias.
- **Debilidades:** exige alojar un servidor y un proveedor de SMS (en Colombia, un agregador local); curva técnica para el equipo.
- **Qué podemos robarle:** usarlo como **motor de entrevista guiada** para rutas legales (derecho de petición, tutela simple) con salida por SMS o WhatsApp en lugar de construir un motor propio.

---

### 2.12 Upsolve (EE.UU.)

- **Operador:** Upsolve, organización sin ánimo de lucro de herramientas para quiebra de consumidores; su proyecto "American Justice Movement" capacitó a no abogados para dar orientación sobre deudas [V].
- **URL:** https://upsolve.org (no abierta)
- **Hecho verificado [V/BUSC]:** en mayo de 2022 un juez federal de Nueva York concedió una medida cautelar porque la Primera Enmienda probablemente protege el consejo de los no abogados en un alcance estrecho ("limitado a asesoría fuera de tribunales") [V, ABA Journal]. El Segundo Circuito anuló la medida en septiembre de 2025 y la Corte Suprema rechazó revisar el caso el 30-mar-2026 [BUSC, Bloomberg Law]. Aparte, un tribunal de quiebras de Maryland consideró que casi todas las funciones de su software no eran ejercicio de la abogacía, salvo el "Exemption Editor" [BUSC].
- **Estado:** operando; alcance actual **[NV]**.
- **Lección:** el riesgo de ejercicio ilegal de la profesión se mueve por función concreta del software, no por el rótulo.
- **Qué podemos robarle (advertencia):** diseñar el servicio como información jurídica y elaboración guiada de documentos, con abogado o consultorio jurídico revisando; consultar un jurista colombiano sobre el régimen aplicable antes de lanzar (no investigado aquí).

---

### 2.13 Stanford Legal Design Lab y Wise Messenger (EE.UU.)

- **Operador:** Legal Design Lab, Stanford Law School.
- **URL:** https://justiceinnovation.law.stanford.edu
- **Qué ofrece [V]:** guías de usuario gratuitas (guía de rediseño de citaciones judiciales, guía de evaluación y rediseño de formularios, tablero de evaluación de sitios de ayuda legal), la iniciativa "AI & Access to Justice" y el repositorio **JusticeBench** para evaluar IA de ayuda legal, y una red de más de 1.400 profesionales de justicia.
- **Canal relevante [V]:** **Wise Messenger**, herramienta de mensajes de texto para que tribunales y organizaciones envíen recordatorios de plazos, hagan ingreso en línea y orienten al usuario. Un ensayo aleatorizado sobre recordatorios por texto sigue en curso, sin resultados publicados [BUSC].
- **Tracción / evidencia:** el plan de modernización para el Tribunal Superior de Los Ángeles se apoyó en 150.000 casos de desalojo y más de 100 entrevistas a usuarios [BUSC].
- **Qué podemos robarle:** metodología de legal design lista (guías), una forma de **evaluar nuestro bot** con casos de prueba y calificadores humanos, y los recordatorios por texto como complemento para evitar que se venzan plazos de respuesta.

---

### 2.14 JusticeBot (Canadá, Quebec)

- **Operador:** Laboratorio de Cyberjusticia de la Universidad de Montreal con el Tribunal administratif du logement (TAL) y Aide juridique de Montréal et Laval [V].
- **URL:** https://cyberjustice.openum.ca/en/justicebot/
- **Canal:** web y celular. Hay una versión JusticeBot+ con dictado por voz y reconocimiento de imágenes (para fotos de daños), pero no hay un canal SMS [V].
- **Flujo:** el usuario elige su rol (arrendador o arrendatario), responde preguntas, el sistema combina razonamiento por reglas y por casos, **explica las respuestas, cita los textos legales y muestra casos similares** [V].
- **Modelo:** gratuito; financiado por el Ministerio de Economía e Innovación de Quebec [V].
- **Tracción:** "miles de usuarios" según el paper y el TAL recibe más de 70.000 reclamos al año [BUSC].
- **Estado:** activo [V].
- **Fortalezas:** determinista y explicable; metodología publicada (arXiv 2308.02032); sin riesgo de alucinación.
- **Debilidades:** exige modelar a mano cada tema legal; solo en vivienda; sin canal de bajo dato.
- **Qué podemos robarle:** el principio "**explicar y citar la norma**" en cada respuesta; la combinación de árbol de decisión con casos similares; la metodología para ir tema por tema (un solo derecho de petición bien hecho antes que todo el derecho).

---

### 2.15 Citizens Advice (Reino Unido)

- **Operador:** Citizens Advice, red benéfica nacional con servicios locales independientes.
- **URL:** https://www.citizensadvice.org.uk
- **Canales [V, 2024-25]:** teléfono (1,7 millones de personas), correo y chat (928.000), presencial (627.000) y 51,7 millones de visitas web. Línea Help to Claim 0800 144 8444 gratuita [S].
- **Tracción [V, AUTO]:** 2,71 millones de personas atendidas en asesoría individual; 19.600 voluntarios y 10.000 empleados en unas 1.900 ubicaciones; ahorro de al menos 783 millones de libras para el gobierno y servicios públicos; 13,48 libras de beneficio al cliente por cada libra gastada; 85% de los usuarios de servicios locales lo recomendaría.
- **Modelo:** no está en la página; la fuente de financiamiento es **[NV]**.
- **Estado:** activo.
- **Fortalezas:** voluntariado capacitado a escala; datos de retorno de inversión que convencen a financiadores.
- **Debilidades:** no es un modelo de bajo dato ni rural; depende de una infraestructura de décadas.
- **Qué podemos robarle:** (1) indicadores de retorno social (ahorro público y beneficio por peso invertido) para el pitch a financiadores; (2) el hecho de que **incluso en el Reino Unido el teléfono sigue siendo el canal más usado**, lo que refuerza priorizar voz y WhatsApp de audio sobre apps.

---

### 2.16 Rechtwijzer (Países Bajos) - cerrado

- **Operador:** HiiL (The Hague Institute for Innovation of Law), el Consejo Neerlandés de Asistencia Legal y la plataforma Modria. Resolución en línea de divorcios y separaciones [V/S].
- **URL (análisis HiiL):** https://www.hiil.org/?p=2807
- **Estado:** **cerrado.** HiiL, Modria y el Consejo anunciaron en marzo de 2017 el fin de su cooperación; surgió un sucesor llamado Justice42 centrado solo en divorcio holandés [S].
- **Por qué cerró [S, versiones distintas]:**
  - Tracción comercial insuficiente: llegó al 2-3% del mercado de separaciones (picos de 5% tras prensa) [V].
  - Falta de subsidio público y de autofinanciamiento.
  - Sus instituciones aliadas no estaban listas: el consejo de asistencia legal gasta entre 80% y 95% de su presupuesto en abogados; los tribunales digitalizan procedimientos existentes; la regulación limita a los despachos de abogados [V].
  - Era difícil lograr que la otra parte participara.
  - La plataforma de Modria se pensó para disputas de comercio electrónico y hubo que adaptarla a separaciones, que son mucho más largas [S].
- **Resultados para el usuario [V, HiiL]:** cerca de 60% de quienes iniciaron lograron que la pareja participara y finalizaron acuerdos; 84% se sintió con más control; 72% la calificó 8/10 o más; tiempo medio de 24,3 horas frente a meses en tribunal.
- **Lección:** el producto funcionó para usuarios pero no como negocio ni como política pública. Se quiso hacer demasiado a la vez; HiiL reconoce que "no se puede hacer todo al mismo tiempo".
- **Qué podemos robarle (como advertencia):** empezar con **una sola ruta legal**, asegurar desde el inicio quién paga (financiador público o privado) y cuál es la institución aliada.

---

### 2.17 Signpost (International Rescue Committee, global)

- **Operador:** IRC, nacido en Grecia en 2015 con Mercy Corps [S]. (En Colombia opera como InfoPalante, que cubre el otro frente.)
- **URL:** https://www.signpost.ngo · https://www.rescue.org/node/6208
- **Canales:** redes sociales y sitios con mensajería en dos sentidos; en WhatsApp, un número con respuesta automática por temas (apoyo legal, vivienda) y opción de hablar con una persona, apoyado en Twilio Flex [S, Twilio].
- **Tracción [AUTO]:** 20 países, 25 idiomas, 19 millones de usuarios de la información y 500.000 sesiones de ayuda de dos vías (signpost.ngo [V]).
- **Piloto de IA [S/BUSC]:** chatbots con IA en El Salvador, Kenia, Grecia e Italia, en 11 idiomas, con respuestas validadas por organizaciones locales y escalamiento a personas para casos complejos o delicados.
- **Datos personales:** la página no detalla la política de protección de datos **[NV]**.
- **Estado:** activo.
- **Qué podemos robarle:** la combinación "bot por temas + escalamiento a persona + contenido validado por organizaciones locales" y revisión humana de cada actualización.

---

### 2.18 Justice Connect Gateway (Australia)

- **Operador:** Justice Connect (organización sin ánimo de lucro; red de unos 10.000 abogados pro bono) [V].
- **URL:** https://justiceconnect.org.au (no abierta) · https://good-design.org/projects/justice-connect-gateway-project/
- **Qué es:** proyecto de 2016 a 2019 con investigación de seis grupos de usuarios; produjo un sitio con rutas separadas para quien busca ayuda y para quien deriva, un **sistema de ingreso en línea**, un sistema de derivación y un portal pro bono que empareja casos con abogados [V]. El ingreso toma menos de 10 minutos [S].
- **Privacidad por diseño [V]:** el ingreso guiado **no recoge datos identificables hasta que la persona decide continuar**.
- **Financiación [S]:** comenzó con 250.000 dólares australianos de Google en 2017.
- **Tracción:** premio Good Design Gold 2019 (Impacto Social); **no hay cifras publicadas** de solicitantes atendidos o tiempo ahorrado en las páginas que revisé [V].
- **Estado:** Justice Connect sigue activa (publicó una encuesta de usuarios en 2024); el estado del Gateway como tal es **[NV]**.
- **Qué podemos robarle:** (1) **ruta para "derivadores"**: líderes sociales y funcionarios que derivan casos con un formulario corto; (2) triaje en menos de 10 minutos; (3) no pedir datos personales hasta tener consentimiento explícito.

---

### 2.19 Josef (Australia)

- **Operador:** Josef (plataforma sin código de automatización legal, fundada en 2017; recaudó 2,5 millones USD en 2021, 3,5 millones en total [S]).
- **URL:** https://joseflegal.com
- **Qué hace [V]:** permite a equipos legales (incluidos servicios de ayuda legal y centros jurídicos comunitarios, como Housing Court Answers y Everyday Justice) construir herramientas de autoservicio con Q&A con IA, generación de documentos y flujos de ingreso, sin programar. Certificada SOC 2 Tipo II y cumple GDPR; permite residencia de datos en EE.UU., Europa, Reino Unido y Australia.
- **Canales:** la página no menciona SMS ni WhatsApp. Precios no publicados.
- **Estado:** activo.
- **Qué podemos robarle:** que **los propios consultorios jurídicos y organizaciones puedan crear y actualizar sus flujos sin código**, y el discurso de seguridad certificada para ganar confianza institucional.

---

### 2.20 U-Report y RapidPro (UNICEF, global)

- **Operador:** UNICEF con gobiernos, ONG y jóvenes de cada país; empezó en Uganda en 2011 con Scouts, el Girls Education Movement y organizaciones religiosas [V, UNICEF].
- **URL:** https://www.unicef.org/innovation/stories/unicefs-u-report-reaches-10-million-young-people · https://home.rapidpro.io/
- **Canales:** SMS, WhatsApp, Facebook Messenger y Viber [V]. Funciona en celular básico, es **gratuito y anónimo** para el usuario [V].
- **Flujo:** UNICEF o un socio envía encuestas o información; los datos se muestran agregados por edad, género y ubicación en un sitio público; el hallazgo se devuelve a los participantes y a los responsables de decisiones [V]. En Mozambique, más de 130.000 adolescentes recibieron orientación y fueron derivados a proveedores de salud en 2018 [V].
- **Tracción [AUTO]:** más de 10 millones de jóvenes en 68 países (2020, UNICEF); una nota posterior de UNICEF Guinea-Bissau habla de más de 38 millones en 104 países (fecha no confirmada) [BUSC].
- **RapidPro [V]:** plataforma de código abierto para construir aplicaciones móviles, **bien público digital desde 2020**, usada por 130 oficinas de UNICEF, 284 espacios de trabajo activos y más de 5.000 millones de mensajes. Requiere un proveedor de alojamiento y acuerdos con operadores móviles o agregadores. Su página lista SMS, Facebook Messenger y Viber, pero no WhatsApp ni USSD **[NV: no confirmé WhatsApp/USSD en RapidPro]**.
- **Estado:** activo.
- **Qué podemos robarle:** RapidPro como motor de flujos; la difusión mediante **organizaciones de confianza ya existentes** (scouts, iglesias, juntas de acción comunal, cooperativas); tableros públicos agregados y anonimizados como forma de rendir cuentas.

---

### 2.21 Contrato ilustrado ("comic contract", Sudáfrica)

- **Operador:** Robert de Rooy, abogado de Clemengold; usado por Indigo Fruit Growers para recolectores de mandarinas [V, Farmer's Weekly].
- **URL:** https://farmersweekly.co.za/agri-news/sa-lawyer-develops-worlds-first-illustrated-contract-for-farmworkers/
- **Qué es:** contrato laboral con personajes e ilustraciones que explican el efecto de cada cláusula, pensado para trabajadores que leen poco o no leen el idioma del contrato [V].
- **Resultados:** los trabajadores hicieron muchas preguntas pero **ninguno pidió volver al contrato escrito tradicional**; se presentó en una conferencia internacional de simplificación de contratos en Suiza [V]. Un blog secundario dice que la inducción bajó de unas 4 horas a 40 minutos [S, una sola fuente]. Un resumen de la Universidad de Western Australia reporta que una prueba posterior en Aurecon dio mejores puntajes de comprensión que la versión en texto [BUSC].
- **Validez legal:** el texto sigue siendo la parte vinculante; hay que verificar que las ilustraciones no contradigan el contrato [S].
- **Qué podemos robarle:** versión ilustrada de contratos rurales comunes (arriendo de finca, aparcería, jornal, venta de cosecha, préstamo informal) como entregable de legal design, con el texto jurídico como anexo vinculante.

---

### 2.22 Productos pequeños o planes anunciados (fichas cortas)

| Producto | País | Qué es | Verificación |
|---|---|---|---|
| **Molao365** | Sudáfrica | App con abogados que responden gratis las 24 horas; planea un servicio USSD; seleccionado por el HiiL Justice Accelerator con 175.376 rand (2021) | [S] Sowetan. USSD solo planeado |
| **HeLawyer** | Benín | App móvil de asesoría legal 24 horas; ganó la conferencia Innovating Justice de Lagos (21-sep-2018) | [S] HiiL. Estado actual [NV] |
| **Esheria LexChat** | Kenia | Asistente de IA sobre derecho keniano para abogados, estudiantes y defensores comunitarios; redacta documentos y revisa contratos; no se publican canales, idiomas, precios ni usuarios | [S] The Star 2025, tono promocional. Premio de 15.000 USD en Kenya Demo Day [BUSC] |
| **LawPàdí** | Nigeria | Responde preguntas legales gratis con revisión humana en 24 horas | [BUSC] |
| **Haki (app)** | Kenia | App de abogado móvil, más de 400 descargas y 10 casos tras relanzarse en dic-2017 | [BUSC] |
| **Grassroots Justice Network (Sudáfrica)** | Sudáfrica | Anunció que desarrollaba una plataforma SMS y USSD; no vi lanzamiento | [BUSC], solo plan |
| **Lady Liberty SA** | Sudáfrica | Oficina legal móvil para mujeres de municipios y zonas rurales de Gauteng | [BUSC] |
| **Nevada Courts chatbot** | EE.UU. | Chatbot para litigantes en derecho de familia; auditado por Duke Law con 1.462 sesiones: ~46% de respuestas útiles y accionables, ~1% dañinas; recomienda mejor detección de situaciones de alto riesgo (por ejemplo, derivar al 911) | [V] https://law.duke.edu/news/making-ai-legal-self-help-tools-more-useful |
| **Estudio de Stanford sobre modelos generales** | EE.UU. | Los grandes modelos de lenguaje "alucinan" al menos 75% del tiempo al responder sobre el fallo central de un tribunal (2024); aplica a modelos generales, no a herramientas de ayuda legal | [BUSC] vía Bloomberg Law |

## 3. Tabla comparativa resumen

Leyenda de filas: tracción siempre autoinformada salvo que diga lo contrario. "Estado" a 20-oct-2026 según las fuentes citadas.

| # | Producto (País) | Canal principal | Bajo dato / offline | Quién paga | Tracción reportada | Estado | Lección clave |
|---|---|---|---|---|---|---|---|
| 1 | BarefootLaw (Uganda) | SMS, Facebook, líneas gratuitas, radio, cajas solares | SMS, radio y voz sí; caja con microred solar | Donantes y abogados voluntarios | ~100 asuntos/día; 940 mil usuarios; ~18 mil casos resueltos | Activo | El canal digital llegó a hombres urbanos (6% mujeres); se necesitó presencia física |
| 2 | M-Haki / Kituo cha Sheria (Kenia) | SMS + sitio Ushahidi | Sí, celular básico | Embajada de Países Bajos hasta dic-2019; después incierto | 1.156 asuntos SMS en 1er semestre 2021 [BUSC] | Estado actual [NV] | Dependencia de un donante; consultas visibles públicamente |
| 3 | EmpowerLine / GJU (Malawi) | IVR gratuito + app | Sí, sin internet | Fundación Staehelin; aval ministerial | 560 llamadas en 2,5 meses o 2.859 usuarios en 2025 (contradictorio) | Activo | Anonimato real; medir igual en todos los informes |
| 4 | Sheria Kiganjani (Tanzania) | Web, app, SMS, IVR | SMS e IVR, sin detalle | Tarifas por transacción; alianza con Vodacom [NV] | >2 millones alcanzados; >800 consultas/mes | Listado activo | Freemium, pero sin datos independientes |
| 5 | Namati y Timap (varios países) | Paralegales presenciales + formulario en papel | Sí, no depende de conectividad | Donantes y fundaciones | Mozambique: 76% de casos resueltos [V]; Timap: -20% prisión preventiva [V] | Activo (Namati) | Mejor evidencia de impacto; casos colectivos y datos para política |
| 6 | Haqdarshak (India) | Agentes con app Android offline + WhatsApp + tarjeta QR | Sí | Empresas (RSE), tarifas por trámite, inversionistas | 6-7,6 millones de ciudadanos; 25-52 mil agentes | Activo | Capacitar no es activar (5.077 capacitadas, ~1.000 activas) |
| 7 | Tele-Law / Nyaya Setu (India) | Videollamada o teléfono en centro comunitario; WhatsApp | Asistido en último tramo | Gobierno | ~5 millones (2023); ~10,9 millones (2025) [BUSC] | Activo | Infraestructura existente + facilitador local + voluntaria paralegal |
| 8 | Nyaaya (India) | Web, audio, video, WhatsApp | Contenido audio; offline no documentado | Filantropía | Sin métricas | Activo | Contenido solo no basta; campeones legales y fellows |
| 9 | DoNotPay (EE.UU.) | App por suscripción | No | Usuario | n/d | Bajo orden FTC | Promesas sin pruebas cuestan 193.000 USD |
| 10 | A2J Author / LawHelp Interactive (EE.UU.) | Web, entrevistas guiadas | No | Gratuito; financiado por entidades académicas y legales | >7 millones de usos desde 2005 | Activo | Una pregunta por pantalla; salida imprimible |
| 11 | docassemble / Assembly Line (EE.UU.) | Web y SMS | SMS sí | Código abierto | n/d | Activo | Reutilizar el motor, no construirlo |
| 12 | Upsolve (EE.UU.) | App | No | Sin ánimo de lucro | n/d | Operando; litigio perdido | Riesgo de ejercicio ilegal por función de software |
| 13 | Stanford Legal Design Lab / Wise Messenger (EE.UU.) | Mensajes de texto | Sí (texto) | Universidad y donantes | Red de 1.400 profesionales | Activo | Guías de diseño y evaluación abiertas |
| 14 | JusticeBot (Canadá) | Web y móvil | No | Gobierno de Quebec | "Miles" de usuarios | Activo | Determinista, explica y cita la norma |
| 15 | Citizens Advice (Reino Unido) | Teléfono, chat, presencial | Voz sí | Fuentes no confirmadas [NV] | 2,71 millones de personas (2024-25) | Activo | El teléfono sigue siendo el canal mayor; ROI 13,48 libras por libra |
| 16 | Rechtwijzer (Países Bajos) | Web | No | Consejo de asistencia legal + usuarios | 2-3% del mercado de separaciones | **Cerrado 2017** | Faltó comprador, institución aliada y foco |
| 17 | Signpost (IRC, global) | Redes sociales y WhatsApp con agentes | Parcial | Donantes humanitarios | 19 millones de usuarios de la información | Activo | Bot + escalamiento a persona + contenido validado localmente |
| 18 | Justice Connect Gateway (Australia) | Web | No | Google (semilla) y financiación pública | Sin cifras | Org. activa; Gateway [NV] | Sin datos personales hasta el consentimiento; ruta para derivadores |
| 19 | Josef (Australia) | Web | No | Venta B2B | n/d | Activo | Sin código para organizaciones legales; seguridad certificada |
| 20 | U-Report / RapidPro (UNICEF) | SMS, WhatsApp, Messenger, Viber | Sí | UNICEF, gobiernos y socios | >10 millones en 68 países (2020) | Activo | Infraestructura abierta, anonimato, difusión por organizaciones de confianza |
| 21 | Contrato ilustrado (Sudáfrica) | Papel | Sí | Empleador | Aceptado por trabajadores | Práctica activa | Legal design con evidencia en baja lectura; el texto sigue siendo vinculante |

## 4. Patrones observados

### 4.1 Patrones de éxito

1. **Intermediario local de confianza más herramienta digital.** Tele-Law (VLE y voluntarias paralegales), Haqdarshak (agentes mujeres), Namati/Timap (paralegales), BarefootLaw (cajas y radio), Nyaaya (campeones legales y fellows), Kituo cha Sheria (paralegales). Los productos que solo ofrecen un canal digital terminan sirviendo al usuario más conectado (BarefootLaw: 6% mujeres).
2. **La voz y el WhatsApp asistido superan al USSD y al SMS.** Los casos que operan a escala usan teléfono (Citizens Advice, Tele-Law); EmpowerLine lo hace a menor escala. No encontré un servicio legal por USSD verificado en funcionamiento; hay planes (Molao365, GJN) y una integración futura (EmpowerLine). Hipótesis a validar con el equipo: el USSD exige acuerdos con operadores y permite poco texto, lo que lo hace caro para contenido jurídico. Esto no está demostrado en las fuentes.
3. **Cobrar a quien tiene capacidad de pago y no al ciudadano pobre.** Haqdarshak (empresas por RSE y tarifas pequeñas por trámite), Sheria Kiganjani (tarifas escalonadas), Tele-Law (gobierno), Citizens Advice (retorno social medido para financiadores).
4. **Guiado y determinista antes que generativo.** A2J Author, JusticeBot y Gateway entregan flujos de preguntas y salidas explicables. Cuando hay IA generativa (Winnie, Signpost) hay un humano que valida o escala.
5. **Privacidad y anonimato por diseño.** EmpowerLine (sin registro), U-Report (anónimo), Gateway (sin datos hasta el consentimiento), Josef (certificaciones y residencia de datos).
6. **Casos individuales que se vuelven política.** Namati convierte cada caso en datos para incidencia (Mozambique: estrategia nacional contra el soborno en salud). Tele-Law tiene tablero en tiempo real.
7. **Respaldo institucional visible.** Aval ministerial a EmpowerLine; el Estado como operador de Tele-Law; policía y autoridades tradicionales promoviendo la línea.
8. **Mujeres en el centro de la distribución.** Haqdarshak cambió de agentes hombres a mujeres tras una evidencia de impacto; Tele-Law prefiere voluntarias.
9. **Infraestructura abierta reutilizable.** docassemble, RapidPro, A2J Author. Reducen costo y riesgo técnico.
10. **Legal design para baja lectura:** contrato ilustrado, contenido en audio y video, lenguas locales.

### 4.2 Patrones de fracaso o debilidad

1. **Un solo donante.** M-Haki perdió el financiamiento neerlandés (dic-2019); Kituo reporta donantes en retroceso. Rechtwijzer no logró subsidio público.
2. **Demanda mayor que capacidad humana.** BarefootLaw en la etapa SMS; tiempos de respuesta de 48 a 72 horas. Se resuelve con triaje, plantillas y borradores asistidos por IA.
3. **Sobreprometer con IA.** DoNotPay (FTC); chatbots con bajo porcentaje de respuestas útiles (Nevada, ~46%); modelos generales que alucinan en consultas jurídicas.
4. **Riesgo regulatorio de "ejercicio ilegal de la profesión".** Upsolve.
5. **Querer cubrir demasiado.** Rechtwijzer: HiiL reconoce que "no se puede hacer todo al mismo tiempo".
6. **Exigir la participación de otra parte** sin incentivos (Rechtwijzer).
7. **Capacitar sin activar.** Haqdarshak en Chhattisgarh: 5.077 capacitadas, ~1.000 activas.
8. **Métricas inconsistentes o sin evaluación independiente.** EmpowerLine (tres cifras distintas), Tele-Law (inconsistencias de cobertura), Haqdarshak (cifras que cambian por fuente).
9. **Plataformas sin mantenimiento ni confidencialidad.** M-Haki con Ushahidi desactualizado y consultas visibles en un sitio público.
10. **Sin seguimiento al usuario.** Namati Mozambique: casi la mitad de los clientes quería más seguimiento.
11. **Infraestructura frágil.** La Box de BarefootLaw se caía con los cortes de luz hasta que tuvo microred solar.
12. **Alcance de género no verificado o desbalanceado.** BarefootLaw: solo 6% de usuarios mujeres en la etapa Facebook; EmpowerLine: una fuente dice que llaman sobre todo hombres y el operador dice 61,8% mujeres, así que la composición real de los usuarios es incierta.

### 4.3 Implicaciones directas para nuestro diseño (para contrastar con el otro frente)

- Canal base: WhatsApp (texto y audio) con respaldo SMS y llamada asistida; **no depender de USSD** hasta confirmar viabilidad con un agregador local.
- Un solo flujo bien hecho primero (el derecho de petición), con salida imprimible y "tarjeta de ruta" con QR.
- Líder social como intermediario pagado o con incentivo (modelo Haqdarshak + Tele-Law), no solo voluntario.
- Abogado o consultorio jurídico en el circuito (modelo BarefootLaw/Signpost), con textos validados por juristas.
- Financiamiento mixto desde el diseño: donante, RSE territorial, tarifa mínima por trámite asistido y entidad pública.
- Privacidad: pedir datos solo tras consentimiento, anonimato en consultas generales, datos agregados para incidencia.
- Métricas definidas desde el día cero (qué es un usuario, un caso resuelto y un caso seguido).

## 5. Fuentes

### África
- BarefootLaw (sitio): https://www.barefootlaw.org
- Estudio de caso Civic Tech Africa sobre BarefootLaw: https://civictech.africa/case-study/enabling-access-to-law-and-justice-for-thousands-in-uganda/
- The Hague, "BarefootLaw 10 years": https://thehague.com/newsroom/humanity/barefootlaw-10-years-legal-innovation-grassroots-communities-access-justice
- Rights CoLab, ficha de BarefootLaw: https://rightscolab.org/case_study/barefootlaw/
- VOA, "Barefoot Lawyers Teach Ugandans Their Rights": https://www.voanews.com/a/barefoot-lawyers-teach-ugandans-their-rights/1926220.html
- SELF, microred de Bala: https://www.self.org/blog/uganda-justice-microgrid-legal-aid/
- Microgrid Knowledge, LawBox de Bala: https://www.microgridknowledge.com/remote-microgrids/article/55057243/microgrid-powered-lawbox-helps-ugandan-towns-residents-settle-cow-contract-boundary-and-other-disputes
- DSSG Fellowship, proyecto de IA con BarefootLaw: https://dssgfellowship.org/project/barefoot-winnie-legal/
- Morgridge Family Foundation (solo vía buscador, la página dio 404): https://morgridgefamilyfoundation.org/stories/why-we-partner-with-barefootlaw
- Tech Trends Kenya, "There's an app for that: justice tech in Africa" (17-ago-2026): https://techtrendske.co.ke/2026/08/17/sylvia-ilahuka-theres-an-app-for-that-justice-tech-in-africa/
- The Star, M-Haki por SMS (3-jun-2020): https://www.the-star.co.ke/news/2020-06-03-how-you-can-now-access-legal-advice-via-sms
- Civic Tech Africa, ficha M-Haki: https://civictech.africa/initiative/m-haki/
- Africa Legal, Kituo cha Sheria: https://www.africa-legal.com/news/a-place-to-turn-to/105747
- Land Portal, informe anual 2022 de Kituo (no pude abrirlo): https://landportal.info/node/120231
- GJU, lanzamiento de EmpowerLine: https://genderandjustice.org/?p=1562
- GJU, informe anual 2025: https://genderandjustice.org/bringing-justice-closer-to-home-our-2025-annual-report/
- Stanford CodeX TechIndex, Sheria Kiganjani: https://techindex.law.stanford.edu/companies/sheria-kiganjani
- VC4A, Sheria Kiganjani (solo vía buscador): https://vc4a.com/ventures/sheria-kiganjani-company-limited
- Sowetan, Molao365: https://www.sowetan.co.za/business/2021-08-24-putting-the-scales-of-justice-in-everyones-hands/
- HiiL, ganadores de la conferencia de Lagos 2018 (HeLawyer): https://hiil.org/?p=3512
- The Star, Esheria LexChat: https://www.the-star.co.ke/business/2025-06-09-esheria-lexchat-kenyas-first-ai-lawyer
- Namati: https://namati.org
- Wharton, Lipman Family Prize, Namati: https://lipmanfamilyprize.wharton.upenn.edu/honorees/namati/
- BMC Public Health 2020, Namati en Mozambique: https://pmc.ncbi.nlm.nih.gov/articles/PMC7350694/
- Grassroots Justice Network, "Power Up": https://grassrootsjusticenetwork.org/resources/power-up-lessons-from-twelve-years-of-organizing-with-community-paralegals/
- Grassroots Justice Network, manual del sistema de registro de casos: https://grassrootsjusticenetwork.org/resources/case-records-management-system-manual
- HURIDOCS, Casebox para la red de Namati: https://huridocs.org/2017/01/webinar-on-casebox-for-the-namati-legal-empowerment-network/
- OSJI, evaluación cuasiexperimental de paralegales penales en Sierra Leona: https://www.justiceinitiative.org/publications/quasi-experimental-impact-evaluation-criminal-justice-paralegal-program-sierra-leone
- OSJI, ficha de justicia previa al juicio en Sierra Leona (PDF): https://www.justiceinitiative.org/uploads/8ca2e3bb-a0f0-47cf-b7af-b0f315c8d756/Factsheet%20PTD%20Sierra%20Leone%2002142013.pdf
- Contrato ilustrado, Farmer's Weekly: https://farmersweekly.co.za/agri-news/sa-lawyer-develops-worlds-first-illustrated-contract-for-farmworkers/
- Resumen de investigación de la Universidad de Western Australia sobre contratos visuales (solo vía buscador): https://researchimpact.uwa.edu.au/?p=3171

### Asia
- Acumen, caso Haqdarshak: https://acumen.org/case-studies/haqdarshak/
- MIT Solve, Haqdarshak: https://solve.mit.edu/solutions/84965
- NITI Aayog Frontier Tech, Haqdarshak: https://frontiertech.niti.gov.in/story/voice-powered-ai-search-engine-helps-families-access-welfare-schemes-instantly/
- Clinton Global Initiative, compromiso de Haqdarshak (403, solo vía buscador): https://www.clintonfoundation.org/commitment/clinton-global-initiative/financially-empowering-100-million-families/
- IFMR LEAD, piloto de Chhattisgarh (403, solo vía buscador): https://ifmrlead.org/wp-content/uploads/2021/12/Innovations-for-SHGs_Chhattisgarh.pdf
- PIB, ficha de Tele-Law (1-sep-2023): https://static.pib.gov.in/WriteReadData/specificdocs/documents/2023/sep/doc202391247601.pdf
- Rajya Sabha, respuesta del 13-mar-2025 (solo vía buscador): https://rsdebate.nic.in/bitstream/123456789/757483/1/PQ_267_13032025_U1704_p1141_p1142.pdf
- Rajya Sabha, respuesta del 13-feb-2025 (solo vía buscador): https://rsdebate.nic.in/bitstream/123456789/758919/1/PQ_267_13022025_U1069_p322_p323.pdf
- Vikaspedia, esquema DISHA (secundaria): https://en.vikaspedia.in/viewcontent/e-governance/online-legal-services/designing-innovative-solutions-for-holistic-access-to-justice-scheme?lgn=en
- Digit, Nyaya Setu por WhatsApp: https://www.digit.in/news/apps/need-legal-advice-governments-nyaya-setu-is-now-available-on-whatsapp-for-free-heres-how-to-use.html
- Outlook Business, Nyaya Setu por WhatsApp: https://www.outlookbusiness.com/ampstories/news/how-does-nyaya-setu-work-on-whatsapp-to-provide-instant-legal-guidance-explained
- Nyaaya: https://nyaaya.org/about/

### Norteamérica
- FTC, orden final contra DoNotPay (feb-2025): https://www.ftc.gov/node/87474
- A2J Author (Chicago-Kent): https://kentlaw.iit.edu/institutes-centers/center-for-access-to-justice-and-technology/a2j-author
- CALI, A2J Author (403, solo vía buscador): https://www.cali.org/content/a2j-author
- docassemble: https://docassemble.org
- docassemble, interfaz SMS: https://docassemble.org/docs/sms.html
- ABA Journal, Upsolve (2022): https://www.abajournal.com/web/article/legal-companys-non-lawyer-legal-advice-to-new-yorkers-debtors-gets-courts-greenlight
- Bloomberg Law, Corte Suprema rechaza Upsolve (solo vía buscador): https://news.bloomberglaw.com/bankruptcy-law/supreme-court-declines-to-hear-debt-groups-free-speech-suit
- Stanford Legal Design Lab: https://justiceinnovation.law.stanford.edu
- Duke Law, auditoría del chatbot de Nevada (6-jul-2026): https://law.duke.edu/news/making-ai-legal-self-help-tools-more-useful
- Bloomberg Law, estudio de errores legales de modelos de IA (solo vía buscador): https://news.bloomberglaw.com/litigation/legal-errors-by-top-ai-models-alarmingly-prevalent-study-says
- JusticeBot (Laboratorio de Cyberjusticia): https://cyberjustice.openum.ca/en/justicebot/
- Paper de JusticeBot: https://ar5iv.labs.arxiv.org/html/2308.02032

### Europa
- Citizens Advice, cifras 2024-25: https://www.citizensadvice.org.uk/about-us/information/what-we-do
- HiiL, "Rechtwijzer: why online supported dispute resolution is hard to implement": https://www.hiil.org/?p=2807
- UCL, "Pioneering ODR platform to rein in ambitions after commercial setback": https://www.ucl.ac.uk/laws/news/2017/apr/pioneering-odr-platform-rein-ambitions-after-commercial-setback-professor-richard
- Legal Futures, mismo tema: https://legalfutures.co.uk/latest-news/pioneering-odr-platform-to-rein-in-ambitions-after-commercial-setback
- Signpost: https://www.signpost.ngo
- IRC, Signpost (Colombia y Centroamérica): https://www.rescue.org/node/6208
- Twilio, caso IRC: https://customers.twilio.com/en-us/international-rescue-committee
- Barchart, IA y respuesta humanitaria (piloto de IA de Signpost, solo vía buscador): https://www.barchart.com/story/news/29578470/ai-could-help-scale-humanitarian-responses-but-it-could-also-have-big-downsides

### Oceanía
- Justice Connect: https://justiceconnect.org.au
- Good Design Awards, Justice Connect Gateway: https://good-design.org/projects/justice-connect-gateway-project/
- LexBlog, Gateway (financiación de Google, ingreso de menos de 10 minutos; solo vía buscador): https://www.lexblog.com/?p=748865
- Josef, preguntas frecuentes: https://joseflegal.com/faq/
- LawNext, Josef recauda 2,5 millones USD: https://www.lawnext.com/2021/05/no-code-legal-automation-startup-josef-raises-2-5m.html

### Infraestructura global
- UNICEF, U-Report llega a 10 millones: https://www.unicef.org/innovation/stories/unicefs-u-report-reaches-10-million-young-people
- UNICEF, documento "U-Report" (PDF): https://www.unicef.org/innovation/media/4171/file
- UNICEF Guinea-Bissau, U-Report (38 millones, 104 países; solo vía buscador): https://www.unicef.org/guineabissau/press-releases/unicef-guinea-bissau-launches-u-report
- RapidPro: https://home.rapidpro.io/

## 6. Candidatos descartados o no verificados, y pendientes

| Candidato | Resultado | Decisión |
|---|---|---|
| **Hello Lawyer** | No encontré un producto con ese nombre. El más cercano es HeLawyer (Benín). | No verificado; reemplazado por HeLawyer |
| **LawPavilion** (Nigeria) | Plataforma de investigación jurídica para abogados (con planes de pago, versión "Elite" para despachos y chat de IA). Se ofreció investigación por WhatsApp. No es para comunidades rurales. | Descartado por relevancia |
| **Legal Robot** (EE.UU.) | Su sitio dice "Coming soon" y apunta a equipos legales grandes. | Descartado por relevancia |
| **Pigeonhole** | El dominio que probé (pigeonhole.live) no resolvió y no pude confirmar de qué producto se trata. | No verificado; probable confusión de nombre |
| **Josef** | Verificado, pero es una herramienta B2B sin canal SMS/WhatsApp documentado. | Incluido como referencia de no-code |
| **Sheria Mtaani** | No encontré nada con ese nombre; "Sheria Kiganjani" es de Tanzania, no de Kenia. | No verificado |
| **Cadasta** (mapeo de tierras) | Sigue activa según una nota de Esri; no la analicé en profundidad. | Pendiente |
| **Timap for Justice (hoy)** | Verifiqué la evaluación 2009-2010, no su situación organizacional actual. | Estado actual [NV] |

Pendientes que no pude verificar por límite de búsquedas:

1. Detalles del piloto de IA de Signpost y de su política de protección de datos.
2. LIA (Legal Aid of North Carolina) y otros chatbots de ayuda legal en EE.UU.
3. Spot (Suffolk LIT Lab) y Massachusetts Court Forms Online sobre docassemble.
4. Si RapidPro soporta WhatsApp y USSD de forma nativa.
5. Fuente oficial (PIB) del lanzamiento de Nyaya Setu por WhatsApp y las fechas exactas.
6. Costo real por canal (SMS, USSD, WhatsApp Business) en los países de los casos. No lo investigué.
7. Estado actual de M-Haki (la web dio error) y de Sheria Kiganjani.
