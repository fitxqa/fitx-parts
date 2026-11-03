// FitX Parts — offline support for the installed website.
// Page and settings: network first (so updates arrive), cached copy when offline.
// Fonts, Firebase SDK and icons: cache first.
const CACHE = "fitx-parts-v1";
const CORE = [
  "./", "index.html", "firebase-config.js", "manifest.webmanifest",
  "vendor/firebase-app-compat.js", "vendor/firebase-auth-compat.js", "vendor/firebase-firestore-compat.js",
  "icon.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2",
  "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/ibm-plex-mono-latin-600-normal.woff2",
  "fonts/saira-semi-condensed-latin-600-normal.woff2", "fonts/saira-semi-condensed-latin-700-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase, Google sign-in and Drive go straight to the network

  const networkFirst = req.mode === "navigate" || /\/(index\.html|firebase-config\.js|manifest\.webmanifest)?$/.test(url.pathname) || url.pathname.endsWith("firebase-config.js");
  if (networkFirst) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
  } else {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
  }
});
