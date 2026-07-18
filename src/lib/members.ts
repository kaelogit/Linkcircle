import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { Member, MemberSource } from "./site";
import { readJsonFile, writeJsonFile } from "./json-store";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";
import {
  memberFromRow,
  memberToRow,
  type MemberRow,
} from "./supabase-map";

const FILENAME = "members.json";
const BUCKET = "member-photos";

export function normalizePhoneKey(phone: string) {
  return phone.replace(/\D/g, "");
}

async function readMembersLocal(): Promise<Member[]> {
  const fromDisk = await readJsonFile<Member[]>(FILENAME, []);
  return Array.isArray(fromDisk) ? fromDisk : [];
}

async function writeMembersLocal(list: Member[]) {
  await writeJsonFile(FILENAME, list);
}

export async function readMembers(): Promise<Member[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("members")
      .select("*")
      .order("full_name", { ascending: true });
    if (error) throw new Error(`Failed to load members: ${error.message}`);
    return (data as MemberRow[]).map(memberFromRow);
  }
  const list = await readMembersLocal();
  return list.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getMemberById(id: string) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("members")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load member: ${error.message}`);
    return data ? memberFromRow(data as MemberRow) : null;
  }
  const list = await readMembersLocal();
  return list.find((m) => m.id === id) ?? null;
}

export async function getMemberByPhoneKey(phoneKey: string) {
  if (!phoneKey) return null;
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("members")
      .select("*")
      .eq("phone_key", phoneKey)
      .maybeSingle();
    if (error) throw new Error(`Failed to load member: ${error.message}`);
    return data ? memberFromRow(data as MemberRow) : null;
  }
  const list = await readMembersLocal();
  return list.find((m) => m.phoneKey === phoneKey) ?? null;
}

export type MemberInput = {
  fullName: string;
  phone: string;
  whatsapp?: string;
  bio?: string;
  photoUrl?: string;
  source?: MemberSource;
};

export async function createMember(input: MemberInput) {
  const phoneKey = normalizePhoneKey(input.phone);
  if (!phoneKey) throw new Error("A valid phone number is required.");

  const existing = await getMemberByPhoneKey(phoneKey);
  if (existing) {
    throw new Error("A member with this phone number already exists.");
  }

  const now = new Date().toISOString();
  const member: Member = {
    id: `mem_${randomBytes(8).toString("hex")}`,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    phoneKey,
    whatsapp: input.whatsapp?.trim() || undefined,
    photoUrl: input.photoUrl,
    bio: (input.bio ?? "").trim(),
    source: input.source ?? "manual",
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("members").insert(memberToRow(member));
    if (error) throw new Error(`Failed to create member: ${error.message}`);
    return member;
  }

  const list = await readMembersLocal();
  list.push(member);
  await writeMembersLocal(list);
  return member;
}

export async function updateMember(
  id: string,
  patch: Partial<MemberInput> & { photoUrl?: string | null },
) {
  const current = await getMemberById(id);
  if (!current) return null;

  const nextPhone = patch.phone?.trim() ?? current.phone;
  const nextKey = normalizePhoneKey(nextPhone);
  if (!nextKey) throw new Error("A valid phone number is required.");

  if (nextKey !== current.phoneKey) {
    const clash = await getMemberByPhoneKey(nextKey);
    if (clash && clash.id !== id) {
      throw new Error("Another member already uses this phone number.");
    }
  }

  const updated: Member = {
    ...current,
    fullName: patch.fullName?.trim() ?? current.fullName,
    phone: nextPhone,
    phoneKey: nextKey,
    whatsapp:
      patch.whatsapp !== undefined
        ? patch.whatsapp.trim() || undefined
        : current.whatsapp,
    bio: patch.bio !== undefined ? patch.bio.trim() : current.bio,
    photoUrl:
      patch.photoUrl === null
        ? undefined
        : patch.photoUrl !== undefined
          ? patch.photoUrl
          : current.photoUrl,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("members")
      .update(memberToRow(updated))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(`Failed to update member: ${error.message}`);
    return memberFromRow(data as MemberRow);
  }

  const list = await readMembersLocal();
  const index = list.findIndex((m) => m.id === id);
  if (index === -1) return null;
  list[index] = updated;
  await writeMembersLocal(list);
  return updated;
}

export async function deleteMember(id: string) {
  if (isSupabaseConfigured()) {
    const existing = await getMemberById(id);
    if (!existing) return false;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("members").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete member: ${error.message}`);
    return true;
  }
  const list = await readMembersLocal();
  const next = list.filter((m) => m.id !== id);
  if (next.length === list.length) return false;
  await writeMembersLocal(next);
  return true;
}

/** Upsert directory member when an event participant is created. */
export async function ensureMemberFromParticipant(input: {
  fullName: string;
  phone: string;
  whatsapp?: string;
}) {
  const phoneKey = normalizePhoneKey(input.phone);
  if (!phoneKey) return null;

  const existing = await getMemberByPhoneKey(phoneKey);
  if (existing) {
    const patch: Partial<MemberInput> = {};
    if (!existing.whatsapp && input.whatsapp?.trim()) {
      patch.whatsapp = input.whatsapp.trim();
    }
    if (
      input.fullName.trim() &&
      existing.fullName.trim().toLowerCase() !==
        input.fullName.trim().toLowerCase()
    ) {
      // Keep existing name unless it looks empty
      if (!existing.fullName.trim()) patch.fullName = input.fullName.trim();
    }
    if (Object.keys(patch).length === 0) return existing;
    return (await updateMember(existing.id, patch)) ?? existing;
  }

  return createMember({
    fullName: input.fullName,
    phone: input.phone,
    whatsapp: input.whatsapp,
    source: "event",
  });
}

export async function uploadMemberPhoto(memberId: string, file: File) {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");

  const ext =
    path.extname(file.name).toLowerCase() ||
    (file.type.includes("png")
      ? ".png"
      : file.type.includes("webp")
        ? ".webp"
        : ".jpg");
  const filename = `${memberId}_${Date.now()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const objectPath = `${memberId}/${filename}`;
    const { error: uploadError } = await sb.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
    if (uploadError) {
      throw new Error(`Photo upload failed: ${uploadError.message}`);
    }
    const { data } = sb.storage.from(BUCKET).getPublicUrl(objectPath);
    return updateMember(memberId, { photoUrl: data.publicUrl });
  }

  const publicDir = path.join(process.cwd(), "public", "uploads", "members");
  try {
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, filename), bytes);
  } catch {
    throw new Error(
      "Photo uploads need Supabase Storage on this host. Configure Supabase, then retry.",
    );
  }

  return updateMember(memberId, {
    photoUrl: `/uploads/members/${filename}`,
  });
}
