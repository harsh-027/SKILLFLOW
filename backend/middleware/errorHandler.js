const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: "Validation failed",
    errors: result.mapped(),
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  console.error(err.stack || err);
  return res.status(500).json({ message: "Server error" });
};

module.exports = {
  validateRequest,
  notFoundHandler,
  errorHandler,
};
