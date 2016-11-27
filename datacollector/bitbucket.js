/**
 * @typedef {Object} Commit
 * @property {string} hash
 * @property {Object} repository
 * @property {Object} repository.links
 * @property {Object} repository.links.self
 * @property {Object} repository.links.html
 * @property {Object} repository.links.avatar
 * @property {string} repository.type
 * @property {string} repository.name
 * @property {string} repository.full_name
 * @property {string} repository.uuid
 * @property {Object} links
 * @property {Object} links.self
 * @property {string} links.self.href
 * @property {Object} links.comments
 * @property {string} links.comments.href
 * @property {Object} links.patch
 * @property {string} links.patch.href
 * @property {Object} links.html
 * @property {string} links.html.href
 * @property {Object} links.diff
 * @property {string} links.diff.href
 * @property {Object} links.approve
 * @property {string} links.approve.href
 * @property {Object} author
 * @property {string} author.raw
 * @property {Object} author.user
 * @property {string} author.user.username
 * @property {string} author.user.display_name
 * @property {string} author.user.type
 * @property {string} author.user.uuid
 * @property {Object} author.user.links
 * @property {Object[]} parents
 * @property {string} parents[].hash
 * @property {string} parents[].type
 * @property {Object} parents[].links
 * @property {Date} date
 * @property {string} message
 * @property {string} type
 */

'use strict';

const fs                = require('fs');
const chalk             = require('chalk');
const moment            = require("moment");
const calendarStats     = require("./libs/parsers/calendarStats");
const processBadges     = require('./libs/badges/all');
const makeCachedRequest = require('./libs/cachedRequest');
const cacheCommit       = require('./libs/cacheCommit');

const argv = require('minimist')(process.argv.slice(2), {
    alias: {
        'owner'   : 'o',
        'username': 'u',
        'password': 'p',
        'usecache': 'c'
    }
});

if (!argv.owner) {
    throw new Error(chalk.red('Error: No Bitbucket Account specified!'));
}

const username = argv.username;
const password = argv.password;
const owner    = argv.owner;
const useCache = Boolean(argv.usecache);

const auth = `Basic ${new Buffer(`${username}:${password}`).toString("base64")}`;

const authHeaders = {
    "Authorization": auth
};

const url             = `https://bitbucket.org/api/2.0/repositories/${owner}?pagelen=100`;
const outputFile      = "./website/serve/output.json";
const badgesFile      = "./website/serve/badges.json";
const startDate       = Date.parse(moment().utc().subtract(90, 'day').startOf('day').toString());
const badgesStartDate = Date.parse(moment().utc().subtract(7, 'day').startOf('day').toString());
const allSlugs        = [];
let requestsIndex     = 0;
const allBadges       = [];

// var todaysDate = moment().utc().startOf('day');
// var lastRunFile = './datacollector/cache-' + todaysDate.format('YYYY-MM-DD') + '/lastRun';
// if(fs.existsSync(lastRunFile)) {
//     startDate = Date.parse(fs.readFileSync(lastRunFile));
// }

function parseRepoInfoPage(body) {
    for (let i = 0, l = body.values.length; i < l; i++) {
        var repo = body.values[i];

        next();

        function next() {
            if (Date.parse(repo.updated_on) > startDate) {
                allSlugs.push(repo.links.commits.href);
            }
        }
    }

    if (body.next) {
        loadRepoInfoPage(body.next);
    } else {
        calendarStats.initOutput(finishedLoadingRepos);
        // fs.writeFileSync(lastRunFile, new Date().toUTCString());
    }
}

function loadRepoInfoPage(url) {
    makeCachedRequest(url, authHeaders, useCache, parseRepoInfoPage, parseRepoInfoError);
}

function parseRepoInfoError() {
    finishedLoadingRepos();
}

function finishedLoadingRepos() {
    loadNextItemInQueue();
}

function finishedLoadingAllData() {
    console.log(chalk.green('Success:'), "Finished Loading all commits!");
    fs.writeFileSync(badgesFile, JSON.stringify(allBadges));
}

function loadNextItemInQueue() {
    if (allSlugs[requestsIndex]) {
        console.log(chalk.cyan("Info:"), `Loading request ${requestsIndex + 1} of ${allSlugs.length}`);
        makeCachedRequest(allSlugs[requestsIndex], authHeaders, useCache, parseRepoCommitDetails, parseRepoCommitError);
        requestsIndex++;
    }
}

function parseRepoCommitDetails(body) {
    let lastCommitIsWithinDateRange = false;

    for (let i = 0, l = body.values.length; i < l; i++) {
        /** @type {Commit} */
        var commit       = body.values[i];
        const commitDate = Date.parse(commit.date);

        //cacheCommit(commit);

        if (commitDate > startDate) {
            lastCommitIsWithinDateRange = true;

            var rtn;
            rtn = calendarStats.parseCommit(commit);

            if (commitDate > badgesStartDate) {
                processBadges(allBadges, commit, next);
            } else {
                next();
            }

            function next() {
                if (rtn) {
                    fs.appendFileSync(outputFile, rtn);
                }
            }
        }
    }

    if (body.next && lastCommitIsWithinDateRange == true) {
        allSlugs.push(body.next);
    } else {
        if (requestsIndex == allSlugs.length) {
            finishedLoadingAllData();
        }
    }
    loadNextItemInQueue();
}

function parseRepoCommitError() {
    loadNextItemInQueue();
}

// make a request to fetch the team membership listing
require('./libs/parsers/teamMembership')(owner, authHeaders)
    .then(function (userlist) {
        // console.log(userlist);
        calendarStats.setTeamMembers(userlist);
        loadRepoInfoPage(url);
    });