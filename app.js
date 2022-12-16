require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash')
const session = require('express-session');
const passport = require('passport');

const auth = require('./routes/auth');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const postRouter = require('./routes/post');

const db = require('./db'); //connect mongodb


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: false}))
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'users',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 6000}
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static('uploads'));

app.use(passport.initialize());
app.use(passport.session()); //phải để passort session ở đây

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
// app.use('/accounts', accountsRouter);
app.use('/post', postRouter);

app.use('/auth/google',auth);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
