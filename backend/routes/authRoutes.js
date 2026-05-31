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
const { validateRequest } = require("../middleware/errorHandler");
const { authRateLimiter, forgotPasswordRateLimiter } = require("../middleware/rateLimiters");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", authRateLimiter, registerValidator, validateRequest, register);
router.post("/login", authRateLimiter, loginValidator, validateRequest, login);
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);
router.post(
  "/reset-password/:token",
  authRateLimiter,
  resetPasswordValidator,
  validateRequest,
  resetPassword
);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, getMe);

module.exports = router;
