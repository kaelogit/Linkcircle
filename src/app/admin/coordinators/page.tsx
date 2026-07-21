"use client";

import { useEffect, useState } from "react";
import type { Coordinator } from "@/lib/site";

type Draft = {
  name: string;
  role: string;
  bio: string;
  quote: string;
  alias: string;
  isFounder: boolean;
  initials: string;
  accent: string;
  sortOrder: number;
};

const emptyDraft: Draft = {
  name: "",
  role: "",
  bio: "",
  quote: "",
  alias: "",
  isFounder: false,
  initials: "",
  accent: "#790720",
  sortOrder: 100,
};

export default function AdminCoordinatorsPage() {
  const [list, setList] = useState<(Coordinator & { sortOrder?: number })[]>(
    [],
  );
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/coordinators");
    const data = await res.json();
    if (Array.isArray(data)) setList(data);
  }

  useEffect(() => {
    void load();
  }, []);

  function startEdit(c: Coordinator & { sortOrder?: number }) {
    setEditingId(c.id);
    setDraft({
      name: c.name,
      role: c.role,
      bio: c.bio ?? "",
      quote: c.quote ?? "",
      alias: c.alias ?? "",
      isFounder: c.isFounder,
      initials: c.initials,
      accent: c.accent,
      sortOrder: c.sortOrder ?? 100,
    });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const payload = {
        name: draft.name,
        role: draft.role,
        bio: draft.bio,
        quote: draft.quote || undefined,
        alias: draft.alias || undefined,
        isFounder: draft.isFounder,
        initials: draft.initials || undefined,
        accent: draft.accent,
        sortOrder: draft.sortOrder,
      };

      const res = await fetch("/api/coordinators", {
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
        editingId ? `Updated ${data.name}` : `Added ${data.name}`,
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
    if (!confirm("Remove this coordinator?")) return;
    await fetch(`/api/coordinators?id=${encodeURIComponent(id)}`, {
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
      const res = await fetch(`/api/coordinators/${id}/photo`, {
        method: "POST",
        body: form,
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage(`Photo updated for ${data.name}`);
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
        <h1 className="font-display text-3xl">People / Coordinators</h1>
        <p className="mt-2 text-white/50">
          Manage the founder &amp; admin team shown on the People page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={save}
          className="rounded-2xl border border-white/10 bg-[#12181c] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">
              {editingId ? "Edit coordinator" : "Add coordinator"}
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

          <label className="mt-4 block text-sm text-white/45">Name</label>
          <input
            required
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">Role</label>
          <input
            required
            value={draft.role}
            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
            placeholder="e.g. Community Manager"
          />

          <label className="mt-4 block text-sm text-white/45">Bio</label>
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">Quote</label>
          <textarea
            value={draft.quote}
            onChange={(e) => setDraft((d) => ({ ...d, quote: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
            placeholder="Optional"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/45">Alias</label>
              <input
                value={draft.alias}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, alias: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm text-white/45">Initials</label>
              <input
                value={draft.initials}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, initials: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
                placeholder="Auto from name"
                maxLength={3}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/45">Accent color</label>
              <input
                type="color"
                value={draft.accent}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, accent: e.target.value }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/20 px-2"
              />
            </div>
            <div>
              <label className="block text-sm text-white/45">Sort order</label>
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    sortOrder: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
              />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-white/45">
            <input
              type="checkbox"
              checked={draft.isFounder}
              onChange={(e) =>
                setDraft((d) => ({ ...d, isFounder: e.target.checked }))
              }
              className="rounded"
            />
            Founder
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-[#0f1417]"
          >
            {busy
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Add coordinator"}
          </button>
          {message && <p className="mt-4 text-sm text-white/55">{message}</p>}
        </form>

        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Team</h2>
            <p className="text-sm text-white/45">{list.length} people</p>
          </div>
          <div className="mt-5 max-h-[40rem] space-y-3 overflow-auto">
            {list.length === 0 && (
              <p className="text-sm text-white/40">No coordinators yet.</p>
            )}
            {list.map((c) => (
              <div
                key={c.id}
                className={`flex gap-4 rounded-xl border px-4 py-3 ${
                  editingId === c.id
                    ? "border-[#790720]/60 bg-[#790720]/10"
                    : "border-white/10"
                }`}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {c.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-full place-items-center text-sm font-bold text-white"
                      style={{ background: c.accent }}
                    >
                      {c.initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {c.name}
                    {c.isFounder && (
                      <span className="ml-2 text-xs text-[#d4a24a]">
                        Founder
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-white/45">{c.role}</p>
                  {c.bio && (
                    <p className="mt-1 line-clamp-2 text-sm text-white/40">
                      {c.bio}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-[#3a9a9e] underline"
                    >
                      Edit
                    </button>
                    <label className="cursor-pointer text-[#3a9a9e] underline">
                      {uploadingId === c.id ? "Uploading…" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingId === c.id}
                        onChange={(e) =>
                          void onPhoto(c.id, e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void remove(c.id)}
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
