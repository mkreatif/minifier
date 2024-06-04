// path = "../newluarsekolah/assets-front";
const fs = require('fs');
const path = require('path');
const uglifyJS = require('uglify-js');
const cleanCSS = require('clean-css');

// Direktori sumber dan tujuan
const srcDir = path.join(__dirname, '../newluarsekolah/assets-front');
// const distDir = path.join(__dirname, '../newluarsekolah/assets-dist');
const distDir = path.join(__dirname, 'dist');

// Fungsi untuk menghapus isi folder
const emptyDir = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
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

// Hapus isi folder dist
emptyDir(distDir);

// Fungsi untuk minify file JS
const minifyJS = (srcPath, distPath) => {
    const result = uglifyJS.minify(fs.readFileSync(srcPath, 'utf8'));
    if (result.error) {
        console.error(`Error minifying ${srcPath}:`, result.error);
    } else {
        fs.writeFileSync(distPath, result.code, 'utf8');
        console.log(`Minified ${srcPath} to ${distPath}`);
    }
};

// Fungsi untuk minify file CSS
const minifyCSS = (srcPath, distPath) => {
    const result = new cleanCSS({}).minify([srcPath]);
    if (result.errors.length) {
        console.error(`Error minifying ${srcPath}:`, result.errors);
    } else {
        fs.writeFileSync(distPath, result.styles, 'utf8');
        console.log(`Minified ${srcPath} to ${distPath}`);
    }
};

// Fungsi rekursif untuk membaca semua file dalam direktori dan subdirektori
const readDirectory = (currentPath) => {
    const items = fs.readdirSync(currentPath);
    let hasMinifiableFile = false;

    items.forEach(item => {
        const fullPath = path.join(currentPath, item);
        const relativePath = path.relative(srcDir, fullPath);
        const distPath = path.join(distDir, relativePath.replace(/\.js$/, '.min.js').replace(/\.css$/, '.min.css'));

        if (fs.statSync(fullPath).isDirectory()) {
            if (readDirectory(fullPath)) {
                hasMinifiableFile = true;
            }
        } else {
            if (item.endsWith('.js') && !item.endsWith('.min.js')) {
                const distDirPath = path.dirname(distPath);
                if (!fs.existsSync(distDirPath)) {
                    fs.mkdirSync(distDirPath, { recursive: true });
                }
                minifyJS(fullPath, distPath);
                hasMinifiableFile = true;
            } else if (item.endsWith('.css')) {
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

// Memulai proses minifikasi dari direktori sumber
readDirectory(srcDir);
