var gulp = require('gulp');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');
var sass = require('gulp-sass');

// Live reload business.
//gulp.task('reload', function () {
//    livereload.reload();
//});
//
//gulp.task('reloadCSS', function () {
//    gulp.src('./styles/main.css').pipe(livereload());
//});

gulp.task('buildCSS', function () {
    return gulp.src('./styles/main.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(rename('./compiled/main.css'))
        .pipe(gulp.dest('./styles'))
});

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

    gulp.watch('./styles/**', ['buildCSS'], function () {
        gulp.start('buildCSS');
    });

});