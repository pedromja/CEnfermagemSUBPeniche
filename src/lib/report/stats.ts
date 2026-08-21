import type { MonthData, ShiftId, ShiftReport } from "./types";
import { SHIFT_ORDER } from "./types";
import {
  dayHasOccurrence,
  daysInMonth,
  isoDate,
  meaningfulText,
  shiftIsFilled,
} from "./model";

export interface AlertItem {
  date: string;
  day: number;
  shift: ShiftId | "dia";
  kind: string;
  detail: string;
}

export interface MonthStats {
  daysInMonth: number;
  shiftsFilled: number;
  shiftsTotal: number;
  daysComplete: number;
  daysPartial: number;
  daysEmpty: number;
  equipeIncompleta: number;
  salaReanimacao: number;
  avarias: number;
  faltas: number;
  emprestimos: number;
  estupefacientes: number;
  morgue: number;
  transferencias: number;
  problemasTransporte: number;
  ocorrencias: number;
  alerts: AlertItem[];
}

export type KpiId =
  | "turnos-preenchidos"
  | "sala-reanimacao"
  | "equipas-incompletas"
  | "avarias-faltas"
  | "transferencias"
  | "problemas-transporte"
  | "morgue"
  | "estupefacientes";

export interface KpiHit {
  date: string;
  day: number;
  shift: ShiftId;
  kind: string;
  detail: string;
}

export const KPI_IDS: KpiId[] = [
  "turnos-preenchidos",
  "sala-reanimacao",
  "equipas-incompletas",
  "avarias-faltas",
  "transferencias",
  "problemas-transporte",
  "morgue",
  "estupefacientes",
];

export function isKpiId(value: string): value is KpiId {
  return (KPI_IDS as string[]).includes(value);
}

function pushAlert(
  list: AlertItem[],
  date: string,
  day: number,
  shift: ShiftId,
  kind: string,
  detail: string,
) {
  list.push({ date, day, shift, kind, detail });
}

function scanShift(
  list: AlertItem[],
  date: string,
  day: number,
  shift: ShiftId,
  s: ShiftReport,
) {
  if (s.equipaEnfermagemCompleta === "nao" || s.equipaAOsCompleta === "nao") {
    const parts: string[] = [];
    if (s.equipaEnfermagemCompleta === "nao") parts.push("enfermagem");
    if (s.equipaAOsCompleta === "nao") parts.push("AOs");
    pushAlert(
      list,
      date,
      day,
      shift,
      "Equipa incompleta",
      `${parts.join(" e ")}${s.justificacaoEquipa ? ` — ${s.justificacaoEquipa}` : ""}`,
    );
  }
  if (s.equipamentosAvarias === "sim" || s.materiaisFaltas === "sim") {
    const parts: string[] = [];
    if (s.equipamentosAvarias === "sim") parts.push("avarias");
    if (s.materiaisFaltas === "sim") parts.push("faltas");
    pushAlert(
      list,
      date,
      day,
      shift,
      "Equipamentos / materiais",
      `${parts.join(" e ")}${s.justificacaoEquipMat ? ` — ${s.justificacaoEquipMat}` : ""}`,
    );
  }
  if (s.emprestimos === "sim") {
    pushAlert(list, date, day, shift, "Empréstimo", s.emprestimosQuais || "Sim");
  }
  if (s.estupefacientesUtilizados === "sim") {
    pushAlert(
      list,
      date,
      day,
      shift,
      "Estupefacientes",
      s.estupefacientesObs || "Utilizados",
    );
  }
  if (s.corposMorgue === "sim") {
    pushAlert(
      list,
      date,
      day,
      shift,
      "Morgue",
      s.obsMorgue ||
        (s.processoBurocraticoConcluido === "sim"
          ? "Processo concluído"
          : s.processoBurocraticoConcluido === "nao"
            ? "Processo não concluído"
            : "Corpo colocado"),
    );
  }
  if (s.transferenciasAcompanhamento === "sim") {
    pushAlert(
      list,
      date,
      day,
      shift,
      "Transferência",
      [s.transferenciasQuantas && `${s.transferenciasQuantas}×`, s.transferenciasObs]
        .filter(Boolean)
        .join(" ") || "Com acompanhamento",
    );
  }
  if (s.problemasTransporte === "sim") {
    pushAlert(
      list,
      date,
      day,
      shift,
      "Transporte",
      s.problemasTransporteEspecifique || "Problemas reportados",
    );
  }
}

