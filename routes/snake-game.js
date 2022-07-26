const express = require('express');
const router = express.Router();
const snakeGameController = require('../controllers/snake-game-controller');

router.get('/', snakeGameController.initPage);

module.exports = router;