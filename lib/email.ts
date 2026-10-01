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
  text?: string;
}): Promise<SendResult> {
  const apiKey = requireEnv("SEND_API_KEY");
  const fromEmail = process.env.SEND_FROM_EMAIL ?? "hello@innovateignite.tech";
  const fromName = process.env.SEND_FROM_NAME ?? "VVIT Innovate Ignite";
  // Plain-text fallback improves deliverability for clients that don't render HTML
  const text =
    options.text ??
    options.html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

  let res: Response;
  try {
    res = await fetch(SEND_URL, {
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
        text,
      }),
    });
  } catch (err) {
    throw new Error(
      `do.dev send unreachable: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    error?: { code?: string; message?: string };
  };

  if (!res.ok || !body.id) {
    const detail = body.error?.message ?? `do.dev send failed (HTTP ${res.status})`;
    console.error(`[mail] send failed to=${options.to} subject=${options.subject}: ${detail}`);
    throw new Error(detail);
  }

  console.log(`[mail] queued id=${body.id} to=${options.to} subject=${options.subject}`);
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

export async function sendRegistrationConfirmedEmail(
  email: string,
  name: string,
  eventName: string,
  registrationId: string
): Promise<SendResult> {
  return sendEmail({
    to: email,
    subject: `You're confirmed for ${eventName} — VVIT Innovate Ignite`,
    html: layout(`
      <p style="color:#111827;font-size:16px;">Hi ${name},</p>
      <p style="color:#6b7280;">Great news — finance has verified your payment and your spot is confirmed.</p>
      <div style="background:#f3f4f6;border-radius:6px;padding:16px 24px;margin-bottom:24px;">
        <p style="margin:0;color:#111827;"><strong>Event:</strong> ${eventName}</p>
        <p style="margin:8px 0 0;color:#111827;"><strong>Registration ID:</strong> ${registrationId}</p>
      </div>
      <p style="color:#6b7280;font-size:14px;">Your QR pass is ready in your dashboard under My Registrations. Show it at the venue for entry. See you on Oct 8–9 at VVIT Bengaluru!</p>
    `),
  });
}

export async function sendPaymentReminderEmail(options: {
  to: string;
  name: string;
  eventName: string;
  amount: number;
  registrationId: string;
  payId?: string;
}): Promise<SendResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.innovateignite.tech";
  const payUrl = `${baseUrl}/dashboard/registrations?pay=${options.payId ?? options.registrationId}`;
  return sendEmail({
    to: options.to,
    subject: `Complete your payment for ${options.eventName} — VVIT Innovate Ignite`,
    html: layout(`
      <p style="color:#111827;font-size:16px;">Hi ${options.name},</p>
      <p style="color:#6b7280;">You're registered, but your payment is still pending — your slot is <strong>not booked</strong> until finance verifies it.</p>
      <div style="background:#f3f4f6;border-radius:6px;padding:16px 24px;margin-bottom:24px;">
        <p style="margin:0;color:#111827;"><strong>Event:</strong> ${options.eventName}</p>
        <p style="margin:8px 0 0;color:#111827;"><strong>Amount due:</strong> ₹${options.amount}</p>
        <p style="margin:8px 0 0;color:#111827;"><strong>Registration ID:</strong> ${options.registrationId}</p>
      </div>
      <a href="${payUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;margin-bottom:24px;">Pay now — opens your payment</a>
      <p style="color:#6b7280;font-size:14px;">Tap the button, pay via UPI, upload the transaction ID + screenshot, and finance will confirm your spot. Unpaid slots may be released.</p>
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
