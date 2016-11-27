"use strict";

const moment = require("moment");

function parseCommit(badges, commit, callback) {
    try {
        const commitDate   = new Date(commit.date);
        const day          = commitDate.getDay();
        const startTime    = moment("4:00am", "h:mma").utc();
        const endTime      = moment("0:00am", "h:mma").utc();
        const theTime      = moment(moment(commit.date).utc().format("h:mma"), "h:mma").utc();
        const isOutOfHours = theTime.isBefore(startTime) && theTime.isAfter(endTime);
        const isWeekday    = (day < 6) && (day > 0);
        if (isWeekday && isOutOfHours && commit.author.user) {
            badges.push({
                "badge_img"  : "./img/after-midnight.jpg",
                "title"      : "The Witching Hour",
                "subtitle"   : "Beware after hours coding.",
                "description": "Awarded to developers working into the wee hours of the morning.",
                "recipient"  : [
                    {
                        "avatar"  : `https://bitbucket.org/account/${commit.author.user.username}/avatar/32/`,
                        "username": commit.author.user.display_name,
                        "date"    : moment(commit.date).utc().format("LLLL")
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