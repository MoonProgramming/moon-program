exports.initPage = (req, res) => {
    res.render('flow-field', { csrfToken: req.csrfToken() });
};