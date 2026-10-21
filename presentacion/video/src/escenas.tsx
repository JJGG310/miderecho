import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ArrowRight,
  Check,
  Clock,
  FileText,
  HeartPulse,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mic,
  Phone,
  Scale,
  WifiOff,
} from "lucide-react";
import {
  Aparece,
  bezier,
  Buho,
  C,
  Casa,
  Celular,
  Chip,
  clamp,
  Colinas,
  type Escena,
  Fondo,
  Icono,
  Juzgado,
  Tarjeta,
  Titulo,
} from "./comun";

// 1. El problema rural: el juzgado queda a horas de camino y no hay señal.
export const Problema: React.FC<Escena> = ({ titulo }) => {
  const frame = useCurrentFrame();
  const camino: [number, number][] = [[540, 470], [660, 570], [870, 560], [1000, 410]];
  return (
    <Fondo>
      <Colinas
        medio={
          <>
            <Casa x={390} y={340} />
            <Juzgado x={960} y={215} s={0.95} />
          </>
        }
      />
      {Array.from({ length: 22 }, (_, i) => {
        const [x, y] = bezier(i / 21, camino);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 7,
              top: y - 7,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: C.crema,
              opacity: interpolate(frame, [20 + i * 3, 24 + i * 3], [0, 1], clamp),
            }}
          />
        );
      })}
      <Aparece desde={60} style={{ left: 925, top: 140 }}>
        <Chip icono={Scale}>Juzgado y alcaldía</Chip>
      </Aparece>
      <Aparece desde={85} escala style={{ left: 600, top: 380 }}>
        <Chip icono={Clock} fondo={C.verde} color={C.crema}>
          Horas de camino
        </Chip>
      </Aparece>
      <Aparece desde={110} escala style={{ left: 380, top: 240 }}>
        <Chip icono={WifiOff} color={C.rojo}>
          Sin señal
        </Chip>
      </Aparece>
      <Buho pose="pensando" x={30} y={260} h={380} desde={130} />
      {titulo ? <Titulo n={1}>En la vereda, la justicia queda lejos</Titulo> : null}
    </Fondo>
  );
};

// 2. La persona cuenta su caso con la voz; la cédula se quita antes de enviarla.
export const Voz: React.FC<Escena> = ({ titulo }) => {
  const frame = useCurrentFrame();
  const relato = "«La EPS no me da la cita con el cardiólogo hace dos meses. Mi cédula es ";
  const cedula = "1.144.555.666»";
  const escrito = Math.floor(interpolate(frame, [25, 115], [0, relato.length], clamp));
  const escritoCedula = Math.floor(interpolate(frame, [115, 130], [0, cedula.length], clamp));
  const cambio = interpolate(frame, [150, 162], [0, 1], clamp);
  const hablando = frame > 15 && frame < 135;
  return (
    <Fondo>
      <Celular x={150} y={120} w={290} h={540}>
        <div style={{ position: "absolute", top: 26, width: "100%", textAlign: "center", fontSize: 24, fontWeight: 900, color: C.verde }}>
          MiDerecho
        </div>
        {[0, 1].map((k) => {
          const onda = ((frame + k * 22) % 44) / 44;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 133 - 60,
                top: 170 - 60,
                width: 120,
                height: 120,
                borderRadius: 60,
                border: `4px solid ${C.verde}`,
                opacity: hablando ? 0.5 * (1 - onda) : 0,
                scale: String(1 + onda * 0.7),
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 133 - 60,
            top: 170 - 60,
            width: 120,
            height: 120,
            borderRadius: 60,
            background: C.verde,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Mic size={58} color={C.crema} strokeWidth={2.4} />
        </div>
        <div style={{ position: "absolute", top: 290, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, height: 90 }}>
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                borderRadius: 5,
                background: C.verdeMedio,
                height: hablando ? 16 + Math.abs(Math.sin(frame / 4 + i * 1.3)) * 64 * Math.sin(((i + 1) / 12) * Math.PI) : 10,
              }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", top: 400, width: "100%", textAlign: "center", fontSize: 24, fontWeight: 800, color: C.suave }}>
          {frame < 135 ? "Escuchando…" : "¡Listo!"}
        </div>
      </Celular>
      <Aparece desde={18} style={{ left: 510, top: 140, width: 650 }}>
        <Tarjeta style={{ padding: "26px 32px", borderRadius: 30 }}>
          <div style={{ fontSize: 33, fontWeight: 700, lineHeight: 1.4, minHeight: 140 }}>
            {relato.slice(0, escrito)}
            <span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ opacity: 1 - cambio }}>{cedula.slice(0, escritoCedula)}</span>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: -2,
                  opacity: cambio,
                  background: C.verde,
                  color: C.crema,
                  borderRadius: 10,
                  padding: "0 10px",
                  whiteSpace: "nowrap",
                }}
              >
                [número]
              </span>
            </span>
          </div>
        </Tarjeta>
      </Aparece>
      <Aparece desde={168} style={{ left: 510, top: 370 }}>
        <Chip icono={Lock} fondo={C.salviaClaro}>
          Quitamos sus datos antes de enviarlo
        </Chip>
      </Aparece>
      <Buho pose="saludo" x={990} y={410} h={270} desde={40} />
      {titulo ? <Titulo n={2}>Cuenta su caso con su voz</Titulo> : null}
    </Fondo>
  );
};

