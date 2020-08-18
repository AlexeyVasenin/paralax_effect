"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var server = require("browser-sync").create();
var run = require("run-sequence");
var uglify = require("gulp-uglify");
var del = require("del");


// MIN & CONV LESS(CSS)
gulp.task("style", function() {
  gulp.src("less/style.less")
  .pipe(plumber())
  .pipe(less())
  .pipe(postcss([
    autoprefixer({"browserslistrc": [
      "last 1 version",
      "last 2 Chrome versions",
      "last 2 Firefox versions",
      "last 2 Opera versions",
      "last 2 Edge versions"
      ]}),
    mqpacker({
      sort: false
    })
    ]))
  .pipe(gulp.dest("build/css"))
  .pipe(minify())
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("build/css"))
  .pipe(server.stream());
});

// MIN IMAGES
gulp.task("images", function() {
  return gulp.src("img/**/*.{jpg, png, gif}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true})
    ]))
  .pipe(gulp.dest("build/img"));
});

// MIN JS
gulp.task("minjs", function() {
  gulp.src("js/*.js")
  .pipe(gulp.dest("build/js"))
  .pipe(uglify())
  .pipe(rename("main.min.js"))
  .pipe(gulp.dest("build/js"))
  .pipe(server.stream());
});

gulp.task("html", function() {
  gulp.src("*.html")
    .pipe(gulp.dest("build"));
});


// COPY FILES
gulp.task("copy", function() {
  return gulp.src([
    "css/*.css",
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
    ], {
      base: "."
    })
  .pipe(gulp.dest("build"));
});

// CLEAN FILES
gulp.task("clean", function() {
  return del("build");
});

// RUN GULP
gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "style",
    "images",
    "minjs",
    fn
    );
});

// SERVER
gulp.task("serve", function() {
  server.init({
    server: "build"
    // notify: false,
    // open: true,
    // ui: false
  });

  gulp.watch("less/**/*.less", ["style"]);
  gulp.watch("js/**/*.js", ["minjs"]);
  gulp.watch("*.html", ["html"]).on("change", server.reload);
});
