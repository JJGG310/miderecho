# 09. Contratos e informalidad en lo rural: tamaño del problema y qué hacer en el MVP

Investigación del 20-oct-2026 (hackathon Reto 2, bot de WhatsApp para derechos de petición en municipios PDET). Pregunta única de este informe: ¿qué tan grande es el problema de los contratos y la informalidad en lo rural, qué puede cubrir una herramienta sin abogado, y entran los contratos al MVP o a la fase 2?

**Cómo leer las etiquetas.** Cada cifra lleva fuente y año. Uso tres etiquetas:
- **[LEÍDO]**: abrí la fuente y vi el dato.
- **[SECUNDARIO]**: lo vi solo en prensa, en un extracto del buscador o en una cita de segunda mano. No lo usen en el pitch sin revisar la fuente original.
- **[NO VERIFICADO]**: no lo pude confirmar. Si aparece una cifra, es para que sepan que circula, no para citarla.

Las referencias F1 a F30 están al final, con URL. Lo que depende de un abogado está marcado **[VALIDAR CON ABOGADO]** y reunido en la sección 6.

---

## 0. Veredicto

1. **El problema de fondo es la tierra, no el contrato como papel.** Más de la mitad de la tenencia rural tiene "indicios de informalidad" (52,2% en 2020, UPRA) [SECUNDARIO, F1, F2]. Ese número no dice que 52% de los predios carezca de título. Dice que cumplen al menos una de varias condiciones de riesgo: sin matrícula inmobiliaria, falsa tradición, mejoras en predio ajeno u otras (F3, F4).
2. **El documento informal más frecuente (la "carta venta") no transfiere propiedad.** La compraventa de un inmueble solo se perfecciona con escritura pública (Código Civil, art. 1857) y la tradición exige registro [LEÍDO en jurisprudencia citada, F16, F17]. Una carta venta sirve como prueba de posesión y como punto de partida para formalizar, no como título.
3. **No hay datos de frecuencia de contratos agrarios** (arriendo, aparcería, jornaleros, compra de cosechas) en las fuentes que pude abrir. El único dato de tenencia por forma que encontré es secundario y de 2014 (F14). Esto pesa en la decisión: no hay evidencia para elegir un contrato por su tamaño.
4. **Recomendación: NO construir generación de contratos en el MVP.** Cubrir "contratos" en el pitch con una ruta de orientación: **"¿Su carta venta lo hace dueño?"**. Termina en el mismo motor que ya vamos a construir (derecho de petición a la ANT, personería o consultorio jurídico) y en la ruta gratuita de formalización. Si el jurado o el equipo exigen un documento, el único de bajo riesgo es el **acuerdo de pago por escrito** (sección 5.4), en fase 2 y con revisión de abogado.
5. **Hay un hallazgo útil para el pitch:** la ANT ya recibe inscripciones por WhatsApp (F19). Nuestra ruta puede llevar al campesino a ese canal en vez de competir con él [SECUNDARIO: lo leí en la página de preguntas frecuentes de la ANT por una herramienta de resumen; confirmar el número y que siga vigente antes de ponerlo en pantalla].

---

## 1. Tamaño del problema: informalidad en la tenencia de la tierra

### 1.1 Cifras clave

| # | Dato | Valor | Año | Fuente | Estado |
|---|---|---|---|---|---|
| 1 | Índice de informalidad UPRA, tenencia rural nacional | **52,2%** (otras fuentes redondean a 52%, 52,0%) | Vigencia 2020 | Valora Analitik (F1); Asuntos Legales, 21-jul-2026 (F2); artículo académico en CienciaLatina (F4) | [SECUNDARIO]. Es la cifra más reciente que encontré. No pude abrir el PDF de UPRA de la vigencia 2020. Un documento de UPRA de 2022 dice que la entidad gestionaba un nuevo cálculo con datos más recientes (extracto del buscador, F3). No encontré una edición posterior a 2020 |
| 2 | Misma medición, edición 2014 | **54,31%**; de 1.122 municipios: 288 con 75-100% de informalidad, 429 con 50-75%, 334 con 25-50%, 68 con 0-25% | 2014 | UPRA, "Índice de informalidad" (F3) | [SECUNDARIO]. Cifras vistas en el extracto del buscador; el PDF pesa más de 10 MB y mi herramienta no lo abrió |
| 3 | Qué mide el índice | Predio "con indicios de informalidad" si cumple **al menos una** condición: sin matrícula inmobiliaria en la base catastral, sin relación entre catastro y registro, falsa tradición en el folio, mejoras en predio ajeno. Solo predios rurales | 2014 y 2020 | UPRA (F3) | [SECUNDARIO]. Aclaración de un experto citado en F1: "informalidad no significa automáticamente ilegalidad" |
| 4 | Departamentos con mayor incidencia | Boyacá, Cundinamarca, Nariño, Antioquia y Cauca | Edición citada por el buscador (probable 2014; no confirmado) | UPRA (F3) | [SECUNDARIO] |
| 5 | Folios de matrícula cuyos antecedentes empiezan en falsa tradición | **~36%** | 2018 (considerandos del Decreto 578 de 2018, estudio de la Superintendencia de Notariado y Registro, SNR) | Decreto 578 de 2018 (F5), resumen de Camacol (F6) | [SECUNDARIO]. La página de Función Pública dio error de certificado y no la pude abrir. Dato de 2018 o anterior |
| 6 | Hogares campesinos en posesión sin título | **8,4%** (≈490 mil hogares, cálculo propio del informe 03); además 24,6% ocupa con permiso del dueño sin pago | 2025 | DANE, ECV 2025 población campesina (F7) | [LEÍDO] en el informe 03 |
| 7 | Hogares PDET que son ocupantes de hecho | **9,5%** | 2024 | DANE, ECV 2024 municipios PDET (F8) | [LEÍDO] en el informe 03 |
| 8 | Menos de la mitad de los hogares rurales tiene título formal de la tierra | "menos de la mitad" | 2024 | PNUD, informe anual 2024 (F9) | [SECUNDARIO]. Lo vi en el extracto del buscador, no abrí la página |
| 9 | Hogares campesinos sin título del predio, según la ANT | "400 mil" | Sin fecha (nota de prensa, declaración de un exdirector) | La FM (F10) | [NO VERIFICADO]. No usar |
| 10 | "El Banco Mundial estimó que 60% de la propiedad rural era informal" | 60% | "hace varios años" | Columna de opinión en La República (F11) | [NO VERIFICADO]. No usar |
| 11 | Falsa tradición por departamento: Boyacá 181.000 predios, Nariño 69.326, Santander 44.530; más de 250.000 sin sanear | Varias cifras | Sin fecha | Un documento de la Rama Judicial según el buscador (F12) | [NO VERIFICADO]. El enlace que abrí era una sentencia, no ese documento. No usar |
| 12 | Informalidad en Caquetá y Putumayo | ~50% de los predios; en Guaviare y Meta ~40% | "últimos datos" de UPRA, año no dicho | La Silla Vacía, 16-feb-2026 (F13) | [LEÍDO] el artículo, [SECUNDARIO] el dato de UPRA que cita |

