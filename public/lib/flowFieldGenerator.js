let defaultSize = 400;
let canvasId = 'flowField';
let isPause = false;
let sketchHolder = document.getElementById("sketch-holder") || undefined;
let roughnessSlider = document.getElementById("roughnessSlider") || undefined;
let angleRangeSlider = document.getElementById("angleRangeSlider") || undefined;
let roughnessOutput = document.getElementById("roughnessOutput") || undefined;
let angleRangeOutput = document.getElementById("angleRangeOutput") || undefined;

roughnessOutput.innerHTML = roughnessSlider.value;
angleRangeOutput.innerHTML = angleRangeSlider.value;

roughnessSlider.oninput = function () {
    roughnessOutput.innerHTML = this.value;
};
angleRangeSlider.oninput = function () {
    angleRangeOutput.innerHTML = this.value;
};

class flowFieldGenerator {

    constructor(defaultSize, sketchHolder) {
        this.defaultSize = defaultSize;
        this.thresholdSize = defaultSize * 1.075;
        this.sketchHolder = sketchHolder;
    }

    sketch = (s) => {
        class Particle {
            constructor() {
                this.pos = s.createVector(s.floor(s.random(s.width)), s.floor(s.random(s.height)));
            }

            edge() {
                if (this.pos.x < 0) {
                    this.pos.x = s.width;
                }
                if (this.pos.x > s.width) {
                    this.pos.x = 0;
                }
                if (this.pos.y < 0) {
                    this.pos.y = s.height;
                }
                if (this.pos.y > s.height) {
                    this.pos.y = 0;
                }
            }

            show() {
                s.stroke(0, 30);
                s.point(this.pos.x, this.pos.y);
            }
        }

        s.renderer;
        let totalSize = 400;
        let particles = [];
        let zoff = 0;

        s.preload = () => { }
        s.setup = () => {
            s.renderer = s.createCanvas(this.defaultSize, this.defaultSize);
            s.renderer.id(canvasId);

            s.frameRate(10);
            s.windowResized();
        }
        s.windowResized = () => {
            let fs = s.fullscreen();
            if (this.sketchHolder) {
                if (!fs) {
                    this.sketchHolder.innerHTML = "";
                    let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
                    if (maxSize < this.thresholdSize)
                        totalSize = maxSize * 92 / 100;
                    else
                        totalSize = this.defaultSize;
                    s.resizeCanvas(totalSize, totalSize);
                    s.renderer.parent(this.sketchHolder);
                } else {
                    totalSize = Math.max(s.windowWidth, s.windowHeight);
                    s.resizeCanvas(s.windowWidth, s.windowHeight);
                }
                start();
            }
        }
        function start() {
            s.background(250);

            let particleCount = totalSize * 30;
            particles = [];
            zoff = 0;

            for (let i = 0; i < particleCount; i++) {
                let par = new Particle();
                particles.push(par);
            }
        }
        s.draw = () => {
            let roughness = roughnessSlider.value;
            let angleRange = angleRangeSlider.value;

            for (let i = 0; i < particles.length; i++) {
                let par = particles[i];
                let xoff = par.pos.x * roughness;
                let yoff = par.pos.y * roughness;
                par.direction = p5.Vector.fromAngle(s.noise(xoff, yoff, zoff) * s.TWO_PI * angleRange);
                par.direction.normalize();
                par.pos.sub(par.direction);
                par.edge();
                par.show();
            }
            zoff += 0.001;
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

let flowFieldInstance = new flowFieldGenerator(defaultSize, sketchHolder);
let canvas = new p5(flowFieldInstance.sketch, sketchHolder);

function generateNew() {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    flowFieldInstance = null;
    flowFieldInstance = new flowFieldGenerator(defaultSize, sketchHolder);
    canvas = new p5(flowFieldInstance.sketch, sketchHolder);
}

function generateFullScreen() {
    let elem = document.getElementById('fullscreen');
    elem.requestFullscreen();
}

function download() {
    canvas.saveCanvas(canvas.renderer, 'flowField', 'png');
}

function showIcon(status) {
    $("#overlay").stop(true, true);
    if (status === 'pause') {
        $("#overlay").html('PAUSE');
    } else {
        $("#overlay").html('RESUME');
    };
    document.getElementById("overlay").style.display = "block";
    $("#overlay").fadeOut(4000);
}