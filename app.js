//jshint esversion:6
// require('dotenv').config();
// const md5 = require("md5");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const bcrypt = require('bcrypt');
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
app.use(session({
  secret:"Our web sec",
  resave:false,
  SaveUninitialized:false
}));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
// const saltRounds = 10;
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://localhost:27017/userDB',(err)=>{
  if(!err){console.log("DB connected suucessfully")}
  else{console.log(err)}
});
const userSchema = new mongoose.Schema({
  username:String,
  password:String
});

userSchema.plugin(passportLocalMongoose);
// console.log(process.env.SECRET);
// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});
const User = mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/",(req,res)=>{
  res.render('home');
});
app.get('/secrets',(req,res)=>{
  if(req.isAuthenticated()){
    res.render('secrets');
  }
  else{
    res.redirect('/login');
  }
})
app.get("/login",(req,res)=>{
  res.render('login');
});
app.get("/register",(req,res)=>{
  res.render('register');
});
app.get("/logout",(req,res)=>{
  req.logout();
  res.redirect('/');
})
app.post("/register",(req,res)=>{
  User.register({username:req.body.username},req.body.password,(err,user)=>{
    if(!err){
      passport.authenticate("local")(req,res,()=>{
        res.redirect('/secrets');
      })
    }
    else{
      res.redirect('/register');
    }

  })
})
app.post("/login",(req,res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
  })
  req.login(user,(err)=>{
    if(!err){
      passport.authenticate("local")(req,res,()=>{
        res.redirect('/secrets');
      })
    }
    else{
      console.log(err);
      res.redirect('/login')
    }
  })
})
app.listen(3000,()=>{
  console.log("app listining on port 3000");
})
