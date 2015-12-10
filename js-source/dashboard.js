require(["d3", "moment"], function (d3, moment) {
    "use strict";

    var DAYS = 90;

    d3.csv("output.json", function (error, commits) {

        // exclude data from outside the last DAYS days
        commits = commits.filter(function (d) {
            var startDate = moment().add(-DAYS, 'day').startOf('day');
            var endDate = moment().startOf('day');
            var theDate = new Date(d.date);
            return !!(theDate > startDate && theDate < endDate);
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
            .splice(0, 3);

        yesterday.forEach(function (d, i) {
            d3.select('.toplist .list.last-day').append('div').attr("class", "commit").html('<span class="name">' +d.key + '</span> with ' + d.values + ' commits.');
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
            .splice(0, 3);

        lastWeek.forEach(function (d, i) {
            d3.select('.toplist .list.last-week').append('div').attr("class", "commit").html('<span class="name">' +d.key + '</span> with ' + d.values + ' commits.');
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
            .splice(0, 3);

        lastMonth.forEach(function (d, i) {
            d3.select('.toplist .list.last-month').append('div').attr("class", "commit").html('<span class="name">' +d.key + '</span> with ' + d.values + ' commits.');
        });

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
            .splice(0, 3);

        allTime.forEach(function (d, i) {
            d3.select('.toplist .list.all-time').append('div').attr("class", "commit").html('<span class="name">' +d.key + '</span> with ' + d.values + ' commits.');
        });

    });
});