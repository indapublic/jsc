var
	gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	js_obfuscator = require('gulp-js-obfuscator');

gulp.task('default', function() {
	return gulp.src('jsc.js')
		.pipe(uglify({
			compress: true
		}))
		.pipe(js_obfuscator())
		.pipe(rename('jsc.min.js')) 
		.pipe(gulp.dest(''));
});