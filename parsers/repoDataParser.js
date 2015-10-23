"use strict";

var gitCount = 0,
    hgCount = 0,
    activeCount = 0,
    languages = {},
    repoCount = 0;

function parseRepoDetails(repo, startOfLastWeek, callback) {
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

    repoCount++;

    callback();
}

function getDetails() {
    return {
        total_count: repoCount,
        hg_count: hgCount,
        git_count: gitCount,
        active_count: activeCount,
        languages: languages
    }
}

module.exports = {
    parseRepoDetails: parseRepoDetails,
    getDetails: getDetails
};