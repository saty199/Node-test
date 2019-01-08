const express = require('express');
      mongoose = require('mongoose');
      morgan= require('morgan');
      bodyParser = require('body-parser');
      fs = require('fs');
      config= require('./config');
      control= require('./controller');
      jwt= require('jsonwebtoken')
      basicAuth = require('basic-auth')
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


function token1(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['authorization'];
  if (token) {
    jwt.verify(token, 'secret', function(err, decoded) {  
           if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });   
          } else {
        req.decoded = decoded;    
        console.log(decoded)
             next();
      }
    });
  } else {
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
};

var auth = function (req, res, next) {
  var user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.sendStatus(401);
    return;
  }
  if (user.name === 'amy' && user.pass === 'passwd123') {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.sendStatus(401);
    return;
  }
}
 app.get("/auth", auth, function (req, res) {
    res.send("This page is authenticated!")
});

app.post('/signup',control.signup);
app.post('/login',auth,control.login);
app.get('/forgotPassword',control.forgotPassword);
app.post('/changePassword',control.changePassword);
app.post('/getUserProfile',token1,control.getUserProfile);
app.post('/updateUserProfile',token1,control.updateUserProfile);



app.listen(3003, ()=> console.log('App running on port 3003'));
