
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    utils = require('./utils'),
    config = require('./config')

exports.registerTasks = () => {

    // create the gulp task and the "on changed" handler
    gulp.task('browserify:build-ts', ['check-tsconfig'], next => {
        const bundle = utils.initBrowserifyForTypescript({
            entries: config.ENTRY_POINTS,
            debug: config.DEBUG,
            basedir: '.'
        })

        return utils.generateBundle(bundle, config.BUILD_DIR)(next)
                    .then(x => {
                        utils.watchForChanges(bundle, config.BUILD_DIR)
                        return x
                    })
    })
}


