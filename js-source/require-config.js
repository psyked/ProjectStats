require.config({
    paths: {
        "jquery": "libs/jquery-2.1.4.min",
        "crossfilter": "libs/crossfilter.v1",
        "history": "libs/native.history",
        "d3": "libs/d3/d3",
        "c3": "libs/c3/c3",
        "moment": "libs/moment/moment",
        "handlebars": "libs/handlebars/handlebars.amd",
        "velocity": "libs/velocity/velocity",
        "nprogress": "libs/nprogress/nprogress"
    },
    shim: {
        'crossfilter': {
            deps: [],
            exports: 'crossfilter'
        },
        'history': {
            deps: [],
            exports: 'History'
        },
        'velocity': {
            deps: ["jquery"],
            exports: 'jQuery.fn.velocity'
        }
    },
    config: {
        moment: {
            noGlobal: true
        }
    }
});