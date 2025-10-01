// Service Worker for Cache Management
// Version 3.0 - Updated for nickname feature

const CACHE_NAME = 'mamurbeta-ovijog-box-v3.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/inbox.html',
    '/css/style.css',
    '/css/admin.css',
    '/js/main.js',
    '/js/inbox.js',
    '/firebase-config.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing version', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating version', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Claim any clients immediately
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip Firebase and external requests
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('gstatic')) {
        return;
    }

    event.respondWith(
        // Try network first for HTML files to get latest content
        fetch(event.request)
            .then(function(response) {
                // If we got a response, clone it and store in cache
                if (response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(function() {
                // Network failed, try cache
                return caches.match(event.request)
                    .then(function(response) {
                        if (response) {
                            console.log('Service Worker: Serving from cache', event.request.url);
                            return response;
                        }
                        // If not in cache, return a custom offline page or error
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Message event - handle cache updates from main thread
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('Service Worker: Cache cleared');
        });
    }
});