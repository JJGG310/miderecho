# 04. Quién paga y con qué modelo de negocio (cliente pagador y sostenibilidad)

Hackathon Colombia, legal design + acceso a la justicia, bajo consumo de datos (SMS / WhatsApp / offline-first).
Fecha de la investigación: 20 de octubre de 2026. Tipo de cambio usado: 1 USD = COP 3.128 (TRM del 17-sep-2026 citada en [5]).

Convención: **[n]** remite a la lista de fuentes al final. **"No verificado"** = no pude confirmarlo en fuente primaria o la fuente es secundaria/contradictoria. Los números marcados "supuesto" son míos, no hechos.

Limitación de método: el cupo de búsquedas web de la sesión se agotó a mitad de la investigación. Lo faltante lo cubrí con lecturas directas de páginas oficiales, pero quedan vacíos (sección 11), sobre todo en convocatorias abiertas de la UE, Open Society, cajas de compensación y gremios.

---

## 0. Resumen ejecutivo

1. **El usuario final no paga y no debe pagar.** El costo de tecnología por caso atendido es marginal (centavos de dólar). Lo que cuesta de verdad es la capa humana (líderes, revisión jurídica, capacitación) y el equipo central. Por eso la pregunta "quién paga" es en realidad "quién financia la capa humana y la operación".
2. **Cliente pagador #1 para pitchear: el Ministerio de Justicia y del Derecho (programa Sistemas Locales de Justicia, SLJ, y su oferta de jornadas móviles/Casas de Justicia), contratando por convenio de asociación con una entidad sin ánimo de lucro (ESAL), con cooperación internacional como contrapartida del 30%.** Evidencia: en sept-2026 el Ministerio firmó el Convenio de Asociación 698-2026 con una fundación por COP 1.586 millones para fortalecer SLJ en 140 municipios de 14 departamentos [14] (fuente de prensa, no verificado en SECOP). La Ley 2430 de 2024 ordena garantizar el acceso a la justicia rural "procurando el uso de las TIC" y fortalecer personerías, Defensoría y casas de justicia [16].
3. **Los 3 modelos de ingreso más viables** (detalle en sección 9):
   - **A. B2G2C: licencia por municipio / pago por caso gestionado**, pagada por MinJusticia, gobernaciones o alcaldías (el usuario es gratis).
   - **B. Cooperación y filantropía** como capital de arranque y contrapartida (no recurrente), con patrocinio fiscal para recibir donaciones.
   - **C. Patrocinio corporativo y gremial con cortafuegos de datos** (minero-energéticas, cooperativas, gremios), solo si se protege la neutralidad.
4. **Precio ilustrativo:** COP 15 millones por municipio-año (unos US$4.800, equivale a COP 31.250 por caso con 40 casos/mes). Punto de equilibrio operativo: unos 30 municipios; margen cercano al 30% con 170 municipios (el universo PDET) bajo mis supuestos (sección 8).
5. **Advertencia de contexto:** el gobierno que se posesionó el 7-ago-2026 (Abelardo de la Espriella) está recortando: presupuesto agro -32% y ANT -60% para 2027, sin compra de tierras, no renovación de ~10.000 contratos de prestación de servicios en el agro [29]. Justicia y del Derecho solo baja -2,6% en el anteproyecto [29], pero el riesgo de austeridad es real. No conviene depender de un solo pagador nacional.

---

## 1. Contexto fiscal y político que condiciona quién puede pagar (oct-2026)

| Hecho | Dato | Fuente |
|---|---|---|
| Cambio de gobierno | Abelardo de la Espriella asumió el 7-ago-2026. Para Justicia se reportó como designado a Iván Cancino (penalista). **No verificado** que esté en el cargo ni cuáles son sus prioridades de acceso a la justicia rural. | [30] |
| Hueco fiscal 2027 | El nuevo gobierno advirtió un faltante de ~COP 30 billones. | [29] (El Universal, 3-ago-2026) |
| Agro y ANT | Sector agro baja 32% (COP 4,1 a 2,7 billones). ANT -60%, sin compra de tierras en 2027, congelados COP 1,4 billones de pagos pendientes. ~10.000 contratos OPS no se renuevan (ahorro ~COP 540.000 millones). URT y UPRA con recortes de OPS. | [29] Valora Analitik, 8-sep-2026 |
| Justicia | Anteproyecto: Justicia y del Derecho -2,6%, Fiscalía -4,4%. La Judicatura denuncia un hueco de COP 6,1 billones y recuerda que la Ley 2430 prohíbe reducir el presupuesto de la Rama en términos reales (art. 192C: 3% del presupuesto de rentas, sin disminución). | [29], [16] |
| Ciencia | Anteproyecto de abril-2026 (gobierno saliente): inversión CTeI -92,1% (COP 379.855 a 30.063 millones). TIC +38,2%. | [29] Portafolio |
| Regiones | Informe del Senado: recortes de inversión mayores a 30% en algunas regiones de 25 departamentos. | [29] |
| Ley estatutaria agraria | Ley Estatutaria de la Jurisdicción Agraria y Rural sancionada el 27-mar-2026 (Ley 2570). Crea "facilitadores agrarios y rurales" y Centros de Servicios de apoyo técnico. Quién los nombra y financia: **no está dicho**; la ley ordinaria sigue en discusión. | [17] |
| Cooperación global | AOD de los donantes DAC cayó 23,1% real en 2025 (USD 174,3 mil millones); la OCDE proyecta otro -5,8% en 2026. EE. UU. cayó 56,9%. Subieron España, Suecia, Dinamarca, Noruega, Luxemburgo, Islandia. | [20] |
| Cooperación en Colombia | APC registró USD 781 millones en 2025 (baja frente a 2024). Aumentaron UE, Francia, Italia, banca multilateral e Irlanda; bajaron EE. UU. y Japón. ODS 16 (paz, justicia, instituciones) fue el mayor eje temático: USD 149 millones. | [18] |

Lectura: la plata para "acceso a la justicia" sigue existiendo (ODS 16 es el primer eje de la cooperación), pero se concentra en pocos canales (PNUD, Fondo Multidonante, UE) y el Estado nacional está en modo austeridad. Un modelo sostenible debe tener **al menos dos tipos de pagador** (Estado + cooperación) y un camino a **pagador territorial** (gobernación/alcaldía) que no dependa del presupuesto nacional.

---

## 2. Clientes institucionales posibles en Colombia

Calificación: Capacidad = probabilidad de que tenga plata y mandato para pagar esto en 12-24 meses (Alta/Media/Baja). Todo es juicio mío a partir de la evidencia citada.

