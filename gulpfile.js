var gulp = require('gulp');
var del = require('del');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

gulp.task('clean', function () {
  del(['./public/dist']);
});

gulp.task('jshint', function () {
  return gulp.src(['./app.js', './public/src/js/upload.js', './public/src/js/overview.js'])
          .pipe(jshint())
          .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function () {
  return gulp.src('./public/src/js/*.js')
          .pipe(uglify())
          .pipe(gulp.dest('./public/dist/js/'));
});

gulp.task('sass', function () {
  return gulp.src('./public/src/scss/*.scss')
          .pipe(sass({ outputStyle: 'compressed' }))
          .on('error', handleError)
          .pipe(gulp.dest('./public/dist/css/'));
});

gulp.task('watch', function () {
  gulp.watch('./public/src/js/*.js', ['jshint', 'uglify']);
  gulp.watch('./public/src/scss/*.scss', ['sass']);
});


gulp.task('default', ['watch', 'jshint', 'uglify', 'sass']);

function handleError (error) {
  console.log('Error in \'' + error.plugin + '\'');
  console.log(error.message);
  this.emit('end');
}
