# Política de tratamiento de datos personales de MiDerecho

**Versión 1 (borrador)**, vigente desde el 21 de octubre de 2026 [validar: fecha real de publicación]. Ley 1581 de 2012 y Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).

> **Cómo se usa este archivo.** Es la versión para revisión. El mismo texto, sin las marcas `[validar]`, se ve en la app v2 (`apps/web/src/pantallas/Politica.jsx`): Perfil → «Ver la política de datos en historieta» (`#/politica`) → «Ver la política completa» (`#/politica/completa`). Si cambia uno, cambie el otro. La historieta de 10 viñetas resume esta política y no dice nada que no esté aquí (ver el anexo).
>
> **Marcas.** `[Organización]`, `[dirección]`, `[contacto]` y `[área de protección de datos]` son datos que debe llenar el responsable. `[validar]` señala lo que debe revisar un abogado de protección de datos o lo que depende de una función que todavía no está en `main`.
>
> **Tuteo.** El texto usa "tú", como el Figma y el asistente de la v2. El README deja pendiente unificar "tú" y "usted".

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

## 1. Quién es el responsable de tus datos

- **Responsable:** [Organización]. [validar: razón social y NIT]
- **Domicilio y dirección:** [dirección].
- **Correo y teléfono:** [contacto].

MiDerecho es un servicio gratuito de información y plantillas para que tú mismo entiendas tus derechos y hagas documentos como el derecho de petición, la tutela o el reclamo de servicios públicos.

## 2. Para qué usamos tus datos

Solo para esto:

1. Entender lo que te pasa y orientarte, con el asistente.
2. Armar el documento que pides.
3. Llevar la cuenta del plazo en Mis casos y guardar tus consultas en Historial.
4. Si tú lo pides: enviar el documento por correo, recordarte el plazo por SMS, WhatsApp, llamada o aviso en el celular, o hablar con el asistente por voz.

No vendemos ni prestamos tus datos, no los usamos para publicidad y no armamos perfiles de nadie.

Cuando le cuentas tu caso al asistente o creas un documento, aceptas que usemos tus datos para esto. Para el correo, los recordatorios y la voz te pedimos un permiso aparte.

[validar — **punto más importante**:
- Hoy la v2 **no muestra ningún aviso ni pide autorización antes** de mandar el relato al asistente: el aviso de privacidad solo está en Perfil, y la pantalla del asistente dice "Antes de enviar, quitamos cédulas, teléfonos y correos" cuando el relato ya salió. El art. 5 del Decreto 1377 pide informar y obtener la autorización a más tardar al recolectar, y el silencio no es conducta inequívoca (art. 7). Propuesta: un aviso corto en Inicio, antes del primer envío, con "Sí, acepto" (como el prototipo) y enlace a esta historieta.
- El art. 8 pide conservar prueba de la autorización. Hoy no se conserva. La investigación (06, sección 5.2) propone guardar solo una huella cifrada (HMAC), la fecha, la versión del aviso y la respuesta.
- Los permisos aparte del correo, los recordatorios y la voz dependen de ramas que no están en `main` (correo, llamadas y notificaciones, agente de voz en la v2): revisar que cada uno nombre a la empresa y el país.]

## 3. Qué datos usamos, dónde quedan y cuánto tiempo

