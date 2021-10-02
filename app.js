/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
require('dotenv').config();

const express = require('express');
const chalk = require('chalk');
const path = require('path');
const engine = require('ejs-locals');
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const sudokuRouter = require('./routes/sudoku');
const cryptoBlocksRouter = require('./routes/crypto-blocks');
const acctRouter = require('./routes/acct');


/**
 * Create Express server.
 */
const app = express();

// Listening on the default Heroku port
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 5000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded());

// set pageName to local
app.use(function (req, res, next) {
    const header = req.headers;
    console.log('referer', header.referer);
    if (header.cookie) {
        token = header.cookie.split('auth-token=')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    }
    console.log('req.user', req.user)
    res.locals.pageName = req.path.split('/')[1];
    res.locals.user = req.user;
    res.locals.alerts = [];
    next();
});

app.use('/', indexRouter);
app.use('/sudoku', sudokuRouter);
app.use('/crypto-blocks', cryptoBlocksRouter);
app.use('/acct', acctRouter);

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

// error handling
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.render('error');
});

module.exports = app;