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

export function normalizeIp(raw: string): string {
  let ip = raw.trim().toLowerCase().replace(/^"|"$/g, "");
  if (ip.startsWith("[") && ip.includes("]")) {
    ip = ip.slice(1, ip.indexOf("]"));
  } else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.slice(0, ip.lastIndexOf(":"));
  }
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip;
}

function ipMatchesRule(ip: string, rule: string): boolean {
  const r = normalizeIp(rule);
  if (!r || r.startsWith("#")) return false;
  const needle = normalizeIp(ip);
  if (r.includes("/")) {
    const [base, bitsStr] = r.split("/");
    const bits = Number(bitsStr);
    const ipN = ipv4ToInt(needle);
    const baseN = ipv4ToInt(normalizeIp(base ?? ""));
    if (ipN == null || baseN == null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
      return false;
    }
    if (bits === 0) return true;
    const mask = bits === 32 ? 0xffffffff : (~((1 << (32 - bits)) - 1)) >>> 0;
    return (ipN & mask) === (baseN & mask);
  }
  return needle === r;
}

export function parseIpList(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => normalizeIp(s))
    .filter((s) => s && !s.startsWith("#"));
}

export function ipAllowed(ip: string, allowText: string): boolean {
  const rules = parseIpList(allowText);
  if (!ip || rules.length === 0) return false;
  return rules.some((rule) => ipMatchesRule(ip, rule));
}

export function anyIpAllowed(ips: string[], allowText: string): boolean {
  return ips.some((ip) => ipAllowed(ip, allowText));
}

function pushHeader(into: string[], value: string | undefined | null) {
  if (!value) return;
  for (const part of value.split(/[\s,]+/)) {
    const ip = normalizeIp(part);
    if (ip && !into.includes(ip)) into.push(ip);
  }
}

export function clientIps(): string[] {
  const found: string[] = [];
  pushHeader(found, getRequestHeader("x-nf-client-connection-ip"));
  pushHeader(found, getRequestHeader("cf-connecting-ip"));
  pushHeader(found, getRequestHeader("true-client-ip"));
  pushHeader(found, getRequestHeader("x-real-ip"));
  pushHeader(found, getRequestHeader("x-client-ip"));
  pushHeader(found, getRequestHeader("x-forwarded-for"));
  try {
    pushHeader(found, getRequestIP({ xForwardedFor: true }));
  } catch {
    /* no request context */
  }
  return found;
}

export function clientIp(): string {
  return clientIps()[0] ?? "";
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
