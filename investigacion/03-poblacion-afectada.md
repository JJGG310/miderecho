# 03 - Población afectada: dimensionamiento y caracterización (Colombia rural)

Fecha del informe: 20 de octubre de 2026. Frente: población realmente afectada. Los frentes de competidores, modelo de negocio, canales/UX y marco legal los cubren otros informes.

Convenciones:
- Cada cifra lleva fuente entre corchetes `[S#]` (la lista de URLs está al final) y año.
- **(calc.)** = cálculo propio a partir de cifras citadas. Los supuestos van explícitos.
- **NO VERIFICADO** = dato que no pude confirmar en una fuente primaria o que aparece solo en un resumen de buscador.
- Método: leí los boletines DANE, el Cuaderno 3 del INDH (PNUD-DNP), el resumen ejecutivo de HiiL, el boletín MinTIC y el documento de NYU-CIC desde copia local con texto extraído. El resto proviene de páginas web abiertas con WebFetch. El cupo de búsquedas web de la sesión se agotó antes de cerrar todos los temas (ver sección 8).

---

## 0. Resumen ejecutivo

1. **La necesidad jurídica rural es grande y está subregistrada.** La Encuesta de Necesidades Jurídicas (ENJ) 2020 contó 8,2 millones de problemas justiciables, y 77% (más de 6 millones) seguían sin resolverse [S8][S9]. En zona rural solo 12% declaró algún problema, frente a 19% en cabeceras, lo cual el PNUD-DNP atribuye a subreporte y bajo empoderamiento legal [S8]. Con HiiL (2023, municipios en su mayoría PDET), la incidencia sube a 55% en cuatro años [S10].
2. **Lo rural pesa distinto.** En el campo tienen más peso salud, servicios públicos, conflicto armado, medio ambiente y tierras; en las ciudades pesan más consumo y deudas [S8]. Quienes viven en el campo desconocen más los mecanismos alternativos: 23% los conoce, frente a 60% en Bogotá [S8].
3. **La conectividad rural cambió rápido, pero sigue siendo móvil y frágil.** El 56,9% de los hogares de centros poblados y rural disperso tenía internet en 2025, contra 32,2% en 2022 y 78,8% en cabeceras [S1][S6]. En esas zonas el internet es mayoritariamente móvil (74,6% de los hogares conectados, 2024) [S5], y 98,1% de quienes usan internet lo hacen desde un smartphone [S5]. Aun así, 43,1% de los hogares rurales (≈1,8 millones, calc.) no tiene internet, y el costo es la razón principal (36,3%) [S5].
4. **La justicia formal existe en la cabecera, no en la vereda.** Casi todos los ~1.100 municipios tienen al menos un juez promiscuo, comisario de familia, inspector de policía y personero; el vacío está en las veredas [S11]. En al menos 250 municipios afectados por el conflicto, la acción institucional se queda en las cabeceras [S11]. Las Casas de Justicia aparecen en solo 2% de las rutas de ayuda (HiiL, 2023) [S10], y las conciliadoras de las Juntas de Acción Comunal (JAC) en 0,9% de las rutas institucionales (ENJ 2020) [S8].
5. **Los líderes son el canal natural y también el blanco.** Indepaz cuenta 1.978 líderes y defensores asesinados desde 2016 (corte 30-jul-2026), en 432 municipios [S13]. Somos Defensores registró 165 asesinatos y 874 agresiones en 2025 [S14]. Hay 63.833 organizaciones de acción comunal con ~6,5 millones de afiliados (2018) [S15].
6. **Segmento de entrada recomendado para el MVP:** familias campesinas de municipios PDET con problemas de tierra y de acceso a servicios del Estado (formalización, salud/EPS, servicios públicos), atendidas a través de su Junta de Acción Comunal. Primer caso de uso: derecho de petición guiado por mensajería de texto. La justificación está en la sección 5.

---

## 1. Necesidades jurídicas insatisfechas

### 1.1 Cuántas personas tienen problemas legales (triangulación)

No existe una cifra única; cada instrumento mide distinto. Conviene presentar el rango.

| Fuente | Periodo y cobertura | Resultado |
|---|---|---|
| ENJ 2020 (DANE-DNP-MinJusticia) [S8] | Referencia 2018-2019 (2 años). Representativa para el agregado nacional de centros poblados y rural disperso y para 13 ciudades; sin desagregación departamental ni municipal | 17% declaró al menos un problema justiciable; 8,2 millones de problemas (50% en las 13 ciudades, 50% en "otros territorios"); urbano 19% vs rural 12% |
| WJP, cifra citada en el Cuaderno 3 PNUD-DNP [S8] | 2018, nacional | 34% (15 puntos bajo el promedio de los países de la muestra) |
| Estimación DNP con módulos 2016 [S8] | Incidencia potencial | 57% |
| HiiL / USAID, Justice Needs and Satisfaction (JNS) [S10] | Ago-sep 2023; 6.000 adultos en 16 de 76 municipios (12 PDET); no es representativa nacional | 55% con al menos un problema legal serio en 4 años; severidad promedio 7/10 |

Lectura: la cifra oficial de 17% subestima. El propio PNUD-DNP dice que es baja frente a otros países y que refleja subreporte por bajo empoderamiento legal, normalización de problemas y la metodología [S8].

Nota de discrepancia: un resumen de buscador atribuye a la ENJ 2020 un levantamiento solo en 13 ciudades (129.709 personas, 40.368 hogares). El Cuaderno 3, que sí abrí, dice que la ENJ 2020 es representativa para el agregado rural nacional y para 13 ciudades [S8]. Uso el Cuaderno 3.

### 1.2 Cuántos no resuelven

- ENJ 2020: 23% de los problemas se resolvieron y 77% (más de 6 millones) no [S8][S9]. De los problemas reportados, 44% no tuvo ninguna acción, 35% se llevó ante una institución o autoridad y 21% se manejó por acuerdo directo [S9][S8].
- Por qué la gente no actúa (ENJ 2020, 44% de los problemas, Gráfico 31 del Cuaderno 3) [S8]: 32-33% "no era importante", 20% "tomaba demasiado tiempo o trámites", 17% "no confiaba en las autoridades", 15% "no tenía pruebas o argumentos", 8% "no supo qué hacer o ante quién acudir", 4% "temor a las consecuencias o amenazas", 2% "muy costoso o sin transporte". En salud/pensión el 54% atribuye la inacción a la demora y los trámites; en servicios públicos, 46% [S8].
- ENJ 2022 (tercera ronda): la proporción de quienes dicen que sus necesidades fueron atendidas subió de 22% a 32% entre 2020 y 2022 [S11, citando datos de MinJusticia/DNP].
- HiiL 2023: de los problemas reportados, 33% resueltos por completo, 14% parcialmente, 22% siguen vivos y 30% abandonados (n=3.290) [S10]. En personas que no pueden cubrir necesidades básicas, 67% quedan sin resolver (31% continúan + 36% abandonados); en desplazados, 56% (25% + 31%, calc.); en no desplazados, 52% (21% + 31%, calc.) [S10].
- ECSC 2022: 64,92% prefiere no acudir a la justicia formal [S11, nota al pie citando DANE-DNP-MinJusticia].

