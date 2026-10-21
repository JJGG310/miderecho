import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Encabezado, Titulo, Confirmar, Aviso } from '../componentes/comunes.jsx';
import { almacen } from '../lib/almacen.js';

// Crear la clave o desbloquear. Protege Mis casos e Historial en un celular compartido.
export default function Clave() {
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [olvido, setOlvido] = useState(false);
  const [borrado, setBorrado] = useState(false);
  const nuevo = !almacen.hayClave();

  const entrar = async e => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) return setError('La clave son 4 números.');
    if (nuevo && pin !== pin2) return setError('Las dos claves no son iguales. Escríbalas otra vez.');
    setOcupado(true); setError('');
    try { await (nuevo ? almacen.crear(pin) : almacen.abrir(pin)); }
    catch { setError('Clave incorrecta. Intente otra vez.'); setPin(''); setOcupado(false); }
  };
  const campo = (valor, cambiar, etiqueta) => (
    <label className="campo campo-clave">
      <span className="etiqueta">{etiqueta}</span>
      <input type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="off" value={valor}
        onChange={e => { cambiar(e.target.value.replace(/\D/g, '')); setError(''); }} required />
    </label>
  );

  return (
    <main className="pantalla">
      <Encabezado />
      <Titulo icono={Lock} volver={false} lectura={nuevo
        ? 'Cree su clave. Elija 4 números. Protegen sus casos y su historial en este celular, por si alguien más lo usa.'
        : 'Escriba su clave de 4 números para ver sus casos y su historial.'}>{nuevo ? 'Cree su clave' : 'Escriba su clave'}</Titulo>
      <p className="texto">{nuevo
        ? 'Elija 4 números. Protegen sus casos y su historial en este celular, por si alguien más lo usa. Anótela en un lugar seguro.'
        : 'Para ver sus casos y su historial guardados en este celular.'}</p>

      <form className="formulario" onSubmit={entrar}>
        {campo(pin, setPin, nuevo ? 'Clave de 4 números' : 'Su clave')}
        {nuevo && campo(pin2, setPin2, 'Repita la clave')}
        {error && <p className="falta" role="alert">{error}</p>}
        <button className="btn-primario" type="submit" disabled={ocupado}>{ocupado ? 'Revisando…' : nuevo ? 'Guardar mi clave' : 'Entrar'}</button>
      </form>
      {!nuevo && <button className="btn-enlace" onClick={() => setOlvido(true)}>Olvidé la clave (borra todo)</button>}

      {olvido && (
        <Confirmar titulo="¿Borrar todo para crear otra clave?" si="Sí, borrar todo"
          alNo={() => setOlvido(false)}
          alSi={() => { almacen.borrarTodo(); setOlvido(false); setPin(''); setBorrado(true); }}>
          Sin la clave no se pueden abrir sus casos ni su historial. Se borran de este celular y no se pueden recuperar.
        </Confirmar>
      )}
      {borrado && <Aviso alCerrar={() => setBorrado(false)}>Listo. Se borró todo. Ahora cree una clave nueva.</Aviso>}
    </main>
  );
}
