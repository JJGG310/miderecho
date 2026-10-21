import React from "react";
import { Composition, Series, useVideoConfig } from "remotion";
import { Documento, Envio, Orientacion, Plazo, Problema, Tutela, Voz } from "./escenas";

// Video completo: las 7 escenas seguidas, con su título.
const Flujo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <Series>
      <Series.Sequence name="Problema" durationInFrames={7 * fps} premountFor={fps}>
        <Problema titulo />
      </Series.Sequence>
      <Series.Sequence name="Voz" durationInFrames={7 * fps} premountFor={fps}>
        <Voz titulo />
      </Series.Sequence>
      <Series.Sequence name="Orientación" durationInFrames={6 * fps} premountFor={fps}>
        <Orientacion titulo />
      </Series.Sequence>
      <Series.Sequence name="Documento" durationInFrames={6 * fps} premountFor={fps}>
        <Documento titulo />
      </Series.Sequence>
      <Series.Sequence name="Envío" durationInFrames={7 * fps} premountFor={fps}>
        <Envio titulo />
      </Series.Sequence>
      <Series.Sequence name="Plazo" durationInFrames={7 * fps} premountFor={fps}>
        <Plazo titulo />
      </Series.Sequence>
      <Series.Sequence name="Tutela" durationInFrames={8 * fps} premountFor={fps}>
        <Tutela titulo />
      </Series.Sequence>
    </Series>
  );
};

// Cada escena sale como clip propio (sin título: lo pone la diapositiva).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Problema" component={Problema} durationInFrames={210} fps={30} width={1280} height={720} defaultProps={{ titulo: false }} />
    <Composition id="Voz" component={Voz} durationInFrames={210} fps={30} width={1280} height={720} defaultProps={{ titulo: false }} />
    <Composition id="Orientacion" component={Orientacion} durationInFrames={180} fps={30} width={1280} height={720} defaultProps={{ titulo: false }} />
    <Composition id="Documento" component={Documento} durationInFrames={180} fps={30} width={1280} height={720} defaultProps={{ titulo: false }} />
    <Composition id="Envio" component={Envio} durationInFrames={210} fps={30} width={1280} height={720} defaultProps={{ titulo: false }} />
    <Composition id="Plazo" component={Plazo} durationInFrames={210} fps={30} width={1280} height={720} defaultProps={{ titulo: false }} />
    <Composition id="Tutela" component={Tutela} durationInFrames={240} fps={30} width={1280} height={720} defaultProps={{ titulo: false }} />
    <Composition id="Flujo" component={Flujo} durationInFrames={1440} fps={30} width={1280} height={720} />
  </>
);
