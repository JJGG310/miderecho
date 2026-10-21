// Lectura en voz alta (funciona sin internet con las voces del celular) y dictado (necesita internet en Chrome Android).
import { useEffect, useRef, useState } from 'react';

const sintesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
let vozEs = null;
function escogerVoz() {
  const voces = sintesis?.getVoices() || [];
  vozEs = voces.find(v => v.lang === 'es-CO') || voces.find(v => v.lang === 'es-US') || voces.find(v => v.lang?.startsWith('es')) || null;
}
sintesis?.addEventListener?.('voiceschanged', escogerVoz);

export function hablar(texto, alTerminar) {
  if (!sintesis) return false;
  sintesis.cancel();
  if (!vozEs) escogerVoz();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = vozEs?.lang || 'es-CO';
  if (vozEs) u.voice = vozEs;
  u.rate = 0.95;
  u.onend = u.onerror = () => alTerminar?.();
  sintesis.speak(u);
  return true;
}
export const callar = () => sintesis?.cancel();

// Botón de bocina: lee el texto y vuelve a tocarlo para parar.
export function useLectura() {
  const [leyendo, setLeyendo] = useState(false);
  useEffect(() => () => callar(), []);
  const alternar = texto => {
    if (leyendo) { callar(); setLeyendo(false); return; }
    if (hablar(texto, () => setLeyendo(false))) setLeyendo(true);
  };
  return { leyendo, alternar };
}

// Dictado por voz.
const Reconocimiento = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
export const hayDictado = !!Reconocimiento;

export function useDictado(alTexto) {
  const [escuchando, setEscuchando] = useState(false);
  const rec = useRef(null);
  const iniciar = () => {
    if (!Reconocimiento) return false;
    const r = new Reconocimiento();
    r.lang = 'es-CO';
    r.interimResults = false;
    r.continuous = false;
    r.onresult = e => alTexto(Array.from(e.results).map(x => x[0].transcript).join(' '));
    r.onend = r.onerror = () => setEscuchando(false);
    rec.current = r;
    r.start();
    setEscuchando(true);
    return true;
  };
  const parar = () => { rec.current?.stop(); setEscuchando(false); };
  return { escuchando, alternar: () => (escuchando ? parar() : iniciar()) };
}
