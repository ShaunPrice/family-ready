/* Family Cyber Ready — service worker: full offline shell + Android share target */
const VERSION = 'fcr-v1.4.0';
const SHELL = [
  './', './index.html', './trust.js', './styles.css', './fcr-core.js', './starter-plan.js', './starter-hazards.js', './regions.js', './app.js', './manifest.webmanifest',
  './coordinator.html', './coordinator.js',
  './fonts/ahn-400.woff2', './fonts/ahn-700.woff2', './fonts/ahn-800.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];
const OPTIONAL = ['./img/hero.webp', './img/hero-mobile.webp'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL).then(() => Promise.all(OPTIONAL.map((u) => c.add(u).catch(() => {}))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== 'fcr-share').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // Android: content shared to the installed app (SMS text, email/MMS attachment)
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      let text = '';
      try {
        const fd = await e.request.formData();
        const file = fd.get('file');
        if (file && typeof file.text === 'function' && file.size < 512 * 1024) text += (await file.text()) + '\n';
        text += (fd.get('text') || '') + '\n' + (fd.get('title') || '');
      } catch (err) {}
      const c = await caches.open('fcr-share');
      await c.put('shared-payload', new Response(text, { headers: { 'Content-Type': 'text/plain' } }));
      return Response.redirect('./?shared=1', 303);
    })());
    return;
  }
  if (e.request.method !== 'GET') return;

  // Cache-first: the app must work with no network. Updates to the app shell arrive when online.
  e.respondWith((async () => {
    const cached = await caches.match(e.request, { ignoreSearch: true });
    if (cached) {
      e.waitUntil(fetch(e.request).then((r) => { if (r && r.ok) return caches.open(VERSION).then((c) => c.put(e.request, r)); }).catch(() => {}));
      return cached;
    }
    try { return await fetch(e.request); }
    catch (err) {
      if (e.request.mode === 'navigate') return caches.match('./index.html');
      throw err;
    }
  })());
});
