// Animaciones de la landing con GSAP + ScrollTrigger.
// Sin GSAP, o si la persona pidió menos movimiento, todo queda quieto en su estado final.
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const conGsap = !reducir && !!(window.gsap && window.ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
if (!conGsap) document.documentElement.classList.remove('anima');

// ---------- Video del búho: no arranca con movimiento reducido ni con ahorro de datos ----------
const video = $('.buho-video'), pausa = $('.btn-pausa');
if (!reducir && !navigator.connection?.saveData) {
  video.play().then(() => { pausa.hidden = false; }).catch(() => {});
  pausa.addEventListener('click', () => {
    if (video.paused) { video.play(); pausa.textContent = 'Pausar el saludo'; }
    else { video.pause(); pausa.textContent = 'Ver el saludo'; }
  });
}

// ---------- Sección activa en la barra ----------
const enlaces = $$('.barra-nav a');
const observador = new IntersectionObserver(entradas => entradas.forEach(e => {
  if (e.isIntersecting) enlaces.forEach(a => a.classList.toggle('activo', a.hash === `#${e.target.id}`));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => observador.observe(s));

// ---------- El camino: un sendero de la vereda al final, que se recorre con el scroll ----------
const camino = $('.camino'), sendero = $('.sendero');
const pendiente = $('.sendero-pendiente'), andado = $('.sendero-andado'), viajero = $('.viajero');
const paradas = $$('.parada', camino);
let largo = 0, yParadas = [];

function trazar() {
  const caja = camino.getBoundingClientRect();
  const centro = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - caja.left, r.top + r.height / 2 - caja.top]; };
  const puntos = $$('.ancla, .parada', camino).map(centro);   // inicio, las 6 paradas y el final, en orden
  let d = `M${puntos[0]}`;
  for (let i = 1; i < puntos.length; i++) {
    const [x0, y0] = puntos[i - 1], [x1, y1] = puntos[i], mx = (x0 + x1) / 2;   // cruza por el centro, entre columnas
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  sendero.setAttribute('viewBox', `0 0 ${caja.width} ${caja.height}`);
  pendiente.setAttribute('d', d);
  andado.setAttribute('d', d);
  largo = andado.getTotalLength();
  andado.style.strokeDasharray = largo;
  yParadas = paradas.map(p => centro(p)[1]);
  pintar();
}

// El viajero (el sobre) va siempre a la altura del 60 % de la pantalla: busca ese punto del sendero.
function pintar() {
  if (!conGsap) { andado.style.strokeDashoffset = 0; paradas.forEach(p => p.classList.add('llego')); return; }
  if (!largo) return;   // el scroll puede llegar antes que el primer trazo
  const linea = innerHeight * 0.6 - camino.getBoundingClientRect().top;
  let a = 0, b = largo;
  for (let i = 0; i < 22; i++) { const m = (a + b) / 2; if (andado.getPointAtLength(m).y < linea) a = m; else b = m; }
  const p = andado.getPointAtLength(a);
  andado.style.strokeDashoffset = largo - a;
  viajero.setAttribute('transform', `translate(${p.x} ${p.y})`);
  viajero.style.visibility = a > 1 && a < largo - 1 ? 'visible' : 'hidden';
  paradas.forEach((el, i) => el.classList.toggle('llego', linea >= yParadas[i]));
}

new ResizeObserver(trazar).observe(camino);
if (conGsap) addEventListener('scroll', () => requestAnimationFrame(pintar), { passive: true });

// ---------- Coreografía con GSAP ----------
if (conGsap) {
  gsap.registerPlugin(ScrollTrigger);

  // Portada: el texto entra en orden y el búho asoma detrás de la loma.
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.portada [data-intro]', { opacity: 1, y: 0, duration: .8, stagger: .09 })
    .to('.portada-buho', { opacity: 1, y: 0, duration: 1.1, ease: 'back.out(1.4)' }, .3)
    .fromTo('.trazo', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: .7, ease: 'power2.inOut' }, '-=.7');

  // Todo lo marcado con data-revela entra por tandas al llegar a la pantalla.
  ScrollTrigger.batch('[data-revela]', {
    start: 'top 88%', once: true,
    onEnter: lote => gsap.to(lote, { opacity: 1, y: 0, duration: .8, stagger: .09, ease: 'power3.out', overwrite: true }),
  });

  // Cifras que suben desde cero y barras que se llenan.
  $$('[data-contar]').forEach(el => {
    const fin = Number(el.dataset.contar), cifra = { v: 0 };
    const escribir = () => { el.textContent = Math.round(cifra.v).toLocaleString('es-CO'); };
    escribir();
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(cifra, { v: fin, duration: 1.6, ease: 'power2.out', onUpdate: escribir }) });
  });
  gsap.fromTo('.barra-llena', { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: .15, ease: 'power3.out',
    scrollTrigger: { trigger: '.barras', start: 'top 85%', once: true } });

  // Pasos: el búho llega con un pequeño rebote y el texto lo sigue.
  $$('.paso').forEach(paso => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: paso, start: 'top 72%', once: true } });
    tl.fromTo($('img', paso), { opacity: 0, scale: .55, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: .7, ease: 'back.out(1.8)' })
      .fromTo($('.paso-texto', paso), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, '-=.5');
  });

  // El filtro de privacidad en acción: se marca la cédula y llega tapada a la IA.
  gsap.timeline({ scrollTrigger: { trigger: '.filtro', start: 'top 70%', once: true } })
    .fromTo('.dato', { backgroundSize: '0% 40%' }, { backgroundSize: '100% 40%', duration: .7, ease: 'power2.out' }, .5)
    .fromTo('.burbuja-ia', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '+=.2')
    .fromTo('.tapado', { opacity: 0, scale: .3 }, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(3)' }, '-=.25');

  // El celular sube un poco más lento que la página.
  gsap.fromTo('.telefono', { y: 50, rotation: -3 }, { y: -20, rotation: -3, ease: 'none',
    scrollTrigger: { trigger: '#campo', start: 'top bottom', end: 'bottom top', scrub: true } });

  // El búho del cierre respira.
  gsap.to('.cierre-buho', { y: -10, rotation: -4, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
