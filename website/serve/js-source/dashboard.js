require(["d3", "moment"], function (d3, moment) {
    "use strict";

    var DAYS = 90;
    var COUNT = 10;

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


        var previousDay = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                var startDate = moment().add(-2, 'day').startOf('day');
                var endDate = moment().add(-1, 'day').startOf('day');
                var theDate = new Date(d.date);
                return !!(theDate > startDate && theDate < endDate);
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            });

        var yesterday = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                var startDate = moment().add(-1, 'day').startOf('day');
                var endDate = moment().startOf('day');
                var theDate = new Date(d.date);
                return !!(theDate > startDate && theDate < endDate);
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            })
            .splice(0, COUNT);

        yesterday.forEach(function (d, i) {
            var oldIndex = previousDay.length;
            for (var j = 0; j < previousDay.length; j += 1) {
                if (previousDay[j]["key"] === d.key) {
                    oldIndex = j;
                }
            }
            var moveIndex = '<i class="fa fa-minus move-icon"></i>';
            if (oldIndex > i) {
                moveIndex = '<i class="fa fa-arrow-up move-icon up"></i>';
            } else if (oldIndex < i) {
                moveIndex = '<i class="fa fa-arrow-down move-icon down"></i>';
            }
            d3.select('.toplist .list.last-day').append('div').attr("class", "commit").html(moveIndex + ' <span class="index">' + (i + 1) + '.</span> ' + '<span class="name">' + d.key + '</span> with ' + d.values + ' commits.');
        });

        var dataToCheck = yesterday;
        var firstImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[0].key) {
                firstImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-day .first').append('img').attr('src', firstImage);

        var secondImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[1].key) {
                secondImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-day .second').append('img').attr('src', secondImage);

        var thirdImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[2].key) {
                thirdImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-day .third').append('img').attr('src', thirdImage);

        var previousWeek = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                var startDate = moment().add(-2, 'week').startOf('day');
                var endDate = moment().add(-1, 'week').startOf('day');
                var theDate = new Date(d.date);
                return !!(theDate > startDate && theDate < endDate);
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            });

        var lastWeek = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                var startDate = moment().add(-1, 'week').startOf('day');
                var endDate = moment().startOf('day');
                var theDate = new Date(d.date);
                return !!(theDate > startDate && theDate < endDate);
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            })
            .splice(0, COUNT);

        lastWeek.forEach(function (d, i) {
            var oldIndex = previousWeek.length;
            for (var j = 0; j < previousWeek.length; j += 1) {
                if (previousWeek[j]["key"] === d.key) {
                    oldIndex = j;
                }
            }
            var moveIndex = '<i class="fa fa-minus move-icon"></i>';
            if (oldIndex > i) {
                moveIndex = '<i class="fa fa-arrow-up move-icon up"></i>';
            } else if (oldIndex < i) {
                moveIndex = '<i class="fa fa-arrow-down move-icon down"></i>';
            }
            d3.select('.toplist .list.last-week').append('div').attr("class", "commit").html(moveIndex + ' <span class="index">' + (i + 1) + '.</span> ' + '<span class="name">' + d.key + '</span> with ' + d.values + ' commits.');
        });

        var dataToCheck = lastWeek;
        var firstImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[0].key) {
                firstImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-week .first').append('img').attr('src', firstImage);

        var secondImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[1].key) {
                secondImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-week .second').append('img').attr('src', secondImage);

        var thirdImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[2].key) {
                thirdImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-week .third').append('img').attr('src', thirdImage);

        var previousMonth = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                var startDate = moment().add(-2, 'month').startOf('day');
                var endDate = moment().add(-1, 'month').startOf('day');
                var theDate = new Date(d.date);
                return !!(theDate > startDate && theDate < endDate);
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            });

        var lastMonth = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                var startDate = moment().add(-1, 'month').startOf('day');
                var endDate = moment().startOf('day');
                var theDate = new Date(d.date);
                return !!(theDate > startDate && theDate < endDate);
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            })
            .splice(0, COUNT);

        lastMonth.forEach(function (d, i) {
            var oldIndex = previousMonth.length;
            for (var j = 0; j < previousMonth.length; j += 1) {
                if (previousMonth[j]["key"] === d.key) {
                    oldIndex = j;
                }
            }
            var moveIndex = '<i class="fa fa-minus move-icon"></i>';
            if (oldIndex > i) {
                moveIndex = '<i class="fa fa-arrow-up move-icon up"></i>';
            } else if (oldIndex < i) {
                moveIndex = '<i class="fa fa-arrow-down move-icon down"></i>';
            }
            d3.select('.toplist .list.last-month').append('div').attr("class", "commit").html(moveIndex + ' <span class="index">' + (i + 1) + '.</span> ' + '<span class="name">' + d.key + '</span> with ' + d.values + ' commits.');
        });

        var dataToCheck = lastMonth;
        var firstImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[0].key) {
                firstImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-month .first').append('img').attr('src', firstImage);

        var secondImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[1].key) {
                secondImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-month .second').append('img').attr('src', secondImage);

        var thirdImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[2].key) {
                thirdImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.last-month .third').append('img').attr('src', thirdImage);

        var allTime = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits)
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            })
            .splice(0, COUNT);

        allTime.forEach(function (d, i) {
            var moveIndex = "";
            d3.select('.toplist .list.all-time').append('div').attr("class", "commit").html(moveIndex + ' <span class="index">' + (i + 1) + '.</span> ' + '<span class="name">' + d.key + '</span> with ' + d.values + ' commits.');
        });

        var dataToCheck = allTime;
        var firstImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[0].key) {
                firstImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.all-time .first').append('img').attr('src', firstImage);

        var secondImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[1].key) {
                secondImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.all-time .second').append('img').attr('src', secondImage);

        var thirdImage = "";
        avatars.forEach(function (d, i) {
            if (d.key === dataToCheck[2].key) {
                thirdImage = d.values[0].key;
            }
        });
        d3.select('.avatars-area.all-time .third').append('img').attr('src', thirdImage);

    });
});