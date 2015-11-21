var gulp           = require("gulp"),
  minifyHTML     = require("gulp-minify-html"),
  concat         = require("gulp-concat"),
  uglify         = require("gulp-uglify"),
  cssmin         = require("gulp-cssmin"),
  uncss          = require("gulp-uncss"),
  imagemin       = require("gulp-imagemin"),
  sourcemaps     = require("gulp-sourcemaps"),
  mainBowerFiles = require("main-bower-files"),
  inject         = require("gulp-inject"),
  less           = require("gulp-less"),
  sass           = require("gulp-sass"),
  filter         = require("gulp-filter"),
  glob           = require("glob"),
  browserSync    = require("browser-sync");

var config = {
  paths: {
    html: {
      src:  "app/**/*.html",
      dest: "build"
    },
    javascript: {
      src:  ["app/js/**/*.js"],
      dest: "build/js"
    },
    css: {
      src: ["app/css/**/*.css"],
      dest: "build/css"
    },
    images: {
      src: ["app/images/**/*.jpg", "app/images/**/*.jpeg", "app/images/**/*.png"],
      dest: "build/images"
    },
    less: {
      src: ["app/less/**/*.less", "!app/less/includes/**"],
      dest: "build/css"
    },
    sass: {
      src: ["app/sass/**/*.scss", "!app/sass/includes/**"],
      dest: "build/css"
    },
    bower: {
      src: "bower_components",
      dest: "build/lib"
    },
    verbatim: {
      src: ["app/manifest.json", "app/favicon.png"],
      dest: "build"
    }
  }
};

gulp.task("html", function(){
  return gulp.src(config.paths.html.src)
    .pipe(inject(
      gulp.src(
        mainBowerFiles({ includeDev: true }),
        {read: false, cwd: "bower_components"}
      ),
      {name: "bower", addPrefix: "lib"}
    ))
    .pipe(minifyHTML())
    .pipe(gulp.dest(config.paths.html.dest));
});

gulp.task("scripts", function(){
  return gulp.src(config.paths.javascript.src)
    .pipe(sourcemaps.init())
    .pipe(concat("app.min.js"))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.paths.javascript.dest));
});

gulp.task("css", function(){
  return gulp.src(config.paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(cssmin())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.dest))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task("images", function(){
  return gulp.src(config.paths.images.src)
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(config.paths.images.dest));
});

gulp.task("bower", function(){
  return gulp.src(mainBowerFiles({ includeDev: true }), {base: "bower_components"})
    .pipe(gulp.dest(config.paths.bower.dest));
});

gulp.task("less", function(){
  return gulp.src(config.paths.less.src)
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: ["bower_components/bootstrap/less"]
    }))
    .pipe(uncss({
      html: glob.sync(config.paths.html.src),
    }))
    .pipe(concat("main.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.dest))
    .pipe(filter("**/*.css"))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task("sass", function(){
  return gulp.src(config.paths.sass.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: "compressed",
      includePaths: [ config.paths.bower.src + "/bootstrap-sass/assets/stylesheets", config.paths.bower.src + "/font-awesome/scss" ],
      sourceComments: false
    }).on("error", sass.logError))
    .pipe(uncss({
      html: glob.sync(config.paths.html.src),
    }))
    .pipe(concat("main.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.paths.css.dest))
    .pipe(filter("**/*.css"))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task("verbatim", function(){
  gulp.src(config.paths.verbatim.src)
    .pipe(gulp.dest(config.paths.verbatim.dest));
});

gulp.task("browser-sync", function() {
  browserSync({
    server: {
      baseDir: "./build"
    }
  });
});

gulp.task("build", ["bower", "html", "scripts", "css", "sass", "images", "verbatim"]);

gulp.task("default", ["build", "browser-sync"], function(){
  gulp.watch(config.paths.html.src, ["html", browserSync.reload]);
  gulp.watch(config.paths.javascript.src, ["scripts", browserSync.reload]);
  gulp.watch(config.paths.bower.src, ["bower", browserSync.reload]);
  gulp.watch(config.paths.images.src, ["images", browserSync.reload]);
  gulp.watch(config.paths.verbatim.src, ["verbatim", browserSync.reload]);

  gulp.watch(config.paths.css.src, ["css"]);
  //gulp.watch(config.paths.less.src, ["less"]);
  gulp.watch(config.paths.sass.src, ["sass"]);
});
