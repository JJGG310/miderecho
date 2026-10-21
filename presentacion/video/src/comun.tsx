import React from "react";
import { loadFont } from "@remotion/google-fonts/Nunito";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Landmark, type LucideIcon } from "lucide-react";

export const { fontFamily } = loadFont("normal", {
  weights: ["600", "700", "800", "900"],
  subsets: ["latin"],
});

// Colores de la marca (identidad/README.md) y del Canva del equipo.
export const C = {
  verde: "#264933",
  verdeMedio: "#4f7a5a",
  salvia: "#9db592",
  salviaClaro: "#e3eadc",
  crema: "#fff5e4",
  arena: "#e3c48f",
  cafe: "#8b5e3c",
  texto: "#2b2a27",
  suave: "#6b675f",
  rojo: "#b3412e",
  papel: "#ffffff",
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export type Escena = { titulo?: boolean };

export const Fondo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: C.crema, fontFamily, color: C.texto }}>
    {children}
  </AbsoluteFill>
);

// Entrada suave (o con rebote si escala) a partir del cuadro `desde`.
export const Aparece: React.FC<{
  desde: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
  desdeY?: number;
  escala?: boolean;
}> = ({ desde, style, children, desdeY = 30, escala }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - desde,
    fps,
    config: escala ? { damping: 11, stiffness: 140 } : { damping: 200 },
  });
  return (
    <div
      style={{
        position: "absolute",
        opacity: interpolate(frame - desde, [0, 8], [0, 1], clamp),
        translate: `0 ${(1 - p) * desdeY}px`,
        scale: escala ? String(p) : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Algunos PNG traen una franja de otra pose en el borde derecho.
const RECORTE: Record<string, string> = { pensando: "inset(0 5% 0 0)", saludo: "inset(0 4% 0 0)" };

// El búho: entra con rebote y luego respira (sube y baja apenas).
export const Buho: React.FC<{
  pose: string;
  x: number;
  y: number;
  h: number;
  desde?: number;
}> = ({ pose, x, y, h, desde = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - desde;
  const p = spring({ frame: t, fps, config: { damping: 10, stiffness: 120 } });
  return (
    <Img
      src={staticFile(`${pose}.png`)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        height: h,
        clipPath: RECORTE[pose],
        transformOrigin: "50% 100%",
        opacity: interpolate(t, [0, 6], [0, 1], clamp),
        scale: String(0.5 + 0.5 * p),
        translate: `0 ${Math.sin(t / 11) * 5}px`,
        rotate: `${Math.sin(t / 19) * 2}deg`,
      }}
    />
  );
};

// Título de la escena (solo en el video completo; en las diapositivas lo pone la lámina).
export const Titulo: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <Aparece desde={0} desdeY={-20} style={{ left: 70, top: 34, display: "flex", alignItems: "center", gap: 18 }}>
    <div
      style={{
        width: 58,
        height: 58,
        borderRadius: 29,
        background: C.verde,
        color: C.crema,
        fontSize: 32,
        fontWeight: 900,
        display: "grid",
        placeItems: "center",
      }}
    >
      {n}
    </div>
    <div style={{ fontSize: 42, fontWeight: 900, color: C.verde }}>{children}</div>
  </Aparece>
);

export const Tarjeta: React.FC<{
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ style, children }) => (
  <div
    style={{
      background: C.papel,
      borderRadius: 24,
      boxShadow: "0 10px 30px rgba(38,73,51,.12)",
      padding: "18px 24px",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Icono: React.FC<{
  icono: LucideIcon;
  fondo?: string;
  color?: string;
  t?: number;
}> = ({ icono: I, fondo = C.salviaClaro, color = C.verde, t = 64 }) => (
  <div
    style={{
      width: t,
      height: t,
      borderRadius: t / 2,
      background: fondo,
      display: "grid",
      placeItems: "center",
      flex: "none",
    }}
  >
    <I size={t * 0.52} color={color} strokeWidth={2.4} />
  </div>
);

export const Chip: React.FC<{
  icono?: LucideIcon;
  fondo?: string;
  color?: string;
  children: React.ReactNode;
}> = ({ icono: I, fondo = C.papel, color = C.verde, children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      background: fondo,
      color,
      borderRadius: 999,
      padding: "10px 20px",
      fontSize: 26,
      fontWeight: 800,
      boxShadow: "0 6px 18px rgba(38,73,51,.12)",
      whiteSpace: "nowrap",
    }}
  >
    {I ? <I size={28} strokeWidth={2.6} /> : null}
    {children}
  </div>
);

// Colinas como las del logo. `medio` va entre la colina del fondo y las del frente.
export const Colinas: React.FC<{ medio?: React.ReactNode }> = ({ medio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ translate: `0 ${(1 - p) * 120}px` }}>
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <circle cx={1150} cy={360} r={80} fill={C.arena} />
        <path d="M0 440 C 220 390 420 400 640 460 C 860 510 1000 370 1280 350 L1280 720 L0 720 Z" fill={C.salvia} />
      </svg>
      {medio}
      <svg width={1280} height={720} style={{ position: "absolute" }}>
        <path d="M0 520 C 320 470 620 520 860 550 C 1060 575 1180 520 1280 510 L1280 720 L0 720 Z" fill={C.verdeMedio} />
        <path d="M0 620 C 320 590 720 640 1280 605 L1280 720 L0 720 Z" fill={C.verde} />
      </svg>
    </AbsoluteFill>
  );
};

export const Juzgado: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 200 * s, height: 190 * s }}>
    <svg width={200 * s} height={190 * s} viewBox="0 0 200 190">
      <path d="M10 60 L100 10 L190 60 Z" fill={C.verde} />
      <rect x={18} y={60} width={164} height={14} fill={C.verde} />
      {[34, 72, 110, 148].map((cx) => (
        <rect key={cx} x={cx} y={78} width={18} height={84} rx={3} fill={C.papel} stroke={C.verde} strokeWidth={3} />
      ))}
      <rect x={8} y={162} width={184} height={16} rx={3} fill={C.verde} />
    </svg>
    <div style={{ position: "absolute", left: 82 * s, top: 26 * s }}>
      <Landmark size={36 * s} color={C.crema} strokeWidth={2.4} />
    </div>
  </div>
);

export const Casa: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={150} height={140} viewBox="0 0 150 140" style={{ position: "absolute", left: x, top: y }}>
    <rect x={22} y={60} width={106} height={80} fill="#f0dcb4" stroke={C.cafe} strokeWidth={4} />
    <path d="M8 66 L75 12 L142 66 Z" fill={C.cafe} />
    <rect x={62} y={92} width={28} height={48} fill={C.verde} />
    <rect x={34} y={80} width={20} height={20} fill={C.salvia} stroke={C.cafe} strokeWidth={3} />
  </svg>
);

export const Celular: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: "#1e2a23",
      borderRadius: 40,
      padding: 12,
      boxShadow: "0 18px 40px rgba(30,42,35,.25)",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        background: C.crema,
        borderRadius: 30,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {children}
    </div>
  </div>
);

// Punto de una curva de Bézier cúbica, para dibujar caminos punteados.
export const bezier = (
  t: number,
  [p0, p1, p2, p3]: [number, number][],
): [number, number] => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
};
