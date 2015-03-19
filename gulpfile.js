var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');

// Live reload business.
//gulp.task('reload', function () {
//    livereload.reload();
//});

gulp.task('buildJS', function () {

    var bundler = browserify();

    bundler.transform(reactify);
    bundler.add('./scripts/contentscript.js');

    return bundler.bundle().pipe(source('bundle.js')).pipe(gulp.dest('./scripts/compiled'));

});

// --------------------------------------------------------------

// Composed tasks
// --------------------------------------------------------------

gulp.task('default', function () {


    gulp.watch(['scripts/**', '!scripts/compiled/bundle.js'], function () {
        gulp.start('buildJS');
    });

});