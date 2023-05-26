const router = require('express').Router();
const User = require('../models/user.model');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const connectEnsure=require('connect-ensure-login');
const {RegisterValidator}=require('../utils/validatars');
//router
/*
router.get('/login',ensureNOTAuthenticated, async (req, res, next) => {
  // res.send('Login');
  res.render('./login');
});*/
router.get('/login',connectEnsure.ensureLoggedOut({redirectTo:'/'}), async (req, res, next) => {
  // res.send('Login');
  res.render('./login');
});
router.post('/login',connectEnsure.ensureLoggedOut({redirectTo:'/'}), passport.authenticate('local', {
 
  //successRedirect: "/",
  successReturnToOrRedirect:"/",
  failureRedirect: "/auth/login",
  failureFlash: true,
})
);

router.get('/register',connectEnsure.ensureLoggedOut({redirectTo:'/'}), (req, res, next) => {
  // req.flash('error','some error');
  // req.flash('error','some error');
  // req.flash('info','some value');
  // req.flash('warning','some value');
  // req.flash('success','some value');
  // const messages=req.flash();
  // res.render('./register',{messages});

  res.render('./register');

});


router.post('/register',connectEnsure.ensureLoggedOut({redirectTo:'/'}),RegisterValidator , async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      // return;
      errors.array().forEach(error => {
        req.flash('error', error.msg);
      })
      res.render('register', { email: req.body.email, messages: req.flash() });
      return;
    }
    const { email } = req.body;
    const doesExist = await User.findOne({ email })
    if (doesExist) {
      req.flash('warning', 'Username/email already exists');
      res.redirect('/auth/register');
      return;
    }
    const user = new User(req.body);
    await user.save();
    req.flash('success', `${user.email} registered succesfully, you can now login`);
    res.redirect('/auth/login');
    //res.send(user);
  } catch (error) {
    next(error);
  }

});

router.get('/logout',connectEnsure.ensureLoggedIn({redirectTo:'/'}), async (req, res, next)=> {
  req.logout((err)=> {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;

/*
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
      next();
  }else{
      res.redirect('/auth/login');
  }
  }

  
function ensureNOTAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    res.redirect('back');
  }else{
      next();
  }
  }
  */