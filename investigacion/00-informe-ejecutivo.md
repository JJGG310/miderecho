# Informe ejecutivo: Reto 2, acceso a la justicia rural con bajo consumo de datos

> **Actualizado con la ronda 2 (informes 07 a 11).** Las decisiones nuevas están en la **sección 12** y reemplazan lo que contradigan en las secciones anteriores.

Consolidado de 6 investigaciones paralelas (20-oct-2026). El detalle y las fuentes con URL están en los archivos 01 a 06 de esta carpeta. Las cifras sin verificar quedan marcadas así en los informes de origen; no las usen en el pitch sin revisarlas.

---

## 1. Veredicto en 30 segundos

- **El problema existe y es grande.** En 2020 había 8,2 millones de problemas legales en Colombia y el 77% seguía sin resolverse (ENJ 2020). En municipios PDET, el 55% de las personas tuvo un problema legal serio en 4 años y la mitad no lo resolvió (HiiL 2023).
- **Nadie en Colombia hace lo que proponemos.** Ningún producto genera un derecho de petición dentro de WhatsApp o SMS, y ninguno sigue el plazo de respuesta para avisar "ya te deben responder; si no, este es el siguiente paso". Todos los generadores de documentos son formularios web.
- **El referente del Estado está abandonado.** LegalApp de MinJusticia ya tenía biblioteca sin conexión y lectura en voz alta. Su app de iPhone no se actualiza desde 2019 y tiene 2,0 de 5 estrellas.
- **Lo que funciona en el mundo es una persona intermediaria apoyada por tecnología**, no un bot solo: Tele-Law (India, ~10,9 millones), Namati, Haqdarshak. Los productos solo digitales terminan sirviendo al usuario más conectado (BarefootLaw: 6% mujeres).
- **El usuario no paga. Paga el Estado** (MinJusticia, programa Sistemas Locales de Justicia), con cooperación internacional como contrapartida.
- **Formato ganador:** bot de WhatsApp que prioriza la voz, con flujos fijos (no IA libre), PDF de una hoja, seguimiento de plazos, respaldo por SMS y un kit para líderes de las Juntas de Acción Comunal (JAC).

---

## 2. Mercado: los productos más relevantes (de 43 revisados)

| Producto (país) | Cómo funciona | Cuánto cobra / quién paga | Su plus | Qué le robamos |
|---|---|---|---|---|
| **LegalApp** (CO, MinJusticia) | Guías por tema, rutas, minutas; guardado sin conexión y lectura en voz alta en la app | Gratis (Estado) | Única con modo offline y voz en Colombia | "Ruta primero": ¿necesito abogado? ¿cuesta? ¿a dónde voy? Y la lección: una app del gobierno muere con el cambio de administración |
| **Tuteladora** (CO, Temblores ONG) | Formulario web paso a paso que genera la tutela en PDF | Gratis (donantes) | Paso explícito de autorización de datos | Una pregunta por mensaje, revisión final y consentimiento antes de pedir datos |
| **WAIAS** (CO, startup) | Web + WhatsApp, IA que asiste a abogados | 85.000 COP por consulta, con subsidios | Humano en el circuito | La IA asiste al abogado; no decide la ruta. Nuestro precio de referencia para el pitch |
| **Consultorios jurídicos** (CO, universidades, Ley 2113) | Atención gratuita presencial, virtual y en brigadas | Gratis | Respaldo legal y estudiantes disponibles | Son nuestra capa de revisión humana y validación de plantillas |
| **Sophie** (BR, Defensoría de São Paulo) | Agenda y envía recordatorios por correo, SMS y WhatsApp | Contrato público | Reduce ausencias con cadena de recordatorios | Cadena de recordatorios aplicada a plazos legales |
| **Justina** (AR, Corte de Santa Fe) | Bot de WhatsApp con flujos fijos que pasa a un humano lo que no resuelve | Contrato público | Determinista y confiable | Flujos predefinidos + "hablar con una persona" |
| **WhatsApp Mujer** (CL, Ministerio de la Mujer) | Canal nacional de violencia de género | Gratis (Estado) | Protocolo de emergencia y cifrado visible | Botón de riesgo alto que corta el flujo y deriva |
| **BarefootLaw** (Uganda) | SMS, Facebook, líneas gratuitas, radio, cajas solares | Donantes y abogados voluntarios | 940 mil usuarios, ~18 mil casos resueltos | Radio + SMS. Lección: lo solo digital excluyó a las mujeres |
| **Namati / Timap** (Sierra Leona, Mozambique, etc.) | Paralegales comunitarios con formularios | Donantes | La mejor evidencia de impacto: 76% de casos resueltos y -20% de prisión preventiva | Paralegal comunitario = nuestro "promotor" de la JAC. Cada caso se convierte en dato para incidencia |
| **Haqdarshak** (India) | Agentes locales con app offline, WhatsApp y tarjeta QR | Empresas (RSE) + pequeña tarifa por trámite | 6-7 millones de ciudadanos | QR del agente para atribuir adopción. Lección: de 5.077 capacitadas solo ~1.000 quedaron activas, así que capacitar no es activar |
| **Tele-Law** (India, gobierno) | Facilitador en centro comunitario conecta por teléfono o video con un abogado | Gobierno | ~10,9 millones de beneficiarios | Usar infraestructura existente (Casas de Justicia, Personerías) + facilitador local |
| **A2J Author / docassemble** (EE.UU., código abierto) | Entrevistas guiadas que generan documentos; docassemble tiene interfaz SMS | Gratis / open source | >7 millones de usos | No construir el motor de documentos desde cero |
| **JusticeBot** (Canadá, Quebec) | Bot determinista que explica y cita la norma | Gobierno | Explicable | Mostrar "qué dice la ley" con la fuente |
| **DoNotPay** (EE.UU.) | "Abogado robot" por suscripción | Usuario | — | **Lección:** la FTC lo multó con 193.000 USD por prometer de más con IA |
| **Rechtwijzer** (Países Bajos) | Plataforma de separaciones en línea | Consejo de asistencia legal + usuarios | — | **Lección:** cerró en 2017 por falta de comprador y por abarcar demasiado. Un solo caso de uso, bien hecho |
| **U-Report / RapidPro** (UNICEF) | Infraestructura abierta para SMS y WhatsApp | UNICEF y socios | >10 millones de usuarios en 68 países | Motor de flujos abierto y anonimato |

