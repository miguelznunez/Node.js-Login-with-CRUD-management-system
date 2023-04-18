const express = require("express"),
authController = require("../controllers/auth-controller"),
ecommerceManagementController = require("../controllers/ecommerce-controller"),
db = require("../config/db-setup.js"),
{getImageStream} = require("../config/s3-setup.js");

const router = express.Router();

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

router.get("/ecommerce-views/create-product", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    return res.status(200).render("create-product", {title:"eCommerce Management - Create product", user:req.user});
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/:image_key", (req, res) => {
  const readStream = getImageStream(req.params.image_key)
  readStream.pipe(res)
})

// DNA

router.get("/ecommerce-views/dna/view-electronics", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE pGender = ? AND pCategory = ?", ["DNA","electronics"], (err, rows) => {
      if(!err) { 
        return res.status(200).render("view-electronics", {title:"eCommerce Management - View products" , user:req.user, rows:rows})
      } else {
        return res.status(500).render("view-electronics", {title:"eCommerce Management - View products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

// MEN

router.get("/ecommerce-views/men/view-men-shirts", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE pGender = ? AND pCategory = ?", ["men","shirts"], (err, rows) => {
      if(!err) { 
        return res.status(200).render("view-men-shirts", {title:"eCommerce Management - View products" , user:req.user, rows:rows})
      } else {
        return res.status(500).render("view-men-shirts", {title:"eCommerce Management - View products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

// WOMEN

router.get("/ecommerce-views/women/view-women-shirts", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE pGender = ? AND pCategory = ?", ["women","shirts"], (err, rows) => {
      if(!err) { 
        return res.status(200).render("view-women-shirts", {title:"eCommerce Management - View products" , user:req.user, rows:rows})
      } else {
        return res.status(500).render("view-women-shirts", {title:"eCommerce Management - View products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})




// USER MANAGEMENT POST ROUTES  ============================================================

router.post("/create-product", ecommerceManagementController.createProduct)

router.post("/find-men-shirts", ecommerceManagementController.findMenShirts)

router.post("/find-women-shirts", ecommerceManagementController.findWomenShirts)

module.exports = router;