export function computeMonthStats(data: MonthData): MonthStats {
  const n = daysInMonth(data.year, data.month);
  const alerts: AlertItem[] = [];
  let shiftsFilled = 0;
  let daysComplete = 0;
  let daysPartial = 0;
  let daysEmpty = 0;
  let equipeIncompleta = 0;
  let salaReanimacao = 0;
  let avarias = 0;
  let faltas = 0;
  let emprestimos = 0;
  let estupefacientes = 0;
  let morgue = 0;
  let transferencias = 0;
  let problemasTransporte = 0;
  let ocorrencias = 0;

  for (let day = 1; day <= n; day++) {
    const date = isoDate(data.year, data.month, day);
    const report = data.days[date];
    if (!report) {
      daysEmpty += 1;
      continue;
    }
    let filled = 0;
    for (const shift of SHIFT_ORDER) {
      const s = report[shift];
      if (shiftIsFilled(s)) filled += 1;
      scanShift(alerts, date, day, shift, s);
      if (s.equipaEnfermagemCompleta === "nao" || s.equipaAOsCompleta === "nao") {
        equipeIncompleta += 1;
      }
      if (s.salaReanimacaoUtilizada === "sim") salaReanimacao += 1;
      if (s.equipamentosAvarias === "sim") avarias += 1;
      if (s.materiaisFaltas === "sim") faltas += 1;
      if (s.emprestimos === "sim") emprestimos += 1;
      if (s.estupefacientesUtilizados === "sim") estupefacientes += 1;
      if (s.corposMorgue === "sim") morgue += 1;
      if (s.transferenciasAcompanhamento === "sim") transferencias += 1;
      if (s.problemasTransporte === "sim") problemasTransporte += 1;
    }
    shiftsFilled += filled;
    if (dayHasOccurrence(report)) {
      ocorrencias += 1;
      const notes: { shift: ShiftId; text: string }[] = [
        { shift: "noite", text: report.ocorrenciasNoite },
        { shift: "manha", text: report.ocorrenciasManha },
        { shift: "tarde", text: report.ocorrenciasTarde },
      ];
      for (const note of notes) {
        if (meaningfulText(note.text)) {
          alerts.push({
            date,
            day,
            shift: note.shift,
            kind: "Ocorrência",
            detail: note.text.trim(),
          });
        }
      }
    }
    if (filled === 3) daysComplete += 1;
    else if (filled === 0 && !dayHasOccurrence(report)) daysEmpty += 1;
    else daysPartial += 1;
  }

  return {
    daysInMonth: n,
    shiftsFilled,
    shiftsTotal: n * 3,
    daysComplete,
    daysPartial,
    daysEmpty,
    equipeIncompleta,
    salaReanimacao,
    avarias,
    faltas,
    emprestimos,
    estupefacientes,
    morgue,
    transferencias,
    problemasTransporte,
    ocorrencias,
    alerts,
  };
}

export function collectKpiHits(data: MonthData, kpi: KpiId): KpiHit[] {
  const n = daysInMonth(data.year, data.month);
  const hits: KpiHit[] = [];

  for (let day = 1; day <= n; day++) {
    const date = isoDate(data.year, data.month, day);
    const report = data.days[date];
    if (!report) continue;
    for (const shift of SHIFT_ORDER) {
      const s = report[shift];
      const base = { date, day, shift };
      if (kpi === "turnos-preenchidos" && shiftIsFilled(s)) {
        hits.push({
          ...base,
          kind: "Preenchido",
          detail: [s.coordenador, s.nMec && `n.º ${s.nMec}`].filter(Boolean).join(" · "),
        });
      }
      if (kpi === "sala-reanimacao" && s.salaReanimacaoUtilizada === "sim") {
        const repo =
          s.salaReanimacaoReposta === "sim"
            ? "reposta"
            : s.salaReanimacaoReposta === "nao"
              ? "não reposta"
              : "reposição por indicar";
        hits.push({
          ...base,
          kind: "Sala de reanimação",
          detail: s.obsSalaReanimacao.trim() || `Utilizada · ${repo}`,
        });
      }
      if (
        kpi === "equipas-incompletas" &&
        (s.equipaEnfermagemCompleta === "nao" || s.equipaAOsCompleta === "nao")
      ) {
        const parts: string[] = [];
        if (s.equipaEnfermagemCompleta === "nao") parts.push("enfermagem");
        if (s.equipaAOsCompleta === "nao") parts.push("AOs");
        hits.push({
          ...base,
          kind: "Equipa incompleta",
          detail: `${parts.join(" e ")}${s.justificacaoEquipa ? ` — ${s.justificacaoEquipa}` : ""}`,
        });
      }
      if (kpi === "avarias-faltas") {
        if (s.equipamentosAvarias === "sim") {
          hits.push({
            ...base,
            kind: "Avarias",
            detail: s.justificacaoEquipMat.trim() || "Equipamentos avariados",
          });
        }
        if (s.materiaisFaltas === "sim") {
          hits.push({
            ...base,
            kind: "Faltas",
            detail: s.justificacaoEquipMat.trim() || "Materiais em falta",
          });
        }
      }
      if (kpi === "transferencias" && s.transferenciasAcompanhamento === "sim") {
        hits.push({
          ...base,
          kind: "Transferência",
          detail:
            [s.transferenciasQuantas && `${s.transferenciasQuantas}×`, s.transferenciasObs]
              .filter(Boolean)
              .join(" ") || "Com acompanhamento",
        });
      }
      if (kpi === "problemas-transporte" && s.problemasTransporte === "sim") {
        hits.push({
          ...base,
          kind: "Transporte",
          detail: s.problemasTransporteEspecifique.trim() || "Problemas reportados",
        });
      }
      if (kpi === "morgue" && s.corposMorgue === "sim") {
        hits.push({
          ...base,
          kind: "Morgue",
          detail:
            s.obsMorgue.trim() ||
            (s.processoBurocraticoConcluido === "sim"
              ? "Processo concluído"
              : s.processoBurocraticoConcluido === "nao"
                ? "Processo não concluído"
                : "Corpo colocado"),
        });
      }
      if (kpi === "estupefacientes" && s.estupefacientesUtilizados === "sim") {
        hits.push({
          ...base,
          kind: "Estupefacientes",
          detail: s.estupefacientesObs.trim() || "Utilizados",
        });
      }
    }
  }
  return hits;
}
