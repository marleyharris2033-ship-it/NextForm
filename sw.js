// NextForm offline support.
// App files: try the network first (so updates show up straight away), but fall back to the
// saved copy if there's no signal or the network is too slow, as in many gyms.
// Firebase SDK files are versioned, so they're served from the saved copy once downloaded.
const CACHE = 'nextform-v2';
const APP_FILES = [
  './', 'index.html', 'styles.css', 'welcome.css', 'theme.css', 'app.js', 'welcome.js',
  'auth.js', 'sync-core.js', 'firebase-config.js', 'welcome-art.webp', 'icon.svg', 'manifest.json'
];
const SDK_HOST = 'www.gstatic.com';
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function fromCache(request) {
  const cache = await caches.open(CACHE);
  return (await cache.match(request, { ignoreSearch: true })) ||
    (request.mode === 'navigate' ? cache.match('index.html') : undefined);
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const network = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  network.catch(() => {}); // handled below; avoids unhandled-rejection noise when the cache wins
  const timeout = new Promise(resolve => setTimeout(resolve, NETWORK_TIMEOUT_MS));
  try {
    // If the network is slow and we have a saved copy, use it; the network result still updates the cache.
    const winner = await Promise.race([network, timeout.then(() => fromCache(request))]);
    if (winner) return winner;
    return await network;
  } catch {
    const cached = await fromCache(request);
    if (cached) return cached;
    throw new Error('offline and not cached');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) event.respondWith(networkFirst(request));
  else if (url.hostname === SDK_HOST && url.pathname.startsWith('/firebasejs/')) event.respondWith(cacheFirst(request));
  // Everything else (Google sign-in, Firestore) goes straight to the network.
});
