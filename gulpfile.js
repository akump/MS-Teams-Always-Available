import gulp from 'gulp';
import zip from 'gulp-zip';
import uglify from 'gulp-uglify';

export default () =>
  gulp
    .src(['src/js/**', 'background.js'], {
      base: '.',
    })
    .pipe(uglify())
    .pipe(
      gulp.src(['manifest.json', 'src/css/**', 'src/html/**', 'src/images/**'], {
        base: '.',
      })
    )
    .pipe(zip('extension.zip'))
    .pipe(gulp.dest('production'));
