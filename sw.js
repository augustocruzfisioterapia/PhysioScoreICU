const CACHE_NAME = 'physioscore-icu-v1.0.2';

const BASE_PATH = '/PhysioScoreICU';

const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/assets/icons/favicon-16x16.png`,
  `${BASE_PATH}/assets/icons/favicon-32x32.png`,
  `${BASE_PATH}/assets/icons/apple-touch-icon.png`,
  `${BASE_PATH}/assets/icons/icon-192x192.png`,
  `${BASE_PATH}/assets/icons/icon-512x512.png`,
  `${BASE_PATH}/assets/icons/icon-maskable-192x192.png`,
  `${BASE_PATH}/assets/icons/icon-maskable-512x512.png`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });

            return networkResponse;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match(`${BASE_PATH}/index.html`);
            }
          });
      })
  );
});
