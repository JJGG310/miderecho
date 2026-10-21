# Política de tratamiento de datos personales de MiDerecho

**Versión 1 (borrador)**, vigente desde el 21 de octubre de 2026 [validar: fecha real de publicación]. Ley 1581 de 2012 y Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).

> **Cómo se usa este archivo.** Es la versión para revisión. El mismo texto, sin las marcas `[validar]`, se ve en la app v2 (`apps/web/src/pantallas/Politica.jsx`): Perfil → «Ver la política de datos en historieta» (`#/politica`) → «Ver la política completa» (`#/politica/completa`). Las dos pantallas muestran el letrero "Borrador: falta validar con un abogado y completar la dirección del responsable". Si cambia este archivo, cambie la app, y viceversa. El aviso corto de Perfil (`AVISO` en `packages/nucleo/src/contenido.js`) resume lo mismo.
>
> **Responsable y contacto:** MiDerecho S.A.S., celular 316 807 7161 (definidos en `packages/nucleo/src/contenido.js`: `RESPONSABLE` y `CONTACTO`; la lectura en voz alta dicta el celular dígito por dígito).
>
> **Marcas.** `[dirección]` es un dato que falta llenar; la lectura en voz alta lo dice como "dato por completar". `[validar]` señala lo que debe revisar un abogado de protección de datos o lo que depende de una función que todavía no está en `main`. Lo que la v2 aún no tiene aparece en la app como "(todavía no disponible en esta versión)".
>
> **Trato.** "Usted", como el resto de la app.

Contenido mínimo del art. 13 del Decreto 1377 de 2013 y dónde está:

| Exige el art. 13 | Sección |
|---|---|
| 1. Nombre, domicilio, dirección, correo y teléfono del responsable | 1 |
| 2. Tratamiento y finalidad | 2 y 3 |
| 3. Derechos de los titulares | 7 |
| 4. Persona o área que atiende peticiones, consultas y reclamos | 9 |
| 5. Procedimiento para ejercer los derechos | 8 |
| 6. Fecha de vigencia de la política y período de vigencia de la base de datos | 13 (y plazos en 3) |

---

## 1. Quién es el responsable de sus datos

- **Responsable:** MiDerecho S.A.S. [validar: NIT]
- **Domicilio y dirección:** [dirección].
- **Celular (llamadas y mensajes):** 316 807 7161.

MiDerecho es un servicio gratuito de información y plantillas para que usted mismo entienda sus derechos y haga documentos como el derecho de petición, la tutela o el reclamo de servicios públicos.

## 2. Para qué usamos sus datos

Solo para esto:

1. Entender lo que le pasa y orientarle, con el asistente.
2. Armar el documento que usted pide.
3. Llevar la cuenta del plazo en Mis casos y guardar sus consultas en Historial.
4. Si usted lo pide (todavía no disponible en esta versión): enviar el documento por correo, recordarle el plazo por SMS, WhatsApp, llamada o aviso en el celular, o hablar con el asistente por voz. Cada una de estas funciones le pedirá un permiso aparte.

No vendemos ni prestamos sus datos, no los usamos para publicidad y no armamos perfiles de nadie.

[validar — **punto más importante**:
- Hoy la v2 **no muestra aviso ni pide autorización antes** de mandar el relato al asistente: el aviso está en Perfil. El art. 5 del Decreto 1377 pide informar y obtener la autorización a más tardar al recolectar, y el silencio no es conducta inequívoca (art. 7). Otra sesión va a agregar en Inicio un aviso con «Sí, acepto» antes del primer envío. Cuando exista, agregar aquí y en la app: "Antes de usar el asistente le pedimos permiso".
- El art. 8 pide conservar prueba de la autorización. Hoy no se conserva. La investigación (06, sección 5.2) propone guardar solo una huella cifrada (HMAC), la fecha, la versión del aviso y la respuesta.
- Los permisos aparte del punto 4 dependen de ramas que no están en `main` (correo, llamadas y notificaciones, agente de voz en la v2): revisar que cada uno nombre a la empresa y el país.]

