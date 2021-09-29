const express = require('express');
const router = express.Router();
const signupController = require('../controllers/signup-controller.js');

router.get('/', signupController.initPage);
router.post('/', signupController.postSignup);

module.exports = router;