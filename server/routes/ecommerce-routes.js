const express = require("express"),
authController = require("../controllers/auth-controller"),
ecommerceManagementController = require("../controllers/ecommerce-controller"),
db = require("../config/mysql-db-setup.js"),
S3 = require("../config/aws-s3-setup.js"),
functions = require("../config/helper-functions.js"),
router = express.Router();


// USER MANAGEMENT GET ROUTES ==============================================================

router.get("/ecommerce-views/add-product", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
    return res.status(200).render("add-product", {title:"eCommerce Management - Add product", user:req.user});
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/ecommerce-views/edit-product/:id", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){

    db.query("SELECT * FROM products WHERE id = ?", [req.params.id], (err, result) => {
      if(err) { // DATABASE ERROR
        return res.status(500).render("edit-product", {title:"eCommerce Management - Edit product", user:req.user, message:"Internal server error."})
      }
      if(!err && result.length){
        return res.status(200).render("edit-product", {title:"eCommerce Management - Edit product" , user:req.user, result:result})
      } else {
        return res.status(401).render("edit-product", {title:"eCommerce Management - Edit product", user:req.user,message:"That product does not exist."});
      }
    })

  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/:image_key", (req, res) => {
  const readStream = S3.getS3ImageStream(req.params.image_key)
  readStream.pipe(res)
})

router.get("/ecommerce-views/men/view-men-products", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE gender = ?", ["men"], (err, result) => {
      if(!err) { 
        const flash = req.flash("message")
        return res.status(200).render("view-men-products", {title:"eCommerce Management - View men products" , user:req.user, result:result, flash})
      } else {
        return res.status(500).render("view-men-products", {title:"eCommerce Management - View men products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/ecommerce-views/women/view-women-products", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE gender = ?", ["women"], (err, result) => {
      if(!err) {
        const flash = req.flash("message") 
        return res.status(200).render("view-women-products", {title:"eCommerce Management - View women products" , user:req.user, result:result, flash})
      } else {
        return res.status(500).render("view-women-products", {title:"eCommerce Management - View women products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/ecommerce-views/dna/view-dna-products", authController.isLoggedIn, (req, res) => {
  if(req.user && req.user.admin === "Yes" && !functions.checkBrowser(req.headers)){
    db.query("SELECT * FROM products WHERE gender = ?", ["DNA"], (err, result) => {
      if(!err) {
        const flash = req.flash("message") 
        return res.status(200).render("view-dna-products", {title:"eCommerce Management - View dna products" , user:req.user, result:result, flash})
      } else {
        return res.status(500).render("view-dna-products", {title:"eCommerce Management - View dna products", user:req.user, message:"Internal server error."})
      }
    })
  } else {
    return res.redirect("/auth-management/auth-views/login")
  }
})

router.get("/ecommerce-views/delete-product/:gender/:id", authController.isLoggedIn, (req, res) => {
  const {gender, id} = req.params
  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if(!err) { 
      req.flash("message", `Product has been deleted successfully.`)
      return res.redirect(`/ecommerce-management/ecommerce-views/${gender}/view-${gender}-products`)
    } 
    console.log("wtf??")
  })
})

// USER MANAGEMENT POST ROUTES  ============================================================

router.post("/add-product", ecommerceManagementController.addProduct)

router.put("/edit-product-info", ecommerceManagementController.editProductInfo)

router.put("/edit-product-info-and-image", ecommerceManagementController.editProductInfoAndImage)

router.post("/search-men-products-by-brand-and-category", ecommerceManagementController.findMenProductsByBrandCategory)

router.post("/search-men-products-by-product-number", ecommerceManagementController.findMenProductsByProductNumber)

router.post("/remove-men-products", ecommerceManagementController.removeMenProducts)

router.post("/search-women-products-by-brand-and-category", ecommerceManagementController.findWomenProductsByBrandCategory)

router.post("/search-women-products-by-product-number", ecommerceManagementController.findWomenProductsByProductNumber)

router.post("/search-dna-products-by-brand-and-category", ecommerceManagementController.findDNAProductsByBrandCategory)

router.post("/search-dna-products-by-product-number", ecommerceManagementController.findDNAProductsByProductNumber)

module.exports = router;