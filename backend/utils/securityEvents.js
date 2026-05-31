const SecurityEvent = require("../models/SecurityEvent");

const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  "";

const logSecurityEvent = async ({
  req,
  userId = null,
  type,
  severity = "low",
  description,
  metadata = {},
}) => {
  try {
    await SecurityEvent.create({
      userId,
      type,
      severity,
      description,
      ipAddress: getClientIp(req),
      userAgent: req.get("user-agent") || "",
      metadata,
    });
  } catch (error) {
    console.error("Failed to write security event:", error.message);
  }
};

module.exports = {
  getClientIp,
  logSecurityEvent,
};
