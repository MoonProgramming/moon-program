console.log(tokenAttributes);

let randomizer;
let sketchHolder = document.getElementById("sketch-holder") || undefined;
let renderer;
let defaultSize = 400;
let thresholdSize = 430;
let totalSize;
let frameSize;

if (fullScreen) {
    sketchHolder = document.getElementsByTagName("BODY")[0] || undefined;
    defaultSize = window.visualViewport.width;
    thresholdSize = window.visualViewport.width;
}
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
    texture;
    offset = 2;
    sketch = (s) => {
        s.preload = () => { };
        s.setup = () => {
            renderer = s.createCanvas(defaultSize, defaultSize);
            s.windowResized();
            this.start(s);
        };
        s.windowResized = () => {
            sketchHolder.innerHTML = "";

            let maxSize = Math.min(window.visualViewport.width, window.visualViewport.height);
            if (maxSize < thresholdSize) {
                totalSize = maxSize * 98 / 100;
            } else {
                totalSize = defaultSize;
            }
            frameSize = totalSize - (2 * this.offset);
            s.resizeCanvas(totalSize, totalSize);

            renderer.parent(sketchHolder);
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
            s.square(0.5, 0.5, totalSize - 1);
            s.pop();
        };
        s.mousePressed = () => {
        }
    }
    start(s) {
        // let nftMeta = this.generateNewProperties(s);
        // jsonMeta.push(nftMeta);

        s.background(tokenAttributes[1].value);
        s.noLoop();
        this.texture = s.createGraphics(defaultSize, defaultSize);
        this.addNoiseBackground(s);
    }

    addNoiseBackground(s) {
        const noisePerLayer = 800;
        const layerCount = 35;
        const pixelSize = defaultSize / 777;
        this.texture.stroke('rgba(0,0,0,' + pixelSize + ')');
    
        for (let layer = 0; layer < layerCount; layer++) {
            let length = s.random(0.4, 0.6);
            for (let i = 0; i < noisePerLayer; i++) {
                let mass = s.random(0.4, 1.5);
                let x = s.random(this.offset, defaultSize - length);
                let y = s.random(this.offset, defaultSize - length);
                let xEnd = x + s.random(-1, 1) * length;
                let yEnd = y + s.random(-1, 1) * length;
    
                this.texture.strokeWeight(mass);
                this.texture.line(x, y, xEnd, yEnd);
            }
        }
    }
}

let newNftInstance = new newNftGenerator();
let canvas = new p5(newNftInstance.sketch, sketchHolder);