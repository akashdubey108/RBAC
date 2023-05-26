//const { error } = require('console');
const express=require('express');
const createHttpError=require('http-errors');
const mongoose=require('mongoose');
const morgan=require('morgan');
require('dotenv').config();
const session=require('express-session');
const connectFlash=require('connect-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const connectEnsureLogin=require('connect-ensure-login');
//const { ensureLoggedIn } = require('connect-ensure-login');
const { roles } = require('./utils/constants');
const app=express();
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(__dirname + "/bootstrap-5.2.3-dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//const MongoStore = connectMongo(session);
//Init Session
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        //secure:true,   //https
        httpOnly:true
    },
    store: MongoStore.create({ mongoUrl: `${process.env.MONGO_URI}/${process.env.DB_NAME}` }),
   // store:new MongoStore({mongooseConnection:mongoose.connection}),
}));

// For Passport JS Authentication
app.use(passport.initialize())
app.use(passport.session());
require('./utils/passport.auth');
app.use((req, res, next)=>{
    res.locals.user=req.user;
    next();
})

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});


//route
app.use('/',require('./routes/index.route'));
app.use('/auth',require('./routes/auth.route'))
app.use('/user',connectEnsureLogin.ensureLoggedIn({redirectTo:'/auth/login'}),require('./routes/user.route'))
app.use('/admin',connectEnsureLogin.ensureLoggedIn({redirectTo:'/auth/login'}), ensureAdmin,require('./routes/admin.route'));
app.use((req,res,next)=>{
    next(createHttpError.NotFound());
})

// Error Handler
app.use((error, req, res, next) => {
    error.status = error.status || 500;
    res.status(error.status);
    res.render('error_40x', { error });
    //res.send(error);
  });

// Setting the PORT
const PORT=process.env.PORT ||3000;

mongoose.connect(process.env.MONGO_URI,{dbName:process.env.DB_NAME,
    useNewUrlParser: true, 
    useUnifiedTopology: true ,
    /*useCreateIndex: true, 
   useFindAndModify: false */
}).then(()=>{
    console.log('🚟 connected...')
     console.log('hello');
    app.listen(PORT,()=>{console.log(`🚀 on port ${PORT}`)});
}).catch(err=>console.log(err.message));

/*
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/auth/login');
    }
    }
*/

function ensureAdmin(req, res, next) {
  console.log(req.user,req.user.role)
    if (req.user.role === roles.admin) {
      next();
    } else {
      req.flash('warning', 'you are not Authorized to see this route');
      res.redirect('/');
    }
  }
  
  function ensureModerator(req, res, next) {
    if (req.user.role === roles.moderator) {
          next();
    } else {    
      req.flash('warning', 'you are not Authorized to see this route');
      res.redirect('/');
    }
  }
  