require(["d3", "c3", "moment", "./components/chromecast-integration"], function (d3, c3, moment, chromecast) {
    "use strict";

    chromecast();

    var DAYS = 90;
    var COUNT = 10;

    function renderLeaderboard(commits, avatars, panel) {
        var units = d3.select(panel).attr('data-timeunit');

        if (units) {
            var previousResults = d3.nest()
                .key(function (d) {
                    return d.author;
                })
                .rollup(function (leaves) {
                    return leaves.length;
                })
                .entries(commits.filter(function (d) {
                    var startDate = moment().add(-2, units).startOf(units);
                    var endDate = moment().add(-1, units).startOf(units);
                    var theDate = new Date(d.date);
                    return !!(theDate > startDate && theDate < endDate);
                }))
                .sort(function (a, b) {
                    return d3.descending(a.values, b.values);
                });
        }

        var results = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                if (units) {
                    var startDate = moment().add(-1, units).startOf(units);
                    var endDate = moment().startOf(units);
                    var theDate = new Date(d.date);
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
            var moveIndex = "";
            if (units) {
                var oldIndex = previousResults.length;
                for (var j = 0; j < previousResults.length; j += 1) {
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
            d3.select(panel).select('.list').append('div').attr("class", "commit").html(moveIndex + ' <span class="index">' + (i + 1) + '.</span> ' + '<span class="name">' + d.key + '</span> with ' + d.values.toLocaleString() + ' commits.');
        });

        var dataToCheck = results;

        if (dataToCheck[0]) {
            var firstImage = "";
            avatars.forEach(function (d, i) {
                if (d.key === dataToCheck[0].key) {
                    firstImage = d.values[0].key;
                }
            });
            d3.select(panel).select('.avatars-area .first').append('img').attr('src', firstImage);
        }

        if (dataToCheck[1]) {
            var secondImage = "";
            avatars.forEach(function (d, i) {
                if (d.key === dataToCheck[1].key) {
                    secondImage = d.values[0].key;
                }
            });
            d3.select(panel).select('.avatars-area .second').append('img').attr('src', secondImage);
        }

        if (dataToCheck[2]) {
            var thirdImage = "";
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
            var startDate = moment().add(-DAYS, 'day').startOf('day');
            var endDate = moment().startOf('day');
            var theDate = new Date(d.date);
            return !!(theDate > startDate && theDate < endDate);
        });

        var avatars = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .key(function (d) {
                return d.avatar;
            })
            .rollup(function (leaves) {
                return leaves.author;
            })
            .entries(commits);

        d3.selectAll('.toplist .panel').each(function (d, i) {
            renderLeaderboard(commits, avatars, this);
        });

        var chart = c3.generate({
            bindto: '.chart',
            data: {
                columns: [
                    ['data1', 30, 200, 100, 400, 150, 250],
                    ['data2', 50, 20, 10, 40, 15, 25]
                ]
            },
            size: {
                height: 180
            }
        });
    });
});