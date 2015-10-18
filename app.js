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
    cachedRequest = require('cached-request')(request),
    moment = require("moment"),
    jsonfile = require('jsonfile');

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

var url = "https://bitbucket.org/api/2.0/repositories/" + owner,
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64"),
    outputFilename = 'output.json';

var startDate = Date.parse(moment().subtract(1, 'week').startOf('week').toString());

var gitCount = 0,
    hgCount = 0,
    activeCount = 0,
    allSlugs = [],
    languages = {},
    repoCount = 0,
    commitCount = 0,
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

                if (Date.parse(repo.updated_on) > startDate) {
                    activeCount++;
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
        user_counts: allUserCommitCounts
    };

    jsonfile.writeFile(outputFilename, outputObject, function (err) {
        console.error(err)
    });
}
function parseRepoCommitUserDetails(error, response, body) {
    if (!error && response.statusCode === 200) {

        var lastCommitIsWithinDateRange = false;

        for (var i = 0, l = body.values.length; i < l; i++) {
            /** @type {Commit} */
            var commit = body.values[i];
            if (commit.author.user) {
                var username = commit.author.user.display_name;
                if (Date.parse(commit.date) > startDate) {
                    if (!allUserCommitCounts[username]) {
                        allUserCommitCounts[username] = 0;
                    }
                    allUserCommitCounts[username]++;
                }
            }
            if (Date.parse(commit.date) > startDate) {
                commitCount++;
                lastCommitIsWithinDateRange = true;
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
    }
    requestsIndex++;
}

loadRepoInfoPage(url);
