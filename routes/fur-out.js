const express = require('express');
const router = express.Router();
const furOutController = require('../controllers/fur-out-controller');

router.get('/', furOutController.initPage);

module.exports = router;