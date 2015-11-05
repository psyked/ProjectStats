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

if(!argv.owner){
    console.error('\033[31mError:\033[39m No Bitbucket Account specified!');
    return;
}

if(!argv.username || !argv.password){
    console.warn('\033[31mError:\033[39m No Bitbucket Username or Password specified!');
    return;
}

var owner = argv.owner,
    username = argv.username,
    password = argv.password;

var url = "https://bitbucket.org/api/2.0/repositories/" + owner + "?pagelen=100",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64"),
    outputFilename = 'output.json';

var startOfLastWeek = Date.parse(moment().subtract(1, 'week').startOf('week').toString()),
    endOfLastWeek = Date.parse(moment().startOf('week').toString()),
    startOfYear = Date.parse(moment().subtract(4, 'year').startOf('year').toString());

var allSlugs = [],
    commitCount = 0,
    allUserCommitCounts = {},
    requestsIndex = 0;

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
        var cacheFile = "./datacollector/cache/" + filename;
        console.log("\033[36mInfo:\033[39m Loading " + url);
        //console.log("Loading " + url + ", checking against key: " + cacheFile);

        fs.exists(cacheFile, function (exists) {
            if (exists) {
                fs.readFile(cacheFile, function (err, contents) {
                    if (err) {
                        return console.log(err);
                    }
                    try {
                        callback(JSON.parse(contents));
                    } catch (e) {
                    }
                });
            } else {
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
    loadCommitDetails();
}

function loadCommitDetails() {
    console.log("\033[36mInfo:\033[39m Loading request " + requestsIndex + " of " + allSlugs.length);
    if (requestsIndex >= allSlugs.length) {
        finishedLoadingAllData();
    } else {
        makeCachedRequest(allSlugs[requestsIndex], parseRepoCommitDetails, parseRepoCommitError);
        requestsIndex++;
    }
}

function finishedLoadingAllData() {
    var outputObject = {
        year_start: moment(startOfYear).format("YYYY-MM-DD"),
        year_end: moment(Date.now()).format("YYYY-MM-DD"),
        week_start: moment(startOfLastWeek).format("dddd, Do MMMM YYYY"),
        week_end: moment(endOfLastWeek).format("dddd, Do MMMM YYYY"),
        commit_count: commitCount,
        user_counts: allUserCommitCounts,
        date_information: calendarStats.getResults(),
        date_user_information: calendarStats.getUserResults()
    };

    var source = repoDataParser.getDetails();
    for (var prop in source) {
        outputObject[prop] = source[prop];
    }

    jsonFile.writeFile(outputFilename, outputObject, function (err) {
        //console.error(err);
    });
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
                fs.appendFileSync("./website/serve/output.json", rtn);
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
    loadCommitDetails();
}

function parseRepoCommitError() {
    loadCommitDetails();
}

loadRepoInfoPage(url);
