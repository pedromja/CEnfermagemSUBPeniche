export type AuditAction = "edit" | "delete";

export type AuditRow = {
  id: number;
  action: AuditAction;
  reportDate: string;
  detail: string;
  actorIp: string;
  occurredAt: string;
};
