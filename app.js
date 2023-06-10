const express = require("express"),
path = require("path"),
googlePassportSetup = require("./server/config/google-passport-setup"),
facebookPassportSetup = require("./server/config/facebook-passport-setup"),
cookieParser = require("cookie-parser"),
session = require('express-session'),
flash = require('connect-flash')
passport = require("passport");

require("dotenv").config()

const app = express()

app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(cookieParser())
app.use(session({ 
  secret: 'keyboard cat',
  resave: false, // dont't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  cookie: { maxAge: process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 }
}))

app.use(flash())

app.set("view engine", "ejs")
app.set('views', [path.join(__dirname, 'views'),
                  path.join(__dirname, 'views/page-views/'),
                  path.join(__dirname, 'views/auth-views/'),
                  path.join(__dirname, 'views/user-views/'),
                  path.join(__dirname, 'views/my-account-views/'),
                  path.join(__dirname, 'views/ecommerce-views/'),
                  path.join(__dirname, 'views/ecommerce-views/men/'),
                  path.join(__dirname, 'views/ecommerce-views/women/'),
                  path.join(__dirname, 'views/ecommerce-views/dna/'),
                  path.join(__dirname, 'views/newsletter-views/')]);

app.use(passport.initialize())
app.use(passport.session())

app.use("/auth-management", require("./server/routes/auth-routes"))
app.use("/my-account-management", require("./server/routes/my-account-routes"))
app.use("/newsletter-management", require("./server/routes/newsletter-routes"))
app.use("/ecommerce-management", require("./server/routes/ecommerce-routes"))
app.use("/user-management", require("./server/routes/user-routes"))
app.use("/", require("./server/routes/page-routes"))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})