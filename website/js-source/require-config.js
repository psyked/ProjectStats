require.config({
    paths: {
        "jquery": "libs/jquery-2.1.4.min",
        "crossfilter": "libs/crossfilter.v1",
        "history": "libs/native.history",
        "d3": "libs/d3",
        "moment": "libs/moment/moment",
    },
    shim: {
        'crossfilter': {
            deps: [],
            exports: 'crossfilter'
        },
        'history': {
            deps: [],
            exports: 'History'
        }
    },
    config: {
        moment: {
            noGlobal: true
        }
    }
});