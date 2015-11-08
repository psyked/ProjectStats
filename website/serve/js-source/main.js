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
    "lists/userlist"
], function($, crossfilter, d3, c3, History, barChart, getQueryString, state, commitList, userList) {
    "use strict";

    (function(window, undefined) {

        // Bind to StateChange Event
        History.Adapter.bind(window, 'statechange', function() { // Note: We are using statechange instead of popstate
            var State = History.getState(); // Note: We are using History.getState() instead of event.state
        });

    })(window);

    d3.csv("output.json", function(error, commits) {

        // exclude data from outside the last 365 days
        commits = commits.filter(function(d) {
            var startDate = (new Date() - 1000 * 60 * 60 * 24 * 365);
            var endDate = (new Date());
            var theDate = parseDate(d.date);
            if(theDate > startDate && theDate < endDate) {
                return true;
            }
            return false;
        });

        // Various formatters.
        var formatNumber = d3.format(",d");

        // A little coercion, since the CSV is untyped.
        commits.forEach(function(d, i) {
            d.index = i;
            d.date = parseDate(d.date);
        });

        // Create the crossfilter for the relevant dimensions and groups.
        var commit = crossfilter(commits), all = commit.groupAll(), date = commit.dimension(function(d) {
                return d.date;
            }), //.filter([new Date() - 1000 * 60 * 60 * 24 * 365, new Date()]),
            user = commit.dimension(function(d) {
                return d.author;
            }), dates = date.group(d3.time.day), weeks = date.group(d3.time.week), hour = commit.dimension(function(d) {
                return d.date.getHours() + d.date.getMinutes() / 60;
            }), hours = hour.group(Math.floor);

        var dateColWidth = ($(".graph.date").width() - 30) / 365;
        var timeColWidth = ($(".graph.time").width() - 30) / 24;

        //        var datesOfCommit = barChart(dateColWidth).dimension(date).group(dates).round(d3.time.day.round).x(d3.time.scale().domain([
        //            new Date() - 1000 * 60 * 60 * 24 * 365, new Date()
        //        ]).rangeRound([0, dateColWidth * 365]));

        //var datesOfCommit = barChart(dateColWidth).dimension(date).group(dates).round(d3.time.day.round).x(d3.time.scale().domain([
        //    new Date() - 1000 * 60 * 60 * 24 * 365, new Date()
        //]).rangeRound([0, dateColWidth * 365]));

        c3.generate({
            bindto: '.graph.date',
            data: {
                columns: [
                    ['data1', 30, 200, 100, 400, 150, 250],
                    ['data2', 50, 20, 10, 40, 15, 25]
                ]
            }
        });


        var timeOfDay = barChart(timeColWidth).dimension(hour).group(hours).x(d3.scale.linear().domain([
            0,
            24
        ]).rangeRound([
            0, timeColWidth * 24
        ]));

        var charts = [
            undefined, timeOfDay
        ];

        // Given our array of charts, which we assume are in the same order as the
        // .chart elements in the DOM, bind the charts to the DOM and render them.
        // We also listen to the chart's brush events to update the display.
        var chart = d3.selectAll(".chart .placeholder").data(charts).each(function(chart) {
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

        window.filter = function(filters) {
            filters.forEach(function(d, i) {
                charts[i].filter(d);
            });
            renderAll();
        };

        window.reset = function(i) {
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

        window.filterUser = function(username) {
            $(".user-info").removeClass("selected");
            state.selectedUsername = username;
            if(username) {
                $(".user-info[data-user='" + username + "']").addClass("selected");
                user.filterFunction(function(d) {
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

        var dateFilters, timeFilters;

        if(state.startDate != undefined && state.endDate != undefined) {
            dateFilters = [state.startDate, state.endDate];
        }

        if(state.startTime != undefined && state.endTime != undefined) {
            timeFilters = [state.startTime, state.endTime];
        }

        if(state.startTime && state.endTime || state.startDate && state.endDate) {
            filter([dateFilters, timeFilters]);
        }
    });
});