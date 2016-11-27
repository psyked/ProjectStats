const async         = require("async");
const weekend       = require('./weekend');
const aftermidnight = require('./aftermidnight');
const mergemaster   = require('./merge-master');
const afterhours    = require('./afterhours');

module.exports = function (allBadges, commit, next) {
    async.parallel([
        function (callback) {
            weekend.parseCommit(allBadges, commit, callback);
        },
        function (callback) {
            afterhours.parseCommit(allBadges, commit, callback);
        },
        function (callback) {
            aftermidnight.parseCommit(allBadges, commit, callback);
        },
        function (callback) {
            mergemaster.parseCommit(allBadges, commit, callback);
        }
    ], next);
};