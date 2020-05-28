/* eslint-disable linebreak-style */
/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
// Script file to allow for offline first functionality.\r
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/js/db.js',
  '/assets/js/index.js',
  '/assets/styles/styles.css',
  '/manifest.webmanifest',
  '/assets/icons/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// Install listener to load a PWA\r
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Your files were pre-cached successfully!');
      return cache.addAll(FILES_TO_CACHE);
    }),
  );

  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => Promise.all(
      keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Removing old cache data', key);
          return caches.delete(key);
        }
      }),
    )),
  );

  self.clients.claim();
});

// fetch listener.
self.addEventListener('fetch', (evt) => {
  // cache successful requests to the API
  if (evt.request.url.includes('/api/')) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => fetch(evt.request)
          .then((response) => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }


            return response;
          })
          // eslint-disable-next-line no-unused-vars
          .catch((err) => cache.match(evt.request)))
        .catch((err) => console.log(err)),
    );


    return;
  }


  // if the request is not for the API, serve static assets using "offline-first" approach.
  // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
  evt.respondWith(
    caches.match(evt.request).then((response) => response || fetch(evt.request)),
  );
});
