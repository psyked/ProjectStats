"use strict";

var moment = require("moment");

function parseCommit(badges, commit, callback) {
    try {
        var commitDate = new Date(commit.date);
        var day = commitDate.getDay();
        var startTime = moment("8:30am", "h:mma");
        var endTime = moment("6:00pm", "h:mma");
        var theTime = moment(moment(commit.date).format("h:mma"), "h:mma");
        var isOutOfHours = theTime.isBefore(startTime) || theTime.isAfter(endTime);
        var isWeekday = (day < 6) && (day > 0);
        if (isWeekday && isOutOfHours && commit.author.user) {
            badges.push({
                "badge_img": "./img/after-hours.jpg",
                "title": "After Hours",
                "subtitle": "Just five more minutes, mom!",
                "description": "Awarded to those dedicated developers who don't understand the meaning of home time.",
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
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    parseCommit: parseCommit
};