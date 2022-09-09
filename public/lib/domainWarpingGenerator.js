import palettes from 'https://cdn.skypack.dev/nice-color-palettes@3.0.0/1000.json' assert { type: "json" };
import { PaletteSelector } from "./utils/paletteSelector.js"

let defaultSize = 400;
let sketchHolder = document.getElementById("sketch-holder") || undefined;

class DomainWarpingGenerator {

    constructor(defaultSize, sketchHolder) {
        this.defaultSize = defaultSize;
        this.thresholdSize = Math.floor(defaultSize * 1.075);
        this.sketchHolder = sketchHolder;
    }

    sketch = (s) => {

        s.renderer;
        let totalSize = 400;
        let palette;
        let customFrameCount = 0;

        // let hexColors = ['#DDE4D2', '#A6C3AD', '#3F5F54', '#1A2419'];
        let colors = [];
        let bound = [0, 0.33, 0.66, 1];
        let freq = 0.01;
        let addLayer = 3;
        let finalAmp = 7;
        let amp = [80, 0.7, 2];
        let offset = [{ x: 0.9, y: 1.2 }, { x: 1.5, y: 3.3 }, { x: 4.5, y: 5.2 }, { x: 7.8, y: 6.1 }];

        s.preload = () => { }

        s.setup = () => {
            s.pixelDensity(1);
            s.renderer = s.createCanvas(this.defaultSize, this.defaultSize);
            palette = new PaletteSelector(palettes).random(true, 150, 180);

            colors = [];
            bound = [];
            for (let i = 0; i < palette.length; i++) {
                let c = s.color(palette[i]);
                colors.push(c);
                bound.push(i/(palette.length-1));
            }

            freq = s.round(s.random(0.003, 0.01), 3);
            finalAmp = s.round(s.random(4, 10));
            addLayer = s.floor(s.random(1, 4));
            amp = [s.round(s.random(10, 100)), 
                s.round(s.random(0.06, 2), 2), 
                s.round(s.random(0.05, 3), 2)];
            console.log('freq '+ freq, 'addLayer '+ addLayer, 'finalAmp '+ finalAmp, 'amp '+ amp)
            s.windowResized();
        }

        s.windowResized = () => {
            let fs = s.fullscreen();
            if (this.sketchHolder) {
                customFrameCount = 0;
                if (!fs) {
                    this.sketchHolder.innerHTML = "";
                    let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
                    if (maxSize < this.thresholdSize)
                        totalSize = Math.floor(maxSize * 0.92);
                    else
                        totalSize = this.defaultSize;
                    s.resizeCanvas(totalSize, totalSize);
                    s.renderer.parent(this.sketchHolder);
                } else {
                    totalSize = Math.floor(Math.max(s.windowWidth, s.windowHeight));
                    s.resizeCanvas(Math.floor(s.windowWidth), Math.floor(s.windowHeight));
                }
            }
        }

        s.draw = () => {
            customFrameCount++;
            if (customFrameCount === 1) {
                showLoadingText();
                s.loop();
            } else {
                let timerStart = new Date();
                s.noiseSeed(s.random(100));
                drawByPixel();
                console.log('time took = ' + (new Date() - timerStart));
                
                s.noLoop();
            }
        }

        function showLoadingText() {
            s.background(200);
            let textSize = Math.floor(totalSize / 20);
            s.textSize(textSize);
            s.textAlign(s.CENTER);
            s.text('loading...', s.width / 2, s.height / 2);
        }

        function lerpColorByPalette(r) {
            let c;
            for (let i = 1; i < bound.length; i++) {
                if (r < bound[i]) {
                    c = s.lerpColor(colors[i - 1],
                        colors[i],
                        (r - bound[i - 1]) / (bound[i] - bound[i - 1]));
                    break;
                }
            }
            return c;
        }

        function domainWrap(x, y) {
            let xoff = x * freq;
            let yoff = y * freq;
            let nx = 0;
            let ny = 0;

            for (let i = 0; i < addLayer; i++) {
                nx = s.noise(xoff + nx * amp[i], yoff + ny * amp[i]);
                ny = s.noise(xoff + nx * amp[i] + offset[i].x, yoff + ny * amp[i] + offset[i].y);
            }

            return s.noise(xoff + nx * finalAmp, yoff + ny * finalAmp);
        }

        function drawByPixel() {
            s.loadPixels();
            for (let y = 0; y < s.height; y++) {
                for (let x = 0; x < s.width; x++) {
                    let val = domainWrap(x, y);
                    let rgba = lerpColorByPalette(val);
                    s.set(x, y, rgba);
                }
            }
            s.updatePixels();
        }
    }
}

let domainWarpingInstance = new DomainWarpingGenerator(defaultSize, sketchHolder);
let canvas = new p5(domainWarpingInstance.sketch, sketchHolder);

window.generateNew = () => {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    domainWarpingInstance = null;
    domainWarpingInstance = new DomainWarpingGenerator(defaultSize, sketchHolder);
    canvas = new p5(domainWarpingInstance.sketch, sketchHolder);
}

window.generateFullScreen = () => {
    let elem = document.getElementById('fullscreen');
    elem.requestFullscreen();
}

window.download = () => {
    canvas.saveCanvas(canvas.renderer, 'Domain Warping', 'jpeg');
}