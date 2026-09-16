// Increment VERSION whenever any app-shell asset changes. No user data is cached here.
const VERSION = 'v1.0.0';
const PREFIX = `yofukashi-pwa:${self.registration.scope}:`;
const CACHE = PREFIX + VERSION;
const ASSETS = ['./', './index.html', './style.css', './app.js', './datetime.js', './ics.js', './storage.js', './manifest.webmanifest', './LICENSE.txt', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  // An update waits until existing app windows close; avoid mixing module versions.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || !url.href.startsWith(self.registration.scope)) return;
  const isNavigation = event.request.mode === 'navigate';
  const key = isNavigation ? new URL('./index.html', self.registration.scope).href : event.request;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(key)) || fetch(event.request)));
});
