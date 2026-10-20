# MiDerecho

Herramienta para que comunidades rurales de Colombia hagan un **derecho de petición** sin abogado y sin viajar, sigan el plazo de respuesta y preparen la **tutela** si la entidad no responde. Funciona sin internet y lee todo en voz alta. Pensada para que la use la persona líder de la comunidad (presidente de JAC, conciliador) junto a sus vecinos.

**App en línea:** https://miderecho-two.vercel.app

Hackathon, Reto 2: acceso a la justicia rural con tecnología de bajo consumo de datos ([enunciado](reto-2-enunciado.jpg)).

## Contenido

| Carpeta | Qué hay |
|---|---|
| [`prototipo/`](prototipo/) | La app (PWA sin dependencias). Cómo correrla y qué está simulado: [prototipo/README.md](prototipo/README.md) |
| [`investigacion/`](investigacion/) | Investigación de mercado, población, modelo de negocio, canales, marco legal y seguridad. Empezar por el [informe ejecutivo](investigacion/00-informe-ejecutivo.md) |

## Correr localmente

```bash
python3 -m http.server 8080 --directory prototipo
```

Prueba del cálculo de plazos (días hábiles con festivos colombianos):

```bash
node prototipo/test-plazos.mjs
```

> Prototipo. Las plantillas jurídicas están pendientes de validación por un consultorio jurídico, y el envío por correo y los SMS están simulados.
