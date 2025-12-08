/**
 * Service Worker for Solar System Explorer PWA
 * Enables offline functionality
 */

const CACHE_NAME = 'solar-explorer-v3';

// Only cache essential files that definitely exist
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles/style.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching essential files...');
                // Use addAll with only essential files, rest will be cached on demand
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Essential files cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.warn('[SW] Cache failed, continuing without cache:', error);
                return self.skipWaiting();
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim();
            })
    );
});

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
                    // Cache the fresh response
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseToCache))
                            .catch(() => {});
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Offline: try cache, but only return the EXACT page requested
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

                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseToCache))
                            .catch(() => {});

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
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
