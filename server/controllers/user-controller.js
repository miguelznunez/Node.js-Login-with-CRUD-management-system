const mysql = require("mysql"),
db = require("../config/mysql-db-setup.js"),
bcrypt = require("bcrypt"),
saltRounds = 10,
{validationResult} = require("express-validator");

require("dotenv").config();

function get_date(){
  let yourDate = new Date()
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - (offset*60*1000));
  return yourDate.toISOString().split('T')[0]
}

exports.searchActiveUsers = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && status = 'Active'", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("active-users", {title:"User Management - Active Users" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("active-users", {title:"User Management - Active Users" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.searchBannedUsers = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && status = 'Banned'", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("banned-users", {title:"User Management - Banned Users" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("banned-users", {title:"User Management - Banned Users" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.searchInactiveUsers = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && status = 'Inactive'", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("inactive-users", {title:"User Management - Inactive Users" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("inactive-users", {title:"User Management - Inactive Users" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.searchDeletedUsers = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && status = 'Deleted'", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("deleted-users", {title:"User Management - Deleted Users" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("deleted-users", {title:"User Management - Deleted Users" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.searchAdminUsers = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && admin = 'Yes'", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("admin-users", {title:"User Management - Admin Users" , user:req.user, rows:rows})
    } else { 
      return res.status(500).render("admin-users", {title:"User Management - Admin Users" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.addUser = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    return res.status(401).json({statusMessage:allParsedErrors.errors[0].msg, status:401})
  }

  const { fName, lName, email, password } = req.body;  
  const member_since = get_date();

  db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
    // CHECK IF EMAIL ALREADY EXISTS IN DATABASE
    if (!err && results != "") {
      return res.status(401).json({statusMessage:"An account with that email address already exists.", status:401})
    // ELSE CREATE A NEW USER
    } else if(!err && results[0] === undefined){
        bcrypt.hash(password, saltRounds, (err, hash) => {
          db.query("INSERT INTO users (fName, lName, email, password, member_since, status) VALUES (?,?,?,?,?,?)", [fName, lName, email, hash, member_since, "Active"],
            async (err, results) => {
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

  db.query("UPDATE users SET status = ?, admin = ? WHERE id = ?", [status, admin, id], async (err, results) => {
    if (!err) {
      return res.status(200).json({statusMessage:`This user has been successfully updated.`, status:200})
    } else {
      return res.status(500).json({statusMessage:"Internal server error", status:500})
    }
  })
}