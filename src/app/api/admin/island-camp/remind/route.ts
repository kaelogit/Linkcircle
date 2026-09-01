import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isEmailConfigured } from "@/lib/email";
import { sendIslandCampBalanceReminderEmail } from "@/lib/island-camp-email";
import {
  listIslandCampBalanceDue,
  markIslandCampBalanceReminderSent,
} from "@/lib/island-camp-registrations";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          error:
            "Email is not configured. Add RESEND_API_KEY and EMAIL_FROM in Vercel.",
        },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const registrationId =
      typeof body === "object" && body && "registrationId" in body
        ? String(body.registrationId ?? "").trim()
        : "";
    const sendAll = Boolean(
      typeof body === "object" && body && "all" in body && body.all,
    );

    const due = await listIslandCampBalanceDue();
    const targets = sendAll
      ? due
      : due.filter((r) => r.id === registrationId);

    if (targets.length === 0) {
      return NextResponse.json(
        { error: "No balance-due registration found to email." },
        { status: 404 },
      );
    }

    const results: { id: string; email: string; sent: boolean; error?: string }[] =
      [];

    for (const reg of targets) {
      try {
        const result = await sendIslandCampBalanceReminderEmail(reg);
        if (result.sent) {
          await markIslandCampBalanceReminderSent(reg.id);
        }
        results.push({
          id: reg.id,
          email: reg.email,
          sent: result.sent,
        });
      } catch (err) {
        results.push({
          id: reg.id,
          email: reg.email,
          sent: false,
          error: err instanceof Error ? err.message : "Send failed",
        });
      }
    }

    const sent = results.filter((r) => r.sent).length;
    return NextResponse.json({ sent, total: results.length, results });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not send reminders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
