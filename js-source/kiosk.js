require(["./components/chromecast-integration", "./components/accolades"], function(chromecast, accolades) {
    "use strict";

    var host = "psyked.github.io";
    if((host == window.location.host) && (window.location.protocol != "https:")) {
        window.location.protocol = "https";
    }

    chromecast();
    accolades();
});