import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email";
import { sendIslandCampBalanceReminderEmail } from "@/lib/island-camp-email";
import {
  listIslandCampBalanceDue,
  markIslandCampBalanceReminderSent,
} from "@/lib/island-camp-registrations";
import { isIslandCampRegistrationOpen } from "@/lib/island-camp";

const REMINDER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: true, skipped: "email_not_configured" });
  }

  if (!isIslandCampRegistrationOpen()) {
    return NextResponse.json({ ok: true, skipped: "registration_closed" });
  }

  try {
    const due = await listIslandCampBalanceDue();
    const now = Date.now();
    const targets = due.filter((r) => {
      if (!r.balanceReference || !r.email) return false;
      if (!r.balanceReminderSentAt) return true;
      return now - +new Date(r.balanceReminderSentAt) >= REMINDER_COOLDOWN_MS;
    });

    let sent = 0;
    const errors: string[] = [];

    for (const reg of targets) {
      try {
        const result = await sendIslandCampBalanceReminderEmail(reg);
        if (result.sent) {
          await markIslandCampBalanceReminderSent(reg.id);
          sent += 1;
        }
      } catch (err) {
        errors.push(
          `${reg.id}: ${err instanceof Error ? err.message : "failed"}`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      eligible: targets.length,
      sent,
      errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
