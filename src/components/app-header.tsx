import { ChevronLeft, ChevronRight, Download, Printer, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMonthDays, useReportStore, monthKey } from "@/lib/report/store";
import { MONTH_NAMES } from "@/lib/report/types";
import { downloadMonthExcel, monthFileName } from "@/lib/report/excel";
import {
  APP_HEADLINE,
  APP_NAME,
  ORG_LOGO,
  ORG_LOGO_ALT,
  SITE_FULL,
  SITE_PHOTO_ALT,
  SITE_PHOTO_CARD,
  SITE_SHORT,
} from "@/lib/report/paper";

export function AppHeader() {
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const setMonth = useReportStore((s) => s.setMonth);
  const restoreAgosto = useReportStore((s) => s.restoreAgosto);
  const days = useMonthDays();

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
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:gap-5 lg:px-8 lg:py-2.5">
          <img
            src={ORG_LOGO}
            alt={ORG_LOGO_ALT}
            className="h-11 w-auto max-w-[11.5rem] shrink-0 object-contain object-left sm:h-14 sm:max-w-[16rem] lg:h-16 lg:max-w-[20rem]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight text-accent">
              {SITE_SHORT}
            </p>
            <p className="hidden truncate text-xs text-muted sm:block">
              {SITE_FULL}
            </p>
          </div>
          <img
            src={SITE_PHOTO_CARD}
            alt={SITE_PHOTO_ALT}
            className="site-photo hidden h-12 w-[4.75rem] shrink-0 rounded-md object-cover object-[42%_62%] sm:block lg:h-14 lg:w-24"
          />
        </div>
      </div>

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
        </div>
      </div>
    </header>
  );
}