**Lectura honesta.** La cifra defendible para el pitch es: "UPRA estima que más de la mitad de la tenencia rural (52%, dato de 2020) tiene indicios de informalidad". No digan "52% de los predios no tiene título". No encontré un índice de informalidad desagregado para los municipios PDET (lo busqué dos veces). El mejor proxy PDET es el 9,5% de hogares ocupantes de hecho (ECV 2024), que es un piso: no capta a quienes tienen escritura con falsa tradición ni carta venta.

### 1.2 Cuánto avanzó el Estado (contexto, no el problema)

| Dato | Valor | Fecha | Fuente | Estado |
|---|---|---|---|---|
| Territorio con catastro multipropósito actualizado | **41,34%** (46,9 millones de ha); 369 municipios (eran 82 en 2022) | Enero 2026 | DANE-IGAC, Informe de seguimiento PES 2025 (F15) | [LEÍDO] |
| Municipios PDET bajo gestoría IGAC con procesos de actualización catastral | cobertura sobre el **92,9% del área** de esos municipios | 2025 | Mismo informe (F15) | [LEÍDO] |
| Hectáreas "legalizadas" 2022-2026 | **453.474 ha, 34.749 familias** según la ministra de Agricultura; Fedegán habla de 2.284.306 ha en 43.082 predios | 2026 | Portafolio (F20); Contexto Ganadero (F21) | [SECUNDARIO]. Las cifras no coinciden porque cuentan cosas distintas (titulación individual, resguardos, consejos comunitarios, etc.) |
| Territorio con catastro actualizado a 1-ene-2025 | 27,02% | 2025 | Extracto del buscador sobre un informe DANE-IGAC | [SECUNDARIO]. Reemplazado por el 41,34% de arriba |

Un dato que apareció en una búsqueda ("3,44% del área de municipios PDET con catastro multipropósito") **no lo pude confirmar y contradice el 92,9% del informe PES 2025**. Descártenlo.

**Por qué importa el catastro para nuestro caso.** Actualizar el catastro describe y mide el predio, pero no da la propiedad (F2). Aun así, al cruzarlo con el registro destapa los predios informales, así que en los municipios ya intervenidos habrá más campesinos recibiendo la noticia de que su predio figura como informal. Ahí hay demanda para una ruta de orientación.

### 1.3 Por qué importa la informalidad (efectos documentados)

- **Crédito.** Sin título es difícil acceder a crédito formal. El mecanismo lo describe La Silla Vacía: los bancos (Banco Agrario) y el ICA aceptan la "carta de sana posesión" emitida por la Junta de Acción Comunal (JAC), y la "carta de colono", que además lleva sello de la alcaldía, como sustituto del título (F13) [LEÍDO]. En el estudio de mercado rural de Banca de las Oportunidades y la Javeriana (2023), solo 13% de los encuestados PDET usó financiamiento formal (F22) [SECUNDARIO: cifra vista en un extracto, el PDF era demasiado grande].
- **Subsidios y formalización.** Para formalizar, la ANT exige posesión por el tiempo de prescripción (5 años ordinaria, 10 extraordinaria) y que el predio no sea baldío ni esté excluido (F19, F23).
- **Restitución.** Muchos desplazados no han podido acceder al sistema de restitución porque sus títulos no están formalizados (análisis de 2018 citado por el buscador) [SECUNDARIO, sin URL confiable]. HiiL 2023: la población desplazada reporta más problemas de tierras y 56% quedan sin resolver (informe 03, F24).
- **Catastro multipropósito.** El catastro necesita saber quién posee qué. El predio sin folio o con falsa tradición es el que más cuesta cerrar (F2, F5).
- **Responsabilidad de los líderes.** Las JAC emiten cartas de posesión "presumiendo buena fe"; la alcaldía no puede verificar si lo certificado es cierto; si el predio se cruza con un área protegida, el funcionario corre riesgo legal, y grupos armados han presionado a juntas para certificar predios inexistentes (F13) [LEÍDO]. Esto debe pesar en el diseño del kit para líderes: **no deben emitir ni respaldar cartas con ayuda del bot**.

---

## 2. Prácticas informales frecuentes: qué se sabe de su frecuencia y su conflicto

### 2.1 Datos de conflicto (no de frecuencia de contratos)

| Dato | Valor | Año | Fuente | Estado |
|---|---|---|---|---|
| Problemas legales: 8,2 millones; 77% sin resolver | — | 2020 | ENJ 2020, DANE, vía PNUD-DNP (F25) | [LEÍDO] en el informe 03 |
| Gravedad percibida (0-10): trabajo 8,1; deudas 7,8; tierras 7,2 | — | 2020 | ENJ 2020 (F25) | [LEÍDO] en el informe 03 |
| En lo rural pesa más la categoría "otros" (incluye tierras y conflicto armado): 9% vs 5% en cabeceras | — | 2020 | ENJ 2020 (F25) | [LEÍDO] en el informe 03. El gráfico no separa "tierras" de "otros" |
| Tipos de problema en municipios HiiL: vecinos 25%, tierras **10%**, empleo 9%, comercio 7%, dinero 6% | % sobre n=3.290 problemas | 2023 (16 municipios, 12 PDET; no representativo) | HiiL-USAID (F24, F26) | [LEÍDO] en el informe 03. El tablero HiiL no desglosa tierras en linderos, herencias, compraventas o arriendos |
| En tierras, lo más común es que "la resolución no ayudó"; tierras y servicios estatales tienen la mayor proporción de casos que siguen vivos | — | 2023 | HiiL (F24) | [LEÍDO] en el informe 03 |
| Conflictos rurales típicos por tierra: linderos, servidumbres, sucesiones y contratos; "miles de familias" sin resolver | Sin número | 2020 | Banco Mundial (F27) | [LEÍDO] |
| Oferta de conciliación: 88% en grandes ciudades, 5% en ciudades intermedias, 7% en zonas rurales; 45% de los municipios sin oferta | — | 2020 | Banco Mundial (F27) | [LEÍDO] |

