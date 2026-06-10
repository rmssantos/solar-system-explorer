/**
 * Service Worker for Solar System Explorer PWA
 * Enables offline functionality.
 *
 * NOTE: CSS/JS are content-hashed into /assets/ by Vite, so they are runtime-
 * cached on demand (network-first) rather than precached by path. Only the
 * HTML shell is precached. Bump CACHE_VERSION when unhashed public/ assets
 * (textures, mascot art) change, so returning clients pick them up.
 */

const CACHE_VERSION = 'v4';
const SHELL_CACHE = `solar-explorer-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `solar-explorer-runtime-${CACHE_VERSION}`;
// Cap on runtime cache entries: bounds growth from textures + old hashed
// bundles accumulating across deploys (oldest entries are evicted first).
const RUNTIME_MAX_ENTRIES = 80;

const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/biblioteca.html'
];

// Install event - precache the HTML shell.
// Each entry is added individually: one failure must not void the others
// (cache.addAll is atomic and used to silently kill the whole precache).
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => Promise.allSettled(
                SHELL_ASSETS.map((url) => cache.add(url).catch((err) => {
                    console.warn('[SW] Failed to precache', url, err);
                }))
            ))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean caches from older versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== SHELL_CACHE && cacheName !== RUNTIME_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            ))
            .then(() => self.clients.claim())
    );
});

/** Evict oldest entries above the cap (Cache keys preserve insertion order). */
async function trimRuntimeCache() {
    try {
        const cache = await caches.open(RUNTIME_CACHE);
        const keys = await cache.keys();
        if (keys.length <= RUNTIME_MAX_ENTRIES) return;
        const excess = keys.length - RUNTIME_MAX_ENTRIES;
        await Promise.all(keys.slice(0, excess).map((req) => cache.delete(req)));
    } catch {
        // Cache trim is best-effort
    }
}

function putInRuntimeCache(request, response) {
    caches.open(RUNTIME_CACHE)
        .then((cache) => cache.put(request, response))
        .then(() => trimRuntimeCache())
        .catch(() => {});
}

// Fetch event - NETWORK-FIRST for HTML/JS, cache-first for assets
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests (like CDN)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    const url = new URL(event.request.url);
    const isHTML = event.request.headers.get('accept')?.includes('text/html') ||
                   url.pathname.endsWith('.html') ||
                   url.pathname === '/';
    const isJS = url.pathname.endsWith('.js');

    // NETWORK-FIRST for HTML and JS files (always get fresh content)
    if (isHTML || isJS) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        putInRuntimeCache(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Offline: try caches, but only return the EXACT page requested
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) return cachedResponse;
                            // Only fallback to index.html if that's what was requested
                            if (url.pathname === '/' || url.pathname === '/index.html') {
                                return caches.match('/index.html');
                            }
                            return new Response('Offline - Page not cached', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
        return;
    }

    // CACHE-FIRST for assets (images, CSS, etc.)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        putInRuntimeCache(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                    .catch(() => {
                        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                    });
            })
            .catch(() => fetch(event.request))
    );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.source && event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
