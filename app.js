//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
mongoose.connect('mongodb://localhost:27017/userDB',(err)=>{
  if(!err){console.log("DB connected suucessfully")}
  else{console.log(err)}
});
const userSchema = new mongoose.Schema({
  username:String,
  password:String
});
console.log(process.env.SECRET);
userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});
const User = mongoose.model("User",userSchema);
app.get("/",(req,res)=>{
  res.render('home');
});
app.get("/login",(req,res)=>{
  res.render('login');
});
app.get("/register",(req,res)=>{
  res.render('register');
});
app.post("/register",(req,res)=>{
  const new_user = new User({
    username: req.body.username,
    password: req.body.password
  })
  new_user.save((err)=>{
    if(!err){res.render("secrets");}
    else{console.log(err);}
  })
})
app.post("/login",(req,res)=>{
  const email = req.body.username;
  const password = req.body.password;
  User.findOne({username:email},(err,founduser)=>{
    if(!err){
      if(founduser){
            if(founduser.password===password){
              res.render("secrets");
            }
            else{
              console.log("Invalid Password");
            }
      }
      else{console.log("user not found")}
    }
    else{
      console.log(err);
    }
  })
})
app.listen(3000,()=>{
  console.log("app listining on port 3000");
})
