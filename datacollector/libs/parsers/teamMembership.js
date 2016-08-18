var Promise = require('promise');
var makeCachedRequest = require('../cachedRequest');

module.exports = function(team, headers) {
    var promise = new Promise(function(resolve, reject) {
        makeCachedRequest('https://api.bitbucket.org/2.0/teams/' + team + '/members?pagelen=100', headers, false, success, fail);

        function success(response) {
            //console.log(response);
            var users = response.values.map(function(data) {
                return data.username;
            });
            //console.log(users);
            resolve(users);
        }

        function fail(err) {
            console.error('Oh noes! It broked.', err);
            reject('Oh noes! It broked.');
        }
    });
    return promise;
};
