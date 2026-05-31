const { body } = require("express-validator");

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,72}$/;

const registerValidator = [
  body("userId")
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9._-]{3,24}$/)
    .withMessage("User ID must be 3-24 characters using letters, numbers, dots, underscores, or hyphens."),
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters."),
  body("email").trim().isEmail().withMessage("A valid email address is required.").normalizeEmail(),
  body("password")
    .isString()
    .matches(passwordRule)
    .withMessage("Password must be 10+ characters and include uppercase, lowercase, number, and symbol."),
  body("skillsOffered").optional().isArray().withMessage("skillsOffered must be an array."),
  body("skillsWanted").optional().isArray().withMessage("skillsWanted must be an array."),
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email address is required.").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password is required."),
  body("otp").optional().isString().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits."),
];

const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("A valid email address is required.").normalizeEmail(),
];

const resetPasswordValidator = [
  body("password")
    .isString()
    .matches(passwordRule)
    .withMessage("Password must be 10+ characters and include uppercase, lowercase, number, and symbol."),
  body("confirmPassword")
    .isString()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

module.exports = {
  passwordRule,
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