// 3. Orientación en palabras sencillas: qué significa, qué derecho, a dónde ir, qué documento.
const Orienta: React.FC<{
  desde: number;
  top: number;
  icono: typeof HelpCircle;
  etiqueta: string;
  texto: string;
  destacado?: boolean;
}> = ({ desde, top, icono, etiqueta, texto, destacado }) => (
  <Aparece desde={desde} style={{ left: 470, top, width: 740 }}>
    <Tarjeta
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          background: destacado ? C.verde : C.papel,
          color: destacado ? C.crema : C.texto,
        }}
      >
        <Icono icono={icono} fondo={destacado ? C.crema : C.salviaClaro} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: destacado ? C.salvia : C.verdeMedio }}>{etiqueta}</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{texto}</div>
        </div>
    </Tarjeta>
  </Aparece>
);

export const Orientacion: React.FC<Escena> = ({ titulo }) => (
  <Fondo>
    <Buho pose="ley" x={90} y={210} h={400} />
    <Orienta desde={20} top={130} icono={HelpCircle} etiqueta="Qué significa" texto="La EPS debe darle la cita a tiempo" />
    <Orienta desde={42} top={258} icono={HeartPulse} etiqueta="Qué derecho está en juego" texto="Derecho a la salud" />
    <Orienta desde={64} top={386} icono={MapPin} etiqueta="A dónde acudir" texto="Al juez de su municipio" />
    <Orienta desde={86} top={514} icono={FileText} etiqueta="Qué documento sirve" texto="Tutela de salud" destacado />
    {titulo ? <Titulo n={3}>Recibe orientación clara</Titulo> : null}
  </Fondo>
);

// 4. El documento se arma solo con plantillas fijas y queda listo para firmar.
const Seccion: React.FC<{ desde: number; titulo: string }> = ({ desde, titulo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const check = spring({ frame: frame - desde - 12, fps, config: { damping: 10, stiffness: 160 } });
  return (
    <div style={{ marginTop: 22, opacity: interpolate(frame - desde, [0, 8], [0, 1], clamp) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 800, color: C.verde }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: C.verde, display: "grid", placeItems: "center", scale: String(check) }}>
          <Check size={22} color={C.crema} strokeWidth={3.5} />
        </div>
        {titulo}
      </div>
      {[1, 0.75].map((w, i) => (
        <div
          key={i}
          style={{
            height: 12,
            borderRadius: 6,
            background: "#e4e0d8",
            marginTop: 12,
            width: `${w * 100 * interpolate(frame - desde, [4 + i * 6, 20 + i * 6], [0, 1], clamp)}%`,
          }}
        />
      ))}
    </div>
  );
};

export const Documento: React.FC<Escena> = ({ titulo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sello = spring({ frame: frame - 125, fps, config: { damping: 12, stiffness: 120 } });
  return (
    <Fondo>
      <Buho pose="documento" x={110} y={240} h={370} />
      <Aparece desde={8} desdeY={60} style={{ left: 540, top: 120, width: 460 }}>
        <div style={{ background: C.papel, borderRadius: 10, padding: "30px 36px", height: 530, boxShadow: "0 16px 40px rgba(38,73,51,.16)" }}>
          <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 30, textAlign: "center", color: C.texto }}>
            ACCIÓN DE TUTELA
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, textAlign: "center", color: C.suave, marginTop: 6 }}>
            Señor(a) juez de su municipio
          </div>
          <Seccion desde={30} titulo="Lo que pasó" />
          <Seccion desde={55} titulo="Derecho a la salud" />
          <Seccion desde={80} titulo="Lo que le pido al juez" />
          <div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "flex-end", opacity: interpolate(frame, [100, 110], [0, 1], clamp) }}>
            <span style={{ fontSize: 20, color: C.suave, fontWeight: 700 }}>Firma</span>
            <div style={{ flex: 1, borderBottom: `3px solid ${C.texto}` }} />
          </div>
        </div>
      </Aparece>
      <div
        style={{
          position: "absolute",
          left: 870,
          top: 470,
          width: 170,
          height: 170,
          borderRadius: 85,
          border: `7px solid ${C.verde}`,
          color: C.verde,
          display: "grid",
          placeItems: "center",
          fontSize: 40,
          fontWeight: 900,
          background: "rgba(255,245,228,.85)",
          rotate: "-14deg",
          opacity: interpolate(frame, [125, 130], [0, 1], clamp),
          scale: String(1.8 - 0.8 * sello),
        }}
      >
        LISTO
      </div>
      <Aparece desde={140} style={{ left: 1040, top: 170 }}>
        <Chip>Gratis</Chip>
      </Aparece>
      <Aparece desde={150} style={{ left: 1040, top: 240 }}>
        <Chip>Sin abogado</Chip>
      </Aparece>
      <Aparece desde={160} style={{ left: 1040, top: 310 }}>
        <Chip>Sin internet</Chip>
      </Aparece>
      {titulo ? <Titulo n={4}>El documento queda listo</Titulo> : null}
    </Fondo>
  );
};

