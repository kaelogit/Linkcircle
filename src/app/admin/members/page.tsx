"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/site";

export default function AdminMembersPage() {
  const [list, setList] = useState<Member[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/members");
    const data = await res.json();
    if (Array.isArray(data)) setList(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, whatsapp, bio }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Failed");
      setFullName("");
      setPhone("");
      setWhatsapp("");
      setBio("");
      setMessage(`Added ${data.fullName}`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this member from the directory?")) return;
    await fetch(`/api/members?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  }

  async function onPhoto(id: string, file: File | null) {
    if (!file) return;
    setUploadingId(id);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/members/${id}/photo`, {
        method: "POST",
        body: form,
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage(`Photo updated for ${data.fullName}`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Directory</h1>
        <p className="mt-2 text-white/50">
          Every Link Circle member. Event participants are added here
          automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={addMember}
          className="rounded-2xl border border-white/10 bg-[#12181c] p-5"
        >
          <h2 className="font-display text-xl">Add member</h2>

          <label className="mt-4 block text-sm text-white/45">Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">Phone</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">
            WhatsApp username
          </label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
            placeholder="Optional · e.g. @name"
          />

          <label className="mt-4 block text-sm text-white/45">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
            placeholder="Optional"
          />

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-[#0f1417]"
          >
            {busy ? "Saving…" : "Add to directory"}
          </button>
          {message && <p className="mt-4 text-sm text-white/55">{message}</p>}
        </form>

        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Members</h2>
            <p className="text-sm text-white/45">{list.length} total</p>
          </div>
          <div className="mt-5 max-h-[40rem] space-y-3 overflow-auto">
            {list.length === 0 && (
              <p className="text-sm text-white/40">No members yet.</p>
            )}
            {list.map((m) => (
              <div
                key={m.id}
                className="flex gap-4 rounded-xl border border-white/10 px-4 py-3"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={m.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-white/35">
                      No photo
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{m.fullName}</p>
                  <p className="text-sm text-white/45">{m.phone}</p>
                  {m.whatsapp && (
                    <p className="text-sm text-white/35">WA: {m.whatsapp}</p>
                  )}
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/30">
                    {m.source === "event" ? "From event" : "Manual"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <label className="cursor-pointer text-[#3a9a9e] underline">
                      {uploadingId === m.id ? "Uploading…" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingId === m.id}
                        onChange={(e) =>
                          void onPhoto(m.id, e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void remove(m.id)}
                      className="text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
