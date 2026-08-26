import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Pill,
  Siren,
  UserX,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMonthDays, useReportStore } from "@/lib/report/store";
import {
  collectKpiHits,
  computeMonthStats,
  isKpiId,
  type KpiId,
} from "@/lib/report/stats";
import {
  dayHasAlert,
  dayStatus,
  daysInMonth,
  formatPtDate,
  isoDate,
  meaningfulText,
  shiftIsFilled,
  weekdayIndex,
} from "@/lib/report/model";
import {
  MONTH_NAMES,
  SHIFT_LABEL,
  SHIFT_ORDER,
  WEEKDAYS_SHORT,
  type MonthData,
  type ShiftId,
} from "@/lib/report/types";
import { ORG_SHORT, SITE_PHOTO, SITE_PHOTO_ALT, SITE_SHORT } from "@/lib/report/paper";
import { cn } from "@/lib/utils";
import { guestCanFill, guestCanView } from "@/lib/report/guest-window";

const KPI_CARDS: {
  id: KpiId;
  label: string;
  icon: LucideIcon;
  value: (s: ReturnType<typeof computeMonthStats>) => string | number;
  alert?: (s: ReturnType<typeof computeMonthStats>) => boolean;
}[] = [
  {
    id: "turnos-preenchidos",
    label: "Turnos preenchidos",
    icon: CheckCircle2,
    value: (s) => `${s.shiftsFilled}/${s.shiftsTotal}`,
  },
  {
    id: "sala-reanimacao",
    label: "Sala de reanimação",
    icon: Siren,
    value: (s) => s.salaReanimacao,
  },
  {
    id: "equipas-incompletas",
    label: "Equipas incompletas",
    icon: UserX,
    value: (s) => s.equipeIncompleta,
    alert: (s) => s.equipeIncompleta > 0,
  },
  {
    id: "avarias-faltas",
    label: "Avarias / faltas",
    icon: Wrench,
    value: (s) => s.avarias + s.faltas,
    alert: (s) => s.avarias + s.faltas > 0,
  },
  {
    id: "transferencias",
    label: "Transferências",
    icon: Ambulance,
    value: (s) => s.transferencias,
  },
  {
    id: "problemas-transporte",
    label: "Problemas de transporte",
    icon: AlertTriangle,
    value: (s) => s.problemasTransporte,
    alert: (s) => s.problemasTransporte > 0,
  },
  {
    id: "morgue",
    label: "Morgue",
    icon: Building2,
    value: (s) => s.morgue,
  },
  {
    id: "estupefacientes",
    label: "Estupefacientes",
    icon: Pill,
    value: (s) => s.estupefacientes,
  },
];

