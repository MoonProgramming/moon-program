var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    // if (!req.user) return next();
    res.render('index', { csrfToken: req.csrfToken() });
});

module.exports = router;