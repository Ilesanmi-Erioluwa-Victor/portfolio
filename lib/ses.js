import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: process.env.AWS_SES_REGION || "af-south-1" });

export async function sendEmail({ identifier: email, url, provider }) {
  const from = process.env.AWS_SES_FROM;
  if (!from) {
    throw new Error("AWS_SES_FROM environment variable is not set");
  }
  if (!email) {
    throw new Error("Email (identifier) is required but not provided");
  }

  const signInUrl = url;
  const subject = "Sign in to your portfolio admin";
  const textBody = `Click the link below to sign in to your portfolio admin:\n\n${signInUrl}\n\nThis link expires in 24 hours.`;
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #fafafa; border-radius: 12px; padding: 40px;">
          <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #0a0a0a;">Sign in to your portfolio admin</h1>
          <p style="margin: 0 0 24px; font-size: 16px; color: #333;">
            Click the button below to sign in to your portfolio admin dashboard.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${signInUrl}" style="display: inline-block; background: #0a0a0a; color: #fafafa; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 500; font-size: 15px;">
              Sign in
            </a>
          </div>
          <p style="margin: 24px 0 0; font-size: 13px; color: #777;">
            This link expires in 24 hours. If you didn't request this, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0 0;">
          <p style="margin: 8px 0 0; font-size: 12px; color: #999;">
            Sent from Ilesanmi Erioluwa Victor's portfolio admin
          </p>
        </div>
      </body>
    </html>
  `;

  const params = {
    Source: from,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Text: { Data: textBody, Charset: "UTF-8" },
        Html: { Data: htmlBody, Charset: "UTF-8" },
      },
    },
  };

  try {
    await ses.send(new SendEmailCommand(params));
    console.log(`Magic link email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send magic link email:", error);
    throw error;
  }
}