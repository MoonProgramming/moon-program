const { ethers } = require("ethers");
const Chance = require('chance');
const colors = require('nice-color-palettes');
const { abi } = require('./skylines-end-abi');

const projectName = `Heading For Skyline's End`;
const projectPath = `skylines-end`;
const contractAddress = '0x14De0ceeb43bdfc57eeE84Fb3Ed4d5f5f797EEe2';
const chainName = "Polygon Testnet Mumbai";
const chainId = '0x13881';
const currency = 'matic';
const rpcUrl = 'https://rpc-mumbai.maticvigil.com/v1/'+process.env.RPC_KEY;

let contract = null;
exports.getContract = () => {
    if (contract == null) {
        // const network = ethers.providers.getNetwork(networkId);
        // const provider = ethers.getDefaultProvider(network);
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        contract = new ethers.Contract(contractAddress, abi, provider);
        console.log('new contract connection to ' + chainName);
        return contract;
    } else {
        return contract;
    }
}

exports.getNftPrice = async () => {
    const result = await this.getContract().getNFTPrice();
    const nftPrice = ethers.utils.formatEther(result);
    return nftPrice;
}

exports.getTotalSupply = async () => {
    const result = await this.getContract().totalSupply();
    return result.toNumber();
}

exports.getTokenIdByIndex = async (index) => {
    const result = await this.getContract().tokenByIndex(index);
    return result.toNumber();
}

exports.getTokenHash = (tokenId) => {
    const result = this.getContract().tokenIdToHash(tokenId);
    return result;
}

exports.getOwner = (tokenId) => {
    const result = this.getContract().ownerOf(tokenId);
    return result;
}

exports.genTokenMetaFromHash = (tokenId, tokenHash, url) => {
    const attributes = this.genTokenAttributesFromHash(tokenHash);
    const assetPage = url + `/asset/${tokenId}`;
    const imagePage = url + `/img/${tokenId}`;
    const animationPage = url + `/asset/full/${tokenId}`;;
    const tokenMeta = {
        "collection_name": "Heading For Skyline's End",
        "website": url,
        "artistName": "Moon",
        "artistEmail": "moon.programming@gmail.com",
        "contract": contractAddress,
        "id": tokenId,
        "name": "Heading For Skyline's End #" + tokenId,
        "tokenHash": tokenHash,
        "description": "New NFT project that going to be awesome. Click the picture to start/pause your journey.\n\n[Interactive](" + assetPage + ")\n\n[Website](" + url + ")\n\nLicense: MIT\n\ntokenHash: " + tokenHash,
        "external_url": assetPage,
        "image": imagePage,
        "animation_url": animationPage,
        "opensea_url": `https://testnets.opensea.io/assets/${contractAddress}/${tokenId}`,
        "attributes": attributes
    }
    return tokenMeta;
}

exports.genTokenAttributesFromHash = (tokenHash) => {

    let distance = Math.ceil(Math.random() * 100); //random
    let yFactor = Math.ceil(Math.random() * 10); //random
    let width = Math.ceil(Math.random() * 100); //random
    let height = Math.ceil(Math.random() * 100); //random
    let direction = Math.ceil(Math.random() * 100); //random
    let shear = Math.ceil(Math.random() * 100); //random
    let paletteIndex = Math.floor(Math.random() * colors.length); //random

    if (tokenHash) {
        console.log('gen attr with Hash!');
        let hash = tokenHash;
        if (tokenHash.startsWith('0x')) {
            hash = tokenHash.substr(2);
        }

        let randomAttrCount = 7;
        let charLength = Math.ceil(hash.length / randomAttrCount); //min = 1
        let seedIndex = 0;
        let seedArray = [];
        for (let i = 0; i < randomAttrCount; i++) {
            let seed = hash.substr(seedIndex, charLength);
            seedArray.push(seed);

            seedIndex += charLength;
            if (seedIndex >= hash.length)
                seedIndex = 0;
        }
        console.log('seedArray', seedArray);
        let chance = new Chance(seedArray[0]);
        distance = chance.integer({ min: 1, max: 100 });
        chance = new Chance(seedArray[1]);
        yFactor = chance.integer({ min: 1, max: 10 }); //random
        chance = new Chance(seedArray[2]);
        width = chance.integer({ min: 1, max: 100 }); //random
        chance = new Chance(seedArray[3]);
        height = chance.integer({ min: 1, max: 100 }); //random
        chance = new Chance(seedArray[4]);
        direction = chance.integer({ min: 1, max: 100 }); //random
        chance = new Chance(seedArray[5]);
        shear = chance.integer({ min: 1, max: 100 }); //random
        chance = new Chance(seedArray[6]);
        paletteIndex = chance.integer({ min: 0, max: colors.length - 1 }); //random
    }

    console.log(distance, yFactor, width, height, direction, shear, paletteIndex);
    
    let attributes = [];
    attributes.push({ "display_type": "boost_percentage", "trait_type": "Distance", "value": distance });
    attributes.push({ "trait_type": "Y-Factor", "value": yFactor, "max_value": 10 });
    attributes.push({ "display_type": "boost_percentage", "trait_type": "Width", "value": width });
    attributes.push({ "display_type": "boost_percentage", "trait_type": "Height", "value": height });
    let shearDirection = direction < 60 ? "Parallel" : direction > 80 ? "Downhill" : "Uphill";
    attributes.push({ "trait_type": "Shear Direction", "value": shearDirection });
    if (shearDirection !== "Parallel")
        attributes.push({ "display_type": "boost_percentage", "trait_type": "Shear", "value": shear });
    let colorArr = colors[paletteIndex];
    let palette = rearrangePaletteByBrightness(colorArr);
    for (let i = 0; i < palette.length; i++) {
        let color = { "trait_type": "Color" + i, "value": palette[i] };
        attributes.push(color);
    }
    console.log(palette);

    return attributes;
}

function rearrangePaletteByBrightness(colorArr) {
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

exports.projectName = projectName;
exports.projectPath = projectPath;
exports.contractAddress = contractAddress;
exports.abi = abi;
exports.chainId = chainId;
exports.currency = currency;