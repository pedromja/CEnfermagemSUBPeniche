export type YesNo = "sim" | "nao" | null;

export type ShiftId = "noite" | "manha" | "tarde";

export type SheetId = "resumo" | number;

export interface ShiftReport {
  coordenador: string;
  nMec: string;
  equipaEnfermagemCompleta: YesNo;
  equipaAOsCompleta: YesNo;
  justificacaoEquipa: string;
  salaReanimacaoUtilizada: YesNo;
  salaReanimacaoReposta: YesNo;
  obsSalaReanimacao: string;
  equipamentosAvarias: YesNo;
  materiaisFaltas: YesNo;
  justificacaoEquipMat: string;
  emprestimos: YesNo;
  emprestimosQuais: string;
  estupefacientesUtilizados: YesNo;
  estupefacientesObs: string;
  corposMorgue: YesNo;
  processoBurocraticoConcluido: YesNo;
  obsMorgue: string;
  transferenciasAcompanhamento: YesNo;
  transferenciasQuantas: string;
  transferenciasObs: string;
  problemasTransporte: YesNo;
  problemasTransporteEspecifique: string;
}

export interface DayReport {
  date: string;
  noite: ShiftReport;
  manha: ShiftReport;
  tarde: ShiftReport;
  ocorrenciasNoite: string;
  ocorrenciasManha: string;
  ocorrenciasTarde: string;
  updatedAt: string | null;
}

export interface StaffMember {
  nome: string;
  nMec: string;
}

export interface MonthData {
  year: number;
  month: number;
  days: Record<string, DayReport>;
}

export const SHIFT_ORDER: ShiftId[] = ["noite", "manha", "tarde"];

export const SHIFT_LABEL: Record<ShiftId, string> = {
  noite: "Noite",
  manha: "Manhã",
  tarde: "Tarde",
};

export const SHIFT_LABEL_UPPER: Record<ShiftId, string> = {
  noite: "NOITE",
  manha: "MANHÃ",
  tarde: "TARDE",
};

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
export const WEEKDAYS_LONG = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export const STAFF_SEED: StaffMember[] = [
  { nome: "Miguela", nMec: "10482" },
  { nome: "Sofia Pinheiro", nMec: "10471" },
  { nome: "Liliana Miranda", nMec: "10501" },
  { nome: "Cátia Silva", nMec: "92720" },
  { nome: "Pedro Oliveira", nMec: "70673" },
  { nome: "Daniel Russo", nMec: "10389" },
  { nome: "Alexandre", nMec: "10398" },
  { nome: "José Leitão", nMec: "10186" },
  { nome: "Michelle Silva", nMec: "10467" },
  { nome: "Gonçalo", nMec: "10497" },
  { nome: "Cristiana Casado", nMec: "91423" },
];
