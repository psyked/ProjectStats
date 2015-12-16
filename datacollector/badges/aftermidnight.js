"use strict";

var moment = require("moment");

function parseCommit(badges, commit, callback) {
    try {
        var commitDate = new Date(commit.date);
        var day = commitDate.getDay();
        var startTime = moment("4:00am", "h:mma").utc();
        var endTime = moment("0:00am", "h:mma").utc();
        var theTime = moment(moment(commit.date).utc().format("h:mma"), "h:mma").utc();
        var isOutOfHours = theTime.isBefore(startTime) && theTime.isAfter(endTime);
        var isWeekday = (day < 6) && (day > 0);
        if (isWeekday && isOutOfHours && commit.author.user) {
            badges.push({
                "badge_img": "./img/after-midnight.jpg",
                "title": "The Witching Hour",
                "subtitle": "Beware after hours coding.",
                "description": "Awarded to developers working into the wee hours of the morning.",
                "recipient": [
                    {
                        "avatar": "https://bitbucket.org/account/" + commit.author.user.username + "/avatar/32/",
                        "username": commit.author.user.display_name,
                        "date": moment(commit.date).utc().format("LLLL")
                    }
                ]
            });
        }
        callback();
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    parseCommit: parseCommit
};