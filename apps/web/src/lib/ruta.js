// Navegación mínima por hash (#/derechos/salud). Funciona sin servidor y con el botón Atrás del celular.
import { useEffect, useState } from 'react';

const leer = () => (location.hash.replace(/^#\/?/, '') || 'inicio').split('/');

export function useRuta() {
  const [ruta, setRuta] = useState(leer);
  useEffect(() => {
    const f = () => { setRuta(leer()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export const ir = (...partes) => { location.hash = '/' + partes.join('/'); };
export const atras = () => (history.length > 1 ? history.back() : ir('inicio'));

// Datos que pasan de una pantalla a otra sin quedar en la URL ni en el celular (solo en memoria).
export const memoria = { conversacion: null, orientacion: null, borrador: null };
