import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { GUEST_PASSWORD, GUEST_USERNAME } from "./guest-credentials";

const COOKIE = "__Host-ce-guest";
const MAX_AGE = 60 * 60 * 24 * 30;
const PUBLISHED_SECRET =
  "985d9269d6b5a6102c95ea6d1d3fc4fc0cd440176c1236a50fa8a2751f6fa41b";

function cookieSecret(): string {
  return process.env.BETTER_AUTH_SECRET?.trim() || PUBLISHED_SECRET;
}

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

export function guestPasswordIsSet(): boolean {
  return true;
}

export function verifyGuestLogin(username: string, password: string): boolean {
  return (
    same(username.trim().toLowerCase(), GUEST_USERNAME) &&
    same(password, GUEST_PASSWORD)
  );
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
  if (!same(sig, expected)) return false;
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
