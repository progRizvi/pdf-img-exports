const pdfjs = require('pdfjs-dist');
const fonts = require('pdfjs-dist/lib/core/fonts');

const PT_TO_PX = 1.33;

const gcd = function(a,b){
    if (b === 0) return a;
    return gcd(b, a % b);
};

const exportText = (filePath) => {
    return new Promise((resolve, reject) => {
        let pdfDoc = {
            name: filePath,
            layers: []
        }

        pdfjs.getDocument(filePath).promise.then(async function (pdf) {
            const numOfPages = pdf.numPages;
            let textLayer;
            for (let i = 1; i <= numOfPages; i++) {
                let page = await pdf.getPage(i);
                let viewport = await page.getViewport({scale: 1.0});

                pdfDoc.width = page.view[2];
                pdfDoc.height = page.view[3];

                let r = gcd(pdfDoc.width, pdfDoc.height);

                pdfDoc.ratio = {
                    x: pdfDoc.width / r,
                    y: pdfDoc.height / r
                }

                const textContent = await page.getTextContent();
                const textItems = textContent.items;

                for (const item of textItems) {
                    // let fontName = item.fontName;
                    // let font =
                    //
                    // let originalFontName = font ? font.name : 'Unknown';

                    textLayer = {
                        name: item.str.trim().replace(/\s/g, '_'),
                        text: item.str,
                        font: item.fontName,
                        // weight: item.font.fontWeight,
                        size: item.height * PT_TO_PX,
                        align: '',
                        position: {
                            x: item.transform[4],
                            y: viewport.height - item.transform[5]
                        }
                    };

                    // noinspection JSUnresolvedVariable
                    if (item.textAlign === 'center') {
                        textLayer.align = 'center';
                    } else if (textLayer.position.x < viewport.width / 2) {
                        textLayer.align = 'left';
                    } else {
                        textLayer.align = 'right';
                    }

                    pdfDoc.layers.push(textLayer);
                }
            }

            resolve(pdfDoc);
        });
    });
}

module.exports = {
    exportText
};