require(["d3"], function (d3) {
    "use strict";

    var DAYS = 90;

    function parseDate(d) {
        return new Date(d);
    }

    d3.csv("output.json", function (error, commits) {

        // exclude data from outside the last DAYS days
        commits = commits.filter(function (d) {
            var startDate = (new Date() - 1000 * 60 * 60 * 24 * DAYS);
            var endDate = (new Date());
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
                var startDate = (new Date() - 1000 * 60 * 60 * 24 * 1);
                var endDate = (new Date());
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