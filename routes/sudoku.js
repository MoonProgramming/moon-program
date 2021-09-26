var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('sudoku', req.ejbProperties);
});

module.exports = router;