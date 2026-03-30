'use strict';

require('dotenv').config();

const gulp        = require('gulp');
const debug       = require('gulp-debug');
const del         = require('del');
const sharp       = require('sharp');
const { optimize }= require('svgo');
const ttf2woff    = require('gulp-ttf2woff');
const ttf2woff2   = require('gulp-ttf2woff2');
const terser      = require('gulp-terser');
const through2    = require('through2').obj;
const pug         = require('gulp-pug');
const sass        = require('gulp-sass')(require('sass'));
const autoprefixer= require('gulp-autoprefixer');
const cleanCSS    = require('gulp-clean-css');
const babel       = require('gulp-babel');
const gulpIf      = require('gulp-if');
const sourcemaps  = require('gulp-sourcemaps');
const notify      = require('gulp-notify');
const combiner    = require('stream-combiner2').obj;
const merge       = require('merge-stream');
const browserSync = require('browser-sync').create();

const siteData = require('./src/data/pages.js');

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const pugLocals = {
  ...siteData,
  ymapsApiKey: process.env.YANDEX_MAPS_API_KEY || '',
};

const paths = {
  src: {
    pugWatch:     'src/pug/**/*.*',
    styles:       'src/styles/sass/main.sass',
    stylesWatch:  'src/styles/**/*.sass',
    js:           'src/js/**/*.js',
    img:          'src/assets/img/**/*.{jpg,jpeg,png}',
    imgCopy:      'src/assets/img/**/*.{gif,ico,webp}',
    pngForWebp:  ['src/assets/img/**/*.png', '!src/assets/img/favicons/**/*.*'],
    svg:          'src/assets/img/**/*.svg',
    fonts:        'src/assets/**/*.ttf',
    manifest:     'src/assets/*.webmanifest',
    libs:         'src/assets/libs/**/*.*',
    php:          'src/php/**/*.*',
  },
  dest: {
    root: 'public',
    css:  'public/css',
    js:   'public/js',
    img:  'public/img',
    libs: 'public/libs',
    php:  'public/php',
  },
};

// ── FONTS ──────────────────────────────────────────────────────────────────

gulp.task('ttf2woff', function () {
  return gulp
    .src(paths.src.fonts, { since: gulp.lastRun('ttf2woff') })
    .pipe(ttf2woff())
    .pipe(gulp.dest(paths.dest.root));
});

gulp.task('ttf2woff2', function () {
  return gulp
    .src(paths.src.fonts, { since: gulp.lastRun('ttf2woff2') })
    .pipe(ttf2woff2({ clone: true }))
    .pipe(gulp.dest(paths.dest.root));
});

gulp.task('ttf', function () {
  return gulp
    .src(paths.src.fonts, { since: gulp.lastRun('ttf') })
    .pipe(gulp.dest(paths.dest.root));
});

gulp.task('fonts', gulp.parallel('ttf', 'ttf2woff', 'ttf2woff2'));

// ── STATIC COPY ────────────────────────────────────────────────────────────

gulp.task('php', function () {
  return gulp
    .src(paths.src.php, { since: gulp.lastRun('php') })
    .pipe(gulp.dest(paths.dest.php));
});

gulp.task('manifest', function () {
  return gulp
    .src(paths.src.manifest, { since: gulp.lastRun('manifest') })
    .pipe(gulp.dest(paths.dest.root));
});

gulp.task('libs', function () {
  return gulp
    .src(paths.src.libs, { since: gulp.lastRun('libs') })
    .pipe(gulp.dest(paths.dest.libs));
});

// ── IMAGES ─────────────────────────────────────────────────────────────────

gulp.task('webp', function () {
  return gulp
    .src(paths.src.pngForWebp)
    .pipe(through2(function (file, enc, cb) {
      if (!file.isBuffer()) return cb(null, file);
      const newFile = file.clone();
      newFile.extname = '.webp';
      sharp(file.contents)
        .webp({ quality: 95 })
        .toBuffer()
        .then(data => { newFile.contents = data; cb(null, newFile); })
        .catch(cb);
    }))
    .pipe(gulp.dest(paths.dest.img));
});

gulp.task('imgmin', function () {
  return gulp
    .src(paths.src.img, { since: gulp.lastRun('imgmin') })
    .pipe(through2(function (file, enc, cb) {
      if (!file.isBuffer()) return cb(null, file);
      let pipeline = sharp(file.contents);
      if (file.extname.toLowerCase() === '.png') {
        pipeline = pipeline.png({ compressionLevel: 9 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, progressive: true });
      }
      pipeline
        .toBuffer()
        .then(data => { file.contents = data; cb(null, file); })
        .catch(cb);
    }))
    .pipe(gulp.dest(paths.dest.img));
});

gulp.task('imgcopy', function () {
  return gulp
    .src(paths.src.imgCopy, { since: gulp.lastRun('imgcopy') })
    .pipe(gulp.dest(paths.dest.img));
});

