// Service worker per uso offline + aggiornamenti automatici.
// Strategia: NETWORK-FIRST (online = sempre l'ultima versione),
// con fallback alla cache quando si è offline.
const CACHE = 'zauberzahlen-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/i18n.js',
  './js/storage.js',
  './js/audio.js',
  './js/ui.js',
  './js/games/subitizing.js',
  './js/games/fives.js',
  './js/games/bonds.js',
  './js/games/addition.js',
  './js/games/subtraction.js',
  './js/parent.js',
  './js/app.js',
  './assets/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: prova la rete (così online si ha sempre l'ultima versione),
// aggiorna la cache, e se la rete manca usa la copia salvata.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
