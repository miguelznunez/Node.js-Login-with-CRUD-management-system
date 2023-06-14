const multer  = require("multer"),
path = require("path");

require("dotenv").config();

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads")
    },
    filename: function (req, file, callback) {
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
      callback("The file you uploaded is invalid, please upload images only.")
    }
}

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1000 * 1000 }, 
    fileFilter: function (req, file, callback) { 
      checkFileType(file, callback)
    }
}).any()

module.exports = { upload }