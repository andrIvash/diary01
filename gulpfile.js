
// ---------------------------------------- init ---------------------------------------//
const gulp = require('gulp');
const webpack = require('webpack');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const rimraf = require('rimraf');
const gulpWebpack = require('webpack-stream');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const spritesmith = require('gulp.spritesmith');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const gulpStylelint = require('gulp-stylelint');
const concatCss = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');

// ---------------------------------------- webpack --------------------------//
gulp.task('webpack', function() {

  return gulp.src('src/scripts/main.js')
    .pipe(gulpWebpack(require('./webpack.config.js'), webpack))
    .on('error', function() {
      this.emit('end');
    })
    .on('error', notify.onError({title: 'Webpack error'}))
    .pipe(gulp.dest('./build'));

});
// ---------------------------------------- pug -----------------------------------------//
gulp.task('pug', function() {
  return gulp.src([
    './src/templates/index.pug'
  ])
    .pipe(pug({ pretty: true }))
    .on('error', notify.onError(function(error) {
      console.log(123);
      return {
        title: 'pug',
        message: error.message
      };
    }))
    .pipe(gulp.dest('./build'));
});
// ---------------------------------------- css ---------------------------------------//
gulp.task('css', function() {
  return gulp.src('./src/styles/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass()).on('error', notify.onError({ title: 'Style' }))
    // .pipe(gulpStylelint({
    //   failAfterError: false,
    //   reporters: [
    //     {formatter: 'string', console: true}
    //   ]
    // }))
    .pipe(postcss())
    .pipe(csso())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/assets/styles'))
    .pipe(browserSync.stream());
});
// ------------------------------------------ copy img --------------------------------//
gulp.task('copy.image', function() {
  return gulp.src(['./src/images/**/*.*', '!./src/images/png-sprites/*.*', '!./src/images/svg-sprites/*.svg'], {since: gulp.lastRun('copy.image')})
    //.pipe(imagemin())
    .pipe(gulp.dest('./build/assets/img'));
});
// ------------------------------------------ copy readme --------------------------------//
gulp.task('copy.readme', function() {
  return gulp.src('./README.md', {since: gulp.lastRun('copy.readme')})
    .pipe(gulp.dest('./build'));
});
// ------------------------------------------ copy fonts --------------------------------//
gulp.task('copy.fonts', function() {
  return gulp.src('./src/fonts/**/*.*', {since: gulp.lastRun('copy.fonts')})
    .pipe(gulp.dest('./build/assets/fonts'));
});

// ---------------------------------------- watch ---------------------------------------//
gulp.task('watch', function() {
  gulp.watch('./src/scripts/**/*.js', gulp.series('webpack'));
  gulp.watch('./src/styles/**/*.scss', gulp.series('css'));
  gulp.watch('./src/templates/**/*.pug', gulp.series('pug'));
});

// ---------------------------------------- server ---------------------------------------//
gulp.task('serve', function() {

  browserSync.init({
    // proxy: 'localhost:3000',
    open: false,
    server: './build'

  });

  browserSync.watch(['./build' + '/**/*.*', '!**/*.css'], browserSync.reload);
});

// ----------------------------------- css vendor -------------------------------------//
gulp.task('css.vendor', function() {
  return gulp.src([
      './node_modules/normalize.css/normalize.css'
  ])
    .pipe(concatCss('vendor.css'))
    .pipe(csso())
    .pipe(gulp.dest('./build/assets/styles'))
})



// ---------------------------------------- clean ---------------------------------------//
gulp.task('clean', function(cb) {
  return rimraf('./build', cb);
});


// ---------------------------------------- default ---------------------------------------//
gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(
    'copy.image',
    'copy.fonts',
    'css',
    'css.vendor',
    'webpack',
    'pug',
    'copy.readme'
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));
// ---------------------------------------- build ---------------------------------------//
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'copy.image',
    'copy.fonts',
    'css',
    'css.vendor',
    'webpack',
    'pug',
    'copy.readme'
  )
));
// ------------------svg sprites------------------------------------------------------------//
gulp.task('sprite:svg', function() {
  return gulp.src('./src/images/svg-sprites/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(gulp.dest('./src/images/sprite'));
});

// ---------------------------png sprites --------------------------------//
gulp.task('sprite:png', function() {
  var spriteData = gulp.src('./src/images/png-sprites/*.png')
    .pipe(spritesmith({
			    imgName: 'sprite.png',
			    cssName: 'sprite.scss',
          cssFormat: 'scss',
          //retinaSrcFilter: ['images/png-sprites/*@2x.png'],
          //retinaImgName: 'sprite@2x.png',
          imgPath: '../img/sprite/sprite.png',
          padding: 10,
          algorithm: 'binary-tree',
              padding: 5,
          cssVarMap: function(sprite) {
            sprite.name = 's-' + sprite.name;
          }
		}));
  var imgStream = spriteData.img
  .pipe(buffer())
  //.pipe(imagemin())
  .pipe(gulp.dest('./src/images/sprite'));

  var cssStream = spriteData.css
    //.pipe(csso())
    .pipe(gulp.dest('./src/styles/common'));

  return merge(imgStream, cssStream);
  // spriteData.img.pipe(gulp.dest('./src/images/sprite'));
  // spriteData.css.pipe(gulp.dest('./src/styles/common'));

  // return spriteData;
});
