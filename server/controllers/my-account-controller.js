const express = require("express"),
db = require("../config/mysql-db-setup.js"),
mail = require("../config/nodemailer-email-setup.js"),
functions = require("../functions/get-date.js");

exports.deleteAccount = (req, res) => {

  const {id, email} = req.body;

  db.query("SELECT * FROM federated_credentials WHERE user_id = ?", [id], (err, row) => {

    if(err){
      return res.status(500).json({statusMessage:"Internal server error", status:500})
    }
    // USER EXISTS IN FEDERATED CREDENTIALS
    if(!err && row != ""){
      console.log("A social media user")
      db.query("UPDATE federated_credentials SET subject = ? WHERE user_id = ?", [null, id], (err, rows) => {
        if(!err) { 
          db.query("UPDATE users SET email = ?, status = ?, deleted = ? WHERE id = ?", [null, "Deleted", functions.getDate(), id], (err, rows) => {
            if(!err) {
                // mail.accountDeletedEmail(email, (err, info) => {
                //   if(!err) {
                //     return res.status(200).json({status:200})
                //   } else { 
                //     return res.status(500).json({statusMessage:"Internal Server Error", status:500})
                //   }
                // }); 
                return res.status(200).json({status:200})
            } else { 
                return res.status(500).json({statusMessage:"Internal server error", status:500})
            }
         })
        } else {
            return res.status(500).json({statusMessage:"Internal server error", status:500})
        }
      })
    // IF THEY DONT: DELETE FROM USERS TABLE ONLY
    } else {
      console.log("Manual email user")
      db.query("UPDATE users SET email = ?, status = ?, deleted = ? WHERE id = ?", [null, "Deleted", functions.getDate(), id], (err, rows) => {
        if(!err) { 
            // mail.accountDeletedEmail(email, (err, info) => {
            //     if(!err) {
            //       return res.status(200).json({status:200})
            //     } else { 
            //       return res.status(500).json({statusMessage:"Internal Server Error", status:500})
            //     }
            // });
            return res.status(200).json({status:200})
        } else { 
            return res.status(500).json({statusMessage:"Internal server error", status:500})
        }
      })
    }
  })
    
}