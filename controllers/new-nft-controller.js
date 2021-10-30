const { ethers } = require("ethers");
const contract = require('../utils/contracts');
const alertsUtil = require('../utils/alerts');
const fs = require("fs");
const path = require('path');
const { NftPreviewImg } = require('../models/nftPreviewImg');

exports.initPage = async (req, res, next) => {
    try {
        const mintPrice = await contract.getNftPrice();
        res.render('new-nft-project', {
            csrfToken: req.csrfToken(),
            contractAddress: contract.contractAddress,
            contractAbi: contract.abi,
            mintPrice: mintPrice,
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
        let tokenAttributes = [];
        console.log('getAsset', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            alertsUtil.addAlert(res, 'danger', 'Token does not exist.');
        } else {
            tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
        }

        res.render('new-nft-asset', {
            csrfToken: req.csrfToken(),
            tokenHash: tokenHash,
            tokenAttributes: tokenAttributes
        });
    } catch (err) {
        return next(err);
    }
};


exports.showMeta = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);
        console.log('showmeta', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            alertsUtil.addAlert(res, 'danger', 'Token does not exist.');
            return res.render('new-nft-asset', {
                csrfToken: req.csrfToken(),
                tokenHash: tokenHash,
            });
        }

        let host = '';
        if (process.env.NODE_ENV === 'production') {
            host = 'https://' + req.headers.host;
        } else {
            host = 'http://' + req.headers.host;
        }
        let tokenMeta = contract.genTokenMetaFromHash(tokenId, tokenHash, host);
        res.setHeader("Content-Type", "application/json");
        return res.send(JSON.stringify(tokenMeta));
    } catch (err) {
        return next(err);
    }
};

exports.showFull = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);
        let tokenAttributes = [];
        console.log('showfull', tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            alertsUtil.addAlert(res, 'danger', 'Token does not exist.');
            return res.render('new-nft-asset', {
                csrfToken: req.csrfToken(),
                tokenHash: tokenHash,
                tokenAttributes: tokenAttributes
            });
        } else {
            let newlyMinted = false;
            NftPreviewImg.findOne(contract.contractAddress, tokenId, (err, result) => {
                if (err) { return next(err); }
                if (!result.length) {
                    newlyMinted = true;
                }
                let host = '';
                if (process.env.NODE_ENV === 'production') {
                    host = 'https://' + req.headers.host;
                } else {
                    host = 'http://' + req.headers.host;
                }
    
                tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
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
        return next(err);
    }
};

exports.showImg = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        let tokenAttributes = [];
        console.log('showImg' + tokenId);

        NftPreviewImg.findOne(contract.contractAddress, tokenId, (err, result) => {
            if (err) { return next(err); }
            if (!result.length) {
                console.log('NftPreviewImg.findOne no result');
                alertsUtil.addAlert(res, 'danger', "Image preview yet to generate.");
                return res.render('new-nft-asset', {
                    csrfToken: req.csrfToken(),
                    tokenHash: '',
                    tokenAttributes: tokenAttributes
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
        return next(err);
    }
}

exports.postImg = async (req, res, next) => {
    try {
        console.log('post received');
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);
        let tokenAttributes = [];
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            alertsUtil.addAlert(res, 'danger', 'Token does not exist.');
            return res.render('new-nft-asset', {
                csrfToken: req.csrfToken(),
                tokenHash: tokenHash,
                tokenAttributes: tokenAttributes
            });
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
        return next(err);
    }
}