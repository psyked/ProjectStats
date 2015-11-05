"use strict";

var moment = require("moment"),
    fs = require('fs');

var results = {};
var userCommits = {};

/**
 * @param {Commit} commit
 */
function parseCommit(commit) {

    function formatDate(date) {
        return date;//moment.utc(date).format();
    }

    var date = formatDate(commit.date);

    if (!results[date]) {
        results[date] = 0;
    }
    results[date]++;

    var rtn;
    if (commit.author && commit.author.user && commit.author.user.display_name) {
        if (!userCommits[commit.author.user.display_name]) {
            userCommits[commit.author.user.display_name] = {};
        }
        if (!userCommits[commit.author.user.display_name][date]) {
            userCommits[commit.author.user.display_name][date] = 0;
        }
        userCommits[commit.author.user.display_name][date]++;

        rtn = date + ",\"" + commit.author.user.display_name + "\"\n";
    }

    return rtn;
}

function initOutput(callback) {
    fs.writeFileSync("./website/serve/output.json", "date,author\n");
    callback();
}

function getResults() {
    return results;
}

function getUserResults() {
    return userCommits;
}

module.exports = {
    initOutput: initOutput,
    parseCommit: parseCommit,
    getResults: getResults,
    getUserResults: getUserResults
};