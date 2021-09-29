const express = require('express');
const router = express.Router();
const sudokuController = require('../controllers/sudoku-controller.js');

router.get('/', sudokuController.getSudoku);

module.exports = router;