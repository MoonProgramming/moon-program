const palettes = require('nice-color-palettes/1000');

exports.initPage = (req, res) => {
    res.render('domain-warping', { 
        csrfToken: req.csrfToken(),
        palettes: palettes
     });
};