### 1.3 Qué tipos de problemas predominan en lo rural

**ENJ 2020, participación por tipo de problema declarado** [S8]:

| Tipo | Nacional | Cabeceras | Centros poblados y rural disperso |
|---|---|---|---|
| Delitos | 46% | 46% | 46% |
| Salud, pensión, riesgos laborales | 12% | 11% | **14%** |
| Servicios públicos domiciliarios | 8% | 7% | **9%** |
| Consumo | 8% | 9% | 5% |
| Vivienda y vecinos | 6% | 6% | 6% |
| Familiares | 5% | 5% | 5% |
| Trabajo, deudas, Estado | n.d. | 3%, 3%, 3% | 3%, 2%, 2% |
| "Otros" (entorno, ambiente, educación, discriminación, **tierras, conflicto armado**) | n.d. | 5% | **9%** |

Los porcentajes salen de la lectura del gráfico por tipología y área; pueden sumar 98-101% por redondeo. El texto del informe confirma que en zonas rurales tienen mayor participación los problemas de salud, servicios públicos, conflicto armado, medio ambiente y tierras, y que consumo y deudas pesan más en ciudades [S8].

Gravedad percibida (escala 0-10, ENJ 2020): salud/pensión 8,1; trabajo 8,1; deudas 7,8; servicios públicos 7,5; tierras 7,2; delitos 6,8; familiares 6,7 [S8].

**HiiL 2023** (16 municipios, mayoría PDET; % sobre n=3.290) [S10]: vecinos 25%, servicios estatales 14%, crímenes y delitos 14%, **tierras 10%**, empleo 9%, familia 8%, comercio 7%, **violencia intrafamiliar 7%**, dinero 6%, vivienda 5%, tránsito 4%, orden público y conflicto 3%, corrupción 1%, documentación 1%. Las mujeres reportan más violencia intrafamiliar y problemas de servicios estatales; los hombres, más crimen y empleo; la población desplazada, más problemas de tierras (incluye desplazamiento y despojo) [S10]. Los problemas de salud y otros servicios estatales pesan más en desplazados, personas con baja educación y bajos ingresos [S10].

Los problemas menos frecuentes golpean más: violencia intrafamiliar, tierras y orden público/conflicto tienen el mayor impacto agregado (~0,5 frente a 0,33 promedio) [S10]. Para delitos y tierras, la respuesta más común sobre el desenlace fue "la resolución no ayudó" [S10]. Los problemas de tierras y servicios estatales tienen la mayor proporción de casos que "continúan y esperan resolución" [S10].

### 1.4 Mapa de los tipos de problema que pidió el reto contra la evidencia

| Tipo | Evidencia disponible | Calidad del dato |
|---|---|---|
| Tierras y predios | Mayor peso rural [S8]; 10% en HiiL [S10]; gravedad 7,2 [S8]. Informalidad de la propiedad rural: **NO VERIFICADO** (cifra citada comúnmente de ~50% de predios informales; no la confirmé). Proxy de vivienda: 8,4% de hogares campesinos están en posesión sin título y 24,6% ocupan con permiso del dueño sin pago (2025) [S2] | Media; proxy parcial |
| Víctimas del conflicto | Conflicto armado pesa más en lo rural [S8]; el desplazamiento aparece dentro de tierras [S10]. Registro: 9.263.826 víctimas a abril de 2022 [S22, fuente secundaria]; cifra vigente **NO VERIFICADO** | Baja para el total vigente |
| Salud / EPS | 14% en lo rural, mayor gravedad (8,1) [S8]; 54% de quienes no actúan lo atribuye a demora y trámites [S8] | Alta |
| Servicios públicos | 9% en lo rural [S8]; 46% de inacción por demora [S8] | Alta |
| Contratos laborales y agrarios | Trabajo 3% rural [S8] y empleo 9% HiiL [S10]. Contratos agrarios específicos: **NO VERIFICADO** | Baja |
| Violencia intrafamiliar | 7% en HiiL, mayor impacto, mayor reporte en mujeres [S10]; posible subregistro por seguridad [S10] | Media |
| Alimentos y familia | Familiares 5% (ENJ); 56% de quienes no actuaron dijo que el problema "no era importante", sobre todo reparto de bienes (74%) y cuota de alimentos/custodia (69%); el informe lo lee como normalización [S8]. HiiL: familia 8% [S10] | Media |
| Restitución y baldíos | Unidad de Víctimas y Unidad de Restitución de Tierras suman solo 0,2% de las instituciones a las que se acudió (ENJ 2020) [S8]. Cifras de procesos de restitución y adjudicación de baldíos: **NO VERIFICADO** | Baja |

### 1.5 World Justice Project

- Rule of Law Index 2025 (28-oct-2025): Colombia 95 de 143 en el índice general y 22 de 32 en la región. Justicia civil 102/143, justicia penal 120/143, orden y seguridad 134/143, derechos fundamentales 86/143 [S12]. La justicia civil se debilitó por mayores demoras y menor efectividad de mecanismos alternativos como la mediación [S12].
- La encuesta de necesidades legales de WJP para Colombia (Global Insights on Access to Justice) no me apareció con cifras propias; solo la cifra de 34% de 2018 citada por el PNUD-DNP [S8]. Detalle por problema y por zona: **NO VERIFICADO**.

### 1.6 Confianza y conocimiento (barreras de demanda)

