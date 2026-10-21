// Estado de conexión. El interruptor del encabezado (como en el Figma) permite forzar el modo sin conexión para el demo.
import { createContext, useContext, useEffect, useState } from 'react';
import { almacen } from './almacen.js';

const Ctx = createContext({ enLinea: true, forzado: false, alternar: () => {} });

export function ProveedorConexion({ children }) {
  const [red, setRed] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [forzado, setForzado] = useState(() => almacen.pref('sinConexion', false));
  useEffect(() => {
    const on = () => setRed(true), off = () => setRed(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  const alternar = () => setForzado(f => { almacen.setPref('sinConexion', !f); return !f; });
  return <Ctx.Provider value={{ enLinea: red && !forzado, red, forzado, alternar }}>{children}</Ctx.Provider>;
}

export const useConexion = () => useContext(Ctx);
