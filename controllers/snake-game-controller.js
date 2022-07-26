exports.initPage = (req, res) => {
    res.render('snake-game', { csrfToken: req.csrfToken() });
};