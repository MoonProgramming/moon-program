const express = require('express');
const router = express.Router();
const canvasParanoiaController = require('../controllers/canvas-paranoia-controller');

router.get('/', canvasParanoiaController.initPage);

module.exports = router;