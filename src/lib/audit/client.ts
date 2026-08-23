import { recordAuditEvent } from "./functions";

const pending = new Map<string, ReturnType<typeof setTimeout>>();

export function logFilledDayEdit(reportDate: string, detail: string): void {
  const prev = pending.get(reportDate);
  if (prev) clearTimeout(prev);
  pending.set(
    reportDate,
    setTimeout(() => {
      pending.delete(reportDate);
      void recordAuditEvent({
        data: { action: "edit", reportDate, detail },
      }).catch((err) => {
        console.error("[audit] edit", err);
      });
    }, 2500),
  );
}

export function logDayDeleted(reportDate: string, detail: string): void {
  const prev = pending.get(reportDate);
  if (prev) clearTimeout(prev);
  pending.delete(reportDate);
  void recordAuditEvent({
    data: { action: "delete", reportDate, detail },
  }).catch((err) => {
    console.error("[audit] delete", err);
  });
}
