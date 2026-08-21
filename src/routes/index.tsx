import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/app-header";
import { DaySheet } from "@/components/day-sheet";
import { MonthOverview } from "@/components/month-overview";
import { PrintMonth } from "@/components/print-month";
import { SheetTabs } from "@/components/sheet-tabs";
import { useReportStore } from "@/lib/report/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const sheet = useReportStore((s) => s.sheet);

  useEffect(() => {
    void useReportStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg print:h-auto print:overflow-visible">
      <AppHeader />
      <main className="no-print min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {sheet === "resumo" ? <MonthOverview /> : <DaySheet day={sheet} />}
      </main>
      <SheetTabs />
      <PrintMonth />
      <Toaster
        position="top-right"
        offset={108}
        className="no-print"
        toastOptions={{
          classNames: {
            toast: "bg-surface text-ink border border-border font-sans",
          },
        }}
      />
    </div>
  );
}
