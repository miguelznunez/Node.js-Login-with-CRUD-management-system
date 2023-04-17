const express = require("express"),
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

router.get("/profile-views/profile", authController.isLoggedIn, (req, res) => {
  if(req.user && !checkBrowser(req.headers)) {
    return res.status(200).render("profile", {title:"Profile", user:req.user} )
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

module.exports = router;