**Patrón de precios:** al ciudadano rural nadie le cobra. Los que sobreviven cobran a quien puede pagar (gobierno, empresas por RSE, cooperación) o una tarifa mínima por trámite asistido. Los que mueren dependían de un solo donante (M-Haki, Calia) o de un solo gobierno.

---

## 3. Brechas = nuestra oportunidad

1. **Documento dentro de WhatsApp o SMS:** no existe en Colombia.
2. **Ruta + documento + seguimiento del plazo en un solo flujo:** no existe en ningún producto revisado.
3. **Herramienta para la primera línea rural** (presidente de JAC, conciliador en equidad, corregidor): hoy solo reciben capacitaciones y boletines.
4. **Voz:** ningún producto colombiano acepta ni responde notas de voz.
5. **Privacidad:** es el eslabón más débil de la competencia y nuestro diferenciador defendible.

---

## 4. Población afectada y usuario objetivo

- **Conectividad:** el 56,9% de los hogares rurales tenía internet en 2025, casi siempre móvil, y el 98% de quienes navegan usa smartphone. Aun así, ~1,8 millones de hogares rurales siguen sin internet.
- **Celular compartido:** el 83,4% lo usa pero solo el 65,4% tiene uno propio, así que el diseño debe asumir que otra persona puede leer el chat.
- **El problema es la distancia:** casi todos los municipios tienen juez, comisario, inspector y personero en la cabecera; las veredas no. No hay que vender "no hay abogados".
- **Problemas rurales frecuentes:** salud/EPS, servicios públicos, tierras, conflicto armado.
- **Líderes:** son el canal natural y también un blanco. Indepaz cuenta 1.978 asesinados desde 2016, y 87 entre enero y julio de 2026.

**Usuario de entrada recomendado:** familias campesinas de municipios PDET (2,99 millones de personas en lo rural PDET), atendidas a través de su JAC (63.833 organizaciones en el país).
**Primer caso de uso:** derecho de petición por servicios públicos, salud o trámites. Es gratis y no requiere abogado.
**Fase 2, con aliados especializados:** víctimas, mujeres rurales y comunidades étnicas. Tienen más dolor, pero también más riesgo; las étnicas además exigen consulta previa.
**Piloto sugerido:** Montes de María, Sur del Tolima o Macarena-Guaviare. Evitar Cauca, Catatumbo y Pacífico nariñense en un primer piloto por la violencia contra líderes.

