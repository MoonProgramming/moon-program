exports.initPage = (req, res) => {
    res.render('domain-warping', { 
        csrfToken: req.csrfToken()
     });
};