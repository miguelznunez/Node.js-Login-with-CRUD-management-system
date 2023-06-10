const express = require("express"),
db = require("../config/mysql-db-setup.js"),
authController = require("../controllers/auth-controller"),
newsletterController = require("../controllers/newsletter-controller"),
functions = require("../config/helper-functions.js"),
{check} = require("express-validator"),
router = express.Router();


router.get("/newsletter-views/view-subscribers", authController.isLoggedIn,(req, res) => {

    if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
        db.query("SELECT * FROM newsletter", (err, result) => {
          if(!err) {
            const flash = req.flash("message") 
            return res.status(200).render("view-subscribers", {title:"Newsletter Management - Subscribers" , user:req.user, result:result, flash})
          } else {
            return res.status(500).render("view-subscribers", {title:"Newsletter Management - Subscribers", user:req.user, message:"Internal server error."})
          }
        })
      } else {
        return res.redirect("/auth-management/auth-views/login")
      }

})

router.get("/newsletter-views/edit-subscriber/:nId", authController.isLoggedIn,(req, res) => {
    if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
        db.query("SELECT * FROM newsletter WHERE nId = ?", [req.params.nId], (err, result) => {
          if(!err) {
            return res.status(200).render("edit-subscriber", {title:"Newsletter Management - Edit subscriber" , user:req.user, result:result})
          } else {
            return res.status(500).render("edit-subscriber", {title:"Newsletter Management - Edit subscriber", user:req.user, message:"Internal server error."})
          }
        })
    } else {
        return res.redirect("/auth-management/auth-views/login")
    }
})

router.get("/newsletter-views/add-subscriber", authController.isLoggedIn,(req, res) => {
    if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){          
        return res.status(200).render("add-subscriber", {title:"Newsletter Management - Add subscriber" , user:req.user})
    } else {
        return res.redirect("/auth-management/auth-views/login")
    }
})

router.get("/newsletter-views/compose-email", authController.isLoggedIn,(req, res) => {
    if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
        return res.status(200).render("compose-email", {title:"Newsletter Management - Compose email" , user:req.user})
    } else {
        return res.redirect("/auth-management/auth-views/login")
    }
})

// NEWSLETTER MANAGEMENT POST ROUTES  ============================================================

router.post("/newsletter-views/search-subscribers", authController.isLoggedIn, newsletterController.searchSubscribers)

router.post("/newsletter-views/remove-subscribers", authController.isLoggedIn, newsletterController.removeSubscribers)

router.post("/newsletter-views/add-subscriber",
[
    check("nEmail", "The email you entered is invalid, please try again.").isEmail().normalizeEmail(),
    check("nEmail", "Email address must be between 4-100 characters long, please try again.").isLength({min:4, max:100}).normalizeEmail()
], authController.isLoggedIn, newsletterController.addSubscriber)

router.post("/newsletter-views/send-newsletter-email", authController.isLoggedIn, newsletterController.sendNewsletterEmail)

module.exports = router