| Dato | Dónde queda | Cuánto tiempo | Para qué |
|---|---|---|---|
| **Lo que le cuentas al asistente** (escrito o dictado) | Sale de tu celular hacia nuestro servidor y hacia Claude, la inteligencia artificial de Anthropic, sin cédulas, teléfonos ni correos. Nuestro servidor no lo guarda | La conversación se borra al cerrar la app [validar: cuánto retiene Anthropic las entradas y salidas de la API y si se firma retención cero] | Entender tu caso y orientarte |
| **Tu nombre, tu cédula, dónde recibir la respuesta y tu celular** (paso «Tus datos para el documento») | Solo en la memoria del celular mientras armas el documento, e impresos en el papel. No van a la inteligencia artificial ni al servidor. También puedes dejarlos en blanco y llenarlos a mano | No se guardan | Que el documento sea válido (Ley 1755, art. 16) |
| **Lo que escribes en el formulario del documento**, como lo que pasó o lo de tu salud | Solo en el documento | No se guarda | Escribir el documento |
| **Mis casos**: tipo de documento, entidad, municipio y vereda, lo que pediste, fechas del plazo y en qué va | En tu celular, **por ahora sin clave** | Hasta que lo borres | Seguimiento del plazo |
| **Historial**: título corto de cada consulta, derecho, documento sugerido, pasos y a dónde acudir (las últimas 30) | En tu celular, por ahora sin clave | Hasta que lo borres | Consultarlo sin internet |
| **Preferencias**: leer en voz alta, modo sin conexión | En tu celular | Hasta que lo borres | Recordar cómo usas la app |
| **Si pides recordatorios**: número de celular, código del caso, canal y fechas | En nuestro servidor, el número cifrado | Se borra solo 3 días después del último recordatorio | Enviarte los recordatorios |
| **Si pides que enviemos el documento por correo**: el documento con tu nombre y tu cédula | Pasa por nuestro servidor y por el servicio de correo hasta la entidad | No guardamos copia [validar con la rama de correo: qué guarda Resend y cuánto tiempo, y cómo se reenvía y se borra la respuesta de la entidad que llega al buzón del servicio] | Enviarlo sin que viajes |
| **Registros técnicos** | Si algo falla, el servidor anota el tipo de error, sin lo que escribiste. El servicio que aloja la app ve la dirección de internet (IP) de tu celular, como cualquier página web | Según el proveedor [validar: retención de registros de Vercel] | Arreglar fallas y evitar abusos |

[validar:
- **Sin clave.** La v2 guarda Mis casos, Historial y preferencias en el celular sin cifrar y sin clave (el prototipo los cifraba con una clave de 4 números). La revisión visual de la v2 ya propone volver a pedir la clave. Si se agrega, cambiar las secciones 3 y 10 y la viñeta 4.
- **La vereda.** La v2 guarda la vereda en Mis casos; el prototipo no la guardaba porque, junto con la entidad, puede identificar a la persona en un celular compartido. Recomendación: no guardarla.
- **El título de la consulta** en Historial lo escribe la IA (ej.: "Cita con cardiólogo negada por la EPS") y puede revelar un tema de salud. Valorar si se guarda solo el derecho y la ruta.
- Las filas de recordatorios y correo describen funciones que hoy están en `prototipo/api/` o en ramas sin integrar: confirmar que la v2 las use igual.]

## 4. Lo que no guardamos

- Tu relato ni la conversación con el asistente.
- Tu nombre, tu cédula, tu celular ni tu dirección.
- Lo que cuentes de tu salud.
- Tu voz.
- Listas de usuarios o de contactos.

Si guardas o imprimes el documento en PDF, ese archivo es tuyo y queda donde lo guardes: cuídalo.

## 5. Otras empresas y otros países

Para algunas funciones usamos empresas que tratan datos por encargo nuestro. Varias están en otros países, como Estados Unidos:

| Función | Empresa | País | Qué recibe | Cuándo |
|---|---|---|---|---|
| **Asistente** | Claude, de Anthropic | Estados Unidos | Lo que le cuentas, sin cédulas, teléfonos ni correos. **El filtro no quita nombres**: no escribas nombres de otras personas | Siempre que le escribes al asistente con internet. Sin clave de Anthropic, o si la IA falla, responde un "modo básico" con reglas que no sale de nuestro servidor |
| **Dictar con el micrófono** | El servicio de dictado de tu navegador (en Android, Google) | Estados Unidos | Lo que dictas | Solo si tocas el micrófono |
| **Alojamiento de la app y del servidor** | Vercel | Estados Unidos | La dirección IP y lo que pasa por el servidor | Siempre que usas la app con internet |

Y solo cuando tú lo pides:

