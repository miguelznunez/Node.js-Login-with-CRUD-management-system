const multer  = require("multer"),
path = require("path"),
multerS3 = require("multer-s3-v2"),
S3 = require("../config/aws-s3-setup.js");

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
  
const checkFileType = (file, callback) => {
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

module.exports = { upload }