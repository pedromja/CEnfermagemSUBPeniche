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
  { nMec: "10094", nome: "Anabela Vala" },
  { nMec: "10044", nome: "Ana Isabel Rocha Santos" },
  { nMec: "10085", nome: "Maria Lúcia D. Neves" },
  { nMec: "10186", nome: "José Manuel Leitão" },
  { nMec: "10397", nome: "Miguel Ângelo Sousa" },
  { nMec: "10471", nome: "Sofia Pinheiro" },
  { nMec: "10398", nome: "Alexandre Dinis" },
  { nMec: "10485", nome: "Pedro Miguel Andrade" },
  { nMec: "10389", nome: "Daniel Russo" },
  { nMec: "10482", nome: "Miguela Oliveira" },
  { nMec: "10467", nome: "Michelle Silva" },
  { nMec: "92152", nome: "Vanessa Silva" },
  { nMec: "70673", nome: "Pedro Alexandre M. Oliveira" },
  { nMec: "10497", nome: "Gonçalo Carvalho" },
  { nMec: "10501", nome: "Liliana Miranda" },
  { nMec: "91423", nome: "Cristiana Sofia G. Casado" },
  { nMec: "92553", nome: "Isa Reis" },
  { nMec: "92720", nome: "Cátia Silva" },
];
