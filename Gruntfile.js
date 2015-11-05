var SASS_FILES = {
    './website/serve/css/main.css': './website/scss/main.scss'
};

//var JAVASCRIPT_FILES = {
//    './website/assets/js/<%= pkg.name %>/<%= pkg.name %>.min.js': ['./source/js/<%= pkg.name %>/**/*.js']
//};

//var CRITICAL_CSS_FILE = './website/assets/css/<%= pkg.name %>/<%= pkg.name %>.critical.min.css';

//var WATCH_JAVASCRIPT_FILES = [
//    './source/js/<%= pkg.name %>/**/*.js'
//];

var WATCH_SASS_FILES = [
    './website/scss/**/*.scss'
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

        // Task configuration.
        //uglify: {
        //    dist: {
        //        files: JAVASCRIPT_FILES
        //    }
        //},

        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: SASS_FILES
            }
        },

        //criticalcss: {
        //    custom: {
        //        options: {
        //            url: SITE_URL,
        //            filename: './website/assets/css/<%= pkg.name %>/<%= pkg.name %>.min.css',
        //            outputfile: CRITICAL_CSS_FILE
        //        }
        //    }
        //},

        watch: {
            //uglify: {
            //    files: WATCH_JAVASCRIPT_FILES,
            //    tasks: ['uglify']
            //},

            sass: {
                loadPath: require('node-bourbon').includePaths, // awesome mixin lib: http://bourbon.io
                files: WATCH_SASS_FILES,
                tasks: ['sass']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['sass', 'watch']);
};