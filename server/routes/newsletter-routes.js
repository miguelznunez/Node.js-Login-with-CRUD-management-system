const express = require("express"),
db = require("../config/db-setup.js"),
authController = require("../controllers/auth-controller"),
newsletterController = require("../controllers/newsletter-controller"),
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

router.get("/newsletter-views/subscribers", authController.isLoggedIn,(req, res) => {

    if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
        db.query("SELECT * FROM newsletter", (err, rows) => {
          if(!err) {
            const flash = req.flash("message") 
            return res.status(200).render("subscribers", {title:"Newsletter Management - Subscribers" , user:req.user, rows:rows, flash})
          } else {
            return res.status(500).render("subscribers", {title:"Newsletter Management - Subscribers", user:req.user, message:"Internal server error."})
          }
        })
      } else {
        return res.redirect("/auth-management/auth-views/login")
      }

})

router.get("/newsletter-views/edit-subscriber/:nId", authController.isLoggedIn,(req, res) => {
    if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
        db.query("SELECT * FROM newsletter WHERE nId = ?", [req.params.nId], (err, rows) => {
          if(!err) {
            return res.status(200).render("edit-subscriber", {title:"Newsletter Management - Edit subscriber" , user:req.user, rows:rows})
          } else {
            return res.status(500).render("edit-subscriber", {title:"Newsletter Management - Edit subscriber", user:req.user, message:"Internal server error."})
          }
        })
    } else {
        return res.redirect("/auth-management/auth-views/login")
    }
})

router.get("/newsletter-views/create-subscriber", authController.isLoggedIn,(req, res) => {
    if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){          
        return res.status(200).render("create-subscriber", {title:"Newsletter Management - Create subscriber" , user:req.user})
    } else {
        return res.redirect("/auth-management/auth-views/login")
    }
})

router.get("/newsletter-views/compose-email", authController.isLoggedIn,(req, res) => {

    if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
        return res.status(200).render("compose-email", {title:"Newsletter Management - Compose email" , user:req.user})
        
    } else {
        return res.redirect("/auth-management/auth-views/login")
    }

})

// NEWSLETTER MANAGEMENT POST ROUTES  ============================================================

router.post("/newsletter-views/search-subscribers", authController.isLoggedIn, newsletterController.searchSubscribers)

router.post("/newsletter-views/remove-subscribers", authController.isLoggedIn, newsletterController.removeSubscribers)

router.post("/newsletter-views/create-subscriber",
[
    check("nEmail", "The email you entered is invalid, please try again.").isEmail().normalizeEmail(),
    check("nEmail", "Email address must be between 4-100 characters long, please try again.").isLength({min:4, max:100}).normalizeEmail()
], authController.isLoggedIn, newsletterController.createSubscriber)

router.post("/newsletter-views/send-newsletter-email", authController.isLoggedIn, newsletterController.sendNewsletterEmail)

module.exports = router