- 56% de los encuestados no tiene nada de confianza en la justicia, 38% algo y 5% mucha (EPC-DNP 2022) [S8]. Otra nota de prensa cita 57%, 38% y 6% [S9]; uso el dato del Cuaderno 3.
- 75% considera los procesos "muy demorados" y más de 70% los considera "muy costosos" [S9][S8]. El Cuaderno 3 no halla diferencias significativas por zona rural/urbana en estas percepciones; la diferencia relevante es regional (64% de desconfianza total en Bogotá, 46% en Santander) [S8].
- Conocimiento: 58% no había oído de los conciliadores en derecho y 46% no conocía las Casas de Justicia (EPC-DNP 2019) [S8]. Conocimiento de mecanismos alternativos: 23% en zonas rurales, 26% en estratos bajos y 18% con baja educación, frente a 60% en Bogotá y 79% con educación universitaria (EPC-DNP 2015-2022) [S8].
- Más del 70% de los habitantes de las zonas HiiL no busca información legal en ninguna fuente; quienes la buscan prefieren internet y redes sociales, y la radio es un canal infrautilizado [S10].

### 1.7 Estimación de población rural afectada (cálculo propio, orden de magnitud)

Base: población en centros poblados y rural disperso = 12,462 millones (ECV 2025) [S1]. Las tasas ENJ son sobre personas encuestadas (se asume mayores de edad o de 15+); aplicarlas a la población total sobreestima. Si se restringe a mayores de 15 (supuesto ~78%, no verificado) reducir ~20%.

| Escenario | Tasa (2 años) | Personas rurales con al menos un problema (calc.) |
|---|---|---|
| Conservador (ENJ 2020 rural, con subreporte) | 12% | 1,2 a 1,5 millones |
| Intermedio (rural igualado a urbano ENJ) | 19% | 1,8 a 2,4 millones |
| Alto (WJP 2018, nacional) | 34% | 3,3 a 4,2 millones |

Si 77% no resuelve (ENJ 2020), el escenario conservador implica ~0,9 a 1,2 millones de personas rurales con un problema sin resolver (calc.). Es una estimación gruesa, útil para el discurso, no para planeación.

---

## 2. Conectividad rural

### 2.1 Acceso de hogares a internet (fijo o móvil)

| Indicador | Cifra | Fuente, año |
|---|---|---|
| Hogares rurales (centros poblados y rural disperso) con internet | **56,9%** (2025), 41,9% (2024), 32,2% (2022) | [S1][S6] |
| Hogares en cabeceras | 78,8% (2025) | [S1] |
| Nacional | 73,9% (2025) | [S1] |
| Hogares rurales totales / sin internet | 4,207 millones / ≈1,81 millones sin internet (calc.) | [S1] |
| Hogares campesinos con internet | 60,3% (2025); rurales campesinos 56,2% | [S2] |
| Municipios PDET | 44,0% (2024); rural PDET 37,9% | [S3] |
| Departamentos más rezagados | Vaupés 18,6%, Vichada 23,3% (2025); Meta 84,0% en hogares campesinos vs <30% en Vaupés, Amazonas, Vichada y Guainía | [S1][S2] |

Dato crítico para el diseño: entre los hogares rurales con internet, la conexión principal es móvil: 74,6% a nivel nacional rural (2024) [S5] y 82,0% en el rural PDET (solo 29,5% con fijo, 2024) [S3]. Es decir, planes de datos móviles, no wifi en casa.

### 2.2 Teléfono: tenencia y uso por personas de 5 años o más

| Indicador | Rural (centros poblados y rural disperso) | Cabecera | Nacional | Fuente, año |
|---|---|---|---|---|
| Usó celular | 83,4% | 92,7% | 90,6% (91,9% en 2025) | [S5] 2024; [S1] 2025 |
| **Posee** celular (cualquier tipo) | **65,4%** | 81,9% | 78,1% | [S5] 2024 |
| Usó internet | 61,7% | 84,6% | 79,3% (82,3% en 2025) | [S5] 2024; [S1] 2025 |
| Usa celular para mensajes (SMS, mensajería, chat) personales | 64,3% | 79,6% | 76,3% | [S5] 2024 |
| PDET: usó celular / usó internet | 85,0% / 67,1% | | | [S3] 2024 |

Lecturas:
- **Celular compartido**: en lo rural, 83,4% usa celular pero solo 65,4% lo posee. La diferencia (~18 puntos, calc.) sugiere uso de aparatos de otro miembro del hogar. Implica privacidad débil: el mensaje legal puede ser leído por terceros.
- **Smartphone vs teléfono básico**: entre quienes usan internet, 98,1% en lo rural usa smartphone [S5]. La proporción de teléfonos básicos entre todos los usuarios de celular rural **NO VERIFICADO** (el boletín no la desagrega en el texto que revisé).
- Computador: solo 9,6% de hogares rurales tiene computador o tableta; 16,5% de las personas rurales usó computador [S5]. Descarta apps web pesadas y formularios de escritorio.
- Uso de internet: el 87,3% de quienes usan internet realiza video, llamadas o mensajería instantánea (es el uso principal) y 80,2% usa redes sociales [S5]. Esto es un proxy fuerte del uso de WhatsApp. **La penetración exacta de WhatsApp en zona rural NO VERIFICADO** (ninguna fuente oficial abierta la desagrega).
- Gobierno en línea: solo 14,9% de quienes usan internet hizo trámites con entidades públicas. Entre quienes no los hacen por internet, 83,0% prefiere hacerlos en persona o por teléfono, 61,6% desconfía del uso de sus datos personales, 60,4% desconfía de que el trámite se haga bien y 52,5% desconfía de pagar en línea [S5]. Esta es evidencia directa a favor de una estrategia de seguridad de datos visible y de acompañamiento humano.

### 2.3 Cobertura de red y costo

- Cobertura (1T-2025): por municipio, 4G, 3G y HSPA+ llegan a 100% de municipios y 2G a 99,82% [S7]. 5G, 2,46%. Es un indicador municipal que **no mide cobertura efectiva en veredas** (definición según Resolución 175 de 2021, no verificada) [S7]. Cobertura efectiva en rural disperso por tecnología: **NO VERIFICADO**.
- Accesos móviles a internet por tecnología (1T-2025): 4G 40,7 millones, 5G 4,7 millones, 3G 3,5 millones; variación trimestral: 5G +23,7%, 4G -2,1%, 3G -7,8%, **2G -21,7%** [S7]. La 2G se está apagando; SMS y mensajería siguen funcionando sobre 3G/4G, pero conviene no depender de 2G.
- Prepago: 69,9 millones de líneas prepago frente a 22,5 millones pospago, 76% prepago (1T-2025) [S7]. Una nota de prensa sobre el fallo C-206 coincide en 76% de usuarios móviles prepago y añade que 64% de los planes prepago incluyen al menos una aplicación que no gasta datos [S17-Colombiano]; ese artículo tiene una inconsistencia interna (menciona también 7%), así que el 64% queda como dato de prensa no verificado.
- Precio: ingreso promedio por GB en modalidad por demanda, COP 1.388 (1T-2025, sin impuestos) [S7].
- Barrera de costo: en hogares rurales sin internet, el costo es la primera razón (36,3%) y "no lo considera necesario" la segunda (21,0%) [S5]. En el resto del país, costo 45,0% [S5].

