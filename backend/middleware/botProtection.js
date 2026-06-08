const ApiError = require("../utils/apiError");

const HONEYPOT_FIELDS = ["website", "url", "homepage", "companyWebsite"];

const botProtection = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return next();
  }

  const hasFilledHoneypot = HONEYPOT_FIELDS.some((field) => {
    const value = req.body[field];
    return typeof value === "string" && value.trim().length > 0;
  });

  if (hasFilledHoneypot) {
    return next(new ApiError(400, "Malformed request"));
  }

  return next();
};

module.exports = botProtection;
