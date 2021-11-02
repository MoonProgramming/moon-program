const contract = require('../utils/contracts');
const alertsUtil = require('../utils/alerts');
const { NftPreviewImg } = require('../models/nftPreviewImg');

exports.initPage = async (req, res, next) => {
    try {
        const mintPrice = await contract.getNftPrice();
        const totalSupply = await contract.getTotalSupply();
        res.render('new-nft-project', {
            csrfToken: req.csrfToken(),
            contractAddress: contract.contractAddress,
            contractAbi: contract.abi,
            mintPrice: mintPrice,
            totalSupply: totalSupply,
            currency: contract.currency,
        });
    } catch (err) {
        return next(err);
    }
};

exports.getAsset = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);
        console.log('getAsset', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            throw new Error('Token does not exist.');
        }
        const owner = await contract.getOwner(tokenId);
        const host = getHost(req);
        const tokenMeta = contract.genTokenMetaFromHash(tokenId, tokenHash, host);

        res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: owner,
            tokenMeta: tokenMeta
        });
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            tokenMeta: {}
        });
    }

};


exports.showMeta = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);
        console.log('showMeta', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            throw new Error('Token does not exist.');
        }

        const host = getHost(req);
        const tokenMeta = contract.genTokenMetaFromHash(tokenId, tokenHash, host);
        res.setHeader("Content-Type", "application/json");
        return res.send(JSON.stringify(tokenMeta));
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            tokenMeta: {}
        });
    }
};

exports.showFull = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
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

                const host = getHost(req);
                const tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
                return res.render('new-nft-full', {
                    csrfToken: req.csrfToken(),
                    tokenHash: tokenHash,
                    tokenAttributes: tokenAttributes,
                    newlyMinted: newlyMinted,
                    postUrl: host + `/new-nft-project/img/${tokenId}`
                });
            });
        }
    } catch (err) {
        alertsUtil.addAlert(res, 'danger', err.message);
        return res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            owner: '',
            tokenMeta: {}
        });
    }
};

exports.showImg = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        console.log('showImg' + tokenId);

        NftPreviewImg.findOne(contract.contractAddress, tokenId, (err, result) => {
            if (err || !result.length) {
                if (err) { alertsUtil.addAlert(res, 'danger', err.message); }
                else if (!result.length) { alertsUtil.addAlert(res, 'danger', 'Image preview yet to generate.'); }
                
                return res.render('new-nft-asset', {
                    csrfToken: req.csrfToken(),
                    owner: '',
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
            tokenMeta: {}
        });
    }
}

exports.postImg = async (req, res, next) => {
    try {
        console.log('post received');
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);

        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            throw new Error('Token does not exist.');
        }
        const body = req.body;
        let imageData = body[0].imageData;
        console.log(imageData.length);

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
            tokenMeta: {}
        });
    }
}

function getHost(req) {
    let host = 'http://' + req.headers.host;
    if (process.env.NODE_ENV === 'production') {
        host = 'https://' + req.headers.host;
    }
    return host;
}