const fs = require("fs");
const path = require("path");
const {spawn, execSync} = require("child_process");
const {mkdirSync} = require("sharp/lib/libvips");

const extractFontData = async (str) => {
    const getMatches = (str) => {
        str = str.replace(/(\r\n|\n|\r)/gm, "\n").trim()
        const regex = /Page (\d+):\nFonts \((\d+)\):/;
        const match = str.match(regex);

        if (match) {
            return {page: match[1], fonts: match[2]};
        }
        return {};
    };

    const singleFont = (fontData) => {
        const match = fontData.match(/\+([a-zA-Z0-9_-]+[.,]?[a-zA-Z0-9_-]+)/);
        return match && match[1];
    };

    let parts = str.split(/(?=Page\s)/g).slice(1);

    //   console.log(parts)

    return parts
        .map((singlePageData) => {
            const {page, fonts} = getMatches(singlePageData);
            if (fonts) {
                const split = singlePageData.split("\n").filter((e) => e.length);
                const fontList = split.slice(2).map(singleFont);
                return {page, fonts, fontList};
            }
        })
        .filter((e) => e);
};

// Taken and adjusted from: https://stackoverflow.com/a/52611536/6161265
function run(...cmd) {
    return new Promise((resolve, reject) => {
        var command = spawn(...cmd);
        var result = "";
        command.stdout.on("data", function (data) {
            result += data.toString();
        });
        command.on("close", function (code) {
            resolve(result);
        });
        command.on("error", function (err) {
            reject(err);
        });
    });
}

function runPS(psFilePath, args) {
    return new Promise((resolve, reject) => {
        var command = spawn("powershell.exe", ['-file', psFilePath, ...args]);
        var result = "";
        command.stdout.on("data", function (data) {
            result += data.toString();
        });
        command.on("close", function (code) {
            resolve(result);
        });
        command.on("error", function (err) {
            reject(err);
        });
    });
}

async function exportFontInfo(filePath) {
    const data = await run("mutool", ["info", "-F", filePath, "0-2147483647"]);
    //   console.log(data)
    return extractFontData(data);
}

async function exportFont(filePath, wd) {
    // const directoryPath = path.join(wd);

    const fileName = path.parse(filePath).name.split(' ').join('_');
    const directoryPath = path.join(__dirname, '../' + path.join(path.join(wd, fileName)));

    mkdirSync(directoryPath, {recursive: true})

    await run("mutool", ["extract", filePath], {cwd: directoryPath});

    try {
        const extractedFiles = fs.readdirSync(directoryPath);

        extractedFiles.forEach(file => {
            if (!file.startsWith("font")) {
                fs.unlinkSync(path.join(directoryPath, file));
            }
        });

        // fontforge -lang=ff -c 'Open($1); Generate($2)' my-font.ttf my-font.svg
        const fontsList = fs.readdirSync(directoryPath);

        await runPS(path.join(__dirname, '../scripts/fontforge.ps1'), ['-directory', path.join(directoryPath)]);

        for (const fontFile of fontsList) {
            await fs.unlinkSync(path.join(directoryPath, fontFile));
        }

        return fs.readdirSync(directoryPath);
    } catch (err) {
        console.error(err)
    }

    return false;
}

module.exports = {
    exportFont,
    exportFontInfo,
};
