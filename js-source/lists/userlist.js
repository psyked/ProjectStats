define(["d3"], function (d3) {

    var nestByUser = d3.nest().key(function (d) {
        return d.author;
    });

    var date;

    function setData(data) {
        date = data;
    }

    function userList(div) {
        var commitsByUser = nestByUser.entries(date.top(100000));

        div.each(function () {

            commitsByUser.sort(function (a, b) {
                return b.values.length > a.values.length ? 1 : -1;
            });

            var userList = d3.select(this).selectAll(".user-info").data(commitsByUser, function (d) {
                return d.key;
            });

            userList.select(".commit-count").text(function (d) {
                return d.values.length.toLocaleString() + " commits";
            });

            userList.enter().append("div").attr("class", "user-info").attr("data-user", function (d) {
                return d.values[0].author;
            }).attr("onclick", function (d) {
                return "javascript:filterUser('" + d.values[0].author + "')";
            }).append("div").attr("class", "user-name").append("span").text(function (d) {
                return d.values[0].author;
            }).append("span").attr("class", "commit-count").text(function (d) {
                return d.values.length.toLocaleString() + " commits";
            });


            userList.exit().remove();

            userList.order();
        });
    }

    return {
        init: userList,
        setData: setData
    }
});