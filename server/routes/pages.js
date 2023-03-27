const express = require("express")
bcrypt = require("bcrypt"),
db = require("../../db.js"),
authController = require("../controllers/authController"),
{check, validationResult} = require("express-validator"),
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

// ROUTES ==============================================================

router.get("/", authController.isLoggedIn, (req, res) => {
  if(!checkBrowser(req.headers)) {
    return res.status(200).render("index", {title: "Home", user:req.user})
  } else {
    return res.render("unsupported", {title:"Home", user:req.user})
  }
})

router.get("/register", authController.isLoggedIn, (req, res) => {
  // If user IS NOT logged in show the page otherwise redirect to the home page
  if(!req.user && !checkBrowser(req.headers)){
    return res.status(200).render("register", {title:"Register", user:req.user});
  } else {
    return res.redirect("/")
  }
})

router.get("/login", authController.isLoggedIn, (req, res) => {
  if(!req.user && !checkBrowser(req.headers)) {
    return res.status(200).render("login", {title:"Login", user:req.user})
  } else {
    return res.redirect("/")
  }
})

router.get("/password-reset", authController.isLoggedIn, (req, res) => {
  if(!req.user && !checkBrowser(req.headers)) {
    return res.status(200).render("password-reset", {title:"Password Reset", user:req.user} )
  } else {
    return res.redirect("/")
  }
})

router.get("/account-verification/:id/:token", authController.isLoggedIn, async (req, res) => {

  if(!req.user && !checkBrowser(req.headers)){
    db.query("SELECT * FROM users WHERE id = ? && token = ?", [req.params.id, req.params.token], async (error, results) => {
      if((results != "")) {
        db.query("UPDATE users SET token = ?, status = ? WHERE id = ?", [null, "Active", req.params.id],
        async (error, results) => {
          if(!error) {
            return res.status(200).render("account-verification", {success:true, message:"Your account has been verified. Please use your credentials to login."})
          } else {
            return res.status(500).render("account-verification", {success:false, message:"Internal server error."})
          }
        });
      } else{
         return res.status(401).render("account-verification", {success:false, message:"This link is no longer valid."})
      } 
    });
  } else{
    return res.status(401).render("account-verification", {success:false, user:req.user, message:"This link is no longer valid."})
  } 
})

router.get("/password-update/:id/:token", authController.isLoggedIn, async (req, res) => {

  if(!req.user && !checkBrowser(req.headers)){
    db.query("SELECT * FROM users WHERE id = ? && token = ?", [req.params.id, req.params.token], async (err, results) => {
      // DATABASE ERROR
      if(err){
         return res.status(500).render("password-update-error", {success:false, message:"Internal server error."})
      }
      // USER WAS FOUND AND CREDENTIALS MATCH
      if((results != "") && (results[0].token != null) && (results[0].token_expires > Date.now())) {
        return res.status(200).render("password-update", { success:true, token:results[0].token, tExpires:results[0].token_expires, id:results[0].id  })
      } else{
        // USER WAS FOUND OR NOT BUT CREDENTIALS DO NOT MATCH
        return res.status(500).render("password-update-error", {success:false, message:"This link is no longer valid."})
      } 

    })
  } else {
    return res.status(401).render("password-update-error", {success:false, user:req.user, message:"Please logout before proceeding."})
  }
})

// USER MUST BE LOGGED IN TO USE THE ROUTES BELOW

router.get("/profile", authController.isLoggedIn, (req, res) => {
  if(req.user && !checkBrowser(req.headers)) {
    return res.status(200).render("profile", {title:"Profile", user:req.user} )
  } else { 
    return res.redirect("/login")
  }
})

// STORE MANAGEMENT SYSTEM

router.get("/eCommerce-management", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    return res.status(200).render("store", {title:"Store", user:req.user} )
  } else { 
    return res.redirect("/login")
  }
})


// USER MANAGEMENT SYSTEM =======================================================================

router.get("/user-management", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    db.query("SELECT * FROM users WHERE status != 'Deleted'", (err, rows) => {
      if(!err) { 
        const flashMessage = req.flash("message")
        return res.status(200).render("user-management", {title:"User Management" , user:req.user, rows:rows, flashMessage})
      } else {
        return res.status(500).render("user-management", {title:"User Management", user:req.user, message:"Internal server error."})
      }
    })
  } else { 
    return res.redirect("/login")
  }
})

router.get("/user-management/view-user/:id", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM users WHERE id = ?",[req.params.id], (err, rows) => {
      if(err) { // DATABASE ERROR
        return res.status(500).render("view-user", {title:"View user", user:req.user, message:"Internal server error."})
      }
      if(!err && rows.length >= 1) { // USER EXISTS
        return res.status(200).render("view-user", {title:"View User" , user:req.user, rows:rows})
      } else { // USER DOES NOT EXIST
        return res.status(400).render("view-user", {title:"View user", user:req.user, message:"That user does not exist."})
      }
    })
  } else { 
    return res.redirect("/login")
  }
})

router.get("/user-management/edit-user/:id", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    db.query("SELECT * FROM users WHERE id = ?",[req.params.id], (err, rows) => {
      if(err) { // DATABASE ERROR
        return res.status(500).render("edit-user", {title:"Edit user", user:req.user, message:"Internal server error."})
      }
      if(!err && rows.length) { // USER EXISTS
        return res.status(200).render("edit-user", {title:"Edit User" , user:req.user, rows:rows})
      } else { // USER DOES NOT EXIST
        return res.status(400).render("edit-user", {title:"Edit User" , user:req.user, message:"That user does not exist."})
      }
    })
  }
  else { 
    res.redirect("/login")
  }
})

router.get("/user-management/create-user", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    return res.render("create-user", {title:"Create User", user:req.user})
  } else { 
    return res.redirect("/login")
  }
})

router.get("/user-management/delete-user/:id", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    db.query("UPDATE users SET email = ?, status = ? WHERE id = ?", [null, "Deleted", req.params.id], (err, rows) => {
      if(!err) { 
        req.flash("message", `User has been deleted successfully.`)
        return res.redirect("/user-management")
      } else { 
        return res.status(500).render("user-management", {title:"User Management", user:req.user, message:"Internal server error."})
      }
    })
  } else { 
    return res.redirect("/login")
  }
})

router.get("*", authController.isLoggedIn, (req, res) => {
  return res.render("error", {title: "Error 404 ", user : req.user})
})

module.exports = router