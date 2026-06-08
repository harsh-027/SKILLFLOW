const { ipKeyGenerator, rateLimit } = require("express-rate-limit");

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parsePositiveInt(process.env.API_RATE_LIMIT_MAX, 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please slow down and try again later.",
  },
});

const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parsePositiveInt(process.env.WRITE_RATE_LIMIT_MAX, 80),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ["GET", "HEAD", "OPTIONS"].includes(req.method),
  message: {
    message: "Too many changes submitted. Please try again later.",
  },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parsePositiveInt(process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX, 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset attempts. Please try again later.",
  },
});

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parsePositiveInt(process.env.AI_RATE_LIMIT_MAX, 3),
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many AI requests. Please try again later.",
  },
});

module.exports = {
  apiRateLimiter,
  writeRateLimiter,
  authRateLimiter,
  forgotPasswordRateLimiter,
  aiRateLimiter,
};
