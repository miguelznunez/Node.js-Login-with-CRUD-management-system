const mysql = require("mysql"),
db = require("../../db.js"),
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

exports.findUser = (req, res) => {
  const searchTerm = req.body.search
  db.query("SELECT * FROM users WHERE (fName LIKE ? OR lName LIKE ? OR email LIKE ?) && status != 'Deleted'", ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (err, rows) => {
    if(!err) { 
      return res.status(200).render("admin", {title:"Admin" , user:req.user, rows:rows, success:true})
    } else { 
      return res.status(500).render("admin", {title:"Admin" , user:req.user, success:false, message:"Internal server error."})
    }
  })
}

exports.createUser = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    res.statusMessage = allParsedErrors.errors[0].msg
    return res.status(401).end()
  }

  const { fName, lName, email, password } = req.body;  
  const member_since = get_date();

  db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
    // CHECK IF EMAIL ALREADY EXISTS IN DATABASE
    if (!err && results != "") {
      res.statusMessage = "An account with that email already exists"
      return res.status(401).end()
    // ELSE CREATE A NEW USER
    } else if(!err && results[0] === undefined){
        bcrypt.hash(password, saltRounds, (err, hash) => {
          db.query("INSERT INTO users (fName, lName, email, password, member_since, status) VALUES (?,?,?,?,?,?)", [fName, lName, email, hash, member_since, "Active"],
            async (err, results) => {
              if (!err) {
                res.statusMessage = `User has been created.`
                return res.status(200).end()
              // DATABASE ERROR
              } else { 
                res.statusMessage = "Internal server error."
                return res.status(500).end()
              }
          })
        });//bcrypt
    // DATABASE ERROR
    } else{ 
        res.statusMessage = "Internal server error."
        return res.status(500).end()
     } 
   })
}

exports.updateUser = (req, res) => {

  const errors = validationResult(req),
  allErrors = JSON.stringify(errors),
  allParsedErrors = JSON.parse(allErrors);
  if(!errors.isEmpty()){
    res.statusMessage = allParsedErrors.errors[0].msg
    return res.status(401).end()
  }

  const {id, fName, lName, email, admin} = req.body

  db.query("UPDATE users SET fName = ?, lName = ?, email = ?, admin = ? WHERE id = ?", [fName, lName, email, admin, id], async (err, results) => {
    if (!err) {
      res.statusMessage = "User has been updated."
      return res.status(200).end()
    } else {
      res.statusMessage = "Internal server error."
      return res.status(500).end()
    }
  })
}