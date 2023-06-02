const { verify } = require("jsonwebtoken");
const passport = require("passport"),
GoogleStrategy = require("passport-google-oauth20"),
db = require("./db-setup.js");
require("dotenv").config()

function get_date(){
  let yourDate = new Date()
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - (offset*60*1000));
  return yourDate.toISOString().split('T')[0]
}

passport.serializeUser((user, cb) => {
  cb(null, user)
})

passport.deserializeUser((id, cb) => {
  db.query("SELECT * FROM users WHERE id = ?", [id],(err, results) => {
    cb(null, results[0])
  })  
})

passport.use(
  new GoogleStrategy({
    callbackURL: "/auth-management/auth-views/google/redirect",
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET 
  }, function verify(accessToken, refreshToken, profile, cb) {
  
    // CHECK IF USER ALREADY EXISTS
    db.query("SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?", [profile.provider, profile.id], (err, results) => {

      // IF THEY DO: RETRIEVE USER CREDENTIALS
      if(!err && results != ""){
        db.query("SELECT * FROM users WHERE id = ?", [results[0].user_id], (err, results) => {
          if(!err){
            // CREDENTIALS RETRIEVED
            if(results[0].status === "Active"){
              return cb(null, results[0].id)
            } else {
              return cb(null, false, { message: "This account has been banned." })
            }
          } else {
            return cb(null, false, { message: "Internal server error." })
          }
       })
      // IF THEY DON'T: SAVE USER IN USERS TABLE
      } else if(!err && results[0] === undefined){
        db.query("INSERT INTO users (fName, lName, email, member_since, status) VALUES (?,?,?,?,?)", [
        profile.name.givenName, profile.name.familyName, profile.emails[0].value, get_date(), "Active"], (err, results) => {
          // IF NO ERROR: SAVE USER IN FEDERATED_CREDENTIALS TABLE
          if(!err){
            let id = results.insertId
            db.query("INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)", [id, profile.provider, profile.id], (err, results) => {
              // USER SAVED
              if (!err) {
                return cb(null, id)
              // DB ERROR
              } else {
                return cb(null, false, { message: "Internal server error." })
              }
            })
          // DB ERROR (LIKELY DUPLICATE ERROR) 
          } else {
            return cb(null, false, { message: "An account exists with that email address, please use those credentials to log in manually." })
          }          
        })
      // DB ERROR 
      } else {
        return cb(null, false, { message: "Internal server error." })
      }
    })
  })
)