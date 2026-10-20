// Guarda la app en el celular para que funcione sin internet. Cambiar CACHE cada vez que se publiquen cambios.
const CACHE = 'miderecho-v3';
const ARCHIVOS = ['./', 'index.html', 'styles.css', 'app.js', 'plazos.js', 'contenido.js', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
