class PaletteSelector {
    constructor(palettes, isOrderByBrightness) {
      this.palettes = palettes;
      this.paletteCount = palettes.length;
      this.isOrderByBrightness = isOrderByBrightness || false;
    }
  
    // maxLuma ~= 150, minLumaRange ~= 150
    random(isOrderByBrightness, maxLuma, minLumaRange) {
        let index = Math.floor(Math.random() * this.palettes.length);
        let palette = this.palettes[index];
        
        if (minLumaRange) {
            let maxTry = 0;
            let lumaRange = calculateLumaRange(palette);
            while (lumaRange < minLumaRange && maxTry < 10) {
                index = Math.floor(Math.random() * this.palettes.length);
                palette = this.palettes[index];
                maxTry++;
                lumaRange = calculateLumaRange(palette);
            }
            // console.log('lumaRange = ' + lumaRange);
        }
        
        if (maxLuma) {
            let maxTry = 0;
            let minLuma = calculateMinimumLuma(palette);
            while (minLuma > maxLuma && maxTry < 10) {
                index = Math.floor(Math.random() * this.palettes.length);
                palette = this.palettes[index];
                maxTry++;
                minLuma = calculateMinimumLuma(palette);
            }
            // console.log('minLuma = ' + minLuma);
        }

        if (isOrderByBrightness) {
            this.isOrderByBrightness = isOrderByBrightness;
            palette = rearrangeColorByBrightness(palette);
        }

        return palette;
    }
  }

function rearrangeColorByBrightness(colorArr) {
    let lumaList = [];
    colorArr.forEach(color => {
        var c = color.substring(1);      // strip #
        var rgb = parseInt(c, 16);   // convert rrggbb to decimal
        var r = (rgb >> 16) & 0xff;  // extract red
        var g = (rgb >> 8) & 0xff;  // extract green
        var b = (rgb >> 0) & 0xff;  // extract blue

        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

        if (lumaList.length > 0) {
            let elementAssigned = false;
            for (let i = 0; i < lumaList.length; i++) {
                if (luma >= lumaList[i].luma) {
                    lumaList.splice(i, 0, { color: color, luma: luma });
                    elementAssigned = true;
                    break;
                }
            }
            if (!elementAssigned) {
                lumaList.push({ color: color, luma: luma });
            }
        } else {
            lumaList.push({ color: color, luma: luma });
        }
    });
    const palette = lumaList.map(x => { return x.color; });
    return palette;
}

function calculateMinimumLuma(colorArr) {
    let minLuma = 255;
    colorArr.forEach(color => {
        var c = color.substring(1);      // strip #
        var rgb = parseInt(c, 16);   // convert rrggbb to decimal
        var r = (rgb >> 16) & 0xff;  // extract red
        var g = (rgb >> 8) & 0xff;  // extract green
        var b = (rgb >> 0) & 0xff;  // extract blue

        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        minLuma = Math.min(minLuma, luma);
    });
    return minLuma;
}

function calculateLumaRange(colorArr) {
    let maxLuma = 0;
    let minLuma = 255;
    colorArr.forEach(color => {
        var c = color.substring(1);      // strip #
        var rgb = parseInt(c, 16);   // convert rrggbb to decimal
        var r = (rgb >> 16) & 0xff;  // extract red
        var g = (rgb >> 8) & 0xff;  // extract green
        var b = (rgb >> 0) & 0xff;  // extract blue

        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        maxLuma = Math.max(maxLuma, luma);
        minLuma = Math.min(minLuma, luma);
    });
    return maxLuma - minLuma;
}

export { PaletteSelector };