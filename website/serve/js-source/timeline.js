require([
    "jquery",
    "crossfilter",
    "d3",
    "c3",
    "history",
    "charts/barchart",
    "utils/querystring",
    "model/state",
    "lists/commitlist",
    "lists/userlist",
    "moment"
], function ($, crossfilter, d3, c3, History, barChart, getQueryString, state, commitList, userList, moment) {
    "use strict";

    // var host = "psyked.github.io";
    // if((host == window.location.host) && (window.location.protocol != "https:")) {
    //     window.location.protocol = "https";
    // }

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

    (function (window, undefined) {

        // Bind to StateChange Event
        History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
            const State = History.getState(); // Note: We are using History.getState() instead of event.state
        });

    })(window);

    d3.csv("output.json", function (error, commits) {
        // exclude data from outside the last DAYS days
        commits = commits.filter(function (d) {
            const startDate = moment().add(-DAYS, 'day').startOf('day');//(new Date() - 1000 * 60 * 60 * 24 * DAYS);
            const endDate = moment().startOf('day');//(new Date());
            const theDate = parseDate(d.date);

            d3.select(".date-from").text(moment(startDate).format("LL"));
            d3.select(".date-to").text(moment(endDate).format("LL"));

            if (theDate > startDate && theDate < endDate) {
                return true;
            }
            return false;
        });

        // Various formatters.
        const formatNumber = d3.format(",d");

        // A little coercion, since the CSV is untyped.
        commits.forEach(function (d, i) {
            d.index = i;
            d.date = parseDate(d.date);
        });

        // Create the crossfilter for the relevant dimensions and groups.
        const commit = crossfilter(commits);

        const all = commit.groupAll();

        //.filter([new Date() - 1000 * 60 * 60 * 24 * 365, new Date()]),
        const date = commit.dimension(function (d) {
                return d.date;
            });

        const user = commit.dimension(function (d) {
            return d.author;
        });

        const dates = date.group(d3.time.day);
        const weeks = date.group(d3.time.week);

        const hour = commit.dimension(function (d) {
                return d.date.getHours() + d.date.getMinutes() / 60;
            });

        const hours = hour.group(Math.floor);

        const dateColWidth = ($(".graph.date").width() - 30) / DAYS;
        const timeColWidth = ($(".graph.time").width() - 30) / 24;

        const timeChart = barChart(dateColWidth)
            .dimension(date)
            .group(dates)
            .round(d3.time.day.round)
            .x(d3.time.scale()
                .domain([moment().add(-DAYS, 'day').startOf('day'), moment().startOf('day')])
                .rangeRound([0, dateColWidth * DAYS])
            );

        const hoursChart = barChart(timeColWidth)
            .dimension(hour)
            .group(hours)
            .x(d3.scale.linear()
                .domain([0, 24])
                .rangeRound([0, timeColWidth * 24])
            );

        const charts = [timeChart, hoursChart];

        // Given our array of charts, which we assume are in the same order as the
        // .chart elements in the DOM, bind the charts to the DOM and render them.
        // We also listen to the chart's brush events to update the display.
        const chart = d3.selectAll(".chart .placeholder").data(charts).each(function (chart) {
            chart.on("brush", renderAll).on("brushend", renderAll);
        });

        commitList.setData(date);

        userList.setData(date);

        // Render the initial lists.
        var commitsList = d3.selectAll(".panel.commit .list").data([commitList.init]);

        var usersList = d3.selectAll(".panel.user .list").data([userList.init]);

        // Render the total.
        d3.selectAll("#total").text(formatNumber(commit.size()));

        renderAll();

        // Renders the specified chart or list.
        function render(method) {
            d3.select(this).call(method);
        }

        // Whenever the brush moves, re-rendering everything.
        function renderAll() {
            chart.each(render);
            commitsList.each(render);
            usersList.each(render);
            d3.select("#active").text(formatNumber(all.value()));
        }

        // Like d3.time.format, but faster.
        function parseDate(d) {
            return new Date(d);
        }

        window.filter = function (filters) {
            filters.forEach(function (d, i) {
                if (d) {
                    charts[i].filter(d);
                }
            });
            renderAll();
        };

        window.reset = function (i) {
            charts[i].filter(null);

            //            if (i == 0) {
            state.startTime = undefined;
            state.endTime = undefined;
            //            } else {
            state.startDate = undefined;
            state.endDate = undefined;
            //            }

            History.pushState({}, window.title, getQueryString());

            renderAll();
        };

        window.filterUser = function (username) {
            $(".user-info").removeClass("selected");
            state.selectedUsername = username;
            if (username) {
                $(`.user-info[data-user='${username}']`).addClass("selected");
                user.filterFunction(function (d) {
                    return d == username;
                });
                $(".panel.user .reset").show();
            } else {
                $(".panel.user .reset").hide();
                user.filterAll();
            }
            History.pushState({user: username}, window.title, getQueryString());
            renderAll();
        };

        let dateFilters;
        let timeFilters;

        if (state.startDate && state.endDate) {
            dateFilters = [state.startDate, state.endDate];
        }

        if (state.startTime && state.endTime) {
            timeFilters = [state.startTime, state.endTime];
        }

        if (dateFilters || timeFilters) {
            filter([dateFilters, timeFilters]);
        }
    });
});