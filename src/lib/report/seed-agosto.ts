import type { DayReport, ShiftReport } from "./types";
import { emptyShift } from "./model";

const S = "sim" as const;
const N = "nao" as const;

function sh(
  coordenador: string,
  nMec: string,
  extra: Partial<ShiftReport> = {},
): ShiftReport {
  return {
    ...emptyShift(),
    coordenador,
    nMec,
    equipaEnfermagemCompleta: S,
    equipaAOsCompleta: S,
    salaReanimacaoUtilizada: N,
    equipamentosAvarias: N,
    materiaisFaltas: N,
    emprestimos: N,
    estupefacientesUtilizados: N,
    corposMorgue: N,
    transferenciasAcompanhamento: N,
    problemasTransporte: N,
    ...extra,
  };
}

function d(
  date: string,
  noite: ShiftReport,
  manha: ShiftReport,
  tarde: ShiftReport,
  o: [string, string, string],
): DayReport {
  return {
    date,
    noite,
    manha,
    tarde,
    ocorrenciasNoite: o[0],
    ocorrenciasManha: o[1],
    ocorrenciasTarde: o[2],
    updatedAt: "2026-08-16T20:00:00.000Z",
  };
}

const SEM = "Sem intercorrências";

/** Dados transcritos do documento «08- Agosto - Relatório CE (diário)». */
export const AGOSTO_2026: Record<string, DayReport> = {
  "2026-08-01": d(
    "2026-08-01",
    sh("Miguela", "10482", {
      salaReanimacaoUtilizada: S,
      salaReanimacaoReposta: S,
    }),
    sh("Sofia Pinheiro", "10471", {
      equipaEnfermagemCompleta: N,
      equipaAOsCompleta: N,
      salaReanimacaoReposta: N,
    }),
    sh("Liliana Miranda", "10501"),
    [SEM, SEM, SEM],
  ),
  "2026-08-02": d(
    "2026-08-02",
    sh("Cátia Silva", "92720"),
    sh("Miguela", "10482", { salaReanimacaoReposta: N }),
    sh("Sofia Pinheiro", "10471", {
      salaReanimacaoReposta: N,
      transferenciasAcompanhamento: S,
      transferenciasQuantas: "1",
      transferenciasObs: "Ep. Urg - 26085539",
    }),
    [
      "Durante o turno tivemos a fuga de um utente em surto psicótico, Episódio 26085321. Foi contactada a PSP, que foi apenas recolher dados à administrativa, não falou nem com a equipa médica, enfermagem ou de seguranças. Contactei a PSP novamente passado duas horas por não ter conhecimento que estes já se tinham dirigido ao SUB, e quando o carro patrulha chega perguntou-me «então o que é que a menina quer que eu faça?». Respondi que fiz a minha parte, que é reportar a situação; procurar o doente agora é a vossa função, visto ser um perigo para o mesmo e para terceiros.",
      SEM,
      SEM,
    ],
  ),
  "2026-08-03": d(
    "2026-08-03",
    sh("Pedro Oliveira", "70673"),
    sh("Daniel Russo", "10389", {
      salaReanimacaoUtilizada: null,
    }),
    sh("Liliana Miranda", "10501"),
    [SEM, SEM, SEM],
  ),
  "2026-08-04": d(
    "2026-08-04",
    sh("Pedro Oliveira", "70673"),
    sh("Alexandre", "10398"),
    sh("Liliana Miranda", "10501"),
    [SEM, SEM, SEM],
  ),
  "2026-08-05": d(
    "2026-08-05",
    sh("Miguela", "10482", {
      salaReanimacaoUtilizada: S,
      salaReanimacaoReposta: S,
      transferenciasAcompanhamento: S,
    }),
    sh("Alexandre", "10398"),
    sh("Pedro Oliveira", "70673"),
    [SEM, SEM, SEM],
  ),
  "2026-08-06": d(
    "2026-08-06",
    sh("Daniel Russo", "10389", {
      corposMorgue: null,
      processoBurocraticoConcluido: null,
    }),
    sh("Alexandre", "10398"),
    sh("Liliana Miranda", "10501", {
      materiaisFaltas: null,
    }),
    [SEM, SEM, SEM],
  ),
  "2026-08-07": d(
    "2026-08-07",
    sh("Pedro Oliveira", "70673", {
      transferenciasAcompanhamento: S,
      transferenciasQuantas: "1",
      transferenciasObs:
        "Maria Helena Correia Teixeira Ruivo, episódio 26087601, transportada para Hosp. Fernando da Fonseca com médico e com enfermeiro.",
    }),
    sh("Alexandre", "10398", {
      equipamentosAvarias: S,
      justificacaoEquipMat: "Carros de sujos, ECG",
      estupefacientesUtilizados: S,
      transferenciasAcompanhamento: S,
      transferenciasQuantas: "1",
      transferenciasObs: "ep: 26087782",
    }),
    sh("José Leitão", "10186", {
      salaReanimacaoReposta: N,
      processoBurocraticoConcluido: N,
    }),
    [
      SEM,
      "Doente do episódio citado foi com acompanhamento de enfermagem e sem médico, por indicação da Dr.ª Cristina Teotónio (segundo o Dr. Manuel Correia, que transmitiu o recado).",
      SEM,
    ],
  ),
  "2026-08-08": d(
    "2026-08-08",
    sh("José Leitão", "10186", {
      processoBurocraticoConcluido: N,
    }),
    sh("Alexandre", "10398", {
      salaReanimacaoUtilizada: S,
      salaReanimacaoReposta: S,
      corposMorgue: S,
      processoBurocraticoConcluido: S,
    }),
    sh("Pedro Oliveira", "70673", {
      emprestimos: S,
      emprestimosQuais:
        "Pedido desfibrilhador à Psiquiatria enquanto o do serviço se encontrasse a ser utilizado em transporte.",
      transferenciasAcompanhamento: S,
      transferenciasQuantas: "1",
      transferenciasObs:
        "Maria do Rosário Ferreira, episódio 26088329, transferida para H. Sta Maria com equipa de médico e enfermeiro.",
    }),
    [
      SEM,
      "Corpo na morgue urg 26088193",
      "Devido a grande afluência e a transporte inter-hospitalar, a Enf.ª Miguela veio mais cedo para efetuar o transporte e a Enf.ª Lúcia permaneceu no serviço de apoio até chegada da Enfermeira Miguela. Sem outras intercorrências.",
    ],
  ),
  "2026-08-09": d(
    "2026-08-09",
    sh("Miguela", "10482", {
      emprestimos: null,
    }),
    sh("Alexandre", "10398"),
    emptyShift(),
    [SEM, SEM, ""],
  ),
  "2026-08-10": d(
    "2026-08-10",
    emptyShift(),
    sh("Pedro Oliveira", "70673", {
      salaReanimacaoUtilizada: S,
      salaReanimacaoReposta: S,
    }),
    sh("Liliana Miranda", "10501"),
    [
      SEM,
      "Sem sistema informático a partir das 15h45m.",
      "Recebemos o turno sem sistema informático, que regressou cerca das 17:30.",
    ],
  ),
  "2026-08-11": d(
    "2026-08-11",
    sh("Michelle Silva", "10467", {
      salaReanimacaoReposta: N,
      processoBurocraticoConcluido: N,
    }),
    emptyShift(),
    sh("Liliana Miranda", "10501"),
    ["", "", SEM],
  ),
  "2026-08-12": d(
    "2026-08-12",
    sh("Pedro Oliveira", "70673"),
    sh("Miguela", "10482", {
      problemasTransporte: null,
    }),
    sh("Gonçalo", "10497", {
      salaReanimacaoReposta: N,
      materiaisFaltas: S,
      justificacaoEquipMat: "D-dímeros",
    }),
    [
      "PSP chamada 2 vezes para resolver situações de disrupção no serviço.",
      "Vacinas do tétano: 8 no frigorífico. Entregaram 6 caixas de Troponinas.",
      SEM,
    ],
  ),
  "2026-08-13": d(
    "2026-08-13",
    sh("José Leitão", "10186", {
      salaReanimacaoUtilizada: S,
      salaReanimacaoReposta: S,
      problemasTransporte: S,
      problemasTransporteEspecifique:
        "Aquando da chegada da equipa da ASFE para fazer o transporte associado ao número de episódio 26090425, a funcionária da ASFE começou a desatar os lençóis da nossa maca e a querer retirar o mesmo para forrar a maca deles. Disse que não fazia sentido, pois o utente era autónomo e que eles teriam de colocar os lençóis descartáveis deles e, se quisessem, depois levariam o nosso lençol a cobrir o utente por uma questão de conforto. A funcionária foi sempre desagradável, mal-educada, teve sempre a mandar bocas e, quando advertida para o seu comportamento, respondeu de forma agressiva que não estava a falar comigo. Isto tudo em frente a um utente consciente e orientado.",
    }),
    emptyShift(),
    sh("Cristiana Casado", "91423"),
    [SEM, "", ""],
  ),
  "2026-08-14": d(
    "2026-08-14",
    sh("Gonçalo", "10497", {
      salaReanimacaoReposta: N,
    }),
    emptyShift(),
    sh("Sofia Pinheiro", "10471", {
      salaReanimacaoReposta: N,
      problemasTransporte: S,
      problemasTransporteEspecifique:
        "Transportes com espera superior a 2 horas. Ep Urg – 26091170 e 26091198",
    }),
    [SEM, "", ""],
  ),
  "2026-08-15": d(
    "2026-08-15",
    sh("Daniel Russo", "10389", {
      transferenciasAcompanhamento: S,
      transferenciasQuantas: "1",
      transferenciasObs: "Médico e enfermeiro",
      problemasTransporte: S,
      problemasTransporteEspecifique:
        "Doente Ermelinda Alves Pires Martins, episódio 26091198, esteve 4h e 45 minutos à espera de transporte.",
    }),
    sh("Sofia Pinheiro", "10471", {
      salaReanimacaoReposta: N,
      transferenciasAcompanhamento: S,
      transferenciasObs:
        "Ep. Urg – 26091350 com SIV + acompanhamento médico para ULSO Caldas da Rainha",
    }),
    sh("José Leitão", "10186"),
    [
      "Sofia Pinheiro fica até à 1h por necessidade do serviço.",
      "",
      SEM,
    ],
  ),
  "2026-08-16": d(
    "2026-08-16",
    sh("José Leitão", "10186"),
    sh("Liliana Miranda", "10501"),
    sh("Sofia Pinheiro", "10471", {
      salaReanimacaoReposta: N,
      transferenciasAcompanhamento: S,
      transferenciasQuantas: "1",
      transferenciasObs: "Ep. Urg - 26091989",
    }),
    [
      SEM,
      SEM,
      "Ep. Urg – 26092074. Doente vítima de acidente de viação – condutor de veículo de 2 rodas, trazido para este SUB pelos BVPX, que referem ter passado dados ao CODU. Vítima de trauma, com ferida extensa e profunda na perna direita.",
    ],
  ),
};
