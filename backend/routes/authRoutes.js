const express = require("express");
const {
  register,
  login,
  logout,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const botProtection = require("../middleware/botProtection");
const { validateRequest } = require("../middleware/errorHandler");
const { authRateLimiter, forgotPasswordRateLimiter } = require("../middleware/rateLimiters");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", authRateLimiter, botProtection, registerValidator, validateRequest, register);
router.post("/login", authRateLimiter, botProtection, loginValidator, validateRequest, login);
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  botProtection,
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);
router.post(
  "/reset-password/:token",
  authRateLimiter,
  botProtection,
  resetPasswordValidator,
  validateRequest,
  resetPassword
);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, getMe);

module.exports = router;
