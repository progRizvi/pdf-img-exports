const { exportImages } = require('./src/export-images')
const { exportFontInfo, exportFont } = require("./src/export-fonts");
const { exportText } = require("./src/export-text");

module.exports = {
    exportImages,
    exportFontInfo,
    exportFont,
    exportText
}