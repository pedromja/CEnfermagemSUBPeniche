import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";

const COOKIE = "__Host-ce-guest";
const MAX_AGE = 60 * 60 * 24 * 30;
const GUEST_BLOB = "guest-v1";
const PUBLISHED_SECRET =
  "985d9269d6b5a6102c95ea6d1d3fc4fc0cd440176c1236a50fa8a2751f6fa41b";

function cookieSecret(): string {
  return process.env.BETTER_AUTH_SECRET?.trim() || PUBLISHED_SECRET;
}

type GuestRecord = { hash: string; updatedAt: string };

function hashPassword(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, 32);
}

export function encodeGuestHash(password: string): string {
  const salt = randomBytes(16);
  const hash = hashPassword(password, salt);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyGuestHash(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const next = hashPassword(password, Buffer.from(saltHex, "hex"));
  const prev = Buffer.from(hashHex, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

async function readGuestRecord(): Promise<GuestRecord | null> {
  try {
    const { loadJsonBlob } = await import("@/lib/pglite-persist");
    const snap = await loadJsonBlob<GuestRecord>(GUEST_BLOB);
    if (snap?.hash) return snap;
  } catch {
    /* fall through */
  }
  const sql = await getSql();
  const rows = await sql<{ staff_password_hash: string }>`
    select staff_password_hash from site_settings where id = 'default'
  `;
  const hash = rows[0]?.staff_password_hash?.trim() ?? "";
  return hash ? { hash, updatedAt: "" } : null;
}

export async function guestPasswordIsSet(): Promise<boolean> {
  const rec = await readGuestRecord();
  return Boolean(rec?.hash);
}

export async function saveGuestPassword(password: string): Promise<void> {
  if (password.length < 8) {
    throw new Error("A palavra-passe da equipa deve ter pelo menos 8 caracteres.");
  }
  const hash = encodeGuestHash(password);
  const sql = await getSql();
  await sql`
    insert into site_settings (id, access_mode, staff_password_hash)
    values ('default', 'ip', ${hash})
    on conflict (id) do update set
      staff_password_hash = ${hash},
      updated_at = now()
  `;
  const { saveJsonBlob } = await import("@/lib/pglite-persist");
  await saveJsonBlob(GUEST_BLOB, {
    hash,
    updatedAt: new Date().toISOString(),
  });
  const { persistDb } = await import("@/lib/db");
  await persistDb();
}

export async function verifyGuestPassword(password: string): Promise<boolean> {
  const rec = await readGuestRecord();
  if (!rec?.hash) return false;
  return verifyGuestHash(password, rec.hash);
}

function sign(exp: string): string {
  return createHmac("sha256", cookieSecret()).update(`guest:${exp}`).digest("hex");
}

export function hasGuestSession(): boolean {
  const raw = getCookie(COOKIE);
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const until = Number(exp);
  return Number.isFinite(until) && until > Date.now();
}

export function writeGuestSession(): void {
  const exp = String(Date.now() + MAX_AGE * 1000);
  setCookie(COOKIE, `${exp}.${sign(exp)}`, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
  });
}

export function clearGuestSession(): void {
  deleteCookie(COOKIE, { path: "/", secure: true });
}
