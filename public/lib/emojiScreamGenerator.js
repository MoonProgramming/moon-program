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
        let isMobile;
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
            console.log('pixelDensity = ' + s.pixelDensity());
            if (s.pixelDensity() > 1) isMobile = true;
            s.pixelDensity(1);
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

        function start() {
            s.background(255);
            emoji = emojis[s.floor(s.random(emojis.length))];
        }

        s.draw = () => {
            s.background(220, 8);

            s.noStroke();
            s.textSize(s.width * 0.82);
            s.textAlign(s.CENTER);
            s.fill(255, 255, 255, 10);

            let range = s.width * 0.02;
            for (let i = 0; i < 6; i++) {
                s.text(emoji, s.width / 2 + s.random(-range, range), s.height / 1.27 + s.random(-range, range));
            }

            let area = s.width;
            s.stroke(0, 255);

            if (isMobile) {
                s.stroke(0, 40);
            }
            s.strokeWeight(0.07);
            for (let i = 0; i < area; i++) {
                let x = s.random(area);
                let y = s.random(area + area * 0.25);
                s.line(x, y - i, x, y - i - s.random(area));
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
    }, 10000);

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


  

