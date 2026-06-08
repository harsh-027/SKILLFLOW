const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_TTL = "15m";

const signAccessToken = ({ userId, role }) =>
  jwt.sign({ userId, role, type: "access" }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  ACCESS_TOKEN_TTL,
  signAccessToken,
  verifyAccessToken,
  hashToken,
};