### 2.4 Zero-rating y WhatsApp "gratis"

- La Corte Constitucional, Sentencia C-206 de 2025, declaró inexequible un aparte del art. 56 de la Ley 1450 de 2011 que sustentaba los planes con aplicaciones sin consumo de datos (zero rating). Los efectos quedaron diferidos un año desde la publicación de la sentencia [S17]. Un medio indica que se esperaba el fin de la práctica desde mayo de 2026, sin confirmar qué hicieron los operadores [S17-DPL]. **Estado actual de los planes con WhatsApp incluido en octubre de 2026: NO VERIFICADO.**
- La Corte aclara que no obliga a retirar beneficios: los operadores pueden dar apps gratis siempre que el usuario conserve acceso abierto a todo internet, y los usuarios actuales no pierden beneficios ni pagan más [S17-Colombiano]. Los magistrados disidentes advirtieron riesgo de ampliar la brecha en los más pobres [S17-Colombiano].
- Implicación: no diseñar suponiendo que "WhatsApp es gratis" para la población objetivo. Diseñar para texto muy liviano y para SMS como respaldo, y validar con operadores qué planes de datos básicos existen hoy en las zonas piloto.

---

## 3. Barreras

### 3.1 Educación y alfabetismo

- Analfabetismo rural: 9,3% frente a 2,6% urbano y 4% nacional (población de 10 años o más, 2025), según un informe de la Universidad Javeriana (LEE). Departamentos más rezagados: La Guajira, Chocó, Sucre, Córdoba y Nariño [S20]. **Fuente secundaria, el documento no abrió en mi sesión; verificar con GEIH 2025 antes de citar en la presentación.**
- Educación superior en 17 a 21 años: 16,0% en rural frente a 44,7% en cabeceras (ECV 2025) [S1].
- Alfabetismo funcional rural: **NO VERIFICADO** (no encontré medición). El INDH reporta que el conocimiento de mecanismos legales es menor en personas con baja educación (18%) [S8].

### 3.2 Distancia, presencia institucional y oferta

- Casi todos los ~1.100 municipios tienen al menos un juez promiscuo, un comisario de familia, un inspector de policía y un personero. El poder real del juez en la cabecera, a veces, es más simbólico que operativo [S11].
- En al menos una cuarta parte de los municipios (~250, afectados por el conflicto), la acción institucional se limita a las cabeceras y zonas aledañas; los funcionarios de justicia formal se concentran en lo urbano por seguridad, logística y acceso físico [S11].
- Casas de Justicia: 114 y 42 Centros de Convivencia Ciudadana en funcionamiento bajo liderazgo de MinJusticia (nota de prensa; fecha exacta no confirmada) y 26 jornadas móviles rurales previstas con cooperación española [S26]. Frente a ~1.100 municipios, la cobertura es parcial. En HiiL, las Casas de Justicia aparecen en 2% de las fuentes de ayuda [S10].
- Sistemas Locales de Justicia (SLJ): 152 de ~1.100 municipios tienen acto de creación; 133 son PDET; MinJusticia proyecta llegar a los 37 PDET restantes a 2026 [S11].
- Los jueces de municipios apartados describen aislamiento, sedes inadecuadas y falta de garantías de seguridad [S11].
- "Municipios sin abogados": **NO VERIFICADO**. No encontré cifra oficial vigente de municipios sin abogados litigantes. Lo que sí está respaldado es que casi todos los municipios tienen operadores de justicia en la cabecera; el hueco es la vereda. No afirmar "municipios sin abogados" en la presentación sin dato.
- Barreras de costo: "no consiguió transporte o muy costoso" explica solo 2% de la inacción (ENJ 2020) [S8]; las barreras dominantes son tiempo, trámites, desconfianza y desconocimiento.

### 3.3 Miedo y riesgo

- En ENJ 2020, 4% de quienes no actuaron lo atribuyó a temor o amenazas, pero los problemas de conflicto armado y tierras tienen muestra insuficiente en ese gráfico [S8].
- HiiL advierte posible subregistro de violencia intrafamiliar y de problemas asociados al conflicto por preocupaciones de seguridad de las personas; algunas respuestas fueron "no quiero contestar" [S10].
- El estigma de ser señalado como "informante o aliado del Estado" frena la denuncia en zonas con actores armados [S11].
- Riesgo para el propio líder que acompaña: ver sección 4.

### 3.4 Pueblos étnicos y lenguas

- **En el campo, uno de cada cuatro habitantes se autorreconoce indígena o NARP** (ECV 2024): 1,712 millones de indígenas (13,8% de la población de centros poblados y rural disperso) y 1,374 millones de personas negras, afrodescendientes, raizales o palenqueras (11,1%), de un total rural de 12,378 millones [S4]. Total nacional: 2,225 millones indígenas (4,2%) y 3,737 millones NARP (7,1%) [S4].
- Otras cifras nacionales: indígenas 1.905.617 (Censo 2018, DANE) y NARP 4.671.160 (estimación oficial DANE 2018) [S16]. Difieren de la ECV por metodología.
- Entre campesinos, 10,2% en centros poblados y rural disperso se autorreconoce indígena y 12,6% negro/afro/raizal/palenquero (ECV 2025) [S2].
- Lenguas: 65 lenguas indígenas, 12 familias y 10 aisladas [S27, fuente secundaria]; ~850.000 hablantes (Ethnologue 2010) [S27, secundaria]. Proporción de indígenas que necesitan información en lengua propia: **NO VERIFICADO**.
- Estas comunidades tienen sus propias autoridades (cabildos, consejos comunitarios) y jurisdicción especial indígena. En la ENJ 2020, la Jurisdicción Especial Indígena y los Consejos Comunitarios suman 0,1% de las instituciones a las que se acudió [S8], lo que no mide su uso real (subregistro probable), pero indica que el diseño no puede ignorarlas ni reemplazarlas.

### 3.5 Desconfianza institucional

