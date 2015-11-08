require([
    "jquery",
    "crossfilter",
    "d3",
    "history",
    "charts/barchart",
    "utils/querystring",
    "model/state"
], function($, crossfilter, d3, History, barChart, getQueryString, state) {
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
        var formatNumber = d3.format(",d"), formatDate = d3.time.format("%B %d, %Y"), formatTime = d3.time.format("%I:%M %p");

        // A nest operator, for grouping the commit panel.
        var nestByDate = d3.nest().key(function(d) {
            return d3.time.day(d.date);
        });

        var nestByUser = d3.nest().key(function(d) {
            return d.author;
        });

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
        var charts = [

            barChart(dateColWidth).dimension(date).group(dates).round(d3.time.day.round).x(d3.time.scale().domain([new Date() - 1000 * 60 * 60 * 24 * 365, new Date()]).rangeRound([0, dateColWidth * 365])), //                    .filter([new Date() - 1000 * 60 * 60 * 24 * 365, new Date()]),

            barChart(timeColWidth).dimension(hour).group(hours).x(d3.scale.linear().domain([0, 24]).rangeRound([0, timeColWidth * 24]))

        ];

        // Given our array of charts, which we assume are in the same order as the
        // .chart elements in the DOM, bind the charts to the DOM and render them.
        // We also listen to the chart's brush events to update the display.
        var chart = d3.selectAll(".chart .placeholder").data(charts).each(function(chart) {
            chart.on("brush", renderAll).on("brushend", renderAll);
        });

        // Render the initial lists.
        var commitsList = d3.selectAll(".panel.commit .list").data([commitList]);

        var usersList = d3.selectAll(".panel.user .list").data([userList]);

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

        //var selectedUsername = getQueryVariable("user"), startDate = getQueryVariable("startDate"), endDate = getQueryVariable("endDate"), startTime = getQueryVariable("startTime"), endTime = getQueryVariable("endTime");
        //
        //if(selectedUsername) {
        //    filterUser(decodeURI(selectedUsername));
        //}
        //
        //if(startDate) {
        //    startDate = new Date(parseInt(startDate, 10));
        //}
        //
        //if(endDate) {
        //    endDate = new Date(parseInt(endDate, 10));
        //}
        //
        //if(startTime) {
        //    startTime = parseInt(startTime, 10);
        //}
        //
        //if(endTime) {
        //    endTime = parseInt(endTime, 10);
        //}

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

        function commitList(div) {
            var commitsByDate = nestByDate.entries(date.top(1000));

            div.each(function() {
                var date = d3.select(this).selectAll(".date").data(commitsByDate, function(d) {
                    return d.key;
                });

                date.enter().append("div").attr("class", "date").append("div").attr("class", "day").append("span").text(function(d) {
                    return formatDate(d.values[0].date);
                });

                date.exit().remove();

                var commit = date.order().selectAll(".commit").data(function(d) {
                    return d.values;
                }, function(d) {
                    return d.index;
                });

                var commitEnter = commit.enter().append("div").attr("class", "commit");

                commitEnter.append("div").attr("class", "time").text(function(d) {
                    return formatTime(d.date);
                });

                commitEnter.append("div").attr("class", "author").text(function(d) {
                    return d.author;
                });

                commit.exit().remove();

                commit.order();
            });
        }

        function userList(div) {
            var commitsByUser = nestByUser.entries(date.top(100000));

            div.each(function() {

                commitsByUser.sort(function(a, b) {
                    return b.values.length > a.values.length ? 1 : -1;
                });

                var userList = d3.select(this).selectAll(".user-info").data(commitsByUser, function(d) {
                    return d.key;
                });

                userList.select(".commit-count").text(function(d) {
                    return d.values.length.toLocaleString() + " commits";
                });

                userList.enter().append("div").attr("class", "user-info").attr("data-user", function(d) {
                    return d.values[0].author;
                }).attr("onclick", function(d) {
                    return "javascript:filterUser('" + d.values[0].author + "')";
                }).append("div").attr("class", "user-name").append("span").text(function(d) {
                    return d.values[0].author;
                }).append("span").attr("class", "commit-count").text(function(d) {
                    return d.values.length.toLocaleString() + " commits";
                });


                userList.exit().remove();

                userList.order();
            });
        }
    });
});