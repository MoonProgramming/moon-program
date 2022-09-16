exports.initPage = (req, res) => {
    res.render('mage_era-immortal', { 
        csrfToken: req.csrfToken()
     });
};