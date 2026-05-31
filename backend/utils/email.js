const ApiError = require("./apiError");

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new ApiError(500, `${name} is not configured`);
  }

  return value;
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("RESEND_FROM_EMAIL");
  const { Resend } = require("resend");

  const resend = new Resend(apiKey);
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "there";

  try {
    await resend.emails.send({
      from,
      to,
      subject: "Reset your Skillflow password",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; background:#0d0d0f; color:#ffffff; padding:32px;">
          <div style="max-width:560px; margin:0 auto; background:#151518; border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:32px;">
            <p style="margin:0 0 12px; color:#b1b1b8; font-size:14px;">Skillflow account security</p>
            <h1 style="margin:0 0 16px; font-size:28px; line-height:1.2;">Reset your password</h1>
            <p style="margin:0 0 16px; color:#d4d4d8; line-height:1.7;">Hi ${safeName}, we received a request to reset your password. This secure link expires in 15 minutes and can only be used once.</p>
            <p style="margin:24px 0;">
              <a href="${resetUrl}" style="display:inline-block; padding:14px 20px; border-radius:12px; background:#ffffff; color:#111111; text-decoration:none; font-weight:700;">Reset password</a>
            </p>
            <p style="margin:0 0 12px; color:#a1a1aa; line-height:1.7;">If you did not request this, you can safely ignore this email.</p>
            <p style="margin:0; color:#71717a; font-size:13px; word-break:break-all;">${resetUrl}</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    throw new ApiError(500, "Unable to send password reset email");
  }
};

module.exports = {
  sendPasswordResetEmail,
};
