const express = require("express")
authController = require("../controllers/auth-controller"),
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

router.get("*", authController.isLoggedIn, (req, res) => {
  return res.render("error", {title: "Error 404 ", user:req.user})
})

module.exports = router