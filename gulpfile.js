var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');

var paths = {
  scripts: ['dev/bower_components/underscore/underscore.js','dev/bower_components/jquery/dist/jquery.min.js','dev/bower_components/snap.svg/dist/snap.svg-min.js','dev/js/main.js'],
  styleSheets: ['bower_components/Font-Awesome/css/font-awesome.css'],
  svgs: ['dev/svg/*.svg'],
  fonts:['dev/bower_components/font-awesome/fonts/*'],
  txt:['dev/txt/*.txt'],

};

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('att.min.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('css', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  return gulp.src(paths.styleSheets)
    .pipe(concat('att.min.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('build/css'));
});

gulp.task('svg', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  return gulp.src(paths.svgs)
    .pipe(gulp.dest('build/svg'));
});

gulp.task('txt', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  return gulp.src(paths.txt)
    .pipe(gulp.dest('build/txt'));
});

gulp.task('fonts',function(){
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('build/fonts'));  
});

// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['scripts']) ;
  gulp.watch(paths.styleSheets, ['css']) ;
  gulp.watch(['gulpfile.js'], ['default']) ;
  //gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts', 'css','svg','txt','fonts','watch']);//
