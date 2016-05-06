/* globals require, define */
define([], function () {
    return function toTitleCase(str) {
        return str.replace(/\b./g, function (m) {
            return m.toUpperCase();
        });
    }
});