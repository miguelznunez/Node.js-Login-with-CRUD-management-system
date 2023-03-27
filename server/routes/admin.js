const express = require("express"),
adminController = require("../controllers/adminController"),
authController = require("../controllers/authController"),
{check} = require("express-validator"),
router = express.Router();

// ADMIN POST ROUTES  ============================================================

router.post("/find-user", authController.isLoggedIn, adminController.findUser)

router.post("/create-user",
[
  check("fName", "First name field cannot be empty.").not().isEmpty(),
  check("fName", "First name must be less than 25 characters long.").isLength({min:0, max:25}),
  check("lName", "Last name field cannot be empty.").not().isEmpty(),
  check("lName", "Last name must be less than 25 characters long.").isLength({min:0, max:25}), 
  check("email", "The email you entered is invalid, please try again.").isEmail().normalizeEmail(),
  check("email", "Email address must be between 4-100 characters long, please try again.").isLength({min:4, max:100}).normalizeEmail(), 
  check("password", "Password must be between 8-60 characters long.").isLength({min:8, max:60}),
  check("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
  check("cPassword", "Password confirm field cannot be empty.").not().isEmpty(),
  check("password", "Password don't match, please try again.").custom(( value, { req, res, next } ) => {
  if (value !== req.body.cPassword) {
    throw new Error("Passwords don't match, please try again.");
  } else {
    return value;
  }
 })
], adminController.createUser)

router.post("/update-user", [
  check("fName", "First name field cannot be empty.").not().isEmpty(),
  check("fName", "First name must be less than 25 characters long.").isLength({min:0, max:25}),
  check("lName", "Last name field cannot be empty.").not().isEmpty(),
  check("lName", "Last name must be less than 25 characters long.").isLength({min:0, max:25}), 
  check("email", "The email you entered is invalid, please try again.").isEmail().normalizeEmail(),
  check("email", "Email address must be between 4-100 characters long, please try again.").isLength({min:4, max:100}).normalizeEmail(), 
], adminController.updateUser)

module.exports = router;