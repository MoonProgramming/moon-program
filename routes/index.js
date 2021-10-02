var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { csrfToken: req.csrfToken() });
});

module.exports = router;