Ver 1.6: 56% sin ninguna confianza; ninguna entidad de justicia con altos niveles de confianza; Casas de Justicia, comisarías y conciliadores tienen más confianza que juzgados y Fiscalía, pero siguen bajos [S8]. En HiiL, familia y amigos son la primera fuente de asesoría (18% y 14%), seguidos de policía (12%) y abogados (10%) [S10]. Las personas confían primero en su círculo cercano, lo que respalda el modelo de adopción vía líderes.

---

## 4. Líderes sociales

### 4.1 Cuántos son y qué hacen

- Juntas de Acción Comunal y demás organismos comunales: 63.833 organizaciones con ~6.498.321 afiliados (más de 13% de la población), noviembre de 2018 [S15]. Dos fuentes secundarias, vistas solo en resúmenes de buscador, citan al MinInterior: 7.413.519 afiliados con 63.153 juntas de primer grado (artículo académico, dato 2022) [S23], y 53.153 juntas con 58% en zona rural (texto de un proyecto de ley de 2025, URL exacta no confirmada). Las dos cifras de juntas no concuerdan; **NO VERIFICADO**, el conteo vigente debe pedirse al MinInterior.
- Rol: las JAC se conforman a nivel barrial, veredal o municipal; han construido casi 30% de la infraestructura comunitaria [S15]. Tienen comités de convivencia y conciliación para conflictos comunitarios, pero sus reglamentos no están definidos y los casos terminan en entes de control [S15].
- Uso real como ruta de justicia: los conciliadores de JAC son 0,9% de las instituciones a las que acudió la gente (ENJ 2020) [S8]. Es la brecha y la oportunidad.
- El PNUD-DNP recomienda reconocer a las JAC (en veredas y corregimientos), los consejos comunitarios (comunidades negras) y las autoridades indígenas como primeros actores para generar capacidades legales y articular con las instituciones [S8].
- Consejos comunitarios y cabildos: número exacto de consejos comunitarios titulados y de cabildos/resguardos: **NO VERIFICADO**.
- Herramientas que usan hoy los líderes: **NO VERIFICADO** (no encontré estudio). Hipótesis a validar en campo: grupos de WhatsApp, llamadas, radio comunitaria, reuniones presenciales. La ECV/ENTIC confirma que el uso dominante del celular en lo rural es llamada y mensajería [S5].

### 4.2 Violencia contra ellos

| Fuente | Cifra | Año |
|---|---|---|
| Indepaz, acumulado | 1.978 líderes y defensores asesinados desde 2016, en 432 municipios de 31 departamentos | corte 30-jul-2026 [S13] |
| Indepaz, serie anual | 2016: 109; 2017: 163; 2018: 249; 2019: 218; **2020: 252**; 2021: 165; 2022: 187; 2023: 188; 2024: 173; 2025: 187 | [S13] |
| Indepaz, 2026 | 87 asesinados (ene-30 jul) vs 121 en el mismo periodo de 2025; 66 municipios en 22 departamentos; 85% hombres | [S13] |
| Indepaz, tipo de liderazgo 2026 | comunal 22, político 14, comunitario 13, indígena 9 | [S13] |
| Indepaz, 2025 por departamento | Cauca 40, Antioquia 30, Valle del Cauca 17 | [S21, resumen de buscador, no abierto] |
| Somos Defensores 2025 | 165 asesinatos (+5%), 874 agresiones (+20%), 28 departamentos y Bogotá; mujeres 15% de las víctimas mortales (27, +42%) | 2025 [S14] |
| Somos Defensores por liderazgo 2025 | indígenas 257 agresiones (+32%, 27 asesinatos); comunitarios 206 (+89%); comunales (JAC) 124 (-21%, posible subregistro); campesinos 60 | 2025 [S14] |
| Somos Defensores por zona | Valle, Cauca, Nariño y Putumayo concentran ~39% de las agresiones; Cauca primero (37 asesinatos); Antioquia segundo (+130%) | 2025 [S14] |
| Impunidad | De 1.840 asesinatos 2002-2025, 12% con sentencia condenatoria | [S14] |

Las cifras de Indepaz (187) y Somos Defensores (165) difieren por metodología; citar ambas con su fuente.

Implicación de diseño: un líder que acompaña casos de tierras o víctimas tiene riesgo físico. El producto no debe crear listas de quién consulta qué, ni centralizar datos que permitan identificar a líderes o reclamantes. Las JAC reportan 124 agresiones en 2025 [S14].

---

## 5. Segmentos priorizables

Tamaños (con su unidad). Las celdas con "NO VERIFICADO" no son cifras sino vacíos.

| # | Segmento | Tamaño estimado | Dolor principal | Datos clave | Confianza |
|---|---|---|---|---|---|
| S1 | **Campesinos de municipios PDET con problemas de tierra y servicios del Estado** | 11,08 millones de personas se identifican como campesinas (7,19 millones en rural); 5,80 millones de hogares campesinos (30,6% del país) [S2]. PDET: 5,31 millones de personas, 2,99 millones en lo rural, 1,79 millones de hogares [S3] | Tierra sin formalizar, trámites con entidades, salud/EPS, servicios públicos; problemas que se quedan sin respuesta | 9,5% de hogares PDET son ocupantes de hecho (2024) [S3]; 8,4% de hogares campesinos (≈490 mil, calc.) en posesión sin título (2025) [S2]; tierras 10% de problemas en HiiL, gravedad 7,2/10, entre los que más "continúan" [S10][S8] | Alta en tamaño, media en pain de tierras |
| S2 | **Víctimas del conflicto (desplazados, despojo)** | 9,26 millones registradas (abril 2022, fuente secundaria) [S22]; proporción rural y vigente: **NO VERIFICADO** | Reparación, restitución, desplazamiento | Desplazados tienen más problemas de tierra y 56% sin resolver [S10]; Unidad de Víctimas y URT: 0,2% de las rutas usadas [S8] | Baja en tamaño actual; alta en dolor |
| S3 | **Mujeres rurales jefas de hogar y víctimas de violencia intrafamiliar** | 38,4% de los hogares rurales con jefatura femenina (≈1,62 millones, calc.) [S1]; 41,1% en hogares campesinos [S2] | Alimentos y custodia, violencia intrafamiliar, acceso a tierra y servicios | VIF 7% y familia 8% en HiiL; mayor impacto (0,37 vs 0,33) en mujeres [S10]; normalización: 56% de inacción por "no era importante" en problemas familiares [S8] | Media |
| S4 | **Comunidades étnicas rurales (indígenas, NARP)** | En lo rural: 1,71 millones de indígenas (13,8%) y 1,37 millones NARP (11,1%), ≈3,09 millones en total, calc. (ECV 2024) [S4]. Nacional: 2,2 millones indígenas y 3,7 millones NARP [S4] | Tierras colectivas, relación entre justicia propia y ordinaria, idioma | 257 agresiones a líderes indígenas en 2025 [S14]; lenguas propias [S27] | Media; requiere consulta previa y diseño específico |
| S5 | **Dignatarios de JAC y líderes comunitarios como usuarios-multiplicadores** | ~63,8 mil organizaciones, ~6,5 a 7,4 millones afiliados [S15] | Les llegan los casos de la comunidad sin herramientas ni reglas | Conciliadores JAC en 0,9% de las rutas [S8]; comités sin reglamento [S15]; riesgo de seguridad [S14] | Media |
| S6 | Migrantes venezolanos en zona rural | **NO VERIFICADO** (no obtuve cifra por zona) | Documentación, regularización | No hay datos propios | Excluir del MVP |

