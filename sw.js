const CACHE_VERSION = 'v5';
const CACHE_NAME = `itinerary-${CACHE_VERSION}`;
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'data.json',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'ticketFast_1.pdf',
  'ticketFast_2.pdf',
];

// Files that should try network first (so updates appear quickly)
const NETWORK_FIRST = ['data.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isNetworkFirst = NETWORK_FIRST.some((f) => url.pathname.endsWith(f));

  if (isNetworkFirst) {
    // Network first: try fresh data, fall back to cache when offline
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first: fast loads for static assets
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
