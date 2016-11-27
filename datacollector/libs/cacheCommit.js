'use strict';
const request = require("request");
const fs      = require('fs');
const moment  = require("moment");
const chalk   = require('chalk');

function cacheCommit(commit) {

    const cacheFile = `./datacollector/commits/${commit['hash']}.json`;

    if (!fs.existsSync('./datacollector/commits/')) {
        fs.mkdirSync('./datacollector/commits/');
    }

    const exists = fs.existsSync(cacheFile);
    // console.log('exists = ', exists, headers);
    if (!exists) {
        console.log(chalk.yellow("Info:"), `Save ${cacheFile} to local cache`);
        fs.writeFileSync(cacheFile, JSON.stringify(commit));
    }

    return !exists;
}

module.exports = cacheCommit;