---

## 5. Quién paga y modelo de negocio

- **Cliente pagador #1:** el **Ministerio de Justicia, programa Sistemas Locales de Justicia**, por convenio de asociación con una ESAL aliada. La cooperación internacional (PNUD, Fondo Multidonante, UE) pone la contrapartida del 30%. Dos argumentos: la Ley 2430 de 2024 obliga a llevar justicia rural "procurando el uso de las TIC", y el Ministerio ya firmó un convenio similar en sept-2026 por COP 1.586 millones para 140 municipios (cifra de prensa; **verificar en SECOP antes del pitch**).
- **Cliente #2:** gobernaciones y alcaldías PDET por mínima cuantía.
- **No pitchear a** ANT, URT ni JEP: el presupuesto 2027 las recorta.
- **Costo:** la tecnología cuesta COP 150-450 por caso; lo caro es la capa humana.
- **Precio ilustrativo:** COP 15 millones por municipio al año (~COP 31.000 por caso), frente a los 85.000 COP de una consulta privada. Equilibrio cerca de 30 municipios. Un piloto de 3 municipios necesita ~COP 130 millones de subvención.
- **WhatsApp:** desde el 1-oct-2026 Meta cobra los mensajes de servicio después de 1.000 gratis al mes por número. Hay una exención para ONG que todavía no tiene proceso de solicitud.

---

## 6. Formato recomendado

**Bot de WhatsApp que prioriza la voz.** Botones y listas en lugar de escribir; audios pregrabados en cada paso; PDF de una hoja con lectura en voz alta; cálculo del plazo con calendario de festivos; 3 recordatorios y una pregunta al vencer ("¿le respondieron?"). Un caso completo gasta unos 0,3 a 0,45 MB.
- **Respaldo SMS:** solo código de caso y fecha, sin tildes y sin datos personales. Ejemplo: "Peticion 4F7K vence el 1-dic".
- **Modo líder:** el líder abre el bot con el vecino al lado. El vecino es quien da el consentimiento, y el líder nunca guarda listas.
- **Kit para líderes:** credencial con QR, volante con pictogramas, tarjeta de plazos, audios para sus grupos, guion de radio de 30 s, protocolo de seguridad de una hoja.
- **Marca:** colectiva ("Promotores de Derechos de la vereda X"). El rostro del líder es opcional, por seguridad.
- **Descartados para el MVP:** USSD (exige acuerdos con operadores), app instalable (barrera de entrada y antecedente de LegalApp) y chat libre con IA (Meta lo prohíbe).
- **Plazo:** la Ley 1755 dice "15 días siguientes" y, por el art. 62 de la Ley 4 de 1913, se cuentan hábiles. Son 10 días si se piden documentos y 30 si es una consulta.

El flujo de 12 pasos con un caso real ("tubería del acueducto rota") está en `05-formato-canales-adopcion.md`, sección 7.

---

## 7. Reglas legales y de seguridad que no se negocian

1. **No guardar contenido.** Del número solo se guarda un hash, y la sesión expira a las 24 h. Comando **BORRAR TODO**.
2. **No pedir cédula por el chat.** La política de WhatsApp Business lo prohíbe. No pedir datos sensibles: ser víctima, etnia, pertenencia a una organización social (art. 5, Ley 1581).
3. **El contenido legal sale de plantillas fijas validadas** por un consultorio jurídico. Nunca de una IA que redacte libremente, y nada de datos personales a un LLM de terceros.
4. **Nunca llamarse "abogado" ni "asesor jurídico"** (Decreto 196 de 1971). La herramienta da información general y plantillas para que la persona haga su propio trámite; el derecho de petición y la tutela no requieren abogado.
5. **Protocolo de riesgo alto:** si aparece una amenaza, el bot deja de recolectar datos y deriva a la Defensoría, la Personería o Somos Defensores.
6. **Aviso de privacidad** de 4 líneas en el primer mensaje, con respuesta explícita 1 = acepto. El texto propuesto está en `06`, sección 5.6.

El checklist completo de 15 puntos está en `06-marco-legal-seguridad.md`, sección 6.

---

## 8. Contraste con nuestro doc "BEST TEAM"

