export type BackupReason = "auto" | "manual";

export type BackupMeta = {
  id: string;
  createdAt: string;
  reason: BackupReason;
  hasReport: boolean;
  hasAccess: boolean;
  hasDump: boolean;
};
