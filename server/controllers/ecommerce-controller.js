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

exports.searchProductsByBrandCategory = (req, res) => {
  const {brand, category} = req.body,
  gender = req.params.gender;
  db.query("SELECT * FROM products WHERE gender = ? && brand = ? && category = ?", [gender, brand, category], (err, result) => {
    if(!err) { 
      return res.status(200).render(`view-${gender}-products`, {title:`User Management - View ${gender} products` , user:req.user, result:result})
    } else { 
      return res.status(500).render(`view-${gender}-products`, {title:`User Management - View ${gender} products` , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.searchProductsBySkuNumber = (req, res) => {
  const sku = req.body.sku,
  gender = req.params.gender;
  db.query("SELECT * FROM products WHERE gender = ? && sku = ?", [gender, sku], (err, result) => {
    if(!err) { 
      return res.status(200).render(`view-${gender}-products`, {title:`User Management - View ${gender} products` , user:req.user, result:result})
    } else { 
      return res.status(500).render(`view-${gender}-products`, {title:`User Management - View ${gender} products` , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.removeProducts = (req, res) => {

  const products = JSON.parse(req.body.removeProducts),
  gender = req.body.gender
  let images = []

  S3.deleteS3Images(products, (err, result) => {
    if(!err){ 
        products.forEach( p => {
          images.push(p.Key)
        })
        functions.deleteProductsFromDb(images, (err, result) => {
          if(!err){
              req.flash("message", `The ${images.length} selected product(s) have been successfully removed from your store.`)
              return res.redirect(`/ecommerce-management/ecommerce-views/${gender}/view-${gender}-products`)
          } else {
              req.flash("message", "Internal server error")
              return res.redirect(`/ecommerce-management/ecommerce-views/${gender}/view-${gender}-products`)
          }
        })
    } else {
        req.flash("message", "Internal server error")
        return res.redirect(`/ecommerce-management/ecommerce-views/${gender}/view-${gender}-products`)
    }
  })
}