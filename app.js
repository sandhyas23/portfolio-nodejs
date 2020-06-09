const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const navLinksRouter = require('./routes/navLinks');
const commentsRouter =  require('./routes/commentsRoute')
const navLinksDb = require('./models/navLinksModel');
const usersDb = require('./models/userModel');

const app = express();


const initialDoc = { category: 'home',
  path:'/home',
  aboutMe: "Your about me page"

};

navLinksDb.findOne({category:"home"})
    .then((cat) =>{
      if(cat == null){
        navLinksDb.insert(initialDoc).then(()=>console.log("added"));
      }
      else{
        console.log("already home there");
      }
    })
    .catch(err=>{
      console.log(err);
    });


let admin ={displayName:'Sandhya Sankaran', image:"https://lh3.googleusercontent.com/a-/AOh14GhXN339T4HYacr6SepgqQ2vXHJKoSFKFUYcECP8Og",
  google:{},googleId : '105828116220993776046',
  googleToken : "", role:"admin"};

usersDb.findOne({role:"admin"})
    .then((user) =>{
      if(user == null){
        usersDb.insert(admin)
            .then(()=> console.log("admin added"));
      }
      else{
        console.log("admin already present");
      }
    });


// app.get('/', (req, res) => {
//
//     res.json({"ggggggg":req.session});
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter.router);
app.use('/navlinks',navLinksRouter);
app.use('/comments',commentsRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
