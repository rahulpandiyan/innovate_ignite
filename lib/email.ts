// do.dev Send API (https://docs.do.dev/send)
// POST https://api.do.dev/v1/send/emails/send
// Bearer do_live_... -> 202 { id, status: "queued" }

const SEND_URL = "https://api.do.dev/v1/send/emails/send";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

interface SendResult {
  id: string;
  status: string;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = requireEnv("SEND_API_KEY");
  const fromEmail = process.env.SEND_FROM_EMAIL ?? "hello@innovateignite.tech";
  const fromName = process.env.SEND_FROM_NAME ?? "VVIT Innovate Ignite";

  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [options.to],
      subject: options.subject,
      html: options.html,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    error?: { code?: string; message?: string };
  };

  if (!res.ok || !body.id) {
    throw new Error(
      body.error?.message ?? `do.dev send failed (HTTP ${res.status})`
    );
  }

  return { id: body.id, status: body.status ?? "queued" };
}

function layout(inner: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#111827;margin-bottom:8px;">VVIT Innovate Ignite</h2>
      ${inner}
      <p style="color:#9ca3af;font-size:12px;margin-top:16px;">VVIT Innovate Ignite · VVIT</p>
    </div>`;
}

export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Your OTP for VVIT Innovate Ignite",
    html: layout(`
      <p style="color:#6b7280;margin-bottom:24px;">Your one-time verification code is:</p>
      <div style="background:#f3f4f6;border-radius:6px;padding:16px 24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;">${otp}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    `),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Reset your VVIT Innovate Ignite password",
    html: layout(`
      <p style="color:#6b7280;margin-bottom:24px;">We received a request to reset your account password. Click the button below to proceed. This link expires in <strong>15 minutes</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;margin-bottom:24px;">Reset Password</a>
      <p style="color:#9ca3af;font-size:13px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
    `),
  });
}
