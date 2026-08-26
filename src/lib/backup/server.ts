import {
  DUMP_KEY,
  getBlobStore,
  loadJsonBlob,
  saveJsonBlob,
} from "@/lib/pglite-persist";
import type { ReportBackup } from "@/lib/report/backup";

export const BACKUP_INTERVAL_MS = 48 * 60 * 60 * 1000;
export const BACKUP_KEEP_MS = 40 * 24 * 60 * 60 * 1000;
const INDEX_KEY = "backups-index";

import type { BackupMeta, BackupReason } from "./types";

export type { BackupMeta, BackupReason };

type BackupIndex = { items: BackupMeta[] };

type AccessSnapshot = { allowedIps: string; updatedAt: string };

type BackupPayload = {
  meta: BackupMeta;
  report: ReportBackup | null;
  access: AccessSnapshot | null;
};

function newBackupId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function readIndex(): Promise<BackupMeta[]> {
  const index = await loadJsonBlob<BackupIndex>(INDEX_KEY);
  return index?.items ?? [];
}

async function writeIndex(items: BackupMeta[]): Promise<void> {
  await saveJsonBlob(INDEX_KEY, { items });
}

async function deleteBackupBlobs(id: string): Promise<void> {
  const store = await getBlobStore();
  if (!store) return;
  await Promise.allSettled([
    store.delete(`backup/${id}/data`),
    store.delete(`backup/${id}/pglite-dump`),
  ]);
}

export async function pruneBackups(items = readIndex()): Promise<BackupMeta[]> {
  const list = await items;
  const cutoff = Date.now() - BACKUP_KEEP_MS;
  const kept: BackupMeta[] = [];
  for (const item of list) {
    const t = Date.parse(item.createdAt);
    if (!Number.isNaN(t) && t < cutoff) {
      await deleteBackupBlobs(item.id);
    } else {
      kept.push(item);
    }
  }
  if (kept.length !== list.length) await writeIndex(kept);
  return kept;
}

export async function listBackups(): Promise<BackupMeta[]> {
  return pruneBackups();
}

export async function createBackup(reason: BackupReason): Promise<BackupMeta> {
  const { persistDb } = await import("@/lib/db");
  await persistDb();

  const [report, access] = await Promise.all([
    loadJsonBlob<ReportBackup>("report-v1"),
    loadJsonBlob<AccessSnapshot>("access-v1"),
  ]);

  const store = await getBlobStore();
  const dump = store ? await store.get(DUMP_KEY, { type: "arrayBuffer" }) : null;

  const createdAt = new Date().toISOString();
  const meta: BackupMeta = {
    id: newBackupId(),
    createdAt,
    reason,
    hasReport: Boolean(report),
    hasAccess: Boolean(access?.allowedIps),
    hasDump: Boolean(dump),
  };

  if (!store) {
    throw new Error("O armazenamento de cópias não está disponível neste ambiente.");
  }

  const payload: BackupPayload = { meta, report, access };
  await store.setJSON(`backup/${meta.id}/data`, payload);
  if (dump) await store.set(`backup/${meta.id}/pglite-dump`, dump);

  const items = await pruneBackups();
  items.unshift(meta);
  await writeIndex(items);
  return meta;
}

let autoLock: Promise<void> | null = null;

export async function maybeAutoBackup(): Promise<void> {
  if (autoLock) return autoLock;
  autoLock = (async () => {
    const store = await getBlobStore();
    if (!store) return;
    const items = await pruneBackups();
    const latest = items[0];
    if (latest && Date.now() - Date.parse(latest.createdAt) < BACKUP_INTERVAL_MS) {
      return;
    }
    await createBackup("auto");
  })().finally(() => {
    autoLock = null;
  });
  return autoLock;
}

export async function restoreBackup(id: string): Promise<BackupMeta> {
  const store = await getBlobStore();
  if (!store) throw new Error("O armazenamento de cópias não está disponível.");

  const payload = await store.get(`backup/${id}/data`, { type: "json" }) as BackupPayload | null;
  if (!payload?.meta) throw new Error("Cópia de segurança não encontrada.");

  if (payload.report) await saveJsonBlob("report-v1", payload.report);
  if (payload.access) await saveJsonBlob("access-v1", payload.access);

  const dump = await store.get(`backup/${id}/pglite-dump`, { type: "arrayBuffer" });
  if (dump) await store.set(DUMP_KEY, dump);

  const { resetPgliteCache } = await import("@/lib/db");
  resetPgliteCache();
  const { getSql } = await import("@/lib/db");
  await getSql();

  return payload.meta;
}

export async function readBackupPayload(id: string): Promise<BackupPayload> {
  const store = await getBlobStore();
  if (!store) throw new Error("O armazenamento de cópias não está disponível.");
  const payload = await store.get(`backup/${id}/data`, { type: "json" }) as BackupPayload | null;
  if (!payload?.meta) throw new Error("Cópia de segurança não encontrada.");
  return payload;
}
