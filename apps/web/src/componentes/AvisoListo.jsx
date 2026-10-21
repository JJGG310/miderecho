import { useState } from 'react';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { useConexion } from '../lib/conexion.jsx';
import './voz.css';

// "Avísame por mensaje": un SMS o WhatsApp con "su documento quedó listo" y el código del caso, solo con autorización
// expresa. El texto lo pone el servidor (prototipo/api/_avisos.js): solo lleva el código. El número no se guarda.
// Uso: <AvisoListo codigo="K7P2" /> donde se muestra el documento terminado.
export default function AvisoListo({ codigo }) {
  const { enLinea } = useConexion();
  const [canal, setCanal] = useState('sms');
  const [telefono, setTelefono] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [estado, setEstado] = useState(null);   // null | 'enviando' | { ok, texto }
  const valido = /^(\+?57)?3\d{9}$/.test(telefono.replace(/[\s().-]/g, ''));

  const enviar = async e => {
    e.preventDefault();
    if (!valido || !acepto || !enLinea) return;
    setEstado('enviando');
    try {
      const r = await fetch(`/api/${canal}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantilla: 'documento_listo', telefono, datos: { codigo } }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'No se pudo enviar');
      setTelefono(''); setAcepto(false);   // ni el número ni la autorización quedan en pantalla
      setEstado({ ok: true, texto: j.simulado ? 'Modo de prueba: el mensaje no se envió de verdad.' : 'Listo. Te llegará en unos minutos.' });
    } catch (err) {
      setEstado({ ok: false, texto: navigator.onLine ? err.message : 'Se perdió la conexión. No se envió nada.' });
    }
  };

  return (
    <section className="tarjeta clara aviso-listo">
      <h2><MessageSquareText size={18} aria-hidden /> ¿Te avisamos por mensaje?</h2>
      <p className="suave">Te mandamos el código <b>{codigo}</b> para que lo tengas a mano. El mensaje solo dice que tu documento quedó listo y el código: nada de tu caso, tu nombre ni tu cédula.</p>
      <form className="formulario" onSubmit={enviar}>
        <div className="botones-opcion" role="group" aria-label="Por dónde">
          {[['sms', 'SMS'], ['whatsapp', 'WhatsApp']].map(([id, t]) => (
            <button key={id} type="button" className={canal === id ? 'sel' : ''} aria-pressed={canal === id} onClick={() => setCanal(id)}>{t}</button>
          ))}
        </div>
        <label className="campo">
          <span className="etiqueta">Celular</span>
          <input type="tel" inputMode="numeric" autoComplete="off" placeholder="300 123 4567" value={telefono} onChange={e => setTelefono(e.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={acepto} onChange={e => setAcepto(e.target.checked)} />
          <span>Autorizo que MiDerecho me envíe este único mensaje por {canal === 'sms' ? 'SMS' : 'WhatsApp'} a ese celular. El número no se guarda.</span>
        </label>
        <button className="btn-primario" type="submit" disabled={!valido || !acepto || !enLinea || estado === 'enviando'}>
          {estado === 'enviando' ? <><Loader2 className="girar" size={18} aria-hidden /> Enviando…</> : 'Enviar el aviso'}
        </button>
        {estado?.texto && <p className={estado.ok ? 'suave' : 'ayuda error'} role="status">{estado.texto}</p>}
      </form>
    </section>
  );
}