Ni la ENJ 2020 ni HiiL 2023 permiten decir qué parte de esos problemas nace de un **contrato** (carta venta, arriendo, aparcería, jornal). La mejor aproximación es la lista cualitativa del Banco Mundial (linderos, servidumbres, sucesiones, contratos).

### 2.2 Prácticas, una por una

| Práctica | Qué es y qué problema genera | Dato de frecuencia | Estado |
|---|---|---|---|
| **Carta venta / compraventa por documento privado** | Se vende el predio, las "mejoras" o la "posesión" con un papel firmado, a veces autenticado, a veces con la firma de la JAC. El comprador cree que es dueño. Si el vendedor tenía título, el comprador no queda registrado y el dueño sigue siendo el vendedor. Si el predio no tenía título, nadie tiene la propiedad | Sin cifra nacional. Proxy: 8,4% de hogares campesinos en posesión sin título (ECV 2025) y 9,5% de hogares PDET ocupantes de hecho (ECV 2024). En Sumapaz (Bogotá) fichas ciudadanas de 2025-2026 describen compraventas con acuerdos verbales y cartas de venta (extracto del buscador, sin URL propia) | [SECUNDARIO] proxy; frecuencia nacional [NO VERIFICADO] |
| **Posesión sin título** | Se explota el predio como dueño sin escritura. Con 5 o 10 años puede formalizarse (ANT o Ley 1561) | 8,4% hogares campesinos (2025) y 9,5% hogares PDET (2024), ver arriba | [LEÍDO] |
| **Herencias sin sucesión** | Los herederos siguen en el predio a nombre del causante, o se venden "derechos y acciones" sin liquidar la sucesión. Genera falsa tradición | Sin cifra. El borrador de decreto del MinJusticia lista entre los actos que generan falsa tradición: derechos y acciones, gananciales, sucesiones ilíquidas, partición amigable y venta de cuerpo cierto teniendo derecho de cuota (F28). El Banco Mundial incluye "formalización de sucesiones" entre los conflictos rurales típicos (F27) | [SECUNDARIO] el borrador; [LEÍDO] lo del Banco Mundial |
| **Arriendo de palabra** | El dueño cede el predio por un canon sin escrito. No hay prueba de plazo ni de mejoras | **~9,6% de las UPA** (unidades productoras agropecuarias) en arriendo (CNA 2014). Además, 24,6% de hogares campesinos ocupa con permiso del dueño sin pago (ECV 2025) | CNA: [SECUNDARIO] (F14). ECV: [LEÍDO] |
| **Aparcería** (reparto de la cosecha) | El dueño pone la tierra y el aparcero el trabajo. Está regulada por la Ley 6 de 1975 y exige escrito autenticado | **~1,5% de las UPA** (CNA 2014) | [SECUNDARIO] (F14). Es poco frecuente |
| **Contrato de jornaleros** | Pago por día, sin contrato escrito ni afiliación | **83,0%** de los ocupados en centros poblados y rural disperso son informales (jun-ago 2025). No hay cifra específica de jornaleros | [LEÍDO] (F29). La informalidad DANE mide, para asalariados, la no afiliación a salud y pensión |
| **Compraventa de cosechas** | Se vende la cosecha por adelantado a un comprador, con acuerdo verbal | No encontré dato ni norma específica | [NO VERIFICADO] |
| **Préstamos "gota a gota" y crédito informal** | Prestamistas informales con intereses muy superiores a la usura | "1 de cada 5 personas que accede al crédito lo hace por gota a gota" (Banca de las Oportunidades 2022); "1 de cada 4 créditos de los hogares son informales" (Encuesta Longitudinal Colombiana, Universidad de los Andes). Miden cosas distintas, no se suman. No hallé cifra rural | [SECUNDARIO], extractos del buscador sin URL específica; tema cubierto por (F30) |
| **Servidumbres entre vecinos** | Pasos de agua o tránsito acordados de palabra. Se rompen al cambiar de dueño | Sin cifra. El Banco Mundial las lista entre los conflictos típicos (F27) | [LEÍDO] lo cualitativo |

**Cuáles generan más conflicto (con lo que hay).** No se puede ordenar con evidencia. Lo más cercano: tierras tiene gravedad 7,2/10 y es de los problemas que más "continúan" sin resolver (ENJ 2020 y HiiL 2023), y el Banco Mundial pone linderos, servidumbres, sucesiones y contratos como la lista típica. La compraventa informal (carta venta) es, por lógica jurídica, el origen más probable de la falsa tradición y de los predios sin cerrar, pero **ninguna fuente que abrí lo mide**.

---

## 3. Qué se puede hacer sin abogado y qué no

### 3.1 El caso central: ¿qué vale una carta venta?

| Pregunta | Respuesta | Fuente | Estado |
|---|---|---|---|
| ¿Una carta venta de un inmueble transfiere la propiedad? | **No.** La compraventa de bienes raíces solo se perfecciona con escritura pública (C. Civil, art. 1857), que además es la única prueba de su contenido | Consejo de Estado, Sección Tercera, exp. 34648 (F16) | [SECUNDARIO] la sentencia vista por extracto del buscador; [VALIDAR CON ABOGADO] |
| ¿Basta la escritura? | **No.** Lo que convierte a alguien en dueño es la inscripción de la escritura en la Oficina de Registro de Instrumentos Públicos. Si no se registra, sigue siendo dueño el anterior | El País (agosto 2025), citando al MinJusticia (F17) | [LEÍDO] |
| ¿Para qué sí sirve la carta venta? | Para probar la relación con el predio ante la ANT y como evidencia de posesión. El procedimiento de la ANT lista entre los documentos aceptables "carta-venta o promesa de compra-venta", escrituras y certificado de tradición y libertad | ANT (F19, F23) | [SECUNDARIO]. La página de preguntas frecuentes de la ANT que abrí no lista documentos. La frase salió de un extracto de un documento ANT no identificado. Verificar en el procedimiento SEJUT-P-005 de la ANT (F23) |
| ¿Qué pasa si el predio es un baldío (de la Nación)? | Los baldíos no se adquieren por prescripción (Corte Constitucional SU-288 de 2022, citada en F2). Solo la ANT los adjudica. Una "venta" privada de un baldío no transmite la propiedad, y el ocupante irregular de baldíos queda excluido de la formalización gratuita (F19). Una venta de mejoras sobre baldío puede ser lo único que se transmitió; la tierra sigue siendo de la Nación | F2, F19 | [SECUNDARIO] / [VALIDAR CON ABOGADO] |
| ¿Y si quien vendió no era el dueño registrado, o vendió una parte? | Se genera "falsa tradición": hay un título y un modo, pero sobre un dominio incompleto. Todo acto sobre una porción determinada del terreno (no sobre una cuota) se trata como falsa tradición | F5, F6; resoluciones de la ANT-Cartagena vistas por el buscador (sin URL confiable) | [SECUNDARIO]. [VALIDAR CON ABOGADO] |
| ¿Hay restricciones para vender un predio adjudicado por el Estado? | La ANT exige autorización si se vende antes del plazo legal, y el comprador debe cumplir los requisitos de los arts. 4 y 5 del Decreto Ley 902 de 2017 | ANT, preguntas frecuentes (F19). El plazo de 15 años lo vi solo en un extracto, atribuido a la Ley 160 | [LEÍDO] lo de la autorización; [NO VERIFICADO] los 15 años |
| ¿Hay una opción de compra del Estado que afecte a un campesino pequeño? | El Decreto 033 de 2025 creó una opción privilegiada de compra para la ANT en municipios priorizados, pero solo para predios de **más de 2 UAF** adjudicados por el Estado hace más de 15 años. No aplica a la mayoría de los predios pequeños. No pude confirmar su vigencia en 2026 | Asuntos Legales (F31), Rocavives (F32) | [SECUNDARIO]. [VALIDAR CON ABOGADO] |

