# 08. Radicar un derecho de petición sin viajar y sin correo propio

Fecha de la investigación: 20-oct-2026. Alcance: solo el problema de la radicación (cómo llega el papel a la alcaldía). La respuesta de las entidades, los contratos rurales y la adopción los cubren otros informes.

**Aviso:** no soy abogado. Esto es investigación de apoyo para el hackathon, no concepto jurídico. Marqué **[verificado]** lo que leí en la fuente primaria, **[parcial]** lo que solo vi en un resumen o en una parte del texto, y **[no verificado]** lo que no pude confirmar. Las calificaciones de riesgo (bajo, medio, alto) son mi evaluación.

---

## 0. Respuesta corta

1. **Sí se puede radicar sin viajar y sin correo propio, y es legal.** La ley no exige presencia física, ni correo electrónico del peticionario, ni abogado. La petición escrita puede presentarse "a través de cualquier medio idóneo para la comunicación o transferencia de datos" (Ley 1755 de 2015, art. 15). La verbal se puede recibir por medios electrónicos o tecnológicos (Decreto 1166 de 2016). Para recibir la respuesta, la ley solo exige una dirección de correspondencia; la dirección electrónica es opcional (art. 16, num. 2).
2. **Lo que NO tiene respaldo es WhatsApp como canal hacia la alcaldía.** No encontré norma ni sentencia que lo reconozca. La T-230 de 2020 (Facebook Messenger) sirve solo por analogía, y la Función Pública dice que cada entidad define sus canales oficiales. Ninguna de las 15 alcaldías que revisé publica WhatsApp para peticiones. WhatsApp sirve entre el campesino y nuestro servicio, no entre nuestro servicio y la alcaldía.
3. **Los canales reales son dos:** correo institucional y formulario PQRSD en línea. Las 15 alcaldías publican correo; 10 tienen formulario confirmado y en 5 no pude confirmarlo. Diez de las 15 usan la misma plataforma estatal (GOV.CO Territorial), con "seguimiento por ticket" que no exige correo.
4. **Recomendación para el MVP: opción (a) corregida.** El servicio envía el PDF por correo desde una cuenta propia al correo institucional de la alcaldía, como **medio de transmisión** y no como representante. El campesino es el peticionario, aprueba el texto con una constancia de voz y un código, y autoriza el buzón del servicio como dirección de notificación. Ruta de respaldo: formulario web llenado por una persona (nunca por un bot, hay hCaptcha) y Personería (opción d). El líder acompaña, pero no radica.
5. **Cinco puntos para el abogado** (detalle en la sección 6): si "transmitir en nombre de otro" crea una representación; si audio más código vale como firma electrónica; si el buzón del servicio vale como dirección de notificación (CPACA art. 56); si la alcaldía puede exigir registro previo (CPACA art. 54); y automatizar formularios con captcha.

---

## 1. Marco legal

### 1.1 Qué dice la ley sobre el medio de presentación