## 3. Qué datos usamos, dónde quedan y cuánto tiempo

| Dato | Dónde queda | Cuánto tiempo | Para qué |
|---|---|---|---|
| **Lo que le cuenta al asistente** (escrito o dictado) | Sale de su celular hacia nuestro servidor y hacia la inteligencia artificial que esté activa: Claude (Anthropic) o Gemini (Google), las dos en Estados Unidos. Antes intentamos quitar cédulas, teléfonos y correos, pero el filtro no atrapa todo y no quita nombres: no los escriba en el chat. Nuestro servidor no lo guarda | La conversación se borra del celular al cerrar la app. La empresa de la inteligencia artificial puede conservarlo por un tiempo limitado, según sus condiciones [validar: según los términos comerciales de Anthropic, las entradas y salidas de la API se borran a los 30 días salvo excepciones de seguridad; confirmar la cifra vigente y pedir retención cero. Gemini, plan de pago: Google lo registra "por un tiempo limitado" solo para detectar abusos, sin cifra publicada, y lo guarda hasta 24 horas en memoria (caché); confirmar por escrito. Plan gratis: Google lo usa para mejorar sus productos y puede revisarlo una persona; solo para pruebas y con aviso. Ver docs/ia.md] | Entender su caso y orientarle |
| **Su nombre, su cédula, dónde recibir la respuesta y su celular**, que se piden al crear el documento | Solo en la memoria del celular mientras arma el documento, e impresos en el papel. No van a la inteligencia artificial ni al servidor. También puede dejarlos en blanco y llenarlos a mano | No se guardan | Que el documento sea válido (Ley 1755, art. 16) |
| **Lo que escribe en el formulario del documento**, como lo que pasó o lo de su salud | Va en el documento | La app no guarda ese texto | Escribir el documento |
| **Mis casos**: tipo de documento, entidad, municipio y vereda, lo que pidió, fechas del plazo y en qué va | En este celular. Si otras personas usan su celular, póngale clave o bórrelos en Perfil | Hasta que usted los borre | Seguimiento del plazo |
| **Historial**: el tema de cada consulta, aunque sea de salud, el derecho, el documento sugerido, los pasos y a dónde acudir (las últimas 30) | En este celular | Hasta que usted los borre | Consultarlo sin internet |
| **Preferencias**: leer en voz alta, modo sin conexión | En este celular | Hasta que usted las borre | Recordar cómo usa la app |
| **Si pide recordatorios** (todavía no disponible): número de celular, código del caso, canal y fechas | En nuestro servidor (Upstash), el número cifrado | Se borra 3 días después del último recordatorio. Para frenar abusos, una huella cifrada del número (HMAC, no el número) dura hasta 370 días | Enviarle los recordatorios |
| **Si pide que enviemos el documento por correo** (todavía no disponible): el documento con su nombre y su cédula | Pasa por nuestro servidor y por Resend, en Estados Unidos, hasta la entidad | No guardamos copia [validar con la rama de correo: qué guarda Resend y cuánto tiempo, y cómo se reenvía y se borra la respuesta de la entidad que llega al buzón del servicio] | Enviarlo sin que usted viaje |
| **Registros técnicos** | Si algo falla, el servidor anota el tipo de error, sin lo que usted escribió. El servicio que aloja la app ve la dirección de internet (IP) de su celular, como cualquier página web | Según el proveedor [validar: retención de registros de Vercel] | Arreglar fallas y evitar abusos |

