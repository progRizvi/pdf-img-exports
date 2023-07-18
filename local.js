const {exportText} = require("./src/export-text");
const {exportFont, exportFontInfo} = require("./src/export-fonts");
const {exportImages} = require("./src/export-images");

const constructPDFLayers = async (pdfPath) => {
    // let exportedData =
    const text = await exportText(pdfPath);
    const fonts = await exportFont(pdfPath, './fonts');
    const images = await exportImages(pdfPath, './images');
    const fontInfo = await exportFontInfo(pdfPath);

    const exportedData = { text, fonts, images, fontInfo };
}

module.exports = {
    constructPDFLayers
}