**Consecuencia para el diseño.** Una plantilla de "contrato de compraventa" generada por un bot **crearía exactamente el problema que ya existe**: un papel que el campesino creerá que lo hace dueño. No es un riesgo remoto. Es el modo de falla principal de la informalidad rural colombiana, y el bot lo reproduciría con membrete.

### 3.2 Contratos que sí son válidos por documento privado

| Documento | ¿Vale por documento privado? | Condiciones y trampas | Riesgo de falsa seguridad | Fuente | Estado |
|---|---|---|---|---|---|
| **Promesa de compraventa de inmueble** | Sí, si cumple 4 requisitos (Ley 153 de 1887, art. 89): (1) por escrito; (2) el contrato prometido no es de los ineficaces; (3) fija un plazo o condición que determine la época de celebrar el contrato; (4) determina el contrato (se identifican el bien y el precio). La Corte Suprema ha exigido una época precisa, por ejemplo fecha, hora y notaría de la escritura | Solo crea la obligación de hacer la escritura; **no transfiere dominio** ni siquiera si se entrega el predio y se paga todo (Corte Suprema, SC 276 de 2005) | **Alto**. Muchos campesinos firman "promesas" sin fecha ni notaría y creen que ya compraron. Una promesa sin época precisa puede ser nula | F16, F33 (Tribunal Administrativo 2026), F34 | [SECUNDARIO] por extractos. [VALIDAR CON ABOGADO] |
| **Arrendamiento de predio rural** | Sí. Es un contrato consensual (Código Civil, arts. 1973 y ss.) y no exige solemnidad | Trampa: si el canon es un porcentaje de la cosecha, la relación puede ser una aparcería, con reglas imperativas (ver abajo). El arrendador puede no ser el dueño (falsa tradición) | **Medio** | Código Civil, conocimiento general | [NO VERIFICADO] en esta sesión. [VALIDAR CON ABOGADO] |
| **Aparcería** (Ley 6 de 1975; Decreto 2815 de 1975, compilado en el Decreto 1071 de 2015) | Sí, pero con **forma reforzada**: debe constar por escrito y **autenticarse ante un juez del municipio o el alcalde** (art. 3 del Decreto 2815). Si no, igual rige la ley, y se puede probar cualquier cláusula que mejore la situación del aparcero | Duración mínima de 3 años (art. 5); el propietario debe aportar fondos de explotación y anticipar al aparcero no menos que el salario mínimo diario por jornada, anticipo que no constituye salario (art. 7); prohibiciones al propietario (cobrar multas, retener bienes del aparcero, cobrar un precio por la tierra distinto de su participación, art. 10); los porcentajes los fija el Ministerio de Agricultura (art. 18, remite al art. 8 de la Ley 6). La Ley 160 de 1994 la habría derogado en parte, según un extracto | **Alto** (hay reglas obligatorias que una plantilla puede violar sin que las partes lo sepan) | Decreto 2815 (F35), Ley 6 de 1975 (F36) | [LEÍDO] el Decreto 2815 vía Colpensiones; [SECUNDARIO] la vigencia actual. [VALIDAR CON ABOGADO] |
| **Contrato de trabajo agrícola / jornalero** | Sí. El contrato de trabajo puede ser verbal o escrito, sin forma especial (CST, art. 37). En el verbal las partes deben acordar al menos la clase de trabajo, el lugar, y el monto y forma de pago (art. 38). Un concepto del Ministerio de la Protección Social lo trata como a término indefinido | El problema real no es el papel sino la afiliación a seguridad social y el pago de prestaciones (83% de informalidad rural, F29). Un bot no puede cambiar eso. Riesgo de "disfrazar" una relación laboral como prestación de servicios | **Medio-alto**: una plantilla puede dar al empleador la idea de que cumplió | F37, F38 | [SECUNDARIO] (extractos). [VALIDAR CON ABOGADO] |
| **Acuerdo de pago / reconocimiento de deuda** | Sí. Es un acuerdo de voluntades sin solemnidad. Puede prestar mérito ejecutivo si la obligación es clara, expresa y exigible | Trampa: los intereses no pueden pasar de la tasa de usura vigente (certificada por la Superintendencia Financiera). El documento debe tener monto, fecha de pago, firmas y copia de cédula | **Bajo**, si se limita a eso | Conocimiento general (CGP y Código Penal) | [NO VERIFICADO] en esta sesión. [VALIDAR CON ABOGADO] |
| **Servidumbre entre vecinos** | Acordada de palabra o en papel privado, vale entre quienes la firman, pero **no obliga a un nuevo dueño**. Para que sea oponible a terceros se hace por escritura pública y se registra | La tradición de una servidumbre se hace por escritura pública (C. Civil, art. 938) y es un acto sujeto a registro | **Medio** | Conocimiento general | [NO VERIFICADO] en esta sesión. [VALIDAR CON ABOGADO] |
| **Acta de conciliación en equidad** | Es la mejor herramienta para linderos, servidumbres, herencias de hecho y deudas entre vecinos: el servicio es **gratuito** (Ley 2220 de 2022, art. 8) y el acta presta **mérito ejecutivo** y hace **cosa juzgada** (art. 64) | La hace un conciliador en equidad (persona de la comunidad, con 2 años de residencia y reconocimiento comunitario, nombrado por la autoridad competente, art. 28); puede operar por medios digitales (art. 6, par. 3). No hay cifra de cuántos hay por municipio. Cobertura de conciliación muy baja en lo rural (F27) | **Bajo**, pero no la genera un bot | F39 | [LEÍDO] |

