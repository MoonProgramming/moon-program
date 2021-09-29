let randomizer;
let sketchHolder = document.getElementById("sketch-holder") || undefined;
let defaultSize = 400;
let thresholdSize = 430;
let renderer;
let totalSize;
let frameSize;

let boxSize;
let meta;
let texture;
let itemCount = 0;
let jsonMeta = [];

let selectedColorPalette;
let boxGrowFrom;
let fixedColorOrder;
let boxBorderVisible;
let chaosMode;

let offset = 2;
let itemCountMax = 100;
let expand = true;

// properties
const colorPalette = [
    { index: 'Bees', colors: ["#20191b", "#E69A1E", "#f3cb4d", "#f2f5e3"] },
    { index: 'Moscow', colors: ["#B8B4C9", "#F9E267", "#1E3B6C", "#D94030", "#5990A3"] },
    { index: 'Polaroid', colors: ["#f4c172", "#7b8a56", "#363d4a", "#ff9369"] },
    { index: 'Drown', colors: ["#001219", "#005f73", "#0a9396", "#94d2bd"] },
    { index: 'Sunburst', colors: ["#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012"] },
    { index: 'Rainbow', colors: ["#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#577590"] },
    { index: 'Japan', colors: ["#f0e0c6", "#7a999c", "#df4a33", "#475b62", "#fbaf3c", "#2a1f1d"] },
    { index: 'Neon', colors: ["#75D5FD", "#B76CFD", "#FF2281", "#011FFD"] },
    { index: 'Swamp', colors: ['#DDE4D2', '#A6C3AD', '#3F5F54', '#1A2419'] },
    { index: 'Fox', colors: ['#DFE3E2', '#8B7568', '#B9391C', '#251A22'] },
    { index: 'Wood', colors: ['#E5D9E3', '#D9AA64', '#935A3D', '#464D4F'] },
    { index: 'Matrix', colors: ['#62D788', '#3D8C55', '#092F16', '#030200'] },
];
let directions = ['UpperLeft', 'Center'];
let trueOrFalse = [true, false];


class cryptoBlocksGenerator {
    sketch = (s) => {
        s.preload = () => { };
        s.setup = () => {
            renderer = s.createCanvas(defaultSize, defaultSize);
            s.frameRate(18);
            s.windowResized();
            this.start(s);
        };
        s.windowResized = () => {
            sketchHolder.innerHTML = "";

            let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
            if (maxSize < thresholdSize) {
                totalSize = maxSize * 92 / 100;
            } else {
                totalSize = defaultSize;
            }
            frameSize = totalSize - (2 * offset);
            s.resizeCanvas(totalSize, totalSize);

            renderer.parent(sketchHolder);
        };
        s.draw = () => {
            s.push();
            if (boxBorderVisible) s.strokeWeight(1);
            else s.strokeWeight(0);
        
            // palette box
            if (boxGrowFrom === 'UpperLeft')
                this.boxGrowFromUpperLeft(s);
            else if (boxGrowFrom === 'Center')
                this.boxGrowFromCenter(s);
            s.pop();
        
            // noise texture
            s.push();
            s.blendMode(s.OVERLAY);
            s.image(texture, offset, offset);
            s.pop();
        
            // canvas frame
            s.push();
            s.noFill();
            s.strokeWeight(5);
            s.square(0.5, 0.5, totalSize - 1);
            s.pop();
        
            //boxSize increment/decreament
            if (chaosMode) {
                if (expand) {
                    if (boxSize < frameSize / 2)
                        boxSize += s.noise(s.frameCount) * frameSize / 30;
                    expand = false;
                } else {
                    if (boxSize > frameSize / 9)
                        boxSize -= s.noise(s.frameCount) * frameSize / 30;
                    expand = true;
                }
            } else {
                boxSize = (frameSize / 6) + (s.animLoop.noise() * frameSize / 30);
            }
        };
        s.mousePressed = () => {
        }
    }
    start(s) {
        if (itemCount >= itemCountMax) {
            alert('Maximum item count reached.');
            return;
        }

        let nftMeta = this.generateNewProperties(s);
        if (this.samePropertiesExists(nftMeta.attributes)) {
            this.start(s);
            return;
        }
        jsonMeta.push(nftMeta);

        s.createLoop({
            duration: 3,
            noise: {
                radius: 0.8,
                seed: s.random(0, 99999),
            },
            // gif: {
            //     render: false,
            //     open: false,
            //     download: false,
            //     fileName: 'Crypto_Block_#' + itemCount + '.gif',
            //     // startLoop: 0,
            //     // endLoop: 2,
            //     options: {
            //         quality: 5,
            //         width: null,
            //         height: null,
            //         debug: false,
            //     },
            // }
        });
        // createLoop({
        // 	duration: 3,
        //     gif: true,
        // });
        // animLoop.noiseFrequency(0.4)

        itemCount++;
        console.log('current item: ', itemCount);

        s.background(255);
        boxSize = frameSize / 6;
        texture = s.createGraphics(defaultSize, defaultSize);
        this.addNoiseBackground(s);
    }
    generateNewProperties(s) {
        // properties implimentation
        // randomizer = new P5DeterministicRandomWithHexSeed(meta.owner);
        let colorObject = s.random(colorPalette);
        let colorIndex = colorObject.index;
        selectedColorPalette = colorObject.colors;
        boxGrowFrom = s.random(directions);
        fixedColorOrder = s.random(trueOrFalse);
        boxBorderVisible = s.random(trueOrFalse);
        chaosMode = s.random(trueOrFalse);
        return {
            name: 'Crypto Blocks #' + itemCount,
            "file name": 'Crypto_Block_#' + itemCount + '.gif',
            description: 'Aggressive blocks of crypto are fast and always on the move. *Viewers beware: Staring for too long may cause eye fatigue and nausea.',
            "attributes": [
                {
                    "trait_type": "Color",
                    "value": colorIndex
                },
                {
                    "trait_type": "Input",
                    "value": boxGrowFrom
                },
                {
                    "trait_type": "Borders",
                    "value": boxBorderVisible ? 'Yes' : 'No'
                },
                {
                    "trait_type": "Mode",
                    "value": chaosMode ? 'Chaotic' : 'Progressive'
                },
                {
                    "trait_type": "Runtime",
                    "value": (boxGrowFrom === 'UpperLeft' && fixedColorOrder) ? 'Deadlock' : 'Normal'
                }
            ]
        };
    }
    samePropertiesExists(attributes) {
        let str = JSON.stringify(attributes);
        let attributeRecords = [];
        jsonMeta.forEach(obj => {
            let attributeStr = JSON.stringify(obj.attributes);
            attributeRecords.push(attributeStr);
        });
        
        if (attributeRecords.includes(str)) {
            console.log('item existed, re-generate another...');
            return true;
        } else {
            return false;
        }
    }
    addNoiseBackground(s) {
        const noisePerLayer = 800;
        const layerCount = 35;
        const pixelSize = defaultSize / 777;
        texture.stroke('rgba(0,0,0,' + pixelSize + ')');
    
        for (let layer = 0; layer < layerCount; layer++) {
            let length = s.random(0.4, 0.6);
            for (let i = 0; i < noisePerLayer; i++) {
                let mass = s.random(0.4, 1.5);
                let x = s.random(offset, defaultSize - length);
                let y = s.random(offset, defaultSize - length);
                let xEnd = x + s.random(-1, 1) * length;
                let yEnd = y + s.random(-1, 1) * length;
    
                texture.strokeWeight(mass);
                texture.line(x, y, xEnd, yEnd);
            }
        }
    }
    boxGrowFromUpperLeft(s) {
        let g = 0;
        let h = 0;
        for (let i = offset; i <= frameSize; i += boxSize) {
            h = g;
            for (let j = offset; j <= frameSize; j += boxSize) {
                if (fixedColorOrder) s.fill(selectedColorPalette[h]);
                else s.fill(s.random(selectedColorPalette));
                s.square(i, j, boxSize);
                h++;
                if (h === selectedColorPalette.length) h = 0;
            }
            g++;
            if (g === selectedColorPalette.length) g = 0;
        }
    }
    boxGrowFromCenter(s) {
        s.rectMode(s.CENTER);
        let center = frameSize / 2;
        let coorArray = [];
        let xLooped = false;
        for (let x = center; xLooped === false || x <= center - boxSize / 2; x += boxSize) {
            if (x >= frameSize + boxSize) {
                x = frameSize - x;
                xLooped = true;
            }
            let yLooped = false;
            for (let y = center; yLooped === false || y <= center - boxSize / 2; y += boxSize) {
                if (y >= frameSize + boxSize) {
                    y = frameSize - y;
                    yLooped = true;
                }
                coorArray.push({
                    x: x,
                    y: y
                });
            }
        }
        coorArray.forEach(coor => {
            s.fill(s.random(selectedColorPalette));
            s.square(coor.x, coor.y, boxSize);
        });
    }
}

