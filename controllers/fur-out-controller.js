exports.initPage = (req, res) => {
    res.render('fur-out', { csrfToken: req.csrfToken() });
};