import nodemailer from "nodemailer";

const RATE_LIMIT = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 5;

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function checkRate(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    RATE_LIMIT.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

function isValid(body) {
  if (!body || typeof body !== "object") return false;
  const { name, email, message } = body;
  if (typeof name !== "string" || name.trim().length < 1 || name.length > 200) return false;
  if (typeof email !== "string" || email.length > 320) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (typeof message !== "string" || message.trim().length < 1 || message.length > 5000) return false;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  if (!checkRate(ip)) {
    return res.status(429).json({ error: "Too many requests. Try again in a minute." });
  }

  if (!isValid(req.body)) {
    return res.status(400).json({ error: "Please fill in name, a valid email, and a message." });
  }

  const user = process.env.CONTACT_GMAIL_USER;
  const pass = process.env.CONTACT_GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return res.status(500).json({ error: "Mail is not configured on the server." });
  }

  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const subject = `New portfolio message from ${name}`;
  const sentAt = new Date().toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const text = [
    `New portfolio contact form submission`,
    `Received: ${sentAt}`,
    ``,
    `From: ${name} <${email}>`,
    ``,
    `Message:`,
    message,
    ``,
    `Reply directly to this email to respond to ${name}.`,
  ].join("\n");

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ededed;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ededed;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
            <tr>
              <td style="padding:0 0 18px 0;">
                <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#5d5d5d;">Portfolio &middot; Contact form</span>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid rgba(10,10,10,0.08);border-radius:14px;padding:36px 32px 28px 32px;">
                <h1 style="margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:600;line-height:1.3;color:#0a0a0a;letter-spacing:-0.4px;">
                  New message from ${escapeHtml(name)}
                </h1>
                <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#5d5d5d;">
                  Received ${escapeHtml(sentAt)}
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;">
                  <tr>
                    <td style="padding:14px 16px;background:#f8f8f8;border:1px solid rgba(10,10,10,0.06);border-radius:10px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding:4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5d5d5d;width:84px;">From</td>
                          <td style="padding:4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#0a0a0a;">${escapeHtml(name)}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5d5d5d;">Email</td>
                          <td style="padding:4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#0a0a0a;">
                            <a href="mailto:${escapeHtml(email)}" style="color:#0a0a0a;text-decoration:underline;text-decoration-color:#2ecc71;text-decoration-thickness:2px;text-underline-offset:3px;">${escapeHtml(email)}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5d5d5d;">Message</td>
                  </tr>
                  <tr>
                    <td style="padding:18px 20px;background:#0a0a0a;border-radius:10px;">
                      <div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#ededed;white-space:pre-wrap;">${escapeHtml(message)}</div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0 0;">
                  <tr>
                    <td align="left">
                      <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}" style="display:inline-block;background:#0a0a0a;color:#fcfbfb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;line-height:1;letter-spacing:-0.2px;text-decoration:none;padding:14px 22px;border-radius:999px;">
                        Reply to {{NAME}} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 4px 0 4px;text-align:center;">
                <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#5d5d5d;">
                  Sent from the contact form at ilesanmi.vercel.app
                </p>
                <p style="margin:6px 0 0 0;width:40px;height:3px;background:#2ecc71;border-radius:2px;display:inline-block;"></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.replace("{{NAME}}", escapeHtml(name).split(" ")[0] || escapeHtml(name));

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${user}>`,
      to: user,
      replyTo: `${name} <${email}>`,
      subject,
      text,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact api error", err);
    return res.status(502).json({ error: "Could not send right now. Please try again." });
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}