const { src, dest, watch, parallel, series, tree } = require('gulp');

const gulpIf = require('gulp-if');
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
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter-unx');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');

const appDir = 'app';
const devDir = 'www';
const prodDir = 'dist';

destDir = (isProd) => (isProd ? prodDir : devDir);

htmlDev = () => _html(false);
htmlProd = () => _html(true);
_html = (isProd) => {
    return src(appDir + '/html/*.html')
        .pipe(include({
            includePaths: appDir + '/html/block'
        }))
        .pipe(dest(destDir(isProd)))
        .pipe(gulpIf(!isProd, browserSync.stream()));
}


scriptDev = () => _script(false);
scriptProd = () => _script(true);
_script = (isProd) => {
    return src(appDir + '/js/main.js')
        .pipe(concat('main.js'))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(dest(destDir(isProd) + '/js'))
        .pipe(gulpIf(!isProd, browserSync.stream()));
}


styleDev = () => _style(false);
styleProd = () => _style(true);
_style = (isProd) => {
    return src(appDir + '/scss/style.scss')
        .pipe(concat('style.css'))
        .pipe(scss())
        .pipe(postcss([
            autoprefixer(),
        ]))
        .pipe(dest(destDir(isProd) + '/css'))
        .pipe(gulpIf(!isProd, browserSync.stream()));

}

imageDev = () => _image(false);
imageProd = () => _image(true);
_image = (isProd) => {
    const destDirImages = destDir(isProd) + '/images/';
    return src([appDir + '/images/*.*', '!' + appDir + '/images/*.svg'])
        .pipe(newer(destDirImages))
        .pipe(avif({ quality: 50 }))

        .pipe(src(appDir + '/images/*.*'))
        .pipe(newer(destDirImages))
        .pipe(webp())

        .pipe(src(appDir + '/images/*.*'))
        .pipe(newer(destDirImages))
        .pipe(imagemin())

        .pipe(dest(destDirImages));
}

spriteDev = () => _sprite(false);
spriteProd = () => _sprite(true);
_sprite = (isProd) => {
    return src(appDir + '/images/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprive.svg',
                    example: true,
                }
            }
        }))
        .pipe(dest(destDir(isProd) + '/images'));
}


fontDev = () => _font(false);
fontProd = () => _font(true);
_font = (isProd) => {
    return src(appDir + '/fonts/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src(destDir(isProd) + '/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest(destDir(isProd)));
}

watching = () => {
    browserSync.init({
        port: 3100,
        server: {
            baseDir: destDir(false) + '/',
        }
    });
    watch([appDir + '/images'], imageDev);
    watch([appDir + '/scss'], styleDev);
    watch([appDir + '/js'], scriptDev);
    watch([appDir + '/html/**/*.html'], htmlDev);
}

cleanDev = () => _clean(false);
cleanProd = () => _clean(true);
_clean = (isProd) => {
    return src(destDir(isProd) + '/', { allowEmpty: true }).pipe(clean());
}

exports.default = series(cleanDev, imageDev, spriteDev, parallel(htmlDev, fontDev, styleDev, scriptDev, watching));
exports.clean = parallel(cleanDev, cleanProd);
exports.dist = series(cleanProd, htmlProd, fontProd, imageProd, spriteProd, styleProd, scriptProd);

exports.htmlDev = htmlDev;