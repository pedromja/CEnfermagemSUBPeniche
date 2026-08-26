import { useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MiniField } from "@/components/field-row";
import { UserButton } from "@/lib/auth/gates";
import { getAccessState, saveAccessPolicy } from "@/lib/access/functions";
import { listAuditLog } from "@/lib/audit/functions";
import type { AuditRow } from "@/lib/audit/types";
import { ORG_SHORT, SITE_SHORT } from "@/lib/report/paper";
import { formatPtDate } from "@/lib/report/model";
import { MONTH_NAMES } from "@/lib/report/types";
import { OrgBanner } from "@/components/org-banner";

const requireAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  return user ? { id: user.id, email: user.email } : null;
});

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const user = await requireAdmin();
    if (!user) throw redirect({ to: "/login" });
    return { user };
  },
  loader: async () => {
    const [access, log] = await Promise.all([
      getAccessState(),
      listAuditLog().catch(() => [] as AuditRow[]),
    ]);
    return { access, log };
  },
  component: AdminPage,
});

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-PT", {
    timeZone: "Europe/Lisbon",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatReportDay(value: string): string {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [, m] = value.split("-");
    const month = Number(m);
    const year = value.slice(0, 4);
    return `${MONTH_NAMES[month - 1] ?? value} ${year}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatPtDate(value);
  return value;
}

function AdminPage() {
  const { access, log } = Route.useLoaderData();
  const router = useRouter();
  const [allowedIps, setAllowedIps] = useState(access.allowedIps);
  const [busy, setBusy] = useState(false);

  const addThisIp = () => {
    const detected = (access.clientIps?.length ? access.clientIps : [access.clientIp]).filter(Boolean);
    if (detected.length === 0) {
      toast.error("Não foi possível ler o IP deste acesso.");
      return;
    }
    const lines = allowedIps
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const extra = detected.filter((ip) => !lines.includes(ip));
    if (extra.length === 0) {
      toast.message("Este IP já está na lista.");
      return;
    }
    setAllowedIps(lines.concat(extra).join("\n"));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveAccessPolicy({ data: { allowedIps } });
      toast.success("Lista de IP guardada.");
      await router.invalidate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível guardar.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg">
      <OrgBanner />
      <main className="px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <header className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                {ORG_SHORT} · {SITE_SHORT}
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Administração
              </h1>
            </div>
            <UserButton />
          </div>
        </header>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Acesso por IP</h2>
          <p className="mt-1 text-sm text-muted">
            A equipa entra sem palavra-passe nos IP autorizados. Este login
            serve só para contornar a regra (por exemplo, avaria do posto
            habitual).
          </p>

          {access.preview && (
            <p className="mt-3 rounded-md bg-warn-soft px-3 py-2 text-xs text-warn">
              Pré-visualização: o bloqueio por IP não se aplica aqui. No site
              publicado a regra é efectiva.
            </p>
          )}

          <p className="mt-3 rounded-md bg-sunken px-3 py-2 text-sm">
            IP deste acesso:{" "}
            <span className="font-medium tabular-nums">
              {(access.clientIps?.length ? access.clientIps : [access.clientIp])
                .filter(Boolean)
                .join(" · ") || "desconhecido"}
            </span>
          </p>

          <form className="mt-4 space-y-4" onSubmit={onSave}>
            <MiniField label="Endereços IP autorizados (um por linha; aceita 192.168.1.0/24)">
              <Textarea
                rows={5}
                value={allowedIps}
                onChange={(e) => setAllowedIps(e.target.value)}
                placeholder={"193.136.0.1\n10.0.0.0/8"}
              />
            </MiniField>
            <Button type="button" variant="secondary" size="sm" onClick={addThisIp}>
              Adicionar o IP deste acesso
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? "A guardar…" : "Guardar lista"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.navigate({ to: "/" })}
              >
                Ir ao relatório
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">
            Registo de acções
          </h2>
          <p className="mt-1 text-sm text-muted">
            Só visível para o administrador. Ficam as edições de dias já
            preenchidos e os registos apagados, com data e hora.
          </p>

          {log.length === 0 ? (
            <p className="mt-4 rounded-md bg-sunken px-3 py-3 text-sm text-muted">
              Ainda não há acções registadas.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-medium">Quando</th>
                    <th className="py-2 pr-3 font-medium">Acção</th>
                    <th className="py-2 pr-3 font-medium">Dia</th>
                    <th className="py-2 font-medium">Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((row) => (
                    <tr key={row.id} className="border-b border-line/80">
                      <td className="py-2.5 pr-3 tabular-nums text-ink">
                        {formatWhen(row.occurredAt)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="font-medium">
                          {row.action === "delete" ? "Apagado" : "Edição"}
                        </span>
                        {row.detail ? (
                          <span className="mt-0.5 block text-xs text-muted">
                            {row.detail}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {formatReportDay(row.reportDate)}
                      </td>
                      <td className="py-2.5 tabular-nums text-muted">
                        {row.actorIp || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      </main>
    </div>
  );
}
