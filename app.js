const express = require('express');
const chalk = require('chalk');
const path = require('path');
const engine = require('ejs-locals');

const indexRouter = require('./routes/index');
const sudokuRouter = require('./routes/sudoku');
const cryptoBlocksRouter = require('./routes/crypto-blocks');

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

// page ejbProperties
app.use(function(req, res, next){
    const ejbProperties = {
        pageName: req.path.split('/')[1],
    }
    console.log(ejbProperties);
    req.ejbProperties = ejbProperties;
    next();
});

app.use('/', indexRouter);
app.use('/sudoku', sudokuRouter);
app.use('/crypto-blocks', cryptoBlocksRouter);

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