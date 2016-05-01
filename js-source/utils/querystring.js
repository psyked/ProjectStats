define(["../model/state"], function(state) {
    "use strict";

    function getQueryString() {
        const array = [location.pathname.substring(location.pathname.lastIndexOf("/") + 1)];
        if(array[0] === "") {
            array[0] = "index.html";
        }
        if(state.selectedUsername) {
            array.push(`user=${encodeURI(state.selectedUsername)}`);
        }
        if(state.startDate) {
            array.push(`startDate=${Date.parse(state.startDate)}`);
        }
        if(state.endDate) {
            array.push(`endDate=${Date.parse(state.endDate)}`);
        }
        if(state.startTime) {
            array.push(`startTime=${parseInt(state.startTime, 10)}`);
        }
        if(state.endTime) {
            array.push(`endTime=${parseInt(state.endTime, 10)}`);
        }
        let queryString = array.join("&");
        queryString = queryString.replace(/&/, "?");
        return queryString;
    }

    return getQueryString;
});