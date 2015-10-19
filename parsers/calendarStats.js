"use strict";

var moment = require("moment");

function formatDate(date) {
    return moment(date).format("YYYY-MM-DD");
}

var results = {};

/**
 * @param {Commit} commit
 */
function parseCommit(commit) {
    var date = formatDate(new Date(commit.date));
    if (!results[date]) {
        results[date] = 0;
    }
    results[date]++;
}

function getResults() {
    return results;
}

module.exports = {
    parseCommit: parseCommit,
    getResults: getResults
};