self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll([
                cache.add('/templates/index.html').catch(e => console.error('Failed to cache /templates/index.html:', e)),
                cache.add('/static/style.min.css').catch(e => console.error('Failed to cache /static/style.min.css:', e)),
                cache.add('/static/script.js').catch(e => console.error('Failed to cache /static/script.js:', e)),
                cache.add('/static/sw.js').catch(e => console.error('Failed to cache /static/sw.js:', e))
            ]).catch(function(error) {
                console.error('Failed to add resource to cache:', error);
            });
        }).catch(function(error) {
            console.error('Failed to open cache:', error);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(event) {
    console.log('Service Worker fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).catch(e => {
                console.error('Fetch failed for:', event.request.url, e);
                throw e;
            });
        })
    );
});