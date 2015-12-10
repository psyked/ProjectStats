require(["d3", "moment"], function (d3, moment) {
    "use strict";

    var DAYS = 90;

    function parseDate(d) {
        return new Date(d);
    }

    d3.csv("output.json", function (error, commits) {

        // exclude data from outside the last DAYS days
        commits = commits.filter(function (d) {
            var startDate = moment().add(-DAYS, 'day').startOf('day');//(new Date() - 1000 * 60 * 60 * 24 * DAYS);
            var endDate = moment().startOf('day');//(new Date());
            var theDate = parseDate(d.date);

            if (theDate > startDate && theDate < endDate) {
                return true;
            }
            return false;
        });

        var nested_data = d3.nest()
            .key(function (d) {
                return d.author;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(commits.filter(function (d) {
                var startDate = moment().add(-1, 'day').startOf('day');//(new Date() - 1000 * 60 * 60 * 24 * 1);
                var endDate = moment().startOf('day');//(new Date());
                var theDate = parseDate(d.date);

                if (theDate > startDate && theDate < endDate) {
                    return true;
                }
                return false;
            }))
            .sort(function (a, b) {
                return d3.descending(a.values, b.values);
            })
            .splice(0, 3);

        nested_data.forEach(function (d, i) {
            d3.select('.toplist .list').append('div').attr("class", "commit").text(d.key + ' with ' + d.values + ' commits.');
        });

    });
});