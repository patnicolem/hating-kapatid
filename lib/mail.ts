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

export type SettlementReminderEmailInput = {
  to: string;
  toName: string;
  remitterName: string;
  groupName: string;
  currency: string;
  amount: number;
  fromName: string;
  payeeName: string;
};

export async function sendSettlementReminderEmail({
  to,
  toName,
  remitterName,
  groupName,
  currency,
  amount,
  fromName,
  payeeName,
}: SettlementReminderEmailInput): Promise<void> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "SMTP not configured; skipping settlement reminder email for " + to
    );
    return;
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const groupsUrl = `${APP_URL}/groups`;

  try {
    await transport.sendMail({
      from: `"Hating Kapatid" <${SMTP_USER}>`,
      to,
      subject: `Reminder: pending settlement in ${groupName} on Hating Kapatid`,
      text: [
        `Hi ${toName},`,
        "",
        `${remitterName} is reminding you about a pending settlement in the group "${groupName}".`,
        "",
        `${fromName} owes ${payeeName} ${formattedAmount}.`,
        "",
        "Sign in to Hating Kapatid to confirm or cancel this settlement:",
        groupsUrl,
      ].join("\n"),
      html: `
      <p>Hi ${escapeHtml(toName)},</p>
      <p>${escapeHtml(remitterName)} is reminding you about a pending settlement in the group
        <strong>${escapeHtml(groupName)}</strong>.</p>
      <p><strong>${escapeHtml(fromName)}</strong> owes <strong>${escapeHtml(payeeName)}</strong>
        <strong>${escapeHtml(formattedAmount)}</strong>.</p>
      <p>Sign in to Hating Kapatid to confirm or cancel this settlement:
        <a href="${groupsUrl}">${groupsUrl}</a></p>
    `,
    });
  } catch (error) {
    console.error("Failed to send settlement reminder email:", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}