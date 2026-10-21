import './_alias.js';
// /api/documento: lo atiende el backend de apps/api (Express). Vercel publica esta carpeta porque la raíz del proyecto es prototipo/.
import { app } from '../../apps/api/src/app.js';
export default app;
