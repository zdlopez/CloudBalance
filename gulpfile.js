// Use gulp to automate the build process
// $ npm install gulp gulp-browserify gulp-concat react reactify
  // TODO: create package.json

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');
// var clean = require('gulp-clean')

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// gulp.task('clean', function(){        // maybe should be using rimraf or del instead of clean
//   return gulp.src(['dist/*'], {read:false})
//   .pipe(clean());
// });

gulp.task('browserify', function() {
  gulp.src('public/js/main.js')
    // the following will convert all JSX to JS
    .pipe(browserify({transform: 'reactify'}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('copy', function() {
  gulp.src('public/*.html')
    .pipe(gulp.dest('dist'));
  gulp.src('public/css/*.css')
    .pipe(gulp.dest('dist/css'));
  gulp.src('public/assets/*.*')
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('browserify-stock', function(){
  gulp.src('public/js/main-stock.js')
    .pipe(browserify({transform: 'reactify'}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/stock/js'));
});
gulp.task('copy-stock', function() {
  gulp.src('public/index.html')
    .pipe(gulp.dest('dist/stock'));  
  gulp.src('public/css/*.css')
    .pipe(gulp.dest('dist/stock/css'));  
  gulp.src('public/assets/*.*')
    .pipe(gulp.dest('dist/stock/assets'))

});

gulp.task('stock', ['browserify-stock', 'copy-stock']);

gulp.task('watch-stock', function() {
  gulp.watch('public/**/*.*', ['stock']);
});


gulp.task('run', shell.task([
  'cd server && nodemon app.js'
]));

gulp.task('build', ['browserify', 'copy']);


gulp.task('default', ['build', 'watch', 'run']);

gulp.task('watch', function() {
  gulp.watch('public/**/*.*', ['build']);
});


