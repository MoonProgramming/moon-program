const {User} = require('../models/user');

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('signup', {
        title: 'Create Account'
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
// exports.postSignup = (req, res, next) => {
//     console.log('postSignup called');
//     res.render('signup');
// }
exports.postSignup = (req, res, next) => {
//     const validationErrors = [];
//     if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
//     if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' });
//     if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' });

//     if (validationErrors.length) {
//         req.flash('errors', validationErrors);
//         return res.redirect('/signup');
//     }
//     req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
    
    const user = new User();
    user.email = req.body.email;
    user.password = req.body.password
    console.log('user', user);

    // User.findOne(user.email, (err, existingUser, huh) => {
    //     console.log('tell me why ',err, existingUser, huh);
    // });

    User.findOne(user.email, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            res.locals.alerts = [{
                status: 'danger',
                message: 'Account with that email address already exists.'
            }];
            res.locals.alerts.push({
                status: 'success',
                message: 'Account succesfully created.'
            })
            // req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.render('signup');
        }
        // user.save((err) => {
        //     if (err) { return next(err); }
        //     req.logIn(user, (err) => {
        //         if (err) {
        //             return next(err);
        //         }
        //         res.redirect('/');
        //     });
        // });
        console.log('User.findOne complete ');
    });
};