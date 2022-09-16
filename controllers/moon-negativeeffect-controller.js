exports.initPage = (req, res) => {
    res.render('moon-negativeeffect', { 
        csrfToken: req.csrfToken()
     });
};