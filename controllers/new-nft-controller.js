const { ethers } = require("ethers");
const contract = require('../utils/contracts');
const alertsUtil = require('../utils/alerts');

exports.initPage = async (req, res, next) => {
    try {
        const mintPrice = await contract.getNftPrice();
        res.render('new-nft-project', { 
            csrfToken: req.csrfToken(),
            contractAddress: contract.contractAddress,
            contractAbi : contract.abi,
            mintPrice: mintPrice,
            currency: contract.currency,
        });
    } catch (err) {
        return next(err);
    }
};

exports.getToken = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);
        let tokenAttributes = [];
        console.log(tokenHash);
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
        console.log(tokenHash);
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
        console.log(tokenHash);
        if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            alertsUtil.addAlert(res, 'danger', 'Token does not exist.');
            return res.render('new-nft-asset', { 
                csrfToken: req.csrfToken(),
                tokenHash: tokenHash,
                tokenAttributes: tokenAttributes
            });
        } else {
            tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
            return res.render('new-nft-full', { 
                // csrfToken: req.csrfToken(),
                tokenHash: tokenHash,
                tokenAttributes: tokenAttributes
            });
        }

    } catch (err) {
        return next(err);
    }
};