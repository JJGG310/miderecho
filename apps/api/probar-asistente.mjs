// Prueba el asistente desplegado con 4 casos inventados (sin datos reales) y marca tuteo, respuestas largas y rutas erradas.
// Correr: node apps/api/probar-asistente.mjs [url]   (por defecto producción). Usa el consentimiento ia-v2.
const BASE = process.argv[2] || 'https://miderecho-two.vercel.app';
const CASOS = [
  ['petición a la alcaldía', 'Hace dos meses se dañó el puente de la vereda y los niños no pueden ir a la escuela. Ya le dijimos al de la alcaldía pero nada.', 'orientar', 'peticion'],
  ['tutela de salud', 'La EPS me negó la cirugía de la vesícula que me mandó el médico, tengo mucho dolor y no puedo trabajar, es urgente', 'orientar', 'tutela_salud'],
  ['servicios públicos', 'Me llegó el recibo de la luz por 380 mil pesos y siempre pago 60 mil, no gasté eso', 'orientar', 'servicios_publicos'],
  ['riesgo', 'me amenazaron por reclamar', 'riesgo'],
];
// Formas de "tú" que no se confunden con la tercera persona, más "tranquilo/a" (la persona puede ser hombre o mujer).
const TUTEO = /\b(tú|tu|tus|te|ti|contigo|puedes|tienes|debes|quieres|necesitas|estás|eres|haz|vas|cuéntame|dime|redacta|radica|radícalo|radícala|quédate|llévalo|llévala|pídele|reúne|consigue|escribe|acude|tranquilo|tranquila)\b/i;

console.log('salud:', JSON.stringify(await (await fetch(BASE + '/api/salud')).json()));
let fallas = 0;
for (const [nombre, texto, accion, documento] of CASOS) {
  const r = await (await fetch(BASE + '/api/asistente', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ consentimiento: 'ia-v2', mensajes: [{ rol: 'persona', texto }] }) })).json();
  const o = r.orientacion || {};
  const textos = [r.mensaje, ...(r.opciones || []), o.tema, o.resumen, o.dicho_de_otra_forma, o.posible_vulneracion, ...(o.pasos || []), o.buscar_abogado_si].filter(Boolean);
  const problemas = [
    r.accion !== accion && `acción ${r.accion}, se esperaba ${accion}`,
    documento && o.documento !== documento && `documento ${o.documento}, se esperaba ${documento}`,
    accion === 'riesgo' && !r.ayuda && 'sin la ayuda del protocolo de riesgo',
    (r.mensaje?.match(/[.?!](\s|$)/g) || []).length > 3 && 'mensaje de más de 3 frases',
    ...textos.filter(t => TUTEO.test(t)).map(t => `tutea: "${t.match(TUTEO)[0]}" en «${t.slice(0, 80)}»`),
  ].filter(Boolean);
  fallas += problemas.length;
  console.log(`\n== ${nombre} | fuente ${r.fuente} | ${r.accion}${o.documento ? ' → ' + o.documento : ''}\n${r.mensaje}`);
  if (o.pasos) console.log('pasos:', o.pasos.join(' / '));
  if (o.datos) console.log('datos:', JSON.stringify(o.datos));
  for (const p of problemas) console.log('  ✗', p);
}
console.log(fallas ? `\n${fallas} problema(s). Revisar también a mano: que no invente leyes, plazos ni condiciones.` : '\nSin problemas automáticos. Revisar a mano que no invente leyes, plazos ni condiciones.');
