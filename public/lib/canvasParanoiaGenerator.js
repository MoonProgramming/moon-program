import { PaletteSelector } from "./utils/paletteSelector.js"

let defaultSize = 400;
let sketchHolder = document.getElementById("sketch-holder") || undefined;

class CanvasParanoiaGenerator {

    constructor(defaultSize, sketchHolder) {
        this.defaultSize = defaultSize;
        this.thresholdSize = Math.floor(defaultSize * 1.075);
        this.sketchHolder = sketchHolder;
    }

    sketch = (s) => {

        s.renderer;
        let totalSize = 400;
        let colors;
        let grainTexture;
        let rectAlpha = 3;
        let layers = 150;
        let layerDistRange = 100;
        let rectArea = 50;
        let textSize = 30;

        function createGrainTexture() {
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
        }

        function start() {
            colors = new PaletteSelector(palettes).random(false, 150, 150);
            showLoadingText();
        }

        s.draw = () => {
            s.pixelDensity(3);
            createGrainTexture();
            
            s.background(200);
            s.noStroke();
            
            for (let y = -rectArea; y < s.height + rectArea * 2; y += rectArea) {
                for (let x = -rectArea; x < s.width + rectArea * 2; x += rectArea) {
                    drawRect(x, y, rectArea + rectArea / 2);
                }
            }

            s.image(grainTexture, 0, 0);
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

window.generateNew = () => {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    canvasParanoiaInstance = null;
    canvasParanoiaInstance = new CanvasParanoiaGenerator(defaultSize, sketchHolder);
    canvas = new p5(canvasParanoiaInstance.sketch, sketchHolder);
}

window.generateFullScreen = () => {
    let elem = document.getElementById('fullscreen');
    elem.requestFullscreen();
}

window.download = () => {
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