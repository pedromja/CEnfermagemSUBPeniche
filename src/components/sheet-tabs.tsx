import { LayoutGrid } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMonthDays, useReportStore } from "@/lib/report/store";
import {
  dayHasAlert,
  dayStatus,
  daysInMonth,
  isoDate,
  weekdayIndex,
} from "@/lib/report/model";
import { WEEKDAYS_SHORT } from "@/lib/report/types";
import { guestCanFill, guestCanView } from "@/lib/report/guest-window";

export function SheetTabs({ guest = false }: { guest?: boolean }) {
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const sheet = useReportStore((s) => s.sheet);
  const setSheet = useReportStore((s) => s.setSheet);
  const days = useMonthDays();
  const n = daysInMonth(year, month);
  const scroller = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [sheet, year, month]);

  return (
    <nav
      className="no-print border-t border-line bg-tabbar"
      aria-label="Separadores do mês"
    >
      <div
        ref={scroller}
        className="mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8"
      >
        <button
          type="button"
          ref={sheet === "resumo" ? activeRef : undefined}
          onClick={() => setSheet("resumo")}
          className={cn(
            "flex h-11 shrink-0 items-center gap-1.5 rounded-t-md border border-b-0 px-3 text-xs font-medium lg:h-12 lg:px-4 lg:text-sm",
            sheet === "resumo"
              ? "border-border bg-surface text-ink"
              : "border-transparent bg-sunken/70 text-muted hover:bg-sunken",
          )}
        >
          <LayoutGrid className="size-3.5" />
          Resumo
        </button>
        {Array.from({ length: n }, (_, i) => {
          const day = i + 1;
          const date = isoDate(year, month, day);
          const visible = !guest || guestCanView(date);
          const fillable = !guest || guestCanFill(date);
          const status = visible ? dayStatus(days[date]) : "empty";
          const alert = visible && dayHasAlert(days[date]);
          const active = sheet === day;
          const wd = WEEKDAYS_SHORT[weekdayIndex(year, month, day)];
          return (
            <button
              key={day}
              type="button"
              ref={active ? activeRef : undefined}
              disabled={!visible}
              onClick={() => {
                if (!visible) return;
                setSheet(day);
              }}
              className={cn(
                "flex h-11 min-w-11 shrink-0 flex-col items-center justify-center rounded-t-md border border-b-0 px-2 leading-none lg:h-12 lg:min-w-12 lg:px-2.5",
                !visible && "cursor-not-allowed opacity-30",
                visible && !fillable && "opacity-80",
                active
                  ? "border-border bg-surface text-ink"
                  : "border-transparent bg-sunken/70 text-muted hover:bg-sunken",
              )}
            >
              <span className="text-xs font-semibold tabular-nums">{day}</span>
              <span className="flex items-center gap-1 text-xs text-faint">
                {wd}
                <span
                  className={cn(
                    "size-1 rounded-full",
                    alert
                      ? "bg-danger"
                      : status === "complete"
                        ? "bg-ok"
                        : status === "partial"
                          ? "bg-warn"
                          : "bg-line",
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
