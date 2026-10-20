/**
 * ========================================================
 * LUMY SYSTEM - SERVICE WORKER (sw.js)
 * Granja Avícola Lumy © 2026
 * ========================================================
 */

const CACHE_NAME = 'lumy-avicola-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/levante.html',
  '/config.json',
  '/do.js'
];

// Evento de Instalación: Guarda los recursos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caché abierta con éxito.');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((err) => {
      console.error('Service Worker: Error al guardar archivos en caché', err);
    })
  );
  self.skipWaiting();
});

// Evento de Activación: Limpia cachés antiguas si las hubiera
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.claim();
});

// Evento Fetch: Intercepta peticiones para servir desde la caché o la red
self.addEventListener('fetch', (event) => {
  // Evitamos interferir con las peticiones a Supabase (bases de datos en la nube)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Respuesta de respaldo en caso de que no haya conexión
        console.log('Service Worker: Sin conexión a internet para este recurso.');
      });
    })
  );
});
