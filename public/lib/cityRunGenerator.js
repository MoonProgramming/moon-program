console.log(tokenAttributes);
console.log('tokenHash', tokenHash);

class cityRunGenerator {
    defaultSize;
    thresholdSize;
    sketchHolder;
    tokenAttributes;
    tokenHash;

    renderer;
    totalSize;

    perc_baseDistance_y = 1; //random
    perc_multiplier_y = 10; //random
    perc_base_object_width = 1; //random
    perc_base_object_height = 1; //random
    perc_shear = 0; //random

    base_layer;
    baseDistance_y; //random
    multiplier_y; //random
    base_object_width; //random
    base_object_height; //random
    direction = "Parallel"; //random
    shear = 0; //random
    palette = ['#fcf7c5', '#0abfbc', '#fc354c', '#13747d', '#29221f']; //random

    layers = [];
    layerCount;
    seedIndex = 0;

    constructor(defaultSize, thresholdSize, sketchHolder, tokenAttributes, tokenHash) {
        this.defaultSize = defaultSize;
        this.thresholdSize = thresholdSize;
        this.sketchHolder = sketchHolder;
        this.tokenAttributes = tokenAttributes;
        this.tokenHash = tokenHash;
        this.totalSize = this.defaultSize;
    }

    sketch = (s) => {
        s.preload = () => {
            this.palette = [];
            if (this.tokenAttributes && this.tokenAttributes.length > 0) {
                this.tokenAttributes.forEach(x => {
                    switch (x.trait_type) {
                        case 'Distance':
                            this.perc_baseDistance_y = x.value;
                            break;
                        case 'Y-Factor':
                            this.perc_multiplier_y = x.value;
                            break;
                        case 'Width':
                            this.perc_base_object_width = x.value;
                            break;
                        case 'Height':
                            this.perc_base_object_height = x.value;
                            break;
                        case 'Shear Direction':
                            this.direction = x.value;
                            break;
                        case 'Shear':
                            this.perc_shear = x.value;
                            break;
                        case 'Color0':
                            this.palette[0] = x.value;
                            break;
                        case 'Color1':
                            this.palette[1] = x.value;
                            break;
                        case 'Color2':
                            this.palette[2] = x.value;
                            break;
                        case 'Color3':
                            this.palette[3] = x.value;
                            break;
                        case 'Color4':
                            this.palette[4] = x.value;
                            break;
                        default:
                            console.log(`Un-recognize trait_type of ${x.trait_type}.`);
                    }
                });
            }
            if (this.tokenHash) this.genRandomSeed(s);
        };
        s.setup = () => {
            this.renderer = s.createCanvas(this.defaultSize, this.defaultSize);
            s.frameRate(60);
            s.windowResized();
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
                this.start(s);
            }
        };
        s.mouseClicked = () => {
            if (s.mouseX > 0 && s.mouseX < this.totalSize && s.mouseY > 0 && s.mouseY < this.totalSize) {
                if (s.isLooping())
                    s.noLoop();
                else
                    s.loop();
            }
        }
        s.draw = () => {
            s.background(this.palette[3]);
            s.shearY(this.shear);

            s.fill(this.palette[this.palette.length - 1]);
            s.rect(0, this.base_layer, this.totalSize, this.totalSize);
            for (let i = 0; i < this.layerCount; i++) {
                let layer = this.layers[i];
                let objectList = layer.objectList;
                objectList.forEach(object => {
                    this.drawObject(s, object, layer);
                    this.move(object, layer.speed);
                });
            }

            if (newlyMinted && !this.sketchHolder && s.frameCount == 1) {
                console.log('saveFrames');
                s.saveFrames('out', 'png', 1, 1, data => {
                    fetch(postUrl, {
                        method: 'POST',
                        mode: 'same-origin', // no-cors, *cors, same-origin
                        credentials: 'same-origin',
                        headers: {
                            'CSRF-Token': token,
                            'Content-Type': 'application/json'
                        },
                        referrerPolicy: 'no-referrer',
                        body: JSON.stringify(data)
                    }).then(response => {
                        console.log(response);
                    });
                });
            }
        };
    }
    start(s) {
        this.layers = [];
        this.base_layer = this.totalSize / 4.166;
        this.baseDistance_y = (this.perc_baseDistance_y / 100 * (0.06 - 0.01) + 0.01) * this.totalSize;
        this.multiplier_y = this.perc_multiplier_y;
        this.base_object_width = (this.perc_base_object_width / 100 * (0.06 - 0.006) + 0.006) * this.totalSize;
        this.base_object_height = (this.perc_base_object_height / 100 * (0.12 - 0.04) + 0.04) * this.totalSize;
        this.layerCount = this.getLayerCount();
        if (this.direction != "Parallel") {
            this.shear = (this.perc_shear / 100 * (0.1 - 0.02) + 0.02);
            if (this.direction == "Uphill") this.shear = -this.shear;
        }
        // console.log(this.baseDistance_y,this.multiplier_y,this.base_object_width,this.base_object_height,this.layerCount,this.shear);

        let y = this.base_layer;
        for (let i = 0; i < this.layerCount; i++) {
            let objectList = [];
            let extraSize = i * 5;
            let x = s.random(-this.base_object_width);

            while (x < this.totalSize) {
                let objectWidth = this.base_object_width + extraSize + s.random(1, 20);
                let objectHeight = this.base_object_height + extraSize + s.random(1, 80);
                let haveLeftWindows = s.random(0, 100) < 80;
                let haveRightWindows = s.random(0, 100) < 70;
                let leftWinOn = [];
                let rightWinOn = [];
                for (let i = 0; i < 60; i++) {
                    leftWinOn.push(s.random([true, false]));
                    rightWinOn.push(s.random([true, false, false]));
                }

                objectList.push({
                    x: x,
                    y: y,
                    width: objectWidth,
                    height: objectHeight,
                    haveLeftWindows: haveLeftWindows,
                    haveRightWindows: haveRightWindows,
                    leftWinOn: leftWinOn,
                    rightWinOn: rightWinOn,
                });
                x += objectWidth;
            }

            this.layers.push({
                objectList: objectList,
                speed: 0.5 + (i * 0.2),
                angle: 1 + (i * 0.5),
            });

            y += this.baseDistance_y + (this.multiplier_y * i);
        }
        s.noLoop();
    }

    drawObject(s, object, layer) {
        // draw building
        let x = object.x;
        let y = object.y;
        let w = object.width;
        let h = object.height;
        let a = layer.angle;
        s.noStroke();
        s.push();

        // leftWing
        s.fill(this.palette[this.palette.length - 1]);
        s.beginShape();
        s.vertex(x, y);
        s.vertex(x, y - h);
        s.vertex(x + (w / 2), y - h + a);
        s.vertex(x + (w / 2), y + a);
        s.endShape(s.CLOSE);

        // rightWing;
        s.fill(this.palette[2]);
        s.beginShape();
        s.vertex(x + (w / 2), y - h + a);
        s.vertex(x + (w / 2), y + a);
        s.vertex(x + w, y);
        s.vertex(x + w, y - h);
        s.endShape(s.CLOSE);

        //leftWindow
        s.stroke(this.palette[0]);
        s.strokeWeight(a * 0.5);
        let winCount = 0;
        if (object.haveLeftWindows) {
            for (let fl = y - h + (h * 2 / 14); fl <= y; fl += h / 12) {
                let count = 5;
                for (let i = 1; i <= count; i++) {
                    if (object.leftWinOn[winCount]) {
                        s.line(x + (w * i / 12), fl + (a * (i * 2) / 12), x + (w * i / 12), fl + (a * (i * 2) / 12) + a * 6 / 12);
                    }
                    winCount++;
                }
            }
        }
        //rightWindow
        winCount = 0;
        if (object.haveRightWindows) {
            for (let fl = y - h + a + (h * 2 / 14); fl <= y; fl += h / 12) {
                let count = 5;
                for (let i = 1; i <= count; i++) {
                    if (object.rightWinOn[winCount]) {
                        s.line(x + (w * (i + 6) / 12), fl - (a * (i * 2) / 12), x + (w * (i + 6) / 12), fl - (a * (i * 2) / 12) + a * 6 / 12);
                    }
                    winCount++;
                }
            }
        }
        s.noStroke();

        // roof;
        s.fill(this.palette[1]);
        s.beginShape();
        s.vertex(x, y - h);
        s.vertex(x + (w / 2), y - h + a);
        s.vertex(x + w, y - h);
        s.vertex(x + (w / 2), y - h - a);
        s.endShape(s.CLOSE);

        s.pop();
    }

    move(object, speed) {
        object.x = object.x - speed;
        if (object.x + object.width < 0) object.x = this.totalSize;
    }

    getLayerCount() {
        let count = 0;
        let y = this.base_layer;
        while (y < this.totalSize + this.base_object_height) {
            y += (this.baseDistance_y + (this.multiplier_y * count));
            count++;
        }
        return count + 1;
    }

    genRandomSeed(s) {
        let hash = this.tokenHash;
        if (this.tokenHash.startsWith('0x')) {
            hash = this.tokenHash.substr(2);
        }
        const e = hash.substr(this.seedIndex, 6);
        this.seedIndex += 6;
        if (this.seedIndex >= hash.length - 6) {
            this.seedIndex = (this.seedIndex + 6) % hash.length;
        }
        let seed = parseInt(e, 16);
        console.log('seed', seed);
        s.randomSeed(seed)
    }
}

let sketchHolder = document.getElementById("sketch-holder") || undefined;
let defaultSize = 400;
let thresholdSize = defaultSize * 1.075;

if (fullScreen) {
    defaultSize = 1600;
    thresholdSize = 1600;
    sketchHolder = document.getElementsByTagName("BODY")[0] || undefined;
}

let cityRunInstance = new cityRunGenerator(defaultSize, thresholdSize, sketchHolder, tokenAttributes, tokenHash);
let canvas = new p5(cityRunInstance.sketch, sketchHolder);

function generateNewSketch() {
    const posting = $.ajax({
        credentials: 'same-origin',
        headers: {
            'CSRF-Token': token
        },
        url: genAttrUrl,
        type: "POST",
    });

    posting.done(function (data) {
        console.log(data);
        tokenAttributes = data;

        if (canvas) {
            canvas.remove();
            canvas = null;
        }
        sketchHolder.innerHTML = "";
        cityRunInstance = null;
        cityRunInstance = new cityRunGenerator(defaultSize, thresholdSize, sketchHolder, tokenAttributes, tokenHash);
        canvas = new p5(cityRunInstance.sketch, sketchHolder);
    });

    posting.fail(function () {
        console.log('posting failed');
    });
}