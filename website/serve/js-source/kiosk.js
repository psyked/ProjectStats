require(["jquery", "velocity", "handlebars"], function ($, velocity, Handlebars) {
    "use strict";

    var source = $("#accolade-template").html();
    var badgeTemplate = Handlebars.compile(source);
    var badgeData;

    const EASING_PROPS = [0.645, 0.045, 0.355, 1];
    const EASING_TIME = 500;
    const HOLD_CARD_TIME = 10000;

    $.ajax({
        url: './badges.json',
        success: displayBadges,
        error: displayError
    });

    function displayBadges(jsonBadgeData) {
        badgeData = jsonBadgeData;

        var tile = $(badgeTemplate(badgeData));
        tile.css('margin-top', '50%');

        $('.kiosk-container').append(tile);

        showCard(tile);
    }

    function displayError() {

    }

    function showCard(tile) {
        tile.velocity({
            marginTop: '0%'
        }, {
            duration: EASING_TIME,
            easing: EASING_PROPS,
            complete: function animationComplete() {
                setTimeout(function () {
                    hideCard(tile);
                }, HOLD_CARD_TIME);
            }
        });
    }

    function hideCard(tile) {
        tile.velocity({
            marginTop: '-50%'
        }, {
            duration: EASING_TIME,
            easing: EASING_PROPS,
            complete: function(){
                tile.remove();
                displayNewCard();
            }
        })
    }

    function displayNewCard() {
        var tile = $(badgeTemplate(badgeData));
        tile.css('margin-top', '50%');

        $('.kiosk-container').append(tile);

        showCard(tile);
    }
});