import { PaperForm } from "@/components/paper-form";
import { useMonthDays, useReportStore } from "@/lib/report/store";
import { daysInMonth, emptyDay, isoDate } from "@/lib/report/model";

export function PrintMonth() {
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const days = useMonthDays();
  const n = daysInMonth(year, month);

  return (
    <div className="print-only">
      {Array.from({ length: n }, (_, i) => {
        const date = isoDate(year, month, i + 1);
        const report = days[date] ?? emptyDay(date);
        return <PaperForm key={date} report={report} />;
      })}
    </div>
  );
}
