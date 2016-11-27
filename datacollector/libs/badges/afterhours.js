"use strict";

const moment = require("moment");

function parseCommit(badges, commit, callback) {
    try {
        const commitDate = new Date(commit.date);
        const day        = commitDate.getDay();
        const startTime  = moment("8:30am", "hh:mma").utc();
        const endTime    = moment("6:00pm", "hh:mma").utc();
        const theTime    = moment(moment(commit.date).utc().format("H:mm"), "H:mm").utc();
        //var isOutOfHours = theTime.isBefore(startTime) || theTime.isAfter(endTime);
        const isWeekday  = (day < 6) && (day > 0);
        if (isWeekday && commit.author.user) {
            if (theTime.isAfter(endTime)) {
                badges.push({
                    "badge_img"  : "./img/after-hours.jpg",
                    "title"      : "After Hours",
                    "subtitle"   : "Just five more minutes, mom!",
                    "description": "Awarded to those dedicated developers who don't understand the meaning of home time.",
                    "recipient"  : [
                        {
                            "avatar"  : `https://bitbucket.org/account/${commit.author.user.username}/avatar/32/`,
                            "username": commit.author.user.display_name,
                            "date"    : moment(commit.date).utc().format("LLLL")
                        }
                    ]
                });
            } else if (theTime.isBefore(startTime) && theTime.isBefore(moment("4:00am", "hh:mma").utc())) {
                badges.push({
                    "badge_img"  : "./img/before-hours.jpg",
                    "title"      : "Early Morning",
                    "subtitle"   : "Obviously a morning person.",
                    "description": "Awarded to the eager beavers who just can't wait for the day to begin.",
                    "recipient"  : [
                        {
                            "avatar"  : `https://bitbucket.org/account/${commit.author.user.username}/avatar/32/`,
                            "username": commit.author.user.display_name,
                            "date"    : moment(commit.date).utc().format("LLLL")
                        }
                    ]
                });
            }
        }
        callback();
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    parseCommit: parseCommit
};