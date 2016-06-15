var request = require("request");
var fs = require('fs');
var moment = require("moment");

function makeCachedRequest(url, headers, callback, errorCallback) {

    var todaysDate = moment().utc().startOf('day');
    var dir = './datacollector/cache-' + todaysDate.format('YYYY-MM-DD') + '/';

    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    if(url) {
        var filename = url.replace(/[^a-zA-Z0-9_]/g, "_");
        var cacheFile = dir + filename;

        fs.exists(cacheFile, function(exists) {
            if(exists) {
                console.log("\033[33mInfo:\033[39m Loading " + url + " from local cache");
                fs.readFile(cacheFile, function(err, contents) {
                    if(err) {
                        errorCallback();
                        return console.log(err);
                    }
                    try {
                        callback(JSON.parse(contents));
                    } catch(e) {
                        errorCallback();
                    }
                });
            } else {
                console.log("\033[36mInfo:\033[39m Loading " + url);
                request({
                    url: url,
                    json: true,
                    headers: headers
                }, function(error, response, body) {
                    if(!error && response.statusCode === 200) {
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

module.exports = makeCachedRequest;