gulp.task('svgmin', function () {
  return gulp
    .src(paths.src.svg, { since: gulp.lastRun('svgmin') })
    .pipe(through2(async function (file, enc, cb) {
      if (!file.isBuffer()) return cb(null, file);
      try {
        const result = await optimize(file.contents, { path: file.path });
        file.contents = Buffer.from(result.data);
        cb(null, file);
      } catch (err) {
        cb(err);
      }
    }))
    .pipe(gulp.dest(paths.dest.img));
});

gulp.task('img', gulp.series('imgmin', 'svgmin', 'imgcopy', 'webp'));

gulp.task('assets', gulp.parallel('fonts', 'img'));

// ── JAVASCRIPT ─────────────────────────────────────────────────────────────

gulp.task('js', function () {
  return combiner(
    gulp.src(paths.src.js),
    through2(function (file, enc, callback) {
      let fileDev = file.clone();
      fileDev.stem += '.dev';

      let fileDevMin = fileDev.clone();
      fileDevMin.stem += '.min';

      this.push(fileDev);
      this.push(fileDevMin);

      callback(null, file);
    }),
    gulpIf(
      (file) => file.stem.includes('.dev'),
      babel({ presets: ['@babel/preset-env'] })
    ),
    gulpIf(
      (file) => file.stem.includes('.min'),
      terser()
    ),
    gulp.dest(paths.dest.js)
  ).on('error', notify.onError(function (err) {
    return { title: 'Error: JavaScript', message: err.message };
  }));
});

// ── STYLES ─────────────────────────────────────────────────────────────────

gulp.task('styles', function () {
  return combiner(
    gulp.src(paths.src.styles),
    gulpIf(isDevelopment, sourcemaps.init()),
    sass(),
    autoprefixer({ cascade: false }),
    through2(function (file, enc, callback) {
      file.stem = 'style';
      let fileMin = file.clone();
      fileMin.stem += '.min';
      this.push(fileMin);
      callback(null, file);
    }),
    gulpIf(isDevelopment, sourcemaps.write('.')),
    gulpIf(
      (file) => file.stem.includes('.min'),
      cleanCSS({ compatibility: 'ie8' })
    ),
    gulp.dest(paths.dest.css)
  ).on('error', notify.onError(function (err) {
    return { title: 'Error: Styles', message: err.message };
  }));
});

// ── PUG ────────────────────────────────────────────────────────────────────

// Генерация всех страниц (1-й и 2-й уровень) через fileStem из pages.js.
// Каждая страница компилируется из своего шаблона, имя выходного файла = ключ объекта.
gulp.task('pug', function () {
  const streams = [];

  function addStream(key, page) {
    const stream = gulp
      .src(`src/pug/pages/${page.fileStem}.pug`)
      .pipe(through2(function (file, enc, cb) {
        file.stem = key;
        cb(null, file);
      }))
      .pipe(pug({
        pretty: '\t',
        locals: { ...pugLocals, page },
      }))
      .on('error', notify.onError(function (err) {
        return { title: 'Error: Pug', message: err.message };
      }))
      .pipe(gulp.dest(paths.dest.root));
    streams.push(stream);
  }

  Object.entries(siteData.pages).forEach(([key, page]) => {
    addStream(key, page);
    if (!page.isMenuItemHasChildren) return;
    Object.entries(page.isMenuItemHasChildren).forEach(([childKey, childPage]) => {
      addStream(childKey, childPage);
    });
  });

  return streams.length ? merge(...streams) : Promise.resolve();
});

// ── WATCH ──────────────────────────────────────────────────────────────────

gulp.task('watch', function () {
  gulp.watch(paths.src.fonts, gulp.series('fonts'));
  gulp.watch(
    ['src/assets/img/**/*.*', '!src/assets/img/icons/**/*.svg'],
    gulp.series('img')
  );
  gulp.watch(paths.src.js, gulp.series('js'));
  gulp.watch(paths.src.stylesWatch, gulp.series('styles'));
  gulp.watch(paths.src.pugWatch, gulp.series('pug'));
  gulp.watch(paths.src.manifest, gulp.series('manifest'));
  gulp.watch(paths.src.php, gulp.series('php'));
  gulp.watch(paths.src.libs, gulp.series('libs'));
});

gulp.task('serve', function () {
  browserSync.init({ server: paths.dest.root });
  browserSync
    .watch(`${paths.dest.root}/**/*.*`)
    .on('change', browserSync.reload);
});

// ── BUILD ──────────────────────────────────────────────────────────────────

gulp.task('clean', function () {
  return del([paths.dest.root, 'tmp']);
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('assets', 'js', 'styles', 'pug', 'manifest', 'php', 'libs')
  )
);

gulp.task('dev:lite', gulp.series('build', 'watch'));
gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
