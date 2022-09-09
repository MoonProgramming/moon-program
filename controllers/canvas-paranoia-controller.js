exports.initPage = (req, res) => {
    res.render('canvas-paranoia', { 
        csrfToken: req.csrfToken()
     });
};