[validar:
- **Clave.** Hoy Mis casos, Historial y preferencias quedan sin cifrar; otra sesión va a cifrarlos con una clave de la app. El texto ("póngale clave o bórrelos en Perfil") es cierto antes y después.
- **La vereda.** La v2 guarda la vereda en Mis casos; el prototipo no la guardaba porque, junto con la entidad, puede identificar a la persona en un celular compartido. Recomendación: no guardarla.
- **El tema de la consulta** en Historial lo escribe la IA (ej.: "Cita con cardiólogo negada por la EPS") y puede revelar salud. Valorar si se guarda solo el derecho y la ruta.
- La huella de 370 días es el índice `num:` de `prototipo/api/recordatorios.js`, que limita a 3 casos por número; confirmar si hace falta tanto tiempo.]

## 4. Lo que no guardamos

- La conversación con el asistente.
- Su nombre, su cédula, su celular ni su dirección.
- Su voz.
- Listas de usuarios o de contactos.

Ojo: Mis casos y el Historial sí pueden mostrar el tema de su caso, incluso si es de salud (punto 3).

Si guarda o imprime el documento en PDF, ese archivo es suyo y queda donde lo guarde: cuídelo.

## 5. Otras empresas y otros países

Para algunas funciones usamos empresas que tratan datos por encargo nuestro. Varias están en Estados Unidos:

| Función | Empresa | País | Qué recibe | Cuándo |
|---|---|---|---|---|
| **Asistente** | Claude (Anthropic) o Gemini (Google), según el que esté activo | Estados Unidos | Lo que usted le cuenta, después del filtro (sin cédulas, teléfonos ni correos cuando el filtro los encuentra; con los nombres que escriba) | Siempre que le escribe al asistente con internet. Sin clave de IA, o si la IA falla, responde un "modo básico" con reglas que no sale de nuestro servidor. Si en una prueba se usa la versión gratuita de Gemini, cada respuesta lo avisa: Google puede usar lo que se escriba para mejorar sus productos |
| **Dictar con el micrófono** | El servicio de dictado de su navegador (en Android, Google) | Estados Unidos | Su voz mientras dicta | Solo si toca el micrófono |
| **Alojamiento de la app y del servidor** | Vercel | Estados Unidos | La dirección IP y lo que pasa por el servidor | Siempre que usa la app con internet |

Solo cuando usted lo pida (todavía no disponible en esta versión):

| Función | Empresa | País | Qué recibe |
|---|---|---|---|
| **Asistente de voz** | ElevenLabs y el modelo Gemini, de Google | Estados Unidos [validar: región de procesamiento] | Su voz y lo que diga [validar con la sesión de voz en la v2: si también recibe el texto de la pantalla, y que el agente no guarde audio ni transcripciones] |
| **SMS, WhatsApp y llamadas** | Twilio; WhatsApp es de Meta | Estados Unidos | Su número, el código del caso, la fecha y un texto fijo |
| **Envío del documento por correo** | Resend | Estados Unidos [validar] | El documento completo, con su nombre y su cédula, y el correo de la entidad |
| **Avisos en el celular** | El servicio de avisos de su navegador: Google, Apple o Mozilla | Estados Unidos | El código del caso, la fecha y un texto fijo [validar con la sesión de notificaciones: que el contenido vaya cifrado y no lleve más que eso] |
| **Recordatorios guardados** | Upstash | [validar: región configurada] | Su número cifrado, el código del caso, el canal y las fechas |

Estas empresas solo deben usar sus datos para prestar ese servicio.

[validar:
- Si cada empresa es **encargado** (transmisión, arts. 24 y 25 del Decreto 1377: exige un contrato con su contenido mínimo) o **responsable independiente** (transferencia, art. 26 de la Ley 1581).
- Si Estados Unidos figura entre los países con nivel adecuado de protección según la SIC (Circular Externa 005 de 2017). Si no, la transferencia necesita autorización expresa e inequívoca, lo que refuerza el punto de la sección 2.
- Firmar o aceptar el contrato de transmisión (DPA) de cada proveedor antes del piloto.
- La investigación (06, sección 1.5) recomendaba no mandar texto libre a un LLM de terceros. La v2 sí lo hace, con un filtro que no atrapa todo. Documentarlo en el estudio de impacto de privacidad (Circular SIC 002 de 2024, lineamiento IV).]

