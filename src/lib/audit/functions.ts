import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const recordAuditEvent = createServerFn({ method: "POST" })
  .validator(
    (input: { action: "edit" | "delete"; reportDate: string; detail: string }) =>
      input,
  )
  .handler(async ({ data }) => {
    const { appendAudit } = await import("./server");
    await appendAudit(data);
    return { ok: true as const };
  });

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { listAudit } = await import("./server");
    return listAudit();
  });
