const passport = require("passport"),
FacebookStrategy = require("passport-facebook"),
db = require("./mysql-db-setup.js");

require("dotenv").config()

function get_date(){
    let yourDate = new Date()
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - (offset*60*1000));
    return yourDate.toISOString().split('T')[0]
}

// passport.serializeUser((user, cb) => {
//     cb(null, user)
// })
  
// passport.deserializeUser((id, cb) => {
// db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
//     cb(null, results[0])
// })  
// })

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth-management/auth-views/facebook/redirect",
    profileFields: ['id', 'photos', 'name', 'displayName', 'emails']
  },
  function verify(accessToken, refreshToken, profile, cb) {
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

            if(profile.emails){
                console.log(profile.emails)
            } 
            
            const facebookEmail = `${profile.id}@facebook.com`
            
            db.query("INSERT INTO users (fName, lName, email, member_since, status) VALUES (?,?,?,?,?)", [
            profile.name.givenName, profile.name.familyName, facebookEmail, get_date(), "Active"], (err, results) => {
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
                    return cb(null, false, { message: "An account with that email already exists, please use those credentials to log in manually." })
                }          
            })
        }

    })
    
  }
));