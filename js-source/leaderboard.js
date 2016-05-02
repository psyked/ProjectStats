require(["d3", "c3", "moment", "jquery"], function (d3, c3, moment, $) {
    "use strict";

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

    function toTitleCase(str) {
        return str.replace(/\b./g, function (m) {
            return m.toUpperCase();
        });
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
                return "https://bitbucket.org/account/" + d.username + "/avatar/32/";
            })
            .rollup(function (leaves) {
                return leaves.author;
            })
            .entries(commits);

        d3.selectAll('.toplist .panel').each(function (d, i) {
            renderLeaderboard(commits, avatars, this);
        });

        var userCommitDetails = d3.nest()
            .key(function (d) {
                d.author = d.author.split("_").join(" ");
                d.author = d.author.split("[").join("");
                d.author = d.author.split("]").join("");
                if (d.author.indexOf("<") !== -1) {
                    return toTitleCase(d.author.split("<")[0].trim());
                }
                return toTitleCase(d.author.trim());
            })
            .key(function (d) {
                return moment(d.date).format("DD-MM-YYYY");
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits)
            .sort(function (a, b) {
                return d3.ascending(a.key, b.key);
            });

        var timeseries = ['x'];
        var GRAPH_TIMESERIES_DAY = 30;
        for (var i = GRAPH_TIMESERIES_DAY, l = 0; i > l; i--) {
            var date = moment().add(-i, 'days');
            if (!(date.format('E') == 6 || date.format('E') == 7)) {
                timeseries.push(date.format('DD-MM-YYYY'));
            }
        }

        var types = {};
        var groups = [];
        var cols = [timeseries];

        var row;
        for (i = 0, l = userCommitDetails.length; i < l; i++) {
            var userDisplayName = userCommitDetails[i].key;
            row = [userDisplayName];
            types[userDisplayName] = 'area-spline';
            groups.push(userDisplayName);

            for (var j = 0, jl = GRAPH_TIMESERIES_DAY; j < jl; j++) {
                row.push(0);
            }
            for (j = 0, jl = userCommitDetails[i].values.length; j < jl; j++) {
                row[timeseries.indexOf(userCommitDetails[i].values[j].key)] = userCommitDetails[i].values[j].values;
            }
            cols.push(row);
        }

        var chart = c3.generate({
            bindto: '.chart',
            data: {
                x: 'x',
                xFormat: '%d-%m-%Y',
                types,
                columns: cols,
                groups: [groups]
            },
            point: {
                show: false
            },
            axis: {
                x: {
                    type: 'category',
                    tick: {
                        format: '%e %B %Y'
                    }
                }
            },
            legend: {
                position: 'right'
            },
            size: {
                height: 258
            },
            tooltip: {
                grouped: false // Default true
            }
        });

        var nextTimeout;

        var selectBar = function () {
            $('.area-button,.pie-button').removeClass('active');
            $('.bar-button').addClass('active');
            chart.transform('bar');
        };

        var selectArea = function () {
            $('.bar-button,.pie-button').removeClass('active');
            $('.area-button').addClass('active');
            chart.transform('area-spline');
        };

        var selectPie = function () {
            $('.area-button,.bar-button').removeClass('active');
            $('.pie-button').addClass('active');
            chart.transform('pie');
        };

        $('.bar-button').on('click', function () {
            $('.play-button').removeClass('active');
            clearTimeout(nextTimeout);
            selectBar();
        });

        $('.area-button').on('click', function () {
            $('.play-button').removeClass('active');
            clearTimeout(nextTimeout);
            selectArea();
        });

        $('.pie-button').on('click', function () {
            $('.play-button').removeClass('active');
            clearTimeout(nextTimeout);
            selectPie();
        });

    });
});