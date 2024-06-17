self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');

    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll([
                '/templates/index.html',
                '/static/style.min.css',
                '/static/script.js',
                '/static/sw.js'
            ]).catch(function(error) {
                console.error('Failed to add resource to cache:', error);
            });
        }).catch(function(error) {
            console.error('Failed to open cache:', error);
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('Service worker fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).then(function(networkResponse) {
                return networkResponse;
            }).catch(function(error) {
                console.error('Network fetch failed for:', event.request.url, error);
                return new Response('Network fetch failed', {
                    status: 408,
                    statusText: 'Request Timeout'
                });
            });
        }).catch(function(error) {
            console.error('Cache match failed for:', event.request.url, error);
            return new Response('Cache match failed', {
                status: 408,
                statusText: 'Request Timeout'
            });
        })
    );
});
