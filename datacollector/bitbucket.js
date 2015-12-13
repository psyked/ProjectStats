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

var request = require("request"),
    fs = require('fs'),
    moment = require("moment"),
    jsonFile = require('jsonfile'),
    calendarStats = require("./parsers/calendarStats"),
    repoDataParser = require("./parsers/repoDataParser");

var argv = require('minimist')(process.argv.slice(2), {
    alias: {
        'owner': 'o',
        'username': 'u',
        'password': 'p'
    }
});
//console.dir(argv);

if (!argv.owner) {
    console.error('\033[31mError:\033[39m No Bitbucket Account specified!');
    return;
}

if (!argv.username || !argv.password) {
    console.warn('\033[31mError:\033[39m No Bitbucket Username or Password specified!');
    return;
}

var owner = argv.owner,
    username = argv.username,
    password = argv.password;

var url = "https://bitbucket.org/api/2.0/repositories/" + owner + "?pagelen=100",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64"),
    outputFile = "./website/serve/output.json";

var startOfLastWeek = Date.parse(moment().subtract(1, 'week').startOf('week').toString()),
    endOfLastWeek = Date.parse(moment().startOf('week').toString()),
    startOfYear = Date.parse(moment().subtract(90, 'day').toString());

var allSlugs = [],
    commitCount = 0,
    allUserCommitCounts = {},
    requestsIndex = 0;

var date = moment().startOf('day');
var dir = './datacollector/cache-' + date.format('YYYY-MM-DD') + '/';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

function parseRepoInfoPage(body) {
    for (var i = 0, l = body.values.length; i < l; i++) {
        var repo = body.values[i];
        repoDataParser.parseRepoDetails(repo, startOfLastWeek, next);

        function next() {
            if (Date.parse(repo.updated_on) > startOfYear) {
                allSlugs.push(repo.links.commits.href);
            }
        }
    }

    if (body.next) {
        loadRepoInfoPage(body.next);
    } else {
        calendarStats.initOutput(finishedLoadingRepos);
    }
}

function makeCachedRequest(url, callback, errorCallback) {
    if (url) {
        var filename = url.replace(/[^a-zA-Z0-9_]/g, "_");
        var cacheFile = dir + filename;

        fs.exists(cacheFile, function (exists) {
            if (exists) {
                console.log("\033[33mInfo:\033[39m Loading " + url + " from local cache");
                fs.readFile(cacheFile, function (err, contents) {
                    if (err) {
                        errorCallback();
                        return console.log(err);
                    }
                    try {
                        callback(JSON.parse(contents));
                    } catch (e) {
                        errorCallback();
                    }
                });
            } else {
                console.log("\033[36mInfo:\033[39m Loading " + url);
                request({
                    url: url,
                    json: true,
                    headers: {
                        "Authorization": auth
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        fs.writeFileSync(cacheFile, JSON.stringify(body));
                        callback(body);
                    } else {
                        errorCallback();
                    }
                });
            }
        });
    } else {
        errorCallback();
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
}

function loadNextItemInQueue() {
    if (allSlugs[requestsIndex]) {
        console.log("\033[36mInfo:\033[39m Loading request " + (requestsIndex + 1) + " of " + allSlugs.length);
        makeCachedRequest(allSlugs[requestsIndex], parseRepoCommitDetails, parseRepoCommitError);
        requestsIndex++;
    }
}

function parseRepoCommitDetails(body) {
    var lastCommitIsWithinDateRange = false;

    for (var i = 0, l = body.values.length; i < l; i++) {
        /** @type {Commit} */
        var commit = body.values[i];
        var commitDate = Date.parse(commit.date);
        if (commit.author.user) {
            var username = commit.author.user.display_name;
            if (commitDate > startOfLastWeek && commitDate < endOfLastWeek) {
                if (!allUserCommitCounts[username]) {
                    allUserCommitCounts[username] = 0;
                }
                allUserCommitCounts[username]++;
            }
        }

        if (commitDate > startOfLastWeek) {
            commitCount++;
        }

        if (commitDate > startOfYear) {
            lastCommitIsWithinDateRange = true;
            var rtn = calendarStats.parseCommit(commit);
            if (rtn) {
                fs.appendFileSync(outputFile, rtn);
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

loadRepoInfoPage(url);
