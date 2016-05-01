define([], function() {
    "use strict";

    var selectedUsername = getQueryVariable("user");
    var startDate = getQueryVariable("startDate");
    var endDate = getQueryVariable("endDate");
    var startTime = getQueryVariable("startTime");
    var endTime = getQueryVariable("endTime");

    if(startDate) {
        startDate = new Date(parseInt(startDate, 10));
    }

    if(endDate) {
        endDate = new Date(parseInt(endDate, 10));
    }

    if(startTime) {
        startTime = parseInt(startTime, 10);
    }

    if(endTime) {
        endTime = parseInt(endTime, 10);
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for(var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable) {
                return pair[1];
            }
        }
        return (false);
    }

    return {
        selectedUsername: selectedUsername,
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime
    }
});