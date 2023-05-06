const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

const appDir = 'app';
const wwwDir = 'www';
const buildDir = 'build';

function html() {
    return src(`${appDir}/index.html`)
        .pipe(dest(`${wwwDir}/`))
        .pipe(browserSync.stream());
}

function htmlMin() {
    return src(`${appDir}/index.html`)
        .pipe(dest(`${buildDir}/`));
}

function scripts() {
    return src(`${appDir}/js/main.js`)
        .pipe(concat('main.js'))
        .pipe(dest(`${wwwDir}/js`))
        .pipe(browserSync.stream());
}

function scriptsMin() {
    return src(`${appDir}/js/main.js`)
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest(`${buildDir}/js`));
}

function styles() {
    return src(`${appDir}/scss/style.scss`)
        .pipe(concat('style.css'))
        .pipe(scss())
        .pipe(postcss([
            autoprefixer(),
        ]))
        .pipe(dest(`${wwwDir}/css`))
        .pipe(browserSync.stream());
}

function stylesMin() {
    return src(`${appDir}/scss/style.scss`)
        .pipe(concat('style.css'))
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(postcss([
            autoprefixer(),
        ]))
        .pipe(dest(`${buildDir}/css`));
}

function images() {
    return src([`${appDir}/images/*.*`, `!${appDir}/images/*.svg`])
        .pipe(newer(`${wwwDir}/images`))
        .pipe(newer(`${buildDir}/images`))
        .pipe(avif({ quality: 50 }))

        .pipe(newer(`${wwwDir}/images`))
        .pipe(newer(`${buildDir}/images`))
        .pipe(src(`${appDir}/images/*.*`))
        .pipe(webp())

        // .pipe(newer([`${wwwDir}/images`, `${buildDir}/images`]))
        .pipe(src(`${appDir}/images/*.*`))
        .pipe(imagemin())

        .pipe(dest(`${wwwDir}/images`))
        .pipe(dest(`${buildDir}/images`));
}

function watching() {
    browserSync.init({
        port: 3100,
        server: {
            baseDir: `${wwwDir}/`,
        }
    });
    watch([`${appDir}/scss/style.scss`], styles);
    watch([`${appDir}/js/main.js`], scripts);
    watch([`${appDir}/*.html`], html);
    // watch([`${appDir}/*.html`]).on('change', browserSync.reload);
}

function cleanBuild() {
    return src(buildDir).pipe(clean());
}

function cleanWww() {
    return src(wwwDir).pipe(clean());
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/**/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'));
}

exports.clean = parallel(cleanBuild, cleanWww);
exports.default = series(cleanWww, parallel(html, styles, scripts, watching));
exports.build = series(cleanBuild, htmlMin, stylesMin, scriptsMin);


exports.images = images;
// exports.styles = styles;
// exports.scripts = scripts;
// exports.watching = watching;

// exports.build = series(cleanDist, building);