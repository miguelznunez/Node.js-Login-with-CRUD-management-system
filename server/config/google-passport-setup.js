const passport = require("passport"),
GoogleStrategy = require("passport-google-oauth20"),
db = require("./mysql-db-setup.js"),
functions = require("../functions/get-date.js");

require("dotenv").config()

passport.serializeUser((user, cb) => {
  cb(null, user)
})

passport.deserializeUser((id, cb) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
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

      if(err){
        return cb(null, false, { message: "Internal server error." })
      }

      // IF THEY DO: RETRIEVE CREDENTIALS
      if(!err && results != ""){
        db.query("SELECT * FROM users WHERE id = ?", [results[0].user_id], (err, results) => {
          if(!err){
            if(results[0].status === "Active"){
              return cb(null, results[0].id)
            } else {
              return cb(null, false, { message: "This account has been banned." })
            }
          } else {
            return cb(null, false, { message: "Internal server error." })
          }
       })
      // IF THEY DON'T: SAVE USER IN USERS & FEDERATED CREDENTIALS TABLE
      } else {
        db.query("INSERT INTO users (fName, lName, email, status, created) VALUES (?,?,?,?,?)", [
        profile.name.givenName, profile.name.familyName, profile.emails[0].value, "Active", functions.getDate()], (err, results) => {
          // IF NO ERROR: SAVE USER IN FEDERATED_CREDENTIALS TABLE
          if(!err){
            let id = results.insertId
            db.query("INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)", [id, profile.provider, profile.id], (err, results) => {
              // USER SAVED
              if (!err) {
                return cb(null, id)
              // DB ERROR
              } else {
                return cb(null, false, { message: "Internal server error" })
              }
            })
          // DB ERROR (LIKELY DUPLICATE ERROR) 
          } else {
            console.log(err.sqlMessage)
            return cb(null, false, { message:err.code })
          }          
        })
      }
    })
    
  })
)