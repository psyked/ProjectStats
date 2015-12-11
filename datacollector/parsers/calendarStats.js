"use strict";

var moment = require("moment"),
    fs = require('fs');

var results = {};
var userCommits = {};

/**
 * @param {Commit} commit
 */
function parseCommit(commit) {

    if (!results[commit.date]) {
        results[commit.date] = 0;
    }
    results[commit.date]++;

    var rtn;
    if (commit.author && commit.author.user && commit.author.user.display_name) {
        if (!userCommits[commit.author.user.display_name]) {
            userCommits[commit.author.user.display_name] = {};
        }
        if (!userCommits[commit.author.user.display_name][commit.date]) {
            userCommits[commit.author.user.display_name][commit.date] = 0;
        }
        userCommits[commit.author.user.display_name][commit.date]++;

        rtn = commit.date + ",\"" + commit.author.user.display_name + "\",\"" + commit.author.user.links.avatar.href + "\"\n";
    } else {
        rtn = commit.date + ",\"" + commit.author.raw + "\",\"\"\n";
    }

    return rtn;
}

function initOutput(callback) {
    fs.writeFileSync("./website/serve/output.json", "date,author,avatar\n");
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