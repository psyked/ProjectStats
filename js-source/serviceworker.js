const CACHE_NAME = 'cache-online-first';

self.addEventListener("install", function(event) {
    console.log('WORKER: install event in progress.');
});

self.addEventListener("activate", function(event) {
    console.log('WORKER: activate event in progress.');

    event.waitUntil(
        caches
            .keys()
            .then(function(keys) {
                return Promise.all(
                    keys
                        .filter(function(key) {
                            return !key.startsWith(CACHE_NAME);
                        })
                        .map(function(key) {
                            return caches.delete(key);
                        })
                );
            })
            .then(function() {
                console.log('WORKER: activate completed.');
            })
    );
});

self.addEventListener("fetch", function(event) {
    console.log('WORKER: fetch event in progress.');

    if(event.request.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }

    event.respondWith(
        fetch(request).then(function(response) {
            return caches.open(CACHE_NAME).then(function(cache) {
                var cacheCopy = response.clone();
                return cache.put(event.request, cacheCopy);
            });
        }).catch(function(error) {
            return caches.open(CACHE_NAME).then(function(cache) {
                return cache.match(event.request);
            });
        })
    );
});