/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const path = require('path');
const engine = require('ejs-locals');
const cookieParser = require('cookie-parser')
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const sudokuRouter = require('./routes/sudoku');
const cryptoBlocksRouter = require('./routes/crypto-blocks');
const newNftProjectRouter = require('./routes/new-nft-project');
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

// helmet config
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    'https://code.jquery.com',
                    'https://cdnjs.cloudflare.com',
                    'https://stackpath.bootstrapcdn.com',
                    'https://unpkg.com',
                    "'unsafe-eval'",
                    "'unsafe-inline'"
                ],
                styleSrc: [
                    "'self'",
                    'https://stackpath.bootstrapcdn.com',
                    "'unsafe-inline'"
                ],
                imgSrc: [
                    "'self'",
                    'data:'
                ],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'self'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'self'"],
                frameAncestors: [
                    "'self'",
                    'https://testnets.opensea.io',
                    'https://opensea.io',
                ],
            },
        },
    })
);

/** 
 * Basic rate-limiting middleware for Express.
 * Enable trust proxy if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
 * see https://expressjs.com/en/guide/behind-proxies.html
 */
app.set('trust proxy', 1);
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 300 // limit each IP to 300 requests per windowMs
});

app.use(limiter);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded());
app.use(csrfProtection);

// set incoming request
app.use(function (req, res, next) {
    req.user = null;
    if (req.cookies) {
        try {
            const token = req.cookies.auth_token;
            if (token)
                req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            res.clearCookie('auth_token');
            console.error(err);
        }
    }
    res.locals.pageName = req.path.split('/')[1];
    res.locals.user = req.user;
    res.locals.alerts = [];
    next();
});

// Routes
app.use('/', indexRouter);
app.use('/sudoku', sudokuRouter);
app.use('/crypto-blocks', cryptoBlocksRouter);
app.use('/new-nft-project', newNftProjectRouter);
app.use('/acct', acctRouter);


/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

// error handling
// catch 404 and forward to error handler
app.use(function (req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.render('error');
});

module.exports = app;