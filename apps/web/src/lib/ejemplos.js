// Casos de ejemplo para mostrar la app sin datos reales ("Ver un caso de ejemplo" en Inicio). Todo es inventado.
// Las fechas se calculan desde hoy, así no hace falta adelantar el calendario:
//   1. una petición entregada cuyo plazo vence en 2 días hábiles;
//   2. una petición vencida sin respuesta, que ofrece "No: crear la tutela".
// Llevan ejemplo: true (Mis casos los marca "Ejemplo") e ids fijos: cargarlos dos veces no los duplica.
import { TEMAS, PLAZOS, TIPOS, sumarHabiles, iso } from '@miderecho/nucleo';
import { almacen } from './almacen.js';
import { cancelarAvisos } from './avisos.js';

const IDS = ['ejemplo-1', 'ejemplo-2'];
const peticionDe = id => TEMAS.find(t => t.id === id).peticion;

// El día de entrega más reciente cuyo plazo vence a más tardar en `venc`.
function entregaPara(venc, plazo, hoy) {
  for (let k = 1; k < 60; k++) {
    const rad = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - k);
    if (iso(sumarHabiles(rad, plazo)) <= iso(venc)) return rad;
  }
}

export function casosEjemplo(hoy = new Date()) {
  const plazo = PLAZOS.general, t = TIPOS.peticion;
  const base = { tipo: 'peticion', titulo: t.titulo, icono: t.icono, municipio: 'Chaparral', vereda: 'La Esperanza', entidad: 'Alcaldía de Chaparral', plazo, modo: 'mano', estado: 'esperando', ejemplo: true };
  const porVencer = sumarHabiles(hoy, 2), rad1 = entregaPara(porVencer, plazo, hoy);
  const rad2 = entregaPara(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 10), plazo, hoy);
  return [
    { ...base, id: IDS[0], temaId: 'vias', peticiones: [peticionDe('vias'), 'Informar una fecha concreta para la solución.'], rad: iso(rad1), venc: iso(sumarHabiles(rad1, plazo)) },
    { ...base, id: IDS[1], temaId: 'agua', peticiones: [peticionDe('agua')], rad: iso(rad2), venc: iso(sumarHabiles(rad2, plazo)) },
  ];
}

export const cargarEjemplos = (hoy = new Date()) => casosEjemplo(hoy).forEach(c => almacen.guardarCaso(c));
export const hayEjemplos = () => almacen.casos().some(c => c.ejemplo);
// Borra los ejemplos y lo que salió de ellos (por ejemplo, la tutela de prueba), con sus avisos.
export function quitarEjemplos() {
  almacen.casos().filter(c => c.ejemplo).forEach(c => { cancelarAvisos(c.codigo); almacen.borrarCaso(c.id); });
}
