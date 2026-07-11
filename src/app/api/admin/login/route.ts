import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  encodeSession,
  verifyAdminLogin,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  const account = verifyAdminLogin(username, password);
  if (!account) {
    return NextResponse.json({ error: "Invalid login" }, { status: 401 });
  }

  const res = NextResponse.json({
    ok: true,
    username: account.username,
    displayName: account.displayName,
  });
  res.cookies.set(
    ADMIN_COOKIE,
    encodeSession(account.username, account.password),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    }
  );
  return res;
}
