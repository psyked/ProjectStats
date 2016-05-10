'use strict';

var CACHE_NAME = 'cache-v2';

self.addEventListener("install", function (event) {
    console.log('WORKER: install event in progress.');
});

self.addEventListener("activate", function (event) {
    console.log('WORKER: activate event in progress.');

    event.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.filter(function (key) {
            return !key.startsWith(CACHE_NAME);
        }).map(function (key) {
            return caches.delete(key);
        }));
    }).then(function () {
        console.log('WORKER: activate completed.');
    }));
});

self.addEventListener("fetch", function (event) {
    console.log('WORKER: fetch event in progress.');

    if (event.request.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }
    event.respondWith(caches.match(event.request).then(function (cached) {
        var networked = fetch(event.request).then(fetchedFromNetwork, unableToResolve).catch(unableToResolve);

        console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
        return cached || networked;

        function fetchedFromNetwork(response) {
            var cacheCopy = response.clone();

            console.log('WORKER: fetch response from network.', event.request.url);

            caches.open(CACHE_NAME).then(function add(cache) {
                cache.put(event.request, cacheCopy);
            }).then(function () {
                console.log('WORKER: fetch response stored in cache.', event.request.url);
            });

            return response;
        }

        function unableToResolve() {

            console.log('WORKER: fetch request failed in both cache and network.');

            return new Response('<h1>Service Unavailable</h1>', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'text/html'
                })
            });
        }
    }));
});
