import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// La API corre aparte (apps/api). En desarrollo, Vite le pasa las llamadas a /api.
// En producción, VITE_API_URL apunta al backend desplegado.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MiDerecho',
        short_name: 'MiDerecho',
        description: 'Sus derechos, explicados fácilmente. Funciona sin internet.',
        lang: 'es-CO',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff5e4',
        theme_color: '#264933',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Todo el modo sin conexión (textos, historietas y las poses del búho) queda guardado en el celular.
        globPatterns: ['**/*.{js,css,html,png,svg,webp}'],
        navigateFallbackDenylist: [/^\/api\//],
        importScripts: ['sw-avisos.js'],   // notificaciones push de los plazos (public/sw-avisos.js)
        // Audios de los textos fijos con la voz de la asistente (lib/voz.js): la URL lleva la huella del texto, así que el
        // primero que llega se queda; la próxima vez suenan sin internet y sin gastar datos ni créditos.
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname === '/api/elevenlabs-sesion' && url.searchParams.has('lectura'),
          handler: 'CacheFirst',
          options: { cacheName: 'lecturas', cacheableResponse: { statuses: [200] }, expiration: { maxEntries: 120, maxAgeSeconds: 365 * 86400 } },
        }],
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:8787' } },
});
