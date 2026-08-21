import type { DayReport, ShiftId, ShiftReport, YesNo } from "./types";
import { SHIFT_LABEL_UPPER } from "./types";
import { formatPtDate } from "./model";

export type Run = { text: string; bold?: boolean };

export function box(v: YesNo, want: "sim" | "nao"): string {
  return v === want ? "☒" : "☐";
}

function fill(text: string): string {
  const t = text.trim();
  if (!t) return "";
  if (/^clique ou toque aqui/i.test(t)) return "";
  return t;
}

export function shiftLines(shift: ShiftId, s: ShiftReport): Run[][] {
  const label = SHIFT_LABEL_UPPER[shift];
  return [
    [
      { text: `Turno: ${label}`, bold: true },
      { text: "    Enfº Coordenador   " },
      { text: s.coordenador },
      { text: "  Nº Mec: " },
      { text: s.nMec },
    ],
    [
      { text: "Equipa de enfermagem", bold: true },
      { text: `    Completa: Sim ${box(s.equipaEnfermagemCompleta, "sim")}  Não   ${box(s.equipaEnfermagemCompleta, "nao")}   ` },
      { text: "Equipa de AOs", bold: true },
      { text: `   Completa: Sim ${box(s.equipaAOsCompleta, "sim")} Não ${box(s.equipaAOsCompleta, "nao")}` },
    ],
    [{ text: "Se não, justifique: " }, { text: fill(s.justificacaoEquipa) }],
    [
      { text: "Sala de reanimação", bold: true },
      {
        text: `:     Utilizada:  Sim ${box(s.salaReanimacaoUtilizada, "sim")}  Não ${box(s.salaReanimacaoUtilizada, "nao")}                               Reposta: Sim ${box(s.salaReanimacaoReposta, "sim")}  Não ${box(s.salaReanimacaoReposta, "nao")}`,
      },
    ],
    [{ text: "Observações: " }, { text: fill(s.obsSalaReanimacao) }],
    [
      { text: "Equipamentos", bold: true },
      { text: `:     Avarias:  Sim ${box(s.equipamentosAvarias, "sim")} Não ${box(s.equipamentosAvarias, "nao")}            ` },
      { text: "Materiais", bold: true },
      { text: `:         Faltas:  Sim ${box(s.materiaisFaltas, "sim")}  Não ${box(s.materiaisFaltas, "nao")}` },
    ],
    [{ text: "Se sim justifique: " }, { text: fill(s.justificacaoEquipMat) }],
    [
      { text: "Empréstimos", bold: true },
      { text: `: Sim ${box(s.emprestimos, "sim")} Não ${box(s.emprestimos, "nao")}   Se sim; quais: ` },
      { text: fill(s.emprestimosQuais) },
    ],
    [
      { text: "Estupefacientes/psicotrópicos:", bold: true },
      { text: `   Utilizados: Sim ${box(s.estupefacientesUtilizados, "sim")}  Não ${box(s.estupefacientesUtilizados, "nao")}  Obs: ` },
      { text: fill(s.estupefacientesObs) },
    ],
    [
      { text: "Colocados corpos na morgue", bold: true },
      { text: `: Sim ${box(s.corposMorgue, "sim")}  Não ${box(s.corposMorgue, "nao")}        Se sim, processo burocrático concluído: Sim ${box(s.processoBurocraticoConcluido, "sim")} Não ${box(s.processoBurocraticoConcluido, "nao")}` },
    ],
    [{ text: "Observações: " }, { text: fill(s.obsMorgue) }],
    [
      { text: "Transferências com acompanhamento", bold: true },
      { text: `: Sim: ${box(s.transferenciasAcompanhamento, "sim")} Não: ${box(s.transferenciasAcompanhamento, "nao")}  Se sim quantas ` },
      { text: fill(s.transferenciasQuantas) },
      { text: " Obs: " },
      { text: fill(s.transferenciasObs) },
    ],
    [
      { text: "Problemas com transporte de doentes: Sim: " },
      { text: `${box(s.problemasTransporte, "sim")} Não ${box(s.problemasTransporte, "nao")} Se sim especifique: ` },
      { text: fill(s.problemasTransporteEspecifique) },
    ],
  ];
}

export function ocorrenciaLines(d: DayReport): { shift: string; text: string }[] {
  return [
    { shift: "NOITE", text: fill(d.ocorrenciasNoite) },
    { shift: "MANHÃ", text: fill(d.ocorrenciasManha) },
    { shift: "TARDE", text: fill(d.ocorrenciasTarde) },
  ];
}

export function dataLine(date: string): string {
  const [d, m, y] = formatPtDate(date).split("/");
  return `DATA:${Number(d)}/${m}/${y}`;
}

export const ORG_SHORT = "ULS Oeste";
export const SITE_SHORT = "SUB Peniche";
export const SITE_FULL = "Serviço de Urgência Básica de Peniche";
export const FORM_TITLE = "RELATÓRIO COORDENAÇÃO DE ENFERMAGEM";
export const FORM_SUBTITLE = SITE_FULL;
export const FORM_CODE = "Mod.URGPE.03_01";
export const APP_NAME = "Relatório CE";
export const APP_HEADLINE = "Coordenação de Enfermagem";
export const ORG_LOGO = "/uls-oeste-logo.png";
export const ORG_LOGO_ALT = "Unidade Local de Saúde Oeste";
export const SITE_PHOTO = "/sub-peniche.jpg";
export const SITE_PHOTO_CARD = "/sub-peniche-card.jpg";
export const SITE_PHOTO_ALT = "Edifício do Serviço de Urgência Básica de Peniche, ULS Oeste";
