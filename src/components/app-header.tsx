import { ChevronLeft, ChevronRight, Download, Printer, RotateCcw, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMonthDays, useReportStore, monthKey } from "@/lib/report/store";
import { MONTH_NAMES } from "@/lib/report/types";
import { downloadMonthExcel, monthFileName } from "@/lib/report/excel";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { OrgBanner } from "@/components/org-banner";
import {
  APP_HEADLINE,
  APP_NAME,
  SITE_SHORT,
} from "@/lib/report/paper";

export function AppHeader() {
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const setMonth = useReportStore((s) => s.setMonth);
  const restoreAgosto = useReportStore((s) => s.restoreAgosto);
  const days = useMonthDays();
  const { user, isPending } = useCurrentUserState();

  const prev = () => {
    if (month === 1) setMonth(year - 1, 12);
    else setMonth(year, month - 1);
  };
  const next = () => {
    if (month === 12) setMonth(year + 1, 1);
    else setMonth(year, month + 1);
  };

  const exportExcel = async () => {
    try {
      await downloadMonthExcel({ year, month, days });
      toast.success(`Ficheiro ${monthFileName(year, month)} descarregado`, {
        description: "Folhas A4 iguais ao modelo Word, um separador por dia",
      });
    } catch (err) {
      toast.error("Não foi possível gerar o Excel.");
      console.error(err);
    }
  };

  return (
    <header className="no-print shrink-0 border-b border-line bg-surface">
      <OrgBanner photo />

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:gap-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg">
            <span className="font-display text-lg font-semibold leading-none">
              CE
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-snug">
              {APP_NAME}
            </p>
            <p className="truncate text-xs text-muted">
              {APP_HEADLINE} · {SITE_SHORT}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-sunken p-0.5">
            <Button variant="ghost" size="icon" className="size-10" onClick={prev} aria-label="Mês anterior">
              <ChevronLeft />
            </Button>
            <div className="min-w-28 px-2 text-center sm:min-w-36">
              <p className="text-sm font-medium">{MONTH_NAMES[month - 1]}</p>
              <p className="text-xs tabular-nums text-muted">{year}</p>
            </div>
            <Button variant="ghost" size="icon" className="size-10" onClick={next} aria-label="Mês seguinte">
              <ChevronRight />
            </Button>
          </div>

          {monthKey(year, month) === "2026-08" && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={() => {
                if (
                  confirm(
                    "Repor os dados transcritos do documento de Agosto 2026? Alterações deste mês serão substituídas.",
                  )
                ) {
                  restoreAgosto();
                  toast.success("Agosto 2026 restaurado a partir do documento.");
                }
              }}
            >
              <RotateCcw />
              Repor Agosto
            </Button>
          )}
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
          <Button onClick={exportExcel}>
            <Download />
            <span className="hidden sm:inline">Excel do mês</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          {isPending ? (
            <span className="size-10 shrink-0 rounded-md bg-sunken" />
          ) : user ? (
            <UserButton />
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                <Shield />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
