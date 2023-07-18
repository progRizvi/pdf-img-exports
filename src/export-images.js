const EventEmitter = require('events');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const sharp = require('sharp');
const path = require('path');
const {mkdirSync} = require("sharp/lib/libvips");

const {getDocument, OPS} = pdfjs

const exportImages = async (src, dst) => {
    return new Promise(async (resolve, reject) => {
        const doc = await getDocument(src).promise
        const pageCount = doc._pdfInfo.numPages
        let images = []
        let fontResources = [];
        for (let p = 1; p <= pageCount; p++) {
            const page = await doc.getPage(p)
            const ops = await page.getOperatorList()

            for (let i = 0; i < ops.fnArray.length; i++) {
                try {
                    if (
                        ops.fnArray[i] === OPS.paintJpegXObject ||
                        ops.fnArray[i] === OPS.paintImageXObject ||
                        ops.fnArray[i] === OPS.paintInlineImageXObject
                    ) {
                        const name = ops.argsArray[i][0]
                        const img = await page.objs.get(name)
                        const {width, height, kind} = img
                        const bytes = img.data.length
                        const channels = bytes / width / height

                        // const fileName = path.parse(src).name.split(' ').join('_');
                        const directoryPath = path.join(__dirname, '../' + path.join(path.join(dst)));
                        mkdirSync(directoryPath, {recursive: true})
                        const imageFileName = ops.argsArray[i][0]+"_"+Math.random().toString(36).slice(2);
                        const file = path.join(directoryPath, `${imageFileName}.png`)

                        await sharp(img.data, {
                            raw: {width, height, channels}
                        }).toFile(file)

                        const event = {name:imageFileName, extension:"png", kind, width, height, channels, bytes, file, page: p}
                        images.push(event)
                    }

                    // if (ops.fnArray[i] === OPS.setFont) {
                    //     const args = ops.argsArray[i];
                    //     const fontRef = args[0];
                    //     const fontRes = await page.objs.get(fontRef);
                    //     const fontName = fontRes.loadedName;
                    //     fontResources[fontName] = fontRes;
                    // }
                } catch (error) {
                    reject(error)
                }
            }
        }

        resolve({ images });
    })
}

module.exports = {
    exportImages
}