| Función | Empresa | País | Qué recibe |
|---|---|---|---|
| **Asistente de voz** | ElevenLabs y el modelo Gemini, de Google | Estados Unidos [validar: región de procesamiento] | Tu voz y lo que digas [validar con la sesión de voz en la v2: si también recibe el texto de la pantalla, y que el agente no guarde audio ni transcripciones] |
| **SMS, WhatsApp y llamadas** | Twilio; WhatsApp es de Meta | Estados Unidos | Número de celular, código del caso, fecha y un texto fijo |
| **Envío del documento por correo** | Resend | Estados Unidos [validar] | El documento completo y el correo de la entidad |
| **Avisos en el celular** | El servicio de avisos de tu navegador: Google, Apple o Mozilla | Estados Unidos | Código del caso, fecha y un texto fijo [validar con la sesión de notificaciones: que el contenido vaya cifrado y no lleve más que eso] |

Estas empresas solo deben usar tus datos para prestar ese servicio.

[validar:
- Si cada empresa es **encargado** (transmisión, arts. 24 y 25 del Decreto 1377: exige un contrato con su contenido mínimo) o **responsable independiente** (transferencia, art. 26 de la Ley 1581).
- Si Estados Unidos figura entre los países con nivel adecuado de protección según la SIC (Circular Externa 005 de 2017). Si no, la transferencia necesita autorización expresa e inequívoca, lo que refuerza el punto de la sección 2: hoy no hay aviso antes de mandar el relato a Anthropic.
- Firmar o aceptar el contrato de transmisión (DPA) de cada proveedor antes del piloto.
- La investigación (06, sección 1.5) recomendaba no mandar texto libre a un LLM de terceros. La v2 sí lo hace, con el filtro de cédulas, teléfonos y correos. Documentarlo en el estudio de impacto de privacidad (Circular SIC 002 de 2024, lineamiento IV).]

## 6. Datos delicados (sensibles) y datos de niños

La ley llama **datos sensibles** a los de salud, origen étnico, religión, ideas políticas, pertenencia a sindicatos u organizaciones sociales o de derechos humanos, vida sexual y los biométricos (como la huella o la cara). También tratamos con ese cuidado si eres víctima.

- Contarnos esos temas es **opcional**: no tienes que hacerlo y la app funciona igual.
- En la tutela de salud sí hay que contar el problema de salud. Eso solo va en el documento y no se guarda.
- Si le cuentas al asistente algo de tu salud, le llega a Claude sin cédulas, teléfonos ni correos, y no lo guardamos.
- No usamos tu voz para reconocerte ni para identificar a nadie.
- Si el caso es de un niño, niña o adolescente, la persona adulta escribe sus datos solo en el documento, y la app no los guarda.

[validar:
- Que el relato al asistente puede traer datos de salud, de la condición de víctima o de pertenencia a una organización: es tratamiento de datos sensibles sin la autorización explícita del art. 6 de la Ley 1581 (ver sección 2).
- Si basta la autorización general para los datos de salud del formulario de la tutela de salud, o si hace falta una casilla aparte.
- Alcance del art. 7 de la Ley 1581 y del art. 12 del Decreto 1377 para los datos de menores que solo viven en memoria y en el documento.]

## 7. Tus derechos

Sobre tus datos, tienes derecho a (Ley 1581, art. 8):

- **Conocer** qué datos tuyos tenemos y cómo los usamos.
- **Corregir** o actualizar tus datos.
- **Borrar** tus datos, cuando no haya un deber legal de conservarlos.
- **Retirar tu autorización** (revocarla) en cualquier momento.
- **Pedir prueba** de la autorización que nos diste. [validar: ver la nota de la sección 2]
- **Quejarte ante la Superintendencia de Industria y Comercio (SIC)** si no respetamos tus derechos.

Todo esto es gratis.

## 8. Cómo ejercer tus derechos

**En tu celular, de inmediato:**

- En **Perfil**, toca **«Borrar todo de este celular»**: se borran tus casos, tu historial y tus preferencias.
- En **Historial** puedes borrar tus consultas, y en **Mis casos**, cada caso.