| Entidad | Mandato/evidencia relevante | Capacidad | Vía de contratación | Riesgo / nota |
|---|---|---|---|---|
| **Ministerio de Justicia y del Derecho (SLJ, Casas de Justicia, jornadas móviles, MASC)** | Convenio 698-2026: COP 1.586.320.000 (Ministerio aporta 1.505.800.000; la fundación 80.520.000 en especie), hasta 15-dic-2026, 140 municipios/14 departamentos, 70 capacitaciones, 14 jornadas móviles, pagos 25/30/30/15% contra productos verificables. Priorizó municipios PDET [14]. Ley 2430 art. 2: Casas de Justicia en municipios PDET y uso de TIC en justicia rural [16]. | **Alta** (la más alta) | Convenio de asociación con ESAL (Ley 489 art. 96 + Decreto 092/2017); contratación directa CTeI; mínima cuantía | Gobierno nuevo; prioridades no confirmadas. El aporte de la fundación en el 698 (≈5%) no cuadra con el piso de 30% en efectivo del Decreto 092 art. 5 [15]: o hubo proceso competitivo, o la nota de prensa está incompleta. **No verificado; revisar el expediente en SECOP II.** |
| Rama Judicial / Consejo Superior de la Judicatura | Ley 2430 art. 90: debe diseñar un Plan Estratégico de Superación de Barreras y de Acceso a la Justicia, en especial para poblaciones rurales [16]. Pero reporta hueco de COP 6,1 billones [29]. | Media-Baja | Contratación estatal estándar | Es "gancho de política", no pagador probable. Útil como aliado/validador. |
| Defensoría del Pueblo | Ley 2430: mínimo una oficina de Defensoría por municipio; "se fortalecerán" Defensoría, personerías y casas de justicia [16]. Sin evidencia de compras tecnológicas 2026. | Media (**no verificado**) | Estatal estándar; convenios con cooperación | Buen validador y canal de derivación. |
| Procuraduría / Personerías municipales | Las personerías son operadores naturales (derechos de petición, orientación). Ley 2430 manda fortalecerlas [16]. Presupuesto propio pequeño. | Baja como pagador, Alta como usuario del tablero | Compra municipal (mínima cuantía) | Son el "cliente operativo", no el que paga. |
| **Alcaldías y gobernaciones (esp. PDET)** | Ley 2430: la oferta de justicia municipal debe planearse y fortalecerse [16]. Recortes de inversión regional [29]. | Media | **Mínima cuantía** (ver sección 5), convenios con ESAL, SGP/regalías | Montos pequeños pero ciclo corto. Los presupuestos 2027 territoriales se aprueban en oct-nov-2026 (**no verificado el calendario exacto**). |
| Agencia de Renovación del Territorio (ART) / PDET | 170 municipios PDET (dato de conocimiento general, **no verificado en esta sesión**). Fondos y estructura 2027 bajo el nuevo gobierno: **no verificado**. | Media-Baja | Convenios con cooperación; Fondo Colombia en Paz (**no verificado**) | PDET es el mejor "universo objetivo" para el piloto, pero incierto como pagador. |
| Agencia Nacional de Tierras (ANT) | Presupuesto -60% 2027, sin compra de tierras [29]. | **Baja** | n/a | No pitchear como pagador. Sí como tema (formalización, derechos de petición de tierras). |
| Unidad de Restitución de Tierras (URT) | Recortes de OPS (COP 30.000 de 475.000 millones iban a OPS) [29]. | Baja | n/a | Idem. |
| Unidad para las Víctimas | Sin evidencia 2026 obtenida. | Baja-Media (**no verificado**) | Estatal estándar | Posible caso de uso (rutas de reparación), sin evidencia de pago. |
| JEP | Ponencia de primer debate la recortó COP 170.000 millones [29]. | Baja | n/a | Aliado temático, no pagador. |
| Consultorios jurídicos (Ley 2113 de 2021) | Servicio obligatorio y gratuito de estudiantes de Derecho: asesoría, conciliación extrajudicial en derecho, pedagogía en derechos; el Ministerio de Justicia ejerce control y vigilancia [34]. | Baja como pagador | n/a | Son **oferta de mano de obra jurídica supervisada gratis**: reducen el costo de la revisión humana. Clave para la economía unitaria. |
| Cajas de compensación | Sin evidencia obtenida de que financien servicios jurídicos. | **No verificado** | Convenio | Hipótesis a validar con 2-3 llamadas. |
| Cooperativas y gremios agrarios (Fedecafé, etc.) | Sin evidencia obtenida. Hipótesis: pagarían como servicio al asociado (contratos de arriendo, aparcería, compraventa de cosecha). | **No verificado** | Contrato B2B | Vender a una cooperativa de 1.000 asociados puede ser más rápido que a una entidad pública. |
| Empresas minero-energéticas (relacionamiento comunitario) | Sin evidencia obtenida. | **No verificado** | Patrocinio/CSR | Riesgo de conflicto de interés (ver sección 10). |

---

## 3. Cooperación internacional y fondos 2025-2026 (panorama real)

### 3.1 Qué cambió
- **USAID desapareció como canal.** Un boletín del IEPRI (U. Nacional) reportó que de 80 programas financiados vía USAID solo quedaban 7 [21]. Entre 2018 y mar-2024 USAID aportó USD 3.231 millones a Colombia (cifra de APC citada en la prensa) [21].
- **Hay un reemplazo parcial pequeño:** la ley de apropiaciones de EE. UU. del año fiscal 2026 incluiría USD 25 millones para comunidades afro e indígenas y USD 15 millones para derechos humanos en Colombia (USD 40 millones) por canales de seguridad nacional/Departamento de Estado, no USAID [21] (fuente: nota de RTVC; **no verificado en fuente primaria**; no sé qué entidad lo ejecutará ni si financiará justicia).
- **La AOD global cae** (sección 1) y Colombia, por ser país de renta media-alta, recibe menos. APC está empujando filantropía y mecanismos innovadores [19]: entre 2015 y 2025 Colombia recibió solo 0,04% del mercado filantrópico estadounidense; Ford es el mayor donante filantrópico de la última década; **patrocinio fiscal** (una fundación de EE. UU. como paraguas legal para recibir donaciones deducibles) es la ruta que APC está promoviendo, con 8 patrocinadores fiscales identificados y 6 cartas de entendimiento firmadas [18], [19].

### 3.2 Tabla de fuentes concretas

