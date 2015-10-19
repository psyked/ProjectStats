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
    calendarStats = require("./parsers/calendarStats");

var argv = require('minimist')(process.argv.slice(2), {
    alias: {
        'owner': 'o',
        'username': 'u',
        'password': 'p'
    }
});
//console.dir(argv);

var owner = argv.owner,
    username = argv.username,
    password = argv.password;

var url = "https://bitbucket.org/api/2.0/repositories/" + owner + "?pagelen=100",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64"),
    outputFilename = 'output.json';

var startOfLastWeek = Date.parse(moment().subtract(1, 'week').startOf('week').toString()),
    endOfLastWeek = Date.parse(moment().startOf('week').toString()),
    startOfYear = Date.parse(moment().startOf('year').toString());

var gitCount = 0,
    hgCount = 0,
    activeCount = 0,
    allSlugs = [],
    languages = {},
    repoCount = 0,
    commitCount = 0,
    allUserCommitCounts = {},
    requestsIndex = 0;

function parseRepoInfoPage(body) {
    for (var i = 0, l = body.values.length; i < l; i++) {
        var repo = body.values[i];

        if (repo.scm === 'hg') {
            hgCount++;
        } else if (repo.scm === 'git') {
            gitCount++;
        }

        if (!languages[repo.language]) {
            languages[repo.language] = 0;
        }
        languages[repo.language]++;

        if (Date.parse(repo.updated_on) > startOfLastWeek) {
            activeCount++;
        }

        if (Date.parse(repo.updated_on) > startOfYear) {
            allSlugs.push(repo.links.commits.href);
        }

        repoCount++;
    }

    if (body.next) {
        loadRepoInfoPage(body.next);
    } else {
        finishedLoadingRepos();
    }
}

function makeCachedRequest(url, callback) {
    var filename = url.replace(/[^a-zA-Z0-9_]/g, "_");
    var cacheFile = "./cache/" + filename;
    //console.log("Loading " + url);
    //console.log("Checking against key: " + cacheFile);

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
                    fs.writeFile(cacheFile, JSON.stringify(body), function (err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        //console.log(data);
                        callback(body);
                    });
                }
            });
        }
    });
}

function loadRepoInfoPage(url) {
    makeCachedRequest(url, parseRepoInfoPage);
}

function finishedLoadingRepos() {
    console.log(repoCount + " Repositories found.");
    console.log("- " + hgCount + " Mercurial Repos");
    console.log("- " + gitCount + " Git Repos");
    console.log("- " + activeCount + " Active Repos");
    console.log("- Languages: " + JSON.stringify(languages));

    loadCommitUserDetails();
}

function loadCommitUserDetails() {
    console.log("Loading request " + requestsIndex + " of " + allSlugs.length);
    makeCachedRequest(allSlugs[requestsIndex] + "?pagelen=100", parseRepoCommitUserDetails);
}

function finishedLoadingAllData() {
    console.log("- User Counts: " + JSON.stringify(allUserCommitCounts));

    var outputObject = {
        total_count: repoCount,
        hg_count: hgCount,
        git_count: gitCount,
        active_count: activeCount,
        languages: languages,
        commit_count: commitCount,
        user_counts: allUserCommitCounts,
        date_information: calendarStats.getResults()
    };

    jsonFile.writeFile(outputFilename, outputObject, function (err) {
        console.error(err)
    });
}

function parseRepoCommitUserDetails(body) {
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
            calendarStats.parseCommit(commit);
        }
    }

    if (body.next && lastCommitIsWithinDateRange == true) {
        allSlugs.push(body.next);
    } else {
        if (requestsIndex == allSlugs.length) {
            finishedLoadingAllData();
        }
    }
    loadCommitUserDetails();
    requestsIndex++;
}

loadRepoInfoPage(url);
