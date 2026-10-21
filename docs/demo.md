# Demo de MiDerecho (2 a 3 minutos)

Dos formas de mostrarla:

- **Rápida:** en Inicio, tocar **Ver un caso de ejemplo**. Carga en Mis casos dos peticiones inventadas, marcadas "Ejemplo": una vence en 2 días hábiles y otra ya venció sin respuesta y ofrece la tutela.
- **Completa, a mano:** contar el caso, hacer el derecho de petición con los datos de abajo, anotarlo, y luego la tutela desde el caso de ejemplo vencido.

Todos los datos son inventados. No use datos reales: la IA está en un plan gratuito.

## Antes de empezar

- App: https://miderecho-two.vercel.app (o local: `npm run dev:api` y `npm run dev:web`).
- Celular, o el navegador a tamaño de celular. Chrome si va a mostrar el dictado por voz (necesita internet).
- Sin claves de IA en el servidor, el asistente usa el **modo básico** (reglas por palabras): el relato de abajo funciona igual.
- Para mostrar "sin internet" o adelantar el calendario, abra la app con `?demo=1` (por ejemplo `https://miderecho-two.vercel.app/?demo=1`).
- Antes de la demo: Perfil → **Borrar todo**, para empezar limpio.

## Datos para copiar

| Campo | Valor |
|---|---|
| Relato (Inicio) | El camino de la vereda La Esperanza está dañado desde hace tres meses. Los niños no pueden llegar a la escuela y no podemos sacar la cosecha. |
| Sobre qué es | Vías y caminos (viene marcado con ✓) |
| Qué pide | ✓ Reparar la vía o el camino de la vereda. (viene marcada) · marcar también: Informar una fecha concreta para la solución. |
| Municipio | Chaparral (Tolima, PDET; está en el directorio del núcleo) |
| Vereda | La Esperanza |
| Entidad | Alcaldía de Chaparral (la app la sugiere; correo contactenos@chaparral-tolima.gov.co, sin verificar) |
| Desde cuándo | Hace tres meses |
| Con sus palabras (opcional) | Los niños no pueden llegar a la escuela y no podemos sacar la cosecha. |
| Nombre | Rosa Elena Pérez Gómez (ficticio) |
| Cédula | 1111111111 (ficticia) |
| Celular | 3000000000 (ficticio) |
| Clave de 4 números | 1357 (la crea la primera vez que guarda algo) |

Para mostrar una tutela de salud con el asistente, este relato también sirve: *La EPS no me da la cita con el cardiólogo hace dos meses* → a la pregunta del asistente, *Sí, es urgente*.

## Guion

| Tiempo | Pantalla | Qué hacer | Qué decir |
|---|---|---|---|
| 0:00 | Inicio | Mostrar al búho y tocar 🔊. | "MiDerecho ayuda a campesinos de municipios PDET a hacer documentos sin abogado y a no perder los plazos. Se puede usar con la voz y lo básico funciona sin internet." |
| 0:15 | Inicio | Pegar el relato (o tocar **Contar con mi voz** y dictarlo) y tocar **Enviar**. | "La persona cuenta con sus palabras. No necesita saber de leyes." |
| 0:25 | Antes de empezar | **No, nadie está en peligro**. | "Primero preguntamos por el riesgo: si hay amenazas, la app no pide más datos y muestra el 123 y a dónde acudir." |
| 0:30 | Antes de enviar | **Sí, acepto**. | "La persona autoriza, en palabras claras, qué va a la inteligencia artificial. Quitamos cédulas, teléfonos y correos antes de enviar." |
| 0:40 | Su situación | Bajar a los pasos y tocar **Crear el documento: Derecho de petición**. | "La IA entiende y orienta. Lo que dice la ley y el documento salen de contenido fijo, que valida un consultorio jurídico." |
| 0:55 | Paso 1 y 2 | Ver el ✓; marcar la segunda petición; Chaparral, La Esperanza, **Hace tres meses**. | "Lo que contó viene marcado con ✓. Lo que no dijo queda vacío: la app no inventa datos." |
| 1:10 | Paso 3: sus datos | Nombre, cédula y celular ficticios → **Ver el documento**. | "El nombre y la cédula se piden solo aquí y solo van en el papel: no van a la IA ni se guardan." |
| 1:20 | Paso 4: su documento | Mostrar **Guardar o imprimir PDF** y **Probar envío** (modo de prueba: no sale el correo). Luego **Ya lo entregué (elegir fecha)** → crear la clave 1357 → **Guardar en Mis casos**. | "Se imprime y se entrega, o se envía por correo a la alcaldía. Lo guardado en el celular queda cifrado con una clave de 4 números, porque el celular se comparte." |
| 1:40 | Quedó guardado | Mostrar la fecha límite y **¿Cómo quiere que le avisemos?** | "La app cuenta los días hábiles, con festivos, y avisa por notificación, SMS, WhatsApp o una llamada." |
| 1:50 | Inicio → Mis casos | **Ver un caso de ejemplo**. | "Así se ve cuando una entidad no responde." |
| 2:00 | Mis casos | En la petición de ejemplo vencida: **No: crear la tutela** → **No, es la primera** → datos → documento. | "Si no responden, la tutela sale con un toque y con las fechas del caso. El juzgado de Chaparral está en el directorio para enviarla por correo." |
| 2:25 | Cualquier pantalla | Tocar 🔊 en un bloque; en el asistente, **Hablar en vez de escribir**. | "Para quien no lee bien: todo se puede escuchar y se puede hablar con el asistente." |
| 2:40 | Encabezado | Mostrar **¿En peligro?** (Llamar al 123) y **Bloquear**. Con `?demo=1`, **Demo: con internet** → sin internet. | "Sin internet siguen funcionando los derechos con historietas, los documentos y Mis casos." |

Si sobra tiempo, con `?demo=1` en Mis casos: **Modo demo: adelantar un mes** → en la tutela, **¿Qué decidió el juez?** → **En contra** → el plazo de 3 días hábiles para impugnar sale en rojo.

## Después

- Inicio → **Quitar los casos de ejemplo** (borra los ejemplos y lo que salió de ellos), o Perfil → **Borrar todo**.

## Notas

- **Probar envío:** en modo de prueba el correo no sale de verdad y el caso no queda como entregado; la app lo dice. Para anotarlo use **Ya lo entregué**.
- **Contar con mi voz:** usa el dictado del navegador (Chrome, con internet); el audio pasa por Google, y la app lo avisa antes del primer dictado.
- **Hablar en vez de escribir:** necesita la clave de ElevenLabs en Vercel; sin ella el botón dice que no está disponible y la app sigue.
- La app se bloquea sola al salir de ella: al volver, Mis casos pide la clave.
