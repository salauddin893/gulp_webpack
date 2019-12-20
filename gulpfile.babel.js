const {src, dest, series, parallel, watch} = require('gulp');
const yargs = require('yargs');
const del = require('del');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const gulpif = require('gulp-if');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const browserSync = require('browser-sync').create();



const PRODUCTION = yargs.argv.prod;

const clear = () => {
    return del('dist');
}

const path = {
    style: {
        src: 'assest/sass/**/*.scss',
        dest: 'dist/assest/css'
    },
    script: {
        src: [
                'assest/js/script.js',
                'node_modules/jquery/dist/jquery.min.js'
            ],
        dest: 'dist/assest/js'
    },
    images: {
        src: 'assest/img/**',
        dest: 'dist/assest/img'
    }
}

const style = () => {
    return src(path.style.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(PRODUCTION, cleanCSS({compatibility: 'ie8'})))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(dest(path.style.dest))
        .pipe(browserSync.stream());
}

const images = () =>{
    return src(path.images.src)
        .pipe(imagemin())
        .pipe(dest(path.images.dest));
}

const watchs = () => {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
    watch('assest/sass/**/*.scss', style);
    watch('assest/img/**', images);
    watch("./*.html").on('change', browserSync.reload);
    watch('assest/js/**/*.js', script).on('change', browserSync.reload);
}


const html = () => {
    return src('./*.html')
        .pipe(dest('dist'));
}

const script = () => {
    return src(path.script.src)
        .pipe(named())
        .pipe(webpack({
            module: {
                rules: [
                  {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                      loader: 'babel-loader',
                      options: {
                        presets: ['@babel/preset-env']
                      }
                    }
                  }
                ]
              },
              output: {
                filename: '[name].js'
              },
              mode: 'development'
        }))
        .pipe(dest(path.script.dest));
}

exports.default = series(clear, parallel(html, style, images, script), watchs);