const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { attachAuthCookies, clearAuthCookies, REFRESH_COOKIE_NAME } = require("../utils/cookies");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateTokenId,
} = require("../utils/jwt");
const { sanitizeUser } = require("../utils/userSanitizer");
const { getClientIp, logSecurityEvent } = require("../utils/securityEvents");
const { verifyTotpToken } = require("../utils/totp");
const { sendPasswordResetEmail } = require("../utils/email");

const MAX_FAILED_LOGINS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const GENERIC_RESET_RESPONSE =
  "A password reset link has been sent to your account.";

const normalizeSkills = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const buildSession = async (user, req, family = generateTokenId()) => {
  const jti = generateTokenId();
  const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({
    userId: String(user._id),
    role: user.role,
    jti,
    family,
  });

  await RefreshToken.create({
    userId: user._id,
    jti,
    family,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: getClientIp(req),
    userAgent: req.get("user-agent") || "",
  });

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  user.lastLoginIp = getClientIp(req);
  await user.save();

  return { accessToken, refreshToken };
};

const rotateRefreshToken = async (storedToken, user, req) => {
  const nextJti = generateTokenId();
  const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({
    userId: String(user._id),
    role: user.role,
    jti: nextJti,
    family: storedToken.family,
  });

  storedToken.revokedAt = new Date();
  storedToken.replacedByJti = nextJti;
  storedToken.lastUsedAt = new Date();
  await storedToken.save();

  await RefreshToken.create({
    userId: user._id,
    jti: nextJti,
    family: storedToken.family,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: getClientIp(req),
    userAgent: req.get("user-agent") || "",
  });

  return { accessToken, refreshToken };
};

const buildResetUrl = (token) => {
  const baseUrl =
    process.env.PASSWORD_RESET_URL || `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/reset-password`;
  return `${baseUrl.replace(/\/+$/, "")}/${token}`;
};

