require(["./components/chromecast-integration", "./components/accolades"], function(chromecast, accolades) {
    "use strict";

    // var host = "psyked.github.io";
    // if((host == window.location.host) && (window.location.protocol != "https:")) {
    //     window.location.protocol = "https";
    // }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./serviceworker.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ',    registration.scope);
        }).catch(function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }

    chromecast();
    accolades();
});