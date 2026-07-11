import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "lc_admin_session";

export type AdminAccount = {
  username: string;
  displayName: string;
  password: string;
};

export function getAdminAccounts(): AdminAccount[] {
  return [
    {
      username: "founders",
      displayName: "Founders",
      password: process.env.ADMIN_PASSWORD_FOUNDERS || "Ksquare123$",
    },
    {
      username: "elvis",
      displayName: "Elvis",
      password: process.env.ADMIN_PASSWORD_ELVIS || "Watermelon234!",
    },
  ];
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function sessionTokenFor(username: string, password: string) {
  return hashSecret(`lc:${username.toLowerCase()}:${password}:v2`);
}

export function encodeSession(username: string, password: string) {
  return `${username.toLowerCase()}.${sessionTokenFor(username, password)}`;
}

export function verifyAdminLogin(username: string, password: string) {
  const inputUser = username.trim().toLowerCase();
  const account = getAdminAccounts().find(
    (a) => a.username.toLowerCase() === inputUser
  );
  if (!account) return null;
  if (!safeEqual(account.password, password)) return null;
  return account;
}

export function resolveSession(raw: string | undefined) {
  if (!raw || !raw.includes(".")) return null;
  const [username, token] = raw.split(".", 2);
  if (!username || !token) return null;
  const account = getAdminAccounts().find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );
  if (!account) return null;
  const expected = sessionTokenFor(account.username, account.password);
  if (!safeEqual(expected, token)) return null;
  return account;
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return Boolean(resolveSession(jar.get(ADMIN_COOKIE)?.value));
}

export async function getAdminSession() {
  const jar = await cookies();
  return resolveSession(jar.get(ADMIN_COOKIE)?.value);
}
