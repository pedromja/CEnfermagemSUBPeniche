import { getSql } from "@/lib/db";
import { clientIp } from "@/lib/access/ip.server";
import type { AuditAction, AuditRow } from "./types";

export type { AuditAction, AuditRow };

export async function appendAudit(input: {
  action: AuditAction;
  reportDate: string;
  detail: string;
}): Promise<void> {
  const sql = await getSql();
  const ip = clientIp();
  await sql`
    insert into audit_log (action, report_date, detail, actor_ip)
    values (
      ${input.action},
      ${input.reportDate},
      ${input.detail.slice(0, 240)},
      ${ip}
    )
  `;
  const { persistDb } = await import("@/lib/db");
  await persistDb();
}

export async function listAudit(limit = 200): Promise<AuditRow[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    action: string;
    report_date: string;
    detail: string;
    actor_ip: string;
    occurred_at: string;
  }>`
    select id, action, report_date, detail, actor_ip, occurred_at
    from audit_log
    order by occurred_at desc, id desc
    limit ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    action: r.action === "delete" ? "delete" : "edit",
    reportDate: r.report_date,
    detail: r.detail,
    actorIp: r.actor_ip,
    occurredAt: r.occurred_at,
  }));
}
