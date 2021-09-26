var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('crypto-blocks', req.ejbProperties);
});

module.exports = router;