import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export type InviteEmailInput = {
  to: string;
  groupName: string;
  inviterName: string;
};

export async function sendInviteEmail({
  to,
  groupName,
  inviterName,
}: InviteEmailInput): Promise<void> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "SMTP not configured; skipping group invite email for " + to
    );
    return;
  }

  const loginUrl = `${APP_URL}/login`;

  await transport.sendMail({
    from: `"Hating Kapatid" <${SMTP_USER}>`,
    to,
    subject: `You're invited to join ${groupName} on Hating Kapatid`,
    text: [
      `${inviterName} invited you to join the group "${groupName}" on Hating Kapatid.`,
      "",
      "Sign in or create an account with your email to accept or reject the invitation:",
      loginUrl,
    ].join("\n"),
    html: `
      <p>${escapeHtml(inviterName)} invited you to join the group
        <strong>${escapeHtml(groupName)}</strong> on Hating Kapatid.</p>
      <p>Sign in or create an account with your email to accept or reject the invitation:</p>
      <p><a href="${loginUrl}">${loginUrl}</a></p>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}