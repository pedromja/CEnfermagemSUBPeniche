import { useEffect } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { DaySheet } from "@/components/day-sheet";
import { MonthOverview } from "@/components/month-overview";
import { PrintMonth } from "@/components/print-month";
import { SheetTabs } from "@/components/sheet-tabs";
import { IpLockOverlay } from "@/components/ip-lock-overlay";
import { useReportStore } from "@/lib/report/store";
import { useReportBackup } from "@/lib/report/use-report-backup";
import { getAccessState } from "@/lib/access/functions";
import { guestCanFill, guestCanView, lisbonIsoToday } from "@/lib/report/guest-window";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const access = await getAccessState();
    if (access.setupNeeded) throw redirect({ to: "/login" });
    return { access };
  },
  component: Home,
});

function Home() {
  const { access } = Route.useRouteContext();
  const sheet = useReportStore((s) => s.sheet);
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const locked = !access.granted;
  const guest = access.isGuest;
  useReportBackup(!locked);

  useEffect(() => {
    if (!guest) return;
    const today = lisbonIsoToday();
    const [y, m, d] = today.split("-").map(Number);
    useReportStore.getState().setMonth(y, m);
    useReportStore.getState().setSheet(d);
  }, [guest]);

  const dayIso =
    typeof sheet === "number"
      ? `${year}-${String(month).padStart(2, "0")}-${String(sheet).padStart(2, "0")}`
      : null;
  const guestBlockedDay = Boolean(
    guest && typeof sheet === "number" && dayIso && !guestCanView(dayIso),
  );

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-bg print:h-auto print:overflow-visible">
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          locked && "pointer-events-none select-none blur-2xl saturate-50",
        )}
        aria-hidden={locked}
      >
        <AppHeader access={access} />
        <main className="no-print min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {sheet === "resumo" ? (
            <MonthOverview guest={guest} />
          ) : guestBlockedDay ? (
            <MonthOverview guest={guest} />
          ) : (
            <DaySheet
              day={sheet}
              guest={guest}
              readOnly={Boolean(guest && dayIso && !guestCanFill(dayIso))}
            />
          )}
        </main>
        <SheetTabs guest={guest} />
        {locked || guest ? null : <PrintMonth />}
      </div>
      {locked ? (
        <IpLockOverlay
          ips={access.clientIps?.length ? access.clientIps : [access.clientIp]}
          hasList={Boolean(access.allowedIps?.trim())}
        />
      ) : null}
    </div>
  );
}