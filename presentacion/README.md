# Presentación del hackathon

- **`MiDerecho-hackathon.pptx`**: 20 láminas. Sigue el Canva del equipo (portada, equipo, barreras, población, propuesta, lenguaje cotidiano, 4 pasos, sin/con internet) y completa con la investigación: el flujo en 6 videos, privacidad, competencia, líderes y quién paga. Cada lámina trae su guion en las notas del orador.
- **`clips/`**: los videos de Remotion (1280 × 720, unos 7 segundos cada uno) y `MiDerecho-flujo.mp4`, las 7 escenas seguidas con título (48 s). En PowerPoint, cada video arranca solo al llegar a su lámina.
- **`video/`**: el proyecto Remotion. Las escenas están en `src/escenas.tsx` y las piezas comunes (búho, colinas, tarjetas) en `src/comun.tsx`. Las poses del búho se leen de `identidad/buho/`.
- **`capturas/`**: pantallas reales de https://miderecho-two.vercel.app.
- **`armar.mjs`**: genera el .pptx.

## Regenerar

```bash
cd presentacion/video && npm install && npm run dev      # vista previa (Remotion Studio)
npm run render                                            # clips/*.mp4 y sus portadas
cd .. && npm install && npm run pptx                      # MiDerecho-hackathon.pptx
```

## Pasar a la plantilla oficial

Colores y fuentes están en `TEMA`, y los marcos en los 3 diseños de `armar.mjs` (`PORTADA`, `CONTENIDO`, `OSCURO`). En PowerPoint también se puede aplicar la plantilla nueva con **Diseño > Temas**, o copiar las láminas a la plantilla (pegar con "Usar el tema de destino"). Los videos son .mp4 normales: sirven igual en Canva o Google Slides.

## Pendiente

- Cambiar los búhos de la lámina 2 por las fotos del equipo (están en el Canva).
- Revisar las cifras antes de presentar (`investigacion/00-informe-ejecutivo.md`, sección 11). Los costos de la lámina 19 son estimados.
