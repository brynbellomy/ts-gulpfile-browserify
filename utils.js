var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    β = require('cli-components-build'),
    io = require('cli-components-io'),
    watchify = require('watchify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify')

module.exports = {
    initBrowserifyForTypescript,
    watchForChanges,
    generateBundle,
    shouldMinify,
}

/**
    Browserify helpers
 */

function initBrowserifyForTypescript (options) {
    const opts = Object.assign({}, watchify.args, options)
       , b = watchify(browserify(opts))

    b.transform('browserify-data') // this lets us call `require('blah.yaml')` from Javascript (it pre-parses YAML into node.js modules that get browserified into the final JS)
    b.plugin('tsify')              // compiles Typescript.  tsify's config is automatically read from the tsconfig.json in the same directory as the gulpfile, if one exists.
    b.on('log', $.util.log)
    return b
}

function watchForChanges (browserifyBundle, destination) {
    browserifyBundle.on('update', generateBundle(browserifyBundle, destination))
}

function generateBundle (browserifyBundle, destination, opts) {
    let options = {
        mangle: opts.mangle || false,
        minify: opts.minify || false,
    }

    return function (next) {
        console.log(io.header('Building with *typescript* version *' + require('typescript').version + '*'))

        return browserifyBundle.bundle()
                .on('error', β.errorHandler('build-ts'))
                .pipe( source('all-ts.js') )                    // bundles the whole set of files into one file
                .pipe( buffer() )                               // waits for the browserify stream to complete (sourcemaps need to see the whole file)
                .pipe( $.sourcemaps.init({ loadMaps: true }) )  // loads map from browserify file
                .pipe( $.if(() => options.minify, $.uglify({ mangle: options.mangle })) ) // minify and/or mangle the JS
                .pipe( $.sourcemaps.write('.') )                // writes .map file
                .pipe( gulp.dest( destination ) )          // writes that file out to the build dir
                .on('error', β.errorHandler('build-ts'))
                .on('done', next)
    }
}
