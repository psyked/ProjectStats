"use strict";

var moment = require("moment");
var threshold = 50;
var users = {};

function parseCommit(badges, commit, callback) {
    try {
        if (commit.author.user && commit.author.user.username) {
            if (!users[commit.author.user.username]) {
                users[commit.author.user.username] = 0;
            }
            if (commit.message.toLowerCase().indexOf("merge") !== -1) {
                users[commit.author.user.username]++;
            }
            if (users[commit.author.user.username] > threshold) {
                badges.push({
                    "badge_img": "./img/merge-badge.svg",
                    "title": "Merge Master",
                    "subtitle": "Let's merge that into master!",
                    "description": "Awarded to developers who merge lots of branches.",
                    "recipient": [
                        {
                            "avatar": "https://bitbucket.org/account/" + commit.author.user.username + "/avatar/32/",
                            "username": commit.author.user.display_name,
                            "date": moment(commit.date).format("LLLL")
                        }
                    ]
                });
                users[commit.author.user.username] = 0;
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