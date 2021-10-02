const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login-controller.js');
const signupController = require('../controllers/signup-controller.js');

router.post('/signin', loginController.postLogin);
router.get('/signout', loginController.getLogout);
router.get('/signup', signupController.initPage);
router.post('/signup', signupController.postSignup);

module.exports = router;