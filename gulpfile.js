var gulp = require('gulp')
var gulpRename = require('gulp-rename')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')

var browserify = require('browserify')
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify')

gulp.task('build_js', function(){

    var b = browserify({
        entries: './src/js/QRreader.js',
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [babelify]
      });

    return b.bundle()
    .pipe(source('QRreader.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./dist'))
})

gulp.task('build_js_min', function(){

    var b = browserify({
        entries: './src/js/QRreader.js',
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [babelify]
      });

    return b.bundle()
    .pipe(source('QRreader_min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
})


gulp.task('build_css', function(){
    return gulp.src('./src/css/QRreader.css')
    .pipe(gulp.dest('./dist'))
})

gulp.task('build', ['build_js', 'build_css', 'build_js_min'])

gulp.task('update_docs', ['build'], function(){
    return gulp.src(['./dist/*.js', './dist/*.css'])
    .pipe(gulp.dest('./docs'))
})

gulp.task('dev', function(){
    return gulp.watch(['./src/js/*.js','./src/css/*.css'], ['update_docs'])
})

