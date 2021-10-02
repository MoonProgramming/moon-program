const { User } = require('../models/user');
const alertsUtil = require('../utils/alerts');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

            // login user (create and assign token)
            const payload = {
                userId: result[0].id,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            res.cookie('auth-token', token, { httpOnly: true, secure: true, maxAge: 60*60*1000 });
            const loginResponse = {
                success: true,
                alerts: res.locals.alerts
            }
            
            return res.send(loginResponse);
        })
    })
}

exports.getLogout = (req, res, next) => {
    req.user = null;
    res.clearCookie('auth-token');
    return res.redirect('/');
}