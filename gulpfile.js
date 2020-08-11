const { src, dest, parallel, series, watch } = require('gulp')

const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const del = require('del')
const uglify = require('gulp-uglify-es').default
const rename = require("gulp-rename")
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const fileinclude = require('gulp-file-include') 
const newer = require('gulp-newer')
const imagemin = require('gulp-imagemin')

sass.compiler = require('sass') // устанавливаем Dart Sass в качестве компилятора


//==========================================================
//******* JS отключен от вочинга, билда и html файла ******* 
//==========================================================


let source_folder = 'src'
let build_folder = 'dest'

const path =
{
    src:
    {
        html: source_folder + '/*.html',
        css: source_folder + '/scss/styles.scss',
        js: source_folder + '/js/app.js',
        img: source_folder + '/img/**/*.{jpeg,jpg,gif,svg,png,ico,webp}',
        fonts: source_folder + '/fonts/'
    },
    dest:
    {
        html: build_folder + '/',
        css: build_folder + '/css/',
        js: build_folder + '/js/',
        img: build_folder + '/img/',
        fonts: build_folder + '/fonts/'   
    },
    watch:
    {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpeg,jpg,gif,svg,png,ico,webp}',
        fonts: source_folder + '/fonts/'
    },
    clean: build_folder + '/**'
}

function browsersync()
{
    browserSync.init
    ({
        server: { baseDir: build_folder },
        notify: false,
        online: false
    })
}

function html()
{
    return src(path.src.html)
    .pipe(fileinclude({ prefix: '//@' }))
    .pipe(dest(path.dest.html))
    .pipe(browserSync.stream())
}

function css()
{
    return src(path.src.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ grid: true }))
    .pipe(cleanCSS())
    .pipe(rename('styles.min.css'))
    .pipe(dest(path.dest.css))
    .pipe(browserSync.stream())
}

function scripts()
{
    return src(path.src.js)
    .pipe(fileinclude({ prefix: '//@' }))
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(dest(path.dest.js))
    .pipe(browserSync.stream())
}

function images()
{
    return src(path.src.img)
    .pipe(newer(path.dest.img))
    .pipe(imagemin())
    .pipe(dest(path.dest.img))
    .pipe(browserSync.stream())
}

function watchFiles()
{
    watch(path.watch.html, html)
    watch(path.watch.css, css)
    //watch(path.watch.js, scripts)
    watch(path.watch.img, images)
}

function clear()
{
    return del(path.clean)
}

//let build = series(clear, parallel(html, css, scripts, images))
let build = series(clear, parallel(html, css, images))

exports.images = images
exports.clear = clear
exports.default = parallel(build, browsersync, watchFiles)