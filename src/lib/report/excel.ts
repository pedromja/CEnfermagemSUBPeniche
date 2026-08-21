import type { MonthData } from "./types";
import { SHIFT_LABEL_UPPER, SHIFT_ORDER, WEEKDAYS_SHORT } from "./types";
import {
  daysInMonth,
  emptyDay,
  formatPtDate,
  isoDate,
  weekdayIndex,
  yesNoLabel,
} from "./model";
import {
  FORM_CODE,
  FORM_SUBTITLE,
  FORM_TITLE,
  dataLine,
  ocorrenciaLines,
  shiftLines,
  type Run,
} from "./paper";

const FONT = "Calibri";
const SIZE = 10;
const BLACK = "FF000000";
const RULE = "FF1F4E79";
const HEADER_NAVY = "FF1F4E79";

const LOGO_ROWS = 5;
const LOGO_ROW_PT = 18;
const LAST_COL = 8;
const COL_WIDTH = 12;
const CHARS_PER_LINE = 96;

export function monthFileName(year: number, month: number): string {
  return `Relatorio_CE_${year}-${String(month).padStart(2, "0")}.xlsx`;
}

function rich(runs: Run[]) {
  return {
    richText: runs
      .filter((r) => r.text)
      .map((r) => ({
        text: r.text,
        font: {
          name: FONT,
          size: SIZE,
          bold: Boolean(r.bold),
          color: { argb: BLACK },
        },
      })),
  };
}

function plain(text: string, bold = false) {
  return {
    richText: [
      {
        text,
        font: { name: FONT, size: SIZE, bold, color: { argb: BLACK } },
      },
    ],
  };
}

function runLength(runs: Run[]): number {
  return runs.reduce((n, r) => n + r.text.length, 0);
}

function wrappedHeight(chars: number, base = 14, linePt = 12): number {
  const lines = Math.max(1, Math.ceil(Math.max(chars, 1) / CHARS_PER_LINE));
  return Math.min(72, base + (lines - 1) * linePt);
}

function a4FormPageSetup() {
  return {
    paperSize: 9,
    orientation: "portrait" as const,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    horizontalDpi: 600,
    verticalDpi: 600,
    horizontalCentered: true,
    verticalCentered: false,
    printGridLines: false,
    printHeadings: false,
    blackAndWhite: false,
    draft: false,
    pageOrder: "downThenOver" as const,
    cellComments: "None" as const,
    errors: "displayed" as const,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.38,
      bottom: 0.52,
      header: 0.18,
      footer: 0.32,
    },
  };
}

function enableFitToPage(ws: import("exceljs").Worksheet) {
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 1;
  Reflect.deleteProperty(ws.pageSetup, "scale");
}