// 5. Lo envía por correo al juzgado: el sobre viaja, la persona no.
export const Envio: React.FC<Escena> = ({ titulo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vuelo: [number, number][] = [[330, 330], [520, 60], [860, 40], [1075, 230]];
  const t = interpolate(frame, [35, 105], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const [sx, sy] = bezier(t, vuelo);
  const llega = spring({ frame: frame - 105, fps, config: { damping: 9, stiffness: 180 } });
  const enviado = frame > 105;
  return (
    <Fondo>
      <Colinas medio={<Juzgado x={980} y={210} s={1} />} />
      <Celular x={110} y={150} w={240} h={430}>
        <div style={{ padding: 22 }}>
          <div style={{ background: C.papel, borderRadius: 10, padding: 16, height: 200, boxShadow: "0 4px 12px rgba(0,0,0,.06)" }}>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 15, textAlign: "center" }}>ACCIÓN DE TUTELA</div>
            {[1, 0.9, 1, 0.7, 1, 0.8].map((w, i) => (
              <div key={i} style={{ height: 8, borderRadius: 4, background: "#e4e0d8", marginTop: 12, width: `${w * 100}%` }} />
            ))}
          </div>
          <div
            style={{
              marginTop: 26,
              background: enviado ? C.verdeMedio : C.verde,
              color: C.crema,
              borderRadius: 16,
              padding: "16px 0",
              textAlign: "center",
              fontSize: 21,
              fontWeight: 900,
              scale: String(interpolate(frame, [22, 27, 33], [1, 0.92, 1], clamp)),
            }}
          >
            {enviado ? "Enviado ✓" : "Enviar por correo"}
          </div>
        </div>
      </Celular>
      {Array.from({ length: 16 }, (_, i) => {
        const [x, y] = bezier(i / 15, vuelo);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 6,
              top: y - 6,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: C.arena,
              opacity: (t > i / 15 ? 1 : 0) * interpolate(frame, [110, 125], [1, 0], clamp),
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: sx - 45,
          top: sy - 45,
          width: 90,
          height: 90,
          borderRadius: 22,
          background: C.papel,
          boxShadow: "0 10px 24px rgba(38,73,51,.2)",
          display: "grid",
          placeItems: "center",
          opacity: interpolate(frame, [33, 38, 104, 110], [0, 1, 1, 0], clamp),
          rotate: `${Math.sin(t * Math.PI) * -12}deg`,
        }}
      >
        <Mail size={52} color={C.verde} strokeWidth={2.4} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1150,
          top: 190,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: C.verde,
          display: "grid",
          placeItems: "center",
          border: `4px solid ${C.crema}`,
          scale: String(llega),
        }}
      >
        <Check size={36} color={C.crema} strokeWidth={3.5} />
      </div>
      <Aparece desde={120} style={{ left: 450, top: 150, width: 440 }}>
        <Tarjeta>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.verdeMedio }}>Constancia de envío</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>Recibido en el juzgado</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.suave, marginTop: 4 }}>21 de octubre · 10:42 a. m.</div>
        </Tarjeta>
      </Aparece>
      <Aparece desde={140} escala style={{ left: 520, top: 360 }}>
        <Chip icono={Check} fondo={C.verde} color={C.crema}>
          Sin viajar ni hacer filas
        </Chip>
      </Aparece>
      <Buho pose="computador" x={390} y={420} h={210} desde={10} />
      {titulo ? <Titulo n={5}>Lo envía sin viajar</Titulo> : null}
    </Fondo>
  );
};

