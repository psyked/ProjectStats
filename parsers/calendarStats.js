"use strict";

var moment = require("moment");

function formatDate(date) {
    return moment(date).format("YYYY-MM-DD");
}

var results = {};
var userCommits = {};

/**
 * @param {Commit} commit
 */
function parseCommit(commit) {
    var date = formatDate(new Date(commit.date));
    if (!results[date]) {
        results[date] = 0;
    }
    results[date]++;

    if (commit.author && commit.author.user && commit.author.user.display_name) {
        if (!userCommits[commit.author.user.display_name]) {
            userCommits[commit.author.user.display_name] = {};
        }
        if (!userCommits[commit.author.user.display_name][date]) {
            userCommits[commit.author.user.display_name][date] = 0;
        }
        userCommits[commit.author.user.display_name][date]++;
    }
}

function getResults() {
    return results;
}

function getUserResults() {
    return userCommits;
}

module.exports = {
    parseCommit: parseCommit,
    getResults: getResults,
    getUserResults: getUserResults
};