### 3.3 Reglas de diseño que salen de esto

1. **Ningún texto del bot debe decir "contrato de compraventa", "título" ni "escritura" como producto.** Puede decir "su carta venta es una prueba de posesión, no un título".
2. **Toda salida legal con fecha de verificación y nombre del revisor.** Ya está en el informe 06 como requisito (revisión por consultorio jurídico, Decreto 196 de 1971 sobre ejercicio de la abogacía).
3. **Cada documento termina en la frase exacta de qué sigue:** "esto no lo hace dueño; vaya a la ANT / a la personería / a un consultorio jurídico".

---

## 4. Rutas de formalización gratuitas que ya existen

| Ruta | Qué hace | Costo y requisitos | Límites | Fuente | Estado |
|---|---|---|---|---|---|
| **ANT: formalización de la propiedad privada rural** (Decreto Ley 902 de 2017) | Titula la posesión y sanea la falsa tradición. Si nadie se opone, la ANT lo hace por acto administrativo y lo inscribe; si hay oposición, pasa al juez civil | Gratuita, no requiere abogado ni tramitadores. Posesión por el tiempo de prescripción (5 años ordinaria / 10 extraordinaria), pacífica, pública e ininterrumpida. Categorías por patrimonio: gratuita, parcialmente gratuita (250 a 700 SMMLV) y onerosa (más de 700). Sin otros predios, salvo vivienda; sin haber sido beneficiario de otro programa de tierras. El título debe registrarse en la Oficina de Instrumentos Públicos, o se sigue en la informalidad | Excluye tenencia derivada de violencia o despojo, cultivos ilícitos, ocupantes indebidos de baldíos. La ANT advierte que quien pida dinero por tramitar es un estafador. **Inconsistencia:** la misma página da el umbral gratuito como 250 SMMLV y como 1.367,54 UVT, y no coinciden. Hay que preguntar a la ANT cuál rige | ANT, preguntas frecuentes (F19); LegalApp-MinJusticia (F40); procedimiento de la ANT (F23) | [LEÍDO] (F19, F40). [VALIDAR CON ABOGADO] el umbral |
| **Canal de inscripción de la ANT por WhatsApp** | La página de la ANT indica que los formularios FISO ya no se usan y que el registro se hace por una línea de WhatsApp de la entidad (3118681902), en oficinas o por videollamada | Gratis | La inscripción no crea una situación jurídica consolidada; la adjudicación solo ocurre tras el Procedimiento Único | ANT (F19) | [LEÍDO] por herramienta de resumen. Confirmar el número y que siga activo antes de poner en pantalla. Oportunidad: llevar al usuario a ese canal |
| **Ley 1561 de 2012** (proceso verbal especial de titulación) | El juez declara la propiedad a favor del poseedor de inmuebles de pequeña entidad y puede sanear la falsa tradición | Rural: posesión material de **5 años** (regular) o **10 años** (irregular), predio privado que **no exceda 1 UAF**. Derechos de registro como acto sin cuantía (art. 24). Sin arancel judicial (art. 25). Honorarios de abogado topados en 5 SMMLV (art. 20). La demanda **debe presentarse con apoderado** (art. 22) | Excluye baldíos, bienes de uso público, zonas de riesgo no mitigable, áreas protegidas, tierras colectivas, predios en restitución o desplazamiento y destinados a actividades ilícitas (art. 6). El texto que leí es el original de 2012 y puede haber reformas | Ley 1561 (F41) | [SECUNDARIO] (texto vía dmsjuridica, sin cotejo con la fuente oficial). [VALIDAR CON ABOGADO] |
| **Consultorios jurídicos** (Ley 2113 de 2021) | Atienden a personas sin recursos y sujetos de especial protección. Los estudiantes pueden presentar derechos de petición con autorización del director del consultorio. Hay atención virtual cuando el municipio no tiene consultorio (art. 13) | Gratis | Disponibilidad variable; ver informe 06 | Informe 06 (lectura de la ley en Colpensiones) | [LEÍDO] en el informe 06. La Ley 1561 exige apoderado, y un estudiante de consultorio puede ser la vía; [VALIDAR CON ABOGADO] si ello cubre el caso |
| **Catastro multipropósito (IGAC)** | Actualiza el catastro de 369 municipios (41,34% del país a enero 2026) y cubre casi todo el área de municipios PDET bajo gestoría IGAC | Gratis para el campesino | No da propiedad. El predio informal queda identificado como tal | F15, F2 | [LEÍDO] |
| **Notarías y registro** | Las tarifas notariales y registrales se actualizan cada año por IPC (2026: IPC de 5,10% según una nota; la fuente no coincide sobre el número de resolución). Acto sin cuantía mínimo: $90.600. Sin cuantía no se ve exención para predios rurales pequeños en lo que leí | Las exenciones rurales **no las pude confirmar**. Sí existe: (a) la Ley 1561 trata el registro de la sentencia como acto sin cuantía; (b) un Decreto 906 de 2025 sobre acceso gratuito a copias de escrituras para procesos de ordenamiento rural con la ANT y el catastro (solo vi un extracto); (c) la SNR reportó 825 personas con asesoría gratuita en formalización en el primer cuatrimestre de 2026, 35,3% por predios fuera de cabeceras | Ni (b) ni (c) son escrituración gratuita | F42, F43, F44 | Tarifas [SECUNDARIO]; exenciones [NO VERIFICADO] |
| **Conciliadores en equidad** | Resuelven linderos, servidumbres, deudas y acuerdos entre vecinos de forma gratuita. El acta presta mérito ejecutivo y hace cosa juzgada | Gratis; hay que encontrar a uno en el municipio | La oferta de conciliación en lo rural es de apenas 7%, y 45% de los municipios no la tienen (Banco Mundial 2020). En ENJ 2020 las conciliadoras de las JAC aparecen en solo 0,9% de las rutas institucionales (informe 03) | F39, F27, F25 | [LEÍDO] |
| **Jurisdicción Agraria y Rural** | Jueces especializados en conflictos de tierra | — | La Corte Constitucional (C-099 de 2026) ordenó su puesta en marcha gradual **desde 2027**; hasta entonces siguen los jueces civiles. No sirve para el MVP | Pérez Llorca (F45), Agronegocios (F46) | [SECUNDARIO] |