| Sección del doc | Veredicto | Ajuste |
|---|---|---|
| 1. Modo offline | **Cambiar el foco** | LegalApp ya hizo esto. Que sea complemento (PDF y guías que quedan en el chat), no el producto. El canal es WhatsApp, no una app |
| 1. "Borradores guardados en el dispositivo" | **Riesgo** | El celular es compartido y a los líderes se los revisan. No guardar el relato en el equipo; añadir BORRAR TODO |
| 2. Navegación guiada por botones | **Mantener** | Coincide con lo que funciona (A2J, Justina, JusticeBot) y con la política de Meta |
| 2. Entrada por audio / descripción libre | **Mantener con límites** | Audio para transcribir y clasificar la ruta, sin guardarlo. Sin IA que opine. Transcribir español rural es un riesgo técnico no probado |
| 3. Datos personales (nombre, cédula) | **Cambiar** | Nombre y cédula quedan en blanco en el PDF y la persona los llena a mano al firmar |
| 4. "¿Qué dice la ley? / ¿Qué significa para mí?" | **Mantener** | Es Legal Design puro. Incluir fuente y fecha de verificación |
| 4. "Posible vulneración, sin afirmar infracción" | **Mantener** | Nos protege del riesgo DoNotPay y del de ejercicio ilegal |
| 5. Generación de documentos | **Mantener** | Es el corazón. Un solo documento en el MVP: el derecho de petición |
| — | **Agregar: seguimiento de plazos** | Nuestro diferencial: nadie lo hace |
| — | **Agregar: modo líder + kit + estrategia de difusión** | El reto lo pide explícitamente y el doc no lo tiene |
| — | **Agregar: protocolo de riesgo alto y escalamiento humano** | Con consultorio jurídico y Personería |
| — | **Agregar: quién paga** | MinJusticia (Sistemas Locales de Justicia) + cooperación |

---

## 9. Decisión abierta para el equipo

**¿Cómo se capturan los hechos del caso sin violar la regla de no guardar relatos?** Los dos agentes chocan aquí.
- **Opción A (recomendada para el MVP):** hechos armados con botones y frases plantilla por tema, por ejemplo "El servicio de [agua] está suspendido desde [fecha]". El texto libre o el audio se procesan en memoria, se muestran en el PDF y se borran. Nombre y cédula quedan en blanco.
- **Opción B:** audio libre transcrito por un modelo propio (Whisper alojado por nosotros) y resumido con plantillas. Es más ameno, pero tiene más riesgo técnico y legal.

---

## 10. Pitch de 60 segundos (base)

"Casi la mitad de las tutelas en Colombia, más de 430.000 en 2025, existen porque una entidad no respondió un derecho de petición. En el campo, la gente ni siquiera llega a pedir: la alcaldía queda a horas de camino y el 93% de los campesinos usa el celular para llamar, no para chatear. Nosotros le contestamos esa llamada. Un asistente de voz le arma su derecho de petición, lo envía a la alcaldía sin que tenga que viajar, le avisa cuándo le deben responder y, si no le responden, le prepara el siguiente paso. Funciona en cualquier celular, sin internet, no guarda lo que la persona cuenta y llega de la mano del presidente de su Junta de Acción Comunal. El campesino no paga: paga el Estado, que por la Ley 2430 de 2024 está obligado a llevar justicia al campo con tecnología."

(Cifras de costo y precio actualizadas en la sección 12.4.)

---

## 11. Verificar antes de presentar

- El Convenio 698-2026 del Ministerio en SECOP II.
- Tarifas oficiales de WhatsApp en COP y cómo acreditar la exención para ONG.
- Si legalapp.gov.co sigue en línea (no respondió desde fuera de Colombia).
- La calidad de transcripción de audios en español rural, si se elige la opción B.
- Que un abogado o consultorio jurídico valide la plantilla del derecho de petición, el aviso de privacidad y el cálculo de plazos.

---

## 12. Ronda 2: lo que cambió y decisiones (informes 07 a 11)

### 12.1 Datos nuevos que mueven el diseño

