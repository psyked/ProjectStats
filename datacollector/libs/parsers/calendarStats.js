"use strict";

var moment = require("moment"),
    fs = require('fs');

var results = {};
var userCommits = {};
var teamMembers = [];

/**
 * @param {Commit} commit
 */
function parseCommit(commit) {

    if(!results[commit.date]) {
        results[commit.date] = 0;
    }
    results[commit.date]++;

    var rtn;
    if(commit.author && commit.author.user && commit.author.user.display_name) {
        if(teamMembers.indexOf(commit.author.user.username) !== -1) {
            if(!userCommits[commit.author.user.display_name]) {
                userCommits[commit.author.user.display_name] = {};
            }
            if(!userCommits[commit.author.user.display_name][commit.date]) {
                userCommits[commit.author.user.display_name][commit.date] = 0;
            }
            userCommits[commit.author.user.display_name][commit.date]++;

            rtn = commit.date + ",\"" + commit.author.user.display_name + "\",\"" + commit.author.user.username + "\"\n";
        }
    } else {
        // console.warn(commit.author.raw);
        var parsedName = parseRawNameValue(commit.author.raw);
        if(userCommits[parsedName]) {
            userCommits[parsedName][commit.date]++;
            rtn = commit.date + ",\"" + parsedName + "\",\"\"\n";
        }
    }

    return rtn;
}

function parseRawNameValue(input) {
    var name = input.split('<')[0].trim();
    return name;
}

function initOutput(callback) {
    fs.writeFileSync("./website/serve/output.json", "date,author,username\n");
    callback();
}

function getResults() {
    return results;
}

function getUserResults() {
    return userCommits;
}

function setTeamMembers(value) {
    teamMembers = value;
}

module.exports = {
    initOutput: initOutput,
    parseCommit: parseCommit,
    getResults: getResults,
    getUserResults: getUserResults,
    setTeamMembers: setTeamMembers
};