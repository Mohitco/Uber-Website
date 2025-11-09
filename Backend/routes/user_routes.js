const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register,login } = require("../controller/user_controller");

router.post("/register/user",[
  body("email").isEmail().withMessage("Invalid Email"),
  body('fullname.firstname').isLength({min : 3}).withMessage('First name must be at least 3 character long'),
  body('password').isLength({min : 6}).withMessage('password must be 6 character long')
],register);


router.post("/login/user",[
  body("email").isEmail().withMessage("Invalid Email"),
  body('password').isLength({min : 6}).withMessage('password must be 6 character long')
],login);

module.exports = router;
