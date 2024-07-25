var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var mysql = require('mysql2');
var { env } = require('process');
var xss = require('xss-clean');
var nodemailer = require('nodemailer');

var usersRouter = require('./routes/users');
var branchesRouter = require('./routes/branches');
var eventsRouter = require('./routes/events');
var loginRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var emailRouter = require('./routes/email');
var userbranchesRouter = require('./routes/userbranches');

// For database to start automatically.
var { exec } = require('child_process'); // To start mysql server
exec('service mysql start', (err, stdout, stderr) => {
    // Nothing
});

var dbConnectionPool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    // user: 'yourusername',
    // password: 'yourpassword',
    database: 'usermanagement'
});

dbConnectionPool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
    connection.release();
});

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(xss());
// app.use(logger('dev'));

app.use((req, res, next) => {
    if (req.path === '/users.html') {
        // Set a different CSP for the users.html page

    } else {
        // Set the default CSP for other pages
        res.setHeader('Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://accounts.google.com; " +
            "style-src 'self' fonts.googleapis.com https://accounts.google.com 'unsafe-inline'; " +
            "font-src 'self' fonts.gstatic.com; " +
            "frame-src 'self' https://accounts.google.com;");
    }
    next();
});

// Make the pool accessible to the routers
app.use(function(req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'super secret string',
    cookie: {
        secure: false,             // Set to true if using HTTPS
        httpOnly: true,            // Helps mitigate XSS attacks by not allowing client-side script access to the cookie
        maxAge: 1000 * 60 * 60     // Sets cookie expiration time (e.g., 1 hour)
    }
}));

app.use(function(req, res, next) {
    console.log('Session data:', req.session);
    next();
});

app.get('/check-login', function(req, res) {
    if (req.session.user) {
        res.json({ isLoggedIn: true, username: req.session.user.username,email:req.session.user.email, role: req.session.user.role});
    } else {
        res.json({ isLoggedIn: false });
    }
});

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/signin');
    }
}

function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'Admin') {
        return next();
    } else {
        res.status(403).send('Access Denied: You must be an admin to access this page.');
    }
}


app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/branches', branchesRouter);
app.use('/events', eventsRouter);
app.use('/email', emailRouter);
app.use('/userbranches', userbranchesRouter);
app.use('/', loginRouter);

app.get('/home', function (req, res) {
    res.sendFile('homepage.html', { root: './Public' });
});

app.get('/posts', function (req, res, next) {
    res.sendFile('posts.html', { root: './Public' });
});

app.get('/events', function (req, res, next) {
    res.sendFile('events.html', { root: './Public' });
});

app.get('/about', function (req, res, next) {
    res.sendFile('aboutus.html', { root: './Public' });
});

app.get('/signin', function (req, res, next) {
    res.sendFile('signin.html', { root: './Public' });
});

app.get('/signup', function (req, res, next) {
    res.sendFile('signup.html', { root: './Public' });
});

app.get('/locations', function (req, res, next) {
    res.sendFile('locations.html', { root: './Public' });
});

app.get('/usersettings', isAuthenticated, function (req, res, next) {
    res.sendFile('usersettings.html', { root: './Public' });
});

app.get('/', function (req, res, next) {
    res.redirect('/home');
});

app.use(express.static('./Public'));

const port = env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;