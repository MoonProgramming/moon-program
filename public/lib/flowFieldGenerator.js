let sketchHolder = document.getElementById("sketch-holder") || undefined;
let defaultSize = 400;
let thresholdSize = defaultSize * 1.075;

class Particle {
    constructor() {
        this.pos = createVector(random(0, width), random(0, height));
    }

    edge() {
        if (this.pos.x < 0) {
            this.pos.x = width;
        }
        if (this.pos.x > width) {
            this.pos.x = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
        }
    }

    show() {
        stroke(0, 20);
        point(this.pos.x, this.pos.y);
    }
}

let particles = [];
let zoff = 0;
let paragraph;
let roughnessSlider;
let angleRangeSlider;

function setup() {
    let canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');
    background(250);
    for (let i = 0; i < 10000; i++) {
        let par = new Particle();
        particles.push(par);
    }
    roughnessSlider = createSlider(0.001, 0.1, 0.01, 0.001);
    roughnessSlider.parent('attr1-slider');
    roughnessP = createSpan('Roughness:');
    roughnessP.parent('attr1-value');
    angleRangeSlider = createSlider(1, 4, 1, 1);
    angleRangeSlider.parent('attr2-slider');
    angleP = createSpan('AngleRange:');
    angleP.parent('attr2-value');
}


function draw() {
    let roughness = roughnessSlider.value();
    let angleRange = angleRangeSlider.value();
    for (let i = 0; i < particles.length; i++) {
        let par = particles[i];
        let xoff = par.pos.x * roughness;
        let yoff = par.pos.y * roughness;
        par.direction = p5.Vector.fromAngle(noise(xoff, yoff, zoff) * TWO_PI * angleRange);
        par.direction.normalize();
        par.pos.sub(par.direction);
        par.edge();
        par.show();
    }
    zoff += 0.001;

    roughnessP.html('Roughness: ' + roughness);
    angleP.html('AngleRange: ' + angleRange);
}

function mouseClicked() {
    if (mouseX < width && mouseY < height && mouseX > 0 && mouseY > 0) {
        if (isLooping()) noLoop();
        else loop();
    }
}

// class snakeGameEngine {
//     defaultSize;
//     thresholdSize;
//     sketchHolder;
//     renderer;
//     totalSize;

//     x;
//     y;
//     mass;
//     direction;
//     foodPos;
//     bodyCount;
//     grow;
//     snakeBody;

//     constructor(defaultSize, thresholdSize, sketchHolder) {
//         this.defaultSize = defaultSize;
//         this.thresholdSize = thresholdSize;
//         this.sketchHolder = sketchHolder;
//     }

//     sketch = (s) => {
//         s.preload = () => { };
//         s.setup = () => {
//             this.renderer = s.createCanvas(this.defaultSize, this.defaultSize);
//             s.windowResized();
//             this.start(s);
//         };
//         s.windowResized = () => {
//             if (this.sketchHolder) {
//                 this.sketchHolder.innerHTML = "";
//                 let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
//                 if (maxSize < this.thresholdSize)
//                     this.totalSize = maxSize * 92 / 100;
//                 else
//                     this.totalSize = this.defaultSize;
//                 s.resizeCanvas(this.totalSize, this.totalSize);
//                 this.renderer.parent(this.sketchHolder);
//             }
//         };
//         s.draw = () => {
//             s.background(220);
//             this.updateFood(s);
//             this.updatePath(s);
//             this.updateSnake(s);

