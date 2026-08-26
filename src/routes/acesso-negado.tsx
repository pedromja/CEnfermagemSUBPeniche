import { createFileRoute } from "@tanstack/react-router";
import { GateShell } from "@/components/gate-shell";
import { getAccessState } from "@/lib/access/functions";

export const Route = createFileRoute("/acesso-negado")({
  loader: () => getAccessState(),
  component: AcessoNegado,
});

function AcessoNegado() {
  const access = Route.useLoaderData();
  return (
    <GateShell title="Acesso recusado">
      <p className="text-sm text-muted">
        Este relatório só abre a partir dos computadores da rede autorizada
        (SUB Peniche). A equipa não precisa de palavra-passe.
      </p>
      {(access.clientIps?.length ? access.clientIps : [access.clientIp]).filter(Boolean)
        .length > 0 ? (
        <p className="rounded-md bg-sunken px-3 py-2 text-sm">
          O seu endereço:{" "}
          <span className="font-medium tabular-nums">
            {(access.clientIps?.length ? access.clientIps : [access.clientIp])
              .filter(Boolean)
              .join(" · ")}
          </span>
        </p>
      ) : (
        <p className="text-sm text-muted">Não foi possível determinar o IP.</p>
      )}
      {access.allowedIps?.trim() ? (
        <p className="text-xs text-muted">
          Se este endereço for o do posto do serviço, o administrador deve
          adicioná-lo à lista e voltar a guardar.
        </p>
      ) : (
        <p className="text-xs text-muted">
          Ainda não há IP autorizados. O administrador deve guardar a lista em
          Administração.
        </p>
      )}
      <p className="text-xs text-muted">
        Se o posto habitual estiver avariado, o administrador pode{" "}
        <a className="underline" href="/login">
          entrar aqui
        </a>{" "}
        e usar o site a partir de outro equipamento.
      </p>
    </GateShell>
  );
}
