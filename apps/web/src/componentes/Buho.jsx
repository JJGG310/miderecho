// El búho, mascota de MiDerecho (identidad/buho/). Las poses son WebP con fondo transparente en public/buho/.
// El nombre de la mascota todavía no está decidido: se cambia solo aquí.
export const NOMBRE_BUHO = 'MiDerecho';

// Tamaño original de cada pose (ancho, alto): con width y height la página no salta mientras carga.
const POSES = {
  saludo: [355, 420], ley: [198, 244], lupa: [197, 255], corazon: [231, 253], pensando: [202, 253],
  documento: [203, 246], computador: [250, 247],
  'avatar-curioso': [242, 204], 'avatar-amigable': [241, 217], 'avatar-sabio': [250, 223], 'avatar-acompanante': [256, 215],
};

// Sin alt es decorativo: lo que importa ya está en el texto. primera: está en la primera pantalla (no se carga diferido).
// Con children, el búho dice el texto en un globo.
export default function Buho({ pose, ancho = 72, alt = '', primera = false, className = '', children }) {
  const [w, h] = POSES[pose];
  const img = <img className={`buho ${className}`} src={`buho/${pose}.webp`} width={ancho} height={Math.round(ancho * h / w)}
    alt={alt} aria-hidden={alt ? undefined : true} loading={primera ? undefined : 'lazy'} decoding="async" />;
  if (!children) return img;
  return <div className="buho-dice">{img}<div className="globo">{children}</div></div>;
}
