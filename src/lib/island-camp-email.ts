import type { EventRegistration } from "./registrations";
import { sendEmail, isEmailConfigured } from "./email";
import {
  islandCampBalanceDeadlineLabel,
  islandCampBalanceReminderMessage,
  islandCampBalanceUrl,
  islandCampBalanceGrossKobo,
} from "./island-camp-balance";
import { SITE } from "./site";

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function balanceNaira(reg: EventRegistration) {
  return Math.ceil((reg.balanceDueKobo || islandCampBalanceGrossKobo()) / 100);
}

function balanceUrl(reg: EventRegistration) {
  return reg.balanceReference
    ? islandCampBalanceUrl(reg.balanceReference)
    : `${SITE.url}/register/island-camp/balance`;
}

function reminderSubject() {
  return "LC Island Camp: balance payment due";
}

function depositSubject() {
  return "LC Island Camp: deposit received, balance due";
}

function emailHtml(params: {
  greeting: string;
  intro: string;
  balanceLine: string;
  deadline: string;
  url: string;
  footer: string;
}) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.6;color:#0e1518;max-width:560px;margin:0 auto;padding:24px">
  <p style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#0d7c80">Link Circle</p>
  <h1 style="font-size:24px;margin:16px 0 8px">${params.greeting}</h1>
  <p>${params.intro}</p>
  <p><strong>${params.balanceLine}</strong></p>
  <p>Pay before <strong>${params.deadline}</strong> to keep your slot. The deposit is non-refundable.</p>
  <p style="margin:28px 0">
    <a href="${params.url}" style="display:inline-block;background:#0d7c80;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:600">Pay balance now</a>
  </p>
  <p style="font-size:13px;color:#5a6670;word-break:break-all">${params.url}</p>
  <p style="margin-top:32px;font-size:13px;color:#5a6670">${params.footer}</p>
</body>
</html>`;
}

export async function sendIslandCampDepositReceivedEmail(reg: EventRegistration) {
  if (!isEmailConfigured() || !reg.email) return { sent: false as const };

  const deadline = islandCampBalanceDeadlineLabel();
  const url = balanceUrl(reg);
  const amount = balanceNaira(reg);
  const name = firstName(reg.fullName);
  const text = islandCampBalanceReminderMessage(reg);

  await sendEmail({
    to: reg.email,
    subject: depositSubject(),
    text,
    html: emailHtml({
      greeting: `Hi ${name},`,
      intro:
        "Your 50% deposit for LC Island Camp is confirmed and your slot is reserved.",
      balanceLine: `Remaining balance: ₦${amount.toLocaleString("en-NG")} (includes Paystack fee).`,
      deadline,
      url,
      footer:
        "Questions? Reply to this email or message us on WhatsApp. See you on the island.",
    }),
  });

  return { sent: true as const };
}

export async function sendIslandCampBalanceReminderEmail(reg: EventRegistration) {
  if (!isEmailConfigured() || !reg.email) return { sent: false as const };

  const deadline = islandCampBalanceDeadlineLabel();
  const url = balanceUrl(reg);
  const amount = balanceNaira(reg);
  const name = firstName(reg.fullName);
  const text = islandCampBalanceReminderMessage(reg);

  await sendEmail({
    to: reg.email,
    subject: reminderSubject(),
    text,
    html: emailHtml({
      greeting: `Hi ${name},`,
      intro: "This is a reminder about your LC Island Camp registration.",
      balanceLine: `Balance due: ₦${amount.toLocaleString("en-NG")} (includes Paystack fee).`,
      deadline,
      url,
      footer:
        "If you already paid, you can ignore this. Questions? Reply to this email.",
    }),
  });

  return { sent: true as const };
}
