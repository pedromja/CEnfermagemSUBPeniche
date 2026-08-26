import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { DaySheet } from "@/components/day-sheet";
import { MonthOverview } from "@/components/month-overview";
import { PrintMonth } from "@/components/print-month";
import { SheetTabs } from "@/components/sheet-tabs";
import { useReportStore } from "@/lib/report/store";
import { useReportBackup } from "@/lib/report/use-report-backup";
import { getAccessState } from "@/lib/access/functions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const access = await getAccessState();
    if (access.setupNeeded) throw redirect({ to: "/login" });
    if (!access.granted) {
      throw redirect({
        to: access.reason === "setup" ? "/login" : "/acesso-negado",
      });
    }
    return { access };
  },
  component: Home,
});

function Home() {
  const sheet = useReportStore((s) => s.sheet);
  useReportBackup();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg print:h-auto print:overflow-visible">
      <AppHeader />
      <main className="no-print min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {sheet === "resumo" ? <MonthOverview /> : <DaySheet day={sheet} />}
      </main>
      <SheetTabs />
      <PrintMonth />
    </div>
  );
}
