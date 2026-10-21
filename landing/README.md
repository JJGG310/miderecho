# Landing de MiDerecho

Página estática (HTML, CSS y JS, sin compilación) que explica el servicio al jurado y en la presentación.
Publicada en Vercel como proyecto `miderecho-landing` (equipo `jjgg310s-projects`).

| Archivo | Qué es |
|---|---|
| `index.html` | Todo el contenido, en orden: portada, problema, cómo funciona, campo, privacidad, documentos, video, modelo y cierre |
| `estilos.css` | Colores del búho, tipografías y diseño (responsive desde 360 px) |
| `animacion.js` | Animaciones con GSAP 3.13.0 (CDN). Con «reducir movimiento» o sin GSAP, todo se ve quieto |
| `img/` | Poses del búho (copiadas de `identidad/buho/`), captura de la app y `og.jpg` (imagen para compartir) |
| `qr.mjs` | Genera el código QR como SVG, sin servicios externos |
| `og.html` | Fuente de `img/og.jpg` (1200×630) |

## Editar

- **Equipo:** en `index.html`, busque `EQUIPO` y cambie `[Nombre y apellido]` y `[Rol]`.
- **Video:** busque `PARA PONER EL VIDEO`; el comentario trae el código para un MP4 propio o para YouTube.
- **QR** (si cambia la dirección de la app): `node landing/qr.mjs https://nueva-direccion` y pegue el `<svg>` que imprime en lugar del que tiene `id="qr"`.
- **Imagen para compartir:** abra `og.html` a 1200×630 y tome una captura como `img/og.jpg`.

Ver en local: abra `index.html` en el navegador o sirva la carpeta con cualquier servidor estático.

## Publicar

```bash
cd landing
~/.npm/_npx/69f9afb961c37556/node_modules/.bin/vercel deploy --prod
```
