// Lectura en voz alta y dictado.
// - Lectura: los textos fijos de la app suenan con la voz de la asistente (ElevenLabs, packages/nucleo/src/lectura.js) y
//   el celular los guarda para oírlos sin internet. Si no hay audio (sin internet la primera vez, sin clave, sin créditos)
//   o el texto no es fijo, lee la voz del celular, que funciona sin internet.
// - Dictado: SpeechRecognition del navegador (en Chrome manda el audio a Google). Si falla, dice por qué.
import { useEffect, useRef, useState } from 'react';
import { urlLectura } from '@miderecho/nucleo/lectura';

const sintesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
let vozEs = null;
function escogerVoz() {
  // Primero las voces del propio celular (localService): no mandan el texto a internet. Luego es-CO, es-US y cualquier español.
  const puntos = v => (v.localService ? 0 : 3) + (v.lang === 'es-CO' ? 0 : v.lang === 'es-US' ? 1 : 2);
  vozEs = (sintesis?.getVoices() || []).filter(v => v.lang?.startsWith('es')).sort((a, b) => puntos(a) - puntos(b))[0] || null;
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

let audio = null, alCortar = null;   // el audio que suena y cómo avisar a su botón si otro lo interrumpe
export function callar() {
  sintesis?.cancel();
  if (audio) { audio.pause(); audio = null; }
  const f = alCortar;
  alCortar = null;
  f?.();
}

// Reproduce en orden los audios de esas claves; si uno falla, lee el texto completo con la voz del celular.
// Se descarga el mp3 entero (pocos KB a 32 kbps) para que el service worker lo guarde y suene sin internet la próxima vez.
export function leerAudios(claves, texto, alTerminar) {
  callar();
  let i = 0;
  const fin = () => { if (alCortar === fin) alCortar = null; audio = null; alTerminar?.(); };
  alCortar = fin;
  const conVozDelCelular = () => {
    if (alCortar !== fin) return;
    alCortar = null;
    audio = null;
    if (!hablar(texto, alTerminar)) alTerminar?.();
  };
  const siguiente = () => {
    if (alCortar !== fin) return;   // otro botón o "parar" lo cortó
    if (i >= claves.length) return fin();
    const a = audio = new Audio();
    a.onended = () => { URL.revokeObjectURL(a.src); if (audio === a) siguiente(); };
    a.onerror = () => { if (audio === a) conVozDelCelular(); };
    fetch(urlLectura(claves[i++]))
      .then(r => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
      .then(b => { if (audio !== a) return; a.src = URL.createObjectURL(b); return a.play(); })
      .catch(() => { if (audio === a) conVozDelCelular(); });
  };
  siguiente();
}

// Botón de bocina: lee el texto (con la voz de la asistente si trae claves de audio) y vuelve a tocarlo para parar.
export function useLectura() {
  const [leyendo, setLeyendo] = useState(false);
  useEffect(() => () => callar(), []);
  const alternar = (texto, claves) => {
    if (leyendo) { callar(); setLeyendo(false); return; }
    const parar = () => setLeyendo(false);
    if (claves?.length) { leerAudios(claves, texto, parar); setLeyendo(true); return; }
    callar();
    if (hablar(texto, parar)) setLeyendo(true);
  };
  return { leyendo, alternar };
}

// ---------- Dictado ----------
const Reconocimiento = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
export const hayDictado = !!Reconocimiento;

// Qué decirle a la persona según el error del navegador. otraVoz: el dictado de este navegador no sirve aquí, pero la
// asistente de voz (ElevenLabs, otro servicio) puede funcionar. Con el micrófono bloqueado o ausente no serviría.
const SIN_SERVICIO = { otraVoz: true, texto: 'El dictado no funciona en este navegador. Puede escribir o hablar con la asistente de voz, que usa otro servicio.' };
const FALLAS = {
  'no-speech': { otraVoz: false, otraVez: true, texto: 'No le escuchamos. Toque de nuevo y hable cerca del celular, o escriba.' },
  'not-allowed': { otraVoz: false, texto: 'El navegador no dejó usar el micrófono. Dele permiso (en el candado, junto a la dirección) o escriba.' },
  'audio-capture': { otraVoz: false, texto: 'No encontramos un micrófono. Puede escribir.' },
};
export const fallaDictado = error => ({ tipo: error, ...(FALLAS[error] || SIN_SERVICIO) });

export function useDictado(alTexto) {
  const [escuchando, setEscuchando] = useState(false);
  const [falla, setFalla] = useState(null);
  const rec = useRef(null);
  const iniciar = () => {
    setFalla(null);
    if (!Reconocimiento) { setFalla(fallaDictado('sin-dictado')); return false; }
    const r = new Reconocimiento();
    let oyo = false, error = null;
    r.lang = 'es-CO';
    r.interimResults = false;
    r.continuous = false;
    r.onresult = e => { oyo = true; alTexto(Array.from(e.results).map(x => x[0].transcript).join(' ')); };
    r.onerror = e => { error = e.error || 'desconocido'; };
    r.onend = () => {
      setEscuchando(false);
      if (rec.current !== r || error === 'aborted') return;
      if (error || !oyo) setFalla(fallaDictado(error || 'no-speech'));
    };
    rec.current = r;
    try { r.start(); } catch { setFalla(fallaDictado('sin-servicio')); return false; }
    setEscuchando(true);
    return true;
  };
  const parar = () => { rec.current?.stop(); setEscuchando(false); };
  return { escuchando, falla, olvidarFalla: () => setFalla(null), alternar: () => (escuchando ? parar() : iniciar()) };
}
