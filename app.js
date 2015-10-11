var request = require("request"),
    cachedRequest = require('cached-request')(request),
    moment = require("moment"),
    jsonfile = require('jsonfile');

var owner = "mmtdigital";
var url = "https://bitbucket.org/api/2.0/repositories/" + owner,
    username = "xxxxxxxx",
    password = "xxxxxxxx",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64"),
    outputFilename = 'output.json';

var gitCount = 0,
    hgCount = 0,
    activeCount = 0,
    allSlugs = [],
    languages = {},
    repoCount = 0,
    allUserCommitCounts = {},
    requestsIndex = 0;

function loadRepoInfoPage(url) {
    function parseRepoInfoPage(error, response, body) {
        if (!error && response.statusCode === 200) {
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

                if (Date.parse(repo.updated_on) > Date.parse(moment().subtract(1, 'week').startOf('week').toString())) {
                    activeCount++;
                    allSlugs.push(repo.links.commits.href);
                }

                repoCount++;
            }

            if (body.next) {
                console.log(".");
                loadRepoInfoPage(body.next);
            } else {
                finishedLoadingRepos();
            }
        }
    }

    cachedRequest({
        url: url,
        json: true,
        headers: {
            "Authorization": auth
        }
    }, parseRepoInfoPage);
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
    cachedRequest({
        url: allSlugs[requestsIndex],
        json: true,
        headers: {
            "Authorization": auth
        }
    }, parseRepoCommitUserDetails);
    requestsIndex++;
}

function parseRepoCommitUserDetails(error, response, body) {
    if (!error && response.statusCode === 200) {
        for (var i = 0, l = body.values.length; i < l; i++) {
            var commit = body.values[i];
            if (commit.author.user) {
                var username = commit.author.user.display_name;
                if (Date.parse(commit.date) > Date.parse(moment().subtract(1, 'week').startOf('week').toString())) {
                    if (!allUserCommitCounts[username]) {
                        allUserCommitCounts[username] = 0;
                    }
                    allUserCommitCounts[username]++;
                }
            }
        }

        if (body.next) {
            allSlugs.push(body.next);
            loadCommitUserDetails();
        } else {
            if (requestsIndex = allSlugs.length) {
                console.log("- User Counts: " + JSON.stringify(allUserCommitCounts));
            }

            var outputObject = {
                total_count: repoCount,
                hg_count: hgCount,
                git_count: gitCount,
                active_count: activeCount,
                languages: languages,
                user_counts: allUserCommitCounts
            };

            jsonfile.writeFile(outputFilename, outputObject, function (err) {
                console.error(err)
            })
        }
    }
}

loadRepoInfoPage(url);