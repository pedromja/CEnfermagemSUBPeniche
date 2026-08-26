import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const listSiteBackups = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { listBackups } = await import("./server");
    return listBackups();
  });

export const createSiteBackup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { createBackup } = await import("./server");
    return createBackup("manual");
  });

export const restoreSiteBackup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { restoreBackup } = await import("./server");
    return restoreBackup(data.id);
  });

export const downloadSiteBackup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { readBackupPayload } = await import("./server");
    return readBackupPayload(data.id);
  });
