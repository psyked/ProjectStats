/* globals require, define */
define(['c3', 'd3', 'moment', 'utils/totitlecase'], function (c3, d3, moment, toTitleCase) {

    return function (commits) {

        const userCommitDetails = d3.nest()
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

        const timeseries = ['x'];
        const GRAPH_TIMESERIES_DAY = 30;
        for (var i = GRAPH_TIMESERIES_DAY, l = 0; i > l; i--) {
            var date = moment().add(-i, 'days');
            if (!(date.format('E') == 6 || date.format('E') == 7)) {
                timeseries.push(date.format('DD-MM-YYYY'));
            }
        }

        const types = {};
        const groups = [];
        const cols = [timeseries];

        let row;
        for (i = 0, l = userCommitDetails.length; i < l; i++) {
            const userDisplayName = userCommitDetails[i].key;
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

        const chart = c3.generate({
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

        let nextTimeout;

        const selectBar = function () {
            $('.area-button,.pie-button').removeClass('active');
            $('.bar-button').addClass('active');
            chart.transform('bar');
        };

        const selectArea = function () {
            $('.bar-button,.pie-button').removeClass('active');
            $('.area-button').addClass('active');
            chart.transform('area-spline');
        };

        const selectPie = function () {
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
    };
});