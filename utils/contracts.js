const { ethers } = require("ethers");

const contractAddress = '0x15a30c07976003f7AE3889D52dc5BFbaEdf38975';
const currency = 'ETH';
const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint)",
    "function tokenByIndex(uint) view returns (uint)",
    "function balanceOf(address) view returns (uint)",
    "function tokenOfOwnerByIndex(address owner, uint index) view returns (uint)",
    "function tokenIdToHash(uint) view returns (bytes32)",
    "function getNFTPrice() view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",
    "function mintAndRefundExcess(uint) payable",

    // event triggered
    "event Transfer(address indexed from, address indexed to, uint amount)",
    "event NewTokenHash(uint256 indexed tokenId, bytes32 tokenHash)"
];

let contract = null;
exports.getContract = () => {
    if (contract == null) {
        const network = ethers.providers.getNetwork("rinkeby");
        const provider = ethers.getDefaultProvider(network);
        contract = new ethers.Contract(contractAddress, abi, provider);
        console.log('new contract connection to ' + network.name);
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

exports.getTokenHash = (tokenId) => {
    const result = this.getContract().tokenIdToHash(tokenId);
    return result;
}

exports.genTokenMetaFromHash = (tokenId, tokenHash, host) => {
    const attributes = this.genTokenAttributesFromHash(tokenHash);
    const mainPage = host + '/new-nft-project';
    const assetPage = host + `/new-nft-project/asset/${tokenId}`;
    const imagePage = host + `/images/new-nft/${tokenId}.png`;
    const animationPage = mainPage + `/asset/full/${tokenId}`;;
    const tokenMeta = {
        "collection_name": "New NFT",
        "website": mainPage,
        "artist": "Moon",
        "id": tokenId,
        "name": "New-NFT #" + tokenId,
        "tokenHash": tokenHash,
        "description": "New NFT project that going to be awesome.\n\n[Interactive](" + assetPage + ")\n\n[Website](" + mainPage + ")\n\nLicense: MIT\n\ntokenHash: " + tokenHash,
        "external_url": assetPage,
        "image": imagePage,
        "animation_url": animationPage,
        "attributes": attributes
    }
    return tokenMeta;
}

exports.genTokenAttributesFromHash = (tokenHash) => {
    let attributes = [];
    let hashPairs = [];
    for (let j = 0; j < 32; j++)
        hashPairs.push(tokenHash.slice(2 + 2 * j, 4 + 2 * j));
    let rawParams = hashPairs.map(x => parseInt(x, 16));

    let color = { "trait_type": "Color", "value": rawParams[0] < 190? "common" : "rare" };
    attributes.push(color);
    let shape = { "trait_type": "Shape", "value": rawParams[1] };
    attributes.push(shape);
    let sound = { "display_type": "number", "trait_type": "Sound", "value": rawParams[2] };
    attributes.push(sound);
    let emotion = { "display_type": "boost_number", "trait_type": "Emotion", "value": rawParams[3] };
    attributes.push(emotion);

    return attributes;
}

exports.contractAddress = contractAddress;
exports.abi = abi;
exports.currency = currency;