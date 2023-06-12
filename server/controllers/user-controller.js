const mysql = require("mysql"),
bcrypt = require("bcrypt"),
saltRounds = 10,
db = require("../config/mysql-db-setup.js"),
functions = require("../config/helper-functions.js"),
{validationResult} = require("express-validator");

require("dotenv").config();

exports.searchUsers = (req, res) => {
  const searchTerm = req.body.search,
  status = req.params.status;
  if(status != "admin") {
    db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && status = ?", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%", status], (err, result) => {
      if(!err) { 
        return res.status(200).render(`${status}`, {title:`User Management - ${status} users`, user:req.user, result:result})
      } else { 
        return res.status(500).render(`${status}`, {title:`User Management - ${status} users`, user:req.user, success:false, message:"Internal server error"})
      }
    })
  } else {
    db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && admin = 'Yes'", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (err, result) => {
      if(!err) { 
        return res.status(200).render(`${status}`, {title:`User Management - ${status} users`, user:req.user, result:result})
      } else { 
        return res.status(500).render(`${status}`, {title:`User Management - ${status} users`, user:req.user, success:false, message:"Internal server error"})
      }
    })
  }
}

exports.addUser = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
  }

  const { fName, lName, email, password } = req.body;  

  db.query("SELECT email FROM users WHERE email = ?", [email], async (err, result) => {
    // CHECK IF EMAIL ALREADY EXISTS IN DATABASE
    if (!err && result != "") {
      return res.status(401).json({statusMessage:"An account with that email address already exists.", status:401})
    // ELSE CREATE A NEW USER
    } else if(!err && result[0] === undefined){
        bcrypt.hash(password, saltRounds, (err, hash) => {
          db.query("INSERT INTO users (fName, lName, email, password, status, created) VALUES (?,?,?,?,?,?)", [fName, lName, email, hash, "Active", functions.getDate()],
            async (err, result) => {
              if (!err) {
                return res.status(200).json({statusMessage:`A new user with an email address of ${email} has been successfully created.`, status:200})
              // DATABASE ERROR
              } else { 
                return res.status(500).json({statusMessage:"Internal server error", status:500})
              }
          })
        });//bcrypt
    // DATABASE ERROR
    } else{ 
        return res.status(500).json({statusMessage:"Internal server error", status:500})
     } 
   })
}

exports.updateUser = (req, res) => {

  const {id, email, banned, admin} = req.body

  const status = banned == "Yes" ? "Banned" : "Active"

  db.query("UPDATE users SET status = ?, admin = ? WHERE id = ?", [status, admin, id], async (err, result) => {
    if (!err) {
      return res.status(200).json({statusMessage:`This user has been successfully updated.`, status:200})
    } else {
      return res.status(500).json({statusMessage:"Internal server error", status:500})
    }
  })
}