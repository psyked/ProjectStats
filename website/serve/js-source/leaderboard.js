require(["d3", "c3", "moment", "jquery", "components/commits-timeline"], function (d3, c3, moment, $, commitsTimeline) {
    "use strict";

    var host = "psyked.github.io";
    if((host == window.location.host) && (window.location.protocol != "https:")) {
        window.location.protocol = "https";
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./serviceworker.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ',    registration.scope);
        }).catch(function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }

    const DAYS = 90;
    const COUNT = 10;

    function renderLeaderboard(commits, avatars, panel) {
        const units = d3.select(panel).attr('data-timeunit');

        if (units) {
            var previousResults = d3.nest()
                .key(function (d) {
                    return d.author;
                })
                .rollup(function (leaves) {
                    return leaves.length;
                })
                .entries(commits.filter(function (d) {
                    const startDate = moment().add(-2, units).startOf(units);
                    const endDate = moment().add(-1, units).startOf(units);
                    const theDate = new Date(d.date);
                    return !!(theDate > startDate && theDate < endDate);
                }))
                .sort(function (a, b) {
                    return d3.descending(a.values, b.values);
                });
        }

        const results = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                if (units) {
                    const startDate = moment().add(-1, units).startOf(units);
                    const endDate = moment().startOf(units);
                    const theDate = new Date(d.date);
                    return !!(theDate > startDate && theDate < endDate);
                } else {
                    return true;
                }
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            })
            .splice(0, COUNT);

        results.forEach(function (d, i) {
            let moveIndex = "";
            if (units) {
                let oldIndex = previousResults.length;
                for (let j = 0; j < previousResults.length; j += 1) {
                    if (previousResults[j]["key"] === d.key) {
                        oldIndex = j;
                    }
                }
                moveIndex = '<i class="fa fa-minus move-icon"></i>';
                if (oldIndex > i) {
                    moveIndex = '<i class="fa fa-arrow-up move-icon up"></i>';
                } else if (oldIndex < i) {
                    moveIndex = '<i class="fa fa-arrow-down move-icon down"></i>';
                }
            }
            d3.select(panel).select('.list').append('div').attr("class", "commit").html(`${moveIndex} <span class="index">${i + 1}.</span> <span class="name">${d.key}</span> with ${d.values.toLocaleString()} commits.`);
        });

        const dataToCheck = results;

        if (dataToCheck[0]) {
            let firstImage = "";
            avatars.forEach(function (d, i) {
                if (d.key === dataToCheck[0].key) {
                    firstImage = d.values[0].key;
                }
            });
            d3.select(panel).select('.avatars-area .first').append('img').attr('src', firstImage);
        }

        if (dataToCheck[1]) {
            let secondImage = "";
            avatars.forEach(function (d, i) {
                if (d.key === dataToCheck[1].key) {
                    secondImage = d.values[0].key;
                }
            });
            d3.select(panel).select('.avatars-area .second').append('img').attr('src', secondImage);
        }

        if (dataToCheck[2]) {
            let thirdImage = "";
            avatars.forEach(function (d, i) {
                if (d.key === dataToCheck[2].key) {
                    thirdImage = d.values[0].key;
                }
            });
            d3.select(panel).select('.avatars-area .third').append('img').attr('src', thirdImage);
        }
    }

    d3.csv("output.json", function (error, commits) {
        // exclude data from outside the last DAYS days
        commits = commits.filter(function (d) {
            const startDate = moment().add(-DAYS, 'day').startOf('day');
            const endDate = moment().startOf('day');
            const theDate = new Date(d.date);
            return !!(theDate > startDate && theDate < endDate);
        });

        const avatars = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .key(function (d) {
                return `https://bitbucket.org/account/${d.username}/avatar/32/`;
            })
            .rollup(function (leaves) {
                return leaves.author;
            })
            .entries(commits);

        d3.selectAll('.toplist .panel').each(function (d, i) {
            renderLeaderboard(commits, avatars, this);
        });

        commitsTimeline(commits);
    });
});