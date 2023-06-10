const { PI } = require("aws-sdk"),
S3 = require("../config/aws-s3-setup.js"),
db = require("../config/mysql-db-setup.js"),
multer = require("../config/multer-setup.js"),
functions = require("../config/helper-functions.js");

exports.addProduct = (req, res) => {

  multer.upload(req, res, (err) => {
    if(!err && req.files != "") {
      functions.saveProductInDB(req.body, req.files, (err, result) => {
        if(!err){
          return res.status(200).json({statusMessage:"Product has been added successfully.", status:200})
        } else {
          console.log(err)
          return res.status(500).json({statusMessage:err.sqlMessage, status:500})
        }
      })
    } else if (!err && req.files == ""){
      return res.status(400).json({statusMessage:"Please select an image to upload.", status:400})
    } else {
      let error =  (err === "Please upload images only" ? err : "Photo exceeds limit of 1MB") ;
      return res.status(400).json({statusMessage:error, status:400})
    }
  })  

}

exports.editProductInfo = (req, res) => {
  functions.editProductInfoInDB(req.body, (err, result) => {
    if(!err){
      return res.status(200).json({statusMessage:"Product has been edited successfully.", status:200})
    } else {
      return res.status(500).json({statusMessage:err.sqlMessage, status:500})
    }
  })
}

exports.editProductInfoAndImage = (req, res) => {

  multer.upload(req, res, (err) => {
    if(!err && req.files != "") { 
      S3.deleteS3Image(req.body.savedImage, (err, result) => {
        if(!err){
          functions.editProductInfoImageInDB(req.body, req.files, (err, result) => {
            if(!err){
              return res.status(200).json({statusMessage:"Product has been edited successfully.", status:200})
            } else {
              return res.status(200).json({statusMessage:"Internal server error", status:500})
            }
          })
        } else {
          return res.status(200).json({statusMessage:"Internal server error", status:500})
        }
      })
    } else if (!err && req.files == ""){
      return res.status(400).json({statusMessage:"Please select an image to upload.", status:400})
    } else {
      let error =  (err === "Please upload images only" ? err : "Photo exceeds limit of 1MB") ;
      return res.status(400).json({statusMessage:error, status:400})
    }
  }) 

}

exports.findMenProductsByBrandCategory = (req, res) => {
  const {brand, category} = req.body
  db.query("SELECT * FROM products WHERE gender = ? && brand = ? && category = ?", ["men", brand, category], (err, result) => {
    if(!err) { 
      return res.status(200).render("view-men-products", {title:"User Management - View men products" , user:req.user, result:result})
    } else { 
      return res.status(500).render("view-men-products", {title:"User Management - View men products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findMenProductsByProductNumber = (req, res) => {
  const sku = req.body.sku
  db.query("SELECT * FROM products WHERE gender = ? && sku = ?", ["men", sku], (err, result) => {
    if(!err) { 
      return res.status(200).render("view-men-products", {title:"User Management - View men products" , user:req.user, result:result})
    } else { 
      return res.status(500).render("view-men-products", {title:"User Management - View men products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.removeMenProducts = (req, res) => {

  const products = JSON.parse(req.body.removeProducts)
  let images = []

  S3.deleteS3Images(products, (err, result) => {
    if(!err){ 
        products.forEach( p => {
          images.push(p.Key)
        })
        functions.deleteProductsFromDb(images, (err, result) => {
          if(!err){
              req.flash("message", `The ${images.length} selected product(s) have been successfully removed from your store.`)
              return res.redirect("/ecommerce-management/ecommerce-views/men/view-men-products")
          } else {
              req.flash("message", "Internal server error")
              return res.redirect("/ecommerce-management/ecommerce-views/men/view-men-products")
          }
        })
    } else {
        req.flash("message", "Internal server error")
        return res.redirect("/ecommerce-management/ecommerce-views/men/view-men-products")
    }
  })
}

exports.findWomenProductsByBrandCategory = (req, res) => {
  const {brand, category} = req.body
  db.query("SELECT * FROM products WHERE gender = ? && brand = ? && category = ?", ["women", brand, category], (err, result) => {
    if(!err) { 
      return res.status(200).render("view-women-products", {title:"User Management - View women products" , user:req.user, result:result})
    } else { 
      return res.status(500).render("view-women-products", {title:"User Management - View women products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findWomenProductsByProductNumber = (req, res) => {
  const sku = req.body.sku
  db.query("SELECT * FROM products WHERE gender = ? && sku = ?", ["women", sku], (err, result) => {
    if(!err) { 
      return res.status(200).render("view-women-products", {title:"User Management - View women products" , user:req.user, result:result})
    } else { 
      return res.status(500).render("view-women-products", {title:"User Management - View women products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findDNAProductsByBrandCategory = (req, res) => {
  const {brand, category} = req.body
  db.query("SELECT * FROM products WHERE gender = ? && brand = ? && category = ?", ["DNA", brand, category], (err, result) => {
    if(!err) { 
      return res.status(200).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, result:result})
    } else { 
      return res.status(500).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findDNAProductsByProductNumber = (req, res) => {
  const sku = req.body.sku
  db.query("SELECT * FROM products WHERE gender = ? && sku = ?", ["DNA", sku], (err, result) => {
    if(!err) { 
      return res.status(200).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, result:result})
    } else { 
      return res.status(500).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}