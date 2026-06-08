const ACCESS_COOKIE_NAME = "skillflow_access";
const REFRESH_COOKIE_NAME = "skillflow_refresh";

const parseBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
};

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: parseBoolean(
    process.env.COOKIE_SECURE,
    process.env.NODE_ENV === "production"
  ),
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge,
  path: "/",
});

const attachAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(
    ACCESS_COOKIE_NAME,
    accessToken,
    getCookieOptions(15 * 60 * 1000)
  );

  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getCookieOptions(7 * 24 * 60 * 60 * 1000)
  );
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE_NAME, getCookieOptions(0));
  res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions(0));
};

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  attachAuthCookies,
  clearAuthCookies,
};