import type { DayReport, ShiftId, ShiftReport, YesNo } from "./types";

export function emptyShift(): ShiftReport {
  return {
    coordenador: "",
    nMec: "",
    equipaEnfermagemCompleta: null,
    equipaAOsCompleta: null,
    justificacaoEquipa: "",
    salaReanimacaoUtilizada: null,
    salaReanimacaoReposta: null,
    obsSalaReanimacao: "",
    equipamentosAvarias: null,
    materiaisFaltas: null,
    justificacaoEquipMat: "",
    emprestimos: null,
    emprestimosQuais: "",
    estupefacientesUtilizados: null,
    estupefacientesObs: "",
    corposMorgue: null,
    processoBurocraticoConcluido: null,
    obsMorgue: "",
    transferenciasAcompanhamento: null,
    transferenciasQuantas: "",
    transferenciasObs: "",
    problemasTransporte: null,
    problemasTransporteEspecifique: "",
  };
}

export function emptyDay(date: string): DayReport {
  return {
    date,
    noite: emptyShift(),
    manha: emptyShift(),
    tarde: emptyShift(),
    ocorrenciasNoite: "",
    ocorrenciasManha: "",
    ocorrenciasTarde: "",
    updatedAt: null,
  };
}

export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function weekdayIndex(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}

export function formatPtDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function parseIso(date: string): { year: number; month: number; day: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { year: y, month: m, day: d };
}

export function isYes(v: YesNo): boolean {
  return v === "sim";
}

export function isNo(v: YesNo): boolean {
  return v === "nao";
}

export function yesNoLabel(v: YesNo): string {
  if (v === "sim") return "Sim";
  if (v === "nao") return "Não";
  return "";
}

export function shiftIsFilled(s: ShiftReport): boolean {
  return s.coordenador.trim().length > 0 || s.nMec.trim().length > 0;
}

export function shiftHasAlert(s: ShiftReport): boolean {
  return (
    s.equipaEnfermagemCompleta === "nao" ||
    s.equipaAOsCompleta === "nao" ||
    s.equipamentosAvarias === "sim" ||
    s.materiaisFaltas === "sim" ||
    s.emprestimos === "sim" ||
    s.estupefacientesUtilizados === "sim" ||
    s.corposMorgue === "sim" ||
    s.problemasTransporte === "sim"
  );
}

const PLACEHOLDER_OCORRENCIA = /^(sem intercorr[eê]ncias?\.?|clique ou toque aqui para introduzir texto)?$/i;

export function meaningfulText(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return !PLACEHOLDER_OCORRENCIA.test(t);
}

export function dayHasOccurrence(d: DayReport): boolean {
  return (
    meaningfulText(d.ocorrenciasNoite) ||
    meaningfulText(d.ocorrenciasManha) ||
    meaningfulText(d.ocorrenciasTarde)
  );
}

export function dayFilledCount(d: DayReport): number {
  return (["noite", "manha", "tarde"] as ShiftId[]).filter((id) =>
    shiftIsFilled(d[id]),
  ).length;
}

export function dayStatus(d: DayReport | undefined): "empty" | "partial" | "complete" {
  if (!d) return "empty";
  const n = dayFilledCount(d);
  if (n === 0 && !dayHasOccurrence(d)) return "empty";
  if (n === 3) return "complete";
  return "partial";
}

export function dayHasAlert(d: DayReport | undefined): boolean {
  if (!d) return false;
  return shiftHasAlert(d.noite) || shiftHasAlert(d.manha) || shiftHasAlert(d.tarde);
}

export function mergeStaff(
  existing: { nome: string; nMec: string }[],
  nome: string,
  nMec: string,
): { nome: string; nMec: string }[] {
  const n = nome.trim();
  const m = nMec.trim();
  if (!n && !m) return existing;
  const idx = existing.findIndex(
    (s) =>
      (n && s.nome.toLowerCase() === n.toLowerCase()) || (m && s.nMec === m),
  );
  if (idx >= 0) {
    const next = [...existing];
    next[idx] = {
      nome: n || next[idx].nome,
      nMec: m || next[idx].nMec,
    };
    return next;
  }
  return [...existing, { nome: n, nMec: m }];
}

export function upsertStaffDirectory<T extends { nome: string; nMec: string }>(
  seed: T[],
  existing: T[],
): T[] {
  const used = new Set<string>();
  const out: T[] = seed.map((s) => {
    used.add(s.nMec);
    return { ...s };
  });
  for (const s of existing) {
    if (s.nMec && !used.has(s.nMec)) {
      used.add(s.nMec);
      out.push(s);
    }
  }
  return out;
}
