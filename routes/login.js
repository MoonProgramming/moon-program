const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login-controller.js');

router.post('/', loginController.postLogin);

module.exports = router;