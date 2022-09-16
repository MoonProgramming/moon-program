const express = require('express');
const router = express.Router();
const immortalController = require('../controllers/mage_era-immortal-controller');
const spaceStationController = require('../controllers/moon-spacestation-controller');
const negativeEffectController = require('../controllers/moon-negativeeffect-controller');

router.get('/mage_era-immortal', immortalController.initPage);
router.get('/moon-spacestation', spaceStationController.initPage);
router.get('/moon-negativeeffect', negativeEffectController.initPage);

module.exports = router;