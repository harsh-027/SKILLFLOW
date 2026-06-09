const TOKEN_EXPIRY_SKEW_MS = 30 * 1000;

type JwtPayload = {
  exp?: number;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return window.atob(padded);
};

export const getTokenExpiresAt = (token: string | null): number | null => {
  if (!token || typeof window === "undefined") {
    return null;
  }

  const [, payloadPart] = token.split(".");
  if (!payloadPart) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload;
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null) => {
  const expiresAt = getTokenExpiresAt(token);
  return Boolean(expiresAt && expiresAt <= Date.now() + TOKEN_EXPIRY_SKEW_MS);
};

