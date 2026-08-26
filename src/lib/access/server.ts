import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";
import { clientIp, ipAllowed, isPreviewHost } from "./ip.server";

export type AccessState = {
  setupNeeded: boolean;
  granted: boolean;
  reason: "ok" | "setup" | "ip" | "unset";
  clientIp: string;
  preview: boolean;
  allowedIps: string;
  isAdmin: boolean;
};

type SettingsRow = {
  allowed_ips: string;
};

async function ensureSettings(): Promise<SettingsRow> {
  const sql = await getSql();
  await sql`
    insert into site_settings (id, access_mode)
    values ('default', 'ip')
    on conflict (id) do nothing
  `;
  const rows = await sql<SettingsRow>`
    select allowed_ips from site_settings where id = 'default'
  `;
  return rows[0] ?? { allowed_ips: "" };
}

export async function adminExists(): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from "user"`;
  return (rows[0]?.n ?? 0) > 0;
}

export async function readAccessState(): Promise<AccessState> {
  const preview = isPreviewHost();
  const ip = clientIp();
  const setupNeeded = !(await adminExists());
  const settings = await ensureSettings();
  const admin = Boolean(await getSessionUser());
  const hasList = Boolean(settings.allowed_ips.trim());

  if (setupNeeded) {
    return {
      setupNeeded: true,
      granted: false,
      reason: "setup",
      clientIp: ip,
      preview,
      allowedIps: "",
      isAdmin: false,
    };
  }

  if (admin) {
    return {
      setupNeeded: false,
      granted: true,
      reason: "ok",
      clientIp: ip,
      preview,
      allowedIps: settings.allowed_ips,
      isAdmin: true,
    };
  }

  if (!hasList) {
    return {
      setupNeeded: false,
      granted: preview,
      reason: preview ? "ok" : "unset",
      clientIp: ip,
      preview,
      allowedIps: settings.allowed_ips,
      isAdmin: false,
    };
  }

  const ok = ipAllowed(ip, settings.allowed_ips) || preview;
  return {
    setupNeeded: false,
    granted: ok,
    reason: ok ? "ok" : "ip",
    clientIp: ip,
    preview,
    allowedIps: settings.allowed_ips,
    isAdmin: false,
  };
}

export async function saveAllowedIps(input: {
  userId: string;
  allowedIps: string;
}): Promise<void> {
  if (!input.allowedIps.trim()) {
    throw new Error("Indique pelo menos um endereço IP.");
  }
  const sql = await getSql();
  await ensureSettings();
  await sql`
    update site_settings
    set access_mode = 'ip',
        allowed_ips = ${input.allowedIps},
        updated_by = ${input.userId},
        updated_at = now()
    where id = 'default'
  `;
  const { persistDb } = await import("@/lib/db");
  await persistDb();
}
