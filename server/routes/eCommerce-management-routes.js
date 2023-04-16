const express = require("express"),
authController = require("../controllers/auth-controller");

const {check} = require("express-validator"),
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

router.get("/dashboard", authController.isLoggedIn, (req, res) => {
  if(req.user && !checkBrowser(req.headers)){
    return res.status(200).render("dashboard", {title:"eCommerce Management - Dashboard", user:req.user});
  } else {
    return res.redirect("/")
  }
})

module.exports = router;