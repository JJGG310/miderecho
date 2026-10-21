import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Encabezado, Titulo, Confirmar, Aviso } from '../componentes/comunes.jsx';
import { almacen } from '../lib/almacen.js';
import { cancelarTodo } from '../lib/avisos.js';

// Crear la clave o desbloquear. Protege Mis casos e Historial en un celular compartido.
export default function Clave() {
  const nuevo = !almacen.hayClave();
  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo icono={Lock} volver={false} lectura={nuevo
        ? 'Cree su clave. Elija 4 números. Protegen sus casos y su historial en este celular, por si alguien más lo usa.'
        : 'Escriba su clave de 4 números para ver sus casos y su historial.'}>{nuevo ? 'Cree su clave' : 'Escriba su clave'}</Titulo>
      <FormClave motivo={nuevo
        ? 'Elija 4 números. Protegen sus casos y su historial en este celular, por si alguien más lo usa. Anótela en un lugar seguro.'
        : 'Para ver sus casos y su historial guardados en este celular.'} />
    </main>
  );
}

// El formulario solo, para pedir la clave en el mismo paso donde se va a guardar algo (documento, orientación).
export function FormClave({ motivo, enTarjeta = false }) {
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [olvido, setOlvido] = useState(false);
  const [borrado, setBorrado] = useState(false);
  const nuevo = !almacen.hayClave();

  const entrar = async e => {
    e?.preventDefault();
    if (!/^\d{4}$/.test(pin)) return setError('La clave son 4 números.');
    if (nuevo && pin !== pin2) return setError('Las dos claves no son iguales. Escríbalas otra vez.');
    // Sin https (por ejemplo, abriendo la app por la IP del computador) el navegador no deja cifrar.
    if (!globalThis.crypto?.subtle) return setError('Esta función necesita conexión segura (https). Abra la app desde su dirección con https.');
    setOcupado(true); setError('');
    try { await (nuevo ? almacen.crear(pin) : almacen.abrir(pin)); }
    catch { setError(nuevo ? 'No se pudo guardar la clave. Intente otra vez.' : 'Clave incorrecta. Intente otra vez.'); setPin(''); setOcupado(false); }
  };
  const campo = (valor, cambiar, etiqueta) => (
    <label className="campo campo-clave">
      <span className="etiqueta">{etiqueta}</span>
      <input type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="off" value={valor}
        onChange={e => { cambiar(e.target.value.replace(/\D/g, '')); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') entrar(e); }} />
    </label>
  );

  return (
    <div className={enTarjeta ? 'tarjeta clara formulario' : 'formulario'}>
      {enTarjeta && <h2><Lock size={22} aria-hidden /> {nuevo ? 'Cree su clave' : 'Escriba su clave'}</h2>}
      {motivo && <p className="texto">{motivo}</p>}
      {/* Sin <form>: también se usa dentro del formulario del documento. */}
      <div className="formulario">
        {campo(pin, setPin, nuevo ? 'Clave de 4 números' : 'Su clave')}
        {nuevo && campo(pin2, setPin2, 'Repita la clave')}
        {error && <p className="falta" role="alert">{error}</p>}
        <button className="btn-primario" type="button" onClick={entrar} disabled={ocupado}>{ocupado ? 'Revisando…' : nuevo ? 'Guardar mi clave' : 'Entrar'}</button>
      </div>
      {!nuevo && <button type="button" className="btn-enlace" onClick={() => setOlvido(true)}>Olvidé la clave (borra todo)</button>}

      {olvido && (
        <Confirmar titulo="¿Borrar todo para crear otra clave?" si="Sí, borrar todo"
          alNo={() => setOlvido(false)}
          alSi={() => { cancelarTodo(); almacen.borrarTodo(); setOlvido(false); setPin(''); setBorrado(true); }}>
          Sin la clave no se pueden abrir sus casos ni su historial. Se borran de este celular, se cancelan sus recordatorios y no se pueden recuperar.
        </Confirmar>
      )}
      {borrado && <Aviso alCerrar={() => setBorrado(false)}>Listo. Se borró todo. Ahora cree una clave nueva.</Aviso>}
    </div>
  );
}
