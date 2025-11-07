const cacheName = "app-shell-v4";
const assetsToCache = [
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
  // console.log(`🚩 [sw.js] request: ${request.url}`);
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