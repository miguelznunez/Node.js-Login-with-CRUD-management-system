const passport = require("passport"),
GoogleStrategy = require("passport-google-oauth20"),
db = require("../config/db-setup.js");
require("dotenv").config()

function get_date(){
  let yourDate = new Date()
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - (offset*60*1000));
  return yourDate.toISOString().split('T')[0]
}

passport.use(
  new GoogleStrategy({
    callbackURL: "/auth/google/redirect",
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET 
  }, (accessToken, refreshToken, profile, done) => {
    
    db.query("SELECT * FROM federated_credentials WHERE provider = ? AND googleId = ?", [profile.provider, profile.id], (error, results) => {

      if (error) { return console.log(error) }

      // IF USER IS NOT IN FEDERATED_CREDENTIALS TABLE
      if(!results[0]){
        // INSERT USER DATA INTO USERS TABLE
        db.query("INSERT INTO users (fName, lName, member_since, status) VALUES (?,?,?,?)", [
        profile.name.givenName, profile.name.familyName, get_date(), "Active"], (error, results) => {

          if (error) { return console.log(error) }
          // IF NOT ERROR, INSERT CREDENTIALS INTO FEDERATED_CREDENTIALS TABLE
          if(!error){
            db.query("INSERT INTO federated_credentials (user_id, provider, googleId) VALUES (?, ?, ?)", [results.insertId, profile.provider, profile.id], (error, results) => {
              if (error) { return console.log(error) }
              console.log("NEW USER CREATED")
              // let user = {
              //   id: id,
              //   name: profile.displayName
              // }
              // return cb(null, user);
            })
          }
        })
      // ELSE RETRIEVE USER INFORMATION FROM THE USERS TABLE
      } else {
        db.query("SELECT * FROM users WHERE id = ?", [results[0].user_id], (error, results) => {
          console.log(results)
          // if (err) { return console.log(err) }
          // if (!row) { return cb(null, false); }
          // return cb(null, row);
       })
      }
    })
  })
)

// passport.use(new GoogleStrategy({

// }, function verify(issuer, profile, cb) {
//   db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
//     issuer,
//     profile.id
//   ], function(err, row) {

//     if (err) { return cb(err); }
//     if (!row) {
//       db.run('INSERT INTO users (name) VALUES (?)', [
//         profile.displayName
//       ], function(err) {
//         if (err) { return cb(err); }
//         var id = this.lastID;
//         db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
//           id,
//           issuer,
//           profile.id
//         ], function(err) {
//           if (err) { return cb(err); }
//           var user = {
//             id: id,
//             name: profile.displayName
//           };
//           return cb(null, user);
//         });
//       });
//     } else {
//       db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
//         if (err) { return cb(err); }
//         if (!row) { return cb(null, false); }
//         return cb(null, row);
//       });
//     }
//   });
// }));