| Fuente | Estado verificado | Monto / relevancia | Utilidad para el proyecto |
|---|---|---|---|
| **PNUD Colombia, proyecto "Acceso a la justicia como habilitador del desarrollo"** | En curso, jun-2024 a dic-2027. Donantes: Alemania, Fondo Multidonante ONU, alcaldías de Bogotá (Ciudad Bolívar) y Cali. Incluye un **curso por WhatsApp** y un podcast tipo radionovela; herramientas para identificar necesidades de comunidades en Jurisdicción Agraria y Rural. Ejecución 2026 reportada: USD 517.183 [22] (la página dio 403 al fetch directo; datos vía resumen de búsqueda, **no verificado de primera mano**) | USD < 1 millón/año | **Es el aliado/competidor natural.** Prueba que los donantes ya financian WhatsApp para educación legal. Pitch: "capa transaccional (derecho de petición, ruta, documento) sobre su capa educativa". |
| **Fondo Multidonante de la ONU para el sostenimiento de la paz** | Activo. 12 convocatorias publicadas 2024-2026, todas hoy **cerradas** (p. ej. restitución de tierras en Tumaco, may-2026; asistencia a víctimas de minas, ene-2026; incluye OSC nacionales). Ninguna era de justicia/tecnología [23] | Montos no publicados en el listado | Seguir de cerca la próxima ronda. Candidato para el piloto en municipios PDET. |
| **GIZ / BMZ, Fondo para el acompañamiento del Proceso de Paz** | €10.480.735, vigente 01-ago-2020 a **31-dic-2026**, es decir, termina en 10 semanas [24] | n/a | No como fuente nueva. Hay que preguntar a GIZ qué viene después (**no verificado**). |
| **Unión Europea** | APC la reporta con presencia creciente en 2025 [18]. Visita del Enviado Especial para la paz (feb-2026) bajo el enfoque Global Gateway (https://www.eeas.europa.eu/delegations/colombia/visit-eu-special-envoy-bolsters-europes-support-territorial-peacebuilding-and-rural-progress_en; dato de un resumen de búsqueda, no leído de primera mano). **No encontré convocatoria abierta de justicia/sociedad civil 2026.** | **No verificado** | Contactar a la Delegación; explorar EUROsociAL+ (**no encontré presencia en Colombia**). |
| **AECID (España)** | Convocatorias 2026 halladas: cooperación triangular (cierre 06-jul-2026) y un anuncio del BOE (14-jul-2026) de proyectos regionales sobre verdad, memoria, reparación y justicia restaurativa en América Latina, tope €90.918 por entidad, 20 días hábiles [40] | Hasta €90.918 | Plazo ya vencido y probablemente dirigido a ONG españolas (**no verificado**). Útil como referencia de monto. |
| **Suiza (COSUDE/DFAE)** | Estrategia 2025-2028 incluye "promoción de la paz y los derechos humanos"; la página no menciona justicia ni convocatorias abiertas [25] | n/a | **No verificado**; contacto exploratorio. |
| **Ford Foundation** | Mayor donante filantrópico en Colombia de la última década (con Buffett e Hilton, más de USD 200 millones juntos) [19]; tiene oficina en Bogotá y línea de tecnología y justicia en América Latina (donaciones pasadas de USD 50.000-350.000) [26] | Donaciones previas USD 50 mil a 350 mil | Sin convocatoria abierta; se accede por invitación/relación. |
| **Luminate** | Portafolio en derechos digitales, participación cívica, información; subvenciones de LatAm de USD 420 mil a 561 mil a 3 años [26] | Alto | Encaje débil (más derechos digitales que acceso a la justicia). **No verificado** para 2026. |
| **Open Society Foundations** | Nada hallado. | **No verificado** | n/a |
| **Fundación Bolívar Davivienda / Social Skin** | Octava edición 2026 (Davivienda + Seguros Bolívar; mentoría de Emprende País): premios de hasta USD 12.000 (crecimiento) y USD 7.000 (piloto); líder ≤32 años, proyecto ya operando; **cerró el 23-mar-2026** [27] | USD 7-12 mil | Capital semilla posible en la próxima edición (se espera inicio de 2027, **no verificado**). Requiere líder joven. |
| **iNNpulsa / MinTIC (Emprendimiento Digital 2026)** | Cuatro convocatorias (modelo de negocio para 110 empresas, producto digital para 60, incubadoras regionales); cierres 24 y 30 de abril 2026; apoyo técnico, no dinero directo [28]. El brochure de iNNpulsa del 22-jun-2026 no trae convocatorias de govtech/legaltech [28] | n/a | **No hay convocatoria GovTech/LegalTech abierta que haya podido confirmar.** |
| **MinCiencias / SGR-CTeI** | Fondo CTeI de regalías: COP 2,55 billones para el bienio 2025-2026 (Ley 2441 de 2024), vía convocatorias del OCAD CTeI; debate de la Procuraduría por ~COP 900.000 millones de proyectos (ago-2026) [31]. Presupuesto central CTeI casi eliminado en el anteproyecto 2027 [29] | Muy alto pero lento | Ruta de mediano plazo: una gobernación + universidad formula un proyecto de CTeI (apropiación social/TIC). 12-24 meses. |
| **BID Lab** | Concurso Gobernarte 2026 (gobiernos subnacionales, cat. equidad digital) cerró el 06-jul-2026; GovTech Connect cubre Argentina, Brasil, Chile, Uruguay; Cali fue la primera ciudad colombiana en el programa GovTech LATAM [37] | n/a | No hay convocatoria abierta para Colombia en justicia que haya podido confirmar. Observar siguiente edición de Gobernarte. |
| **HiiL (Justice Accelerator / Innovating Justice Fund)** | Última convocatoria hallada: 2024, €10.000 de semilla sin participación accionaria para startups de África [38]. Sin convocatoria 2026 confirmada. | €10 mil | Referente de impacto en justicia centrada en la gente; seguir su sitio. |
| **WPHF (ONU) Rapid Response Window** | Página oficial: solicitudes abiertas todo el año, hasta USD 30.000 de apoyo directo y hasta USD 100.000 por subvención corta (vía ONG internacional socia); solo OSC de mujeres; excluye gobierno, ONG internacionales, universidades. **No menciona Colombia explícitamente** [36]. Un boletín de Asocapitales lo da con fechas y montos distintos (cierre 31-dic-2026, USD 25 mil) [36]: tomar el boletín como poco fiable. | USD 30-100 mil | Solo vía una organización de mujeres rurales como solicitante principal (p. ej. piloto "derechos de las mujeres rurales"). |

Conclusión de la sección: **no encontré ninguna convocatoria abierta, con monto, que encaje exactamente en "legaltech de acceso a la justicia rural" en oct-2026.** La cooperación se accede por relación (PNUD, UE, Fondo Multidonante, Ford) y por alianza con una ESAL ya reconocida, no por concurso público de govtech. Eso refuerza la recomendación de aliarse con una ESAL con trayectoria.

---

## 4. Rutas de contratación pública relevantes

| Ruta | Cómo funciona | Aplicabilidad | Fuente |
|---|---|---|---|
| **Mínima cuantía** | Contratos que no superan el 10% de la menor cuantía de la entidad, sin importar el objeto. Con SMMLV 2026 = COP 1.750.905 [32] y mi lectura de la Ley 1150 de 2007 art. 2 (menor cuantía de 280 a 1.000 SMMLV según el presupuesto de la entidad; **escala no verificada en esta sesión**), la mínima cuantía iría de ~28 a ~100 SMMLV: **COP 49 millones a COP 175 millones**. Una alcaldía pequeña queda en el extremo bajo. | La vía más rápida (semanas) para licencias municipales. Un contrato anual de COP 15 millones cabe; uno de 3 años a COP 45 millones también. | [35], [32] |
| **Convenio de asociación con ESAL** | Art. 355 de la Constitución + Decreto 092 de 2017. La ESAL debe tener "reconocida idoneidad"; si es el único proveedor del programa se evita competencia siempre que la ESAL ponga **al menos 30% del valor en efectivo** (propio o de cooperación internacional). Si varias ofrecen el programa, hay proceso competitivo (indicadores, plazo, evaluación). La RUP no es requerida. | Es el vehículo del Convenio 698-2026. **La cooperación sirve como el 30% que desbloquea el 70% estatal.** Ejemplo: convenio de COP 450 millones = COP 135 millones (≈US$43 mil) de cooperación + COP 315 millones del Estado. | [15], [14] |
| **Contratación directa CTeI** | La Ley 1150/2007 (art. 2, num. 4, lit. e) permite contratar directamente actividades científicas y tecnológicas; se rige además por la Ley 1286/2009 y los decretos 393 y 591 de 1991 según la Circular 6 de 2013 de Colombia Compra Eficiente. | Útil para un **piloto co-desarrollado** (experimento, no compra de servicio). **Debe ser un objeto realmente CTeI.** | [35] |
| **SECOP II / selección abreviada / licitación** | Procesos competitivos estándar. | Para montos mayores (departamentos, ministerio). Lentos (3-9 meses). | [35] |
| **Tienda Virtual / Acuerdos Marco** | **No verificado** si hay un acuerdo marco aplicable a SaaS legal. | n/a | n/a |
| **Sistema General de Regalías (CTeI, Paz)** | Los proyectos se aprueban por convocatoria pública en OCAD; los términos se basan en demandas territoriales del plan bienal [31]. | Mediano plazo; requiere gobernación + universidad. | [31] |

Calendario a vigilar (conocimiento general, **no verificado en esta sesión**): el gobierno debe presentar el Plan Nacional de Desarrollo 2026-2030 dentro de los 6 meses siguientes a la posesión (art. 341 C.P.), es decir, hacia el 7-feb-2027: es la ventana para que "acceso a la justicia rural digital" quede nombrado. Elecciones territoriales en oct-2027 (posible efecto de la Ley de Garantías en la contratación directa): **verificar el calendario 2027**.

---

## 5. Modelos de negocio de legaltech de impacto: evaluación

| Modelo | Cómo ganaría plata aquí | Viabilidad | Comentario |
|---|---|---|---|
| **B2G / B2G2C (licencia o pago por caso al Estado)** | Alcaldía/gobernación/MinJusticia paga por municipio o por caso gestionado; el ciudadano usa gratis. | **Alta** | Calza con el mandato de la Ley 2430 y con cómo ya contrata MinJusticia (por productos verificables). Riesgo: austeridad y ciclos electorales. |
| **B2NGO / cooperación (grants, pago por resultados, subcontrato a ESAL)** | PNUD, Fondo Multidonante, UE, fundaciones. | **Alta para arrancar, baja para sostener** | Entre USD 25 mil y USD 100 mil por piloto es un rango realista (referencias: Social Skin, WPHF, AECID). No recurrente. |
| **B2B2C (empresas patrocinadoras)** | Minero-energéticas, agroindustria, cajas, bancos pagan "acceso a la justicia" en su zona de influencia. | **Media** | Rápido de contratar, pero compromete la neutralidad en conflictos de tierras/minería. Solo con cortafuegos (sección 10). **No verificado** que haya demanda. |
| **B2B a cooperativas/gremios** | Cuota por asociado/mes por contratos y trámites. | **Media (hipótesis)** | Más rápido que el sector público; sin evidencia aún. Validar con 3 cooperativas. |
| **Freemium al usuario final** | Pago por documentos premium. | **Baja** | El usuario objetivo no puede pagar; además choca con el principio de gratuidad de la Ley 2430 [16]. Referencia de mercado: una startup colombiana cobra desde COP 85.000 por consulta virtual [39], precio fuera del alcance de este público. |
| **Pago por caso derivado a abogados** | Comisión por referir clientes. | **Baja y riesgosa** | Incentivo perverso (empuja a litigar), y puede chocar con el Código Disciplinario del Abogado (captación de clientela/reparto de honorarios): **no verificado, validar con abogado**. Referente: PuntoLegali cobra por transacción y servicios con revisión opcional de abogado [39]. Alternativa: derivar gratis a consultorios jurídicos (Ley 2113). |
| **Plataforma que conecta con consultorios jurídicos** | La universidad no paga mucho; el valor es operativo (cola de casos, supervisión docente, métricas para el Ministerio). | **Media como canal, baja como ingreso** | Su aporte es de costo, no de ingreso. |
| **Sociedad BIC (Ley 1901 de 2018)** | Marca de impacto; no da dinero. | **Útil como forma societaria complementaria** | Cualquier sociedad comercial puede adoptar la condición; debe incluir actividades de beneficio colectivo en el objeto social y usar "BIC"; **sigue en el régimen ordinario de renta e IVA**. Beneficios: tarifas preferenciales en signos distintivos (SIC) y un tratamiento tributario para utilidades repartidas en acciones a trabajadores, ambos de un proyecto de decreto; el Decreto 2046 de 2019 reglamenta (**no verificado el texto final**) [33]. |

Estructura legal sugerida (hipótesis a validar con abogado): **ESAL (fundación/corporación)** para convenios de asociación, donaciones y patrocinio fiscal, más una **SAS BIC** opcional para vender licencias donde la ESAL no sea la mejor figura. Si hay que elegir una sola para el hackathon: ESAL (o aliarse con una existente). **No verificado** si el trabajo de acceso a la justicia califica como "actividad meritoria" para el régimen tributario especial (art. 359 E.T.).

---

## 6. Costos de operar

### 6.1 WhatsApp Business Platform (modelo vigente de Meta)

Hechos verificados en la documentación oficial [1], [2]:
- Cobro **por mensaje entregado** desde el 1-jul-2025 (ya no por conversación). Meta no cobra los mensajes del usuario a la empresa.
- Categorías: marketing, utilidad, autenticación (plantillas) y servicio (texto libre dentro de la ventana de 24 h tras el último mensaje del usuario).
- **Novedades del 1-oct-2026 (hace tres semanas):** los mensajes de servicio dejan de ser gratis. Cada número de teléfono tiene **1.000 mensajes de servicio gratis al mes**; desde el 1.001 se cobran, y las plantillas de utilidad dentro de la ventana de 24 h también se cobran [1], [3], [6].
- **Excepción clave para este proyecto:** Meta afirma que los mensajes de servicio "seguirán siendo gratis más allá del nivel mensual solo para organizaciones gubernamentales y sin ánimo de lucro elegibles", política vigente hasta el **31-dic-2027** [1]. La documentación no explica cómo se acredita la elegibilidad: **verificar con Meta/BSP antes de contar con ello**. Si se cumple, una ESAL tendría costo cero de mensajes de servicio.
- Ventana de entrada gratuita (anuncios que abren WhatsApp): respuestas gratis hasta 7 días desde el 28-sep-2026 [3].
- Colombia es un mercado propio (+57) y la facturación en COP existe desde el 1-abr-2026; las tarifas oficiales están solo en los CSV/PDF de tarifas de Meta, no en el texto de la página [1], [2].

Tarifas de Colombia (**fuentes secundarias, no verificadas contra el CSV oficial**):

| Categoría | USD por mensaje | COP aprox. | Fuente |
|---|---|---|---|
| Utilidad | 0,0008 | ~2,95 | [4] (tarifario Meta vigente 1-jul-2026, según el artículo), [5] |
| Autenticación | 0,0008 | ~2,95 | [4], [5] |
| Servicio (después de 1.000 gratis/número/mes) | igual a utilidad: 0,0008 | ~2,95 | [4], [5] |
| Marketing | 0,0125 ([4]) **o** "del orden de 0,03" ([5]); las fuentes se contradicen | 46 a 94 | [4], [5] |

Recomendación de diseño de costos: **evitar plantillas de marketing**. Los avisos proactivos (recordatorio de plazo de un derecho de petición, cita de conciliación) van como plantillas de **utilidad**. Además, el proveedor puede sumar su propio margen:
- **Twilio**: recargo de US$0,005 por mensaje en ambos sentidos [5], unas 6 veces la tarifa de Meta por mensaje de utilidad. Para un caso de ~35 mensajes serían ~US$0,175 (COP ~547) solo de recargo.
- **360dialog**: suscripción plana por canal (Regular €49 / US$59 al mes; Premium €99; Throughput €249), sin recargo por mensaje salvo 7% en marketing por el endpoint estándar [7].
- Cloud API directa de Meta (sin intermediario): **no verificado en esta sesión**; es la opción de menor costo si el equipo técnico puede operarla.

### 6.2 SMS masivo

| Proveedor / referencia | Precio por SMS a Colombia | Fuente |
|---|---|---|
| LabsMobile (lista del 20-oct-2026) | €0,0019 (tramo menor) y €0,0017 (tramo mayor); paquete mínimo US$10 / €9 | [10] |
| Infobip | US$0,0054 | [8] |
| Plivo / Sinch | US$0,035 / US$0,039 | [8] |
| Twilio | US$0,0525 ([8]) o US$0,0592 por segmento ([9]) | [8], [9] |
| Servientrega (paquetes de 500 a 10.000 SMS; COP 20.000 a 238.000; fecha desconocida) | ~COP 24 el SMS al paquete mayor | encolombia (**no verificado**, dato antiguo) |

El rango es 30 veces entre el más barato y el más caro. Un detalle de costo: un SMS en el alfabeto GSM-7 admite 160 caracteres, pero **las vocales con tilde á, í, ó, ú obligan a codificación Unicode (70 caracteres por segmento)**, lo que puede triplicar el costo. Redactar los SMS sin esos caracteres o con mensajes cortos (conocimiento técnico estándar, **verificar con el proveedor**). Para uso de bajo consumo de datos, el costo en el lado del usuario (SMS entrante a código corto, zero-rating con operadores) **no fue verificado**; negociarlo con los operadores es una tarea aparte.

### 6.3 Hosting e IA

| Rubro | Precio | Fuente |
|---|---|---|
| Cloudflare Workers (plan de pago) | US$5/mes mínimo por cuenta; 10 millones de solicitudes y 30 millones de ms de CPU incluidos; sin cargo de egreso | [12] |
| Supabase Pro | desde US$25/mes (8 GB de base de datos, 100.000 MAU incluidos) | [13] |
| IA conversacional (Claude Haiku 5.5, prompts hasta 100 mil tokens) | US$0,10 por millón de tokens de entrada y US$0,50 de salida | [11] |
| IA para redactar documentos (Claude Sonnet 5.5) | US$2 de entrada y US$10 de salida por millón de tokens | [11] |

### 6.4 Costo de tecnología por caso (supuestos míos)

Caso tipo: 12 mensajes del usuario y 20 respuestas del bot dentro de la ventana de servicio, más 3 avisos de utilidad; 20% de los casos con respaldo por SMS (6 SMS a US$0,02, ya con holgura por Unicode); IA con 30.000 tokens de entrada y 4.000 de salida.

| Componente | USD | COP |
|---|---|---|
| WhatsApp (23 mensajes cobrables a US$0,0008, **peor caso sin exención ni 1.000 gratis**) | 0,018 | ~58 |
| SMS de respaldo (20% × 6 × US$0,02) | 0,024 | ~75 |
| IA (Haiku para chat; Sonnet solo para el documento final) | 0,005 a 0,10 | 16 a 313 |
| **Tecnología por caso** | **~0,03 a 0,15** | **~150 a ~450** |

A escala PDET (170 municipios × 40 casos/mes × 23 mensajes ≈ 156.000 mensajes al mes en un solo número) el costo de WhatsApp sería ~US$124 al mes (~COP 389.000) sin exención. **El dato de internet casi no pesa.** Lo que pesa es:

| Rubro humano y de equipo (supuestos) | Valor |
|---|---|
| Kit de conectividad para 6 líderes por municipio (COP 20.000/mes cada uno) | COP 1,44 millones/año |
| Revisión jurídica del 15% de los casos (COP 60.000 por revisión; mitigable con consultorios Ley 2113) | COP 4,3 millones/año |
| Capacitación en terreno, año 1 | COP 3 millones por municipio |
| Equipo central (soporte, contenido jurídico, seguridad y habeas data): 3 personas para 30 municipios (~COP 300 millones/año); 8 para 170 (~COP 800 millones/año) | por escala |

---

## 7. Economía unitaria ilustrativa

Supuestos: 40 casos/mes por municipio (480/año); precio de COP 15 millones por municipio-año; costos de la sección 6. Cifras en millones de COP.

| Escala | Ingresos | Costo año 1 (con capacitación) | Resultado año 1 | Costo renovación | Resultado renovación |
|---|---|---|---|---|---|
| Piloto: 3 municipios | 45 | 177 | -132 | 168 | -123 |
| Regional: 30 municipios | 450 | 566 | -116 | 476 | -26 (≈ -6%) |
| Escala PDET: 170 municipios | 2.550 | 2.305 | +245 | 1.795 | **+755 (≈ 30%)** |

Lecturas:
- Costo todo incluido por caso a escala PDET: **~COP 22.000** (US$7); precio por caso a COP 15 millones/480 casos: **COP 31.250**.
- El piloto (3 municipios) necesita ~**COP 130 millones (≈ US$42 mil)** de capital no reembolsable: ese es el tamaño del primer pedido a cooperación/Social Skin/Ford-tipo, o el 30% de contrapartida de un convenio.
- El equilibrio está cerca de 30-35 municipios. Debajo de eso, el proyecto es de subvención; arriba, puede sostenerse con licencias.
- Referencia de mercado: el Convenio 698-2026 equivale a **COP 11,3 millones por municipio** (COP 10,8 millones del Ministerio) para asistencia técnica, capacitaciones y jornadas [14]. Nuestro precio es del mismo orden, lo cual hace plausible que el Ministerio lo vea como un "módulo" más de SLJ y no como un gasto nuevo.

Todos los costos humanos son supuestos propios; hay que reemplazarlos con cotizaciones antes de presentar números a jurados o al Ministerio.

---

## 8. Cliente pagador #1 y por qué

**Ministerio de Justicia y del Derecho, programa Sistemas Locales de Justicia (SLJ), vía convenio de asociación con una ESAL.**

Por qué este y no otro:
1. **Mandato legal explícito:** Ley 2430 de 2024 (art. 2 modificado de la Ley 270): acceso a la justicia rural "procurando el uso de las TIC"; fortalecer personerías, Defensoría y casas de justicia; casas de justicia en municipios PDET [16]. Ley 2570/2026 crea facilitadores agrarios y rurales sin definir quién los equipa [17]: hueco que la herramienta puede llenar.
2. **Ya compra este tipo de cosa por producto verificable:** Convenio 698-2026, COP 1.586 millones, 140 municipios, pagos contra entregables [14]. El pitch no pide un presupuesto nuevo: pide un entregable nuevo dentro de un esquema que existe.
3. **Su presupuesto es el menos golpeado** del universo estatal rural (Justicia -2,6% frente a Agro -32% y CTeI casi eliminado) [29].
4. **Tiene el universo y el criterio de priorización** (municipios PDET con alertas de la Defensoría) [14].

Riesgos del pagador #1: ministro nuevo (no verificado), prioridades penales posibles, austeridad, y que la contratación se haga siempre con las mismas ESAL. Mitigación: llegar con una ESAL aliada que ya sea socia del Ministerio, y con financiación del 30% ya asegurada.

Cliente #2 (acelerador): **PNUD / Fondo Multidonante / UE** como cofinanciadores del piloto y de la contrapartida.
Cliente #3 (escala territorial): **gobernaciones y alcaldías PDET** por mínima cuantía, y departamentos con regalías CTeI a mediano plazo.
No pitchear como pagador: ANT, URT, JEP (recortes confirmados).

---

## 9. Recomendación: 3 modelos de ingreso y pricing ilustrativo

### 9.1 Modelos (en orden)

**A. B2G2C, "justicia local digital como servicio" (recurrente).** Tres presentaciones:
1. *Licencia municipal* (alcaldía o personería, mínima cuantía).
2. *Paquete departamental/subregional* (gobernación, MinJusticia o ART; convenio).
3. *Pago por resultados* (MinJusticia o cooperación pagan por caso gestionado y verificado).

**B. Cooperación y filantropía (capital de arranque y contrapartida).** Uso: piloto de 3 municipios, el 30% de contrapartida del convenio con el Ministerio y la seguridad de datos. Instrumentos: subcontrato a PNUD/Fondo Multidonante, premios (Social Skin), donaciones con patrocinio fiscal [18], [19].

**C. Patrocinio corporativo y membresía gremial, con cortafuegos (oportunista).** Empresa o gremio paga por una región o por sus asociados; no ve datos de usuarios; no puede filtrar contenido; reporte solo agregado. Se pospone hasta que A y B estén andando.

### 9.2 Pricing ilustrativo (supuestos, validar con 3 compradores)

| Plan | Quién paga | Qué incluye | Precio |
|---|---|---|---|
| **Usuario final** | Nadie | Rutas, borradores de derechos de petición y contratos básicos, recordatorios, por WhatsApp/SMS/offline | **Gratis siempre** |
| **Licencia municipal** | Alcaldía / personería | Hasta 600 casos/año, 6 a 10 líderes capacitados, tablero para personería/casa de justicia, soporte, enlace con consultorio jurídico aliado | **COP 15 millones/año** (≈ US$4.800); caso adicional COP 20.000. Cabe en mínima cuantía incluso a 3 años (COP 45 millones) |
| **Paquete subregional** | Gobernación / MinJusticia / ART | 20 a 40 municipios, 20% de descuento por volumen, implementación en terreno | **COP 12 millones por municipio-año** más COP 3 millones por municipio de implementación (30 municipios ≈ COP 450 millones el año 1) |
| **Pago por resultados** | MinJusticia / cooperación | Caso con salida verificable (derecho de petición radicado, acta de conciliación, ruta activada) | **COP 30.000 por caso**, con tope anual (480 casos ≈ COP 14,4 millones por municipio) |
| **Patrocinio regional** | Empresa / gremio | Cobertura de ~10 municipios de la zona de influencia + informe agregado, **sin acceso a datos** | **COP 40 a 80 millones/año** (hipótesis; sin validar) |
| **Membresía cooperativa** | Cooperativa o gremio | Plantillas de contratos agrarios y trámites para asociados | **COP ~3.000 por asociado/mes** (hipótesis; sin validar) |

### 9.3 Ruta de 24 meses (resumen)
- **Meses 0-3:** aliarse con una ESAL con trayectoria; acuerdo con un consultorio jurídico universitario (Ley 2113); pedir reunión con el equipo SLJ del Ministerio y con PNUD; verificar con Meta/BSP la elegibilidad de ONG para mensajes de servicio gratis.
- **Meses 3-9:** piloto de 3 municipios PDET con financiación de cooperación (≈ COP 130 millones); medir casos, tiempo de respuesta, tasa de radicación.
- **Meses 9-15:** convenio con MinJusticia/gobernación para 20-30 municipios, con el 30% de contrapartida (≈ US$43 mil por cada COP 450 millones de convenio).
- **Meses 15-24:** licencias municipales por mínima cuantía y proyecto de regalías CTeI con una gobernación y una universidad.

### 9.4 Guion de 60 segundos para el jurado (propuesta)
"El campesino no paga, y no debería. Paga el Estado, que por la Ley 2430 de 2024 está obligado a llevar justicia al campo con tecnología, y que hoy ya contrata a organizaciones para esto: este año el Ministerio de Justicia firmó COP 1.586 millones para 140 municipios. Nosotros somos el módulo digital de ese programa: cuesta menos de un centavo de dólar de tecnología por caso, usa WhatsApp y SMS, y nos apalancamos en consultorios jurídicos universitarios para la revisión humana. COP 15 millones por municipio al año, COP 31.000 por caso resuelto, frente a COP 85.000 que cobra una consulta virtual privada."

---

## 10. Riesgos del modelo y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Austeridad del gobierno nuevo y reorientación de prioridades | Dos o tres tipos de pagador; cooperación como contrapartida; precio dentro de mínima cuantía |
| Dependencia de una sola ESAL o convenio | Contratos con varias entidades; el producto sirve también a gobernaciones y cooperación |
| Meta cambia tarifas (cada trimestre, con 1 mes de aviso) [1] | Arquitectura multicanal (SMS como respaldo); no usar marketing; costo de mensajería es marginal en el modelo |
| La exención de Meta para ONG/gobierno no aplica a nuestra cuenta | Costo máximo calculado en la sección 6.4; sigue siendo bajo |
| Competencia gratuita del Estado (LegalApp del Gobierno ofrece orientación jurídica gratuita [39]) y proyectos de cooperación (PNUD con curso por WhatsApp [22]) | Posicionarse como capa transaccional y de última milla (documentos, rutas, seguimiento, líderes); buscar integración o alianza con ellos en lugar de competir |
| Neutralidad con patrocinios minero-energéticos o agroindustriales | Cortafuegos: sin acceso a datos, sin influencia de contenido, divulgación pública de patrocinadores, rechazo de casos de conflicto con el patrocinador |
| Pago por caso referido a abogados | No hacerlo; derivar gratis a consultorios/Defensoría |
| Datos personales sensibles (víctimas, líderes sociales, tierras) y costo de cumplimiento | Presupuestar seguridad y habeas data en el equipo central (otro frente cubre el marco legal) |
| Cifras del Convenio 698 provienen de prensa | Verificar en SECOP II antes del pitch |

---

## 11. Qué no pude verificar (pendientes concretos)

1. Convenio 698-2026: texto en SECOP II (modalidad, selección, aportes, supervisión). Las cifras vienen de Pulzo, que cita "información oficial" [14].
2. Quién es el ministro de Justicia en el cargo y sus prioridades. Solo hay una nota del 2-jul-2026 que lo da como designado [30].
3. Tarifas oficiales de Meta para Colombia (CSV/PDF en COP). Mis cifras vienen de blogs [4], [5]; hay contradicción en marketing.
4. Proceso para acreditar a una ONG como "elegible" para mensajes de servicio gratis hasta 2027 [1].
5. Convocatorias abiertas de la UE, GIZ (nuevo ciclo), Suiza, Open Society, cajas de compensación, gremios y empresas.
6. Presupuesto 2027 de ART/PDET y estado del Fondo Colombia en Paz.
7. Escala exacta de menor cuantía (Ley 1150 art. 2) y calendario de Ley de Garantías 2027.
8. Si el trabajo de acceso a la justicia califica como actividad meritoria para el régimen tributario especial (E.T. art. 359).
9. Restricciones del Código Disciplinario del Abogado sobre referir clientes a cambio de pago.
10. La página del proyecto de PNUD dio 403; sus datos vienen de un resumen de búsqueda.
11. Costo del SMS entrante/zero-rating con operadores móviles en Colombia.
12. Todos los supuestos humanos de la sección 6.4 y 7 (revisión jurídica, kit de conectividad, equipo central, 40 casos/mes por municipio, precios de patrocinio y membresía).

---

## Fuentes

**WhatsApp, SMS, hosting, IA**
- [1] Meta, Pricing on the WhatsApp Business Platform: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing (versión .md con la cláusula de ONG/gobierno: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing.md)
- [2] Meta, updates to pricing: https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing
- [3] Kommo, reglas de precios (oct-2026): https://support.kommo.com/docs/updated-pricing-rules-for-whatsapp-business.md
- [4] Dinolabs, WhatsApp API en Colombia: https://www.dinolabs.dev/blog/whatsapp-business-api-colombia-precios-como-obtenerla
- [5] Zavor AI, WhatsApp Business API Colombia 2026: https://zavorai.com/guias/whatsapp-business-api-colombia
- [6] YCloud, cambios del 1-oct-2026: https://www.ycloud.com/blog/whatsapp-api-message-pricing-update-effective-october-1-2026.md
- [7] 360dialog, precios: https://docs.360dialog.com/docs/get-started/pricing.md
- [8] Sent.dm, SMS Colombia: https://sent.dm/en/resources/sms-pricing/colombia-sms-pricing
- [9] Twilio, SMS Colombia: https://www.twilio.com/en-us/sms/pricing/co
- [10] LabsMobile, lista de precios #PL20261020: https://www.labsmobile.com/es/prices/pricelist
- [11] Anthropic, precios de modelos: https://platform.claude.com/docs/en/about-claude/pricing
- [12] Cloudflare Workers, precios: https://developers.cloudflare.com/workers/platform/pricing/
- [13] Supabase, precios: https://supabase.com/pricing

**Clientes institucionales, normas, presupuesto**
- [14] Pulzo, Convenio de Asociación 698-2026 (MinJusticia, SLJ, 140 municipios): https://www.pulzo.com/nacion/convenio-para-fortalecer-sistemas-locales-de-justicia-en-valledupar-y-cesar-colombia-2026-PP5302663A (complemento: https://www.pulzo.com/nacion/sistemas-locales-de-justicia-en-valledupar-y-cesar-convenio-financiamiento-e-impacto-colombia-PP5302695A)
- [15] Decreto 092 de 2017: https://relatoria.colombiacompra.gov.co/normativa/decreto-092-de-2017/
- [16] Ley 2430 de 2024: https://sidn.ramajudicial.gov.co/SIDN/NORMATIVA/TEXTOS_COMPLETOS/7_LEYES/LEYES%202024/LEY%202430%20DE%202024.PDF y https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=253156
- [17] MinJusticia, sanción de la Ley Estatutaria de la Jurisdicción Agraria y Rural: https://www.minjusticia.gov.co/Sala-de-prensa/Paginas/Sancion-presidencial-de-Ley-Estatutaria-de-JAR-consolida-hito-para-justicia-en-campo-colombiano.aspx
- [29] Presupuesto 2027: Portafolio (anteproyecto, abr-2026) https://www.portafolio.co/economia/gobierno/presupuesto-nacional-2027-anteproyecto-de-hacienda-deja-la-ciencia-cultura-y-el-agro-como-grandes-perdedores-491536 ; Valora Analitik, ANT y agro (8-sep-2026) https://www.valoraanalitik.com/?p=610652 ; La República (24-sep-2026) https://www.larepublica.co/economia/los-sectores-donde-mas-se-ha-recortado-el-presupuesto-general-de-2027-4489006 ; Valora Analitik, Judicatura https://www.valoraanalitik.com/?p=610382 ; El Universal, faltante de COP 30 billones https://www.eluniversal.com.co/colombia/2026/08/03/presupuesto-de-2027-tendria-faltante-de-30-billones-advierte-gobierno-de-la-espriella/ ; Senado, recortes regionales https://www.senado.gov.co/index.php/component/content/article/13-senadores/7601-presupuesto-de-de-la-espriella-castiga-a-las-regiones-con-recortes-de-inversion-en-25-departamentos
- [30] El Universal, designación de Iván Cancino (2-jul-2026): https://www.eluniversal.com.co/colombia/2026/07/02/gabinete-de-abelardo-de-la-espriella-ivan-cancino-sera-el-ministro-de-justicia/
- [31] SGR-CTeI: https://minciencias.gov.co/sites/default/files/upload/convocatoria/terminos_de_referencia_convocatoria_52_sgr_def.pdf ; Asuntos Legales (ago-2026) https://www.asuntoslegales.com.co/actualidad/procuraduria-pidio-aplazar-proyectos-de-regalias-por-900-000-millones-4452481
- [32] SMMLV 2026 (Decretos 1469 y 1470 de 2025; hay una nota sobre suspensión provisional y decreto posterior 0159 que mantuvo el valor, no verificada): https://consultorsalud.com/aumento-del-salario-minimo-en-colombia-2026/
- [33] Ley 1901 de 2018 (BIC): https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=86982
- [34] Ley 2113 de 2021 (consultorios jurídicos): https://normograma.icfes.gov.co/docs/pdf/ley_2113_2021.pdf
- [35] Colombia Compra Eficiente: mínima cuantía https://sapiencia.gov.co/wp-content/uploads/2026/07/modalidad-de-contratacion-por-minima-cuantia_v1.pdf ; Circular 6 de 2013 (CTeI) https://www.colombiacompra.gov.co/wp-content/uploads/2024/08/20130927circularcit.pdf

**Cooperación y fondos**
- [18] APC-Colombia, Informe de gestión consolidado 2025: https://www.apccolombia.gov.co/sites/default/files/2026-01/Informe_de%20_Gestio%CC%81n_Consolidado_2025%20APC-Colombia%20V1.pdf
- [19] El Espectador, giro en la financiación hacia filantropía y mecanismos innovadores: https://www.elespectador.com/responsabilidad-social/region-en-accion/de-colombia-para-el-mundo/el-giro-en-la-financiacion-de-colombia-la-cooperacion-se-fortalece-en-la-filantropia-y-los-mecanismos-innovadores/
- [20] AOD 2025 (OCDE): https://sdg.iisd.org/news/oda-in-historic-decline-latest-oecd-data/ ; https://knowledge4policy.ec.europa.eu/publication/oecd-preliminary-official-development-assistance-levels-2025_en
- [21] USAID y reemplazo parcial: https://iepri.unal.edu.co/fileadmin/user_upload/iepri_content/Boletines_de_prensa/2025/0016_BOLETIN_USAID.pdf ; https://www.rtvcnoticias.com/internacional/estados-unidos/estados-unidos-restablece-cooperacion-economica-con-colombia
- [22] PNUD, Acceso a la justicia como habilitador del desarrollo: https://www.undp.org/es/colombia/proyectos/acceso-justicia-habilitador-desarrollo
- [23] Fondo Multidonante, convocatorias: https://www.fondoonucol.org/convocatorias/
- [24] GIZ, Fondo para el acompañamiento del Proceso de Paz: https://www.giz.de/en/projects/fondo-para-el-acompanamiento-del-proceso-de-paz
- [25] Suiza en Colombia: https://www.schweiz-kolumbien.eda.admin.ch/es
- [26] Ford: https://fordfoundation.org/work/our-grants/awarded-grants/grants-database/fundacion-via-libre-144665 ; https://www.financecolombia.com/ford-foundation-opens-bogota-office-colombia/ ; Luminate: https://www.luminategroup.com/portfolio/es?page=10
- [27] Social Skin 2026: https://www.elpais.com.co/economia/atencion-jovenes-emprendedores-abren-convocatoria-para-impulsar-proyectos-innovadores-ganadores-recibiran-hasta-us12000-2511.html
- [28] MinTIC / iNNpulsa: https://www.mintic.gov.co/portal/715/w3-article-433759.html ; https://www.innpulsacolombia.com/wp-content/uploads/2026/06/22062026_-Brochure-1.pdf
- [36] WPHF RRW: https://wphfund.org/es/rrw/ ; boletín Asocapitales (poco fiable): https://www.asocapitales.co/sites/default/files/2026-07/boletin-cooperacion-internacional-julio-2026_0.pdf
- [37] BID Lab / Gobernarte / GovTech: https://bogota.gov.co/boletin-oferta-internacional/concurso-gobernarte-2026-innovacion-publica-para-gobiernos-locales ; https://www.cali.gov.co/publicaciones/181270/cali-la-primera-ciudad-en-colombia-en-ser-seleccionada-por-el-bidlab-para-hacer-innovacion-abierta-de-retos-de-ciudad/
- [38] HiiL: https://thecondia.com/hiil-justice-accelerator-grant/ ; https://www.hiil.org/
- [40] AECID, BOE 14-jul-2026: https://boe.es/boe/dias/2026/07/14/pdfs/BOE-B-2026-24116.pdf

**Ecosistema legaltech**
- [39] Semana (startup de consultas desde COP 85.000): https://www.semana.com/economia/articulo/startup-colombiana-democratiza-el-acceso-a-la-justicia-para-mujeres-ofrecen-consultas-legales-virtuales-desde-85000-pesos/202459/ ; PuntoLegali (Stanford CodeX): https://techindex.law.stanford.edu/companies/puntolegali ; LegalApp (Gobierno): https://www.xataka.com.co/aplicaciones/legalapp-la-aplicacion-del-gobierno-que-asesora-juridicamente-a-los-ciudadanos
