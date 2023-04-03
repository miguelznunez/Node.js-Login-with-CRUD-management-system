const mysql = require("mysql"),
colors = require("colors");
require("dotenv").config();

const dbConnection = mysql.createConnection({
  connectionLimit: process.env.DB_LIMIT,
  host           : process.env.DB_HOST,
  user           : process.env.DB_USER,
  password       : process.env.DB_PASSWORD,
  database       : process.env.DB_NAME
})

dbConnection.connect(function(err){

  if(err){
    console.error("Error connecting: " + err.stack)
  }

  console.log("Connected to the MySQL server".underline.cyan)

  let users = `
    CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT,
    fName VARCHAR(25),
    lName VARCHAR(25),
    email VARCHAR(100),
    password BINARY(60),
    token VARCHAR(40),
    token_expires BINARY(13),
    member_since VARCHAR(10),
    status VARCHAR(8) DEFAULT 'Inactive',  
    admin VARCHAR(3) DEFAULT 'No',
    
    PRIMARY KEY(id),
    UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,
    UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE );`

  let federated_credentials = `      
    CREATE TABLE federated_credentials (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED,
    provider VARCHAR(255),
    subject VARCHAR(255),

    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE INDEX subject_UNIQUE (subject ASC) VISIBLE );`

  dbConnection.query(users, (err, results) => {
    if (!err) {
      console.log("users table created...")
    }
  })

  dbConnection.query(federated_credentials, (err, results) => {
    if (!err) {
      console.log("federated_credentials table created...")
    }
  })

})

module.exports = dbConnection;