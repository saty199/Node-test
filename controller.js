const schema= require('./schema');
const bcrypt = require('bcrypt');
const nodemailer= require('nodemailer'); 
var saltRounds=10;
var secret = 'secret'
var jwt = require("jsonwebtoken");

function Token() {
    let expirationDate = Math.floor(Date.now() / 1000) + 15 * 3000 //30 seconds from now
    var token = jwt.sign({
        userID: schema.email,
        exp: expirationDate
    }, secret);
    console.log(token);
    return token;
}

module.exports={
    signup : (req,res)=>{
        if(!req.body.firstName || !req.body.lastName || !req.body.email ||
             !req.body.country || !req.body.userName || !req.body.password){
                return res.send({message:"Please fill all fields",status:400})
             }
        console.log(req.connection.remoteAddress);
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
              if(err)
                return res.send({
                  message:"Something went wrong",
                  statusCode:400,
                  error:err
                })
                else {
                    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                    console.log(hash);
                    var obj={
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email.toLowerCase(),
                        country: req.body.country,
                        password: hash,
                        userName: req.body.userName,
                        ip:ip
                    }
                    schema.create(obj)
                    .then((success)=> res.send({message:"Signup Successfully", status: 200, result:success}))
                    .catch((unsuccess)=> res.send({message:"Error", status:400, error:unsuccess}))
                }
    })
})
    },


    login:(req,res)=>{
        if(!req.body.userName || !req.body.password){
            return res.send({message:"Please fill required fields",status:400})
        }
        schema.findOne({userName:req.body.userName})
        .then(success=>{
            bcrypt.compare(req.body.password, success.password, function(err, resp) {
              if(err)
               return res.send({message:"Something went wrong",status:400,error:err})
               else {
                    if(resp=='true' || resp==true){
                    const token=  Token();
                      return res.send({message:"Successfully SignIn",status:200,result:success,token:token})
                    }else{
                      return res.send({message:"Password is incorrect",status:400})
                    }
               }
         });
          })
          .catch(unsuccess=>{
            return res.send({message:"You are not Registered",status:404,error:unsuccess})
          })
    },


    forgotPassword:(req,res)=>{
        schema.findOne({email:req.query.email.toLowerCase()})
        .then((success)=>{
					var transporter = nodemailer.createTransport({
							        port: 25,
                                    service: 'gmail',
									auth: {
							        user: "satyam6418@gmail.com",
									pass: "*********"
							}
						 })
                 var mailOptions = {
                from: 'satyam6418@gmail.com',
                to: req.query.email,
                subject: 'Link for the password updation',
                html:`<html><body>
                <a href="localhost:3003/changePassword">http://newproject/changePassword/${success.email}</a>
                </body></html>`
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error)
                {
                    console.log(error);
                    return res.send({message:"Something went wrong.", status:400,error:error})
                }
                 else {
                     console.log(info);
                       return res.send({message:"Password link is send to your mail",status:200,result:info})
                }
        })
    })
    .catch((unsuccess)=> res.send({message:"You are not a registered user", status:404}))
    },

    changePassword:(req,res)=>{
        if(!req.body.oldPassword || !req.body.newPassword || !req.body.email){
            return res.send({message:"Please fill required fields",status:400})
        }
        schema.findOne({email:req.body.email.toLowerCase()})
            .then((success)=>{
                    bcrypt.compare(req.body.oldPassword, success.password, function(err, isMatch) {
                        if (err) res.send({message:"Something went wrong", status:400})
                        else
                        if (isMatch) bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                                if (err) return res.send({message:"SomeThing went Wrong", status:400})
                                else {
                                    success.password = hash;
                                    success.save(function(err, result) {
                                        if (err) return res.send({message:"Something went Wrong", status:400,error:err})
                                        else return res.send({message:"Your password updated successfully.", status:200, result:result})
                                    })
                                }
                            });
                        })
                        else return res.send({message:"Please provide correct password.", status:400})
                    });    
            })
            .catch((unsuccess)=> res.send({message:"You are not a registered user", status:400}));
    },


    getUserProfile:(req,res)=>{
        if(!req.body.email){
            return res.send({message:"Please fill Email Address",status:400})
        }
        schema.findOne({email:req.body.email.toLowerCase()})
        .then((success)=>{
            if(success==null || success=='null'){
               return res.send({message:"User details not found",status:404});
            }
            else{
              return res.send({message:"User profile data",status:200,result:success})
            }
        })
        .catch((unsuccess)=> res.send({message:"Something went wrong",status:404,error:unsuccess}))
    },


    updateUserProfile:(req,res)=>{
        schema.findOneAndUpdate({email:req.body.email.toLowerCase()},
            {
                $set:{
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    country: req.body.country
                }},{new:true}    
        )
        .then((success)=>{
              return res.send({message:"User data updated",status:200,result:success})
        })
        .catch((unsuccess)=>{
            return res.send({message:"Something went wrong",status:400,error:unsuccess})
        })
    }
}