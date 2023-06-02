const express = require("express")
authController = require("../controllers/auth-controller"),
pageController = require("../controllers/page-controller"),
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

// PAGE GET ROUTES ==============================================================

router.get("/", authController.isLoggedIn,(req, res) => {
  if(!checkBrowser(req.headers)) {
    return res.status(200).render("index", {title: "Home", user:req.user})
  } else {
    return res.render("unsupported", {title:"Unsupported", user:req.user})
  }
})

router.get("/shop-products", authController.isLoggedIn,(req, res) => {
  if(!checkBrowser(req.headers)) {
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
  return res.render("error", {title: "Error 404 ", user:req.user})
})

module.exports = router