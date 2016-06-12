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

var fs = require('fs');
var moment = require("moment");
var async = require("async");
var calendarStats = require("./parsers/calendarStats");
var weekend = require('./badges/weekend');
var aftermidnight = require('./badges/aftermidnight');
var mergemaster = require('./badges/merge-master');
var afterhours = require('./badges/afterhours');
var makeCachedRequest = require('./cachedRequest');

var argv = require('minimist')(process.argv.slice(2), {
    alias: {
        'owner': 'o',
        'username': 'u',
        'password': 'p'
    }
});

if(!argv.owner) {
    console.error('\033[31mError:\033[39m No Bitbucket Account specified!');
    return;
}

var owner = argv.owner;

var url = "https://bitbucket.org/api/2.0/repositories/" + owner + "?pagelen=100",
    outputFile = "./website/serve/output.json",
    badgesFile = "./website/serve/badges.json";

var startDate = Date.parse(moment().utc().subtract(90, 'day').startOf('day').toString());

var allSlugs = [],
    requestsIndex = 0,
    allBadges = [];

// var todaysDate = moment().utc().startOf('day');
// var dir = './datacollector/cache-' + todaysDate.format('YYYY-MM-DD') + '/';
//
// if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir);
// }

function parseRepoInfoPage(body) {
    for(var i = 0, l = body.values.length; i < l; i++) {
        var repo = body.values[i];

        next();

        function next() {
            if(Date.parse(repo.updated_on) > startDate) {
                allSlugs.push(repo.links.commits.href);
            }
        }
    }

    if(body.next) {
        loadRepoInfoPage(body.next);
    } else {
        calendarStats.initOutput(finishedLoadingRepos);
    }
}

function loadRepoInfoPage(url) {
    makeCachedRequest(url, parseRepoInfoPage, parseRepoInfoError);
}

function parseRepoInfoError() {
    finishedLoadingRepos();
}

function finishedLoadingRepos() {
    loadNextItemInQueue();
}

function finishedLoadingAllData() {
    console.log("\033[32mSuccess:\033[39m Finished Loading all commits!");
    fs.writeFileSync(badgesFile, JSON.stringify(allBadges));
}

function loadNextItemInQueue() {
    if(allSlugs[requestsIndex]) {
        console.log("\033[36mInfo:\033[39m Loading request " + (requestsIndex + 1) + " of " + allSlugs.length);
        makeCachedRequest(allSlugs[requestsIndex], parseRepoCommitDetails, parseRepoCommitError);
        requestsIndex++;
    }
}

function parseRepoCommitDetails(body) {
    var lastCommitIsWithinDateRange = false;

    for(var i = 0, l = body.values.length; i < l; i++) {
        /** @type {Commit} */
        var commit = body.values[i];
        var commitDate = Date.parse(commit.date);

        if(commitDate > startDate) {
            lastCommitIsWithinDateRange = true;

            var rtn;
            rtn = calendarStats.parseCommit(commit);
            async.parallel([
                function(callback) {
                    weekend.parseCommit(allBadges, commit, callback);
                },
                function(callback) {
                    afterhours.parseCommit(allBadges, commit, callback);
                },
                function(callback) {
                    aftermidnight.parseCommit(allBadges, commit, callback);
                },
                function(callback) {
                    mergemaster.parseCommit(allBadges, commit, callback);
                }
            ], next);

            function next() {
                if(rtn) {
                    fs.appendFileSync(outputFile, rtn);
                }
            }
        }
    }

    if(body.next && lastCommitIsWithinDateRange == true) {
        allSlugs.push(body.next);
    } else {
        if(requestsIndex == allSlugs.length) {
            finishedLoadingAllData();
        }
    }
    loadNextItemInQueue();
}

function parseRepoCommitError() {
    loadNextItemInQueue();
}


// make a request to fetch the team membership listing
require('./parsers/teamMembership')(owner)
    .then(function(userlist) {
        // console.log(userlist);
        calendarStats.setTeamMembers(userlist);
        loadRepoInfoPage(url);
    });