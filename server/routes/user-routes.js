const express = require("express"),
userManagementController = require("../controllers/user-controller"),
authController = require("../controllers/auth-controller"),
db = require("../config/db-setup.js"),
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

// USER MANAGEMENT GET ROUTES ==============================================================

router.get("/user-views/active-users", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    db.query("SELECT * FROM users WHERE status = 'Active'", (err, rows) => {
      if(!err) { 
        const flash = req.flash("message")
        return res.status(200).render("active-users", {title:"User Management - Active Users" , user:req.user, rows:rows, flash})
      } else {
        return res.status(500).render("active-users", {title:"User Management - Active Users", user:req.user, message:"Internal server error."})
      }
    })
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/banned-users", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    db.query("SELECT * FROM users WHERE status = 'Banned'", (err, rows) => {
      if(!err) { 
        const flash = req.flash("message")
        return res.status(200).render("banned-users", {title:"User Management - Banned Users" , user:req.user, rows:rows, flash})
      } else {
        return res.status(500).render("banned-users", {title:"User Management - Banned Users", user:req.user, message:"Internal server error."})
      }
    })
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/deleted-users", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    db.query("SELECT * FROM users WHERE status = 'Deleted'", (err, rows) => {
      if(!err) { 
        return res.status(200).render("deleted-users", {title:"User Management - Deleted Users" , user:req.user, rows:rows})
      } else {
        return res.status(500).render("deleted-users", {title:"User Management - Deleted Users", user:req.user, message:"Internal server error."})
      }
    })
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/admin-users", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    db.query("SELECT * FROM users WHERE admin = 'Yes' AND status != 'Deleted'", (err, rows) => {
      if(!err) { 
        return res.status(200).render("admin-users", {title:"User Management - Admin Users" , user:req.user, rows:rows})
      } else {
        return res.status(500).render("admin-users", {title:"User Management - Admin Users", user:req.user, message:"Internal server error."})
      }
    })
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/view-user/:id", authController.isLoggedIn, (req, res) => {
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
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/edit-user/:id", authController.isLoggedIn, (req, res) => {
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
    res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/create-user", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {
    return res.render("create-user", {title:"Create User", user:req.user})
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/delete-active-user/:id", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {

    db.query("SELECT * FROM federated_credentials WHERE user_id = ?", [req.params.id], (err, row) => {
      // IF USER EXISTS IN FEDERATED CREDENTIALS
      if(!err && row){
        // REMOVE
        db.query("UPDATE federated_credentials SET subject = ? WHERE user_id = ?", [null, req.params.id], (err, rows) => {
          if(!err) { 
            db.query("UPDATE users SET email = ?, status = ? WHERE id = ?", [null, "Deleted", req.params.id], (err, rows) => {
              if(!err) { 
                req.flash("message", `User has been deleted successfully.`)
                return res.redirect("/user-management/user-views/active-users")
              } else { 
                return res.status(500).render("active-users", {title:"User Management - Active Users", user:req.user, message:"Internal server error."})
              }
           })
          } else { 
            return res.status(500).render("active-users", {title:"User Management - Active Users", user:req.user, message:"Internal server error."})
          }
        })
      // IF THEY DONT: DELETE FROM USERS TABLE ONLY
      } else if(!err && !row) {
        db.query("UPDATE users SET email = ?, status = ? WHERE id = ?", [null, "Deleted", req.params.id], (err, rows) => {
          if(!err) { 
            req.flash("message", `Account has been deleted successfully.`)
            return res.redirect("/user-management/user-views/active-users")
          } else { 
            return res.status(500).render("active-users", {title:"User Management - Active Users", user:req.user, message:"Internal server error."})
          }
        })
      // DB ERROR
      } else {
        return res.status(500).render("active-users", {title:"User Management - Active Users", user:req.user, message:"Internal server error."})
      }
    })
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})
// DELETE GOOGLE USER PROVIDER
router.get("/user-views/delete-banned-user/:id", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)) {

    db.query("SELECT * FROM federated_credentials WHERE user_id = ?", [req.params.id], (err, row) => {
      // IF USER EXISTS IN FEDERATED CREDENTIALS
      if(!err && row){
        // REMOVE
        db.query("UPDATE federated_credentials SET subject = ? WHERE user_id = ?", [null, req.params.id], (err, rows) => {
          if(!err) { 
            db.query("UPDATE users SET email = ?, status = ? WHERE id = ?", [null, "Deleted", req.params.id], (err, rows) => {
              if(!err) { 
                req.flash("message", `User has been deleted successfully.`)
                return res.redirect("/user-management/user-views/banned-users")
              } else { 
                return res.status(500).render("banned-users", {title:"User Management - Banned Users", user:req.user, message:"Internal server error."})
              }
           })
          } else { 
            return res.status(500).render("banned-users", {title:"User Management - Banned Users", user:req.user, message:"Internal server error."})
          }
        })
      // IF THEY DONT: DELETE FROM USERS TABLE ONLY
      } else if(!err && !row) {
        db.query("UPDATE users SET email = ?, status = ? WHERE id = ?", [null, "Deleted", req.params.id], (err, rows) => {
          if(!err) { 
            req.flash("message", `User has been deleted successfully.`)
            return res.redirect("/user-management/user-views/banned-users")
          } else { 
            return res.status(500).render("banned-users", {title:"User Management - Banned Users", user:req.user, message:"Internal server error."})
          }
        })
      // DB ERROR
      } else {
        return res.status(500).render("banned-users", {title:"User Management - Banned Users", user:req.user, message:"Internal server error."})
      }
    })

  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

// USER MANAGEMENT POST ROUTES  ============================================================

router.post("/user-views/find-active-users", authController.isLoggedIn, userManagementController.findActiveUsers)

router.post("/user-views/find-banned-users", authController.isLoggedIn, userManagementController.findBannedUsers)

router.post("/user-views/find-deleted-users", authController.isLoggedIn, userManagementController.findDeletedUsers)

router.post("/user-views/find-admin-users", authController.isLoggedIn, userManagementController.findAdminUsers)

router.post("/user-views/create-user",
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
], userManagementController.createUser)

router.post("/user-views/update-user", userManagementController.updateUser)

module.exports = router;