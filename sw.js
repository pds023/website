/*
 * Service worker for philippefontaine.eu
 * --------------------------------------
 * Strategy:
 *   - Navigations (HTML): network-first, fall back to cache when offline.
 *     This guarantees visitors always get the freshest content when online.
 *   - Static assets (CSS/JS/fonts/images, same-origin or Google Fonts):
 *     stale-while-revalidate for instant repeat loads with a silent refresh.
 *
 * Bump CACHE_VERSION whenever the precached shell changes to evict old caches.
 */
"use strict";

const CACHE_VERSION = "pf-site-v1";

// Minimal app shell precached on install. Keep this list to assets that are
// guaranteed to exist; a single 404 would otherwise reject the whole install.
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/index-fr.html",
  "/css/reset.css",
  "/css/main.css",
  "/css/animations.css",
  "/css/bootstrap-grid.min.css",
  "/css/owl.carousel.css",
  "/css/perfect-scrollbar.css",
  "/js/main.js",
  "/img/main_photo.jpg",
  "/site.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET; let the browser deal with everything else.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Network-first for page navigations so content is never stale.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  const isCacheable =
    url.origin === self.location.origin ||
    url.hostname.endsWith("gstatic.com") ||
    url.hostname.endsWith("googleapis.com");

  if (!isCacheable) {
    return;
  }

  // Stale-while-revalidate for static assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
