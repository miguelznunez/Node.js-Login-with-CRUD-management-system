const express = require("express")
authController = require("../controllers/auth-controller"),
pageController = require("../controllers/page-controller"),
{check} = require("express-validator"),
router = express.Router();

module.exports = router