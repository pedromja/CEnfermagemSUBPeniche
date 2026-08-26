import { Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SITE_SHORT } from "@/lib/report/paper";

export function IpLockOverlay({
  ips,
  hasList,
}: {
  ips: string[];
  hasList: boolean;
}) {
  const shown = ips.filter(Boolean);
  return (
    <div className="no-print fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[0_20px_60px_rgba(28,36,40,0.28)]">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted">
          <Shield className="size-3.5" />
          {SITE_SHORT}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Acesso recusado
        </h1>
        <p className="mt-3 text-sm text-muted">
          Este relatório só abre a partir dos computadores da rede autorizada.
          A equipa não precisa de palavra-passe.
        </p>
        {shown.length > 0 ? (
          <p className="mt-4 rounded-md bg-sunken px-3 py-2 text-sm">
            O seu endereço:{" "}
            <span className="font-medium tabular-nums">{shown.join(" · ")}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Não foi possível determinar o IP.
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          {hasList
            ? "Se este for o posto do serviço, o administrador deve adicionar este IP à lista."
            : "Ainda não há IP autorizados. O administrador deve guardar a lista em Administração."}
        </p>
        <Button asChild className="mt-5 w-full">
          <Link to="/login">Entrar como administrador</Link>
        </Button>
      </div>
    </div>
  );
}