// 6. Cuenta los días hábiles y le avisa por SMS, WhatsApp o llamada.
const Aviso: React.FC<{
  desde: number;
  top: number;
  icono: typeof Phone;
  fondo: string;
  canal: string;
  texto: string;
}> = ({ desde, top, icono, fondo, canal, texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - desde, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <div style={{ position: "absolute", left: 720, top, width: 520, translate: `${(1 - p) * 560}px 0` }}>
      <Tarjeta style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Icono icono={icono} fondo={fondo} color={C.papel} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.verdeMedio }}>{canal}</div>
          <div style={{ fontSize: 26, fontWeight: 900, whiteSpace: "nowrap" }}>{texto}</div>
        </div>
      </Tarjeta>
    </div>
  );
};

export const Plazo: React.FC<Escena> = ({ titulo }) => {
  const frame = useCurrentFrame();
  const dias = Math.min(12, Math.floor(interpolate(frame, [15, 100], [0, 12], clamp)));
  return (
    <Fondo>
      <Aparece desde={0} style={{ left: 110, top: 130, width: 560 }}>
        <div style={{ background: C.papel, borderRadius: 28, overflow: "hidden", boxShadow: "0 12px 34px rgba(38,73,51,.14)" }}>
          <div style={{ background: C.verde, color: C.crema, padding: "18px 28px", fontSize: 30, fontWeight: 900 }}>
            Plazo para responder
          </div>
          <div style={{ padding: "22px 36px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {Array.from({ length: 15 }, (_, i) => {
                const lleno = i < dias;
                return (
                  <div
                    key={i}
                    style={{
                      height: 72,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 28,
                      fontWeight: 900,
                      background: lleno ? C.verde : C.crema,
                      color: lleno ? C.crema : i >= 12 ? C.rojo : C.suave,
                      border: i >= 12 ? `3px dashed ${C.rojo}` : `3px solid ${lleno ? C.verde : "#eadfca"}`,
                    }}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, fontSize: 30, fontWeight: 900, color: dias === 12 ? C.rojo : C.verde }}>
              {dias === 12 ? "Faltan 3 días hábiles" : `Día ${dias} de 15 hábiles`}
            </div>
          </div>
        </div>
      </Aparece>
      <Buho pose="lupa" x={590} y={455} h={210} desde={20} />
      <Aviso desde={110} top={150} icono={MessageSquare} fondo={C.verdeMedio} canal="SMS" texto="Peticion 4F7K vence el 1-dic" />
      <Aviso desde={135} top={285} icono={MessageCircle} fondo="#25a35a" canal="WhatsApp" texto="Le deben responder pronto" />
      <Aviso desde={160} top={420} icono={Phone} fondo={C.cafe} canal="Llamada" texto="Le recordamos su plazo" />
      {titulo ? <Titulo n={6}>Le avisa antes del plazo</Titulo> : null}
    </Fondo>
  );
};

// 7. Día 16 sin respuesta: la tutela, que casi siempre termina a favor.
export const Tutela: React.FC<Escena> = ({ titulo }) => {
  const frame = useCurrentFrame();
  const pct = Math.round(interpolate(frame, [110, 160], [0, 73], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 }));
  return (
    <Fondo>
      <Aparece desde={0} escala style={{ left: 110, top: 170, width: 230 }}>
        <div style={{ background: C.papel, borderRadius: 26, overflow: "hidden", boxShadow: "0 12px 30px rgba(38,73,51,.14)", textAlign: "center" }}>
          <div style={{ background: C.rojo, color: C.papel, fontSize: 28, fontWeight: 900, padding: "12px 0" }}>Día</div>
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1.1, color: C.texto }}>16</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.rojo, paddingBottom: 18 }}>Sin respuesta</div>
        </div>
      </Aparece>
      <Aparece desde={35} desdeY={0} style={{ left: 365, top: 250 }}>
        <ArrowRight size={84} color={C.arena} strokeWidth={3} />
      </Aparece>
      <Aparece desde={48} style={{ left: 480, top: 150, width: 470 }}>
        <Tarjeta style={{ padding: "26px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Icono icono={Scale} fondo={C.verde} color={C.crema} t={70} />
            <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.15 }}>Tutela por derecho de petición</div>
          </div>
          {["Sin abogado", "El juez decide en 10 días"].map((x) => (
            <div key={x} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, fontSize: 27, fontWeight: 800, color: C.verde }}>
              <Check size={28} strokeWidth={3.2} />
              {x}
            </div>
          ))}
        </Tarjeta>
      </Aparece>
      <Aparece desde={105} style={{ left: 110, top: 480, width: 820, display: "flex", alignItems: "center", gap: 26 }}>
        <div style={{ fontSize: 110, fontWeight: 900, color: C.verde, lineHeight: 1, width: 250 }}>{pct}%</div>
        <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.3 }}>
          de las tutelas por petición terminan a favor de la persona
        </div>
      </Aparece>
      <Buho pose="corazon" x={965} y={330} h={300} desde={150} />
      {titulo ? <Titulo n={7}>Si no responden, la tutela</Titulo> : null}
    </Fondo>
  );
};
