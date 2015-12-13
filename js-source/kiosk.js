require(["jquery", "handlebars"], function ($, Handlebars) {
    "use strict";

    var source = $("#accolade-template").html();
    var template = Handlebars.compile(source);

    $('.kiosk-container').append(template({
        badge_img: './img/gremlin.png',
        title: 'Gremlin',
        subtitle: 'Don\'t feed them after midnight',
        description: 'Awarded to developers who really should be tucked up in bed instead of coding after midnight.',
        recipient: [{
            avatar: 'https://bitbucket.org/account/jonathanlord/avatar/32/',
            username: 'Adrian',
            date: '10th December 2015'
        }]
    }));
});