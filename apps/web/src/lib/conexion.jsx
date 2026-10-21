// Estado de conexión. Con ?demo=1 en la dirección aparece un interruptor para simular "sin internet" en la presentación
// (no se guarda: al recargar vuelve la conexión real). Sin ?demo, la app solo dice "Sin internet" cuando de verdad no hay señal.
import { createContext, useContext, useEffect, useState } from 'react';

export const DEMO = typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo');

const Ctx = createContext({ enLinea: true, red: true, forzado: false, alternar: () => {} });

export function ProveedorConexion({ children }) {
  const [red, setRed] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [forzado, setForzado] = useState(false);
  useEffect(() => {
    const on = () => setRed(true), off = () => setRed(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return <Ctx.Provider value={{ enLinea: red && !forzado, red, forzado, alternar: () => setForzado(f => !f) }}>{children}</Ctx.Provider>;
}

export const useConexion = () => useContext(Ctx);
