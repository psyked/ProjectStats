require(["jquery", "velocity", "handlebars", "nprogress"], function ($, velocity, Handlebars, NProgress) {
    "use strict";

    var source = $("#accolade-template").html();
    var badgeTemplate = Handlebars.compile(source);
    var badgeData;

    const EASING_PROPS = [0.645, 0.045, 0.355, 1];
    const EASING_TIME = 500;
    const HOLD_CARD_TIME = 10000;

    NProgress.configure({
        minimum: 0,
        trickle: false,
        showSpinner: false,
        parent: '.kiosk-container'
    });

    $.ajax({
        url: './badges.json',
        success: displayBadges,
        error: displayError
    });

    function displayBadges(jsonBadgeData) {
        badgeData = jsonBadgeData;

        var tile = $(badgeTemplate(findABadge()));
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
                NProgress.set(0.0);
                var i = 0;
                var countDown = setInterval(function () {
                    i++;
                    NProgress.set(i / (HOLD_CARD_TIME / 1000));
                }, 1000);

                setTimeout(function () {
                    clearInterval(countDown);
                    NProgress.set(1.0);
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
            complete: function () {
                tile.remove();
                displayNewCard();
            }
        })
    }

    function displayNewCard() {
        var tile = $(badgeTemplate(findABadge()));
        tile.css('margin-top', '50%');

        $('.kiosk-container').append(tile);

        showCard(tile);
    }

    function findABadge() {
        if (badgeData.length) {
            var indexToReturn = Math.floor(Math.random() * badgeData.length);
            return badgeData[indexToReturn];
        } else {
            return badgeData;
        }
    }
});