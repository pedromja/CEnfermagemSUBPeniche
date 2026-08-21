import type { DayReport } from "@/lib/report/types";
import { SHIFT_ORDER } from "@/lib/report/types";
import {
  FORM_CODE,
  ORG_SHORT,
  SITE_FULL,
  dataLine,
  ocorrenciaLines,
  shiftLines,
  type Run,
} from "@/lib/report/paper";
import { cn } from "@/lib/utils";

function Line({ runs }: { runs: Run[] }) {
  return (
    <p className="paper-line">
      {runs.map((r, i) =>
        r.bold ? <strong key={i}>{r.text}</strong> : <span key={i}>{r.text}</span>,
      )}
    </p>
  );
}

export function PaperForm({
  report,
  className,
}: {
  report: DayReport;
  className?: string;
}) {
  const ocorr = ocorrenciaLines(report);
  return (
    <article className={cn("paper-page", className)}>
      <header className="paper-head">
        <img
          src="/uls-oeste-header.png"
          alt={`${ORG_SHORT} — ${SITE_FULL}`}
          className="paper-logo"
          loading="lazy"
        />
      </header>

      <p className="paper-data">{dataLine(report.date)}</p>

      {SHIFT_ORDER.map((shift) => (
        <section key={shift} className="paper-shift">
          {shiftLines(shift, report[shift]).map((runs, i) => (
            <Line key={i} runs={runs} />
          ))}
          <hr className="paper-rule" />
        </section>
      ))}

      <section className="paper-ocorr">
        <p className="paper-ocorr-title">OUTRAS OCORRÊNCIAS</p>
        {ocorr.map((item) => (
          <p key={item.shift} className="paper-line">
            <strong>{item.shift}</strong>
            {item.text ? `  ${item.text}` : ""}
          </p>
        ))}
      </section>

      <footer className="paper-foot">
        <span>{FORM_CODE}</span>
      </footer>
    </article>
  );
}
