const { User } = require('../models/user');
const alertsUtil = require('../utils/alerts');
const validator = require('validator');

/**
 * GET /signup
 * Signup page.
 */
exports.initPage = (req, res) => {
    res.render('signup', { csrfToken: req.csrfToken() });
};

/**
 * POST /signup
 * Create a new account.
 */
exports.postSignup = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;

    if (!validator.isEmail(email) || !validator.isLength(email, { min: 3, max: 100 }))
        alertsUtil.addAlert(res, 'danger', 'Please enter a valid email address.');
    if (!validator.isLength(password, { min: 8, max: 40 }))
        alertsUtil.addAlert(res, 'danger', 'Password must be 8-40 characters long');
    if (password !== confirmPassword)
        alertsUtil.addAlert(res, 'danger', 'Passwords do not match');

    if (alertsUtil.isNotEmpty(res)) {
        return res.render('signup', { csrfToken: req.csrfToken() });
    }
    email = validator.normalizeEmail(email, { gmail_remove_dots: false });

    const user = new User();
    user.email = email;
    user.password = password;

    user.validateAndSave((err, result) => {
        if (err) {
            return next(err);
        }
        alertsUtil.addAlert(res, result.status, result.message);
        return res.render('signup', { csrfToken: req.csrfToken() });
    })
}