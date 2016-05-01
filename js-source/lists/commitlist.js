define(["d3"], function (d3) {

    const formatDate = d3.time.format("%B %d, %Y");
    const formatTime = d3.time.format("%I:%M %p");

    const nestByDate = d3.nest().key(function (d) {
        return d3.time.day(d.date);
    });

    let date;

    function setData(data) {
        date = data;
    }

    function commitList(div) {
        const commitsByDate = nestByDate.entries(date.top(1000));

        div.each(function () {
            const date = d3.select(this).selectAll(".date").data(commitsByDate, function (d) {
                return d.key;
            });

            date.enter().append("div").attr("class", "date").append("div").attr("class", "day").append("span").text(function (d) {
                return formatDate(d.values[0].date);
            });

            date.exit().remove();

            const commit = date.order().selectAll(".commit").data(function (d) {
                return d.values;
            }, function (d) {
                return d.index;
            });

            const commitEnter = commit.enter().append("div").attr("class", "commit");

            commitEnter.append("div").attr("class", "time").text(function (d) {
                return formatTime(d.date);
            });

            commitEnter.append("div").attr("class", "author").text(function (d) {
                return d.author;
            });

            commit.exit().remove();

            commit.order();
        });
    }

    return {
        init: commitList,
        setData: setData
    }
});