const register = asyncHandler(async (req, res) => {
  const { userId, name, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { userId: userId.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(409, "A user with that email or user ID already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const baseUserPayload = {
    userId: userId.trim().toLowerCase(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    skillsOffered: normalizeSkills(req.body.skillsOffered),
    skillsWanted: normalizeSkills(req.body.skillsWanted),
  };

  const adminExists = await User.findOne({ role: "admin" }).select("_id");
  let user;

  try {
    user = await User.create({
      ...baseUserPayload,
      role: adminExists ? "user" : "admin",
    });
  } catch (error) {
    const roleConflict =
      error?.code === 11000 &&
      (error?.keyPattern?.role || (typeof error?.message === "string" && error.message.includes("role_1")));

    if (!adminExists && roleConflict) {
      user = await User.create({
        ...baseUserPayload,
        role: "user",
      });
    } else {
      throw error;
    }
  }

  const session = await buildSession(user, req);
  attachAuthCookies(res, session.accessToken, session.refreshToken);

  return res.status(201).json({
    message:
      user.role === "admin"
        ? "Admin account bootstrapped successfully"
        : "User registered successfully",
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password +mfaSecret");

  if (!user) {
    await logSecurityEvent({
      req,
      type: "login_failed",
      severity: "medium",
      description: "Login attempted with an unknown email address.",
      metadata: { email: email.toLowerCase() },
    });
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(423, "Account temporarily locked due to repeated failed logins");
  }

  if (user.isBanned) {
    await logSecurityEvent({
      req,
      userId: user._id,
      type: "banned_login_attempt",
      severity: "high",
      description: "Banned account attempted to log in.",
    });
    throw new ApiError(403, "This account has been banned");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
    await user.save();

    await logSecurityEvent({
      req,
      userId: user._id,
      type: "login_failed",
      severity: user.failedLoginAttempts >= MAX_FAILED_LOGINS ? "high" : "medium",
      description: "Login failed because an invalid password was provided.",
      metadata: { failedLoginAttempts: user.failedLoginAttempts },
    });
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.role === "admin" && user.mfaEnabled) {
    const isValidOtp = verifyTotpToken(user.mfaSecret, otp);
    if (!isValidOtp) {
      await logSecurityEvent({
        req,
        userId: user._id,
        type: "admin_mfa_failed",
        severity: "high",
        description: "Admin login failed OTP verification.",
      });
      throw new ApiError(401, "A valid 6-digit admin OTP is required");
    }
  }

  if (user.lastLoginIp && user.lastLoginIp !== getClientIp(req)) {
    await logSecurityEvent({
      req,
      userId: user._id,
      type: "new_login_ip",
      severity: "medium",
      description: "User logged in from a new IP address.",
      metadata: { previousIp: user.lastLoginIp, currentIp: getClientIp(req) },
    });
  }

  const session = await buildSession(user, req);
  attachAuthCookies(res, session.accessToken, session.refreshToken);

  return res.status(200).json({
    message: "Login successful",
    user: sanitizeUser(user),
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await RefreshToken.findOneAndUpdate(
        { jti: payload.jti },
        { revokedAt: new Date(), lastUsedAt: new Date() }
      );
    } catch (error) {
      // Ignore malformed refresh cookies during logout and still clear cookies.
    }
  }

  clearAuthCookies(res);
  return res.status(200).json({ message: "Logged out successfully" });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    clearAuthCookies(res);
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const storedToken = await RefreshToken.findOne({ jti: payload.jti }).select("+tokenHash");
  if (!storedToken) {
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token session not found");
  }

  if (storedToken.revokedAt) {
    await RefreshToken.updateMany(
      { userId: storedToken.userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    await logSecurityEvent({
      req,
      userId: storedToken.userId,
      type: "refresh_token_reuse",
      severity: "critical",
      description: "Detected refresh token reuse. Revoked active sessions.",
      metadata: { family: storedToken.family, jti: storedToken.jti },
    });
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token reuse detected");
  }

  if (storedToken.tokenHash !== hashToken(refreshToken)) {
    clearAuthCookies(res);
    throw new ApiError(401, "Refresh token verification failed");
  }

  const user = await User.findById(payload.userId).select("-password -mfaSecret");
  if (!user || user.isBanned) {
    clearAuthCookies(res);
    throw new ApiError(401, "Session is no longer valid");
  }

  if (user.passwordChangedAt) {
    const passwordChangedAtSeconds = Math.floor(
      new Date(user.passwordChangedAt).getTime() / 1000
    );

    if (typeof payload.iat === "number" && payload.iat < passwordChangedAtSeconds) {
      await RefreshToken.updateMany(
        { userId: user._id, revokedAt: null },
        { revokedAt: new Date() }
      );
      clearAuthCookies(res);
      throw new ApiError(401, "Session has expired. Please log in again.");
    }
  }

  const nextSession = await rotateRefreshToken(storedToken, user, req);
  attachAuthCookies(res, nextSession.accessToken, nextSession.refreshToken);

  return res.status(200).json({
    message: "Session refreshed",
    user: sanitizeUser(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -mfaSecret");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(sanitizeUser(user));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user || user.isBanned) {
    if (user?.isBanned) {
      await logSecurityEvent({
        req,
        userId: user._id,
        type: "forgot_password_blocked",
        severity: "medium",
        description: "Password reset requested for a banned account.",
      });
    }

    return res.status(200).json({ message: GENERIC_RESET_RESPONSE });
  }

  const rawResetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = hashToken(rawResetToken);
  user.resetPasswordExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: buildResetUrl(rawResetToken),
    });
  } catch (error) {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    throw error;
  }

  await logSecurityEvent({
    req,
    userId: user._id,
    type: "forgot_password_requested",
    severity: "low",
    description: "Password reset email requested.",
  });

  return res.status(200).json({ message: GENERIC_RESET_RESPONSE });
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = String(req.params.token || "").trim();
  if (!token) {
    throw new ApiError(400, "Reset token is required");
  }

  const hashedResetToken = hashToken(token);
  const user = await User.findOne({
    resetPasswordToken: hashedResetToken,
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new ApiError(400, "This reset link is invalid or has already been used");
  }

  if (!user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    throw new ApiError(400, "This reset link has expired. Please request a new one.");
  }

  const samePassword = await bcrypt.compare(req.body.password, user.password);
  if (samePassword) {
    throw new ApiError(400, "Choose a new password that you have not used for this account.");
  }

  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.passwordChangedAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
  clearAuthCookies(res);

  await logSecurityEvent({
    req,
    userId: user._id,
    type: "password_reset_completed",
    severity: "medium",
    description: "Password was reset successfully and active sessions were revoked.",
  });

  return res.status(200).json({
    message: "Password reset successful. Please log in again with your new password.",
  });
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
};
