const { PI } = require("aws-sdk"),
mysql = require("mysql"),
multer  = require("multer"),
path = require("path"),
multerS3 = require("multer-s3-v2"),
S3 = require("../config/aws-s3-setup.js"),
db = require("../config/mysql-db-setup.js");

require("dotenv").config();

const storage = multerS3({
  s3: S3.s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: (req, file, callback) => {
    callback(null, { originalname: file.originalname });
  },
  key: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    callback(null, uniqueSuffix + path.extname(file.originalname))
  }
})

function checkFileType(file, callback){
  const filetypes = /jpeg|png|jpg|gif/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if(mimetype && extname){
    return callback(null,true)
  } else {
    return callback("Please upload images only")
  }
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, callback) => {
    checkFileType(file, callback)
  }
}).any()

exports.addProduct = (req, res) => {
  upload(req, res, (err) => {
    if(!err && req.files != "") {
      saveProductInDB(req.files, req.body, (err, result) => {
        if(!err){
          return res.status(200).json({statusMessage:"Product has been added successfully.", status:200})
        } else {
          return res.status(500).json({statusMessage:"Internal server error", status:500})
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
  editProductInfoInDB(req.body, (err, result) => {
    if(!err){
      return res.status(200).json({statusMessage:"Product has been edited successfully.", status:200})
    } else {
      return res.status(500).json({statusMessage:"Internal server error", status:500})
    }
  })
}

exports.editProductInfoImage = (req, res) => {
  upload(req, res, (err) => {
    if(!err && req.files != "") { 
      S3.deleteS3Image(req.body.pSavedImage, (err, result) => {
        if(!err){
            editProductInfoImageInDB(req.files, req.body, (err, result) => {
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
  const {pBrand, pCategory} = req.body
  db.query("SELECT * FROM products WHERE pGender = ? && pBrand = ? && pCategory = ?", ["men", pBrand, pCategory], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-men-products", {title:"User Management - View men products" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("view-men-products", {title:"User Management - View men products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findMenProductsByProductNumber = (req, res) => {
  const pNumber = req.body.pNumber
  db.query("SELECT * FROM products WHERE pGender = ? && pNumber = ?", ["men", pNumber], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-men-products", {title:"User Management - View men products" , user:req.user, rows:rows})
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
        deleteProductsFromDb(images, (err, result) => {
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
  const {pBrand, pCategory} = req.body
  db.query("SELECT * FROM products WHERE pGender = ? && pBrand = ? && pCategory = ?", ["women", pBrand, pCategory], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-women-products", {title:"User Management - View women products" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("view-women-products", {title:"User Management - View women products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findWomenProductsByProductNumber = (req, res) => {
  const pNumber = req.body.pNumber
  db.query("SELECT * FROM products WHERE pGender = ? && pNumber = ?", ["women", pNumber], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-women-products", {title:"User Management - View women products" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("view-women-products", {title:"User Management - View women products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findDNAProductsByBrandCategory = (req, res) => {
  const {pBrand, pCategory} = req.body
  db.query("SELECT * FROM products WHERE pGender = ? && pBrand = ? && pCategory = ?", ["DNA", pBrand, pCategory], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findDNAProductsByProductNumber = (req, res) => {
  const pNumber = req.body.pNumber
  db.query("SELECT * FROM products WHERE pGender = ? && pNumber = ?", ["DNA", pNumber], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("view-dna-products", {title:"User Management - View DNA products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

saveProductInDB = (pImage, pInfo, callback) => {
  const {pCategory, pGender, pBrand, pNumber, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL} = pInfo
  db.query("INSERT INTO products (pCategory, pGender, pImage, pBrand, pNumber, pName, pPrice, pDescription, pQuantity_OS,pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [pCategory, pGender, pImage[0].key, pBrand, pNumber, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

editProductInfoInDB = (pInfo, callback) => {
  const {pId, pCategory, pGender, pImage, pBrand, pNumber, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL} = pInfo
  db.query("UPDATE products SET pCategory = ?, pGender = ?, pImage = ?, pBrand = ?, pNumber = ?, pName = ?, pPrice = ?, pDescription = ?, pQuantity_OS = ?, pQuantity_XS = ?, pQuantity_S = ?, pQuantity_M = ?, pQuantity_L = ?, pQuantity_XL = ?, pQuantity_XXL = ? WHERE pId = ?", [pCategory, pGender, pImage, pBrand, pNumber, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL, pId], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

editProductInfoImageInDB = (pImage, pInfo, callback) => {
  const {pId, pCategory, pGender, pBrand, pNumber, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL} = pInfo
  db.query("UPDATE products SET pCategory = ?, pGender = ?, pImage = ?, pBrand = ?, pNumber = ?, pName = ?, pPrice = ?, pDescription = ?, pQuantity_OS = ?, pQuantity_XS = ?, pQuantity_S = ?, pQuantity_M = ?, pQuantity_L = ?, pQuantity_XL = ?, pQuantity_XXL = ? WHERE pId = ?", [pCategory, pGender, pImage[0].key, pBrand, pNumber, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL, pId], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

deleteProductsFromDb = (images, callback) => {
  db.query("DELETE FROM products WHERE pImage IN (?)", [images], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}