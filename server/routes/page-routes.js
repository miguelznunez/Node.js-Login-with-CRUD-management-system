const express = require("express")
authController = require("../controllers/auth-controller"),
pageController = require("../controllers/page-controller"),
functions = require("../config/helper-functions.js"),
{check} = require("express-validator"),
router = express.Router();

// PAGE GET ROUTES ==============================================================

router.get("/", authController.isLoggedIn,(req, res) => {
  if(!functions.checkBrowser(req.headers)) {
    return res.status(200).render("index", {title: "Home", user:req.user})
  } else {
    return res.render("unsupported", {title:"Unsupported", user:req.user})
  }
})

router.get("/shop-products", authController.isLoggedIn,(req, res) => {
  if(!functions.checkBrowser(req.headers)) {
    return res.status(200).render("shop-products", {title: "Shop products", user:req.user})
  } else {
    return res.render("unsupported", {title:"Unsupported", user:req.user})
  }
})

// PAGE POST ROUTES  ============================================================

router.post("/newsletter-form",
[
  check("email", "The email you entered is invalid, please try again.").isEmail().normalizeEmail(),
  check("email", "Email address must be between 4-100 characters long, please try again.").isLength({min:4, max:100}).normalizeEmail()
], pageController.newsletterForm)


// ROUTE DOES NOT EXIST  ========================================================

router.get("*", authController.isLoggedIn, (req, res) => {
  return res.render("404-error", {title: "Error 404 ", user:req.user})
})

module.exports = router