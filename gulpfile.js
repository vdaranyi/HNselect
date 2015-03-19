var gulp = require('gulp');
var livereload = require('gulp-livereload');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');

// Live reload business.
gulp.task('reload', function () {
    livereload.reload();
});

gulp.task('buildJS', function () {

    var bundler = browserify();

    bundler.transform(reactify);
    bundler.add('./scripts/compiled/contentscript.js');

    return bundler.bundle().pipe(source('bundle.js')).pipe(gulp.dest('./scripts/compiled'));

});

// --------------------------------------------------------------

// Composed tasks
// --------------------------------------------------------------

gulp.task('default', function () {

    livereload.listen();

    gulp.watch('browser/js/**', function () {
        runSeq('buildJS', 'reload');
    });

});