async function loadLogo(): Promise<ArrayBuffer | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch("/uls-oeste-header.png");
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function downloadMonthExcel(data: MonthData) {
  const mod = (await import("exceljs")) as unknown as {
    default?: { Workbook: new () => import("exceljs").Workbook };
    Workbook?: new () => import("exceljs").Workbook;
  };
  const Workbook = mod.default?.Workbook ?? mod.Workbook;
  if (!Workbook) throw new Error("ExcelJS indisponível");
  const wb = new Workbook();
  wb.creator = "Relatório CE";
  wb.created = new Date();
  wb.calcProperties.fullCalcOnLoad = true;
  wb.views = [
    {
      x: 0,
      y: 0,
      width: 20000,
      height: 20000,
      firstSheet: 0,
      activeTab: 0,
      visibility: "visible",
    },
  ];

  const logo = await loadLogo();
  let logoId: number | null = null;
  if (logo) {
    logoId = wb.addImage({
      buffer: logo as never,
      extension: "png",
    });
  }

  const n = daysInMonth(data.year, data.month);

  for (let day = 1; day <= n; day++) {
    const date = isoDate(data.year, data.month, day);
    const wd = WEEKDAYS_SHORT[weekdayIndex(data.year, data.month, day)];
    const report = data.days[date] ?? emptyDay(date);
    const ws = wb.addWorksheet(`${String(day).padStart(2, "0")} ${wd}`, {
      views: [{ showGridLines: false, state: "normal", zoomScale: 100 }],
      pageSetup: a4FormPageSetup(),
      headerFooter: {
        oddFooter: `&L${FORM_CODE}&RPág &P`,
        evenFooter: `&L${FORM_CODE}&RPág &P`,
        firstFooter: `&L${FORM_CODE}&RPág &P`,
      },
      properties: {
        defaultRowHeight: 13.5,
        dyDescent: 0.15,
      },
    });
    enableFitToPage(ws);

    ws.columns = Array.from({ length: LAST_COL }, () => ({ width: COL_WIDTH }));

    let row = 1;
    if (logoId !== null) {
      ws.mergeCells(1, 1, LOGO_ROWS, LAST_COL);
      for (let r = 1; r <= LOGO_ROWS; r++) {
        ws.getRow(r).height = LOGO_ROW_PT;
      }
      const banner = ws.getCell(1, 1);
      banner.alignment = { horizontal: "center", vertical: "middle" };
      banner.border = {
        bottom: { style: "thin", color: { argb: RULE } },
      };
      ws.addImage(
        logoId,
        {
          tl: { col: 0.05, row: 0.08 },
          br: { col: LAST_COL, row: LOGO_ROWS },
          editAs: "oneCell",
        } as never,
      );
      row = LOGO_ROWS + 1;
    } else {
      ws.mergeCells(1, 1, 1, LAST_COL);
      const t = ws.getCell(1, 1);
      t.value = FORM_TITLE;
      t.font = { name: FONT, size: 14, bold: true, color: { argb: HEADER_NAVY } };
      t.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(1).height = 22;
      ws.mergeCells(2, 1, 2, LAST_COL);
      const s = ws.getCell(2, 1);
      s.value = FORM_SUBTITLE;
      s.font = { name: FONT, size: 11, bold: true, color: { argb: HEADER_NAVY } };
      s.alignment = { horizontal: "center" };
      row = 3;
    }

    ws.mergeCells(row, 1, row, LAST_COL);
    const dataCell = ws.getCell(row, 1);
    dataCell.value = dataLine(date);
    dataCell.font = { name: FONT, size: 12, bold: true, color: { argb: BLACK } };
    dataCell.alignment = { vertical: "middle" };
    ws.getRow(row).height = 18;
    row += 1;

    const writeRuns = (runs: Run[], height?: number) => {
      ws.mergeCells(row, 1, row, LAST_COL);
      const cell = ws.getCell(row, 1);
      cell.value = rich(runs);
      cell.alignment = { wrapText: true, vertical: "top" };
      ws.getRow(row).height = height ?? wrappedHeight(runLength(runs));
      row += 1;
    };

    const writeRule = () => {
      ws.mergeCells(row, 1, row, LAST_COL);
      ws.getCell(row, 1).border = {
        bottom: { style: "thin", color: { argb: RULE } },
      };
      ws.getRow(row).height = 7;
      row += 1;
    };

    for (const shift of SHIFT_ORDER) {
      const lines = shiftLines(shift, report[shift]);
      lines.forEach((line, i) => {
        writeRuns(line, i === 0 ? 16 : wrappedHeight(runLength(line), 13.5, 11));
      });
      writeRule();
    }

    ws.mergeCells(row, 1, row, LAST_COL);
    const oc = ws.getCell(row, 1);
    oc.value = plain("OUTRAS OCORRÊNCIAS", true);
    oc.font = { name: FONT, size: 11, bold: true, color: { argb: HEADER_NAVY } };
    oc.alignment = { vertical: "middle" };
    ws.getRow(row).height = 16;
    row += 1;

    for (const item of ocorrenciaLines(report)) {
      const text = item.text || "";
      writeRuns(
        [{ text: item.shift, bold: true }, { text: text ? `  ${text}` : "" }],
        wrappedHeight((item.shift + text).length + 2, 16, 12),
      );
    }

    ws.pageSetup.printArea = `A1:${colLetter(LAST_COL)}${Math.max(row, LOGO_ROWS + 1)}`;
  }

  addDataSheet(wb, data, n);
  addAlertSheet(wb, data, n);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = monthFileName(data.year, data.month);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function colLetter(n: number): string {
  let s = "";
  let x = n;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

function addDataSheet(
  wb: import("exceljs").Workbook,
  data: MonthData,
  n: number,
) {
  const ws = wb.addWorksheet("Todos os turnos", {
    views: [{ state: "frozen", ySplit: 1 }],
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: "1:1",
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.3,
      },
    },
    headerFooter: {
      oddHeader: `&L${FORM_TITLE}&RTodos os turnos`,
      oddFooter: `&L${FORM_CODE}&RPág &P`,
    },
  });
  enableFitToPage(ws);
  ws.pageSetup.fitToHeight = 0;
  const headers = [
    "Data",
    "Semana",
    "Turno",
    "Enf. coordenador",
    "Nº Mec",
    "Eq. enfermagem completa",
    "Eq. AOs completa",
    "Justificação equipa",
    "Sala reanimação utilizada",
    "Sala reanimação reposta",
    "Obs. sala reanimação",
    "Equipamentos avarias",
    "Materiais faltas",
    "Justificação equip./mat.",
    "Empréstimos",
    "Empréstimos quais",
    "Estupefacientes/psicotrópicos",
    "Obs. estupefacientes",
    "Corpos na morgue",
    "Processo burocrático concluído",
    "Obs. morgue",
    "Transferências com acompanhamento",
    "Quantas",
    "Obs. transferências",
    "Problemas com transporte",
    "Especifique",
    "Outras ocorrências",
  ];
  ws.addRow(headers);
  ws.getRow(1).font = { name: FONT, size: 9, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_NAVY },
  };
  ws.getRow(1).alignment = { wrapText: true, vertical: "middle" };
  ws.getRow(1).height = 28;
  headers.forEach((_, i) => {
    ws.getColumn(i + 1).width = i === 26 || i === 7 || i === 13 ? 32 : 14;
  });

  for (let day = 1; day <= n; day++) {
    const date = isoDate(data.year, data.month, day);
    const wd = WEEKDAYS_SHORT[weekdayIndex(data.year, data.month, day)];
    const report = data.days[date] ?? emptyDay(date);
    for (const shift of SHIFT_ORDER) {
      const s = report[shift];
      const ocorr =
        shift === "noite"
          ? report.ocorrenciasNoite
          : shift === "manha"
            ? report.ocorrenciasManha
            : report.ocorrenciasTarde;
      const line = ws.addRow([
        formatPtDate(date),
        wd,
        SHIFT_LABEL_UPPER[shift],
        s.coordenador,
        s.nMec,
        yesNoLabel(s.equipaEnfermagemCompleta),
        yesNoLabel(s.equipaAOsCompleta),
        s.justificacaoEquipa,
        yesNoLabel(s.salaReanimacaoUtilizada),
        yesNoLabel(s.salaReanimacaoReposta),
        s.obsSalaReanimacao,
        yesNoLabel(s.equipamentosAvarias),
        yesNoLabel(s.materiaisFaltas),
        s.justificacaoEquipMat,
        yesNoLabel(s.emprestimos),
        s.emprestimosQuais,
        yesNoLabel(s.estupefacientesUtilizados),
        s.estupefacientesObs,
        yesNoLabel(s.corposMorgue),
        yesNoLabel(s.processoBurocraticoConcluido),
        s.obsMorgue,
        yesNoLabel(s.transferenciasAcompanhamento),
        s.transferenciasQuantas,
        s.transferenciasObs,
        yesNoLabel(s.problemasTransporte),
        s.problemasTransporteEspecifique,
        ocorr,
      ]);
      line.alignment = { wrapText: true, vertical: "top" };
      line.font = { name: FONT, size: 9 };
    }
  }
}

