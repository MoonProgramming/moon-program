const express = require('express');
const router = express.Router();
const sudokuController = require('../controllers/sudoku-controller.js');

router.get('/', sudokuController.initPage);

module.exports = router;