### 5.1 Matriz de priorización (juicio cualitativo apoyado en las cifras)

| Criterio | S1 Campesinos PDET | S2 Víctimas | S3 Mujeres rurales | S4 Étnicos | S5 JAC |
|---|---|---|---|---|---|
| Tamaño alcanzable | Alto | Medio (incierto) | Medio-alto | Medio | Alto (como canal) |
| Dolor documentado | Alto | Muy alto | Alto | Alto | Medio |
| Alcance por celular/mensajería | Alto (85% celular en PDET) | Medio | Medio (celular compartido) | Medio-bajo (idioma, cobertura) | Alto |
| Instrumento legal claro y gratuito (petición, contrato simple) | Alto | Medio (rutas especializadas) | Medio | Bajo (justicia propia) | No aplica |
| Riesgo de seguridad al usar el producto | Medio | Muy alto | Alto | Alto | Alto |
| Evidencia disponible | Alta | Media | Media | Media | Media |

### 5.2 Segmento de entrada recomendado: S1 (campesinos PDET) vía JAC

**Definición operativa:** hogares campesinos rurales de municipios PDET (≈1,0 millón de hogares rurales PDET, 2,99 millones de personas, ECV 2024 [S3]) con problemas de tierra o de acceso a servicios, atendidos mediante el presidente, secretario o comité de conciliación de su JAC.

**Por qué este segmento, con los datos:**
1. **Tamaño y concentración del dolor.** 11 millones de personas se reconocen campesinas [S2] y las zonas PDET concentran los mayores rezagos: 44,0% de conectividad de hogares frente a 73,9% nacional [S3][S1], 85% de uso de celular [S3].
2. **Dolor documentado y no resuelto.** En la muestra HiiL (12 de 16 municipios PDET), tierras es el cuarto problema (10%), con alto impacto, y entre los que más "continúan sin resolver"; 52% de los problemas quedan sin resolver o abandonados (67% en personas que no cubren necesidades básicas) [S10]. A nivel nacional, 77% (ENJ 2020) [S9].
3. **El instrumento encaja con el reto.** Los problemas de servicios públicos, salud y trámites con entidades se mueven con derechos de petición, que no exigen abogado. En HiiL, la tutela fue la intervención menos común de terceros (4%) porque la persona puede presentarla sola [S10]. Hay un hueco entre "no sé qué hacer" (8% de inacción) y la capacidad de redactar [S8]. El análisis del marco legal vive en el informe de ese frente.
4. **Canal ya presente y legítimo.** 58% de las JAC estarían en zona rural (fuente secundaria, NO VERIFICADO) y el PNUD-DNP las señala como primeros actores en veredas [S8]. Hoy casi no se usan como ruta formal (0,9%) [S8], por lo que un kit simple les agrega capacidad en vez de competir con ellas.
5. **Alcance técnico viable.** En el rural PDET, 82% de los hogares conectados usa internet móvil [S3]; 98,1% de los usuarios rurales de internet usan smartphone [S5]; 87,3% de usuarios usan mensajería [S5]. SMS y WhatsApp de texto llegan a esta población sin computador (solo 9,6% de hogares rurales lo tiene [S5]).
6. **Riesgo manejable para un primer MVP.** Los trámites de petición y formalización exponen menos al usuario que la restitución, la denuncia de actores armados o la violencia intrafamiliar, donde HiiL documenta subregistro por seguridad [S10]. Se sugiere dejar S2 y S3 para una fase 2 con aliados especializados (Unidad de Víctimas, comisarías, organizaciones de mujeres).

**Por qué no los otros primero:**
- S2 (víctimas): mayor dolor, pero mayor riesgo y rutas especializadas; el tamaño vigente no está verificado.
- S3 (mujeres): fuerte dolor, pero riesgo de seguridad alto y el celular compartido (65,4% posesión vs 83,4% uso) expone al usuario ante el agresor.
- S4 (étnicos): requiere consulta previa, diseño lingüístico y respetar justicia propia; no cabe en un MVP de hackathon.
- S5 (JAC): es el canal, no el usuario final; entra con S1.

**Casos de uso candidatos para el MVP (sugerencia, a validar con los informes de canales y marco legal):**
a) Derecho de petición guiado para servicios públicos, salud/EPS y trámites de tierras ante la entidad correspondiente.
b) Ruta legal "¿a dónde voy?" que mapea personería, comisaría, inspección, Casa de Justicia o entidad de tierras según el problema.
c) Modelos de documentos simples (por ejemplo, acuerdos por escrito entre vecinos o arrendamiento), como hipótesis: no encontré dato de frecuencia de contratos agrarios (NO VERIFICADO).

---

## 6. Regiones prioritarias (PDET, ZOMAC, brechas)

### 6.1 Marco territorial

- **PDET:** 170 municipios (ECV usa una muestra de 125 de los 170) [S3][S11], organizados en 16 subregiones: Alto Patía y Norte del Cauca; Arauca; Bajo Cauca y Nordeste Antioqueño; Catatumbo; Cuenca del Caguán y Piedemonte Caqueteño; Chocó; Macarena-Guaviare; Montes de María; Pacífico Medio; Pacífico y Frontera Nariñense; Putumayo; Sierra Nevada y Perijá; Sur de Bolívar; Sur de Córdoba; Sur del Tolima; Urabá Antioqueño [S19]. Hay 33.007 iniciativas definidas por las comunidades [S19]. Población PDET: 5,313 millones (2,994 millones en rural) [S3].
- **ZOMAC:** se conoce que son 344 municipios (Decreto 1650 de 2017), pero **no lo verifiqué en esta sesión**.
- El conflicto de acceso es territorial dentro del municipio: la ENJ no tiene dato municipal ni departamental y no cubre zonas étnicas ni de alto conflicto [S8]. Un ranking municipal de brecha requiere construirse con datos abiertos (ver 6.3).

