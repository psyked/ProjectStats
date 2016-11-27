'use strict';
const request = require("request");
const fs      = require('fs');
const moment  = require("moment");
const chalk   = require('chalk');

function makeRealRequest(url, headers, cacheFile, callback, errorCallback) {
    console.log(chalk.cyan("Info:"), `Loading ${url}`);
    request({
        url    : url,
        json   : true,
        headers: headers
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            fs.writeFileSync(cacheFile, JSON.stringify(body));
            callback(body);
        } else {
            if (error) {
                errorCallback(error);
            } else {
                errorCallback(`Status Code: ${response.statusCode}`);
            }
        }
    });
}

function makeCachedRequest(url, headers, useCache, callback, errorCallback) {

    const todaysDate = moment().utc().startOf('day');
    const dir        = `./datacollector/cache-${todaysDate.format('YYYY-MM-DD')}/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    if (url) {
        const filename  = url.replace(/[^a-zA-Z0-9_]/g, "_");
        const cacheFile = dir + filename;

        if (!useCache) {
            makeRealRequest(url, headers, cacheFile, callback, errorCallback);
        } else {
            fs.exists(cacheFile, function (exists) {
                if (exists) {
                    console.log(chalk.yellow("Info:"), `Loading ${url} from local cache`);
                    fs.readFile(cacheFile, function (err, contents) {
                        if (err) {
                            errorCallback(err);
                            return console.log(err);
                        }
                        try {
                            callback(JSON.parse(contents));
                        } catch (e) {
                            errorCallback(e);
                        }
                    });
                } else {
                    makeRealRequest(url, headers, cacheFile, callback, errorCallback);
                }
            });
        }
    } else {
        errorCallback('No URL specified');
    }
}

module.exports = makeCachedRequest;