/**
 * Preload function to fetch and organize data etc...
 *
 * You can load API data and any other data in this preload function, using p5js' `loadJSON`
 * -> https://p5js.org/reference/#/p5/loadJSON
 */
function preload() {
    // // current owner (if known, else default to 0x0)
    // const owner = beyondHelpers.get('owner', '0x0000000000000000000000000000000000000000');
    // // viewer parameter (only if we know about it, else empty so we default to OxO)
    // const viewer = beyondHelpers.get('viewer', '0x0000000000000000000000000000000000000000');

    // meta = {
    // 	owner,
    // 	viewer,
    // }
}
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
function downloadMeta() {
    let fileName = 'Crypto_Block_JSON.txt';
    let content = JSON.stringify(jsonMeta, null, 2);
    download(content, fileName, "text/plain");
}
function importFile() {
    var files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
        return false;
    }

    var fr = new FileReader();
    fr.onload = function (e) {
        var result = JSON.parse(e.target.result);

        if (result.length <= 0) {
            return false;
        }
        let lastItemCountUploaded = result[result.length - 1].name.split('#')[1];
        console.log('lastItemCountUploaded', lastItemCountUploaded);
        itemCount = +(lastItemCountUploaded) + 1;

        jsonMeta = result;
        console.log(jsonMeta);
    }

    fr.readAsText(files.item(0));
}
class P5DeterministicRandomWithHexSeed {
    constructor(seed) {
        if (seed.startsWith('0x')) {
            seed = seed.substr(2);
        }
        this.seed = seed;
        this.seedIndex = 0;
        this.nextRandomSequence();
    }

    random() {
        return random();
    }

    nextRandomSequence() {
        // get current seed
        const e = this.seed.substr(this.seedIndex, 6);
        // increment seedIndex for later call
        this.seedIndex += 6;
        // if it's too near the end, add again and modulo
        if (this.seedIndex >= this.seed.length - 6) {
            this.seedIndex = (this.seedIndex + 6) % this.seed.length;
        }

        // randomSeed(parseInt(e, 16));
    }
}

let cryptoBlockInstance = new cryptoBlocksGenerator();
let canvas = new p5(cryptoBlockInstance.sketch, sketchHolder);

function generateNew() {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    cryptoBlockInstance = null;
    cryptoBlockInstance = new cryptoBlocksGenerator();
    canvas = new p5(cryptoBlockInstance.sketch, sketchHolder);
}