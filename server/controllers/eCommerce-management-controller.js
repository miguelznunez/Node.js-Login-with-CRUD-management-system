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

function saveProductInDB(pImage, pInfo){
  const {pName, pPrice, pQuantity, pDescription} = pInfo
  db.query("INSERT INTO products (pImage, pName, pPrice, pQuantity, pDescription) VALUES(?,?,?,?,?)", [pImage[0].key, pName, pPrice, pQuantity, pDescription], (err, result) => {
    if(err) throw new Error(err)
  })
}