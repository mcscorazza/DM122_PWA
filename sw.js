const cacheName = "app-shell-v1";
const CDN_CACHE = "cdn-assets-v1";

const lucideUrl = "https://unpkg.com/lucide@0.553.0/dist/umd/lucide.min.js";
const dexieUrl = "https://cdn.jsdelivr.net/npm/dexie@4.2.1/+esm";

const assetsToCache = [
  "src/css/components.css",
  "src/css/exercises.css",
  "src/css/header.css",
  "src/css/main.css",
  "src/css/pages.css",
  "src/css/routines.css",
  "src/css/styles.css",
  "src/assets/default.png",
  "src/assets/biceps.png",
  "src/assets/leg-press.png",
  "src/assets/icons/gym-48x48.png",
  "src/assets/icons/gym-96x96.png",
  "src/assets/icons/gym-144x144.png",
  "src/assets/icons/gym-192x192.png",
  "src/assets/icons/gym-310x310.png",
  "src/assets/supino.png",
  "src/assets/offline.png",
  "src/modules/app.js",
  "src/modules/GymLogService.js",
  "src/modules/HTMLService.js",
  "favicon.ico",
  "/",
];

self.addEventListener("install", (event) => {
  console.log(`🚩 [sw.js] installing static assets...`);
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(cache => {
      console.log(`🚩 [sw.js] Caching App Shell`);
      return cache.addAll(assetsToCache);
    }).then(() => {
      return caches.open(CDN_CACHE).then(cache => {
        console.log(`🚩 [sw.js] Caching CDN assets`);
        return cache.addAll([dexieUrl, lucideUrl]);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log(`🚩 [sw.js] activated`);
  const currentCaches = [APP_SHELL_CACHE, CDN_CACHE];
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (!currentCaches.includes(key)) {
          console.log(`🚩 [sw.js] removing old cache: ${key}`);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cachedResponse = await cache.match(request);
  return cachedResponse || fetch(request).catch(async () => {
    if (request.headers.get("accept").startsWith("image/")) {
      return cache.match("src/assets/offline.png");
    }
    return;
  });
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CDN_CACHE);
  const cachedResponse = await cache.match(request);
  const networkFetch = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(err => {
    console.warn(`🚩 [sw.js] CDN fetch failed: ${request.url}`, err);
  });
  return cachedResponse || networkFetch;
}