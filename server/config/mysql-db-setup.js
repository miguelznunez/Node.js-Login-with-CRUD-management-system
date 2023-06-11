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
    token VARCHAR(255),
    token_expires BINARY(13),
    status VARCHAR(8) DEFAULT 'Inactive',  
    admin VARCHAR(3) DEFAULT 'No',
    created VARCHAR(10),
    deleted VARCHAR(10),
    
    PRIMARY KEY(id),
    UNIQUE INDEX id_UNIQUE (id),
    UNIQUE INDEX email_UNIQUE (email) );`

  let federated_credentials = `      
    CREATE TABLE federated_credentials (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED,
    provider VARCHAR(255),
    subject VARCHAR(255),

    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE INDEX subject_UNIQUE (subject) );`

  let products = `
    CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(255),
    brand VARCHAR(255),
    description TEXT,
    price FLOAT(8,2),
    sale_price FLOAT(8,2),
    image TEXT,
    category VARCHAR(255),
    gender VARCHAR(6),
    sku VARCHAR(7),
    quantity INT,
    quantity_XS INT,
    quantity_S INT,
    quantity_M INT,
    quantity_L INT,
    quantity_XL INT,
    quantity_XXL INT,
    created VARCHAR(10),
    PRIMARY KEY(id),
    UNIQUE INDEX sku_UNIQUE (sku) );`

  let newsletter = `
    CREATE TABLE newsletter (
      nId INT UNSIGNED AUTO_INCREMENT,
      email VARCHAR(100),
      date_subscribed VARCHAR(10),

    PRIMARY KEY(nId) );`

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

  dbConnection.query(products, (err, results) => {
    if (!err) {
      console.log("products table created...")
    }
  })

  dbConnection.query(newsletter, (err, results) => {
    if (!err) {
      console.log("newsletter table created...")
    }
  })

})

module.exports = dbConnection;