import { useState } from "react";
import { FileText, Pencil } from "lucide-react";
import { ShiftForm } from "@/components/shift-form";
import { PaperForm } from "@/components/paper-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MiniField } from "@/components/field-row";
import { monthKey, useReportStore } from "@/lib/report/store";
import {
  emptyDay,
  formatPtDate,
  isoDate,
  weekdayIndex,
} from "@/lib/report/model";
import { SHIFT_ORDER, WEEKDAYS_LONG, type ShiftId } from "@/lib/report/types";
import { ORG_SHORT, SITE_SHORT } from "@/lib/report/paper";
import { SaveReportButton } from "@/components/save-report-button";

export function DaySheet({
  day,
  guest = false,
  readOnly = false,
}: {
  day: number;
  guest?: boolean;
  readOnly?: boolean;
}) {
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const staff = useReportStore((s) => s.staff);
  const date = isoDate(year, month, day);
  const months = useReportStore((s) => s.months);
  const report = months[monthKey(year, month)]?.[date] ?? emptyDay(date);
  const patchShift = useReportStore((s) => s.patchShift);
  const patchOcorrencia = useReportStore((s) => s.patchOcorrencia);
  const rememberStaff = useReportStore((s) => s.rememberStaff);
  const [folha, setFolha] = useState(false);

  const weekday = WEEKDAYS_LONG[weekdayIndex(year, month, day)];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-8">
      <header className="no-print flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {ORG_SHORT} · {SITE_SHORT}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
            {formatPtDate(date)}
          </h1>
          <p className="text-sm text-muted">
            Folha diária · {weekday}
            {guest && readOnly
              ? " · só consulta (a equipa só preenche hoje ou amanhã)"
              : guest
                ? " · preenchimento da equipa"
                : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={folha || readOnly ? "default" : "secondary"}
            size="sm"
            onClick={() => setFolha((v) => !v)}
            disabled={readOnly}
          >
            {folha || readOnly ? <FileText /> : <Pencil />}
            {readOnly ? "Só consulta" : folha ? "Editar campos" : "Vista de folha"}
          </Button>
        </div>
      </header>

      {folha || readOnly ? (
        <div className="paper-preview-stage no-print sm:rounded-xl">
          <PaperForm report={report} />
        </div>
      ) : (
        <>
          {SHIFT_ORDER.map((shift) => (
            <ShiftForm
              key={shift}
              shift={shift}
              value={report[shift]}
              staff={staff}
              onChange={(patch) => {
                if (readOnly) return;
                patchShift(date, shift, patch);
              }}
              onBlurStaff={() => {
                if (readOnly) return;
                rememberStaff(report[shift].coordenador, report[shift].nMec);
              }}
            />
          ))}

          <section className="print-break overflow-hidden rounded-xl border border-border bg-surface">
            <header className="border-b border-border px-4 py-3 sm:px-5">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Outras ocorrências
              </h2>
              <p className="text-xs text-muted">
                Uma nota por turno, como na folha original.
              </p>
            </header>
            <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
              {SHIFT_ORDER.map((shift) => (
                <OccurrenceField
                  key={shift}
                  shift={shift}
                  value={
                    shift === "noite"
                      ? report.ocorrenciasNoite
                      : shift === "manha"
                        ? report.ocorrenciasManha
                        : report.ocorrenciasTarde
                  }
                  onChange={(text) => {
                    if (readOnly) return;
                    patchOcorrencia(date, shift, text);
                  }}
                />
              ))}
            </div>
          </section>

          <div className="no-print flex flex-col items-stretch gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-end sm:p-5">
            <SaveReportButton />
          </div>
        </>
      )}
    </div>
  );
}

function OccurrenceField({
  shift,
  value,
  onChange,
}: {
  shift: ShiftId;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = shift === "noite" ? "Noite" : shift === "manha" ? "Manhã" : "Tarde";
  return (
    <MiniField label={label}>
      <Textarea
        value={value}
        rows={5}
        placeholder="Sem intercorrências"
        onChange={(e) => onChange(e.target.value)}
      />
    </MiniField>
  );
}
