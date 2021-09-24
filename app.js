const express = require('express');
const chalk = require('chalk');

/**
 * Create Express server.
 */
const app = express();

// Start the app by listening on the default Heroku port
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 5000);

app.get('/', (req, res) => {
    res.send('Hello World!')
});


/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;