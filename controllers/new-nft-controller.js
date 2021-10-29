const { ethers } = require("ethers");
const contract = require('../utils/contracts');
const alertsUtil = require('../utils/alerts');
const fs = require("fs");
const path = require('path');

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

exports.getToken = async (req, res, next) => {
    try {
        const tokenId = +(req.params.tokenId);
        const tokenHash = await contract.getTokenHash(tokenId);
        let tokenAttributes = [];
        console.log('getToken', tokenHash);
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
            let host = '';
            if (process.env.NODE_ENV === 'production') {
                host = 'https://' + req.headers.host;
            } else {
                host = 'http://' + req.headers.host;
            }
    
            const imagePath = path.join(path.dirname(__dirname), 'public', 'images', 'new-nft', `${tokenId}.png`);
            console.log(imagePath);
            
            console.log('showFull image existed?', fs.existsSync(imagePath));
            let newlyMinted = true;
            if (fs.existsSync(imagePath)) {
                newlyMinted = false;
            } 

            tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
            return res.render('new-nft-full', {
                csrfToken: req.csrfToken(),
                tokenHash: tokenHash,
                tokenAttributes: tokenAttributes,
                newlyMinted: newlyMinted,
                postUrl: host + `/new-nft-project/img/${tokenId}`
            });
        }

    } catch (err) {
        return next(err);
    }
};

// exports.showImg = async (req, res, next) => {
//     try {
//         const tokenId = +(req.params.tokenId);
//         const tokenHash = await contract.getTokenHash(tokenId);
//         let tokenAttributes = [];
//         console.log('showimg', tokenHash);
//         if (tokenHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
//             alertsUtil.addAlert(res, 'danger', 'Token does not exist.');
//             return res.render('new-nft-asset', {
//                 csrfToken: req.csrfToken(),
//                 tokenHash: tokenHash,
//                 tokenAttributes: tokenAttributes
//             });
//         }

//         let host = '';
//         if (process.env.NODE_ENV === 'production') {
//             host = 'https://' + req.headers.host;
//         } else {
//             host = 'http://' + req.headers.host;
//         }

//         const imagePath = path.join(path.dirname(__dirname), 'public', 'images', 'new-nft', `${tokenId}.png`);
//         console.log(imagePath);
        
//         console.log(fs.existsSync(imagePath));
//         if (fs.existsSync(imagePath)) {
//             res.setHeader("Content-Type", "image/png");
//             return res.redirect(host + `/images/new-nft/${tokenId}.png`);
//         } else {

//             tokenAttributes = contract.genTokenAttributesFromHash(tokenHash);
//             return res.render('new-nft-showImg', {
//                 csrfToken: req.csrfToken(),
//                 tokenHash: tokenHash,
//                 tokenAttributes: tokenAttributes,
//                 postUrl: host + `/new-nft-project/img/${tokenId}`
//             });
//         }


//     } catch (err) {
//         return next(err);
//     }
// }

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

        const imagePath = path.join(path.dirname(__dirname), 'public', 'images', 'new-nft', `${tokenId}.png`);
        console.log(imagePath);

        const body = req.body;
        let imageData = body[0].imageData;
        var data = imageData.replace(`data:image/octet-stream;base64,`, "");
        var buf = Buffer.from(data, 'base64');
        fs.writeFile(imagePath, buf, (() => {
            console.log('Image generated successfully.');
            const loginResponse = {
                success: true,
                alerts: res.locals.alerts
            }
            return res.send(loginResponse);
        }));
    } catch (err) {
        return next(err);
    }
}