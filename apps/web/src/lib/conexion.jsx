// Estado de conexión. Con ?demo=1 en la dirección aparece un interruptor para simular "sin internet" en la presentación
// (no se guarda: al recargar vuelve la conexión real). Sin ?demo, la app dice "Sin internet" solo cuando de verdad no hay señal.
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { forzarSinRed, procesarEnvios, refrescarEnvios, suscribirEnvios, estadoEnvios } from './cola.js';
import { useAbierta } from './almacen.js';

export const DEMO = typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo');

const Ctx = createContext({ enLinea: true, red: true, forzado: false, alternar: () => {} });

export function ProveedorConexion({ children }) {
  const [red, setRed] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [forzado, setForzado] = useState(false);
  forzarSinRed(forzado);   // para lib/cola.js y lib/avisos.js, que no son componentes
  useEffect(() => {
    const on = () => setRed(true), off = () => setRed(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return <Ctx.Provider value={{ enLinea: red && !forzado, red, forzado, alternar: () => setForzado(f => !f) }}>{children}</Ctx.Provider>;
}

export const useConexion = () => useContext(Ctx);

// Envíos que esperan señal (lib/cola.js): salen solos al volver la señal o al abrir la app con la clave.
export function useEnvios() {
  const { enLinea } = useConexion();
  const abierta = useAbierta();
  useEffect(() => { refrescarEnvios(); if (enLinea && abierta) procesarEnvios(); }, [enLinea, abierta]);
  return useSyncExternalStore(suscribirEnvios, estadoEnvios);
}
