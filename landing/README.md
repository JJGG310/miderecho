# Landing de MiDerecho

Página estática (HTML, CSS y JS, sin compilación) que explica el servicio al jurado y en la presentación.
Publicada en Vercel como proyecto `miderecho-landing` (equipo `jjgg310s-projects`).

| Archivo | Qué es |
|---|---|
| `index.html` | Todo el contenido, en orden: portada, problema, cómo funciona, campo, privacidad, documentos, video, modelo y cierre |
| `estilos.css` | Colores del búho, tipografías y diseño (responsive desde 360 px) |
| `animacion.js` | Animaciones con GSAP. Con «reducir movimiento» o sin GSAP, todo se ve quieto |
| `vendor/` | GSAP 3.15.0 y ScrollTrigger, alojados aquí (idénticos a los del registro de npm) para no depender de un CDN |
| `img/` | Poses del búho (copiadas de `identidad/buho/`), captura de la app, `og.jpg` (imagen para compartir) y `como-funciona.mp4` (video de Remotion de la presentación, comprimido a 1 MB) |
| `qr.mjs` | Genera el código QR como SVG, sin servicios externos |
| `og.html` | Fuente de `img/og.jpg` (1200×630) |

## Editar

- **Equipo:** está oculto. En `index.html`, busque `EQUIPO`, cambie `[Nombre y apellido]` y `[Rol]` y borre el atributo `hidden`.
- **Video:** si cambia, reemplace `img/como-funciona.mp4` y su póster `img/como-funciona-poster.jpg` (1280×720).
- **QR** (si cambia la dirección de la app): `node landing/qr.mjs https://nueva-direccion` y pegue el `<svg>` que imprime en lugar del que tiene `id="qr"`.
- **Imagen para compartir:** abra `og.html` a 1200×630 y tome una captura como `img/og.jpg`.

Ver en local: abra `index.html` en el navegador o sirva la carpeta con cualquier servidor estático.

## Publicar

Desde la carpeta `landing/`, con la CLI de Vercel autenticada:

```bash
vercel deploy --prod
```