//             // hit border
//             if (this.x >= this.totalSize || this.x <= 0 || this.y >= this.totalSize || this.y <= 0) {
//                 this.direction = 'stop';
//                 this.gameOver(s, 'Hit Border, Game Over');
//                 s.noLoop();
//             }
//             // hit self
//             for (let i = this.grow; i < this.bodyCount; i++) {
//                 let px = this.snakeBody[i][0];
//                 let py = this.snakeBody[i][1];
//                 if (this.x == px && this.y == py) {
//                     this.direction = 'stop';
//                     this.gameOver(s, 'Hit Self, Game Over');
//                     s.noLoop();
//                 }
//             }
//         };
//         s.mouseClicked = () => {
//             let axis;
//             if (this.direction === 'left' || this.direction === 'right')
//                 axis = 'horizontal';
//             else
//                 axis = 'vertical';
//             if (s.mouseX < this.x && axis === 'vertical') {
//                 this.direction = 'left';
//             } else if (s.mouseX > this.x && axis === 'vertical') {
//                 this.direction = 'right';
//             } else if (s.mouseY < this.y && axis === 'horizontal') {
//                 this.direction = 'up';
//             } else if (s.mouseY > this.y && axis === 'horizontal') {
//                 this.direction = 'down';
//             }
//         }
//         s.keyPressed = () => {
//             if (s.keyCode === s.LEFT_ARROW && this.direction != 'right') {
//                 this.direction = 'left';
//             } else if (s.keyCode === s.RIGHT_ARROW && this.direction != 'left') {
//                 this.direction = 'right';
//             } else if (s.keyCode === s.UP_ARROW && this.direction != 'down') {
//                 this.direction = 'up';
//             } else if (s.keyCode === s.DOWN_ARROW && this.direction != 'up') {
//                 this.direction = 'down';
//             }
//         }
//     }
//     start(s) {
//         this.x = this.totalSize / 2;
//         this.y = this.totalSize / 2;
//         this.mass = this.totalSize / 60;
//         this.direction = 'stop';
//         this.bodyCount = 0;
//         this.grow = s.floor(this.totalSize / 15);
//         this.snakeBody = [];
//         this.foodPos = [s.random(1, this.totalSize - this.mass), s.random(1, this.totalSize - this.mass)];
//     }
//     updateFood(s) {
//         let fx = this.foodPos[0];
//         let fy = this.foodPos[1];
//         if ((this.x <= fx + this.mass && fx <= this.x + this.mass) && (this.y <= fy + this.mass && fy <= this.y + this.mass)) {
//             this.bodyCount += this.grow;
//             for (let i = 0; i < this.grow; i++) {
//                 this.snakeBody.unshift([this.x, this.y]);
//             }
//             this.foodPos = [s.random(1, this.totalSize - this.mass), s.random(1, this.totalSize - this.mass)];
//         }
//         s.fill(255);
//         s.circle(this.foodPos[0], this.foodPos[1], this.mass);

//         s.fill(0, 102, 153, 251);
//         s.textSize(this.totalSize / 22);
//         s.textAlign(s.LEFT);
//         s.text('Food: ' + s.floor(this.bodyCount / this.grow), this.mass, this.totalSize - this.mass);
//     }
//     updatePath(s) {
//         this.snakeBody.unshift([this.x, this.y]);
//         this.snakeBody.pop();

//         if (this.direction == 'left') this.x -= 1;
//         else if (this.direction == 'right') this.x += 1;
//         else if (this.direction == 'up') this.y -= 1;
//         else if (this.direction == 'down') this.y += 1;
//     }
//     updateSnake(s) {
//         s.fill(0);
//         s.circle(this.x, this.y, this.mass);
//         for (let i = 0; i < this.bodyCount; i++) {
//             let px = this.snakeBody[i][0];
//             let py = this.snakeBody[i][1];
//             s.circle(px, py, this.mass);
//         }
//     }
//     gameOver(s, msg) {
//         s.fill(0, 102, 153, 251);
//         s.textSize(this.totalSize / 12);
//         s.textAlign(s.CENTER);
//         s.text(msg, this.totalSize / 2, this.totalSize / 2);
//     }
// }

// let snakeGameInstance = new snakeGameEngine(defaultSize, thresholdSize, sketchHolder);
// let canvas = new p5(snakeGameInstance.sketch, sketchHolder);

// function generateNew() {
//     if (canvas) {
//         canvas.remove();
//         canvas = null;
//     }
//     sketchHolder.innerHTML = "";
//     snakeGameInstance = null;
//     snakeGameInstance = new snakeGameEngine(defaultSize, thresholdSize, sketchHolder);
//     canvas = new p5(snakeGameInstance.sketch, sketchHolder);
// }