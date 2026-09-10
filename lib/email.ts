import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"VVIT Innovate Ignite" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Your OTP for VVIT Innovate Ignite Registration",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#111827;margin-bottom:8px;">VVIT Innovate Ignite</h2>
        <p style="color:#6b7280;margin-bottom:24px;">Your one-time verification code is:</p>
        <div style="background:#f3f4f6;border-radius:6px;padding:16px 24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px;">VVIT Innovate Ignite · VVIT</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"VVIT Innovate Ignite" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Reset your VVIT Innovate Ignite password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#111827;margin-bottom:8px;">VVIT Innovate Ignite</h2>
        <p style="color:#6b7280;margin-bottom:24px;">We received a request to reset your account password. Click the button below to proceed. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;margin-bottom:24px;">Reset Password</a>
        <p style="color:#9ca3af;font-size:13px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px;">VVIT Innovate Ignite · VVIT</p>
      </div>
    `,
  });
}
