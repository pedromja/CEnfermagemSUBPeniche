import { createServerFn } from "@tanstack/react-start";
import type { DayReport, StaffMember } from "./types";

export type ReportBackup = {
  savedAt: string;
  staff: StaffMember[];
  months: Record<string, Record<string, DayReport>>;
};

const KEY = "report-v1";

export const loadReportBackup = createServerFn({ method: "GET" }).handler(
  async () => {
    const { loadJsonBlob } = await import("@/lib/pglite-persist");
    return loadJsonBlob<ReportBackup>(KEY);
  },
);

export const saveReportBackup = createServerFn({ method: "POST" })
  .validator((input: ReportBackup) => input)
  .handler(async ({ data }) => {
    const { saveJsonBlob } = await import("@/lib/pglite-persist");
    await saveJsonBlob(KEY, data);
    return { ok: true as const };
  });
