const crypto = require("crypto");

const generateCodeForCounter = (secret, counter) => {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", Buffer.from(secret)).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 1_000_000).padStart(6, "0");
};

const verifyTotpToken = (secret, token) => {
  if (!secret || !/^\d{6}$/.test(token || "")) {
    return false;
  }

  const step = 30;
  const counter = Math.floor(Date.now() / 1000 / step);

  for (let offset = -1; offset <= 1; offset += 1) {
    if (generateCodeForCounter(secret, counter + offset) === token) {
      return true;
    }
  }

  return false;
};

module.exports = { verifyTotpToken };
