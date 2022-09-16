const express = require('express');
const router = express.Router();
const sudokuController = require('../controllers/sudoku-controller.js');
const snakeGameController = require('../controllers/snake-game-controller');

router.get('/sudoku', sudokuController.initPage);
router.get('/snake-game', snakeGameController.initPage);

module.exports = router;