**Ruta práctica para el campesino con carta venta en un predio privado** (resume lo que cabe en el bot):
1. Pedir el certificado de tradición y libertad (¿tiene folio? ¿qué dice la primera anotación?).
2. Si tiene folio y el vendedor era el dueño registrado: escritura pública en notaría y registro. (No es trámite gratuito.)
3. Si no tiene folio, o tiene falsa tradición, o el que vendió no era el dueño registrado: formalización ante la ANT (gratuita según patrimonio) o Ley 1561 con apoderado (consultorio jurídico).
4. Si hay un baldío: no se compra ni se prescribe. Solo la ANT adjudica.
5. Si hay conflicto con el vecino por linderos o paso: conciliación en equidad.

---

## 5. Recomendación

### 5.1 ¿Contratos en el MVP? No. Por qué.

| Criterio | Evidencia | Conclusión |
|---|---|---|
| ¿Hay evidencia de que un contrato concreto sea el dolor número uno? | Ninguna fuente abierta mide la frecuencia de contratos agrarios. Solo hay datos secundarios de 2014 (arriendo 9,6%, aparcería 1,5%) | No hay base para elegir uno por tamaño |
| ¿La plantilla resuelve el dolor? | El dolor principal (carta venta) **no se resuelve con un papel**: se resuelve con escritura y registro o con formalización ANT / Ley 1561 | Una plantilla de compraventa agrava el problema |
| ¿Riesgo de falsa seguridad? | Alto en compraventa, promesa y aparcería; medio en arriendo y trabajo; bajo en acuerdo de pago | Solo el acuerdo de pago es defendible |
| ¿Coste de validación legal en el tiempo del hackathon? | Cada plantilla requiere firma de un abogado o consultorio (informe 06) y varias reglas están en tensión (ver sección 6) | Tiempo mejor gastado en el derecho de petición |
| ¿Encaja con el MVP (petición + seguimiento de plazos)? | La salida natural de la ruta "carta venta" es un **derecho de petición a la ANT** (iniciar formalización) o a la personería, que ya hacemos | Sí, sin código nuevo de documentos |
| ¿Hay riesgo de seguridad? | Los casos de tierras exponen a líderes y reclamantes (informe 03). Una plantilla de contrato con nombres y predios es un dato sensible | La ruta de orientación puede funcionar **sin guardar nada** |

### 5.2 Cómo cubrir "contratos" en el pitch sin construirlos

**Ruta "¿Su carta venta lo hace dueño?"** Árbol de preguntas cortas (WhatsApp, texto o voz), sin generar contrato:

1. ¿Qué tiene? (a) carta venta o papel privado, (b) escritura sin registrar, (c) escritura registrada, (d) nada escrito, (e) promesa de compraventa.
2. ¿El predio tiene certificado de tradición y libertad? ¿La primera anotación dice "falsa tradición", "mejoras" o "derechos y acciones"?
3. ¿Cuánto tiempo lleva usted (o su familia) en el predio sin que nadie lo reclame? (menos de 5, 5 a 10, más de 10).
4. ¿El predio podría ser baldío (nunca fue titulado ni tiene folio)?
5. ¿Hay un conflicto con un vecino o heredero?

Salidas posibles (siempre texto fijo, revisado):
- **"Su papel es una prueba de que usted posee. No es título."** Qué sigue: (i) ANT, formalización gratuita por patrimonio y registro por WhatsApp; (ii) Ley 1561 con consultorio jurídico; (iii) escritura y registro si el vendedor sí era dueño registrado.
- **"Si es baldío, no se compra ni se vende la tierra."** Qué sigue: solo la ANT adjudica.
- **"Para linderos, paso de agua o herencia sin papeles, use la conciliación en equidad."**
- **Botón: "Pedirle a la ANT que inicie mi formalización"** → genera un derecho de petición con el motor del MVP (el mismo flujo del informe 06).
- **Advertencia permanente:** "Nadie puede cobrarle por tramitar su formalización ante la ANT. Si le piden plata, es una estafa" (mensaje de la propia ANT, F19).

**Cómo decirlo en el pitch (propuesta):** "Cubrimos derechos de petición y la ruta de contratos más peligrosa del campo: la carta venta. No generamos el contrato, porque un papel no hace dueño a nadie. Le decimos al campesino qué vale lo que tiene y lo llevamos a la ruta gratuita de la ANT, con la petición lista." Es honesto, es defendible ante un jurado jurídico y no depende de datos que no tenemos.

### 5.3 Qué NO prometer
- No decir "contratos para campesinos" sin aclarar que no se generan.
- No decir "52% de los predios no tiene título".
- No decir "gratis" para la escrituración: las tarifas notariales y registrales existen y no confirmé exenciones.
- No mencionar la cifra de 400 mil hogares ni la del 60% (no verificadas).
- No presentar al bot como abogado ni como "asesor jurídico" (informe 06, Decreto 196 de 1971).

### 5.4 Si insisten en UN documento: el acuerdo de pago por escrito (fase 2)

Elección entre las opciones evaluadas:

| Opción | Frecuencia | Riesgo de falsa seguridad | Complejidad formal | Conclusión |
|---|---|---|---|---|
| Compraventa / carta venta | Alta por lógica, sin cifra | **Muy alto** | Escritura y registro | Descartar |
| Promesa de compraventa | Sin cifra | Alto (4 requisitos, época precisa) | Media | Fase 3, solo guiada hacia notaría |
| Aparcería | ~1,5% de UPA | Alto | Escrito + autenticación + reglas imperativas | Descartar |
| Contrato de trabajo agrícola | 83% de informalidad laboral rural | Medio-alto: el problema es la seguridad social | Baja en forma, alta en consecuencias | Descartar |
| Arriendo rural | ~9,6% de UPA (secundario, 2014) | Medio (puede ser aparcería disfrazada; el arrendador puede no ser dueño) | Baja | Segunda opción |
| **Acuerdo de pago / reconocimiento de deuda** | Deudas con gravedad 7,8/10 (ENJ 2020); dinero 6% y comercio 7% (HiiL 2023). Sin cifra rural | **Bajo** | Baja: monto, fecha, firmas, cédulas, interés no mayor a la tasa de usura | **Elegido** |

**Justificación.** Es el único documento de la lista que (a) es válido por documento privado sin solemnidad, (b) no puede darle al usuario la ilusión de un derecho sobre la tierra, (c) tiene una alternativa peor muy documentada en lo rural (crédito informal y "gota a gota"), y (d) se conecta con una ruta ya segura: si no se cumple, el acuerdo puede ser el insumo de una conciliación en equidad o de un proceso ejecutivo. Aun así: **no tengo cifra de cuántos campesinos firman acuerdos de pago, ni de cuántos conflictos generan**. Es una elección por bajo riesgo, no por tamaño de mercado. [VALIDAR CON ABOGADO] antes de construirla.

---

## 6. Qué requiere validación de abogado (lista de cierre)

