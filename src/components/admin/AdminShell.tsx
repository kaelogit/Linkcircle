"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/participants", label: "Participants" },
  { href: "/admin/scan", label: "Door scan" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    fetch("/api/admin/me")
      .then(async (r) => {
        if (!r.ok) throw new Error("nope");
        const data = await r.json();
        setDisplayName(data.displayName || data.username || "Admin");
        setAuthed(true);
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setReady(true));
  }, [isLogin, router, pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0f1417] text-white/60">
        Loading admin…
      </div>
    );
  }

  if (isLogin) return <>{children}</>;
  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#0f1417] text-[#eef3f2]">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#12181c] p-5 md:flex md:flex-col">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d9c4a4]">
              Link Circle
            </p>
            <p className="mt-1 font-display text-2xl">Admin</p>
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2.5 text-sm ${
                    active
                      ? "bg-[#790720] text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-4 rounded-xl border border-white/15 px-3 py-2 text-left text-sm text-white/60 hover:text-white"
          >
            Log out
          </button>
          <Link
            href="/"
            className="mt-2 text-xs text-white/35 hover:text-white/70"
          >
            ← Public site
          </Link>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </button>
            <p className="font-display text-lg md:hidden">LC Admin</p>
            <p className="hidden text-sm text-white/45 md:block">
              Signed in as {displayName}
            </p>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm md:hidden"
            >
              Out
            </button>
          </header>

          {menuOpen && (
            <div className="border-b border-white/10 bg-[#12181c] px-4 py-3 md:hidden">
              <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          <div className="flex-1 p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