### 6.2 Dónde se cruzan necesidad, conectividad y riesgo

| Territorio | Señal de necesidad | Conectividad | Riesgo para líderes | Lectura |
|---|---|---|---|---|
| Cauca (incluye Alto Patía y Norte del Cauca) | 5,9% de hogares campesinos del país [S2]; epicentro de agresiones (37 asesinatos 2025) [S14] | N/D por depto en lo consultado | Muy alto | Alta necesidad, no recomendable para un primer piloto con líderes |
| Nariño, Putumayo, Valle | Nariño 7,3% de hogares campesinos [S2]; con Cauca, Valle y Putumayo concentran ~39% de agresiones [S14] | N/D | Alto | Alta necesidad, riesgo alto |
| Antioquia | 12,1% de hogares campesinos (primero) [S2]; 30 líderes asesinados 2025 [S21] | N/D | Alto y creciente (+130% agresiones) [S14] | Mucha población, riesgo creciente |
| Córdoba | 5,7% de hogares campesinos [S2]; >80% de jefes campesinos se perciben pobres [S2] | N/D | Medio-alto (sin dato propio) | Posible fase 2 |
| Chocó, La Guajira, Magdalena | >80% de jefes campesinos se perciben pobres (La Guajira, Chocó, Córdoba, Magdalena) [S2] | Chocó está entre los cinco departamentos de menor uso de internet por personas (rango 49,1% a 63,1% para Vaupés, Guainía, Amazonas y Chocó) [S1] | Medio | Alta pobreza, baja conectividad |
| Vaupés, Vichada, Guainía, Amazonas | Muy baja conectividad (18,6% y 23,3% en hogares) [S1] | Muy baja | N/D | Fuera de alcance de un MVP basado en datos móviles |
| Meta | 84,0% de hogares campesinos con internet [S2] | Alta | N/D | Candidato por conectividad |
| Montes de María (Bolívar y Sucre) | Municipios de la muestra HiiL (El Carmen de Bolívar, Ovejas) [S10] | N/D | Sin dato propio | Candidato porque ya existe línea base HiiL |

### 6.3 Recomendación para la selección del piloto

Hipótesis a validar, no conclusión (no tengo datos de seguridad actual por municipio ni de densidad de JAC por municipio):
- Elegir 2 o 3 municipios PDET de una misma subregión con: (1) alta proporción campesina, (2) conectividad móvil real verificada en campo, (3) riesgo de seguridad moderado para líderes, (4) presencia de un Sistema Local de Justicia o Casa de Justicia como contraparte (133 SLJ en PDET) [S11], (5) línea base existente.
- Candidatos para entrar a validar: subregiones Montes de María, Sur del Tolima y Macarena-Guaviare (por el dato de Meta). Evitar Cauca, Catatumbo y Pacífico nariñense como primer piloto por el nivel de violencia contra líderes [S14].
- Para construir el índice municipal de brecha: cruzar (a) microdatos ECV PDET con factores de expansión (DANE, catálogo 861), (b) cobertura móvil por municipio y centro poblado en datos.gov.co de MinTIC, (c) mapa de justicia de MinJusticia, (d) alertas tempranas de la Defensoría y registros de Indepaz.

---

## 7. Implicaciones directas para el producto (síntesis breve; el detalle es de los informes de canales/UX y legal)

1. **Texto primero, con SMS como respaldo.** Hay celular, mensajería y smartphone, pero 43% de hogares rurales sin internet y cobertura efectiva en vereda sin medir [S1][S5][S7].
2. **Diseño para el celular compartido.** Entre el uso (83,4%) y la tenencia (65,4%) rurales hay ~18 puntos porcentuales de diferencia, compatible con uso de celulares ajenos (inferencia propia) [S5]. Evitar guardar datos sensibles en el chat del teléfono; ofrecer borrado.
3. **Seguridad de datos visible.** 61,6% desconfía del uso de datos personales en trámites en línea y 83% prefiere lo presencial o telefónico [S5]. Un líder o promotor local que acompañe disminuye esa fricción.
4. **El líder como acompañante, sin riesgo añadido.** No acumular información identificable de quién consulta qué [S14].
5. **Claridad antes que más información.** Más de 70% no busca información legal y quienes la buscan usan internet y redes; la radio es un canal desaprovechado [S10]. La diferencia entre "no sé qué hacer" (8%) y "no confío" (17%) sugiere que el valor no es solo información sino acompañamiento y trazabilidad del trámite [S8].

---

## 8. Brechas y datos NO VERIFICADOS (para cerrar antes de la presentación)

El cupo de búsquedas web de la sesión se agotó. Quedan sin confirmar:
1. Informalidad de la propiedad rural (% de predios sin título): UPRA o IGAC.
2. Cifra vigente del RUV y proporción rural; cifras de restitución y baldíos (Unidad para las Víctimas y URT, `datospaz.unidadvictimas.gov.co`).
3. Penetración exacta de WhatsApp en zona rural y proporción de teléfonos básicos frente a smartphones entre todos los usuarios rurales.
4. Estado actual (octubre de 2026) de los planes con aplicaciones sin consumo de datos tras C-206 de 2025.
5. Cobertura efectiva de red en veredas por tecnología (la cifra municipal es 100% para 3G/4G pero no es cobertura rural efectiva).
6. Número vigente de JAC y afiliados, de consejos comunitarios y de cabildos/resguardos (MinInterior, Ministerio del Interior en grupos étnicos).
7. Analfabetismo rural: el dato (9,3%) viene de un resumen de la Universidad Javeriana (LEE) que no pude abrir; alfabetismo funcional rural, sin dato.
8. Municipios sin abogados o sin presencia de justicia: sin cifra oficial vigente.
9. ZOMAC (344 municipios): dato de conocimiento general, sin verificación.
10. Migrantes venezolanos en zona rural: sin cifra.
11. Resultados de la ENJ 2022 (tercera ronda) con desagregación rural: el PNUD-DNP indicaba que los datos de esa ronda no estaban disponibles al redactar; solo conozco el dato de satisfacción (22% a 32%) [S11]. El tablero del DNP (`https://dnp-sjg-nj.shinyapps.io/Indicadores_nj_2020/`) no se abrió.
12. Herramientas que usan hoy los líderes sociales: sin estudio; requiere entrevistas de campo.
13. Un resumen de buscador del DNP indicó 19,8% de necesidades satisfechas y 43,1% que acudió a una institución o abogado (ENJ 2020); no abrí esa página y es otra definición, no usar sin verificar.

