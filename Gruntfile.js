var SASS_FILES = {
    './website/serve/css/main.css': './website/serve/scss/main.scss'
};

var WATCH_JAVASCRIPT_FILES = [
    './website/serve/js-source/**/*.js'
];

var WATCH_SASS_FILES = [
    './website/serve/scss/**/*.scss'
];

/*global module:false*/
module.exports = function (grunt) {
    // avoid having to load tasks individually
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*']
    });

    // time the events
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        autoprefixer: {
            options: {
                browsers: ['last 2 versions', 'ie 8', 'ie 9']
            },
            your_target: {
                files: {
                    './website/serve/css/main.css': './website/serve/css/main.css'
                }
            }
        },

        copy: {
            js: {
                files: [
                    // makes all src relative to cwd
                    {expand: true, cwd: 'website/serve/js-source/', src: ['**'], dest: 'website/serve/js-source-es5/'},
                ]
            }
        },

        babel: {
            options: {
                // sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'website/serve/js-source',
                    src: ['**/*.js', '!libs/**/*.js'],
                    dest: 'website/serve/js-source-es5'
                }]
            }
        },

        requirejs: {
            main: {
                options: {
                    mainConfigFile: "./website/serve/js-source-es5/require-config.js",
                    baseUrl: "./website/serve/js-source-es5",
                    name: "main",
                    out: "./website/serve/js/main.js"
                }
            },
            leaderboard: {
                options: {
                    mainConfigFile: "./website/serve/js-source-es5/require-config.js",
                    baseUrl: "./website/serve/js-source-es5",
                    name: "leaderboard",
                    out: "./website/serve/js/leaderboard.js"
                }
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: SASS_FILES
            }
        },

        watch: {
            uglify: {
                files: WATCH_JAVASCRIPT_FILES,
                tasks: ['babel', 'requirejs']
            },

            sass: {
                loadPath: require('node-bourbon').includePaths, // awesome mixin lib: http://bourbon.io
                files: WATCH_SASS_FILES,
                tasks: ['sass', 'autoprefixer']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['copy', 'babel', 'requirejs', 'sass', 'watch']);
};