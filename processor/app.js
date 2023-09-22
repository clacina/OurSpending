var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dns = require('dns');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var resourcesRouter = require('./routes/resources');
var reportsRouter = require('./routes/reports');

var app = express();
app.listen(8000);
dns.setDefaultResultOrder('ipv4first');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const cors = require('cors');

const whitelist = ["http://localhost:3000"]
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
}
app.use(cors(corsOptions))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/resources', resourcesRouter);
app.use('/reports', reportsRouter);
// app.use('/login', );
// app.use('/logout', );
// app.use('/signup', );

module.exports = app;
