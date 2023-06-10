const express = require("express")
authController = require("../controllers/auth-controller"),
pageController = require("../controllers/page-controller"),
db = require("../config/mysql-db-setup.js"),
functions = require("../config/helper-functions.js"),
{check} = require("express-validator"),
router = express.Router();

// PAGE GET ROUTES ==============================================================

router.get("/", authController.isLoggedIn,(req, res) => {
  if(!functions.checkBrowser(req.headers)) {
    db.query("SELECT * FROM products", (err, result) => {
      if(!err){
        return res.status(200).render("index", {title: "Home", user:req.user, result:result})
      } else {
        console.log(err.sqlMessage)
        return res.status(200).render("index", {title: "Home", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.render("unsupported", {title:"Unsupported", user:req.user})
  }
})

router.get("/cart", authController.isLoggedIn,(req, res) => {
  console.log(req.session.cart)
  var cart = req.session.cart
  var total = req.session.total
  return res.render("cart", {title:"Cart", cart:cart, total:total})
})

// PAGE POST ROUTES  ============================================================

router.post("/newsletter-form",
[
  check("email", "The email you entered is invalid, please try again.").isEmail().normalizeEmail(),
  check("email", "Email address must be between 4-100 characters long, please try again.").isLength({min:4, max:100}).normalizeEmail()
], pageController.newsletterForm)

router.post("/add-to-cart", pageController.addToCartForm)

router.post("/remove-product", pageController.removeProduct)


// ROUTE DOES NOT EXIST  ========================================================

router.get("*", authController.isLoggedIn, (req, res) => {
  return res.status(404).render("404-error", {title: "Error 404 ", user:req.user})
})

module.exports = router