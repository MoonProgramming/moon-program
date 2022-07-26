let sketchHolder = document.getElementById("sketch-holder") || undefined;
let defaultSize = 400;
let thresholdSize = defaultSize * 1.075;

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

class fur {
  constructor(x,y,nx,ny,color) {
    this.destinationX = x;
    this.destinationY = y;
    this.noiseCoorX = nx;
    this.noiseCoorY = ny;
    this.color = color;
  }
}

class furOutGenerator {
    furs = [];
    furCount;
    z = 100;
    
    defaultSize;
    thresholdSize;
    sketchHolder;
    renderer;
    totalSize;
    texture;

    constructor(defaultSize, thresholdSize, sketchHolder) {
        this.defaultSize = defaultSize;
        this.thresholdSize = thresholdSize;
        this.sketchHolder = sketchHolder;
    }

    sketch = (s) => {
        s.preload = () => {};
        s.setup = () => {
            this.renderer = s.createCanvas(this.defaultSize, this.defaultSize);
            s.windowResized();
            this.start(s);
        };
        s.windowResized = () => {
            if (this.sketchHolder) {
                this.sketchHolder.innerHTML = "";
                let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
                if (maxSize < this.thresholdSize)
                    this.totalSize = maxSize * 92 / 100;
                else
                    this.totalSize = this.defaultSize;
                s.resizeCanvas(this.totalSize, this.totalSize);
                this.renderer.parent(this.sketchHolder);
            }
        };
        s.draw = () => {
            s.translate(this.totalSize/2, this.totalSize/2);
  
            for (let i=0; i<this.furs.length; i++) {
                let x = this.furs[i].destinationX;
                let y = this.furs[i].destinationY;
                let nx = this.furs[i].noiseCoorX;
                let ny = this.furs[i].noiseCoorY;
                
                this.furs[i].noiseCoorX = nx + 0.01;
                this.furs[i].noiseCoorY = ny + 0.01;
                
                let sx = x/this.z;
                let sy = y/this.z;
                let amp = this.totalSize/12;
                let ssx = sx + s.map(s.noise(nx),0,1,-amp,amp);
                let ssy = sy + s.map(s.noise(ny),0,1,-amp,amp);
                s.stroke(this.furs[i].color);
                if (this.z > 1) {
                    s.point(ssx,ssy);
                }
            }
            this.z = this.z / 1.008;
        };
        s.mousePressed = () => {}
    }
    start(s) {
        // s.createLoop({
            // duration: 6,
            // noise: {
            //     radius: 0.8,
            //     seed: s.random(0, 99999),
            // },
            // gif: {
            //     render: false,
            //     open: false,
            //     download: true,
            //     fileName: 'Fur_Out' + '.gif',
            //     startLoop: 2,
            //     endLoop: 5,
            //     options: {
            //         quality: 5,
            //         width: null,
            //         height: null,
            //         debug: false,
            //     },
            // }
        // });
        // createLoop({
        // 	duration: 3,
        //     gif: true,
        // });
        // animLoop.noiseFrequency(0.4)

        this.furCount = this.totalSize;
        let colorObject = s.random(colorPalette);
        for (let i=0; i<this.furCount; i++) {
            let x = s.random(-this.totalSize/2, this.totalSize/2);
            let y = s.random(-this.totalSize/2, this.totalSize/2);
            let nx = s.random(1,100);
            let ny = s.random(1,100);
            let color = s.random(colorObject.colors);
            this.furs[i] = new fur(x,y,nx,ny,color);
        }
        s.background(255);
    }
}

let furOutInstance = new furOutGenerator(defaultSize, thresholdSize, sketchHolder);
let canvas = new p5(furOutInstance.sketch, sketchHolder);

function generateNew() {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    furOutInstance = null;
    furOutInstance = new furOutGenerator(defaultSize, thresholdSize, sketchHolder);
    canvas = new p5(furOutInstance.sketch, sketchHolder);
}