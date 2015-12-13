"use strict";

var moment = require("moment");

function parseCommit(badges, commit, callback) {
    var commitDate = new Date(commit.date);
    var day = commitDate.getDay();
    var isWeekend = (day == 6) || (day == 0);
    if (isWeekend && commit.author.user) {
        badges.push({
            "badge_img": "https://bitbucket.org/account/" + commit.author.user.username + "/avatar/32/",
            "title": "Overtime",
            "subtitle": "Who needs a break, right?",
            "description": "Awarded to those dedicated developers who don't understand the meaning of downtime.",
            "recipient": [
                {
                    "avatar": "https://bitbucket.org/account/" + commit.author.user.username + "/avatar/32/",
                    "username": commit.author.user.display_name,
                    "date": moment(commit.date).format("LLLL")
                }
            ]
        });
    }

    callback();
}

module.exports = {
    parseCommit: parseCommit
};