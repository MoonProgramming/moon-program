/**
 * GET /crypto-blocks
 * Crypto-blocks page.
 */
 exports.initPage = (req, res) => {
    res.render('crypto-blocks', { csrfToken: req.csrfToken() });
};