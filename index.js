
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    utils = require('./utils'),
    config = require('./config')

require('ts-gulpfile-typescript')

exports.registerTasks = (opts) => {
    let options = {
        minify: opts.minify || true,
        mangle: opts.mangle || false,
        debug: opts.debug || true,
        basedir: opts.basedir || '.',
        buildDir: opts.buildDir || 'build',
        entryPoints: opts.entryPoints || [],
    }

    // create the gulp task and the "on changed" handler
    gulp.task('browserify:build-ts', ['ts:check-tsconfig'], next => {
        const bundle = utils.initBrowserifyForTypescript({
            entries: options.entryPoints,
            debug: options.debug,
            basedir: options.baseDir
        })

        return utils.generateBundle(bundle, options.buildDir)(next)
                    .then(x => {
                        utils.watchForChanges(bundle, options.buildDir)
                        return x
                    })
    })
}


