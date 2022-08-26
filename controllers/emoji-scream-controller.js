exports.initPage = (req, res) => {
    res.render('emoji-scream', { 
        csrfToken: req.csrfToken()
     });
};