const express = require('express');
const router = express.Router();
const furOutController = require('../controllers/fur-out-controller');
const flowFieldController = require('../controllers/flow-field-controller');
const canvasParanoiaController = require('../controllers/canvas-paranoia-controller');
const emojiScreamController = require('../controllers/emoji-scream-controller');
const domainWarpingController = require('../controllers/domain-warping-controller');

router.get('/fur-out', furOutController.initPage);
router.get('/flow-field', flowFieldController.initPage);
router.get('/canvas-paranoia', canvasParanoiaController.initPage);
router.get('/emoji-scream', emojiScreamController.initPage);
router.get('/domain-warping', domainWarpingController.initPage);

module.exports = router;