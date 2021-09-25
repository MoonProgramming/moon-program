const express = require('express');
const chalk = require('chalk');
const path = require('path');
const engine = require('ejs-locals');
const indexRouter = require('./routes/index');

/**
 * Create Express server.
 */
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Listening on the default Heroku port
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 5000);


app.use(express.static(path.join(__dirname, 'public')));


// app.get('/', (req, res) => {
//     res.send('Hello World!')
// });

app.use('/', indexRouter);


/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;