| Norma | Qué dice | Qué implica para nosotros | Estado |
|---|---|---|---|
| **Ley 1755 de 2015, art. 15** ([Función Pública](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65334)) | Las peticiones se presentan verbalmente (con constancia) o por escrito, "a través de cualquier medio idóneo para la comunicación o transferencia de datos". El par. 1 dice que fecha y hora de radicación son las registradas en el medio por el que llegó. El par. 2 dice: "ninguna autoridad podrá negarse a la recepción y radicación de solicitudes y peticiones respetuosas". | Un correo a la dirección oficial es radicación válida y su sello de tiempo cuenta. Se puede rechazar una negativa de recibir. | [verificado] |
| **Ley 1755, art. 15 (cond. exequibilidad C-951/14)** ([sentencia](https://www.corteconstitucional.gov.co/relatoria/2014/C-951-14.htm)) | La Corte declaró exequible el artículo "bajo el entendido" de que exigir la petición por escrito debe motivarse con un acto administrativo de carácter general. | Una alcaldía no puede imponer "solo por escrito" o "solo por formulario" sin un acto general que lo justifique. | [verificado] |
| **Ley 1755, arts. 13 y 16** | El derecho de petición es gratuito y se ejerce "sin necesidad de representación a través de abogado". La petición debe traer autoridad, nombre e identificación del peticionario (y de su representante o apoderado "si es el caso"), dirección de correspondencia (el correo electrónico es opcional), objeto, razones y documentos. La firma se exige "cuando fuere el caso". No se puede rechazar por fundamentación incompleta (par. 2). | Con nombre, cédula y una dirección física basta. No se necesita correo del campesino. | [verificado] |
| **CPACA (Ley 1437 de 2011), art. 5, nums. 1, 9 y 10, modificados por Ley 2080 de 2021** ([CPACA](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41249), [Ley 2080](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=156590)) | Derecho a presentar peticiones "por cualquier otro medio idóneo y sin necesidad de apoderado", y a hacerlo "por cualquier medio tecnológico o electrónico disponible en la entidad", incluso "por fuera de las horas y días de atención". Num. 10: identificarse con medios de autenticación digital. | El derecho es amplio, pero el texto dice "disponible en la entidad": la entidad escoge cuáles canales electrónicos abre. | [verificado] |
| **CPACA, art. 7, nums. 6 y 8** | Deber de "tramitar las peticiones que lleguen vía fax o por medios electrónicos", de adoptar medios tecnológicos y "permitir el uso de medios alternativos para quienes no dispongan de aquellos". | Fundamento de la obligación de recibir por correo y de ofrecer una vía no digital. | [verificado] |
| **CPACA, arts. 53, 53A, 54** | Los trámites pueden hacerse por medios electrónicos, pero la autoridad debe asegurar acceso gratuito o permitir procedimientos alternativos. Las personas pueden usar canales digitales cuando el procedimiento lo disponga; MinTIC puede declararlos obligatorios y debe garantizar el acceso a quienes no puedan usarlos. Art. 54: quien actúa por medios electrónicos debe hacer "un registro previo como usuario", pero las peticiones de información y consulta por medios electrónicos no lo requieren. | El art. 54 es una ventana de riesgo: una alcaldía podría pedir registro para otros tipos de petición. Ver sección 6. | [verificado] |
| **CPACA, arts. 56, 60, 61, 62** | Art. 56: la notificación electrónica exige que "el administrado haya aceptado este medio". Art. 60: toda autoridad debe tener "al menos una dirección electrónica". Art. 61, num. 3: la autoridad debe enviar un acuse con fecha y número de radicado. Art. 62, num. 1: ese acuse "será prueba tanto del envío hecho por el interesado como de su recepción". | El campesino debe aceptar expresamente el buzón del servicio como dirección de notificación. El acuse es nuestra mejor prueba. | [verificado] |
| **Decreto 1166 de 2016** (compilado en el Decreto 1069 de 2015, cap. 12, [texto](https://www.cancilleria.gov.co/sites/default/files/Normograma/docs/pdf/decreto_1166_2016.pdf)) | Regula las peticiones verbales presenciales, telefónicas, "por medios electrónicos o tecnológicos" o por cualquier medio idóneo para transferir la voz (art. 2.2.3.12.1). Las autoridades deben habilitar medios tecnológicos o electrónicos para recibirlas, incluso fuera de horas (art. 2.2.3.12.2). Constancia inmediata con número de radicado, fecha, hora, identificación y la mención de que fue verbal (art. 2.2.3.12.3). No se puede negar la recepción verbal con la excusa de exigir un documento escrito (art. 2.2.3.12.12). Deben adoptar medidas de inclusión para personas vulnerables (art. 2.2.3.12.8) y recibir peticiones en lenguas nativas (art. 2.2.3.12.9). | Es la mejor base para el campesino que no escribe ni firma. Una nota de voz es "comunicación o transferencia de la voz", aunque la entidad debe tener el canal habilitado. En las páginas revisadas no vi que lo anuncien, salvo el teléfono. | [verificado] |
| **Ley 527 de 1999, arts. 5, 6, 7** ([DIAN](https://normograma.dian.gov.co/dian/compilacion/docs/ley_0527_1999.htm)) | No se niegan efectos jurídicos a un mensaje de datos. El requisito de escrito se cumple con un mensaje de datos accesible. El de firma se cumple con un método que identifique a la persona e indique que aprueba el contenido, "confiable y apropiado". | Base para firma por foto, audio y código. | [verificado] |
| **Decreto 2364 de 2012**, hoy en el Decreto 1074 de 2015, arts. 2.2.2.47.1 y ss. ([DIAN](https://normograma.dian.gov.co/dian/compilacion/docs/decreto_2364_2012.htm)) | Firma electrónica: "códigos, contraseñas, datos biométricos, o claves criptográficas" que identifiquen a la persona respecto de un mensaje de datos, confiables y apropiados, y con posible acuerdo de partes. Tiene los mismos efectos que la firma. | Un código de un solo uso más constancia de voz es defendible, pero hace falta un acuerdo de uso explícito. | [verificado] |
| **Ley 2052 de 2020 y Decreto 88 de 2022** ([Ley](https://normograma.dian.gov.co/dian/compilacion/docs/ley_2052_2020.htm), [Decreto](https://normograma.dian.gov.co/dian/compilacion/docs/decreto_0088_2022.htm)) | Regulan **trámites** (digitalizar, automatizar, hacer en línea). Para alcaldías de nivel básico e intermedio, los plazos son: 30% digitalizado a marzo de 2026, 60% a septiembre de 2028 y 100% a diciembre de 2030 (según la tabla en la copia de la DIAN). | No obligan a las alcaldías a abrir canales para el derecho de petición: este es una actuación, no un trámite. Muestran que la digitalización de alcaldías pequeñas va lenta. Que las alcaldías PDET sean de nivel "básico" o "intermedio" es [no verificado]. | [verificado] el texto, [no verificado] la clasificación |
| **Resolución MinTIC 2893 de 2020** ([texto](https://cancilleria.gov.co/sites/default/files/Normograma/docs/resolucion_mintic_2893_2020.htm)) | Lineamientos para estandarizar sedes electrónicas, ventanillas únicas y su integración al Portal Único del Estado. | Es el origen de la plataforma estandarizada GOV.CO Territorial. Si exige o no un formulario PQRSD en cada sede, es [no verificado]. | [parcial] |

### 1.2 ¿Están obligadas las alcaldías a recibir peticiones por canales electrónicos?

- **Sí, a recibir por los medios electrónicos que tengan.** Por CPACA art. 5 num. 1, art. 7 num. 6, art. 60 (al menos una dirección electrónica) y art. 15 par. 2 de la Ley 1755 (no pueden negarse a recibir). La sede electrónica incluye un registro electrónico de documentos con acuse (art. 61).
- **No hay una lista de canales obligatorios.** El Concepto 162811 de 2021 de la Función Pública dice que la norma "no señala expresamente cuáles son los medios específicos", que cada entidad reglamenta su trámite interno y que, si el ciudadano usa un canal no oficial, el servidor puede sugerirle otro ([concepto](https://www.funcionpublica.gov.co/eva/gestornormativo/norma_pdf.php?i=164868), [verificado]).
- **No hay obligación de WhatsApp.** Una búsqueda de 2025-2026 no encontró ley nueva que lo imponga [parcial].

### 1.3 WhatsApp y redes sociales

- **Sentencia T-230 de 2020** ([texto](https://www.corteconstitucional.gov.co/relatoria/2020/T-230-20.htm), [verificado] el texto; la sentencia no menciona WhatsApp). Una persona pidió copias por Facebook Messenger a la empresa de acueducto de Popayán, que la remitió a canal presencial o correo. La Corte confirmó la tutela con estas ideas:
  - Las redes sociales no están excluidas, porque son un "medio idóneo" si permiten comunicación de doble vía.
  - Quien mantiene abierto un buzón de mensajes directos asume que le lleguen peticiones y debe tramitarlas.
  - La entidad debe poder identificar quién es el peticionario y que aprueba el contenido (Ley 527), y puede pedir datos adicionales, con flexibilidad a favor del ciudadano.
  - Debe poder rastrearse el mensaje de punta a punta.
  - No todo mensaje es una petición.
  - Debe seguir existiendo canal físico para quienes no tienen tecnología.
- **Ejemplo de posición contraria.** La Alcaldía de Medellín responde en una página de preguntas frecuentes de 2022 que las redes sociales no son medio oficial de radicación, solo orientación ([página](https://www.medellin.gov.co/es/preguntas-frecuentes/puedo-realizar-un-derecho-de-peticion-por-medio-de-redes-sociales-facebooktwitterinstagram/), [verificado]).
- **No encontré sentencia de la Corte Constitucional sobre WhatsApp** y peticiones a entidades [no verificado: solo hice búsquedas web, no una búsqueda directa en la relatoría de la Corte].
- **Conclusión de diseño.** Si una alcaldía llegara a abrir WhatsApp oficial, la T-230 daría un argumento fuerte. Hoy ninguna lo hace en la muestra, así que no podemos depender de eso.

### 1.4 Reglas que importan para la evidencia y la respuesta

- **Prueba del envío.** Fecha y hora son las del medio (Ley 1755, art. 15 par. 1). El acuse de recibo prueba envío y recepción (CPACA art. 62). Si fallan los medios electrónicos de la autoridad, el remitente puede insistir dentro de 3 días o enviar por otro medio, con constancia de la falla (art. 62, num. 2).
- **Petición incompleta.** La autoridad debe requerir dentro de los 10 días siguientes a la radicación; el peticionario tiene 1 mes para completar o se le tiene por desistido (Ley 1755, art. 17, [verificado]). **Riesgo operativo clave:** el requerimiento llegará al buzón del servicio y el bot debe avisar al campesino de inmediato.
- **La respuesta debe llegarle al peticionario.** La T-545 de 1996 amparó a una peticionaria porque la entidad respondió a tiempo pero a una dirección distinta a la que ella indicó ([texto](https://www.corteconstitucional.gov.co/relatoria/1996/T-545-96.htm), [verificado]). Hay que escoger con cuidado la dirección de notificación que va en la petición.
- **Peticiones análogas.** Si más de 10 personas presentan peticiones análogas de interés general, la entidad puede dar una única respuesta pública, pero debe enviarla a todos los que la formularon (CPACA art. 22, con condición de C-951/14).

---

## 2. Representación, terceros, firma y personas que no saben firmar

### 2.1 ¿Puede un tercero radicar en nombre del peticionario? ¿Se necesita poder?

- **No se necesita abogado.** Ley 1755 art. 13 y CPACA art. 5 num. 1 [verificado].
- **La ley no regula expresamente al "mensajero".** El art. 16 contempla un "representante y/o apoderado, si es el caso", pero no define cuándo es necesario. No encontré norma ni sentencia que exija poder para una petición ordinaria de interés particular [no verificado, búsqueda limitada].
- **Excepción: información reservada.** Para documentos con reserva legal (por ejemplo historia clínica o datos personales protegidos), solo puede pedirlos el titular, sus apoderados o "personas autorizadas con facultad expresa" (Ley 1755, art. 24, par., [verificado]). Si la petición del campesino pide ese tipo de documentos, la autorización expresa es obligatoria.
- **Quien presenta la petición queda como titular.** En la T-430 de 2017, el apoderado de una copropietaria, que además era miembro suplente del consejo de administración, presentó la petición; la Corte concluyó que el derecho vulnerado era el suyo y que él estaba legitimado en la tutela por ser quien la presentó ([texto](https://www.corteconstitucional.gov.co/relatoria/2017/T-430-17.htm), [verificado]; el caso es de propiedad horizontal y mi lectura es por analogía). **Implicación:** si el líder o el servicio radican en su propio nombre, ellos quedan como peticionarios y el campesino pierde control. El texto debe nombrar al campesino como peticionario y decir quién transmite.
- **Tutela.** El personero puede interponer tutela "en nombre de cualquier persona que lo solicite o se encuentre en situación de indefensión" (Ley 136 de 1994, art. 178, num. 17, [verificado]). La agencia oficiosa de la tutela está tratada en el informe 06.

### 2.2 ¿Se puede radicar desde el correo de un tercero (servicio, líder, organización)?

- **No hay norma que lo prohíba.** Lo que la entidad debe poder establecer es quién es el peticionario y que aprueba el contenido (Ley 527 art. 7; T-230/2020).
- **Riesgo real de rechazo por falta de certeza.** En dos tutelas de 2023 (STP6023-2023 y STP6582-2023) la petición llegó sin firma desde un correo de titular desconocido, y el juez de instancia declaró improcedente el amparo por falta de certeza sobre quién la presentó ([ejemplo](https://dmsjuridica.com/buscador_20179478954/salapenalcronologico20230723/2024/03/07/stp6582-2023/?pdf=73384), [parcial]: solo vi el resumen de búsqueda y no verifiqué qué decidió la Corte Suprema al resolver la impugnación). Moraleja: la petición debe traer datos de identidad y una forma de acreditar la aprobación.
- **Nuestro servicio no debe presentarse como el peticionario.** Debe aparecer como quien transmite a petición del campesino, con su consentimiento documentado.

### 2.3 Firma escaneada, firma por foto, audio

- **La firma solo se exige "cuando fuere el caso"** (Ley 1755, art. 16, num. 6). En la práctica, para correo y formularios no se pide firma manuscrita.
- **Firma electrónica.** Cualquier método confiable y apropiado que identifique a la persona e indique su aprobación sirve (Ley 527 art. 7; Decreto 2364/2012 arts. 1 a 5). Incluye "códigos, contraseñas, datos biométricos".
- **Firma por foto** (imagen de una firma manuscrita): es un mensaje de datos válido, pero su confiabilidad es débil porque se copia fácil. Es aceptable como complemento, no como único respaldo [mi interpretación].
- **Audio.** Es información comunicada por medios electrónicos y, por tanto, mensaje de datos (Ley 527, art. 5; la definición está en el art. 2, que no releí). Una frase de voz como "Yo, X, con cédula Y, quiero presentar esta petición" sirve de manifestación de voluntad y de prueba. Como "firma", su confiabilidad depende del método de identificación asociado; reforzarlo con un código enviado al número del peticionario y guardar huella digital (hash) del PDF.
- **Importante:** el Decreto 2364 menciona el "acuerdo sobre el uso del mecanismo de firma electrónica" entre las partes. Habría que redactar un aviso corto de aceptación en el flujo. Esto lo debe validar el abogado.

### 2.4 Personas que no saben firmar

- **No hay norma específica sobre huella en peticiones** que yo haya encontrado [no verificado]. La firma a ruego con testigo y huella es una figura notarial (Decreto-Ley 960 de 1970, art. 69, según fuente secundaria, [no verificado]).
- **La ley ofrece rutas mejores que la huella:**
  1. La firma se exige solo "cuando fuere el caso" (art. 16).
  2. La petición verbal con constancia (Decreto 1166, arts. 2.2.3.12.3 y 2.2.3.12.8).
  3. Ninguna autoridad puede negar la recepción verbal con la excusa de exigir un escrito (art. 2.2.3.12.12).
  4. La C-951/2014 recuerda, citando la C-282 de 2007, que exigir solicitud escrita "no impide recibir las solicitudes de las personas que no pueden o no saben escribir" [verificado en el texto de la sentencia].
- **Diseño:** guardar el audio de aceptación y un código de verificación. Si la alcaldía exige huella o testigo, lo hace la Personería en persona (ruta d).

### 2.5 Anonimato y seguridad

- La Corte Constitucional admitió la reserva de identidad: las peticiones anónimas "deban ser admitidas para trámite y resolución de fondo, cuando exista una justificación seria y creíble" (C-951/14, sobre el art. 16 num. 2, [verificado]).
- Los formularios de la plataforma GOV.CO Territorial y el de San José del Guaviare tienen opción "anónima". Útil para casos de amenaza (ver informe 06, protocolo de riesgo alto). Una petición anónima no permite seguimiento por correo, solo por ticket.

---

## 3. Práctica real: 15 alcaldías PDET

**Método.** Revisé el 20-oct-2026 las páginas de inicio, contacto y PQRSD de cada alcaldía con descarga directa y, para los portales que se arman en el navegador, con Chrome sin pantalla. Abrí el formulario de Planadas, cambié de opción en un par de botones y cancelé el inicio de sesión. **No envié ningún formulario ni correo.** No revisé redes sociales ni PDF de "carta de trato digno", así que "WhatsApp: no" significa "no publicado en inicio, contacto ni PQRSD".

**Plataformas.** "Territorial" es GOV.CO Territorial, la plataforma estándar del Estado (misma estructura, mismo formulario). "Propio" es un sitio propio de la alcaldía.

| # | Municipio (subregión PDET) | Plataforma | Correo institucional publicado | Correo de notificaciones judiciales | Formulario PQRSD en línea | WhatsApp publicado | Identificación en el formulario |
|---|---|---|---|---|---|---|---|
| 1 | El Carmen de Bolívar (Montes de María) | Territorial | contactenos@elcarmen-bolivar.gov.co | notificacionjudicial@elcarmen-bolivar.gov.co | Sí, abierto. Tipos de solicitud, ticket y agenda de cita | No | Anónima o "a nombre personal" |
| 2 | Ovejas (Montes de María) | Territorial | contactenos@ovejas-sucre.gov.co | notificacionesjudiciales@ovejas-sucre.gov.co | Sí, abierto | No (hay móvil de "línea gratuita" 312 866 9041; si es WhatsApp: [no verificado]) | Anónima o personal |
| 3 | San Jacinto (Montes de María) | Propio + módulo externo "freylesoft" | contactenos@sanjacinto-bolivar.gov.co | No lo vi | Sí: asistente de 4 pasos (tipo, datos personales, descripción, confirmación). El enlace es http, no https | No | Paso 2 "Datos personales"; opción anónima. Campos exactos: [no verificado] |
| 4 | María La Baja (Montes de María) | Propio (plantilla .aspx) | contactenos@marialabaja-bolivar.gov.co | juridica@marialabaja-bolivar.gov.co | Menú "PQRD / Estado trámite"; no abrí el formulario | No | [no verificado] |
| 5 | Chaparral (Sur del Tolima) | Propio (plantilla .aspx) | contactenos@chaparral-tolima.gov.co (el enlace apunta a contactenos@Tualcaldia.gov.co: inconsistente) | notificacionjudicial@Tualcaldia.gov.co | Página "Todo sobre PQRD" con "Consulte su PQRD"; enlace del formulario: [no verificado] | No | [no verificado] |
| 6 | Planadas (Sur del Tolima) | Territorial | alcaldia@planadas-tolima.gov.co | notificacionjudicial@planadas-tolima.gov.co | Sí, abierto y examinado (ver 3.1) | No | Anónima o personal. "Personal" parece pasar por inicio de sesión (no confirmado) |
| 7 | Rioblanco (Sur del Tolima) | Territorial | contactenos@rioblanco-tolima.gov.co | alcaldia@rioblanco-tolima.gov.co | Sí, abierto | No. **Sin teléfono publicado** ("N/A") | Anónima o personal |
| 8 | Ataco (Sur del Tolima) | Propio (plantilla .aspx, "101 S.A.S.") | alcaldia@ataco-tolima.gov.co | No lo vi | Página PQRD con un marco incrustado que no pude ver; formulario: [no verificado] | No | [no verificado] |
| 9 | Mesetas (Macarena-Guaviare) | Territorial | contactenos@mesetas-meta.gov.co | El mismo correo | Sí, abierto | No | Anónima o personal |
| 10 | La Macarena (Macarena-Guaviare) | Territorial | alcaldia@lamacarena-meta.gov.co | notificacionesjudiciales@lamacarena-meta.gov.co | Sí, abierto | No | Anónima o personal |
| 11 | Vista Hermosa (Macarena-Guaviare) | Territorial | contactenos@vistahermosa-meta.gov.co | notificacionjudicial@vistahermosa-meta.gov.co | Sí, abierto | No | Anónima o personal |
| 12 | Puerto Rico, Meta (Macarena-Guaviare) | Territorial | alcaldia@puertorico-meta.gov.co | El mismo correo | Sí, abierto | No | Anónima o personal |
| 13 | Uribe (Macarena-Guaviare) | Territorial | alcaldia@uribe-meta.gov.co | notificacionjudicial@uribe-meta.gov.co | Enlace en el pie de página; no abrí la página | No | Presumiblemente igual a los demás Territorial |
| 14 | Mapiripán (Macarena-Guaviare) | Territorial | contactenos@mapiripan-meta.gov.co | notificacionjudicial@mapiripan-meta.gov.co | Enlace en el pie de página; no abrí la página | No | Presumiblemente igual a los demás Territorial |
| 15 | San José del Guaviare (Macarena-Guaviare) | Propio | contactenos@sanjosedelguaviare-guaviare.gov.co | notificacionjudicial@sanjosedelguaviare-guaviare.gov.co | Sí: "Solicitud de PQRSDF", "PQRSDF anónima" y consulta de estado; oficina de radicación con horario | No (solo el botón de compartir; celular 318 970 4316, si es WhatsApp: [no verificado]) | Formulario normal y anónimo |

**Qué muestra la muestra:**

1. **15 de 15 publican un correo institucional.** Es el canal electrónico más seguro para radicar. El correo de "notificaciones judiciales" es un buzón para procesos judiciales: **no usarlo para peticiones**.
2. **10 de 15 usan la plataforma Territorial.** Aprender un formulario sirve para diez. Los cinco restantes tienen sitios propios con formularios distintos. El formulario está confirmado en 10 (San Jacinto solo en su primer paso) y sin confirmar en 5 (María La Baja, Chaparral, Ataco, Uribe y Mapiripán).
3. **0 de 15 publican WhatsApp como canal de peticiones.** Esto confirma que no hay camino directo por ahí.
4. **Horario presencial de lunes a viernes, en la cabecera.** Todas las que revisé publican atención presencial en horario de oficina. El formulario y el correo funcionan fuera de ese horario por el art. 5 num. 1 del CPACA.
5. **Teléfono:** 14 de 15 publican teléfono (Rioblanco no). La línea telefónica es el canal oficial para la petición verbal (Decreto 1166, art. 2.2.3.12.2, inc. 2).
6. **Los datos pueden estar mal.** Chaparral mezcla dos dominios de correo; Planadas dice que su línea gratuita "se empezará a legalizar". Antes de usar un correo hay que verificarlo, y una alcaldía puede restringir temporalmente un canal (la Alcaldía de Cali anunció en 2025 que solo recibiría PQRSD por formulario mientras su correo estaba en mantenimiento, [verificado el título](https://www.cali.gov.co/publicaciones/186822/por-mantenimiento-del-correo-institucional-la-alcaldia-solo-recibira-pqrsd-mediante-formulario-dispuesto-en-la-web/)).

### 3.1 El formulario GOV.CO Territorial (visto en Planadas)

- Selector **"A nombre personal"** o **"Anónima"**.
- Texto libre de hasta 5.098 caracteres.
- Adjunto único de hasta **2 MB**; tipos permitidos: pdf, jpg, png, doc, xls, zip, **mp3 y mp4**, entre otros.
- Medio de respuesta a escoger: correo electrónico, correspondencia física, teléfono o **"seguimiento por ticket"**. El portal genera un código y tiene una sección "Hacer seguimiento" donde se consulta con ese código. **Esto permite seguimiento sin correo electrónico.**
- Consentimiento de tratamiento de datos obligatorio. La página cita la Resolución MinTIC 2893 de 2020, anexo 2.
- **Hay captcha**: el formulario carga hCaptcha y tiene campos de reCAPTCHA. Es un control para que lo llene una persona.
- El botón "Inicia sesión" de la cabecera redirige al servicio nacional de autenticación digital (`autenticaciondigital.and.gov.co`). **No sé si "a nombre personal" lo exige** sin enviar el formulario; cancelé la redirección.
- El código de la página habla con una API central de PQRS del Estado (`pqrs-api.micolombiadigital.gov.co`). Una integración oficial con esa plataforma (convenio con MinTIC o la Agencia Nacional Digital) sería un camino limpio; es una hipótesis [no verificado]. **No usé ni copié ninguna credencial del código de la página y no se debe hacer.**
- Un mp3 de 2 MB equivale a unos 4 minutos de voz a 64 kbps (cálculo mío). Una nota de voz de WhatsApp viene en formato opus y habría que convertirla [mi inferencia].

---

## 4. Opciones y riesgo legal

| Opción | Cómo funciona | Base legal | Riesgos principales | Riesgo global | Veredicto |
|---|---|---|---|---|---|
| **(a) El bot envía por correo desde cuenta del servicio, con autorización expresa** | PDF de una hoja como adjunto al correo institucional de la alcaldía. El campesino es el peticionario. El servicio transmite. | Ley 1755 art. 15 y par. 1; CPACA art. 5, 7 num. 6, 61, 62 | (1) La entidad pide poder o cédula porque el remitente no es el peticionario. (2) Rebote o buzón lleno. (3) El requerimiento del art. 17 llega al servicio y el campesino no responde a tiempo. (4) La entidad notifica por correo físico a una vereda. (5) Envío repetido desde un mismo dominio cae en spam. (6) Datos personales (Ley 1581). | **Medio-bajo** con las mitigaciones de la sección 5 | **Recomendada para el MVP** |
| **(b) El bot llena el formulario web** | Un programa completa y envía el formulario de la alcaldía. | Mismo marco; el formulario es un canal legítimo | Hay hCaptcha, que existe para impedir esto. Saltarlo está fuera de los límites del servicio. Términos de uso y posible acceso indebido a un sistema (Ley 1273 de 2009, [no verificado] cómo se aplicaría). Cada alcaldía tiene un formulario distinto. Si "a nombre personal" exige inicio de sesión con cédula, el servicio no puede hacerlo sin credenciales del campesino. | **Alto** si es automatizado; **bajo** si lo hace una persona | **Solo asistido por una persona** (operador del servicio, líder con conexión o Personería). El ticket es la ventaja: sirve para quien no tiene correo |
| **(c) El líder radica en nombre del vecino** | El presidente de la JAC lleva o envía la petición. | Art. 13 (sin abogado); art. 16 (representante "si es el caso") | Si el líder la presenta como suya, el titular es el líder (T-430/17). Exposición y riesgo de seguridad para el líder. No escala. El informe 06 pide no "representar ni firmar por otros". Una petición de interés general puede hacerla la propia JAC como organización. Ley 2166 de 2021 reemplazó a la Ley 743 de 2002 y su regla de representación: [no verificado]. | **Medio** (de datos y de seguridad) | **Líder como acompañante** (conexión, testigo, acompañamiento), no como radicador |
| **(d) Personería como receptora o apoyo** | El campesino o el servicio acuden a la Personería para que oriente, reciba o intervenga. | Ley 1755 art. 23: deber de "asistencia eficaz e inmediata", de intervenir ante las autoridades y de recibir "en sustitución" las peticiones que otra autoridad "se hubiere abstenido de recibir". Ley 136 art. 178, num. 8 (velar por el derecho de petición), 15 (orientar a los habitantes, sustituido por Ley 1551 de 2012) y 17 (tutela por quien lo solicite) | La Personería no es un canal general de radicación para entidades que sí reciben: el art. 23 la activa cuando la autoridad se abstiene, o para asistencia. Está en la cabecera, no en la vereda. Capacidad y conectividad son desiguales. Los datos de contacto de las personerías no aparecen publicados de forma sistemática (no encontré los de Chaparral, Planadas, Mesetas ni El Carmen: [no verificado]). | **Bajo** legal, **alto** en dependencia institucional | **Red de seguridad y aliado** (escalamiento, casos sensibles, tutela). Convenio posible con MinJusticia (informe 00) |
| **(e) Petición verbal por teléfono** (adicional, no pedida) | El campesino o el líder llama a la línea de la alcaldía y pide la constancia con número de radicado. | Decreto 1166, art. 2.2.3.12.2 (línea de atención) y 2.2.3.12.3 (constancia inmediata con radicado) | Requiere señal y saldo. La constancia depende del funcionario. Exposición de la voz. | **Bajo** legal | Ruta de respaldo gratuita para quien tenga señal de voz; el bot da el número y un guion |

---

## 5. Recomendación para el MVP

**Opción (a), con tres respaldos:** formulario asistido por una persona (b), Personería (d) y llamada (e). El líder acompaña (c).

### 5.1 Flujo propuesto

1. **El campesino dicta por WhatsApp** (voz). El bot arma el PDF de una hoja con los elementos del art. 16: autoridad destinataria, nombre completo, cédula, dirección de correspondencia, objeto, razones y anexos.
2. **Dirección de correspondencia.** Poner una dirección física confiable (por ejemplo la caseta de la JAC o la Personería, solo con consentimiento de quien la aporta) y como dirección electrónica **el buzón del servicio, que el campesino autoriza expresamente** para recibir comunicaciones (CPACA art. 56 exige aceptación de la notificación electrónica; T-545/96 muestra el riesgo de una dirección equivocada). La dirección electrónica es opcional en la ley, así que no hace falta un correo del campesino.
3. **Constancia de aprobación.** El bot lee el resumen en voz, el campesino responde con una nota de voz ("Yo, ___, con cédula ___, autorizo que se presente esta petición en mi nombre y que se reciban respuestas en [buzón]") y confirma con un código enviado a su número. Se guarda: audio, código, hash SHA-256 del PDF y sellos de tiempo. Base: Ley 527 art. 7, Decreto 2364/2012.
4. **Envío.** Correo desde un dominio propio con SPF, DKIM y DMARC al correo institucional de la alcaldía (el publicado en su sede electrónica, nunca el de notificaciones judiciales). Asunto estándar. Texto breve: "Se transmite, por solicitud y con autorización expresa de [nombre], quien es el peticionario…". Adjuntos: PDF y, solo si la alcaldía lo pide, el audio y la copia de la cédula (minimizar datos).
5. **Evidencia.** Archivar el correo enviado con encabezados, el acuse de recibo si llega (CPACA art. 61 y 62) y el ticket si se usó formulario. Entregar al campesino por WhatsApp el PDF y una constancia en lenguaje sencillo.
6. **Seguimiento.** Reloj de 15 días desde la recepción (Ley 1755, art. 14; el cómputo y las excepciones los cubre el informe de respuesta de entidades). Si llega una respuesta o un requerimiento al buzón del servicio, reenviarlo al campesino en voz el mismo día (art. 17: 10 días para requerir, 1 mes para completar).
7. **Si no hay acuse o rebota en 3 días hábiles:** (i) reintentar por formulario asistido por una persona con "seguimiento por ticket" (3.1); (ii) llamada a la línea para pedir constancia (e); (iii) Personería (d). Cuando la alcaldía se abstiene de recibir, el art. 23 y el par. 2 del art. 15 sustentan la queja.
8. **Casos de riesgo alto:** ofrecer la opción anónima por formulario (C-951/14) o la Personería. No enviar desde el servicio con datos de contacto del campesino.

### 5.2 Mitigaciones de los riesgos de la opción (a)

| Riesgo | Mitigación |
|---|---|
| La entidad exige poder o cédula | Incluir en el PDF los datos de identidad y anexar, a petición, la constancia de voz y la copia de cédula. Mantener en el correo la línea "el peticionario es [nombre]". Ante rechazo, ir a (d). |
| No acuse o rebote | Enviar a cuenta oficial verificada; guardar encabezados; insistir en 3 días hábiles (art. 62, num. 2); considerar un servicio de correo certificado como mejora (precio: [no verificado]). |
| Requerimiento no atendido (art. 17) | Alertas en el bot; plazo interno de 3 días para reenviar al campesino; plantilla de respuesta por voz. |
| Dirección física errónea | Validar con el campesino; indicar la vereda con referencias y un contacto alterno con su consentimiento. |
| Datos personales | Aviso de privacidad y autorización específicos; no enviar datos a modelos de lenguaje; ver informe 06. |
| Reputación del dominio | Un correo por petición, sin envíos masivos, con firma institucional del servicio. |

### 5.3 Para el hackathon

Mostrar el flujo con un buzón de prueba que simule una alcaldía y enseñar tres cosas: el PDF, la constancia de voz con código y el reenvío de la respuesta al campesino. Decir con claridad que WhatsApp es el canal del campesino con el servicio, no con la alcaldía, y que el siguiente paso es un convenio con personerías y con el programa de MinJusticia.

---

## 6. Qué validar con un abogado (por prioridad)

1. **¿Mensajero o representante?** Si el servicio, al enviar en nombre del campesino, cae en mandato, agencia oficiosa o representación, y qué consecuencia tiene eso para exigir poder, para la legitimación en la tutela y para el ejercicio ilegal de la abogacía (ver sección roja del informe 06).
2. **Audio más código como firma electrónica** ante una alcaldía (Ley 527 art. 7; Decreto 2364), y cómo redactar el acuerdo de uso del mecanismo.
3. **Buzón del servicio como dirección de notificación** (CPACA art. 56) y WhatsApp como medio para comunicar la respuesta al campesino. Qué pasa si la alcaldía notifica por correo físico a la vereda.
4. **CPACA art. 54 contra art. 15 de la Ley 1755:** si una alcaldía puede exigir registro previo o inicio de sesión (el portal Territorial) para peticiones que no son de información o consulta, y si expidió el acto general que exige la C-951/14 para imponer "solo por escrito" o "solo por formulario".
5. **Automatizar formularios con captcha:** términos de uso y Ley 1273 de 2009. Mi posición es no hacerlo.
6. **Ley 1581 de 2012:** autorización, finalidad, transferencia a una entidad pública, minimización y datos sensibles (ver informe 06).
7. **Personas que no saben firmar:** si basta el audio y el código, o si debe haber testigo o huella ante la Personería.
8. **Convenio con personerías y MinJusticia:** forma y alcance del rol de recepción y orientación.
9. **Evidencia de envío:** si basta el correo común con encabezados o conviene correo certificado.

---

## 7. Límites de esta investigación

- **No hay sentencia sobre WhatsApp como canal de radicación** que yo haya encontrado. Mis búsquedas fueron web, no una búsqueda directa en la relatoría de la Corte. Una búsqueda ahí con "WhatsApp" y "derecho de petición" sigue pendiente.
- La **Función Pública** (Concepto 162811 de 2021) es doctrina, no norma. Su parte sobre ampliación de términos por el Decreto Ley 491 de 2020 era transitoria; no verifiqué cuándo perdió vigencia.
- Sobre las **sentencias STP6023-2023 y STP6582-2023** de la Corte Suprema solo vi resúmenes de búsqueda.
- **Personerías:** no encontré datos de contacto públicos de las personerías de la muestra. Falta compilarlos desde el directorio de la Procuraduría u otro listado.
- **Formularios:** no envié ninguno. No sé si "a nombre personal" exige inicio de sesión con Autenticación Digital, ni qué campos pide el de cada alcaldía fuera de Planadas y San Jacinto.
- **La muestra es de 15 alcaldías**, no es estadística. Las alcaldías de otros PDET pueden estar peor conectadas.
- **Resolución MinTIC 1519 de 2020 (Anexo 2)** y su exigencia de PQRSD en sedes web: no pude leer el texto de los anexos [no verificado].
- **Ley 2166 de 2021** (organismos de acción comunal) y su regla de representación legal: [no verificado].

---

## 8. Fuentes

**Normas (texto leído):**
- Ley 1755 de 2015: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65334
- Ley 1437 de 2011 (CPACA, con arts. modificados por la Ley 2080 de 2021): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41249
- Ley 2080 de 2021 (enlace de referencia, no la leí completa): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=156590
- Decreto 1166 de 2016 (peticiones verbales): https://www.cancilleria.gov.co/sites/default/files/Normograma/docs/pdf/decreto_1166_2016.pdf
- Ley 527 de 1999: https://normograma.dian.gov.co/dian/compilacion/docs/ley_0527_1999.htm
- Decreto 2364 de 2012 (firma electrónica): https://normograma.dian.gov.co/dian/compilacion/docs/decreto_2364_2012.htm
- Ley 2052 de 2020: https://normograma.dian.gov.co/dian/compilacion/docs/ley_2052_2020.htm
- Decreto 88 de 2022: https://normograma.dian.gov.co/dian/compilacion/docs/decreto_0088_2022.htm
- Ley 136 de 1994 (art. 178, personeros): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=329
- Resolución MinTIC 2893 de 2020: https://cancilleria.gov.co/sites/default/files/Normograma/docs/resolucion_mintic_2893_2020.htm

**Jurisprudencia y doctrina:**
- Sentencia C-951 de 2014: https://www.corteconstitucional.gov.co/relatoria/2014/C-951-14.htm
- Sentencia T-230 de 2020: https://www.corteconstitucional.gov.co/relatoria/2020/T-230-20.htm
- Sentencia T-430 de 2017: https://www.corteconstitucional.gov.co/relatoria/2017/T-430-17.htm
- Sentencia T-545 de 1996: https://www.corteconstitucional.gov.co/relatoria/1996/T-545-96.htm
- Concepto 162811 de 2021, Función Pública: https://www.funcionpublica.gov.co/eva/gestornormativo/norma_pdf.php?i=164868
- Corte Suprema, STP6582-2023 (solo resumen): https://dmsjuridica.com/buscador_20179478954/salapenalcronologico20230723/2024/03/07/stp6582-2023/?pdf=73384

**Práctica de entidades:**
- Alcaldía de Medellín, FAQ sobre redes sociales (2022): https://www.medellin.gov.co/es/preguntas-frecuentes/puedo-realizar-un-derecho-de-peticion-por-medio-de-redes-sociales-facebooktwitterinstagram/
- Alcaldía de Cali, aviso de correo en mantenimiento (2025): https://www.cali.gov.co/publicaciones/186822/por-mantenimiento-del-correo-institucional-la-alcaldia-solo-recibira-pqrsd-mediante-formulario-dispuesto-en-la-web/
- Sedes de las 15 alcaldías revisadas (20-oct-2026): elcarmen-bolivar.gov.co, ovejas-sucre.gov.co, sanjacinto-bolivar.gov.co, marialabaja-bolivar.gov.co, chaparral-tolima.gov.co, planadas-tolima.gov.co, rioblanco-tolima.gov.co, ataco-tolima.gov.co, mesetas-meta.gov.co, lamacarena-meta.gov.co, vistahermosa-meta.gov.co, puertorico-meta.gov.co, uribe-meta.gov.co, mapiripan-meta.gov.co, sanjosedelguaviare-guaviare.gov.co.

**Informes relacionados en esta carpeta:** `06-marco-legal-seguridad.md` (datos personales, ejercicio de la abogacía, riesgo de seguridad) y `00-informe-ejecutivo.md` (contexto del producto y aliados institucionales).
