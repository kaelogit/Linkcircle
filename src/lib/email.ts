import { SITE } from "./site";

const RESEND_API = "https://api.resend.com/emails";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it in .env.local and Vercel.",
    );
  }

  const from =
    process.env.EMAIL_FROM?.trim() ||
    `Link Circle <onboarding@resend.dev>`;

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: SITE.contactEmail,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    id?: string;
  };

  if (!res.ok) {
    throw new Error(json.message || "Email send failed");
  }

  return json;
}