## 6. Datos delicados (sensibles) y datos de niños

La ley llama **datos sensibles** a los de salud, origen étnico, religión, ideas políticas, pertenencia a sindicatos u organizaciones sociales o de derechos humanos, vida sexual y los biométricos (como la huella o la cara). También tratamos con ese cuidado si usted es víctima.

- Contarnos esos temas es **opcional**: no tiene que hacerlo y la app funciona igual.
- En la tutela de salud sí hay que contar el problema de salud: va en el documento. En Mis casos queda que es una tutela de salud y a qué EPS va.
- Si le cuenta al asistente algo de su salud, le llega a la inteligencia artificial (Claude o Gemini) después del filtro. No guardamos la conversación, pero el tema de la consulta puede quedar en el Historial.
- No usamos su voz para reconocerle ni para identificar a nadie.
- Si el caso es de un niño, niña o adolescente, la persona adulta escribe sus datos solo en el documento, y la app no los guarda.

[validar:
- El relato al asistente puede traer datos de salud, de la condición de víctima o de pertenencia a una organización: es tratamiento de datos sensibles que necesita la autorización explícita del art. 6 de la Ley 1581 (ver sección 2).
- Si basta la autorización general para los datos de salud del formulario de la tutela de salud, o si hace falta una casilla aparte.
- Alcance del art. 7 de la Ley 1581 y del art. 12 del Decreto 1377 para los datos de menores que solo viven en memoria y en el documento.]

## 7. Sus derechos

Sobre sus datos, usted tiene derecho a (Ley 1581, art. 8):

- **Conocer** qué datos suyos tenemos y cómo los usamos.
- **Corregir** o actualizar sus datos.
- **Borrar** sus datos, cuando no haya un deber legal de conservarlos.
- **Retirar su autorización** (revocarla) en cualquier momento.
- **Pedir prueba** de la autorización que nos dio. [validar: ver la nota de la sección 2]
- **Quejarse ante la Superintendencia de Industria y Comercio (SIC)**, la entidad del Estado que vigila que se cuiden los datos personales, si no respetamos sus derechos.

Todo esto es gratis.

## 8. Cómo ejercer sus derechos

**En su celular, de inmediato:**

- En **Perfil**, toque **«Borrar todo de este celular»**: se borran sus casos, su historial y sus preferencias. Eso borra lo que hay en este celular, no lo que tengan otras empresas.
- En **Historial** puede borrar sus consultas, y en **Mis casos**, cada caso.

[validar: cuando haya recordatorios en la v2, «Borrar todo» y borrar un caso deben cancelarlos en el servidor, como en el prototipo.]

**Llamando o escribiendo al 316 807 7161:** cuéntenos qué quiere (conocer, corregir, borrar, retirar la autorización o reclamar). Si es sobre recordatorios, dé el código del caso y el número de celular. No necesita mandar su cédula. [validar: el art. 20 del Decreto 1377 pide acreditar la identidad; como no guardamos nombre ni cédula, proponemos que baste el código del caso y el número que recibe los recordatorios]

- **Consultas** (conocer sus datos): le respondemos en máximo 10 días hábiles. Si no alcanzamos, le avisamos y respondemos en máximo 5 días hábiles más (Ley 1581, art. 14).
- **Reclamos** (corregir, borrar, retirar la autorización o quejarse de un incumplimiento): le respondemos en máximo 15 días hábiles. Si no alcanzamos, le avisamos y respondemos en máximo 8 días hábiles más. Si falta información, se la pedimos dentro de los 5 días siguientes; si pasan 2 meses sin que la envíe, entendemos que desistió (Ley 1581, art. 15). [validar: que los plazos y la regla de desistimiento estén citados al día]
- **Días hábiles** son los de lunes a viernes, sin contar festivos.

