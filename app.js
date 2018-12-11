const express = require('express');
      mongoose = require('mongoose');
      morgan= require('morgan');
      bodyParser = require('body-parser');
      fs = require('fs');
      config= require('./config');
      control= require('./controller');
var db= config.db;
var app= express();
app.use(bodyParser.json({'limit':'100mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Credentials', true);
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,authorization,accessToken," +
       "lat lng,app_version,platform,ios_version,countryISO,Authorization");
   res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS');
   next();
})
mongoose.connect(db ,{
  useCreateIndex: true,
  useNewUrlParser: true
},(err,res)=>{
  if(err)
     console.log("Database not connected");
  else
     console.log("***Database is connected***");
});

app.post('/signup',control.signup);
app.post('/login',control.login);
app.get('/forgotPassword',control.forgotPassword);
app.post('/changePassword',control.changePassword);
app.post('/getUserProfile',control.getUserProfile);
app.post('/updateUserProfile',control.updateUserProfile);



app.listen(3003, ()=> console.log('App running on port 3003'));
