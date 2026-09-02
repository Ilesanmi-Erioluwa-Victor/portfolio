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

  const subject = `Portfolio contact — ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; line-height: 1.55;">
      <p style="margin: 0 0 12px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin: 0 0 12px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p style="margin: 16px 0 6px;"><strong>Message</strong></p>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${user}>`,
      to: user,
      replyTo: email,
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