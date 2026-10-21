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
        // Todo el modo sin conexión (textos y cuadros de las historietas, ~230 KB) queda guardado en el celular.
        globPatterns: ['**/*.{js,css,html,png,svg,webp}'],
        navigateFallbackDenylist: [/^\/api\//],
        importScripts: ['sw-avisos.js'],   // notificaciones push de los plazos (public/sw-avisos.js)
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:8787' } },
});
