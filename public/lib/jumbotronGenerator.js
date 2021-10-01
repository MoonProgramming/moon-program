let defaultWidth = 600;
let defaultHeight = 280;
let maxWidth = 1600;
let width;
let height;

let sketchHolder = document.getElementById("sketch-holder") || undefined;
let canvas = null;
let jumboInstance;

class JumbotronGenerator {
    constructor() {

        this.sketch = (s) => {
            s.preload = () => { };
            s.setup = () => {
                this.renderer = s.createCanvas(defaultWidth, defaultHeight);
                // s.frameRate(18);
                s.windowResized();
                this.start(s);
                this.circleW = 300
                this.circleH = 100;
            };
            s.windowResized = () => {
                sketchHolder.innerHTML = "";
                width = window.visualViewport.width;
                height = defaultHeight;
                s.resizeCanvas(width, height);
                this.renderer.parent(sketchHolder);
            }
            s.draw = () => {
                s.background(220);
                s.image(this.texture, 0, 0);
                s.circle(this.circleW, this.circleH, 100);
                this.circleW += s.noise(s.frameCount);
                this.circleH += s.noise(s.frameCount);
            };
            s.mousePressed = (() => {
            });
            s.keyTyped = () => {
            };
            s.mouseDragged = (() => {
            });
            s.mouseReleased = (() => {
            });
        };
    }
    start(s) {
        this.texture = s.createGraphics(maxWidth, height);
        const noisePerLayer = 300;
        const layerCount = 5;
        const pixelSize = 1;
        this.texture.stroke('rgba(0,0,0,' + pixelSize + ')');

        for (let layer = 0; layer < layerCount; layer++) {
            let length = s.random(0.4, 2);
            for (let i = 0; i < noisePerLayer; i++) {
                let mass = s.random(0.4, 1.5);
                let x = s.random(0, maxWidth - length);
                let y = s.random(0, height - length);
                let xEnd = x + s.random(-2, 2) * length;
                let yEnd = y + s.random(-2, 2) * length;

                this.texture.strokeWeight(mass);
                this.texture.line(x, y, xEnd, yEnd);
            }
        }
    }
}


jumboInstance = new JumbotronGenerator();
canvas = new p5(jumboInstance.sketch, sketchHolder);

function resetJumbotron() {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    jumboInstance = null;
    jumboInstance = new JumbotronGenerator();
    canvas = new p5(jumboInstance.sketch, sketchHolder);
}