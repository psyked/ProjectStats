const fs     = require('fs');
const chalk  = require('chalk');
const moment = require('moment');

module.exports = function (allUsers, allCommits) {
    let results = [];
    allUsers.forEach((username) => {
        let commitsFromYesterday = allCommits.filter((commit) => {
            try {
                return commit.author.user.username == username;
            } catch (err) {
                return false;
            }
        }).filter((commit) => {
            // console.log(moment().subtract(3, 'days').startOf('day'))
            let commitDate = new Date(commit.date);
            let daysCount  = 3;
            return commitDate > moment().subtract(daysCount, 'days').startOf('day') && commitDate < moment().subtract(daysCount, 'days').endOf('day');
        });
        if (commitsFromYesterday.length) {
            console.log(`${chalk.yellow(commitsFromYesterday.length)} commits from ${chalk.cyan(username)} yesterday`);

            let groupedRepos = {};
            commitsFromYesterday.forEach((commit) => {
                if (!groupedRepos[commit.repository.name]) {
                    groupedRepos[commit.repository.name] = [];
                }
                groupedRepos[commit.repository.name].push(commit);
            });

            let repos = [];
            for (let key in groupedRepos) {
                repos.push({
                    name   : key,
                    commits: groupedRepos[key]
                });
            }

            let result = {
                user : {
                    username: username,
                    email   : new RegExp('\<(.*)\>', 'g').exec(commitsFromYesterday[0].author.raw)[1]
                    // email: commitsFromYesterday[0].author.raw.match(/\<(.*)\>/g)[0]
                },
                // commits: commitsFromYesterday,
                repos: repos
            };
            results.push(result);

            fs.writeFile(`output/${username}.json`, JSON.stringify(result, undefined, 4), function (err) {
                if (err) {
                    console.error(err);
                }
                // console.log('written file')
            });
        }
    });
};