const cacheName = "app-shell-v1";
const assetsToCache = [
  "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap",
  "https://cdn.jsdelivr.net/npm/dexie@4.2.1/+esm",
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
  "src/modules/app.js",
  "src/modules/GymLogService.js",
  "src/modules/HTMLService.js",
  "favicon.ico",
  "index.html",
  "/",
];

self.addEventListener("install", (event) => {
  console.log(`🚩 [sw.js] installing static assets...`);
  self.skipWaiting();
  event.waitUntil(cacheStaticAssets());
});

self.addEventListener("activate", (event) => {
  console.log(`🚩 [sw.js] activated`);
  event.waitUntil(cacheCleanup());
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  console.log(`🚩 [sw.js] request: ${request.url}`);
  event.respondWith(proxy(request));
});

async function cacheStaticAssets() {
  const cache = await caches.open(cacheName);
  return cache.addAll(assetsToCache);
}

async function removeOldCache(key) {
  if (key !== cacheName) {
    console.log(`🚩 [sw.js] removing old cache: ${key}`);
    return caches.delete(key);
  }
}

async function cacheCleanup() {
  const keyList = await caches.keys();
  return Promise.all(keyList.map(removeOldCache));
}

async function proxy(request) {
  // console.log(`🚩 [sw.js] proxying...`);
  const url = new URL(request.url);
  return networkFirst(request);
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(cacheName);
    const responseCached = await cache.match(request.url);
    if (!responseCached && request.headers.get("accept").startsWith("image/")) {
      return cache.match("src/assets/images/offline.svg");
    }
    return cache.match(request.url);
  }
}