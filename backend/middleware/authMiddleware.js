const User = require("../models/User");
const ApiError = require("../utils/apiError");
const { ACCESS_COOKIE_NAME } = require("../utils/cookies");
const { verifyAccessToken } = require("../utils/jwt");
const { logSecurityEvent } = require("../utils/securityEvents");

const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice(7);
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.[ACCESS_COOKIE_NAME] || extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== "access") {
      throw new ApiError(401, "Invalid token type");
    }

    const user = await User.findById(payload.userId).select("-password -mfaSecret");
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (user.passwordChangedAt) {
      const passwordChangedAtSeconds = Math.floor(
        new Date(user.passwordChangedAt).getTime() / 1000
      );

      if (typeof payload.iat === "number" && payload.iat < passwordChangedAtSeconds) {
        throw new ApiError(401, "Session has expired. Please log in again.");
      }
    }

    if (user.isBanned) {
      await logSecurityEvent({
        req,
        userId: user._id,
        type: "banned_user_access",
        severity: "high",
        description: "Banned user attempted to access protected resources.",
      });
      throw new ApiError(403, "This account has been banned");
    }

    req.user = user.toObject();
    req.user.id = String(user._id);
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Invalid or expired access token"));
    }

    return next(error);
  }
};

module.exports = authMiddleware;
