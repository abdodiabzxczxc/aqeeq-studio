// Alaqeeq Studio Service Worker (Network-First Auto-Healing)
const CACHE_NAME = "aqeeq-studio-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Always Network-First so Chrome refreshes and new deployments never get stuck on an outdated bundle
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // For API, tRPC, or Vite dev requests, never intercept in ServiceWorker
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/@") || url.pathname.includes("node_modules")) {
    return;
  }

  // For HTML navigation, always fetch fresh from network to receive the latest chunk hashes
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/").then((cached) => cached || new Response("Offline", { status: 503 }));
      })
    );
    return;
  }

  // Network-First for JS/CSS assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        });
      })
  );
});
