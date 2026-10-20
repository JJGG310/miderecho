# 06 - Marco legal y de seguridad (riesgos y mitigaciones)

Fecha de la investigación: 20 de octubre de 2026. Frente: riesgos legales y de seguridad de un servicio de bajo consumo de datos (SMS, WhatsApp, offline-first) que simplifica rutas legales, contratos y derechos de petición para comunidades rurales, con adopción vía líderes sociales.

**Aviso:** no soy abogado. Este informe es investigación de apoyo para el hackathon, no concepto jurídico. Lo que no pude confirmar contra una fuente primaria queda marcado **[no verificado]**. Los puntos que requieren abogado están reunidos en la sección 7.

**Nota de método:** la cuota de búsquedas web se agotó durante la sesión (límite compartido entre agentes), así que parte de la verificación se hizo leyendo directamente las normas y páginas oficiales. El sitio de la SIC (sic.gov.co) falló por error de certificado; usé la sede electrónica de la SIC y copias oficiales de otras entidades. Las normas que cito con "leído" las revisé en su texto; las demás vienen de resúmenes secundarios y lo indico.

---

## 0. Resumen ejecutivo

**Cinco hallazgos que cambian el diseño del MVP:**

1. **El dato más delicado ya es "sensible" por ley.** El art. 5 de la Ley 1581 de 2012 incluye entre los datos sensibles la *pertenencia a sindicatos, organizaciones sociales o de derechos humanos*, además de origen étnico, orientación política y salud. Saber que alguien es "líder social" o que usó un servicio para denunciar a alguien puede caer en esa categoría. Tratar datos sensibles está prohibido salvo excepciones (autorización explícita, entre ellas), y ninguna actividad puede condicionarse a que la persona los entregue (Decreto 1377/2013, art. 6). **Consecuencia:** el servicio tiene que funcionar sin pedirlos.
2. **La mejor mitigación es no tener el dato.** Si el bot no guarda contenido, no pide cédula y no conserva listas, un teléfono confiscado, una filtración o una orden coercitiva a un líder entregan casi nada. Esto también reduce el riesgo legal (sanciones por incidentes, RNBD, transferencias).
3. **Ninguna norma colombiana que encontré prohíbe ni autoriza expresamente a un chatbot a orientar jurídicamente.** El límite viene del Decreto 196 de 1971 (no anunciarse como abogado, no litigar por otros). El derecho de petición y la tutela **no requieren abogado**, así que ayudar a una persona a redactar *su propio* documento a partir de plantillas validadas es la zona de menor riesgo. Los contratos y la asesoría personalizada son zona gris.
4. **La Ley 2213 de 2022 aplica a procesos judiciales, no al derecho de petición** (que es administrativo, Ley 1755 de 2015). Aun así, es útil: reconoce que la población rural puede acudir presencialmente y obliga a municipios y personerías, en la medida de sus posibilidades, a facilitar el acceso a actuaciones virtuales (art. 2, parágrafo 2). Esto respalda a las personerías como aliadas.
5. **WhatsApp no es un canal seguro para el escenario de amenaza descrito, solo "menos malo".** El cifrado protege el contenido en tránsito, no los metadatos, ni el teléfono confiscado, ni lo que ve el proveedor de la API. La política de Meta para empresas **prohíbe pedir números de cédula** por la plataforma, lo que coincide con la minimización.

**Semáforo de riesgos**

| Riesgo | Probabilidad | Impacto | Mitigación principal | Sección |
|---|---|---|---|---|
| Teléfono revisado o confiscado: el chat revela quién denuncia qué | Alta | Muy alto (vida) | No eco del relato, nombre neutro, mensajes temporales, nada sensible en el chat, modo asistido | 4, 5 |
| Tratamiento de datos sensibles sin autorización válida | Media | Alto (sanción, cierre) | Aviso previo, no pedir sensibles, datos en blanco | 1, 5 |
| Bot percibido como "abogado" o da asesoría personalizada | Media | Medio-alto | Marca y mensajes de límites, plantillas validadas, escalamiento humano | 2 |
| Información jurídica errónea o desactualizada (plazos) | Media | Alto | Revisión por consultorio jurídico, fecha de verificación, sin LLM generativo en lo jurídico | 2 |
| Filtración del backend o del proveedor | Media | Muy alto | Minimización, TTL, cifrado, HMAC con clave aparte | 5 |
| Suplantación del bot / ingeniería social | Media | Alto | Número verificado, mensaje "nunca pedimos", sin enlaces externos | 4 |
| Coerción al líder para entregar listas | Media | Muy alto | No existen listas; el líder no es depositario de datos | 4, 5 |
| Transferencia internacional (Meta, nube, LLM) sin base legal | Alta (seguro ocurre) | Medio | Contratos de transmisión, minimización, sin PII a LLM | 1.5 |
| Documento radicado ante autoridad local expone al peticionario | Media | Alto | Guía de rutas neutrales (personería, Defensoría), no incluir hechos innecesarios | 4 |

---

## 1. Protección de datos personales en Colombia

### 1.1 Marco normativo (leído)

