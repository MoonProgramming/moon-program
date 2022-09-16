exports.initPage = (req, res) => {
    res.render('moon-spacestation', { 
        csrfToken: req.csrfToken()
     });
};