let randomizer;

// function preload() {
// 	// current owner (if known, else default to 0x0)
// 	const owner = beyondHelpers.get('owner', '0x0000000000000000000000000000000000000000');
// 	// viewer parameter (only if we know about it, else empty so we default to OxO)
// 	const viewer = beyondHelpers.get('viewer', '0x0000000000000000000000000000000000000000');

// 	meta = {
// 		owner,
// 		viewer,
// 	}
// }

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

        randomSeed(parseInt(e, 16))
    }
}

class newNftGenerator {
    defaultSize;
    thresholdSize;
    sketchHolder;

    renderer;
    totalSize;
    frameSize;
    texture;
    offset = 2;

    constructor(defaultSize, thresholdSize, sketchHolder) {
        this.defaultSize = defaultSize;
        this.thresholdSize = thresholdSize;
        this.sketchHolder = sketchHolder;
        this.totalSize = this.defaultSize;
        this.frameSize = this.totalSize - (2 * this.offset);
    }

    sketch = (s) => {
        s.preload = () => { };
        s.setup = () => {
            this.renderer = s.createCanvas(this.defaultSize, this.defaultSize);
            s.windowResized();
            this.start(s);
        };
        s.windowResized = () => {
            if (this.sketchHolder) {
                this.sketchHolder.innerHTML = "";

                let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
                if (maxSize < this.thresholdSize) {
                    this.totalSize = maxSize * 92 / 100;
                } else {
                    this.totalSize = this.defaultSize;
                }
                this.frameSize = this.totalSize - (2 * this.offset);
                s.resizeCanvas(this.totalSize, this.totalSize);

                this.renderer.parent(this.sketchHolder);
            }
        };
        s.draw = () => {
            // noise texture
            s.push();
            s.blendMode(s.OVERLAY);
            s.image(this.texture, this.offset, this.offset);
            s.pop();

            // canvas frame
            s.push();
            s.noFill();
            s.strokeWeight(5);
            s.square(0.5, 0.5, this.totalSize - 1);
            s.pop();

            if (newlyMinted && !this.sketchHolder && s.frameCount == 1) {
                console.log('saveFrames');
                s.saveFrames('out', 'png', 1, 1, data => {
                    const posting = $.ajax({
                        credentials: 'same-origin', // <-- includes cookies in the request
                        headers: {
                            'CSRF-Token': token,
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        xhrFields: { withCredentials: true },
                        url: postUrl,
                        type: "POST",
                        data: JSON.stringify(data),
                    });
            
                    posting.done(function (data) {
                        console.log(data);
                    });
                    
                    posting.fail(function () {
                        console.log('posting failed');
                    });
                    // fetch(postUrl, {
                    //     method: 'POST',
                    //     mode: 'no-cors', // no-cors, *cors, same-origin
                    //     credentials: 'same-origin',
                    //     headers: {
                    //         'CSRF-Token': token,
                    //         'Content-Type': 'application/json'
                    //     },
                    //     referrerPolicy: 'no-referrer',
                    //     body: JSON.stringify(data)
                    // }).then(response => {
                    //     console.log(response);
                    // });
                });
            }
        };
    }
    start(s) {
        s.background(tokenAttributes[1].value);
        s.noLoop();
        this.texture = s.createGraphics(this.defaultSize, this.defaultSize);
        this.addNoiseBackground(s);
    }

    addNoiseBackground(s) {
        const noisePerLayer = 800;
        const layerCount = 35;
        const pixelSize = this.defaultSize / 777;
        this.texture.stroke('rgba(0,0,0,' + pixelSize + ')');

        for (let layer = 0; layer < layerCount; layer++) {
            let length = s.random(0.4, 0.6);
            for (let i = 0; i < noisePerLayer; i++) {
                let mass = s.random(0.4, 1.5);
                let x = s.random(this.offset, this.defaultSize - length);
                let y = s.random(this.offset, this.defaultSize - length);
                let xEnd = x + s.random(-1, 1) * length;
                let yEnd = y + s.random(-1, 1) * length;

                this.texture.strokeWeight(mass);
                this.texture.line(x, y, xEnd, yEnd);
            }
        }
    }
}

let sketchHolder = document.getElementById("sketch-holder") || undefined;
let defaultSize = 400;
let thresholdSize = 430;

if (fullScreen) {
    defaultSize = window.visualViewport.width;
    thresholdSize = window.visualViewport.width;
    sketchHolder = document.getElementsByTagName("BODY")[0] || undefined;
}

let newNftInstance = new newNftGenerator(defaultSize, thresholdSize, sketchHolder);
let canvas = new p5(newNftInstance.sketch, sketchHolder);

console.log('newlyMinted', newlyMinted);
if (newlyMinted) {
    let smallNftInstance = new newNftGenerator(350, 350, null);
    new p5(smallNftInstance.sketch);
}