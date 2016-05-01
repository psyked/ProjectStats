define([], function() {
    "use strict";

    const selectedUsername = getQueryVariable("user");
    let startDate = getQueryVariable("startDate");
    let endDate = getQueryVariable("endDate");
    let startTime = getQueryVariable("startTime");
    let endTime = getQueryVariable("endTime");

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
        const query = window.location.search.substring(1);
        const vars = query.split("&");
        for(let i = 0; i < vars.length; i++) {
            const pair = vars[i].split("=");
            if(pair[0] == variable) {
                return pair[1];
            }
        }
        return (false);
    }

    return {
        selectedUsername,
        startDate,
        endDate,
        startTime,
        endTime
    }
});