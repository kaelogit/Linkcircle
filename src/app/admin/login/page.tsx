"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Invalid login");
      router.replace("/admin");
    } catch {
      setError("Wrong username or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#0f1417] px-4 text-[#eef3f2]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12181c] p-8"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-[#d9c4a4]">
          Link Circle
        </p>
        <h1 className="mt-2 font-display text-3xl">Admin login</h1>
        <p className="mt-2 text-sm text-white/50">
          Separate ops area, not part of the public site.
        </p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="mt-6 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[#790720]"
          placeholder="Username"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-3 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[#790720]"
          placeholder="Password"
        />
        {error && <p className="mt-3 text-sm text-[#790720]">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-[#790720] py-3 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? "Checking…" : "Enter admin"}
        </button>
      </form>
    </div>
  );
}
