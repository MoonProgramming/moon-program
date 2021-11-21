const alertsUtil = require('../utils/alerts');
const { NftPreviewImg } = require('../models/nftPreviewImg');

exports.initPage = async (req, res, next) => {
    try {
        let projectPath = req.originalUrl.split('/')[1];
        let contract = require(`../utils/contracts/` + projectPath);
        const mintPrice = await contract.getNftPrice();
        const totalSupply = await contract.getTotalSupply();
        const maxSupply = await contract.getMaxSupply();

        let descriptionPoint = Array.from(contract.descriptionPoint);
        if (totalSupply < maxSupply) descriptionPoint.push(`Maximum supply is ${maxSupply}, minting is still available.`);
        else descriptionPoint.push(`Collection sold out.`);

        // let tokenHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
        let tokenHash = '';
        const tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
        let url = req.protocol + '://' + req.headers.host + req.originalUrl;
        
        res.render('new-nft-project', {
            csrfToken: req.csrfToken(),
            projectName: contract.projectName,
            contractAddress: contract.contractAddress,
            contractAbi: contract.abi,
            descriptionPoint: descriptionPoint,
            mintPrice: mintPrice,
            totalSupply: totalSupply,
            chainId: contract.chainId,
            currency: contract.currency,
            tokenHash: tokenHash,
            tokenAttributes: tokenAttributes,
            projectPath: projectPath,
            genAttrUrl: url + `/genAttr`,
            openseaCollectionUrl: contract.openseaCollectionUrl,
            openseaAssetUrl: contract.openseaAssetUrl,
        });
    } catch (err) {
        return next(err);
    }
};

exports.postGenAttr = async (req, res, next) => {
    console.log('postGenAttr');
    const projectPath = req.originalUrl.split('/')[1];
    const contract = require(`../utils/contracts/` + projectPath);
    const tokenAttributes = contract.genTokenAttributesFromHash(null);
    return res.send(tokenAttributes);
}

exports.getAsset = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const projectPath = req.originalUrl.split('/')[1];
        const contract = require(`../utils/contracts/` + projectPath);
        const tokenHash = await contract.getTokenHash(tokenId);
        console.log('getAsset', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            throw new Error('Token does not exist.');
        }
        const owner = await contract.getOwner(tokenId);
        let url = req.protocol + '://' + req.headers.host + '/' + projectPath;
        const tokenMeta = contract.genTokenMetaFromHash(tokenId, tokenHash, url);

        res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: owner,
            blockExplorerUrls: contract.blockExplorerUrls,
            tokenMeta: tokenMeta
        });
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            blockExplorerUrls: '',
            tokenMeta: {}
        });
    }

};


exports.showMeta = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const projectPath = req.originalUrl.split('/')[1];
        const contract = require(`../utils/contracts/` + projectPath);
        const tokenHash = await contract.getTokenHash(tokenId);
        console.log('showMeta', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            throw new Error('Token does not exist.');
        }

        let url = req.protocol + '://' + req.headers.host + '/' + projectPath;
        const tokenMeta = contract.genTokenMetaFromHash(tokenId, tokenHash, url);
        res.setHeader("Content-Type", "application/json");
        return res.send(JSON.stringify(tokenMeta));
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            blockExplorerUrls: '',
            tokenMeta: {}
        });
    }
};

exports.showFull = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const projectPath = req.originalUrl.split('/')[1];
        const contract = require(`../utils/contracts/` + projectPath);
        const tokenHash = await contract.getTokenHash(tokenId);

        console.log('showfull', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            throw new Error('Token does not exist.');
        } else {
            let newlyMinted = false;
            NftPreviewImg.findOne(contract.contractAddress, tokenId, (err, result) => {
                if (err) { return next(err); }
                if (!result.length) {
                    newlyMinted = true;
                }

                let url = req.protocol + '://' + req.headers.host + '/' + projectPath;
                const tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
                return res.render('new-nft-full', {
                    csrfToken: req.csrfToken(),
                    tokenHash: tokenHash,
                    tokenAttributes: tokenAttributes,
                    newlyMinted: newlyMinted,
                    postUrl: url + `/img/${tokenId}`
                });
            });
        }
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            blockExplorerUrls: '',
            tokenMeta: {}
        });
    }
};

exports.showImg = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const projectPath = req.originalUrl.split('/')[1];
        const contract = require(`../utils/contracts/` + projectPath);

        NftPreviewImg.findOne(contract.contractAddress, tokenId, (err, result) => {
            if (err || !result.length) {
                if (err) { alertsUtil.addAlert(res, 'danger', err.message); }
                else if (!result.length) { alertsUtil.addAlert(res, 'danger', 'Image preview yet to generate.'); }
                
                return res.render('new-nft-asset', {
                    csrfToken: req.csrfToken(),
                    owner: '',
                    blockExplorerUrls: '',
                    tokenMeta: {}
                });
            }

            const imgData = result[0].img_data;
            var data = imgData.replace(`data:image/octet-stream;base64,`, "");
            var buf = Buffer.from(data, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': buf.length
            });
            res.end(buf);
        });
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            blockExplorerUrls: '',
            tokenMeta: {}
        });
    }
}

exports.postImg = async (req, res, next) => {
    try {
        console.log('post received');
        const tokenId = +(req.params.tokenId);
        const projectPath = req.originalUrl.split('/')[1];
        const contract = require(`../utils/contracts/` + projectPath);
        const tokenHash = await contract.getTokenHash(tokenId);

        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            throw new Error('Token does not exist.');
        }
        const body = req.body;
        let imageData = body[0].imageData;

        const nftPreviewImg = new NftPreviewImg();
        nftPreviewImg.projectName = contract.projectName;
        nftPreviewImg.contractHash = contract.contractAddress;
        nftPreviewImg.tokenId = tokenId;
        nftPreviewImg.imgData = imageData;

        nftPreviewImg.save((err, result) => {
            if (err) {
                return next(err);
            }
            return res.send('image saved.');
        });
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            blockExplorerUrls: '',
            tokenMeta: {}
        });
    }
}