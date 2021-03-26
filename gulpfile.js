import gulp from 'gulp'
import zip from 'gulp-zip'

export default () => (
    gulp.src(['manifest.json', 'src/**'], {
        'base': '.'
    })
    .pipe(zip('extension.zip'))
    .pipe(gulp.dest('production'))
);