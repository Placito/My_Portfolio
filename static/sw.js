self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            console.log('Service Worker: Caching assets...');
            return cache.addAll([
                '/',
                '/templates/index.html',
                '/templates/privacy_policy.html',
                '/templates/terms.html',
                '/static/css/style.min.css',
                '/static/js/script.js',
                '/static/img/banner.avif',
                '/static/img/icon-144x144.png',
                '/static/manifest.json',
                '/offline.html' // Add offline page to cache
            ]);
        }).catch(function(error) {
            console.error('Failed to open cache:', error);
        })
    );
});


// Activate event: clean up old caches and take control of clients
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cache) {
                    if (cache !== 'my-cache') {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(function() {
            console.log('Service Worker: Claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event: serve cached content if available, otherwise fetch from network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                console.log('Service Worker: Fetching from cache', event.request.url);
                return response;
            }
            console.log('Service Worker: Fetching from network', event.request.url);
            return fetch(event.request).then(function(networkResponse) {
                return caches.open('my-cache').then(function(cache) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(function(error) {
                console.error('Network fetch failed for:', event.request.url, error);
                return caches.match('/offline.html'); // Serve a fallback offline page if network fails
            });
        }).catch(function(error) {
            console.error('Cache match failed for:', event.request.url, error);
            return caches.match('/offline.html'); // Serve a fallback offline page if cache match fails
        })
    );
});

// Push event: display notifications
self.addEventListener('push', function(event) {
    const data = event.data.json();
    console.log('Service Worker: Push received', data);
    const options = {
        body: data.body,
        icon: '/static/img/maskable-icon.png' // Ensure this path is correct
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