[validar: cuando haya recordatorios en la v2, «Borrar todo» y borrar un caso deben cancelarlos en el servidor, como en el prototipo.]

**Escribiéndonos a [contacto]:** cuéntanos qué quieres (conocer, corregir, borrar, retirar la autorización o reclamar). Si es sobre recordatorios, da el código del caso y el número de celular. No necesitas mandar tu cédula. [validar: el art. 20 del Decreto 1377 pide acreditar la identidad; como no guardamos nombre ni cédula, proponemos que baste el código del caso y el número que recibe los recordatorios]

- **Consultas** (conocer tus datos): te respondemos en máximo 10 días hábiles. Si no alcanzamos, te avisamos y respondemos en máximo 5 días hábiles más (Ley 1581, art. 14).
- **Reclamos** (corregir, borrar, retirar la autorización o quejarte de un incumplimiento): te respondemos en máximo 15 días hábiles. Si no alcanzamos, te avisamos y respondemos en máximo 8 días hábiles más. Si falta información, te la pedimos dentro de los 5 días siguientes; si pasan 2 meses sin que la envíes, entendemos que desististe (Ley 1581, art. 15). [validar: que los plazos y la regla de desistimiento estén citados al día]

**Ante la SIC:** si no te respondimos o no estás de acuerdo, puedes quejarte ante la Superintendencia de Industria y Comercio, en www.sic.gov.co. Primero debes hacer la consulta o el reclamo ante nosotros (Ley 1581, art. 16). [validar: agregar las líneas de atención vigentes de la SIC]

## 9. Quién atiende tus peticiones

El [área de protección de datos] de [Organización], en [contacto]. Atiende consultas, reclamos y pedidos para conocer, corregir o borrar tus datos y para retirar la autorización (Decreto 1377, art. 23). [validar: nombrar a la persona o el área y su correo]

## 10. Cómo cuidamos tus datos

- Quitamos cédulas, teléfonos y correos de tu relato en el celular, y otra vez en el servidor, antes de que llegue a la inteligencia artificial.
- El servidor no guarda conversaciones, nombres ni cédulas.
- La conexión con el servidor va cifrada (HTTPS).
- Lo que queda en el celular por ahora no tiene clave. Por eso no guardamos nada sensible, y si compartes el celular puedes borrarlo en Perfil.
- Los SMS no van cifrados: por eso solo llevan el código del caso y la fecha.
- No podemos borrar los mensajes que ya te llegaron ni evitar capturas de pantalla. Bórralos tú si compartes el celular.
- **Nunca te pediremos tu cédula** por WhatsApp, SMS o llamada. Si alguien te la pide a nombre de MiDerecho, no la des.

Detalle técnico: el filtro (`packages/nucleo/src/privacidad.js`) reemplaza correos, números largos con o sin puntos (cédulas) y celulares colombianos por `[correo]`, `[número]` y `[teléfono]`; no reconoce nombres, direcciones ni veredas. El servidor (`apps/api`) acepta como máximo 12 mensajes de 2.000 caracteres y vuelve a aplicar el filtro. Los números de recordatorios se cifran con AES-256-GCM y se buscan con HMAC-SHA-256 (`prototipo/api/_comun.js`). [validar: plan de incidentes de seguridad y si hay deber de reportarlos a la SIC]

## 11. Si hay peligro

Si cuentas que alguien está en peligro o que te han amenazado, la app deja de preguntar, no guarda nada y te muestra a dónde acudir. Cuando reconoce palabras de amenaza, ese mensaje no se envía a la inteligencia artificial.

- Si hay peligro ahora, llama al **123**.
- La **Personería** de tu municipio o la **Defensoría del Pueblo** pueden activar rutas de protección.
- **Programa Somos Defensores**: proteccion@somosdefensores.org.

[validar: las palabras que activan el protocolo (`hayRiesgo` en `privacidad.js`) las revisa el servidor antes de llamar a la IA; si la amenaza se cuenta con otras palabras, el mensaje sí llega a Claude, que puede responder con el protocolo. Confirmar rutas y líneas con las organizaciones aliadas antes del piloto.]

