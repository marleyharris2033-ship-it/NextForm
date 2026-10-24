// NextForm offline support.
// App files: try the network first (so updates show up straight away), but fall back to the
// saved copy if there's no signal or the network is too slow, as in many gyms.
// Firebase SDK files are versioned, so they're served from the saved copy once downloaded.
const CACHE = 'nextform-v32';
const APP_FILES = [
  './', 'index.html', 'ui.css', 'welcome.css', 'fonts/bricolage-grotesque.woff', 'app.js', 'welcome.js',
  'workout-types.js', 'rpg.js', 'common-foods.js', 'meal-suggest.js', 'adaptive.js', 'encourage.js', 'food.js', 'coach.js', 'today-session.js', 'figures.js', 'stretch-data.js', 'train.js', 'guided.js', 'stretch.js', 'plans.js', 'log-edit.js', 'insights.js', 'share.js', 'label-reader.js', 'recipe-data.js', 'recipes.js', 'goals.js', 'story.js', 'social.js', 'privacy.html', 'terms.html', 'credits.html', 'legal.css', 'auth.js', 'sync-core.js', 'firebase-config.js', 'welcome-art.webp', 'train-hero.webp', 'logo-mark.png', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/favicon-32.png', 'manifest.json'
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
  // The barcode reader library and its engine are pinned versions, so a saved copy never goes stale.
  else if (/(^|\.)jsdelivr\.net$/.test(url.hostname) && /^\/npm\/(barcode-detector|zxing-wasm)@/.test(url.pathname)) event.respondWith(cacheFirst(request));
  // Everything else (Google sign-in, Firestore, food lookups) goes straight to the network.
});
