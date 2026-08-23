import {
  getRequestHeader,
  getRequestHost,
  getRequestIP,
} from "@tanstack/react-start/server";

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v < 0 || v > 255) return null;
    n = (n << 8) + v;
  }
  return n >>> 0;
}

function normalizeIp(raw: string): string {
  let ip = raw.trim().toLowerCase();
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip;
}

function ipMatchesRule(ip: string, rule: string): boolean {
  const r = rule.trim();
  if (!r || r.startsWith("#")) return false;
  if (r.includes("/")) {
    const [base, bitsStr] = r.split("/");
    const bits = Number(bitsStr);
    const ipN = ipv4ToInt(normalizeIp(ip));
    const baseN = ipv4ToInt(normalizeIp(base ?? ""));
    if (ipN == null || baseN == null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
      return false;
    }
    if (bits === 0) return true;
    const mask = bits === 32 ? 0xffffffff : (~((1 << (32 - bits)) - 1)) >>> 0;
    return (ipN & mask) === (baseN & mask);
  }
  return normalizeIp(ip) === normalizeIp(r);
}

export function parseIpList(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));
}

export function ipAllowed(ip: string, allowText: string): boolean {
  const rules = parseIpList(allowText);
  if (!ip || rules.length === 0) return false;
  return rules.some((rule) => ipMatchesRule(ip, rule));
}

export function clientIp(): string {
  const nf = getRequestHeader("x-nf-client-connection-ip");
  if (nf) return normalizeIp(nf.split(",")[0] ?? "");
  const real = getRequestHeader("x-real-ip");
  if (real) return normalizeIp(real.split(",")[0] ?? "");
  const forwarded = getRequestIP({ xForwardedFor: true });
  return forwarded ? normalizeIp(forwarded) : "";
}

export function isPreviewHost(): boolean {
  const host = getRequestHost({ xForwardedHost: true }).toLowerCase().split(":")[0] ?? "";
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".grok-sandbox.com")
  );
}
