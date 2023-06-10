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
      saveProductInDB(req.body, req.files, (err, result) => {
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
  editProductInfoInDB(req.body, (err, result) => {
    if(!err){
      return res.status(200).json({statusMessage:"Product has been edited successfully.", status:200})
    } else {
      return res.status(500).json({statusMessage:err.sqlMessage, status:500})
    }
  })
}

exports.editProductInfoAndImage = (req, res) => {

  upload(req, res, (err) => {
    if(!err && req.files != "") { 
      S3.deleteS3Image(req.body.savedImage, (err, result) => {
        if(!err){
          editProductInfoImageInDB(req.body, req.files, (err, result) => {
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

saveProductInDB = (data, image, callback) => {
  const {name, brand, description, price, sale_price, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL} = data

  if(sale_price == "" || sale_price == 0){
    db.query("INSERT INTO products (name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [name, brand, description, price, null, image[0].key, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  } else {
    db.query("INSERT INTO products (name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [name, brand, description, price, sale_price, image[0].key, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL], (err, result) => {
      if(err) callback(err, null)
      else callback(null, result)
    })
  }
}

editProductInfoInDB = (data, callback) => {
  const {id, name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL} = data
  db.query("UPDATE products SET name = ?, brand = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, gender = ?, sku = ?, quantity = ?, quantity_XS = ?, quantity_S = ?, quantity_M = ?, quantity_L = ?, quantity_XL = ?, quantity_XXL = ? WHERE id = ?", [name, brand, description, price, sale_price, image, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, id], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

editProductInfoImageInDB = (data, image, callback) => {
  const {id, name, brand, description, price, sale_price, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL} = data
  db.query("UPDATE products SET name = ?, brand = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, gender = ?, sku = ?, quantity = ?, quantity_XS = ?, quantity_S = ?, quantity_M = ?, quantity_L = ?, quantity_XL = ?, quantity_XXL = ? WHERE id = ?", [name, brand, description, price, sale_price, image[0].key, category, gender, sku, quantity, quantity_XS, quantity_S, quantity_M, quantity_L, quantity_XL, quantity_XXL, id], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}

deleteProductsFromDb = (images, callback) => {
  db.query("DELETE FROM products WHERE image IN (?)", [images], (err, result) => {
    if(err) callback(err, null)
    else callback(null, result)
  })
}