function addAlertSheet(
  wb: import("exceljs").Workbook,
  data: MonthData,
  n: number,
) {
  const ws = wb.addWorksheet("Alertas", {
    views: [{ state: "frozen", ySplit: 1 }],
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: "1:1",
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.3,
      },
    },
    headerFooter: {
      oddHeader: `&L${FORM_TITLE}&RAlertas`,
      oddFooter: `&L${FORM_CODE}&RPág &P`,
    },
  });
  enableFitToPage(ws);
  ws.pageSetup.fitToHeight = 0;
  ws.addRow(["Data", "Semana", "Turno", "Tipo", "Detalhe"]);
  ws.getRow(1).font = { name: FONT, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_NAVY },
  };
  ws.getColumn(1).width = 14;
  ws.getColumn(2).width = 10;
  ws.getColumn(3).width = 10;
  ws.getColumn(4).width = 22;
  ws.getColumn(5).width = 80;

  for (let day = 1; day <= n; day++) {
    const date = isoDate(data.year, data.month, day);
    const wd = WEEKDAYS_SHORT[weekdayIndex(data.year, data.month, day)];
    const report = data.days[date] ?? emptyDay(date);
    for (const shift of SHIFT_ORDER) {
      const s = report[shift];
      const flags: [string, string][] = [];
      if (s.equipaEnfermagemCompleta === "nao" || s.equipaAOsCompleta === "nao") {
        flags.push(["Equipa incompleta", s.justificacaoEquipa || "Não"]);
      }
      if (s.equipamentosAvarias === "sim" || s.materiaisFaltas === "sim") {
        flags.push(["Avarias / faltas", s.justificacaoEquipMat || "Sim"]);
      }
      if (s.emprestimos === "sim") flags.push(["Empréstimo", s.emprestimosQuais || "Sim"]);
      if (s.estupefacientesUtilizados === "sim") {
        flags.push(["Estupefacientes", s.estupefacientesObs || "Utilizados"]);
      }
      if (s.corposMorgue === "sim") flags.push(["Morgue", s.obsMorgue || "Sim"]);
      if (s.transferenciasAcompanhamento === "sim") {
        flags.push([
          "Transferência",
          [s.transferenciasQuantas, s.transferenciasObs].filter(Boolean).join(" — "),
        ]);
      }
      if (s.problemasTransporte === "sim") {
        flags.push(["Transporte", s.problemasTransporteEspecifique || "Sim"]);
      }
      const ocorr =
        shift === "noite"
          ? report.ocorrenciasNoite
          : shift === "manha"
            ? report.ocorrenciasManha
            : report.ocorrenciasTarde;
      if (ocorr.trim() && !/^sem intercorr/i.test(ocorr.trim())) {
        flags.push(["Ocorrência", ocorr.trim()]);
      }
      for (const [tipo, detalhe] of flags) {
        const line = ws.addRow([
          formatPtDate(date),
          wd,
          SHIFT_LABEL_UPPER[shift],
          tipo,
          detalhe,
        ]);
        line.alignment = { wrapText: true, vertical: "top" };
        line.font = { name: FONT, size: 9 };
      }
    }
  }
}
