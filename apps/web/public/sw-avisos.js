// Notificaciones push de los plazos. Las manda el cron del servidor (prototipo/api/recordatorios.js, canal push).
// vite-plugin-pwa lo carga en el service worker con importScripts (vite.config.js). El texto ya viene sin datos
// sensibles: "Su caso ABCD vence mañana." Título neutro ("Recordatorio"): el celular puede ser compartido.
self.addEventListener('push', e => {
  let texto = 'Tiene un aviso de sus casos.';
  try { texto = e.data.json().texto || texto; } catch { /* aviso sin datos: texto genérico */ }
  e.waitUntil(self.registration.showNotification('Recordatorio', { body: texto, icon: 'icon-192.png', lang: 'es-CO' }));
});

// Al tocar la notificación se abre (o se trae al frente) la app en Mis casos.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL('./#/casos', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async ([w]) => {
    if (!w) return self.clients.openWindow(url);
    await w.focus();
    return w.navigate(url).catch(() => {});
  }));
});
