const express = require("express"),
googlePassportSetup = require("./server/config/google-passport-setup"),
path = require("path"),
cookieParser = require("cookie-parser"),
session = require('express-session'),
passport = require("passport"),
flash = require('connect-flash');

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
  cookie: { maxAge: 90 * 24 * 60 * 60 * 1000 }
}))

app.use(flash())

app.set("view engine", "ejs")

app.use(passport.initialize())
app.use(passport.session())

app.use("/auth", require("./server/routes/auth-routes"))
// app.use("/eCommerce-management-system", require("./server/routes/eCommerce-management"))
app.use("/user-management", require("./server/routes/user-management-routes"))
app.use("/", require("./server/routes/page-routes"))


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})