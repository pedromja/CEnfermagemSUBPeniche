import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayReport, SheetId, ShiftId, ShiftReport, StaffMember } from "./types";
import { SHIFT_LABEL, STAFF_SEED } from "./types";
import { emptyDay, isoDate, mergeStaff, dayStatus, upsertStaffDirectory } from "./model";
import { logDayDeleted, logFilledDayEdit } from "@/lib/audit/client";
import { AGOSTO_2026 } from "./seed-agosto";

const STORAGE_KEY = "relatorio-ce-v1";

interface ReportState {
  year: number;
  month: number;
  sheet: SheetId;
  staff: StaffMember[];
  months: Record<string, Record<string, DayReport>>;
  setMonth: (year: number, month: number) => void;
  setSheet: (sheet: SheetId) => void;
  getDay: (date?: string) => DayReport;
  patchShift: (date: string, shift: ShiftId, patch: Partial<ShiftReport>) => void;
  patchOcorrencia: (
    date: string,
    shift: ShiftId,
    text: string,
  ) => void;
  resetDay: (date: string) => void;
  restoreAgosto: () => void;
  rememberStaff: (nome: string, nMec: string) => void;
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function ensureDay(
  months: Record<string, Record<string, DayReport>>,
  date: string,
): DayReport {
  const [y, m] = date.split("-");
  const key = `${y}-${m}`;
  const bucket = months[key] ?? {};
  return bucket[date] ?? emptyDay(date);
}

function writeDay(
  months: Record<string, Record<string, DayReport>>,
  date: string,
  day: DayReport,
): Record<string, Record<string, DayReport>> {
  const [y, m] = date.split("-");
  const key = `${y}-${m}`;
  return {
    ...months,
    [key]: {
      ...(months[key] ?? {}),
      [date]: { ...day, updatedAt: new Date().toISOString() },
    },
  };
}

function seedMonths(): Record<string, Record<string, DayReport>> {
  return { "2026-08": { ...AGOSTO_2026 } };
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      year: 2026,
      month: 8,
      sheet: "resumo",
      staff: STAFF_SEED,
      months: seedMonths(),
      setMonth: (year, month) =>
        set({
          year,
          month,
          sheet: "resumo",
        }),
      setSheet: (sheet) => set({ sheet }),
      getDay: (date) => {
        const { year, month, sheet, months } = get();
        const d =
          date ??
          (typeof sheet === "number" ? isoDate(year, month, sheet) : isoDate(year, month, 1));
        return ensureDay(months, d);
      },
      patchShift: (date, shift, patch) => {
        const current = ensureDay(get().months, date);
        const wasFilled = dayStatus(current) !== "empty";
        set((state) => {
          const day = ensureDay(state.months, date);
          return {
            months: writeDay(state.months, date, {
              ...day,
              [shift]: { ...day[shift], ...patch },
            }),
          };
        });
        if (wasFilled) {
          logFilledDayEdit(date, `Edição do turno da ${SHIFT_LABEL[shift].toLowerCase()}`);
        }
      },
      patchOcorrencia: (date, shift, text) => {
        const field =
          shift === "noite"
            ? "ocorrenciasNoite"
            : shift === "manha"
              ? "ocorrenciasManha"
              : "ocorrenciasTarde";
        const current = ensureDay(get().months, date);
        const wasFilled = dayStatus(current) !== "empty";
        set((state) => {
          const day = ensureDay(state.months, date);
          return {
            months: writeDay(state.months, date, {
              ...day,
              [field]: text,
            }),
          };
        });
        if (wasFilled) {
          logFilledDayEdit(
            date,
            `Edição das ocorrências (${SHIFT_LABEL[shift].toLowerCase()})`,
          );
        }
      },
      resetDay: (date) => {
        const current = ensureDay(get().months, date);
        const wasFilled = dayStatus(current) !== "empty";
        set((state) => {
          const [y, m] = date.split("-");
          const key = `${y}-${m}`;
          const bucket = { ...(state.months[key] ?? {}) };
          delete bucket[date];
          return { months: { ...state.months, [key]: bucket } };
        });
        if (wasFilled) {
          logDayDeleted(date, "Registo diário apagado");
        }
      },
      restoreAgosto: () => {
        logDayDeleted("2026-08", "Mês de Agosto 2026 substituído (repor documento)");
        set((state) => ({
          year: 2026,
          month: 8,
          sheet: "resumo",
          months: {
            ...state.months,
            "2026-08": { ...AGOSTO_2026 },
          },
        }));
      },
      rememberStaff: (nome, nMec) => {
        set((state) => ({ staff: mergeStaff(state.staff, nome, nMec) }));
      },
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ReportState>;
        return {
          ...current,
          ...p,
          staff: upsertStaffDirectory(STAFF_SEED, p.staff ?? current.staff),
        };
      },
      partialize: (s) => ({
        year: s.year,
        month: s.month,
        sheet: s.sheet,
        staff: s.staff,
        months: s.months,
      }),
    },
  ),
);

export function useMonthDays(): Record<string, DayReport> {
  const year = useReportStore((s) => s.year);
  const month = useReportStore((s) => s.month);
  const months = useReportStore((s) => s.months);
  return months[monthKey(year, month)] ?? {};
}
