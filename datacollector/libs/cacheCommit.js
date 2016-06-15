var request = require("request");
var fs = require('fs');
var moment = require("moment");

function cacheCommit(commit) {

    var cacheFile = './datacollector/commits/' + commit['hash'] + '.json';

    if(!fs.existsSync('./datacollector/commits/')) {
        fs.mkdirSync('./datacollector/commits/');
    }

    var exists = fs.existsSync(cacheFile);
    // console.log('exists = ', exists, headers);
    if(!exists) {
        console.log("\033[33mInfo:\033[39m Save " + cacheFile + " to local cache");
        fs.writeFileSync(cacheFile, JSON.stringify(commit));
    }

    return !exists;
}

module.exports = cacheCommit;