1. **Texto vigente de la Ley 1561 de 2012**: tope de 1 UAF en lo rural, plazos de 5 y 10 años, exigencia de apoderado (art. 22) y si hubo reformas. Lo leí en una copia de dmsjuridica, no en la fuente oficial.
2. **Umbral de gratuidad de la ANT**: 250 SMMLV vs 1.367,54 UVT. La misma página da ambos y no coinciden. También confirmar que el canal de WhatsApp (3118681902) siga activo.
3. **Vigencia y alcance de la Ley 6 de 1975 y del Decreto 2815 de 1975** (compilado en el Decreto 1071 de 2015), frente a la Ley 160 de 1994. Un extracto sugiere derogación parcial.
4. **Promesa de compraventa**: los 4 requisitos del art. 89 de la Ley 153 de 1887 y la exigencia de "época precisa" de la Corte Suprema.
5. **Efecto de una carta venta sobre baldíos y sobre predios con falsa tradición** (SU-288 de 2022, Ley 160, Decreto Ley 902). Lo que se afirma aquí viene de citas de segunda mano.
6. **Servidumbres** (C. Civil, art. 938 y Ley 1579 de 2012) y **arriendo rural**: no los verifiqué en esta sesión; son conocimiento general.
7. **Acuerdo de pago**: mérito ejecutivo y tope de la tasa de usura. No verificado.
8. **Contrato verbal de trabajo rural**: art. 37 y 38 del CST y concepto del Ministerio de la Protección Social, vistos por extracto.
9. **Decreto 033 de 2025** (opción de compra de la ANT): vigencia en 2026 sin confirmar.
10. **Exenciones de derechos notariales y de registro** para predios rurales pequeños: no confirmadas.
11. **Ejercicio ilegal de la abogacía**: que la ruta "carta venta" se presente como información general y no como asesoría (informe 06).

---

## 7. Huecos de esta investigación

- No pude abrir los PDF de UPRA (más de 10 MB) ni la página de Función Pública (error de certificado). Las cifras de UPRA y del Decreto 578 de 2018 son de segunda mano.
- No hay índice de informalidad por municipio PDET en lo que encontré. Para el pitch, la pregunta para UPRA o la ANT es: "¿cuántos predios con indicios de informalidad hay en [municipio piloto]?". El visor de UPRA (geoservicios.upra.gov.co) debería permitirlo.
- Sin frecuencia de contratos agrarios, y sin fuente que ordene las prácticas por conflicto. Una pregunta de validación con una JAC o un consultorio jurídico (¿qué papel les traen más seguido?) le daría al equipo el dato que falta.
- Las cifras de tenencia por forma del CNA 2014 (72,6% propia, 9,6% arriendo, 1,5% aparcería, 11,7% otras) vienen de una nota de Engormix que no pude cotejar con el boletín del DANE. El único boletín DANE que abrí con desglose de tenencia es el de Parques Nacionales Naturales (propia 52,2%, aparcería 0,5%, arriendo 3,7%), que **no es** representativo del país.
- Cifras ANT de formalización: se contradicen entre el Gobierno y Fedegán; no las usen como dato único.

---

## Fuentes

