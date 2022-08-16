const express = require('express');
const router = express.Router();
const flowFieldController = require('../controllers/flow-field-controller');

router.get('/', flowFieldController.initPage);

module.exports = router;