**Ante la SIC:** si no le respondimos o no está de acuerdo, puede quejarse ante la Superintendencia de Industria y Comercio, en www.sic.gov.co. Primero debe hacer la consulta o el reclamo ante nosotros (Ley 1581, art. 16). [validar: agregar las líneas de atención vigentes de la SIC]

## 9. Quién atiende sus peticiones

El área de protección de datos de MiDerecho S.A.S., en el celular 316 807 7161. Atiende consultas, reclamos y pedidos para conocer, corregir o borrar sus datos y para retirar la autorización (Decreto 1377, art. 23). [validar: nombrar a la persona o el área y su correo]

## 10. Cómo cuidamos sus datos

- Antes de que su relato llegue a la inteligencia artificial, intentamos quitar cédulas, teléfonos y correos en el celular y otra vez en el servidor. El filtro no atrapa todo y no quita nombres.
- El servidor no guarda conversaciones, nombres ni cédulas.
- La conexión con el servidor va cifrada (HTTPS).
- Lo que queda en este celular se puede proteger: póngale clave o bórrelo en Perfil.
- Para leer en voz alta usamos, si las hay, las voces del propio celular, que no mandan el texto a internet.
- Los SMS no van cifrados: por eso solo llevarán el código del caso y la fecha.
- No podemos borrar los mensajes que ya le llegaron ni evitar capturas de pantalla. Bórrelos usted si comparte el celular.
- **Nunca le pediremos su cédula** por WhatsApp, SMS o llamada. Si alguien se la pide a nombre de MiDerecho, no la dé.

Detalle técnico: el filtro (`packages/nucleo/src/privacidad.js`) reemplaza correos, números largos con o sin puntos (cédulas) y celulares colombianos por `[correo]`, `[número]` y `[teléfono]`; no reconoce nombres, direcciones, veredas ni cédulas escritas de otras formas. El servidor (`apps/api`) acepta como máximo 12 mensajes de 2.000 caracteres y vuelve a aplicar el filtro. La lectura en voz alta (`apps/web/src/lib/voz.js`) prefiere las voces con `localService`. Los números de recordatorios se cifran con AES-256-GCM y se buscan con HMAC-SHA-256 (`prototipo/api/_comun.js`). [validar: plan de incidentes de seguridad y si hay deber de reportarlos a la SIC]

## 11. Si hay peligro

Si usted cuenta que alguien está en peligro o que le han amenazado, la app deja de preguntar, no guarda nada y le muestra a dónde acudir. Cuando reconoce palabras de amenaza, ese mensaje no se envía a la inteligencia artificial.

- Si hay peligro ahora, llame al **123**.
- La **Personería** de su municipio o la **Defensoría del Pueblo** pueden activar rutas de protección.
- **Programa Somos Defensores**: proteccion@somosdefensores.org.

[validar: las palabras que activan el protocolo (`hayRiesgo` en `privacidad.js`) las revisa el servidor antes de llamar a la IA; si la amenaza se cuenta con otras palabras, el mensaje sí llega a la IA activa (Claude o Gemini), que puede responder con el protocolo; si Gemini lo bloquea por seguridad, la app también activa el protocolo. Confirmar rutas y líneas con las organizaciones aliadas antes del piloto.]

## 12. No somos abogados

MiDerecho da información general y plantillas. No somos abogados ni reemplazamos a uno, y no prometemos resultados. Para un consejo sobre su caso, la Personería y los consultorios jurídicos de las universidades atienden gratis.

## 13. Vigencia y cambios

Versión 1, vigente desde el 21 de octubre de 2026, mientras MiDerecho funcione. Sus datos se guardan solo el tiempo que dice el punto 3. Si cambiamos esta política, le avisaremos en la app antes de que el cambio empiece a regir.

