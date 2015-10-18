"use strict";

function formatDate(date) {
    var year = date.getFullYear().toString();
    var month = date.getMonth().toString();
    if (month.length < 2) {
        month = "0" + month;
    }
    var day = date.getDate().toString();
    if (day.length < 2) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
}

var results = {};

/**
 * @param {Commit} commit
 */
function parseCommit(commit) {
    //console.log(commit.date);
    var date = formatDate(new Date(commit.date));
    //console.log(formatDate(date));
    //console.log(date);
    if (!results[date]) {
        results[date] = 0;
    }
    results[date]++;
}

function getResults() {
    console.log(results);
    return results;
}

module.exports = {
    parseCommit: parseCommit,
    getResults: getResults
};