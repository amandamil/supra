const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglifyjs = require('uglify-js');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyjs);
const replace = require('gulp-replace');

const CDN_URLS = {
  "build": {
    assets: "",
    videos: "https://tmca-media.rotorint.com/supra-immersive-test/",
  },
  "build:prod": {
    assets: "https://tmca-media.rotorint.com/supra-immersive/",
    videos: "https://tmca-media.rotorint.com/supra-immersive/",
  },
  "build:test": {
    assets: "https://tmca-media.rotorint.com/supra-immersive-test/",
    videos: "https://tmca-media.rotorint.com/supra-immersive-test/",
  }
}

var paths = {
  sass: {
      compile: ['assets/sass/**/*.sass'],
      libs: ['assets/sass/libs/*.css']
  },
  html: {
      all: ['assets/**/*.html'],
  },
  js: {
      custom: ['assets/js/*.js'],
      libs: ['assets/js/libs/**/*.js']
  },
  img: {
      all: [
          'assets/img/**/*.jpg',
          'assets/img/**/*.gif',
          'assets/img/**/*.png',
          'assets/img/**/*.svg',
          'assets/img/**/*.ico',
          'assets/img/**/*.xml'
      ],
  },
  fonts: {
      otf: './assets/fonts/*.ttf',
      all: './assets/fonts/**/*'
  },
  video: {
    all: [
        'assets/video/**/*.mp4',
        'assets/video/**/*.mp3',
        'assets/video/**/*.webm'
    ],
  },
};

gulp.task('sass', function() {
	return gulp.src(paths.sass.compile)
		.pipe(sass())
		.pipe(autoprefixer({
            browsers: ['last 15 versions'],
            cascade: true
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename('main.min.css'))
		.pipe(gulp.dest('public/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('sass-libs', function() {
  return gulp.src(paths.sass.libs)
      .pipe(gulp.dest('public/css/libs'))
});

gulp.task('html', function() {
	return gulp.src(paths.html.all)
		.pipe(gulp.dest('public'))
});

gulp.task('js', function() {
    return gulp.src(paths.js.custom)
        .pipe(rename('main.min.js'))
		.pipe(gulp.dest('public/js'))
});
gulp.task('uglifyjs', function() {
    return gulp.src(paths.js.custom)
        .pipe(uglify())
        .pipe(rename('main.min.js'))
		.pipe(gulp.dest('public/js'))
});

gulp.task('js-libs', function() {
    return gulp.src(paths.js.libs)
        .pipe(gulp.dest('public/js/libs'))
});

gulp.task('img', function() {
	return gulp.src(paths.img.all)
		.pipe(gulp.dest('public/img'))
});

gulp.task('fonts', function () {
    return gulp.src(paths.fonts.all)
        .pipe(gulp.dest('public/fonts'));
});

gulp.task('video', function() {
	return gulp.src(paths.video.all)
		.pipe(gulp.dest('public/video'))
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: 'public'
        },
        notify: false
    });
});

gulp.task('insert-cdn-url', function(){
  gulp.src(['assets/index.html'])
    .pipe(replace(/\"(css\/)/g, `"${CDN_URLS[process.env.npm_lifecycle_event].assets}$1`))
    .pipe(replace(/script src=\"/g, `script src=\"${CDN_URLS[process.env.npm_lifecycle_event].assets}`))
    .pipe(replace(new RegExp('https://tmca-media.rotorint.com/supra-immersive/', 'g'), CDN_URLS[process.env.npm_lifecycle_event].videos))
    .pipe(gulp.dest('public/'));
});

// please, don't remove it, it's necessary for CI/CD
gulp.task('common-build', ['sass', 'sass-libs', 'html', 'img', 'fonts', 'uglifyjs', 'js-libs', 'video']);
gulp.task('plain-build', ['sass', 'sass-libs', 'html', 'img', 'fonts', 'js', 'js-libs', 'video']);

gulp.task('watch', ['browser-sync', 'plain-build'], function() {
	gulp.watch(paths.sass.compile, ['sass']);
	gulp.watch(paths.html.all, ['html', browserSync.reload]);
	gulp.watch(paths.js.custom, ['js', browserSync.reload]);
});

// please, don't remove it, it's necessary for CI/CD
gulp.task('build', ['common-build', 'insert-cdn-url']);
gulp.task('build:prod', ['common-build', 'insert-cdn-url']);
gulp.task('build:test', ['plain-build', 'insert-cdn-url']);

gulp.task('default', ['watch']);