| Hallazgo | Fuente | Qué cambia |
|---|---|---|
| El 45-48% de las tutelas son por derechos de petición no respondidos (432.658 en 2025). El 73% termina con respuesta u orden a favor del ciudadano | 07 (Rama Judicial) | Prueba el dolor. El seguimiento del plazo y el paso a tutela tienen valor real |
| No existe un dato oficial de mora de las alcaldías rurales | 07 | No inventar una "tasa de no respuesta" en el pitch; usar la cifra de tutelas |
| Se puede radicar sin viajar y sin correo propio: la ley acepta "cualquier medio idóneo" | 08 (Ley 1755, art. 15) | **Eslabón 4 resuelto**: el servicio envía la petición por correo a la alcaldía. Las 15 alcaldías PDET revisadas publican correo |
| Ninguna alcaldía recibe por WhatsApp, y los formularios en línea tienen captcha | 08 | El canal de salida es el correo, no el formulario |
| El 52% de la tenencia rural tiene indicios de informalidad, y la "carta venta" no transfiere propiedad | 09 (UPRA 2020) | **Contratos fuera del MVP.** Generar cartas venta daría falsa seguridad |
| En lo rural, el 93,1% usa el celular para **llamar** y solo el 64,3% para mensajes; el 84,1% prefiere trámites en persona o por teléfono | 10 (DANE ENTIC 2024) | **La llamada de voz pasa a ser canal principal**, a la par de WhatsApp |
| El analfabetismo rural es 10,4%, y el 15,7% de los hogares rurales tiene alguien que no lee | 10 (MinEducación 2026) | Refuerza voz primero |
| Conciliadores en equidad, jueces de paz y dignatarios de JAC trabajan sin pago; los estímulos legales casi no se entregan | 10 | Hay que presupuestar el incentivo del promotor |
| ElevenLabs Agents permite flujos deterministas y tiene voces colombianas. Una llamada de 9 min cuesta ~COP 6.600 | 11 | Viable para el MVP. La transcripción del acento rural no está probada |

### 12.2 La solución, versión 2

**Tres puertas de entrada, un solo motor:**

1. **Llamada de voz** (cualquier celular, sin internet): agente de IA que conversa, con preguntas cerradas y teclado para lo sensible.
2. **WhatsApp** (smartphone): flujo con botones y notas de voz pregrabadas.
3. **Modo líder**: el presidente de la JAC o un conciliador abre el servicio con el vecino al lado.

**El motor (igual para las tres puertas):**
`clasificar el problema → ruta → derecho de petición (plantilla validada) → envío por correo a la alcaldía → cálculo del plazo → recordatorios → día 16`

**Árbol del día 16** (detalle en 07, sección 3.3):
- **No respondieron, o la respuesta fue evasiva:** (A) supervigilancia en la Personería, gratis, con 5 días hábiles de respuesta; (B) **tutela**, sin abogado, fallo en 10 días; (C) desacato si no cumplen.
- **Respondieron que no, con razones:** no es violación del derecho de petición. Derivar a recursos o a un consultorio jurídico.

**Ruta sin documento para cubrir "contratos":** "¿Su carta venta lo hace dueño?". Son 5 preguntas y terminan en un derecho de petición a la ANT, la formalización gratuita o un consultorio jurídico.

**Candidato a segundo documento:** la tutela por derecho de petición no respondido. Es la continuación natural del flujo, tiene alta tasa de éxito y no requiere abogado. Se hace en el hackathon si sobra tiempo; si no, va en la fase 1.5.

### 12.3 Decisiones pendientes

**D1. Datos personales para radicar en digital.** Este es el choque más serio entre informes. Para enviar la petición por correo, el PDF necesita nombre y cédula (Ley 1755, art. 16). Pero 06 y 11 recomiendan no pedirlos, y WhatsApp prohíbe pedir la cédula por chat.
- **Propuesta:** dos modos que la persona elige.
  - *"Envíenla por mí"*: pide nombre y cédula **solo en el paso final**, por teclado en la llamada o en un formulario de nuestro dominio, nunca por chat de WhatsApp. Se conservan en memoria hasta enviar el correo y luego se borran.
  - *"La entrego yo"*: el PDF sale con los datos en blanco, para firmar a mano y entregar con el líder o en la Personería. No guarda ningún dato.
- **Validar con abogado:** si enviar en nombre del campesino crea representación, si audio + código vale como manifestación de voluntad, y si el buzón del servicio puede ser la dirección de notificación.

