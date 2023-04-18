const mysql = require("mysql"),
multer  = require("multer"),
path = require("path"),
multerS3 = require("multer-s3-v2"),
{s3} = require("../config/s3-setup.js"),
db = require("../config/db-setup.js");

require("dotenv").config();

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: function(req, file, cb) {
    cb(null, { originalname: file.originalname });
  },
  key: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

function checkFileType(file, cb){
  const filetypes = /jpeg|png|jpg|gif/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if(mimetype && extname){
    return cb(null,true)
  } else {
    cb("Please upload images only")
  }
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).any()

exports.createProduct = (req, res) => {

  upload(req, res, (err) => {
    if(!err && req.files != "") { 
      saveProductInDB(req.files, req.body)
      res.statusMessage = "Product has been added successfully.";
      res.status(200).send()
    } else if (!err && req.files == ""){
      res.statusMessage = "Please select an image to upload";
      res.status(400).end()
    } else {
      res.statusMessage = (err === "Please upload images only" ? err : "Photo exceeds limit of 1MB") ;
      res.status(400).end()
    }
  })  
}

exports.findMenShirts = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM products WHERE (pName LIKE ? || pBrand LIKE ?) && pGender = ? && pCategory = ?", ["%" + searchTerm + "%", "%" + searchTerm + "%", "men", "shirts"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-men-shirts", {title:"User Management - View products" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("view-men-shirts", {title:"User Management - View products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.findWomenShirts = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM products WHERE (pName LIKE ? || pBrand LIKE ?) && pGender = ? && pCategory = ?", ["%" + searchTerm + "%", "%" + searchTerm + "%", "women", "shirts"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("view-women-shirts", {title:"User Management - View products" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("view-women-shirts", {title:"User Management - View products" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

function saveProductInDB(pImage, pInfo){
  const {pCategory, pGender, pBrand, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL} = pInfo
  db.query("INSERT INTO products (pCategory, pGender, pImage, pBrand, pName, pPrice, pDescription, pQuantity_OS,pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [pCategory, pGender, pImage[0].key, pBrand, pName, pPrice, pDescription, pQuantity_OS, pQuantity_XS, pQuantity_S, pQuantity_M, pQuantity_L, pQuantity_XL, pQuantity_XXL], (err, result) => {
    if(err) throw new Error(err)
  })
}