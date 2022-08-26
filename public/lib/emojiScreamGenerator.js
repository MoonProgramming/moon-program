let defaultSize = 400;
let sketchHolder = document.getElementById("sketch-holder") || undefined;

class EmojiScreamGenerator {

    constructor(defaultSize, sketchHolder) {
        this.defaultSize = defaultSize;
        this.thresholdSize = Math.floor(defaultSize * 1.075);
        this.sketchHolder = sketchHolder;
    }

    sketch = (s) => {

        s.renderer;
        let totalSize = 400;
        let emoji;
        let emojis = [
            '😱',
            '😭',
            '😣',
            '😖',
            '😰',
            '😨',
            '😧',
            '😵',
            '🥶',
            '🥵',
            '🤧',
            '🤮',
            '🤢',
            '😡',
            '😠',
            '😩',
            '🤬',
            '🙀'];

        s.preload = () => { }

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
            }
        }

        function start() {
            s.background(255);
            emoji = emojis[s.floor(s.random(emojis.length))];

            // s.createLoop({
            //     duration: 3,
            //     noise: {
            //         radius: 0.8,
            //         seed: s.random(0, 99999),
            //     },
            //     gif: {
            //         render: false,
            //         open: false,
            //         download: false,
            //         fileName: 'Crypto_Block_#' + itemCount + '.gif',
            //         // startLoop: 0,
            //         // endLoop: 2,
            //         options: {
            //             quality: 5,
            //             width: null,
            //             height: null,
            //             debug: false,
            //         },
            //     }
            // });
            // createLoop({
            // 	duration: 3,
            //     gif: true,
            // });
            // animLoop.noiseFrequency(0.4)
        }

        s.draw = () => {
            s.background(220, 8);

            s.noStroke();
            s.textSize(300);
            s.textAlign(s.CENTER);
            s.fill(255, 255, 255, 10);

            let range = 8;
            for (let i = 0; i < 6; i++) {
                s.text(emoji, s.width / 2 + s.random(-range, range), s.height / 1.3 + s.random(-range, range));
            }

            s.stroke(0);
            s.strokeWeight(0.07);
            for (let i = 0; i < 500; i++) {
                let x = s.random(400);
                let y = s.random(500);
                s.line(x, y - i, x, y - i - s.random(400));
            }
        }
    }
}

let EmojiScreamInstance = new EmojiScreamGenerator(defaultSize, sketchHolder);
let canvas = new p5(EmojiScreamInstance.sketch, sketchHolder);

window.generateNew = () => {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    EmojiScreamInstance = null;
    EmojiScreamInstance = new EmojiScreamGenerator(defaultSize, sketchHolder);
    canvas = new p5(EmojiScreamInstance.sketch, sketchHolder);
}

window.download = () => {
    let elem = document.getElementById("downloadGif");
    elem.innerHTML = 'Rendering...';
    elem.disabled = true;
    setTimeout(() => {
        console.log('download complete');
        elem.innerHTML = 'Download GIF &raquo;';
        elem.disabled = false;
    }, 8000);

    canvas.createLoop({
        duration: 3,
        framesPerSecond: 30,
        gif: {
            render: false,
            open: false,
            download: true,
            fileName: 'Emoji Scream.gif',
            // startLoop: 0,
            // endLoop: 2,
            options: {
                quality: 5,
                width: null,
                height: null,
                debug: false,
            },
        }
    });
}


  

