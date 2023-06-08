const passport = require("passport"),
FacebookStrategy = require("passport-facebook"),
request = require("request"),
db = require("./mysql-db-setup.js"),
functions = require("../functions/get-date.js");

require("dotenv").config()

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

            // let url = "https://graph.facebook.com/v3.2/me?" +
            //       "fields=id,name,email,first_name,last_name&access_token=" + accessToken;

            // request({
            //     url: url,
            //     json: true
            // }, function (err, response, body) {
            //     let email = body.email;  // body.email contains your email
            //     console.log(body); 
            // });

            let email = ""

            if(profile.emails !== undefined){
                email = profile.emails[0].value
            } else {
                email = `${profile.id}@facebook.com`
            }
        
            db.query("INSERT INTO users (fName, lName, email, status, created) VALUES (?,?,?,?,?)", [
            profile.name.givenName, profile.name.familyName, email, "Active", functions.getDate()], (err, results) => {
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