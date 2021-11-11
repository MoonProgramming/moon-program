const express = require('express');
const router = express.Router();
const newNftProjectController = require('../controllers/new-nft-controller');

router.get('/', newNftProjectController.initPage);
router.post('/genAttr', newNftProjectController.postGenAttr);
router.get('/meta/:tokenId', newNftProjectController.showMeta);
router.get('/asset/:tokenId', newNftProjectController.getAsset);
router.get('/asset/full/:tokenId', newNftProjectController.showFull);
router.get('/img/:tokenId', newNftProjectController.showImg);
router.post('/img/:tokenId', newNftProjectController.postImg);

module.exports = router;