---

## 9. Fuentes

Todas consultadas en octubre de 2026. Entre paréntesis, el año de los datos.

- [S1] DANE, Boletín técnico ECV 2025 (20-abr-2026): https://www.dane.gov.co/files/operaciones/ECV/bol-ECV-2025.pdf
- [S2] DANE, Boletín técnico ECV 2025, población campesina (18-jun-2026): https://www.dane.gov.co/files/operaciones/ECV/bol-Campesinos-ECV-2025.pdf
- [S3] DANE, Boletín técnico ECV 2024, municipios PDET (17-jul-2025): https://www.dane.gov.co/files/operaciones/ECV/bol-PDET-ECV-2024.pdf
- [S4] DANE, Boletín técnico ECV 2024, población negra, afrodescendiente, raizal y palenquera (21-ago-2025): https://www.dane.gov.co/files/operaciones/ECV/bol-NARP-ECV-2024.pdf
- [S5] DANE, ENTIC Hogares 2024, boletín técnico (1-ago-2025): https://www.dane.gov.co/files/operaciones/ENTIC/bol-ENTICHogares-2024.pdf
- [S6] MinTIC, noticia con datos ECV 2025 (actualizada 27-abr-2026): https://mintic.gov.co/portal/inicio/Sala-de-prensa/Noticias/437305:Gobierno-Petro-conecto-3-5-millones-de-hogares-en-tres-anos-y-por-primera-vez-mas-de-la-mitad-de-los-hogares-rurales-tienen-internet
- [S7] MinTIC, Boletín trimestral de las TIC, primer trimestre 2025 (julio 2025): https://ontic.mintic.gov.co/857/articles-404026_boletin.pdf
- [S8] PNUD y DNP, Informe Nacional de Desarrollo Humano, Cuaderno 3, "Acceso efectivo a la justicia para todas las personas" (2023; datos ENJ 2020, EPC 2015-2022): https://www.undp.org/sites/g/files/zskgke326/files/2023-05/UNDP_Co_PUB_Cuaderno3_INDH_Acceso_efectivo_justicia_personas.pdf
- [S9] Asuntos Legales, nota sobre el informe PNUD-DNP (3-ago-2023): https://www.asuntoslegales.com.co/actualidad/desigualdad-en-el-acceso-a-la-justicia-en-colombia-cerca-de-60-de-la-poblacion-carece-de-confianza-revela-informe-pnud-y-dnp-3671683
- [S10] HiiL y USAID, Necesidades y Satisfacción con la Justicia en Colombia 2024, resumen ejecutivo (trabajo de campo ago-sep 2023): https://www.hiil.org/wp-content/uploads/2024/04/HiiL-Colombia-JNS-2024_Resumen-Ejecutivo.pdf ; tablero: https://dashboard.hiil.org/data-by-country/colombia-justice-needs-2023/
- [S11] NYU Center on International Cooperation, Sistemas Locales de Justicia de Colombia (julio 2024): https://cic.nyu.edu/wp-content/uploads/2024/07/Local-Justice-Systems-in-Colombia-July-2024-ESP.pdf
- [S12] World Justice Project, comunicado Colombia, Rule of Law Index 2025 (28-oct-2025): https://worldjusticeproject.org/sites/default/files/documents/Colombia_3.pdf
- [S13] El Universal, con datos de Indepaz (3-ago-2026): https://www.eluniversal.com.co/colombia/2026/08/03/asesinatos-de-lideres-sociales-golpean-a-432-municipios-de-colombia-segun-indepaz/
- [S14] Mongabay Latam, informe "Promesas rotas" de Somos Defensores (abril 2026; datos 2025): https://es.mongabay.com/2026/04/violencia-contra-defensores-colombia-derechos-humanos-2025-informe/
- [S15] DNP, CONPES 3955 de 2018, acción comunal: https://normograma.mintic.gov.co/mintic/compilacion/docs/conpes_dnp_3955_2018.htm
- [S16] DANE, grupos étnicos (Censo 2018): https://www.dane.gov.co/index.php/estadisticas-por-tema/demografia-y-poblacion/grupos-etnicos
- [S17] Zero-rating, Sentencia C-206 de 2025: Palacios Lleras (24-jun-2025) https://www.palacioslleras.com/neutralidad-de-red-y-zero-rating-en-colombia-sentencia-c-206-de-2025/ ; [S17-Colombiano] El Colombiano (24-jun-2025) https://www.elcolombiano.com/negocios/corte-internet-gratis-colombia-cambios-usuarios-operadores-LO27835835 ; [S17-DPL] DPL News (4-jun-2025) https://dplnews.com/corte-constitucional-pone-fin-zero-rating-en-colombia/
- [S18] DataReportal, Digital 2025: Colombia (3-mar-2025; 77,3% de la población usa internet, 41,1 millones de usuarios): https://datareportal.com/reports/digital-2025-colombia
- [S19] Agencia de Renovación del Territorio, Central PDET: https://www.renovacionterritorio.gov.co/central-pdet
- [S20] Universidad Javeriana, LEE, informe sobre analfabetismo (2025; solo resumen de buscador): https://www.javeriana.edu.co/recursosdb/d/lee/inf137-analfabetismo-dia-idioma-2026-lee
- [S21] Portafolio, Indepaz 2025 (187 líderes; resumen de buscador): https://www.portafolio.co/economia/regiones/en-2025-al-menos-187-lideres-sociales-fueron-asesinados-en-colombia-segun-indepaz-485550
- [S22] Wikipedia, Colombian conflict, cita del Registro Único de Víctimas a abril de 2022 (fuente secundaria): https://en.wikipedia.org/wiki/Colombian_conflict
- [S23] Artículo académico (UANL) con cifras del MinInterior sobre juntas y afiliados (solo resumen de buscador): https://revpoliticas.uanl.mx/index.php/RPGyC/article/download/327/394/1585
- [S26] Asuntos Legales, MinJusticia y AECID, casas de justicia (resumen de buscador, fecha no confirmada): https://www.asuntoslegales.com.co/actualidad/minjusticia-y-aecid-ratifican-apoyo-a-programas-sociales-en-narino-valle-y-choco-3449802
- [S27] Wikipedia, Languages of Colombia (fuente secundaria): https://en.wikipedia.org/wiki/Languages_of_Colombia
