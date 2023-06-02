const express = require("express"),
authController = require("../controllers/auth-controller"),
db = require("../config/db-setup.js"),
passport = require("passport"),
{check} = require("express-validator"),
router = express.Router();

// FUNCTION TO CHECK FOR INTERNET EXPLORER ============================================

function checkBrowser(headers){
  var ba = ["Chrome","Firefox","Safari","Opera","MSIE","Trident", "Edge"];
  var b, ua = headers['user-agent'];
  for(var i=0; i < ba.length;i++){
    if(ua.indexOf(ba[i]) > -1){
      b = ba[i];
      break;
    }
  }
  // IF INTERNET EXPLORER IS BEING USED RETURN TRUE OTHERWISE RETURN FALSE
  if(b === "MSIE" || b === "Trident") return true;
  else return false
}

// AUTH GET ROUTES ==============================================================

router.get("/auth-views/signup", authController.isLoggedIn, (req, res) => {
  if(!req.user && !checkBrowser(req.headers)){
    return res.status(200).render("signup", {title:"Sign up"});
  } else {
    return res.redirect("/")
  }
})

router.get("/auth-views/login", authController.isLoggedIn, (req, res) => {
  if(!req.user && !checkBrowser(req.headers)) {
    const flash = req.flash("message")
    return res.status(200).render("login", {title:"Login", flash})
  } else {
    return res.redirect("/")
  }
})

router.get("/auth-views/google", passport.authenticate("google", {
  scope: ["profile","email"]
}))

router.get("/auth-views/google/redirect", passport.authenticate("google",{
  successRedirect:'/',
  failureRedirect:"/auth-management/auth-views/login",
  failureFlash : true
}))

router.get("/auth-views/password-reset", authController.isLoggedIn, (req, res) => {
  if(!req.user && !checkBrowser(req.headers)) {
    return res.status(200).render("password-reset", {title:"Password Reset"} )
  } else {
    return res.redirect("/")
  }
})

router.get("/auth-views/account-verification/:id/:token", authController.isLoggedIn, (req, res) => {

  if(!req.user && !checkBrowser(req.headers)){
    db.query("SELECT * FROM users WHERE id = ? && token = ?", [req.params.id, req.params.token], (err, results) => {
      if((results != "")) {
        db.query("UPDATE users SET token = ?, status = ? WHERE id = ?", [null, "Active", req.params.id], (err, results) => {
          if(!err) {
            return res.status(200).render("account-verification", {title:"Account Verification", success:true, message:"Your account has been verified, please use your credentials to login."})
          } else {
            return res.status(500).render("account-verification", {title:"Account Verification", success:false, message:"Internal server error."})
          }
        });
      } else{
         return res.status(401).render("account-verification", {title:"Account Verification", success:false, message:"This link is no longer valid."})
      } 
    });
  } else{
    return res.status(401).render("account-verification", {title:"Account Verification", success:false, user:req.user, message:"Please log out of your current account to verify."})
  } 
})

router.get("/auth-views/password-update/:id/:token", authController.isLoggedIn, (req, res) => {

  if(!req.user && !checkBrowser(req.headers)){
    db.query("SELECT * FROM users WHERE id = ? && token = ?", [req.params.id, req.params.token], (err, results) => {
      // DATABASE ERROR
      if(err){
         return res.status(500).render("password-update-error", {title:"Password Update Error", success:false, message:"Internal server error."})
      }
      // USER WAS FOUND AND CREDENTIALS MATCH
      if((results != "") && (results[0].token != null) && (results[0].token_expires > Date.now())) {
        return res.status(200).render("password-update", {title:"Password Update", success:true, token:results[0].token, tExpires:results[0].token_expires, id:results[0].id  })
      } else{
        // USER WAS FOUND OR NOT BUT CREDENTIALS DO NOT MATCH
        return res.status(500).render("password-update-error", {title:"Password Update Error", success:false, message:"This link is no longer valid."})
      } 

    })
  } else {
    return res.status(401).render("password-update-error", {title:"Password Update Error", success:false, user:req.user, message:"Please logout before proceeding."})
  }
})


// AUTH POST ROUTES  ============================================================

router.post("/auth-views/signup",
[
  check("fName", "First name field cannot be empty.").not().isEmpty(),
  check("fName", "First name must be only alphabetical characters.").isAlpha(),
  check("fName", "First name must be between 1 - 25 characters.").isLength({min:1, max:25}),
  check("lName", "Last name field cannot be empty.").not().isEmpty(),
  check("lName", "Last name must be only alphabetical characters.").isAlpha(),
  check("lName", "Last name must be between 1 - 25 characters.").isLength({min:1, max:25}), 
  check("email", "The email you entered is invalid, please try again.").isEmail().normalizeEmail(),
  check("email", "Email address must be between 4-100 characters long, please try again.").isLength({min:4, max:100}).normalizeEmail(), 
  check("password", "Password must be between 8-60 characters long.").isLength({min:8, max:60}),
  check("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
  check("cPassword", "Password confirm field cannot be empty.").not().isEmpty(),
  check("password", "Password don't match, please try again.").custom(( value, { req, res, next } ) => {
  if (value !== req.body.cPassword) {
    throw new Error("Passwords don't match, please try again.");
  } else {
    return value;
  }
 })
], authController.signup)

router.post("/auth-views/login",[
  check("email", "Email field cannot be empty.").not().isEmpty(),
  check("password", "Password field cannot be empty.").not().isEmpty()
], authController.login)

router.get("/auth-views/logout", authController.logout)

router.post("/auth-views/password-reset", [
  check("email", "Email field cannot be empty.").not().isEmpty(),
  check("captcha", "Please select captcha.").not().isEmpty()
], authController.passwordReset)

router.put("/auth-views/password-update",
[ 
  check("password", "Password field cannot be empty.").not().isEmpty(),
  check("password", "Password must be between 8-60 characters long.").isLength({min:8, max:60}),
  check("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
  check("cPassword", "Password confirm field cannot be empty.").not().isEmpty(),
  check("password", "Password don't match, please try again.").custom(( value, { req, res, next } ) => {
  if (value !== req.body.cPassword) {
    throw new Error("Passwords don't match, please try again.");
  } else {
    return value;
  }
 })
], authController.passwordUpdate);

module.exports = router;