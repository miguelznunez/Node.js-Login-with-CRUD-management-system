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

router.get("/ecommerce-views/edit-product/:pId", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE pId = ?", [req.params.pId], (err, rows) => {
      if(!err){
        return res.status(200).render("edit-product", {title:"eCommerce Management - Edit product" , user:req.user, rows:rows})
      } else {
        return res.status(200).render("edit-product", {title:"eCommerce Management - Edit product", user:req.user});
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/:image_key", (req, res) => {
  const readStream = getImageStream(req.params.image_key)
  readStream.pipe(res)
})

router.get("/ecommerce-views/men/view-men-products", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE pGender = ?", ["men"], (err, rows) => {
      if(!err) { 
        return res.status(200).render("view-men-products", {title:"eCommerce Management - View men products" , user:req.user, rows:rows})
      } else {
        return res.status(500).render("view-men-products", {title:"eCommerce Management - View men products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/ecommerce-views/women/view-women-products", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE pGender = ?", ["women"], (err, rows) => {
      if(!err) { 
        return res.status(200).render("view-women-products", {title:"eCommerce Management - View women products" , user:req.user, rows:rows})
      } else {
        return res.status(500).render("view-women-products", {title:"eCommerce Management - View women products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/ecommerce-views/dna/view-dna-products", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE pGender = ?", ["DNA"], (err, rows) => {
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




// USER MANAGEMENT POST ROUTES  ============================================================

router.post("/create-product", ecommerceManagementController.createProduct)

router.put("/edit-product-info", ecommerceManagementController.editProductInfo)

router.put("/edit-product-image", ecommerceManagementController.editProductImage)

router.post("/search-men-products-by-brand-and-category", ecommerceManagementController.findMenProductsByBrandCategory)

router.post("/search-men-products-by-product-number", ecommerceManagementController.findMenProductsByProductNumber)

router.post("/search-women-products-by-brand-and-category", ecommerceManagementController.findWomenProductsByBrandCategory)

router.post("/search-women-products-by-product-number", ecommerceManagementController.findWomenProductsByProductNumber)

module.exports = router;