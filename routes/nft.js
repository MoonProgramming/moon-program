const express = require('express');
const router = express.Router();
const cryptoBlocksController = require('../controllers/crypto-blocks-controller');

router.get('/crypto-blocks', cryptoBlocksController.initPage);

module.exports = router;