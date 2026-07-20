"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/site";

type Draft = {
  fullName: string;
  phone: string;
  whatsapp: string;
  bio: string;
};

const emptyDraft: Draft = {
  fullName: "",
  phone: "",
  whatsapp: "",
  bio: "",
};

export default function AdminMembersPage() {
  const [list, setList] = useState<Member[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  function startEdit(m: Member) {
    setEditingId(m.id);
    setDraft({
      fullName: m.fullName,
      phone: m.phone,
      whatsapp: m.whatsapp ?? "",
      bio: m.bio ?? "",
    });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function saveMember(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const payload = {
        fullName: draft.fullName,
        phone: draft.phone,
        whatsapp: draft.whatsapp || undefined,
        bio: draft.bio,
      };

      const res = await fetch("/api/members", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload,
        ),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(
        editingId ? `Updated ${data.fullName}` : `Added ${data.fullName}`,
      );
      cancelEdit();
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
    if (editingId === id) cancelEdit();
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
          onSubmit={saveMember}
          className="rounded-2xl border border-white/10 bg-[#12181c] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">
              {editingId ? "Edit member" : "Add member"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm text-white/45 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          <label className="mt-4 block text-sm text-white/45">Full name</label>
          <input
            required
            value={draft.fullName}
            onChange={(e) =>
              setDraft((d) => ({ ...d, fullName: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">Phone</label>
          <input
            required
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">
            WhatsApp username
          </label>
          <input
            value={draft.whatsapp}
            onChange={(e) =>
              setDraft((d) => ({ ...d, whatsapp: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
            placeholder="Optional · e.g. @name"
          />

          <label className="mt-4 block text-sm text-white/45">Bio</label>
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
            rows={4}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
            placeholder="Optional"
          />

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-[#0f1417]"
          >
            {busy
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Add to directory"}
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
                className={`flex gap-4 rounded-xl border px-4 py-3 ${
                  editingId === m.id
                    ? "border-[#790720]/60 bg-[#790720]/10"
                    : "border-white/10"
                }`}
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
                  {m.bio && (
                    <p className="mt-1 line-clamp-2 text-sm text-white/40">
                      {m.bio}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="text-[#3a9a9e] underline"
                    >
                      Edit
                    </button>
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
