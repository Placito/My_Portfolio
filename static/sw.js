// Listen for the 'install' event, which is fired when the service worker is installed
self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
    // Perform install steps, e.g., caching static assets
    // event.waitUntil() can be used here to wait until the caching is complete
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll([
                // List of assets to cache
                '/index.html',
                '/styles.css',
                '/script.js',
                // Add other assets here
            ]);
        })
    );
});

// Listen for the 'activate' event, which is fired when the service worker is activated
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating.');
    // Perform activate steps, e.g., clearing old caches
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== 'my-cache') {
                        console.log('Service Worker removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Listen for the 'fetch' event, which is fired for every network request
self.addEventListener('fetch', function(event) {
    console.log('Service Worker fetching:', event.request.url);
    // Respond to network requests
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Cache hit - return the response from the cached version
            if (response) {
                return response;
            }
            // Not in cache - return the result from the live server
            return fetch(event.request).then(function(response) {
                // Cache the new response for future requests
                return caches.open('my-cache').then(function(cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(function() {
            // Handle errors
            return caches.match('/offline.html');
        })
    );
});

// Listen for the 'push' event, which is fired when a push notification is received
self.addEventListener('push', function(event) {
    console.log('Service Worker received a push message.');
    // Customize and show a notification
    const title = 'Push Notification';
    const options = {
        body: event.data ? event.data.text() : 'Default body',
        icon: '/icon.png',
        badge: '/badge.png'
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
