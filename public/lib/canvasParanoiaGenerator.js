let defaultSize = 400;
let sketchHolder = document.getElementById("sketch-holder") || undefined;

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

class CanvasParanoiaGenerator {

    constructor(defaultSize, sketchHolder) {
        this.defaultSize = defaultSize;
        this.thresholdSize = Math.floor(defaultSize * 1.075);
        this.sketchHolder = sketchHolder;
    }

    sketch = (s) => {

        s.renderer;
        let totalSize = 600;
        let colors;
        let grainTexture;
        let rectAlpha = 255;
        let layers = 150;
        let layerDistRange = 100;
        let rectArea = 50;
        let textSize = 30;

        function createGrainTexture() {
            console.log('createGrainTexture', s.width, s.height);
            grainTexture = s.createImage(s.width, s.height);
            let d = s.pixelDensity();
            grainTexture.loadPixels();
            for (let x = 0; x < s.height; x++) {
                for (let y = 0; y < s.width; y++) {
                    for (let i = 0; i < d; i++) {
                        for (let j = 0; j < d; j++) {
                            let index = 4 * ((y * d + j) * s.width * d + (x * d + i));
                            if (s.random() > 0.5) {
                                grainTexture.pixels[index] = 255;
                                grainTexture.pixels[index + 1] = 255;
                                grainTexture.pixels[index + 2] = 255;
                                grainTexture.pixels[index + 3] = s.random(3, 15);
                            } else {
                                grainTexture.pixels[index] = 0;
                                grainTexture.pixels[index + 1] = 0;
                                grainTexture.pixels[index + 2] = 0;
                                grainTexture.pixels[index + 3] = s.random(3, 15);
                            }
                        }
                    }
                }
            }
            grainTexture.updatePixels();
        }

        function convertHexToRGBA(co) {
            let c = s.color(co);
            let r = s.red(c);
            let g = s.green(c);
            let b = s.blue(c);
            let a = rectAlpha / 255;
            let colorStr = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
            return colorStr;
        }

        function drawLayersOfRect(x, y, size, layers) {
            for (let i = 0; i < layers; i++) {
                s.rect(x + s.random(-layerDistRange, layerDistRange), y + s.random(-layerDistRange, layerDistRange), size + s.random(-layerDistRange, layerDistRange));
            }
        }

        function drawRect(x, y, size) {
            let c = convertHexToRGBA(s.random(colors));
            s.fill(c);
            drawLayersOfRect(x, y, size, layers);
        }

        s.preload = () => {}
        s.setup = () => {
            s.renderer = s.createCanvas(this.defaultSize, this.defaultSize);
            
            s.windowResized();
            start();
        }
        s.windowResized = () => {
            console.log('windowResized triggered');
            let fs = s.fullscreen();
            if (this.sketchHolder) {
                if (!fs) {
                    this.sketchHolder.innerHTML = "";
                    let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
                    if (maxSize < this.thresholdSize)
                        totalSize = Math.floor(maxSize * 92 / 100);
                    else
                        totalSize = this.defaultSize;
                    s.resizeCanvas(totalSize, totalSize);
                    s.renderer.parent(this.sketchHolder);
                } else {
                    totalSize = Math.floor(Math.max(s.windowWidth, s.windowHeight));
                    s.resizeCanvas(Math.floor(s.windowWidth), Math.floor(s.windowHeight));
                }
                layerDistRange = Math.floor(totalSize / 6);
                rectArea = Math.floor(totalSize / 10);
                textSize = Math.floor(totalSize / 20);
            }
        }
        function showLoadingText() {
            s.pixelDensity(1);
            s.background(200);
            s.textSize(textSize);
            s.textAlign(s.CENTER);
            s.text('loading...', s.width/2, s.height/2);
            console.log('show loading text');
        }
        function start() {
            console.log('start');
            
            colors = s.random(colorPalette).colors;

            showLoadingText();
        }
        s.draw = () => {
            console.log('start draw');

            s.pixelDensity(3);
            console.log('pixelDensity: '+ s.pixelDensity());
            
            createGrainTexture();
            console.log('done creating grain');
            
            s.background(200);
            s.noStroke();
            s.blendMode(s.HARD_LIGHT);
            
            for (let y = -rectArea; y < s.height + rectArea * 2; y += rectArea) {
                for (let x = -rectArea; x < s.width + rectArea * 2; x += rectArea) {
                    drawRect(x, y, rectArea + rectArea / 2);
                }
            }
            console.log('done rect');

            // blendMode(OVERLAY);
            s.image(grainTexture, 0, 0);
            console.log('done draw');
            s.noLoop();
        }
        s.mouseClicked = () => {
            if (s.mouseX < s.width && s.mouseY < s.height && s.mouseX > 0 && s.mouseY > 0) {
                if (s.isLooping()) {
                    s.noLoop();
                    showIcon('pause');
                }
                else {
                    s.loop();
                    showIcon('resume');
                }
            }
        }
    }
}

let canvasParanoiaInstance = new CanvasParanoiaGenerator(defaultSize, sketchHolder);
let canvas = new p5(canvasParanoiaInstance.sketch, sketchHolder);

function generateNew() {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    canvasParanoiaInstance = null;
    canvasParanoiaInstance = new CanvasParanoiaGenerator(defaultSize, sketchHolder);
    canvas = new p5(canvasParanoiaInstance.sketch, sketchHolder);
}

function generateFullScreen() {
    let elem = document.getElementById('fullscreen');
    elem.requestFullscreen();
}

function download() {
    canvas.saveCanvas(canvas.renderer, 'Canvas Paranoia', 'png');
}

function showIcon(status) {
    $("#overlay").stop(true, true);
    if (status === 'pause') {
        $("#overlay").html('PAUSE');
    } else {
        $("#overlay").html('Another Piece (Same Base Color)');
    };
    document.getElementById("overlay").style.display = "block";
    $("#overlay").fadeOut(6000);
}