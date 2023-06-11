const mysql = require("mysql"),
jwt = require("jsonwebtoken"),
bcrypt = require("bcrypt"),
db = require("../config/mysql-db-setup.js"),
mail = require("../config/nodemailer-email-setup.js"),
functions = require("../config/helper-functions.js"),
saltRounds = 10,
{promisify} = require("util"),
{validationResult} = require("express-validator");

var request = require("request")
var randomstring = require("randomstring");
require("dotenv").config();


// SIGN UP -------------------------------------------------------


exports.signup = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
  }

  const { fName, lName, email, password } = req.body;  
  const created = functions.getDate();

  db.query("SELECT email FROM users WHERE email = ?", [email], (err, result) => {
    if (!err && result != "") {
      return res.status(401).json({statusMessage:"An account with that email address already exists.", status:401})
    } else if(!err && result[0] === undefined){
        let token = randomstring.generate(255)
        bcrypt.hash(password, saltRounds, (err, hash) => {
          db.query("INSERT INTO users (fName, lName, email, password, token, created) VALUES (?,?,?,?,?,?)", [fName, lName, email, hash, token, created], (err, result) => {
              if (!err) {
                mail.activateAccountEmail(email, result.insertId, token, (err, info) => {
                  if(!err) {
                    return res.status(200).json({statusMessage:`We sent an email to ${email}, please click the link included to verify your email address.`, status:200})
                  } else {
                    return res.status(err.status).json({statusMessage:err.message, status:err.status})
                  }
                })
              } else { 
                return res.status(500).json({statusText:"Internal server error.", status:500})
              }
          })
        })
    } else { 
        return res.status(500).json({statusText:"Internal server error.", status:500})
     } 
   })
   
}


// LOGIN -------------------------------------------------------

exports.login = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
  }

  const {email, password} = req.body

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    // IF EMAIL IS INVALID
    if(!err && result == ""){
      return res.status(401).json({statusMessage:"The email or password is incorrect.", status:401})
    }

    // IF EMAIL IS IN THE DATABASE BUT PASSWORD IS NULL
    if(!err && (result[0].email != null && result[0].password == null)){
      return res.status(401).json({statusMessage:"A Google account with that email address exists, please login with Google.", status:401})
    // IF EMAIL IS NOT IN THE DATABASE OR PASSWORDS DO NOT MATCH
    } else if(!err && (result[0].email == null || !(await bcrypt.compare(password, result[0].password.toString())))){
      return res.status(401).json({statusMessage:"The email or password is incorrect.", status:401})
    // ELSE IF ACCOUNT IS INACTIVE
    } else if (!err && result[0].status === "Inactive") {
      return res.status(400).json({statusMessage:"The email address associated with that account has not been verified.", status:400})
    // ELSE IF ACCOUNT IS BANNED
    } else if (!err && result[0].status === "Banned") {
      return res.status(400).json({statusMessage:"The email address associated with those credentials has been banned.", status:400})
    // ELSE ALLOW USER TO LOGIN
    } else if(!err && result[0].status === "Active") {
      const id = result[0].id;
      const token = jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      })
      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      }
      res.cookie("jwt", token, cookieOptions);
      return res.status(200).json({status:200})
    // DATABASE ERROR
    } else {
      return res.status(500).json({statusText:"Internal server error.", status:500})
    }
  })
}

// IS USER LOGGED IN? -------------------------------------------------------


exports.isLoggedIn = async (req, res, next) => {
  if(req.cookies.jwt){
    try{
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      //2.) check if the user still exists
      db.query("SELECT * FROM users WHERE id = ?", [decoded.id], (err, result) => {
        if(!result){
          return next();
        }
        req.user = result[0];
        return next();
      })
    }catch(err){
      return next();
    }
  }else{ next(); }
}


// LOGOUT -------------------------------------------------------


exports.logout = async (req, res, next) => {

  if(req.cookies.jwt){
    res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true
    })
    return res.status(200).redirect("/auth-management/auth-views/login");
  } else {
    req.logout(function(err) {
      if (err) { return next(err);}
      return res.status(200).redirect("/auth-management/auth-views/login");    
    })
  }
}


// PASSWORD RESET -------------------------------------------------------


exports.passwordReset = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
  }
  
  const secretKey = process.env.SECRET_KEY
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.socket.remoteAddress}`

  request(verifyUrl, (err, response, body) => {
    body = JSON.parse(body)
    if(body.success !== undefined && !body.success){
      return res.status(400).json({statusMessage:"Failed captcha verification.", status:400})
    }

    const email = req.body.email

    // CHECK IF EMAIL EXISTS  
    db.query("SELECT id, email FROM users WHERE email = ? && password != ?", [email, "null"] , (err, result) => {    
      // EMAIL FOUND
      if(!err && result[0] != undefined) {
        const id = result[0].id,
        token = randomstring.generate(255)
        token_expires = Date.now() + 3600000
        data = { token:token, token_expires:token_expires};

        db.query("UPDATE users SET ? WHERE email = ?", [data, email], (err, result) => {
          if(!err) {
            mail.resetPasswordEmail(email, id, token, (err, info) => {
              if(!err) {
                return res.status(200).json({statusMessage:"If an account with that email exists, you will receive an email with instructions on how to reset your password.", status:200})
              } else { 
                return res.status(err.status).json({statusMessage:"Internal server error", status:500})
              }
            });
          } else {
            return res.status(500).json({statusMessage:"Internal Server Error", status:500})
          }
        }); 
      // EMAIL WAS NOT FOUND (USER DOES NOT EXIST)
      } else if(!err && result[0] === undefined) {
        return res.status(200).json({statusMessage:"If an account with that email exists, you will receive an email with instructions on how to reset your password.", status:200})
      // DATABASE ERROR
      } else {
        return res.status(500).json({statusMessage:"Internal Server Error", status:500})
      }
    })
  })
}


// UPDATE PASSWORD -------------------------------------------------------


exports.passwordUpdate = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
  }
    
  const { id, tExpires, password } = req.body;

  // CHECK THAT TOKEN IS NOT EXPIRED
  if(tExpires > Date.now()){
    // UPDATE THE PASSWORD
    bcrypt.hash(password, saltRounds, (err, hash) => {
      var data = { token: null, token_expires: null, password: hash};
      db.query("UPDATE users SET ? WHERE id = ?", [data, id], (err, result) => {
        if(!err) { 
          return res.status(200).json({statusMessage:`Your password has been updated successfully, <a href="http://localhost:5000/auth-management/auth-views/login">follow this link to login with your new password.</a>`, status:200})
        } else { 
          return res.status(500).json({statusMessage:"Internal Server Error", status:500})
        }
      });
    });
  } else {
    return res.status(401).json({statusMessage:"The timeframe to reset your password has expired.", status:401})
  }
}


