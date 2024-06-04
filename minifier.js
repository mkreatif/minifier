// path = "../newluarsekolah/assets-front";
const fs = require("fs");
const path = require("path");
const uglifyJS = require("uglify-js");
const cleanCSS = require("clean-css");

// Fungsi untuk menghapus isi folder
const emptyDir = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        emptyDir(curPath); // Rekursif untuk subfolder
        fs.rmdirSync(curPath);
      } else {
        fs.unlinkSync(curPath); // Hapus file
      }
    });
  }
};

// Fungsi untuk minify file JS
const minifyJS = (srcPath, distPath) => {
  const result = uglifyJS.minify(fs.readFileSync(srcPath, "utf8"), {
    compress: true, // Aktifkan kompresi
    mangle: true, // Aktifkan penggantian nama variabel
  });
  if (result.error) {
    console.error(`Error minifying ${srcPath}:`, result.error);
  } else {
    fs.writeFileSync(distPath, result.code, "utf8");
    console.log(`Minified ${srcPath} to ${distPath}`);
  }
};

// Fungsi untuk minify file CSS
const minifyCSS = (srcPath, distPath) => {
  const result = new cleanCSS({
    level: 2, // Tingkatkan level kompresi
  }).minify([srcPath]);
  if (result.errors.length) {
    console.error(`Error minifying ${srcPath}:`, result.errors);
  } else {
    fs.writeFileSync(distPath, result.styles, "utf8");
    console.log(`Minified ${srcPath} to ${distPath}`);
  }
};

// Fungsi rekursif untuk membaca semua file dalam direktori dan subdirektori
const readDirectory = (currentPath) => {
  let srcDir = currentPath["src"];
  let distDir = currentPath["dist"];

  console.log(srcDir);

  const items = fs.readdirSync(srcDir);
  let hasMinifiableFile = false;

  items.forEach((item) => {
    console.log("item: " + item);
    const fullPath = path.join(srcDir, item);
    const relativePath = path.relative(srcDir, fullPath);
    const distPath = path.join(
      distDir,
      relativePath.replace(/\.js$/, ".min.js").replace(/\.css$/, ".min.css")
    );

    if (fs.statSync(fullPath).isDirectory()) {
      if (
        readDirectory({
          src: fullPath,
          dist: path.join(distDir, item),
        })
      ) {
        hasMinifiableFile = true;
      }
    } else {
      if (item.endsWith(".js") && !item.endsWith(".min.js")) {
        const distDirPath = path.dirname(distPath);
        if (!fs.existsSync(distDirPath)) {
          fs.mkdirSync(distDirPath, { recursive: true });
        }
        minifyJS(fullPath, distPath);
        hasMinifiableFile = true;
      } else if (item.endsWith(".css") && !item.endsWith(".min.css")) {
        const distDirPath = path.dirname(distPath);
        if (!fs.existsSync(distDirPath)) {
          fs.mkdirSync(distDirPath, { recursive: true });
        }
        minifyCSS(fullPath, distPath);
        hasMinifiableFile = true;
      }
    }
  });

  return hasMinifiableFile;
};

function main() {
  //   const rootDisDir = "../newluarsekolah/dist-assets";
  const rootDisDir = "dist";

  emptyDir(path.join(__dirname, rootDisDir));

  const paths = [
    {
      src: path.join(__dirname, "../newluarsekolah/assets-front"),
      dist: path.join(__dirname, `${rootDisDir}/user`),
    },
    {
      src: path.join(__dirname, "../newluarsekolah/assets"),
      dist: path.join(__dirname, `${rootDisDir}/admin`),
    },
    {
      src: path.join(__dirname, "../newluarsekolah/assets-com"),
      dist: path.join(__dirname, `${rootDisDir}/comumnity`),
    },
  ];
  paths.forEach(function (dirPath) {
    console.log(dirPath.src);
    readDirectory(dirPath);
  });
}

main();
