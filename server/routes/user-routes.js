const express = require("express"),
userManagementController = require("../controllers/user-controller"),
authController = require("../controllers/auth-controller"),
db = require("../config/mysql-db-setup.js"),
functions = require("../config/helper-functions.js"),
{check} = require("express-validator"),
router = express.Router();

// USER MANAGEMENT GET ROUTES ==============================================================

router.get("/user-views/:status", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)) {
    const status = req.params.status
    if(status !== "admin") {
      db.query("SELECT * FROM users WHERE status = ?", [status], (err, result) => {
        if(!err) { 
          const flash = req.flash("message")
          return res.status(200).render(`${status}`, {title:`User Management - ${status} users` , user:req.user, result:result, flash})
        } else {
          return res.status(500).render(`${status}`, {title:`User Management - ${status} users`, user:req.user, message:"Internal server error"})
        }
      })
    } else {
      db.query("SELECT * FROM users WHERE admin = 'Yes' AND status != 'Deleted'", (err, result) => {
        if(!err) { 
          return res.status(200).render("admin", {title:"User Management - admin users" , user:req.user, result:result})
        } else {
          return res.status(500).render("admin", {title:"User Management - admin users", user:req.user, message:"Internal server error."})
        }
      })
    }
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})


router.get("/user-views/view-user/:id/:status", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
    db.query("SELECT * FROM users LEFT JOIN federated_credentials ON users.id = federated_credentials.user_id WHERE users.id = ?",[req.params.id], (err, result) => {
      if(err) { // DATABASE ERROR
        return res.status(500).render("view-user", {title:"View user", user:req.user, message:"Internal server error.", status:req.params.status})
      }
      if(!err && result.length == 1) { // USER EXISTS
        const userId = req.params.id
        return res.status(200).render("view-user", {title:"View User" , user:req.user, result:result, userId:userId, status:req.params.status})
      } else { // USER DOES NOT EXIST
        return res.status(400).render("view-user", {title:"View user", user:req.user, message:"That user does not exist.", status:req.params.status})
      }
    })
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/edit-user/:id/:status", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)) {
    db.query("SELECT * FROM users WHERE id = ?",[req.params.id], (err, result) => {
      if(err) { // DATABASE ERROR
        return res.status(500).render("edit-user", {title:"Edit user", user:req.user, message:"Internal server error.", status:req.params.status})
      }
      if(!err && result.length) { // USER EXISTS
        return res.status(200).render("edit-user", {title:"Edit User" , user:req.user, result:result, status:req.params.status})
      } else { // USER DOES NOT EXIST
        return res.status(400).render("edit-user", {title:"Edit User" , user:req.user, message:"That user does not exist.", status:req.params.status})
      }
    })
  }
  else { 
    res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/add-user/:status", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)) {
    return res.render("add-user", {title:"Add User", user:req.user, status:req.params.status})
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/user-views/delete-user/:status/:id", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)) {

    const {status, id} = req.params

    db.query("SELECT * FROM federated_credentials WHERE user_id = ?", [id], (err, result) => {

      if(err){
        return res.status(500).render(`${status.toLowerCase()}-users`, {title:`User Management - ${status} Users", user:req.user, message:"Internal server error.`})
      }

      // IF USER EXISTS IN FEDERATED CREDENTIALS
      if(!err && result != ""){

        console.log("Google user")

        db.query("UPDATE federated_credentials SET subject = ? WHERE user_id = ?", [null, id], (err, rows) => {
          if(!err) { 
            db.query("UPDATE users SET email = ?, status = ?, deleted = ? WHERE id = ?", [null, "Deleted", functions.getDate(), id], (err, result) => {
              if(!err) { 
                req.flash("message", `The selected user was successfully deleted.`)
                return res.redirect(`/user-management/user-views/${status.toLowerCase()}-users`)
              } else { 
                return res.status(500).render(`${status.toLowerCase()}-users`, {title:`User Management - ${status} Users", user:req.user, message:"Internal server error.`})
              }
           })
          } else { 
            return res.status(500).render(`${status.toLowerCase()}-users`, {title:`User Management - ${status} Users", user:req.user, message:"Internal server error.`})
          }
        })
      } else {
        console.log("Email user")
        db.query("UPDATE users SET email = ?, status = ?, deleted = ? WHERE id = ?", [null, "Deleted", functions.getDate(), id], (err, result) => {
          if(!err) { 
            req.flash("message", `The selected user was successfully deleted.`)
            return res.redirect(`/user-management/user-views/${status.toLowerCase()}-users`)
          } else { 
            return res.status(500).render(`${status.toLowerCase()}-users`, {title:`User Management - ${status} Users", user:req.user, message:"Internal server error.`})
          }
        })
      } 
    })
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

// USER MANAGEMENT POST ROUTES  ============================================================

router.post("/user-views/search-active-users", authController.isLoggedIn, userManagementController.searchActiveUsers)

router.post("/user-views/search-banned-users", authController.isLoggedIn, userManagementController.searchBannedUsers)

router.post("/user-views/search-inactive-users", authController.isLoggedIn, userManagementController.searchInactiveUsers)

router.post("/user-views/search-deleted-users", authController.isLoggedIn, userManagementController.searchDeletedUsers)

router.post("/user-views/search-admin-users", authController.isLoggedIn, userManagementController.searchAdminUsers)

router.post("/user-views/add-user",
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
], userManagementController.addUser)

router.post("/user-views/update-user", userManagementController.updateUser)

module.exports = router;