- **Constitución, art. 15:** derecho fundamental al habeas data.
- **Ley 1581 de 2012** (régimen general): [texto](https://relatoria.colombiacompra.gov.co/normativa/ley-1581-de-2012/). Aplica a bases de datos de entidades públicas y privadas cuando el tratamiento ocurre en Colombia o la ley colombiana es aplicable (art. 2).
- **Decreto 1377 de 2013**, hoy compilado en el **Decreto Único 1074 de 2015** (Libro 2, Parte 2, Título 2, Capítulo 25): [texto SUIN](https://www.suin-juriscol.gov.co/viewDocument.asp?id=1276081). La SIC confirma la compilación en el pie 14 de su Circular Externa 002/2024. El único mapeo de numeración que confirmé es el de responsabilidad demostrada (art. 26 del Decreto 1377 = art. 2.2.2.25.6.1 del DUR). **[el mapeo del resto de artículos al DUR 1074 no verificado]**; cito por número del Decreto 1377.
- **Circular Externa 002 de 2024 de la SIC** (lineamientos para IA): leída completa, ver 1.7.
- **Exclusiones del art. 2:** uso exclusivamente personal o doméstico (salvo que se entreguen a terceros, caso en que hay que informar y pedir autorización), seguridad y defensa nacional, inteligencia y contrainteligencia, periodismo, y bases regidas por la Ley 1266 de 2008 y la Ley 79 de 1993. **Implicación para el modelo de amenazas:** los servicios de inteligencia del Estado están fuera del alcance de la Ley 1581, así que la ley no protege contra ellos; solo la minimización técnica sí.

### 1.2 Datos sensibles

- **Definición (art. 5, leído):** datos que afectan la intimidad o cuyo uso indebido puede generar discriminación. La lista incluye origen racial o étnico, orientación política, convicciones religiosas o filosóficas, **pertenencia a sindicatos, organizaciones sociales o de derechos humanos**, intereses de partidos políticos (incluida la oposición), salud, vida sexual y datos biométricos.
- **Regla (art. 6, leído):** el tratamiento está prohibido salvo (a) autorización explícita, (b) interés vital de un titular incapacitado, (c) ONG políticas, filosóficas, religiosas o sindicales con sus miembros, (d) reconocimiento, ejercicio o defensa de un derecho en un proceso judicial, (e) fines históricos, estadísticos o científicos con identidad suprimida.
- **Obligaciones adicionales (Decreto 1377, art. 6, leído):** informar que no está obligado a autorizar, decir cuáles datos son sensibles y la finalidad, obtener consentimiento expreso, y **no condicionar ninguna actividad a la entrega de datos sensibles**. El aviso de privacidad debe decir expresamente que responder preguntas sobre datos sensibles es facultativo (art. 15).
- **"Condición de víctima":** no aparece literalmente en la lista del art. 5. Dependiendo del contexto puede revelar origen étnico, orientación política o salud. **[no verificado si la SIC lo trata como sensible]**. Recomendación por precaución (lineamiento II de la Circular 002/2024): tratarlo como sensible.
- **Excepción (d) de proceso judicial:** podría cubrir datos para una tutela, pero no cubre el derecho de petición (administrativo) y no conviene construir el MVP sobre ella. **[interpretación; validar con abogado]**.

### 1.3 Autorización y consentimiento

Reglas leídas del Decreto 1377/2013:

- **Momento (art. 5):** a más tardar al recolectar, informando los datos que se recogen y todas las finalidades específicas.
- **Forma (art. 7):** vale por escrito, de forma oral o por conductas inequívocas; **el silencio nunca** es conducta inequívoca. Responder "1" en WhatsApp es una conducta inequívoca razonable.
- **Prueba (art. 8):** hay que conservar prueba de la autorización. Esto choca con la minimización: se resuelve guardando solo un registro seudonimizado (HMAC del número, fecha-hora, versión del aviso, respuesta), nunca contenido. **[retención de esa prueba tras una solicitud de supresión: validar con abogado; el art. 9 dice que la supresión no procede si hay deber legal o contractual de permanecer en la base]**.
- **Revocatoria y supresión (art. 9):** en cualquier momento, con mecanismos gratuitos y de fácil acceso. La ley fija 10 días hábiles para consultas y 15 para reclamos (Ley 1581, arts. 14 y 15). La palabra "BORRAR TODO" inmediata supera ese estándar.
- **Finalidad limitada y supresión (art. 11):** solo el tiempo razonable y necesario; cumplida la finalidad, suprimir.
- **Menores (art. 12 del Decreto, art. 7 de la Ley):** prohibido tratar datos de niños, niñas y adolescentes salvo los públicos y, en todo caso, solo con interés superior, respeto de derechos fundamentales y autorización del representante legal. **Diseño: el bot no recoge datos de menores** (si el trámite es sobre un menor, el adulto no ingresa nombre ni documento del menor; se deja en blanco). **[alcance exacto de la prohibición según la jurisprudencia constitucional: no verificado]**.
- **Voz:** si se usan notas de voz por accesibilidad, no guardar el audio. La voz puede considerarse dato biométrico **[no verificado]**, y transcribir con un proveedor externo es transferencia. Para el MVP, evitar o hacerlo en memoria.

### 1.4 Registro Nacional de Bases de Datos (RNBD)

- **Obligados:** sociedades y entidades sin ánimo de lucro con activos totales superiores a **100.000 UVT** y personas jurídicas de naturaleza pública. Fuente: concepto de la SIC en su [sede electrónica](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/cuales-personas-estan-obligadas-realizar-el-registro-de-bases-de-datos-personales-en-el-rnbd) (nov. 2022, leído) y [Holland & Knight](https://www.hklaw.com/es/insights/publications/2025/01/obligaciones-del-registro-nacional-de-bases-de-datos-personales), que estima 100.000 UVT en cerca de COP 5.000 millones para 2025.
- **No obligados:** quienes no superan el umbral (un equipo de hackathon o una ONG pequeña, normalmente). Según la SIC, **siguen sujetos a todo lo demás de la Ley 1581**: política de tratamiento, aviso de privacidad, autorización, programa de gestión y medidas de seguridad. Los establecimientos de comercio y sucursales tampoco registran.
- **Si hay aliado público** (alcaldía, personería, universidad pública): esa entidad sí es obligada respecto de sus propias bases. El decreto que fijó el umbral (Decreto 090 de 2018) **no lo leí directamente [no verificado el texto; el umbral viene de la SIC y de H&K]**.
- **Plazos si aplicara:** bases nuevas, dentro de dos meses desde su creación; actualización anual (febrero-marzo en 2025). **[calendario 2026 no verificado]**.

### 1.5 Transferencia y transmisión internacional (WhatsApp/Meta, nube, LLM)

- **Transferencia (Ley 1581, art. 26, leído):** prohibida a países sin nivel adecuado de protección, con excepciones, entre ellas la **autorización expresa e inequívoca** del titular. Se aplica cuando el responsable envía datos a otro *responsable* en el exterior.
- **Transmisión (Decreto 1377, arts. 24-25, leído):** cuando el responsable envía datos a un *encargado* que trata por su cuenta, **no se requiere informar ni pedir consentimiento si existe un contrato** que cumpla el art. 25 (alcances, obligaciones del encargado, seguridad, confidencialidad).
- **Meta:** en los términos de la plataforma de WhatsApp Business, Meta actúa como *encargado* para el tratamiento que hace por cuenta de la empresa, y para otros datos ambas partes son "responsables independientes" (sec. 1.4, [términos](https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform), leído). Eso significa una transmisión a un encargado en parte y, para el resto, una transferencia entre responsables. La SIC ya ordenó a WhatsApp ajustar su política de tratamiento al derecho colombiano porque trata datos de al menos 39 millones de usuarios en el país (Resolución 29826 de 2021, vía [DPL News](https://dplnews.com/?p=100495)), lo que confirma que la Ley 1581 le aplica.
- **¿Estados Unidos tiene nivel adecuado?** Recuerdo que la Circular Externa 005 de 2017 de la SIC incluye a EE. UU. en su lista de países con nivel adecuado. **[no verificado; no pude abrir la circular]**. Si es cierto, la transferencia a EE. UU. no requeriría autorización por ese motivo. Validar con abogado antes de depender de ello.
- **Cifrado en la Cloud API:** Meta dice que los mensajes están protegidos con el protocolo Signal y que los datos se cifran en tránsito y en reposo ([doc de la Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/overview), leído). **No dice** dónde están los servidores ni cuánto retiene. Mi entendimiento es que el cifrado extremo a extremo termina en el punto de entrada de la API (Meta, o el proveedor intermediario si se usa uno) y desde ahí el mensaje es legible por quien opera la API y por la organización **[no verificado; revisar el whitepaper de WhatsApp Business]**. Por diseño, hay que asumir que Meta, el proveedor y nosotros podemos ver el contenido.
- **Nube y LLM:** cualquier proveedor fuera de Colombia es transmisión; exige contrato (DPA) que cumpla el art. 25. **Regla del MVP: no enviar datos personales ni texto libre del usuario a un LLM de terceros.** Si se usa un LLM, solo para clasificar intención con texto depurado, o mejor, no usarlo en el MVP.

### 1.6 Sanciones y precedentes de la SIC

- **Sanciones posibles (Ley 1581, art. 23, leído):** multas de hasta **2.000 SMMLV**, suspensión de actividades hasta seis meses, cierre temporal y **cierre inmediato y definitivo de operaciones que involucren tratamiento de datos sensibles**. Las multas pueden ser sucesivas. Solo aplican a privados; si el infractor es una autoridad pública, la SIC remite a la Procuraduría. Criterios de graduación en el art. 24 (daño, beneficio, reincidencia, reconocimiento temprano).
- **Movistar, octubre de 2025:** multa de **COP 670 millones** por contactar a usuarios con fines comerciales por llamadas, SMS y **WhatsApp** sin autorización previa, a raíz de una denuncia ciudadana. La SIC citó la Ley 1581 y la Ley 2300 de 2023 ([Vanguardia](https://www.vanguardia.com/colombia/2025/10/29/multa-millonaria-a-movistar-por-bombardear-a-usuarios-con-llamadas-y-mensajes/)). **Lección:** no mandar mensajes que el usuario no pidió.
- **WhatsApp, 2021:** orden administrativa (no multa) por política de tratamiento deficiente (incumplía 57,89 % de los requisitos nacionales) y por no registrar bases en el RNBD ([DPL News](https://dplnews.com/?p=100495)).
- **Patrón general:** las investigaciones a grandes plataformas (Zoom, Uber, TikTok, Facebook, Google, WhatsApp) terminaron en órdenes, no multas, y la SIC abrió en 2023 una indagación a ChatGPT cuyo resultado no encontré ([El Tiempo](https://www.eltiempo.com/tecnosfera/novedades-tecnologia/ia-investigaciones-de-la-sic-contra-chatgpt-y-otras-plataformas-772549)). **[sanciones y decisiones de 2026 no verificadas]**.
- **LinkedIn, 2023:** la SIC le impartió órdenes (Resolución 71406) y de ahí sale el criterio de que "accesible al público" no es "de naturaleza pública" (nota 13 de la Circular 002/2024). Relevante si alguien pensara en raspar datos de internet.
- **Responsabilidad penal de terceros atacantes:** Ley 1273 de 2009 (delitos informáticos, art. 269F violación de datos personales). **[cita de memoria; no verificado el texto ni la pena]**.

### 1.7 Guía de la SIC sobre IA: Circular Externa 002 del 21 de agosto de 2024 (leída completa)

Dirigida a los administradores de datos personales (responsables, encargados, etc.). Afirma que la Ley 1581 se aplica a cualquier sistema de IA, y cita la sentencia T-323 de 2024 en ese sentido. No encontré una guía de la SIC específica para chatbots, solo esta circular **[otras guías específicas: no verificado]**. Diez lineamientos:

| # | Lineamiento (resumen fiel) | Qué implica para el MVP |
|---|---|---|
| I | Ponderar con cuatro criterios: idoneidad, necesidad (no hay medida más moderada igual de eficaz), razonabilidad (finalidad constitucional) y proporcionalidad estricta | Justificar por escrito cada dato recogido; si se puede sin él, no se pide |
| II | Si hay incertidumbre sobre daños graves o irreversibles, abstenerse o tomar medidas precautorias | Aplica de lleno al riesgo para líderes: ante duda, no tratar el dato |
| III | Identificar, clasificar, medir y mitigar riesgos; sistemas de administración de riesgo | Registro de riesgos del MVP (sección 4) |
| IV | Antes de diseñar, si hay alto riesgo para los titulares: **estudio de impacto de privacidad documentado** con (a) descripción de operaciones, (b) riesgos para derechos y libertades, (c) medidas | Mini-estudio en 5.7 |
| V | Datos veraces, completos, exactos, actualizados, comprobables y comprensibles; prohibido tratar datos parciales o que induzcan a error | Contenido jurídico vigente y verificado |
| VI | Privacidad desde el diseño y por defecto; ejemplo: privacidad diferencial | Métricas agregadas con umbral mínimo |
| VII | Derecho a información sobre el tratamiento en cualquier momento y sin restricciones | Comando POLITICA |
| VIII | Seguridad con medidas tecnológicas, humanas, administrativas, físicas y contractuales, **auditables**, contra acceso indebido, manipulación, destrucción, uso indebido o circulación a no autorizados | Sección 5 |
| IX | "Accesible al público" no es "de naturaleza pública"; no se pueden usar datos privados, semiprivados o sensibles de internet sin autorización | No raspar redes |
| X | Estrategias demostrables para garantizar los derechos de los titulares | Evidencias: logs de borrado, versiones del aviso |

### 1.8 Roles: quién es responsable en el modelo con líderes

- La organización que opera el servicio es **responsable del tratamiento** y debe designar una persona o área de protección de datos (Decreto 1377, art. 23), adoptar una política de tratamiento (art. 13) con el contenido mínimo allí listado, y un manual interno (Ley 1581, art. 17, literal k). Debe poder demostrar el cumplimiento a la SIC (arts. 26-27 del Decreto).
- Meta, el proveedor de API y la nube son **encargados** o responsables independientes según el caso (1.5).
- **El líder social:** la exclusión de uso personal o doméstico (art. 2) probablemente **no** cubre a un líder que registra datos de su comunidad en su rol. Mejor diseño: el líder es **facilitador** que ayuda a la persona a usar el servicio desde el teléfono de ella (o el suyo en modo asistido) y **no guarda nada**. Así no se convierte en depositario de datos ni en blanco de presión. **[calificación jurídica del líder: validar con abogado]**.

---

## 2. Límites del ejercicio legal

### 2.1 Decreto 196 de 1971 (leído en [normas.cra.gov.co](https://normas.cra.gov.co/gestor/docs/decreto_0196_1971.htm))

- **Art. 24:** no se puede ejercer la abogacía **ni anunciarse como abogado** sin inscripción vigente.
- **Art. 25:** nadie puede litigar en causa propia o ajena sin ser abogado inscrito (salvo excepciones); la infracción no anula lo actuado pero acarrea las sanciones del ejercicio ilegal.
- **Art. 28:** se puede litigar en causa propia sin ser abogado, entre otros casos, "en ejercicio del derecho de petición y de las acciones públicas".
- **Art. 41, numeral 1:** incurre en ejercicio ilegal quien sin ser abogado inscrito "se anuncie o haga pasar por tal" y quien "ofrezca servicios personales que requieran dicha calidad".
- **Art. 2:** la misión del abogado incluye asesorar, patrocinar y asistir a las personas en sus relaciones jurídicas. El decreto **no define "asesoría" ni "consulta"** como actos reservados de forma detallada.
- **Sanciones:** el art. 41 remite a "las sanciones señaladas para tal infracción", y los arts. 57-65 del decreto figuran derogados por la Ley 1123 de 2007 (Código Disciplinario del Abogado, que rige a abogados). **No pude confirmar qué sanción concreta, penal o disciplinaria, se aplicaría a una plataforma no abogada [no verificado]**. Tampoco encontré jurisprudencia ni doctrina colombiana sobre chatbots y ejercicio ilegal de la abogacía; un trabajo académico (Universidad Antonio Nariño) señala la falta de regulación clara **[fuente secundaria]**. Es un **vacío regulatorio**: se asume el riesgo más conservador.

### 2.2 Lo que no requiere abogado (leído)

| Trámite | Norma | Puntos clave |
|---|---|---|
| **Derecho de petición** ante autoridades | Constitución art. 23; Ley 1755 de 2015, arts. 13-17, 21, 23 | Gratuito y "sin necesidad de representación a través de abogado" (art. 13). Se resuelve en 15 días; documentos e información en 10; consultas en 30 (art. 14). Puede presentarse verbalmente (con constancia) o por escrito "a través de cualquier medio idóneo para la comunicación o transferencia de datos" (art. 15); ninguna autoridad puede negarse a recibir y radicar (art. 15, par. 2). Contenido mínimo: autoridad, nombres y apellidos, **documento de identidad y dirección**, objeto, razones, anexos, firma si procede (art. 16). Nunca se rechaza por fundamentación inadecuada (art. 16, par. 2). Si queda incompleta, la autoridad pide completar en 10 días y el peticionario tiene un mes, so pena de desistimiento tácito (art. 17). Si no es competente, remite en 5 días (art. 21). |
| **Aliados institucionales** | Ley 1755, art. 23 | Los servidores de la Procuraduría y la Defensoría y los **personeros** deben prestar asistencia eficaz e inmediata a quien la pida para ejercer el derecho de petición y pueden recibir peticiones en sustitución de las autoridades. |
| **Tutela** | Constitución art. 86; Decreto 2591 de 1991, arts. 10, 14, 29, 46, 49 (leído en [normas.cra.gov.co](https://normas.cra.gov.co/gestor/docs/decreto_2591_1991.htm)) | No es necesario actuar mediante apoderado (art. 14). Sin formalidades ni autenticación; puede ser verbal si hay urgencia o la persona no sabe escribir. Fallo en 10 días (art. 29). Un tercero solo puede actuar por **agencia oficiosa** si el titular no puede defenderse (art. 10); el Defensor del Pueblo y los personeros también pueden (arts. 46, 49). Hay un formulario oficial, [Tutela en línea](https://procesojudicial.ramajudicial.gov.co/TutelaEnLinea), que pide documento de identidad, correo y teléfono. |
| **Contratos** | Regla general: libertad de forma, con excepciones solemnes (p. ej., escritura pública para inmuebles) **[no verificado; de conocimiento general]** | Zona gris. Un contrato entre dos particulares no requiere abogado, pero redactar contratos "a la medida" puede considerarse asesoría. Las compraventas de tierras rurales, posesiones, herencias y formalización de predios son de alto riesgo y deberían derivarse. |

### 2.3 Línea entre información jurídica general y asesoría (propuesta de trabajo)

| Zona | Ejemplos para el MVP |
|---|---|
| **Verde** (información y pedagogía; uso de plantillas por el propio usuario) | Explicar qué es un derecho de petición y la tutela; plazos legales generales de la Ley 1755; a qué tipo de entidad dirigirse; mostrar un modelo de petición con campos para llenar; listar personerías y consultorios |
| **Amarilla** (requiere validación y salvaguardas) | Decirle a la persona cuál trámite "le conviene" en su caso; sugerir fundamentos jurídicos específicos; calcular caducidades o términos de recursos de su caso; redactar un contrato personalizado |
| **Roja** (evitar en el MVP) | Presentarse como "abogado", "asesor jurídico" o "abogado virtual" (arts. 24 y 41); representar o firmar por otros; presentar tutelas por terceros sin cumplir agencia oficiosa; prometer resultados; manejar poderes |

**Reglas de marca y lenguaje:** el nombre y los mensajes dicen "información y herramientas para redactar", nunca "asesoría legal" ni "abogado". El bot se declara como bot desde el primer mensaje.

### 2.4 Consultorios jurídicos como aliados (Ley 2113 de 2021, leída en [Colpensiones](https://normativa.colpensiones.gov.co/colpens/compilacion/docs/ley_2113_2021.htm))

- **Servicios (art. 6):** asesoría jurídica, conciliación, representación judicial y extrajudicial, actuaciones y recursos administrativos, y **pedagogía en derechos**.
- **Beneficiarios (art. 8):** sujetos de especial protección constitucional y personas sin recursos; los consultorios pueden atender en asuntos relacionados con su condición.
- **Estudiantes pueden (art. 9)**, con autorización expresa del director del consultorio en cada caso, presentar derechos de petición, quejas, reclamos y recursos administrativos, y actuar en tutelas, acciones de cumplimiento y populares.
- **Atención virtual (art. 13):** procede cuando el beneficiario vive en un municipio sin consultorio, con garantía de **confidencialidad, trazabilidad y documentación** del servicio. Es el encaje legal para un canal digital hacia el campo.
- **Cómo usarlos:** (1) validar y firmar el contenido de las plantillas (docente supervisor), (2) recibir los casos que el bot no debe resolver (escalamiento humano), (3) dar credibilidad ante líderes. Convenios con entidades están en el art. 7, que no alcancé a revisar **[no verificado]**. Los consultorios requieren aprobación del Ministerio de Justicia (art. 5).

### 2.5 Responsabilidad si la información es errónea

No encontré norma o jurisprudencia colombiana específica para información errónea de un chatbot jurídico gratuito. Marcos que probablemente aplican **[todos de memoria; no verificados]**: responsabilidad civil extracontractual (Código Civil, art. 2341), deberes de información veraz y suficiente del Estatuto del Consumidor (Ley 1480 de 2011), y las reglas de habeas data si el error afecta datos. Daños realistas del MVP:

1. **Plazo equivocado** (p. ej., un recurso vencido). Mitigación: los plazos se toman solo de una tabla verificada, con fecha de verificación visible, y siempre con "confirme con la personería".
2. **Petición mal dirigida o incompleta.** La ley ya amortigua: nunca se rechaza por fundamentación inadecuada, la autoridad debe remitir si no es competente (art. 21) y pedir completar (art. 17). El riesgo real es el desistimiento tácito si la persona no responde en un mes.
3. **Que el usuario crea que tiene un abogado.** Mitigación: aviso de límites en el primer mensaje y en cada documento.

**Mitigaciones de proceso:** versionado de plantillas con fecha y responsable que las revisó, revisión periódica (trimestral) por consultorio o abogado, canal para reportar errores, registro de cambios, seguro de responsabilidad si el proyecto escala **[valorar con abogado]**.

### 2.6 IA generativa y justicia: T-323 de 2024 y Acuerdo PCSJA24-12243

- **T-323 de 2024** (leída en la [relatoría](https://www.corteconstitucional.gov.co/relatoria/2024/T-323-24.htm)): un juez usó ChatGPT 3.5 para ampliar la motivación de un fallo de tutela (caso de un menor con autismo y una EPS). La Corte no halló vulneración del debido proceso porque la IA se consultó después de decidir, pero advirtió riesgos de alucinaciones y sesgos, y encontró incumplidos en parte la transparencia y la responsabilidad. Enunció **doce criterios** para funcionarios judiciales: transparencia, responsabilidad, privacidad, no sustitución de la racionalidad humana, seriedad y verificación, prevención de riesgos, igualdad y equidad, control humano, regulación ética, adecuación a buenas prácticas, seguimiento continuo e idoneidad. Ordenó al Consejo Superior de la Judicatura divulgar una guía. **La sentencia habla de jueces; no contiene reglas para ciudadanos o plataformas.** Sirve como estándar de buenas prácticas.
- **Acuerdo PCSJA24-12243 de 2024** ([Rama Judicial](https://www.ramajudicial.gov.co/web/consejo-superior-de-la-judicatura/-/consejo-superior-de-la-judicatura-expidi%C3%B3-lineamientos-para-el-uso-responsable-y-seguro-de-la-ia-generativa-en-la-rama-judicial)): lineamientos para el uso de IA en la Rama Judicial, con tres categorías de uso, deber de informar el uso de IA generativa y deber de conocer el manejo de datos. Aplica a servidores judiciales, no a terceros.
- **Cómo lo uso en el diseño:**

| Criterio de T-323 | Aplicación al bot |
|---|---|
| Transparencia | Decir desde el inicio que es un bot y qué hace la tecnología |
| Responsabilidad | Persona responsable nombrada y abogado/consultorio que revisa el contenido |
| Privacidad | No ingresar datos personales a servicios de terceros; minimización |
| No sustitución humana / control humano | Escalamiento a una persona (también lo exige la política de WhatsApp para automatización, ver 5.4) |
| Verificación y prevención de riesgos | Contenido jurídico determinista (plantillas y árbol de decisión), sin texto jurídico generado por LLM |
| Seguimiento continuo | Revisión trimestral y registro de errores reportados |

- **Estado legislativo de IA (proyectos de ley, CONPES 4144 de 2025):** **[no verificado; no pude consultarlo]**. La circular de la SIC cita el CONPES 3975 de 2019.

---

## 3. Ley 2213 de 2022 y canales digitales válidos

**Texto leído** en [Función Pública](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=187626) (copia PDF). Adopta como legislación permanente el Decreto 806 de 2020.

- **Alcance (art. 1):** procesos judiciales de las jurisdicciones ordinaria (civil, laboral, familia), contencioso administrativa, constitucional y disciplinaria, autoridades administrativas con funciones jurisdiccionales y arbitraje. **No regula el derecho de petición ante la administración.** La tutela cae en la jurisdicción constitucional.
- **Igualdad y acceso presencial (art. 1):** el acceso por medios tecnológicos debe respetar la igualdad; no se puede omitir la atención presencial cuando el usuario la requiera, con medidas especiales para población vulnerable o sitios sin conectividad.
- **Población rural (art. 2):** "La población rural, los grupos étnicos, las personas con discapacidad y las demás personas que tengan alguna dificultad para hacer uso de los medios digitales, podrán acudir directamente a los despachos judiciales" y gozan de atención presencial; los despachos deben tomar medidas para asegurarles acceso.
- **Formalidades (art. 2):** las actuaciones no requieren firmas manuscritas ni digitales, presentaciones personales ni autenticaciones, ni medios físicos. Los despachos publican en su web sus canales oficiales.
- **Deberes (art. 3):** los sujetos procesales actúan por medios tecnológicos e informan sus canales digitales; mientras no avisen cambio, las notificaciones siguen válidas en el canal anterior (**riesgo para quien comparte teléfono o lo pierde**).
- **Parágrafo 2 del art. 2:** municipios, **personerías** y otras entidades públicas, en la medida de sus posibilidades, facilitarán que los sujetos procesales accedan en sus sedes a las actuaciones virtuales.
- **Poderes (art. 5):** pueden conferirse por mensaje de datos sin firma, con la sola antefirma; para un abogado, con su correo del Registro Nacional de Abogados.

**Canales válidos, resumen:**

| Trámite | Canal | Fuente |
|---|---|---|
| Derecho de petición | Verbal con constancia, escrito físico, o "cualquier medio idóneo para la comunicación o transferencia de datos" (correo, formulario web). La fecha y hora de radicación son las del medio (art. 15, par. 1). La entidad no puede negarse a recibir y radicar | Ley 1755, art. 15 (leído) |
| Derecho de petición, ventanilla virtual / PQRSD de cada entidad | Cada entidad define sus canales **[no verificado el régimen de canales electrónicos del CPACA, Ley 2080 de 2021]** | n/a |
| Tutela | Escrito sin formalidades, verbal en casos de urgencia, y [Tutela en línea](https://procesojudicial.ramajudicial.gov.co/TutelaEnLinea) | Decreto 2591, art. 14 (leído); página oficial (leída) |
| Presencial asistido | Personería, Defensoría, consultorio jurídico | Ley 1755, art. 23; Ley 2213, art. 2 par. 2; Ley 2113 |

**Implicaciones de diseño:**

1. El bot **genera y orienta**, pero el usuario (o el líder en modo asistido) **radica**. No radicar a nombre de otros evita problemas de representación y de datos.
2. El documento final **debe incluir la cédula y la dirección** (art. 16 de la Ley 1755), pero **eso no obliga a que el bot las reciba** (ver 5.3).
3. Dar siempre una **ruta presencial** (personería, consultorio) cuando no hay conectividad; es un derecho reconocido, no un plan B.
4. Advertir que hay que informar un nuevo canal si cambia el teléfono o el correo (art. 3 de la Ley 2213), en trámites judiciales.

---

## 4. Modelo de amenazas

### 4.1 Contexto

- **Somos Defensores, informe anual 2025** (abril de 2026, citado por [Forbes Colombia](https://forbes.co/2026/04/14/actualidad/colombia-registro-165-asesinatos-de-lideres-sociales-en-2025-y-cerca-de-900-agresiones/)): **165 asesinatos y 874 agresiones** a personas defensoras en 2025; amenazas 55 % de los casos; Cauca epicentro con 238 agresiones, de ellas 2 casos de "robo de información"; impunidad cercana a 86 %. La nota es ambigua sobre qué cifra creció 5 %. La página de [Somos Defensores](https://somosdefensores.org/) reporta para enero-junio de 2026 **401 agresiones, 59 de ellas asesinatos** de defensores.
- **Autoría:** la nota atribuye la violencia a la expansión y disputas de grupos armados ilegales, pero no desglosa autores. **[desglose por actor no verificado]**.
- **Adversarios plausibles** (formulación de [EFF "Your Security Plan"](https://ssd.eff.org/module/your-security-plan): qué proteger, de quién, qué pasa si falla, qué tan probable, cuánto esfuerzo, quiénes son aliados): grupos armados con presencia local y capacidad de revisar teléfonos o presionar a familiares y funcionarios locales; actores con acceso a autoridades locales o a empleados de operadores; delincuencia que suplanta; familiares o vecinos con acceso físico al teléfono; y, fuera del alcance de la Ley 1581, organismos de inteligencia.

### 4.2 Activos a proteger

1. La vida y la integridad de la persona y su familia.
2. La relación **persona - hecho denunciado - destinatario** (quién denuncia qué a quién).
3. La condición de líder u organización social de la persona.
4. Ubicación (vereda, finca, rutas).
5. Contactos y redes.

### 4.3 Escenarios y mitigaciones

| # | Escenario | Qué filtra | Mitigaciones concretas |
|---|---|---|---|
| A | **Teléfono revisado o confiscado** (retén, visita, robo) | Chat con el bot, documentos en la galería, notificaciones en pantalla bloqueada, nombre del contacto | Nombre de contacto **neutro**; el bot **no repite ni resume** el relato del usuario (sin eco); el bot instruye activar mensajes temporales, desactivar descarga automática de multimedia y borrar el chat; archivos con nombre genérico; **modo asistido** en que la persona ni siquiera usa su teléfono; documento generado en blanco en lo sensible |
| B | **Historial revela quién denuncia qué** | Contenido del chat y archivos | El diseño evita que el relato pase por el bot: el hecho se escribe a mano o directamente en la plantilla local; el bot solo elige modelo y llena campos no sensibles |
| C | **Metadatos de WhatsApp** | Número, horarios, dispositivo, IP, contactos | No eliminables. EFF: el cifrado protege lo que se dice, no que se comunica, y WhatsApp comparte con Meta número, registros de uso, IP e identificadores de dispositivo ([EFF WhatsApp](https://ssd.eff.org/module/how-to-use-whatsapp)). Reducir lo que **nosotros** registramos (sin logs de contenido, número solo como HMAC). Ser honestos con el usuario. Ofrecer alternativa **presencial/asistida** para casos de alto riesgo |
| D | **SMS** | Todo el contenido, para quien tenga poder sobre el operador | EFF: "los SMS no están cifrados en absoluto". Usar SMS **solo** para claves y códigos cortos o enlaces, nunca contenido ni nombres |
| E | **Número compartido o teléfono familiar** | Todo lo anterior, a otra persona de confianza o no | Sin recordatorios salientes; sin historial persistente; opcional PIN de sesión; no usar el número como identidad de nada sensible; el usuario puede iniciar "salida rápida" (ver 5.5) |
| F | **Ingeniería social y suplantación del bot** | Datos, claves, ubicación | Número de empresa verificado; el líder entrega el número en persona; mensaje fijo "nunca le pediremos clave, código, cédula, ubicación ni fotos de documentos por este chat"; el bot no envía enlaces fuera de dominios propios y .gov.co; no acepta archivos |
| G | **Coerción al líder** para entregar listas o abrir su teléfono | Lista de usuarios | **No hay lista**; el panel administrativo solo muestra conteos agregados; el líder no guarda registro (se le capacita para no hacerlo); política: "no podemos entregar lo que no tenemos" |
| H | **Compromiso del backend** (ataque, insider, proveedor) | Lo que esté almacenado | Minimización, TTL, cifrado, HMAC con clave separada (sección 5), MFA, mínimo privilegio, logs sin PII, plan de incidentes |
| I | **Requerimientos legales o ilegales de datos** a la organización o a Meta | Lo que exista | Minimización; protocolo escrito: solo orden escrita de autoridad competente y revisión jurídica; registro del requerimiento |
| J | **El documento mismo expone al peticionario** al ser radicado ante una autoridad local capturada o infiltrada | Identidad y hecho denunciado | El bot sugiere **rutas neutrales** para temas de riesgo (Defensoría, personería regional, Procuraduría) y advierte no incluir nombres de agresores ni detalles que no sean necesarios. Existencia de reserva de identidad en peticiones **[no verificado]**; consultar con el consultorio |
| K | **Error del sistema de IA** (alucinación, sesgo) que da un trámite o plazo erróneo | Daño al derecho | Contenido determinista; ver 2.5 y 2.6 |
| L | **Pérdida del servicio** (Meta bloquea el número) | Disponibilidad | Plan B por SMS y presencial. Meta puede pausar o rechazar plantillas en cualquier momento y exige opt-in ([política](https://whatsappbusiness.com/policy/)) |

### 4.4 Protocolo de riesgo alto (obligatorio en el MVP)

Si el usuario menciona amenazas, grupos armados o peligro inminente (palabras clave definidas con las organizaciones aliadas):

1. El bot **deja de pedir datos** y no guarda nada.
2. Responde con un mensaje corto de orientación y ruta de **protección humana** (Defensoría, personería, línea de protección de organizaciones) y propone contacto humano.
3. No genera documento con detalles del hecho en el chat.
4. Recursos verificados: **Programa Somos Defensores** (proteccion@somosdefensores.org, tel. (057 1) 2814010 o 2813048, según [su sitio](https://somosdefensores.org/)); **Access Now Digital Security Helpline** para incidentes digitales (gratuita, 24/7, atiende en español, responde en menos de dos horas, [página](https://www.accessnow.org/help/)). Los números de línea nacionales de protección **[no verificados; confirmar con las organizaciones aliadas antes de publicarlos]**.

### 4.5 Recomendaciones de organizaciones (lo que pude verificar)

- **EFF, Surveillance Self-Defense:** metadatos pueden ser reveladores aun con cifrado; los SMS no están cifrados; los mensajes temporales sirven contra quien tenga acceso físico al teléfono, incluido un familiar o una autoridad, pero no impiden capturas de pantalla; las copias de seguridad de WhatsApp son opcionales y conviene activar la cifrada de extremo a extremo; WhatsApp es de código cerrado ([comunicación](https://ssd.eff.org/module/communicating-others), [WhatsApp](https://ssd.eff.org/module/how-to-use-whatsapp)).
- **Access Now, Digital Security Helpline:** apoyo gratuito y rápido a defensores, con evaluación de riesgo y estrategia de seguridad; remite a Digital First Aid Kit, Security in a Box y SSD ([página](https://www.accessnow.org/help/)).
- **Front Line Defenders / Security in a Box:** guías para móviles, mensajería segura, recuperación de cuentas comprometidas y amenazas físicas, en español ([Security in a Box](https://securityinabox.org/es/), [Front Line Defenders](https://www.frontlinedefenders.org/en/digital-protection)).
- **Tactical Tech, Holistic Security:** seguridad digital integrada con bienestar psicosocial y seguridad organizacional; ciclo preparar-explorar-planear-actuar; análisis de amenazas como paso central ([manual](https://holistic-security.tacticaltech.org/)).
- **Somos Defensores:** documenta agresiones (SIADDHH) y ofrece protección y formación en autoprotección y análisis de riesgo. Su página no menciona seguridad digital específica.
- **Protection International y Fundación Karisma:** **[no verificado]**. La página de Protection International que intenté abrir devolvió 404 y la página de Karisma no mostró guías. Recomiendo que alguien del equipo las contacte directamente (Karisma trabaja derechos digitales en Colombia; Protection International publica un manual de protección para defensores).

---

## 5. Medidas técnicas concretas y mínimas para el MVP

### 5.1 Principio rector (la "escalera" minimalista)

1. ¿Hace falta este dato? Si no, no se pide.
2. ¿Puede quedarse en el teléfono del usuario? Entonces no llega al servidor.
3. ¿Puede vivir solo en memoria? Entonces no se persiste.
4. ¿Debe persistir? Se cifra, se seudonimiza y tiene fecha de vencimiento.

### 5.2 Clasificación de datos

| Clase | Ejemplos | Tratamiento |
|---|---|---|
| **P0: nunca llega al servidor ni se guarda** | Relato del hecho, nombres de agresores o víctimas, cédula, dirección, ubicación GPS, pertenencia a organización, condición de víctima, datos de menores, audio, fotos de documentos | Se deja **en blanco** en el documento para llenar a mano o en el dispositivo; el bot no lo solicita |
| **P1: efímero, solo sesión** | Plantilla elegida, campos no sensibles (p. ej., entidad destinataria, tipo de trámite), paso actual | Memoria o almacén con TTL de **24 h** de inactividad, cifrado; se borra al terminar o con BORRAR TODO |
| **P2: persistente y seudónimo** | HMAC del número, fecha-hora de aceptación, versión del aviso, respuesta ("1"), métricas agregadas | Conservar lo mínimo; métricas con umbral mínimo (p. ej., no reportar celdas con menos de 10 casos) |

**Nota técnica:** un número colombiano tiene poca entropía; un hash simple (SHA-256) se revierte por fuerza bruta. Usar **HMAC-SHA-256 con una clave secreta guardada fuera de la base de datos** (gestor de secretos). Esto es **seudonimización**, no anonimización: sigue siendo dato personal.

### 5.3 Cédula y datos de identificación: no pedirlos

- La Ley 1755 (art. 16) exige documento de identidad y dirección **en la petición**, y el formulario de Tutela en línea pide número de documento, correo y teléfono. Por eso **es indispensable en el documento final, no en el chat**.
- La política de Meta para empresas **prohíbe compartir o pedir** "personal ID card numbers" y otros identificadores sensibles por la plataforma ([política, sec. 3](https://whatsappbusiness.com/policy/), leída). Si el bot pidiera la cédula violaría esa política y arriesgaría el bloqueo del número.
- **Diseño:** el documento sale con campos "Nombre completo: ________  Cédula: ________  Dirección: ________" para que la persona los complete a mano o en su dispositivo antes de radicar. Alternativa offline-first: una PWA o plantilla descargable que se llena **localmente** sin que ningún dato salga del teléfono.
- Si en una fase posterior se necesitara generar el documento con la cédula, hacerlo **solo en memoria**, entregar el archivo y purgar en el mismo flujo; nunca registrar.

### 5.4 Lista de medidas (qué hacer y qué evitar)

**Datos y retención**
1. No guardar el contenido de los mensajes. Los logs de la aplicación no incluyen cuerpos de mensaje, solo eventos (p. ej., "plantilla X generada") sin identificador reversible.
2. Estado de sesión con TTL de 24 h; borrado verificable.
3. Sin listas de usuarios, sin CRM, sin hojas de cálculo con nombres. El panel administrativo solo muestra agregados.
4. Backups: o no hay copias del estado de sesión, o se cifran y vencen con el mismo TTL.

**Cifrado y acceso**
5. TLS en todo; cifrado en reposo con claves del proveedor o KMS **[confirmar que el proveedor elegido lo activa por defecto]**; secretos fuera del código.
6. Verificar la firma de los webhooks de Meta; limitar tasa; sin endpoints de depuración en producción.
7. MFA para todos los accesos de administración; mínimo privilegio; ningún acceso a producción desde equipos personales.
8. Dependencias auditadas (p. ej., `npm audit`) antes del piloto.

**Consentimiento y derechos**
9. Aviso de privacidad y autorización en el **primer mensaje**, antes de cualquier dato (5.6).
10. Palabras clave siempre disponibles: **BORRAR TODO** (borrado inmediato de P1 y del vínculo en P2, con confirmación sin detalles), **POLITICA** (política de tratamiento corta), **AYUDA/HUMANO** (escalamiento), y **SALIR**.
11. Identificación del titular al ejercer derechos (Decreto 1377, art. 20): basta que el mensaje venga del mismo número, dado que no guardamos otra cosa.

**WhatsApp y SMS**
12. Solo flujos iniciados por el usuario dentro de la ventana de 24 horas; sin mensajes salientes de promoción ni recordatorios. La política de Meta exige opt-in y permite automatización en esa ventana **si hay una vía clara de escalamiento a una persona**; fuera de la ventana solo plantillas aprobadas ([política](https://whatsappbusiness.com/policy/), leída). Esto también evita el riesgo tipo Movistar (1.6).
13. SMS: solo palabras clave, códigos y enlaces; nunca nombres ni hechos (los SMS no están cifrados).
14. Los mensajes temporales **no se pueden imponer desde el bot** a la conversación del usuario **[no verificado en la Cloud API]**. Hay que enseñar al usuario a activarlos (24 horas, 7 o 90 días, según EFF) y a borrar el chat.

**IA**
15. Sin LLM en el MVP; si se usa, solo para clasificar intención sobre texto depurado, sin PII, con contrato de transmisión y sin retención del proveedor **[verificar condiciones del proveedor]**. El contenido jurídico es determinista y validado.
16. No guardar ni enviar audios a terceros.

**Operación**
17. Plan de incidentes de una página: quién decide, cómo contener, a quién avisar (titulares y, si aplica, SIC). La obligación y el plazo de reportar incidentes de seguridad a la SIC **[no verificado; en mi recuerdo el Título V de la Circular Única la regula; confirmar]**.
18. Política de requerimientos de autoridades: solo orden escrita, revisión jurídica, registro.
19. Capacitación de líderes de 30 minutos: mensajes temporales, desactivar descarga automática y guardado en galería, bloqueo de pantalla, verificación en dos pasos de WhatsApp, no guardar listas, a quién llamar si pierden el teléfono (Access Now).

### 5.5 Flujo "BORRAR TODO" y salida rápida

1. El usuario escribe BORRAR TODO (o "borrar", "salir ya", por si se equivoca).
2. El sistema borra P1, la sesión y el vínculo en P2 sin importar el estado, y responde con un mensaje corto, neutro: "Listo, no guardamos nada tuyo. Para borrar este chat en tu celular: mantén presionado el chat y toca la papelera."
3. El mensaje no menciona el trámite ni datos del usuario.
4. Se registra solo un evento anónimo de "borrado ejecutado" (para demostrar cumplimiento, lineamiento X).
5. Limitación honesta: **el bot no puede borrar el chat del teléfono** del usuario, ni evitar capturas de pantalla.

### 5.6 Aviso de privacidad y autorización (3-4 líneas, para validar con abogado)

Cumple el contenido mínimo del art. 15 del Decreto 1377 (responsable, finalidad, derechos, cómo acceder a la política, carácter facultativo de datos sensibles) y el art. 12 de la Ley 1581.

**Versión WhatsApp (primer mensaje):**

> Hola, soy [NombreDelBot], un servicio gratuito de [Organización] que te ayuda a armar un derecho de petición. Es información general y plantillas; no somos abogados ni reemplazamos a uno.
> Usamos tu número de WhatsApp solo para atenderte. No guardamos lo que escribes ni tu cédula, y todo se borra a las 24 horas. No tienes que contarnos nada sensible (si eres víctima, tu etnia, tus creencias o a qué organización perteneces); es opcional y puedes seguir igual.
> Puedes conocer, corregir o borrar tus datos cuando quieras: escribe BORRAR TODO. Responsable: [Organización], [correo/teléfono]. Política completa: escribe POLITICA.
> ¿Aceptas? Responde 1 = Sí, acepto · 2 = No.

**Versión SMS (aprox. 150-160 caracteres, sin contenido sensible):**

> [Org]: te ayudamos a armar tu derecho de petición. Solo usamos tu número. 1=Acepto 2=No. Borrar: BORRAR TODO. Más info: POLITICA

Notas: (1) se conserva solo el HMAC, la fecha-hora, la versión del aviso y la respuesta; (2) el texto debe revisarse en lenguaje claro con la comunidad (pruebas de comprensión) y adaptarse a audio si hay baja alfabetización, sin almacenar el audio; (3) la política de tratamiento completa (art. 13 del Decreto 1377) debe existir aparte, con identificación del responsable, finalidad, derechos, área de atención de reclamos, procedimiento y fecha de vigencia.

### 5.7 Mini estudio de impacto de privacidad (estructura exigida por el lineamiento IV de la Circular 002/2024)

| Elemento | Contenido propuesto para el MVP |
|---|---|
| (a) Operaciones de tratamiento | Recepción de mensajes por WhatsApp/SMS; selección de plantilla; llenado de campos no sensibles; entrega del documento; almacenamiento seudonimizado de la aceptación; borrado a petición y por TTL |
| (b) Riesgos para derechos y libertades | Identificación de personas que denuncian; revelación de pertenencia a organizaciones; discriminación; amenazas a la vida e integridad; error en información jurídica; transferencia a terceros en el exterior; suplantación |
| (c) Medidas | Las de 5.2 a 5.5; capacitación de líderes; revisión jurídica de plantillas; contratos con proveedores; protocolo de riesgo alto; plan de incidentes |
| Decisión (lineamientos I y II) | Se tratan solo P2 y P1 efímeros; P0 no se trata. Ante incertidumbre sobre daños graves, se elige no tratar |
| Responsable y fecha | [Nombre], [fecha], revisión cada 6 meses o ante un cambio |

### 5.8 Lo que NO hacer

- Pedir cédula, ubicación, fotos de documentos o el relato del hecho por el chat.
- Enviar texto del usuario a un LLM de terceros.
- Crear un grupo de WhatsApp con usuarios o con "casos".
- Registrar usuarios en hojas de cálculo, formularios web o CRM.
- Mandar mensajes que el usuario no pidió (riesgo Movistar y política de Meta).
- Llamar al bot "abogado" o "asesor jurídico".
- Prometer privacidad absoluta (hay metadatos y teléfonos).

---

## 6. Checklist final de cumplimiento legal y seguridad para el MVP (15 puntos)

- [ ] 1. **Responsable nombrado** con correo/teléfono de contacto, y persona o área de protección de datos (Decreto 1377, art. 23; Ley 1581, art. 17).
- [ ] 2. **Aviso de privacidad y autorización** en el primer mensaje, antes de cualquier dato, con carácter facultativo de lo sensible y respuesta explícita (1/2); nada de silencio como aceptación.
- [ ] 3. **Prueba mínima de autorización** seudonimizada (HMAC del número, fecha-hora, versión del aviso).
- [ ] 4. **Política de tratamiento de una página** accesible con POLITICA y manual interno corto (Decreto 1377, art. 13; Ley 1581, art. 17 k).
- [ ] 5. **No pedir ni almacenar datos sensibles ni cédula**: relato, nombres, cédula, dirección, ubicación y pertenencia quedan en blanco para el usuario; el servicio funciona sin ellos (Decreto 1377, art. 6; política de Meta).
- [ ] 6. **Retención mínima**: solo HMAC y estado de sesión cifrado con TTL de 24 h; sin logs de contenido; sin listas ni CRM.
- [ ] 7. **BORRAR TODO** funcionando y probado, más instrucciones para borrar el chat local y activar mensajes temporales.
- [ ] 8. **Cifrado en tránsito y en reposo, secretos fuera del código, MFA** y mínimo privilegio en toda la infraestructura.
- [ ] 9. **Contratos con Meta, proveedor de API y nube** (transmisión con contenido del art. 25) y decisión documentada sobre LLM: **sin datos personales** o sin LLM.
- [ ] 10. **Mini estudio de impacto de privacidad** documentado (Circular 002/2024, lineamiento IV) y registro de riesgos.
- [ ] 11. **Contenido jurídico determinista**: plantillas y plazos validados por un consultorio jurídico o abogado, con fecha de verificación, sin asesoría personalizada, sin llamarse "abogado" (Decreto 196, arts. 24 y 41); límites visibles en cada documento.
- [ ] 12. **Escalamiento humano y protocolo de riesgo alto** (amenazas): el bot deja de recolectar y deriva a protección humana (Somos Defensores, Defensoría, personería); Access Now para incidentes digitales.
- [ ] 13. **Seguridad operativa de líderes**: capacitación de 30 minutos y regla de no guardar listas ni registros; el líder es facilitador, no depositario.
- [ ] 14. **Anti-suplantación y WhatsApp**: número verificado, mensaje "nunca pedimos…", sin enlaces fuera de dominios propios y .gov.co, solo flujos iniciados por el usuario, sin envíos masivos.
- [ ] 15. **Plan de incidentes y de requerimientos de autoridades** de una página, y **revisión por abogado de datos personales** antes del piloto; confirmar si el RNBD aplica (normalmente no, salvo aliados públicos o activos superiores a 100.000 UVT).

---

## 7. Puntos que requieren validación profesional

Abogado de protección de datos:
1. Texto final del aviso de privacidad y de la autorización; si basta "responder 1" para datos que pudieran ser sensibles.
2. Si la **condición de víctima** o el hecho de **usar el servicio** debe tratarse como dato sensible; si la **pertenencia a organización social** se infiere de algún dato del flujo.
3. Roles (responsable/encargado) de la organización, aliados públicos, Meta y proveedores; calificación del líder social.
4. Si EE. UU. está en la lista de la SIC de países con nivel adecuado (Circular Externa 005 de 2017) y cómo tratar la transferencia a Meta; contrato de transmisión con proveedores y LLM.
5. Retención de la prueba de autorización frente a una solicitud de supresión.
6. Aplicabilidad del RNBD (texto del Decreto 090 de 2018, UVT de 2026) y deber de reportar incidentes a la SIC.
7. Datos de menores y voz como dato biométrico.

Abogado litigante, consultorio jurídico o experto en ejercicio de la abogacía:
8. Alcance de "asesoría" reservada: si plantillas, orientación de ruta y redacción de contratos configuran ejercicio ilegal; sanción aplicable a una plataforma.
9. Validación de plantillas, plazos y rutas; frecuencia de actualización.
10. Reserva de identidad del peticionario y rutas neutrales para temas de riesgo.
11. Responsabilidad civil y necesidad de seguro.
12. Régimen de canales electrónicos del derecho de petición ante cada entidad (CPACA y Ley 2080 de 2021).

Experto en seguridad digital de defensores (Access Now, Karisma, Front Line Defenders):
13. Revisión del modelo de amenazas con líderes reales del territorio y de las palabras clave del protocolo de riesgo alto.
14. Qué puede y no puede hacer la Cloud API (mensajes temporales, almacenamiento y acceso de Meta).

---

## 8. Fuentes y estado de verificación

**Leídas en su texto (normas y documentos primarios)**
- Ley 1581 de 2012: https://relatoria.colombiacompra.gov.co/normativa/ley-1581-de-2012/
- Decreto 1377 de 2013 (compilado en Decreto 1074 de 2015): https://www.suin-juriscol.gov.co/viewDocument.asp?id=1276081 (copia: https://www.unidadvictimas.gov.co/wp-content/uploads/Documentos/decretos/DECRETO_1377_2013.pdf)
- Circular Externa 002 de 2024, SIC: https://sedeelectronica.sic.gov.co/sites/default/files/normativa/Circular%20Externa%20No.%20002%20del%2021%20de%20agosto%20de%202024.pdf
- Concepto SIC sobre obligados al RNBD (nov. 2022): https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/cuales-personas-estan-obligadas-realizar-el-registro-de-bases-de-datos-personales-en-el-rnbd
- Decreto 196 de 1971: https://normas.cra.gov.co/gestor/docs/decreto_0196_1971.htm
- Decreto 2591 de 1991: https://normas.cra.gov.co/gestor/docs/decreto_2591_1991.htm
- Ley 1755 de 2015: https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30043679 (copia: https://www.unidadvictimas.gov.co/wp-content/uploads/Documentos/ley/Ley_1755_2015.pdf)
- Ley 2213 de 2022: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=187626
- Ley 2113 de 2021: https://normativa.colpensiones.gov.co/colpens/compilacion/docs/ley_2113_2021.htm
- Sentencia T-323 de 2024: https://www.corteconstitucional.gov.co/relatoria/2024/T-323-24.htm (leí la parte inicial; la página es muy larga)
- Acuerdo PCSJA24-12243 (resumen oficial de la Rama Judicial): https://www.ramajudicial.gov.co/web/consejo-superior-de-la-judicatura/-/consejo-superior-de-la-judicatura-expidi%C3%B3-lineamientos-para-el-uso-responsable-y-seguro-de-la-ia-generativa-en-la-rama-judicial
- Tutela en línea: https://procesojudicial.ramajudicial.gov.co/TutelaEnLinea
- Política de mensajería de WhatsApp Business: https://whatsappbusiness.com/policy/
- Términos de Meta para la plataforma de WhatsApp Business: https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform
- Documentación de la Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/overview

**Leídas, fuente secundaria o de organizaciones**
- Holland & Knight, obligaciones del RNBD (2025): https://www.hklaw.com/es/insights/publications/2025/01/obligaciones-del-registro-nacional-de-bases-de-datos-personales
- Multa a Movistar (Vanguardia, oct. 2025): https://www.vanguardia.com/colombia/2025/10/29/multa-millonaria-a-movistar-por-bombardear-a-usuarios-con-llamadas-y-mensajes/
- Orden de la SIC a WhatsApp (DPL News): https://dplnews.com/?p=100495
- Investigación de la SIC a ChatGPT (El Tiempo, 2023): https://www.eltiempo.com/tecnosfera/novedades-tecnologia/ia-investigaciones-de-la-sic-contra-chatgpt-y-otras-plataformas-772549
- Somos Defensores 2025 (Forbes Colombia): https://forbes.co/2026/04/14/actualidad/colombia-registro-165-asesinatos-de-lideres-sociales-en-2025-y-cerca-de-900-agresiones/
- Programa Somos Defensores: https://somosdefensores.org/
- EFF, comunicación segura: https://ssd.eff.org/module/communicating-others ; WhatsApp: https://ssd.eff.org/module/how-to-use-whatsapp ; plan de seguridad: https://ssd.eff.org/module/your-security-plan
- Access Now, Digital Security Helpline: https://www.accessnow.org/help/
- Security in a Box: https://securityinabox.org/es/
- Front Line Defenders, protección digital: https://www.frontlinedefenders.org/en/digital-protection
- Tactical Tech, Holistic Security: https://holistic-security.tacticaltech.org/

**No verificado (resumen)**
- Texto del Decreto 090 de 2018 y UVT 2026 para el RNBD.
- Lista de países con nivel adecuado (Circular Externa 005 de 2017) y si incluye a EE. UU.
- Obligación y plazo de reporte de incidentes a la SIC.
- Ley 1273 de 2009 (art. 269F), Código Civil art. 2341, Ley 1480 de 2011 (citados de memoria).
- Sanción aplicable a una plataforma no abogada por ejercicio ilegal; jurisprudencia sobre chatbots y abogacía.
- Cifrado extremo a extremo y acceso de Meta al contenido en la Cloud API; posibilidad de imponer mensajes temporales; chat lock.
- Estado legislativo de IA en Colombia y CONPES 4144 de 2025.
- Sanciones o decisiones de la SIC en 2026; desglose de autores de agresiones; líneas nacionales de protección.
- Protection International y Fundación Karisma (sin guías verificadas).
- Régimen de canales electrónicos del CPACA (Ley 2080 de 2021) para el derecho de petición.
