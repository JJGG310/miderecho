#!/bin/sh
# Renderiza cada escena a ../clips/N-escena.mp4, su último cuadro como .png
# (portada del video en la diapositiva) y el video completo.
set -e
cd "$(dirname "$0")"
mkdir -p ../clips
n=1
for e in Problema Voz Orientacion Documento Envio Plazo Tutela; do
  f=../clips/$n-$(echo $e | tr '[:upper:]' '[:lower:]')
  npx remotion render $e $f.mp4
  ffmpeg -v error -y -sseof -0.1 -i $f.mp4 -frames:v 1 $f.png
  n=$((n+1))
done
npx remotion render Flujo ../clips/MiDerecho-flujo.mp4