## 12. No somos abogados

MiDerecho da información general y plantillas. No somos abogados ni reemplazamos a uno, y no prometemos resultados. Para un consejo sobre tu caso, la Personería y los consultorios jurídicos de las universidades atienden gratis.

## 13. Vigencia y cambios

Versión 1, vigente desde el 21 de octubre de 2026, mientras MiDerecho funcione. Tus datos se guardan solo el tiempo que dice el punto 3. Si cambiamos esta política, te lo avisaremos en la app antes de que el cambio empiece a regir.

[validar: fecha de vigencia y período de vigencia de la base de datos (art. 13, num. 6, del Decreto 1377); si aplica el Registro Nacional de Bases de Datos (normalmente no, salvo activos superiores a 100.000 UVT o un aliado público)]

---

## Anexo: la historieta

Diez viñetas con el asistente (un globo de diálogo del mismo color que sus respuestas en el chat) y doña Rosa, campesina, más tres preguntas de comprensión. Cada viñeta es una pantalla con barra verde numerada, como las historietas del Figma, y el texto va aparte del dibujo (texto real, no imagen). Se avanza con botones grandes, con las flechas del teclado o deslizando el dedo; «Escuchar» lee la viñeta y el asistente mueve la boca; si la persona activó «Leer en voz alta» en Perfil, cada viñeta se lee sola. Escape o la flecha de volver regresan a la pantalla anterior.

| # | Viñeta | Lo que dice | Sección |
|---|---|---|---|
| 1 | ¿Quién cuida tus datos? | El asistente es una máquina; responde [Organización], escribir a [contacto] | 1 |
| 2 | ¿Para qué usamos tus datos? | Entender lo que pasa, armar el documento, recordar el plazo; no se venden ni hay publicidad | 2 |
| 3 | Lo que no guardamos | Relato, nombre, cédula y salud no se guardan; nombre y cédula solo van en el papel, no a la IA; el PDF es tuyo | 3, 4 |
| — | Pregunta 1 | ¿MiDerecho guarda tu cédula? → No | 4 |
| 4 | Lo que sí queda en tu celular | Casos (entidad, municipio, vereda, lo pedido, fechas) y tema de cada consulta; hoy sin clave; se borra en Perfil | 3, 10 |
| 5 | El asistente y otras empresas | Claude, de Anthropic (EE. UU.), recibe lo que cuentas sin cédulas, teléfonos ni correos; los nombres no se quitan; voz, mensajes y correo solo cuando tú lo pides | 5 |
| — | Pregunta 2 | ¿Qué le quitamos a tu relato? → Cédulas, teléfonos y correos (los nombres no) | 5 |
| 6 | Lo delicado es opcional | No tienes que contar si eres víctima, tu etnia, religión, ideas ni organización; en la tutela de salud, lo de salud solo va en el documento | 6 |
| 7 | Tus derechos | Conocer, corregir, borrar, retirar el permiso, quejarte ante la SIC; gratis | 7 |
| 8 | ¿Cómo los haces valer? | «Borrar todo de este celular» en Perfil; escribir a [contacto]; 10 días hábiles o 15 si es reclamo; si no responden, la SIC | 8 |
| — | Pregunta 3 | Si quieres que borremos todo, ¿qué haces? → «Borrar todo» en Perfil | 8 |
| 9 | Si hay peligro | La app deja de preguntar, no guarda y muestra a dónde acudir; 123, Personería, Defensoría | 11 |
| 10 | No somos abogados | Información y plantillas; Personería y consultorios jurídicos gratis | 12 |

Fuentes del marco legal: `investigacion/06-marco-legal-seguridad.md` (secciones 1, 4.4, 5.6 y 6). Principios de diseño: `investigacion/05-formato-canales-adopcion.md` (sección 4) y el contrato ilustrado de Sudáfrica en `investigacion/02-competidores-mundo.md` (sección 2.21): el texto completo es el que vale, y los dibujos no pueden contradecirlo.
