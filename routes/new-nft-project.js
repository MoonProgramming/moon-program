const express = require('express');
const router = express.Router();
const newNftProjectController = require('../controllers/new-nft-controller');

router.get('/', newNftProjectController.initPage);
router.get('/asset/:tokenId', newNftProjectController.getToken);
router.get('/meta/:tokenId', newNftProjectController.showMeta);
router.get('/asset/full/:tokenId', newNftProjectController.showFull);

module.exports = router;