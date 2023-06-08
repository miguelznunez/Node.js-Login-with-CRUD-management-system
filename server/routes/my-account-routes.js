const express = require("express"),
authController = require("../controllers/auth-controller"),
myAccountController = require("../controllers/my-account-controller"),
functions = require("../config/helper-functions.js"),
router = express.Router();


router.get("/my-account-views/my-account", authController.isLoggedIn, (req, res) => {
  if(req.user && !functions.checkBrowser(req.headers)) {
    const flash = req.flash("message") 
    return res.status(200).render("my-account", {title:"My Account", user:req.user, flash} )
  } else { 
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.post("/my-account-views/delete-account", myAccountController.deleteAccount)

module.exports = router;