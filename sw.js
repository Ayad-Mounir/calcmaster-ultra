const CACHE = "cu-v2-2";
const VERSION_CHECK = "/calcmaster-ultra/version.json";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll([
        "/calcmaster-ultra/",
        "/calcmaster-ultra/index.html",
        "/calcmaster-ultra/style.css",
        "/calcmaster-ultra/script.js",
        "/calcmaster-ultra/icon.svg",
        "/calcmaster-ultra/manifest.json",
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) =>
      Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Bypass version.json — always fetch from network
  if (e.request.url.includes("version.json")) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"version":"2.1"}', {headers:{"Content-Type":"application/json"}})));
    return;
  }
  // For navigation, try network first, fallback to cache
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request).then((r) => r || caches.match("/calcmaster-ultra/index.html")))
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      let c = caches.open(CACHE);
      c.then((cache) => cache.put(e.request, res.clone()));
      return res;
    }))
  );
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
