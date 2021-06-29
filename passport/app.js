const http = require('http');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const login = require('./routes/login');
const checkToken = require('./routes/check-token');
const register = require('./routes/register');
const logout = require('./routes/logout');
const visitor = require('./routes/visitor');
require('./db');
const app = express();
var session = require('express-session');
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// config session
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 1000 * 60 * 60 * 3 },
    resave: false,
    saveUninitialized: false,
}));

app.use(cookieParser());
// set the static folder as the public
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', login);
app.use('/check_token', checkToken);
app.use('/register',register);
app.use('/logout',logout);
app.use('/visitor',visitor);
let port = process.env.PORT || 8080;
app.set('port', port);

let server = http.createServer(app);

server.listen(port, function () {
  console.log(`Server passport listening on port: ${port}`);
});