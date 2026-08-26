import { useMemo } from "react";
import { Moon, Sunrise, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { YesNo } from "@/components/yes-no";
import { FieldRow, MiniField, Pair } from "@/components/field-row";
import { cn } from "@/lib/utils";
import type { ShiftId, ShiftReport, StaffMember } from "@/lib/report/types";
import { SHIFT_LABEL_UPPER } from "@/lib/report/types";
import { shiftHasAlert, shiftIsFilled } from "@/lib/report/model";
import { SaveReportButton } from "@/components/save-report-button";

const SHIFT_META: Record<
  ShiftId,
  { icon: typeof Moon; stripe: string; hours: string }
> = {
  noite: { icon: Moon, stripe: "bg-noite", hours: "00h – 08h" },
  manha: { icon: Sunrise, stripe: "bg-manha", hours: "08h – 16h" },
  tarde: { icon: Sun, stripe: "bg-tarde", hours: "16h – 00h" },
};

export function ShiftForm({
  shift,
  value,
  staff,
  onChange,
  onBlurStaff,
}: {
  shift: ShiftId;
  value: ShiftReport;
  staff: StaffMember[];
  onChange: (patch: Partial<ShiftReport>) => void;
  onBlurStaff: () => void;
}) {
  const meta = SHIFT_META[shift];
  const Icon = meta.icon;
  const filled = shiftIsFilled(value);
  const alert = shiftHasAlert(value);
  const listId = `staff-${shift}`;

  const datalist = useMemo(
    () =>
      staff.map((s) => ({
        key: `${s.nMec}-${s.nome}`,
        label: s.nMec ? `${s.nome} (${s.nMec})` : s.nome,
        nome: s.nome,
        nMec: s.nMec,
      })),
    [staff],
  );

  const applyNome = (nome: string) => {
    const hit = staff.find(
      (s) => s.nome.toLowerCase() === nome.trim().toLowerCase(),
    );
    onChange(hit ? { coordenador: nome, nMec: hit.nMec || value.nMec } : { coordenador: nome });
  };

  const applyMec = (nMec: string) => {
    const hit = staff.find((s) => s.nMec === nMec.trim());
    onChange(hit ? { nMec, coordenador: hit.nome || value.coordenador } : { nMec });
  };

  return (
    <section className="print-break overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_0_rgba(28,36,40,0.04)]">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5 lg:px-6">
        <span className={cn("h-8 w-1.5 rounded-full", meta.stripe)} />
        <Icon className="size-4 text-muted" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold leading-tight tracking-tight">
            Turno {SHIFT_LABEL_UPPER[shift]}
          </h2>
          <p className="text-xs text-muted">{meta.hours}</p>
        </div>
        {alert ? (
          <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
            Alerta
          </span>
        ) : filled ? (
          <span className="rounded-full bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok">
            Preenchido
          </span>
        ) : (
          <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-muted">
            Por preencher
          </span>
        )}
      </header>

      <div className="px-4 py-1 sm:px-5 lg:px-6">
        <FieldRow label="Enfº coordenador">
          <Pair
            left={
              <MiniField label="Nome">
                <Input
                  list={listId}
                  value={value.coordenador}
                  placeholder="Nome do coordenador"
                  autoComplete="off"
                  onChange={(e) => applyNome(e.target.value)}
                  onBlur={onBlurStaff}
                />
                <datalist id={listId}>
                  {datalist.map((s) => (
                    <option key={s.key} value={s.nome}>
                      {s.label}
                    </option>
                  ))}
                </datalist>
              </MiniField>
            }
            right={
              <MiniField label="Nº Mec">
                <Input
                  value={value.nMec}
                  inputMode="numeric"
                  placeholder="00000"
                  onChange={(e) => applyMec(e.target.value)}
                  onBlur={onBlurStaff}
                />
              </MiniField>
            }
          />
        </FieldRow>

        <FieldRow label="Equipas">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Enfermagem completa</span>
              <YesNo
                tone="good"
                value={value.equipaEnfermagemCompleta}
                onChange={(v) => onChange({ equipaEnfermagemCompleta: v })}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">AOs completa</span>
              <YesNo
                tone="good"
                value={value.equipaAOsCompleta}
                onChange={(v) => onChange({ equipaAOsCompleta: v })}
              />
            </div>
            {(value.equipaEnfermagemCompleta === "nao" ||
              value.equipaAOsCompleta === "nao") && (
              <MiniField label="Se não, justifique">
                <Input
                  value={value.justificacaoEquipa}
                  onChange={(e) => onChange({ justificacaoEquipa: e.target.value })}
                  placeholder="Motivo da incompletude"
                />
              </MiniField>
            )}
          </div>
        </FieldRow>

        <FieldRow label="Sala de reanimação">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Utilizada</span>
              <YesNo
                tone="info"
                value={value.salaReanimacaoUtilizada}
                onChange={(v) => onChange({ salaReanimacaoUtilizada: v })}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Reposta</span>
              <YesNo
                tone="good"
                value={value.salaReanimacaoReposta}
                onChange={(v) => onChange({ salaReanimacaoReposta: v })}
              />
            </div>
            <MiniField label="Observações">
              <Input
                value={value.obsSalaReanimacao}
                onChange={(e) => onChange({ obsSalaReanimacao: e.target.value })}
              />
            </MiniField>
          </div>
        </FieldRow>

        <FieldRow label="Equipamentos e materiais">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Avarias</span>
              <YesNo
                tone="alert"
                value={value.equipamentosAvarias}
                onChange={(v) => onChange({ equipamentosAvarias: v })}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Faltas de material</span>
              <YesNo
                tone="alert"
                value={value.materiaisFaltas}
                onChange={(v) => onChange({ materiaisFaltas: v })}
              />
            </div>
            {(value.equipamentosAvarias === "sim" ||
              value.materiaisFaltas === "sim") && (
              <MiniField label="Se sim, justifique">
                <Input
                  value={value.justificacaoEquipMat}
                  onChange={(e) => onChange({ justificacaoEquipMat: e.target.value })}
                  placeholder="O que avariou ou falta"
                />
              </MiniField>
            )}
          </div>
        </FieldRow>

        <FieldRow label="Empréstimos">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Houve empréstimos</span>
              <YesNo
                tone="info"
                value={value.emprestimos}
                onChange={(v) => onChange({ emprestimos: v })}
              />
            </div>
            {value.emprestimos === "sim" && (
              <MiniField label="Quais">
                <Input
                  value={value.emprestimosQuais}
                  onChange={(e) => onChange({ emprestimosQuais: e.target.value })}
                />
              </MiniField>
            )}
          </div>
        </FieldRow>

        <FieldRow label="Estupefacientes / psicotrópicos">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Utilizados</span>
              <YesNo
                tone="alert"
                value={value.estupefacientesUtilizados}
                onChange={(v) => onChange({ estupefacientesUtilizados: v })}
              />
            </div>
            {value.estupefacientesUtilizados === "sim" && (
              <MiniField label="Observações">
                <Input
                  value={value.estupefacientesObs}
                  onChange={(e) => onChange({ estupefacientesObs: e.target.value })}
                />
              </MiniField>
            )}
          </div>
        </FieldRow>

        <FieldRow label="Morgue">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Corpos colocados</span>
              <YesNo
                tone="alert"
                value={value.corposMorgue}
                onChange={(v) => onChange({ corposMorgue: v })}
              />
            </div>
            {value.corposMorgue === "sim" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm">Processo burocrático concluído</span>
                  <YesNo
                    tone="good"
                    value={value.processoBurocraticoConcluido}
                    onChange={(v) => onChange({ processoBurocraticoConcluido: v })}
                  />
                </div>
                <MiniField label="Observações">
                  <Input
                    value={value.obsMorgue}
                    onChange={(e) => onChange({ obsMorgue: e.target.value })}
                    placeholder="Nº de episódio, etc."
                  />
                </MiniField>
              </>
            )}
          </div>
        </FieldRow>

        <FieldRow label="Transferências">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Com acompanhamento</span>
              <YesNo
                tone="info"
                value={value.transferenciasAcompanhamento}
                onChange={(v) => onChange({ transferenciasAcompanhamento: v })}
              />
            </div>
            {value.transferenciasAcompanhamento === "sim" && (
              <Pair
                left={
                  <MiniField label="Quantas">
                    <Input
                      value={value.transferenciasQuantas}
                      inputMode="numeric"
                      onChange={(e) =>
                        onChange({ transferenciasQuantas: e.target.value })
                      }
                    />
                  </MiniField>
                }
                right={
                  <MiniField label="Observações (episódio, destino)">
                    <Input
                      value={value.transferenciasObs}
                      onChange={(e) =>
                        onChange({ transferenciasObs: e.target.value })
                      }
                    />
                  </MiniField>
                }
              />
            )}
          </div>
        </FieldRow>

        <FieldRow label="Transporte de doentes">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Problemas</span>
              <YesNo
                tone="alert"
                value={value.problemasTransporte}
                onChange={(v) => onChange({ problemasTransporte: v })}
              />
            </div>
            {value.problemasTransporte === "sim" && (
              <MiniField label="Especifique">
                <Textarea
                  value={value.problemasTransporteEspecifique}
                  onChange={(e) =>
                    onChange({ problemasTransporteEspecifique: e.target.value })
                  }
                  rows={3}
                />
              </MiniField>
            )}
          </div>
        </FieldRow>
      </div>
      <div className="no-print flex justify-end border-t border-border px-4 py-4 sm:px-5 lg:px-6">
        <SaveReportButton />
      </div>
    </section>
  );
}