**D2. Respuesta de la alcaldía en nuestro buzón.** Si la persona autoriza nuestro buzón como dirección de notificación, el bot puede detectar si respondieron y reenviar la respuesta. Así el seguimiento no depende de que el usuario avise, pero manejamos contenido del caso un tiempo. **Propuesta:** reenviar y borrar en menos de 24 h, sin conservar copia. Validar con abogado.

**D3. Privacidad del agente de voz.** Con una plataforma gestionada, el audio pasa por un tercero (ASR y LLM). **Propuesta del informe 11:** conversación abierta de solo 1 o 2 turnos ("cuénteme en una frase qué pasó"), todo lo demás con preguntas cerradas y teclas, y nada de nombre, cédula ni dirección por voz. En el demo se usan datos sintéticos.

**D4. Riesgo técnico de la transcripción rural.** No hay benchmark para español colombiano rural por teléfono. **Mitigación:** siempre una alternativa por teclado ("diga sí o marque 1"). En el hackathon, probar con 10-20 audios grabados por el equipo imitando acentos y mostrar la tasa de error con honestidad.

### 12.4 Costos y precio recalculados (supuestos de los agentes, validar)

| Componente | Costo por caso |
|---|---|
| Tecnología, caso por WhatsApp | COP 150-450 |
| Tecnología, caso por llamada (9 min) | ~COP 6.600 (rango 4.800-10.000) |
| Envío por correo + SMS de recordatorio | ~COP 250-750 |
| Incentivo del promotor (auxilio COP 30.000/mes + COP 10.000 por caso cerrado) | ~COP 33.000 |
| Operación central (de 04, a escala PDET) | ~COP 22.000 |

**Conclusión:** con promotores pagados, el costo real ronda **COP 55.000-62.000 por caso**, no los COP 31.000 del informe 04. Sigue por debajo de los COP 85.000 de una consulta privada, pero el precio debe partirse en dos:
- **Licencia tecnológica:** ~COP 15 millones por municipio al año (lo que ya teníamos).
- **Red de promotores:** ~COP 14 millones por municipio al año (12 promotores), como línea aparte que pueden pagar la alcaldía, MinJusticia o la cooperación.
- **Total:** ~COP 29 millones por municipio al año.
- **Variante barata para el piloto:** solo incentivos no monetarios (certificado firmado con la Personería o una universidad, reconocimiento en la radio) más COP 10.000 por caso cerrado. Así medimos si eso alcanza para activar líderes antes de pagar auxilio mensual.

### 12.5 Lista consolidada para validar con abogado o consultorio jurídico

1. La plantilla del derecho de petición y el cálculo de plazos (hábiles, con festivos; 10, 15 y 30 días).
2. Envío por correo en nombre del peticionario: representación, manifestación de voluntad, buzón de notificación (D1, D2).
3. La plantilla de tutela por derecho de petición, si entra.
4. El aviso de privacidad de 4 líneas y el consentimiento por voz o por tecla.
5. Datos sensibles (víctima, pertenencia a una organización social) y la transferencia de datos a Meta o ElevenLabs (EE.UU.).
6. Que el servicio no constituya ejercicio ilegal de la abogacía (Decreto 196 de 1971).
7. La ruta "¿Su carta venta lo hace dueño?" y sus salidas.

### 12.6 Lo que sigue faltando

- **La rúbrica del jurado.** Sigue siendo el dato más importante y no lo tenemos.
- Tiempo restante y habilidades del equipo.
- Un líder o una JAC real para validar el flujo por llamada, aunque sea 15 minutos.
- Los pendientes de cada informe, marcados "no verificado" en 07 a 11.

---

## 13. Decisión del equipo: es una app (20-oct-2026)

- **Formato:** app web instalable (PWA) que funciona sin internet. Prototipo funcional en `../prototipo/` (ver su README).
- **Usuario principal:** la persona líder (presidente de JAC, conciliador), que la usa con sus vecinos. Quien tenga smartphone también puede usarla sola.
- **Lo que reemplaza:** el bot de WhatsApp y la línea telefónica salen del MVP. El modo líder cubre a quien no tiene smartphone. Los SMS quedan solo para recordatorios.
- **Voz:** lectura en voz alta de todo y dictado. El agente conversacional de ElevenLabs queda como siguiente paso, cuando haya conexión.
- **Mensaje para el jurado:** "LegalApp intentó ser una app para todos y no funcionó. Nosotros somos la herramienta de quien la comunidad ya busca cuando tiene un problema."
