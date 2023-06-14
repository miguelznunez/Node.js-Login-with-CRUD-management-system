const multer = require("multer"),
S3 = require("../config/aws-s3-setup.js"),
db = require("../config/mysql-db-setup.js"),
multerSetup = require("../config/multer-setup.js"),
sharp = require('sharp'),
fs = require("fs"),
functions = require("../config/helper-functions.js");

exports.addProduct = (req, res) => {

  multerSetup.upload(req, res, (err) => {

    if (err instanceof multer.MulterError) {
      let message = (err.code === "LIMIT_FILE_SIZE" ? "The photo you uploaded exceeds the limit of 5MB." : err.code) 
      return res.status(400).json({statusMessage:message, status:400})
    } else if(err){
      return res.status(400).json({statusMessage:err, status:400})
    } else if(!err && req.files == "") {
      return res.status(400).json({statusMessage:"Please select an image to upload.", status:400})
    } else {

      // Step 1: Access the image metadata 
      sharp(req.files[0].path).metadata((err, metadata) => {

        if(!err){ // if no error, move to step 2...

          if (metadata.height > 400) { // Step 2: Check if height is greater than 400px, if so move to step 3..

            sharp(req.files[0].path).resize({height:400}).toBuffer((err, buffer) => { // Step 3: Resize the image & convert to buffer

              if(!err){ // if no error, move to step 4..
                fs.rmSync(req.files[0].path, { force: true }) // Step 4: Remove the file from uploads folder

                S3.uploadImage(req.files[0].filename, buffer, req.files[0].mimetype, (err, result) => { // Step 5: Upload image to S3

                  if(!err){ // If no error, move to step 6...
                    functions.saveProductInDB(req.body, req.files[0].filename, (err, result) => { // Step 6: Store image path in DB
                      if(!err){ // If no error, send client a success message 
                        return res.status(200).json({statusMessage:"Product has been added successfully.", status:200})
                      } else { // else, send client an error message
                        console.log(err.sqlMessage)
                        return res.status(500).json({statusMessage:"Internal server error", status:500})
                      }
                    })
                  } else {
                    return res.status(422).json({statusMessage:"There was an error uploading the image to s3.", status:422})
                  }
                });
              } else {
                return res.status(422).json({statusMessage:"There was an error processing the image.", status:422})
              }

            })
          } else { // Else height is not greater than 400, no need to resize, just convert to buffer
            sharp(req.files[0].path).toBuffer((err, buffer) => {

              if(!err){ // if no error, move to step 4..
                fs.rmSync(req.files[0].path, { force: true }) // Step 4: Remove the file from uploads folder

                S3.uploadImage(req.files[0].filename, buffer, req.files[0].mimetype, (err, result) => { // Step 5: Upload image to S3

                  if(!err){ // If no error, move to step 6...
                    functions.saveProductInDB(req.body, req.files[0].filename, (err, result) => { // Step 6: Store image path in DB
                      if(!err){ // If no error, send client a success message 
                        return res.status(200).json({statusMessage:"Product has been added successfully.", status:200})
                      } else { // else, send client an error message
                        console.log(err.sqlMessage)
                        return res.status(500).json({statusMessage:"Internal server error", status:500})
                      }
                    })
                  } else {
                    return res.status(422).json({statusMessage:"There was an error uploading the image to s3.", status:422})
                  }
                });
              } else {
                return res.status(422).json({statusMessage:"There was an error processing the image.", status:422})
              }
            })
          }
        } else { 
          return res.status(422).json({statusMessage:"There was an error processing the image.", status:422})
        }
      });       
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

  multerSetup.upload(req, res, (err) => {

    if (err instanceof multer.MulterError) {
      let message = (err.code === "LIMIT_FILE_SIZE" ? "The photo you uploaded exceeds the limit of 5MB." : err.code) 
      return res.status(400).json({statusMessage:message, status:400})
    } else if(err){
      return res.status(400).json({statusMessage:err, status:400})
    } else if(!err && req.files == "") {
      return res.status(400).json({statusMessage:"Please select an image to upload.", status:400})
    } else {

      // Step 1: Access the image metadata 
      sharp(req.files[0].path).metadata((err, metadata) => {

        if(!err){ // if no error, move to step 2...

          if (metadata.height > 400) { // Step 2: Check if height is greater than 400px, if so move to step 3..

            sharp(req.files[0].path).resize({height:400}).toBuffer((err, buffer) => { // Step 3: Resize the image & convert to buffer

              if(!err){ // if no error, move to step 4..
                fs.rmSync(req.files[0].path, { force: true }) // Step 4: Remove the file from uploads folder

                S3.uploadImage(req.files[0].filename, buffer, req.files[0].mimetype, (err, result) => { // Step 5: Upload image to S3

                  if(!err){ // If no error, move to step 6...
                    functions.editProductInfoImageInDB(req.body, req.files[0].filename, (err, result) => {
                      if(!err){ // If not error, move to step 7...
                        S3.deleteS3Image(req.body.savedImage, (err, result) => { // Step 7: Delete old image from S3
                          if(!err){
                            return res.status(200).json({statusMessage:"Product has been edited successfully.", status:200})
                          } else {
                            return res.status(500).json({statusMessage:"There was a problem deleting the old image from s3.", status:500})
                          }
                        })
                      } else {
                        return res.status(200).json({statusMessage:"There was an error saving the product in the database", status:500})
                      }
                    })
                  } else {
                    return res.status(422).json({statusMessage:"There was an error uploading the image to s3.", status:422})
                  }
                });
              } else {
                return res.status(422).json({statusMessage:"There was an error processing the image.", status:422})
              }

            })
          } else { // Else height is not greater than 400, no need to resize, just convert to buffer
            sharp(req.files[0].path).toBuffer((err, buffer) => {

              if(!err){ // if no error, move to step 4..
                fs.rmSync(req.files[0].path, { force: true }) // Step 4: Remove the file from uploads folder

                S3.uploadImage(req.files[0].filename, buffer, req.files[0].mimetype, (err, result) => { // Step 5: Upload image to S3

                  if(!err){ // If no error, move to step 6...
                    functions.editProductInfoImageInDB(req.body, req.files[0].filename, (err, result) => {
                      if(!err){ // If not error, move to step 7...
                        S3.deleteS3Image(req.body.savedImage, (err, result) => { // Step 7: Delete old image from S3
                          if(!err){
                            return res.status(200).json({statusMessage:"Product has been edited successfully.", status:200})
                          } else {
                            return res.status(500).json({statusMessage:"There was a problem deleting the old image from s3.", status:500})
                          }
                        })
                      } else {
                        return res.status(200).json({statusMessage:"There was an error saving the product in the database", status:500})
                      }
                    })
                  } else {
                    return res.status(422).json({statusMessage:"There was an error uploading the image to s3.", status:422})
                  }
                });
              } else {
                return res.status(422).json({statusMessage:"There was an error processing the image.", status:422})
              }
            })
          }
        } else { 
          return res.status(422).json({statusMessage:"There was an error processing the image.", status:422})
        }
      });       
    }
  })

  // multerSetup.upload(req, res, (err) => {
  //   if(!err && req.files != "") { 
  //     S3.deleteS3Image(req.body.savedImage, (err, result) => {
  //       if(!err){
  //         functions.editProductInfoImageInDB(req.body, req.files, (err, result) => {
  //           if(!err){
  //             return res.status(200).json({statusMessage:"Product has been edited successfully.", status:200})
  //           } else {
  //             return res.status(200).json({statusMessage:"Internal server error", status:500})
  //           }
  //         })
  //       } else {
  //         return res.status(200).json({statusMessage:"Internal server error", status:500})
  //       }
  //     })
  //   } else if (!err && req.files == ""){
  //     return res.status(400).json({statusMessage:"Please select an image to upload.", status:400})
  //   } else {
  //     let error =  (err === "Please upload images only" ? err : "Photo exceeds limit of 1MB") ;
  //     return res.status(400).json({statusMessage:error, status:400})
  //   }
  // }) 

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

exports.deleteProduct = (req, res) => {

    S3.deleteS3Image(req.params.image, (err, result) => {
      if(!err){
        db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err, result) => {
          if(!err) { 
            req.flash("message", `The selected product has been deleted successfully from your store.`)
            return res.redirect(`/ecommerce-management/ecommerce-views/view-products/${req.params.gender}`)
          } else {
            req.flash("message", "Internal server error")
            return res.redirect(`/ecommerce-management/ecommerce-views/view-products/${req.params.gender}`)
          }
        })
      } else {
        req.flash("message", "Internal server error")
        return res.redirect(`/ecommerce-management/ecommerce-views/view-products/${req.params.gender}`)
      }
    })    
  
}

exports.deleteProducts = (req, res) => {

  const products = JSON.parse(req.body.removeProducts)
  let images = []

  S3.deleteS3Images(products, (err, result) => {
    if(!err){ 
        products.forEach( p => {
          images.push(p.Key)
        })
        functions.deleteProductsFromDb(images, (err, result) => {
          if(!err){
              req.flash("message", `The ${images.length} selected product(s) have been successfully deleted from your store.`)
              return res.redirect(`/ecommerce-management/ecommerce-views/view-products/${req.params.gender}`)
          } else {
              req.flash("message", "Internal server error")
              return res.redirect(`/ecommerce-management/ecommerce-views/view-products/${req.params.gender}`)
          }
        })
    } else {
        req.flash("message", "Internal server error")
        return res.redirect(`/ecommerce-management/ecommerce-views/view-products/${req.params.gender}`)
    }
  })
}