function hashKpi(): KpiId | null {
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace(/^#/, "");
  return isKpiId(id) ? id : null;
}

export function MonthOverview({ guest = false }: { guest?: boolean }) {
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const days = useMonthDays();
  const setSheet = useReportStore((s) => s.setSheet);
  const [filter, setFilter] = useState<KpiId | null>(hashKpi);

  const data: MonthData = { year, month, days };
  const stats = computeMonthStats(data);
  const n = daysInMonth(year, month);

  useEffect(() => {
    const sync = () => setFilter(hashKpi());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const hits = useMemo(
    () => (filter ? collectKpiHits(data, filter) : []),
    [filter, year, month, days],
  );
  const hitDays = useMemo(() => new Set(hits.map((h) => h.day)), [hits]);
  const activeCard = KPI_CARDS.find((k) => k.id === filter);

  useEffect(() => {
    if (!filter) return;
    document
      .getElementById(filter)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [filter]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <header
        id="resumo"
        className="scroll-mt-4 overflow-hidden rounded-xl bg-ink"
      >
        <div className="relative min-h-44 sm:min-h-52 lg:min-h-64">
          <img
            src={SITE_PHOTO}
            alt={SITE_PHOTO_ALT}
            className="absolute inset-0 size-full object-cover object-[42%_58%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />
          <div className="relative flex min-h-44 flex-col justify-end p-4 sm:min-h-52 sm:p-6 lg:min-h-64 lg:p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-accent-fg/80">
              {ORG_SHORT} · {SITE_SHORT}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-accent-fg lg:text-4xl">
              {MONTH_NAMES[month - 1]} {year}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-accent-fg/85">
              {guest
                ? "Conta da equipa: preencha o dia de hoje ou o de amanhã. Os 3 dias anteriores estão só para consulta."
                : "Relatório do coordenador de enfermagem. Cada indicador liga aos turnos correspondentes; cada dia é um separador, como no Excel."}
            </p>
          </div>
        </div>
      </header>

      {!guest && (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
        {KPI_CARDS.map((k) => {
          const alert = k.alert?.(stats) ?? false;
          const active = filter === k.id;
          return (
            <a
              key={k.id}
              href={`#${k.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-20 flex-col rounded-lg border bg-surface px-3 py-3 transition-colors lg:min-h-24 lg:px-4 lg:py-4",
                "hover:bg-accent-soft/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active ? "border-accent bg-accent-soft" : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <k.icon
                  className={cn(
                    "size-4",
                    alert ? "text-danger" : active ? "text-accent" : "text-muted",
                  )}
                />
                <span
                  className={cn(
                    "font-display text-2xl font-semibold tabular-nums leading-none",
                    alert && "text-danger",
                  )}
                >
                  {k.value(stats)}
                </span>
              </div>
              <p className="mt-2 flex items-center justify-between gap-1 text-xs text-muted">
                <span>{k.label}</span>
                <ChevronRight className="size-3.5 shrink-0 text-faint" />
              </p>
            </a>
          );
        })}
      </div>
      )}

      {!guest && filter && activeCard && (
        <section
          id={filter}
          className="scroll-mt-4 overflow-hidden rounded-xl border border-border bg-surface"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <activeCard.icon className="size-4 text-accent" />
              <h2 className="font-display text-lg font-semibold">
                {activeCard.label}
              </h2>
              <Badge tone={hits.length ? "accent" : "neutral"}>
                {hits.length} {hits.length === 1 ? "turno" : "turnos"}
              </Badge>
            </div>
            <a
              href="#resumo"
              className="text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
              onClick={(e) => {
                e.preventDefault();
                const url = `${window.location.pathname}${window.location.search}`;
                history.replaceState(null, "", url);
                setFilter(null);
              }}
            >
              Limpar filtro
            </a>
          </header>
          {hits.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">
              Nenhum turno neste indicador para {MONTH_NAMES[month - 1]}.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {hits.map((hit, i) => (
                <li key={`${hit.date}-${hit.shift}-${hit.kind}-${i}`}>
                  <a
                    href={`#dia-${hit.day}`}
                    className="flex w-full flex-col gap-1 px-4 py-3 hover:bg-accent-soft/50 sm:flex-row sm:items-center sm:gap-4"
                    onClick={(e) => {
                      e.preventDefault();
                      setSheet(hit.day);
                    }}
                  >
                    <div className="flex shrink-0 items-center gap-2 sm:w-44">
                      <span className="text-sm font-medium tabular-nums">
                        {formatPtDate(hit.date)}
                      </span>
                      <Badge tone="neutral">{SHIFT_LABEL[hit.shift]}</Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">
                        {hit.kind}
                      </p>
                      <p className="text-sm leading-snug">{hit.detail || "—"}</p>
                    </div>
                    <ChevronRight className="hidden size-4 shrink-0 text-faint sm:block" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section id="calendario" className="overflow-hidden rounded-xl border border-border bg-surface">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-semibold">Calendário do mês</h2>
          <div className="hidden items-center gap-3 text-xs text-muted sm:flex">
            <LegendDot className="bg-ok" label="Completo" />
            <LegendDot className="bg-warn" label="Parcial" />
            <LegendDot className="bg-line" label="Vazio" />
          </div>
        </header>
        <div className="grid grid-cols-7 gap-px bg-border p-px">
          {WEEKDAYS_SHORT.map((d) => (
            <div
              key={d}
              className="bg-sunken px-0.5 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 1)}</span>
            </div>
          ))}
          {Array.from({ length: weekdayIndex(year, month, 1) }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-surface" />
          ))}
          {Array.from({ length: n }, (_, i) => {
            const day = i + 1;
            const date = isoDate(year, month, day);
            const visible = !guest || guestCanView(date);
            const fillable = !guest || guestCanFill(date);
            const report = visible ? days[date] : undefined;
            const status = dayStatus(report);
            const alert = dayHasAlert(report);
            const marked = visible && hitDays.has(day);
            return (
              <a
                key={date}
                href={visible ? `#dia-${day}` : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  if (!visible) return;
                  setSheet(day);
                }}
                className={cn(
                  "flex min-h-16 flex-col items-start gap-1 overflow-hidden bg-surface px-1.5 py-2 text-left sm:px-2",
                  visible ? "hover:bg-accent-soft" : "cursor-not-allowed opacity-25",
                  marked && "bg-accent-soft",
                  visible && !fillable && guest && "bg-sunken/60",
                )}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium tabular-nums">{day}</span>
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status === "complete" && "bg-ok",
                      status === "partial" && "bg-warn",
                      status === "empty" && "bg-line",
                    )}
                  />
                </span>
                {alert && (
                  <span className="rounded-sm bg-danger-soft px-1 text-xs text-danger">
                    alerta
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </section>

      <section id="turnos" className="overflow-hidden rounded-xl border border-border bg-surface">
        <header className="border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-semibold">Turnos do mês</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-left text-sm">
            <thead className="bg-sunken text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Dia</th>
                <th className="px-3 py-2 font-medium">Noite</th>
                <th className="px-3 py-2 font-medium">Manhã</th>
                <th className="px-3 py-2 font-medium">Tarde</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: n }, (_, i) => {
                const day = i + 1;
                const date = isoDate(year, month, day);
                const report = days[date];
                const wd = WEEKDAYS_SHORT[weekdayIndex(year, month, day)];
                return (
                  <tr
                    key={date}
                    className={cn(
                      "border-t border-border hover:bg-accent-soft/60",
                      hitDays.has(day) && "bg-accent-soft/40",
                    )}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <a
                        href={`#dia-${day}`}
                        className="font-medium tabular-nums hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setSheet(day);
                        }}
                      >
                        {String(day).padStart(2, "0")}
                      </a>
                      <span className="ml-2 text-xs text-muted">{wd}</span>
                    </td>
                    {SHIFT_ORDER.map((shift) => (
                      <td key={shift} className="px-3 py-2.5">
                        <ShiftCell
                          name={report?.[shift].coordenador}
                          filled={report ? shiftIsFilled(report[shift]) : false}
                        />
                      </td>
                    ))}
                    <td className="max-w-64 truncate px-3 py-2.5 text-xs text-muted">
                      {previewNotes(report)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="alertas" className="overflow-hidden rounded-xl border border-border bg-surface">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <FileSpreadsheet className="size-4 text-muted" />
          <h2 className="font-display text-lg font-semibold">
            Alertas e ocorrências
          </h2>
          <Badge tone={stats.alerts.length ? "warn" : "ok"}>
            {stats.alerts.length} registos
          </Badge>
        </header>
        {stats.alerts.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">
            Sem alertas neste mês. Os turnos sem intercorrências não aparecem
            aqui.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.alerts.map((a, i) => (
              <li key={`${a.date}-${a.shift}-${a.kind}-${i}`}>
                <a
                  href={`#dia-${a.day}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSheet(a.day);
                  }}
                  className="flex w-full flex-col gap-1 px-4 py-3 hover:bg-accent-soft/50 sm:flex-row sm:gap-4"
                >
                  <div className="flex shrink-0 items-center gap-2 sm:w-40">
                    <span className="text-sm font-medium tabular-nums">
                      {formatPtDate(a.date)}
                    </span>
                    <Badge tone={kindTone(a.kind)}>
                      {a.shift === "dia" ? a.kind : SHIFT_LABEL[a.shift as ShiftId]}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {a.kind}
                    </p>
                    <p className="text-sm leading-snug">{a.detail}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted">
        Os dados ficam neste aparelho. Use o botão «Excel do mês» para gerar um
        ficheiro com um separador por dia.
      </p>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", className)} />
      {label}
    </span>
  );
}

function ShiftCell({ name, filled }: { name?: string; filled: boolean }) {
  if (!filled) {
    return <span className="text-xs text-faint">—</span>;
  }
  return <span className="text-sm">{name || "Preenchido"}</span>;
}

function previewNotes(
  report:
    | {
        ocorrenciasNoite: string;
        ocorrenciasManha: string;
        ocorrenciasTarde: string;
      }
    | undefined,
): string {
  if (!report) return "";
  const parts = [
    report.ocorrenciasNoite,
    report.ocorrenciasManha,
    report.ocorrenciasTarde,
  ].filter(meaningfulText);
  return parts[0] ?? "";
}

function kindTone(kind: string): "ok" | "warn" | "danger" | "accent" | "neutral" {
  if (kind === "Ocorrência") return "accent";
  if (
    kind === "Transporte" ||
    kind === "Equipa incompleta" ||
    kind === "Equipamentos / materiais"
  ) {
    return "danger";
  }
  if (kind === "Morgue" || kind === "Estupefacientes") return "warn";
  return "neutral";
}