[validar: fecha de vigencia y período de vigencia de la base de datos (art. 13, num. 6, del Decreto 1377); si aplica el Registro Nacional de Bases de Datos (normalmente no, salvo activos superiores a 100.000 UVT o un aliado público)]

---

## Anexo: la historieta

Diez viñetas con el asistente (un globo de diálogo del mismo color que sus respuestas en el chat) y doña Rosa, campesina, más tres preguntas de comprensión. Cada viñeta es una pantalla con barra verde numerada, como las historietas del Figma, y el texto va aparte del dibujo (texto real, globos de 90 caracteres o menos). Se avanza con botones grandes, con las flechas del teclado o deslizando el dedo; «Escuchar» lee la viñeta y el asistente mueve la boca; si la persona activó «Leer en voz alta» en Perfil, cada viñeta se lee sola. «Salir», Escape o la flecha de volver regresan a la pantalla anterior. La pantalla se descarga solo cuando se abre (`lazy`), y el service worker la guarda para usarla sin internet.

| # | Viñeta | Lo que dice | Sección |
|---|---|---|---|
| 1 | ¿Quién cuida sus datos? | El asistente es una máquina; responde MiDerecho S.A.S.; llamar o escribir al 316 807 7161 | 1 |
| 2 | ¿Para qué usamos sus datos? | Entender lo que pasa, armar el documento, recordar el plazo; no se venden ni hay publicidad | 2 |
| 3 | Lo que no guardamos | La conversación; nombre y cédula del documento no se guardan ni van a la IA, solo van en el papel: no escribirlos en el chat; el PDF es suyo | 3, 4 |
| 4 | Lo que queda en su celular | Casos (entidad, municipio, vereda, fechas) y el tema de cada consulta, aunque sea de salud; póngale clave o bórrelo en Perfil | 3, 10 |
| — | Pregunta 1 | Si otra persona usa su celular, ¿puede ver sus casos? → Sí, si no tiene clave | 3 |
| 5 | El asistente y otras empresas | Claude (Anthropic) o Gemini (Google), en EE. UU., lee lo que cuenta; el filtro intenta quitar cédulas, teléfonos y correos pero no atrapa todo: no escribir nombres, cédulas ni direcciones; voz, mensajes y correo, cuando existan, solo si usted lo pide | 5 |
| — | Pregunta 2 | ¿Qué le quitamos a su relato? → Cédulas, teléfonos y correos, cuando el filtro los encuentra (no "todo, también los nombres") | 5, 10 |
| 6 | Lo delicado es opcional | No tiene que contar si es víctima, su etnia, religión, ideas ni organización; en la tutela de salud, lo de salud va en el documento | 6 |
| 7 | Sus derechos | Conocer, corregir, borrar, retirar el permiso, quejarse ante la SIC (explicada en una frase); gratis | 7 |
| 8 | ¿Cómo los hace valer? | «Borrar todo de este celular» en Perfil, que no borra lo de otras empresas; llamar o escribir al 316 807 7161; 10 días hábiles o 15 si es reclamo (explica "días hábiles"); si no responden, la SIC | 8 |
| — | Pregunta 3 | Para borrar lo que quedó en este celular, ¿qué hace? → «Borrar todo» en Perfil | 8 |
| 9 | Si hay peligro | La app deja de preguntar, no guarda y dice a dónde acudir; 123, Personería, Defensoría | 11 |
| 10 | No somos abogados | Información y plantillas; Personería y consultorios jurídicos gratis | 12 |

Fuentes del marco legal: `investigacion/06-marco-legal-seguridad.md` (secciones 1, 4.4, 5.6 y 6). Principios de diseño: `investigacion/05-formato-canales-adopcion.md` (sección 4) y el contrato ilustrado de Sudáfrica en `investigacion/02-competidores-mundo.md` (sección 2.21): el texto completo es el que vale, y los dibujos no pueden contradecirlo.
