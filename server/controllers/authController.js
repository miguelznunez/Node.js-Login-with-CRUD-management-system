const mysql = require("mysql"),
db = require("../../db.js"),
jwt = require("jsonwebtoken"),
bcrypt = require("bcrypt"),
saltRounds = 10,
mail = require("../../mail.js"),
{promisify} = require("util"),
{validationResult} = require("express-validator");

var request = require("request")
var randomstring = require("randomstring");
require("dotenv").config();

function get_date(){
  let yourDate = new Date()
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - (offset*60*1000));
  return yourDate.toISOString().split('T')[0]
}


// REGISTER -------------------------------------------------------


exports.register = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    res.statusMessage = allParsedErrors.errors[0].msg
    return res.status(401).end()
  }

  const { fName, lName, email, password } = req.body;  
  const member_since = get_date();

  db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
    // CHECK IF EMAIL ALREADY EXISTS IN DATABASE
    if (!err && results != "") {
      res.statusMessage = "An account with that email already exists"
      return res.status(401).end()
    // ELSE CREATE A NEW USER
    } else if(!err && results[0] === undefined){
        var token = randomstring.generate(20);
        bcrypt.hash(password, saltRounds, (err, hash) => {
          db.query("INSERT INTO users (fName, lName, email, password, token, member_since) VALUES (?,?,?,?,?,?)", [fName, lName, email, hash, token, member_since],
            async (err, results) => {
              if (!err) {
                mail.activateAccountEmail(email, results.insertId, token, (error, data) => {
                  if(!error) {
                    res.statusMessage = `We have sent an email to ${email}, please click the link included to verify your email address.`
                    return res.status(200).end()
                  } else {
                    // MAILGUN ERROR
                    res.statusMessage = error.message
                    return res.status(error.status).end()
                  }
                })
              // DATABASE ERROR
              } else { 
                res.statusMessage = "Internal server error."
                return res.status(500).end()
              }
          })//function
        });//bcrypt
    // DATABASE ERROR
    } else{ 
        res.statusMessage = "Internal server error."
        return res.status(500).end()
     } 
   })
   
}


// LOGIN -------------------------------------------------------


exports.login = async (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    res.statusMessage = allParsedErrors.errors[0].msg
    return res.status(401).end()
  }

  const {email, password} = req.body

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    // IF EMAIL IS NOT IN THE DATABASE OR PASSWORDS DO NOT MATCH
    if(!err && (results == "" || !(await bcrypt.compare(password, results[0].password.toString())))){
      res.statusMessage = "The email or password is incorrect."
      return res.status(401).end()
    // ELSE IF ACCOUNT IS INACTIVE
    } else if (!err && results[0].status === "Inactive") {
      res.statusMessage = "This account has not been verified."
      return res.status(400).end()
    // ELSE ALLOW USER TO LOGIN
    } else if (!err && results[0].status === "Active"){
      const id = results[0].id;
      const token = jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });
      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      }
      res.cookie("jwt", token, cookieOptions);
      return res.status(200).end();
    // DATABASE ERROR
    } else{
      res.statusMessage = "Internal server error."
      return res.status(500).end()
    }
  });
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


exports.logout = async (req, res) => {
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true
  });
  return res.status(200).redirect("/");
}


// PASSWORD RESET -------------------------------------------------------


exports.passwordReset = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    res.statusMessage = allParsedErrors.errors[0].msg
    return res.status(401).end()
  }
  
  const secretKey = process.env.SECRET_KEY
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.socket.remoteAddress}`

  request(verifyUrl, (err, response, body) => {
    body = JSON.parse(body)
    if(body.success !== undefined && !body.success){
      res.statusMessage = "Failed captcha verification."
      return res.status(400).end()
    }

    const email = req.body.email

    // CHECK IF EMAIL EXISTS  
    db.query("SELECT id, email FROM users WHERE email = ?", [email] , (err, results) => {    
      // EMAIL FOUND
      if(!err && results[0] != undefined) {
        const id = results[0].id
        const token = randomstring.generate(20)
        const token_expires = Date.now() + 3600000
        const data = { token: token, token_expires: token_expires}

        db.query("UPDATE users SET ? WHERE email = ?", [data, email], (err, results) => {
          if(!err) {
            mail.resetPasswordEmail(email, id, token, (err, data) => {
              if(!err) {
                res.statusMessage = `If an account with that email exists, you will receive an email with instructions on how to reset your password.`
                return res.status(200).end() 
              } else { 
                // MAILGUN ERROR
                res.statusMessage = err.message
                return res.status(err.status).end()
              }
            });
          // DATABASE ERROR
          } else {
            res.statusMessage = "Internal server error."
            return res.status(500).end()
          }
        }); 
      // EMAIL WAS NOT FOUND (USER DOES NOT EXIST)
      } else if(!err && results[0] === undefined) {
        res.statusMessage = "If an account with that email exists, you will receive an email with instructions on how to reset your password."
        return res.status(200).end()
      // DATABASE ERROR
      } else {
        res.statusMessage = "Internal server error."
        return res.status(500).end()
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
    res.statusMessage = allParsedErrors.errors[0].msg
    return res.status(401).end()
  }
    
  const { id, tExpires, password } = req.body;

  // CHECK THAT TOKEN IS NOT EXPIRED
  if(tExpires > Date.now()){
    // UPDATE THE PASSWORD
    bcrypt.hash(password, saltRounds, (err, hash) => {
      var data = { token: null, token_expires: null, password: hash};
      db.query("UPDATE users SET ? WHERE id = ?", [data, id], (err, result) => {
        if(!err) { 
          res.statusMessage = "Your password has been changed."
          return res.status(200).end()
        } else { 
          res.statusMessage = "Internal server error."
          return res.status(500).end()
        }
      });
    });
  } else {
    res.statusMessage = "The timeframe to reset your password has expired."
    return res.status(401).end()
  }
}