- **F1** Valora Analitik, "Tener escritura no siempre significa ser dueño" (52,2% en 2020, UPRA): https://www.valoraanalitik.com/alerta-sobre-tierra-rural-y-propiedad-con-escritura/
- **F2** Asuntos Legales, 21-jul-2026, pasos para tener un predio rural en regla (52% en 2020; catastro no da propiedad; baldíos y SU-288 de 2022): https://www.asuntoslegales.com.co/consumidor/paso-a-paso-de-los-tramites-que-debe-realizar-para-tener-un-predio-rural-en-regla-4438919
- **F3** UPRA, Índice de informalidad (edición 2014: 54,31%; metodología): https://upra.gov.co/sites/default/files/publicaciones/documentos//indice_de_informalidad.pdf (variante: https://upra.gov.co/sites/default/files/publicaciones/documentos//Indice_informalidad.pdf). UPRA, informalidad 2019: https://upra.gov.co/es-co/Publicaciones/Informalidad_ten_tierra_Colombia_2019.pdf
- **F4** CienciaLatina (52,0% en 2020): https://ciencialatina.org/index.php/cienciala/article/download/16766/24045
- **F5** Decreto 578 de 2018 (~36% de folios con falsa tradición): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=85721
- **F6** Camacol, Informe Jurídico 636 (resumen del Decreto 578 de 2018): https://www.camacol.co/sites/default/files/descargables/INFORME%20JURIDICO%20636%20ABRIL%2010%20DE%202018-.pdf
- **F7** DANE, ECV 2025 población campesina (18-jun-2026): https://www.dane.gov.co/files/operaciones/ECV/bol-Campesinos-ECV-2025.pdf
- **F8** DANE, ECV 2024 municipios PDET (17-jul-2025): https://www.dane.gov.co/files/operaciones/ECV/bol-PDET-ECV-2024.pdf
- **F9** PNUD, informe anual 2024, Colombia: https://rolhr.undp.org/annualreport/2024/impact/latin-america-caribbean/colombia.html
- **F10** La FM, campesinado y créditos (400 mil hogares sin título; no verificado): https://www.lafm.com.co/economia/campesinado-colombiano-dificultades-acceder-creditos-bancarios
- **F11** La República, columna sobre catastro (60% informal; no verificado): https://www.larepublica.co/analisis/didier-tavera-amado-3063947/un-motor-para-la-reforma-agraria-3404013
- **F12** Rama Judicial, "Saneamiento de la falsa tradición" (no abierto): https://ramajudicial.gov.co/documents/9533918/16938980/SANREAMIENTO+DE+LA+FALSA+TRADICIÓN.pdf/5eb814d4-d87e-41a3-9576-e757aab28f9a
- **F13** La Silla Vacía, 16-feb-2026, cartas de sana posesión y de colono: https://www.lasillavacia.com/?p=401690
- **F14** CNA 2014: nota de Engormix (secundaria): https://www.engormix.com/ganaderia/miscellaneous/departamento-santander-tercer-censo_a39588/ ; DANE, boletín 11 (solo Parques Nacionales): https://www.dane.gov.co/files/CensoAgropecuario/entrega-definitiva/Boletin-11-parques-naturales-nacionales/11-Boletin.pdf
- **F15** DANE-IGAC, Informe de seguimiento PES 2025 (41,34% a enero 2026; 92,9% PDET bajo IGAC): https://www.dane.gov.co/files/control_participacion/planes_institucionales/Planes_Indicativos/Inf-PES-2025.pdf
- **F16** Consejo de Estado, exp. 34648 (art. 1857 C. Civil, promesa): https://www.consejodeestado.gov.co/documentos/boletines/PDF/76001-23-31-000-2001-03567-01(34648).pdf
- **F17** El País Cali, 22-ago-2025, escritura y registro: https://www.elpais.com.co/colombia/las-escrituras-no-bastarian-la-ley-exige-un-tramite-clave-para-ser-declarado-propietario-de-su-casa-2220.html
- **F19** ANT, preguntas frecuentes: https://www.ant.gov.co/preguntas-frecuentes
- **F20** Portafolio, balance de reforma agraria: https://www.portafolio.co/economia/gobierno/reforma-agraria-y-credito-rural-gobierno-reporta-avances-en-tierras-financiamiento-y-abastecimiento-de-alimentos-490159
- **F21** Contexto Ganadero, balance de Fedegán: https://www.contextoganadero.com/gobierno-petro/formalizacion-de-la-propiedad-rural-fedegan-afirma-que-el-gobierno-avanzo-pero-no-cumplio-las-metas-ni-fortalecio-la-seguridad-juridica
- **F22** Banca de las Oportunidades, Estudio de mercado rural 2023 (no abierto): https://www.bancadelasoportunidades.gov.co/sites/default/files/2023-12/Estudio%20de%20Mercado%20Rural%20FE_PUJ_2023%20%282%29_1.pdf
- **F23** ANT, procedimiento de formalización SEJUT-P-005 (no abierto): https://portalpruebas.ant.gov.co/sites/default/files/2024-06/documentos/archivos/SEJUT-P-005.pdf
- **F24** HiiL-USAID 2024 (resumen ejecutivo): https://www.hiil.org/wp-content/uploads/2024/04/HiiL-Colombia-JNS-2024_Resumen-Ejecutivo.pdf
- **F25** PNUD-DNP, INDH Cuaderno 3 (ENJ 2020): https://www.undp.org/sites/g/files/zskgke326/files/2023-05/UNDP_Co_PUB_Cuaderno3_INDH_Acceso_efectivo_justicia_personas.pdf
- **F26** Tablero HiiL Colombia 2023: https://dashboard.hiil.org/data-by-country/colombia-justice-needs-2023/
- **F27** Banco Mundial, 21-oct-2020, conciliación y conflictos de tierra: https://www.bancomundial.org/es/news/feature/2020/10/21/conciliacion-una-via-clave-para-solucionar-los-conflictos-de-tierra-en-colombia
- **F28** MinJusticia, proyecto de decreto sobre actos en falsa tradición (2018): https://www.redjurista.com/Compilaciones2018/tablas_ProyectosNormas/2018/02/13/pd_mjd_0005aj_2018.pdf (el PDF que abrí era una plantilla; los datos vienen de un extracto del buscador)
- **F29** DANE, GEIH jun-ago 2025 (83,0% de informalidad en centros poblados y rural disperso): https://www.dane.gov.co/files/operaciones/GEIH/bol-GEIHEISS-jun-ago2025.pdf
- **F30** La República, especial "gota a gota": https://www.larepublica.co/especiales/el-gota-a-gota/los-prestamos-gota-a-gota-crece-con-bajos-ingresos-y-poca-inclusion-financiera-4368890
- **F31** Asuntos Legales, opción privilegiada de compra de la ANT: https://www.asuntoslegales.com.co/consultorio/opcion-privilegiada-de-compra-sobre-predios-rurales-a-la-ant-4182945
- **F32** Rocavives, vacío normativo sobre la ANT en contratos privados: https://arocavives.com/boletin/vacio-normativo-sobre-la-adhesion-de-la-ant-a-contratos-privados-en-zonas-priorizadas/
- **F33** Tribunal Administrativo de Nariño, 2026 (requisitos de la promesa): https://relatoria.colombiacompra.gov.co/wp-content/uploads/2026/05/84_52001233300020230005801.pdf
- **F34** Corte Suprema, SC 276 de 2005: https://www.dmsjuridica.com/buscador_20179478954/salacivil/?p=83102
- **F35** Decreto 2815 de 1975 (aparcería): https://normativa.colpensiones.gov.co/colpens/docs/decreto_2815_1975.htm
- **F36** Ley 6 de 1975: https://normativa.colpensiones.gov.co/colpens/docs/ley_0006_1975.htm
- **F37** CST, art. 37: https://leyes.co/codigo_sustantivo_del_trabajo/37.htm
- **F38** Concepto del Ministerio de la Protección Social (contrato verbal): https://www.ambitojuridico.com/sites/default/files/BancoMedios/Archivos/cpto-7301-11.doc
- **F39** Ley 2220 de 2022 (Estatuto de Conciliación): https://normativa.colpensiones.gov.co/compilacion/docs/ley_2220_2022.htm
- **F40** LegalApp-MinJusticia, "¿Cómo puedo legalizar el título de mi propiedad?": https://www.minjusticia.gov.co/programas-co/LegalApp/Paginas/%C2%BFC%C3%B3mo-puedo-legalizar-el-t%C3%ADtulo-de-mi-propiedad.aspx
- **F41** Ley 1561 de 2012 (copia dmsjuridica): https://www.dmsjuridica.com/buscador_20179478954/legislacion/leyes/?p=1624
- **F42** Asuntos Legales, tarifas notariales 2026: https://www.asuntoslegales.com.co/actualidad/superintendencia-de-notariado-y-registro-fijo-tarifas-para-servicios-notariales-de-2026-4321228
- **F43** Decreto 906 de 2025 (copias gratuitas; solo extracto): https://www.dmsjuridica.com/buscador_20179478954/legislacion/decretos/2025/10/10/decreto-906-de-2025/?pdf=58677
- **F44** Diario del Sur, asesoría gratuita de la SNR 2026: https://www.diariodelsur.com.co/?p=591386
- **F45** Pérez Llorca, Jurisdicción Agraria desde 2027: https://www.perezllorca.com/es-co/actualidad/boletin/la-corte-constitucional-impulsa-la-implementacion-de-la-jurisdiccion-agraria-y-rural-a-partir-de-2027/
- **F46** Agronegocios, Jurisdicción Agraria en 2027: https://www.agronegocios.co/agricultura/gobierno-anuncio-que-la-jurisdiccion-agraria-y-rural-entrara-en-funcionamiento-en-2027-4381309
- **Informes de esta carpeta usados:** 03-poblacion-afectada.md (ENJ 2020, HiiL 2023, ECV 2024 y 2025) y 06-marco-legal-seguridad.md (consultorios jurídicos, Decreto 196 de 1971, revisión de plantillas).
