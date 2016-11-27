"use strict";

const moment = require("moment");
const fs = require('fs');

const results             = {};
const userCommits         = {};
const shadowbannedMembers = [];

let teamMembers           = [];

/**
 * @param {Commit} commit
 */
function parseCommit(commit) {

    if (!results[commit.date]) {
        results[commit.date] = 0;
    }
    results[commit.date]++;

    let rtn;
    if (commit.author && commit.author.user && commit.author.user.display_name) {
        if (teamMembers.indexOf(commit.author.user.username) !== -1) {
            if (!userCommits[commit.author.user.display_name]) {
                userCommits[commit.author.user.display_name] = {};
            }
            if (!userCommits[commit.author.user.display_name][commit.date]) {
                userCommits[commit.author.user.display_name][commit.date] = 0;
            }
            const allowed = !contains(shadowbannedMembers, commit.author.user.display_name);
            if (allowed) {
                userCommits[commit.author.user.display_name][commit.date]++;
                rtn = `${commit.date},\"${commit.author.user.display_name}\",\"${commit.author.user.username}\"\n`;
            } else {
                console.log(`Ignoring commit from ${commit.author.user.display_name}`);
            }
        }
    } else {
        // console.warn(commit.author.raw);
        const parsedName = parseRawNameValue(commit.author.raw);
        if (userCommits[parsedName]) {
            userCommits[parsedName][commit.date]++;
            rtn = `${commit.date},\"${parsedName}\",\"\"\n`;
        }
    }

    return rtn;
}

function parseRawNameValue(input) {
    const name = input.split('<')[0].trim();
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
    initOutput    : initOutput,
    parseCommit   : parseCommit,
    getResults    : getResults,
    getUserResults: getUserResults,
    setTeamMembers: setTeamMembers
};

function contains(a, obj) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}
