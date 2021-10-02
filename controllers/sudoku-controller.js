/**
 * GET /sudoku
 * Sudoku page.
 */
exports.initPage = (req, res) => {
    res.render('sudoku', { csrfToken: req.csrfToken() });
};