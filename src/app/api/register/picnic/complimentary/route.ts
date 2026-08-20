import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createComplimentaryRegistration,
  registerComplimentaryAdmins,
} from "@/lib/registrations";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = String(body?.mode ?? "admins").trim();

    if (mode === "admins") {
      const results = await registerComplimentaryAdmins();
      return NextResponse.json({ ok: true, results });
    }

    if (mode === "one") {
      const fullName = String(body.fullName ?? "").trim();
      const email = String(body.email ?? "").trim();
      const phone = String(body.phone ?? "").trim();
      const residence = String(body.residence ?? "Link Circle admin").trim();
      const bringItem = String(
        body.bringItem ?? "Admin / hosting support",
      ).trim();

      if (!fullName || !email || !phone) {
        return NextResponse.json(
          { error: "Name, email, and phone are required." },
          { status: 400 },
        );
      }

      const result = await createComplimentaryRegistration({
        fullName,
        email,
        phone,
        residence,
        bringItem,
      });

      return NextResponse.json({
        ok: true,
        created: result.created,
        skipped: result.skipped,
        registration: result.registration,
      });
    }

    return NextResponse.json(
      { error: "mode must be 'admins' or 'one'" },
      { status: 400 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Complimentary registration failed";
    const status = message.includes("closed") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
