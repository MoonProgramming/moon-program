const { User } = require('../models/user');
const alertsUtil = require('../utils/alerts');
const validator = require('validator');
const bcrypt = require('bcrypt');

exports.postLogin = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!validator.isEmail(email) || !validator.isLength(email, { min: 3, max: 100 }))
        alertsUtil.addAlert(res, 'danger', 'Incorrect email address.');
    if (!validator.isLength(password, { min: 8, max: 40 }))
        alertsUtil.addAlert(res, 'danger', 'Incorrect password.');

    if (alertsUtil.isNotEmpty(res)) {
        const loginResponse = {
            success: false,
            alerts: res.locals.alerts
        }
        return res.send(loginResponse);
    }

    User.findOne(email, (err, result) => {
        if (err) { return next(err); }
        if (!result.length) {
            alertsUtil.addAlert(res, 'danger', 'Account doesn\'t exist.');
            const loginResponse = {
                success: false,
                alerts: res.locals.alerts
            }
            return res.send(loginResponse);
        }

        const hashedPassword = result[0].password;
        bcrypt.compare(password, hashedPassword, (err, same) => {
            if (err) { return next(err); }
            if (!same) {
                alertsUtil.addAlert(res, 'danger', 'Incorrect password.');
                const loginResponse = {
                    success: false,
                    alerts: res.locals.alerts
                }
                return res.send(loginResponse);
            }
            // login user
            // req.logIn(user, (err) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.redirect('/');
            // });
            
            const host = req.headers.host;
            const referer = req.headers.referer;
            const pageName = referer.split(host + '/')[1];
            const loginResponse = {
                success: true,
                alerts: res.locals.alerts,
                pageName: pageName
            }
            return res.send(loginResponse);
        })
    })
}