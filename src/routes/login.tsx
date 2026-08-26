import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GateShell } from "@/components/gate-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MiniField } from "@/components/field-row";
import { authClient, authEnabled } from "@/lib/auth/client";
import { getSetupNeeded, signInGuest } from "@/lib/access/functions";
import { ADMIN_EMAIL_HINT } from "@/lib/report/paper";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  loader: () => getSetupNeeded(),
  component: Login,
});

function Login() {
  const { setupNeeded } = Route.useLoaderData();
  const navigate = useNavigate();
  const [papel, setPapel] = useState<"admin" | "equipa">("admin");
  const [name, setName] = useState("Administrador");
  const [email, setEmail] = useState(ADMIN_EMAIL_HINT);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("papel") === "equipa") {
      setPapel("equipa");
    }
  }, []);

  const onAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!authEnabled) {
      setError("O início de sessão não está activo.");
      return;
    }
    if (setupNeeded && password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      if (setupNeeded) {
        const created = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || "Administrador",
        });
        if (created.error) throw new Error(created.error.message);
      }
      const signed = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (signed.error) throw new Error(signed.error.message);
      await navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  const onGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      await signInGuest({ data: { password } });
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GateShell
      title={
        setupNeeded
          ? "Criar conta de administrador"
          : papel === "equipa"
            ? "Entrada da equipa"
            : "Entrada do administrador"
      }
    >
      {!setupNeeded && (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-sunken p-1">
          <button
            type="button"
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              papel === "admin" ? "bg-surface text-ink shadow-sm" : "text-muted",
            )}
            onClick={() => {
              setPapel("admin");
              setError(null);
            }}
          >
            Administrador
          </button>
          <button
            type="button"
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              papel === "equipa" ? "bg-surface text-ink shadow-sm" : "text-muted",
            )}
            onClick={() => {
              setPapel("equipa");
              setError(null);
            }}
          >
            Equipa
          </button>
        </div>
      )}

      <p className="text-sm text-muted">
        {setupNeeded
          ? "Primeiro acesso: crie a conta de quem gere a lista de IP autorizados."
          : papel === "equipa"
            ? "Palavra-passe comum da equipa, para preencher o relatório no telemóvel fora da rede do serviço. Não dá acesso à Administração."
            : "A equipa entra automaticamente na rede do serviço. Este login é só para o administrador."}
      </p>

      {papel === "equipa" && !setupNeeded ? (
        <form className="space-y-3" onSubmit={onGuestSubmit}>
          <MiniField label="Palavra-passe da equipa">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={8}
            />
          </MiniField>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "A entrar…" : "Entrar para preencher"}
          </Button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={onAdminSubmit}>
          {setupNeeded && (
            <MiniField label="Nome">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </MiniField>
          )}
          <MiniField label="E-mail">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder={ADMIN_EMAIL_HINT}
              required
            />
          </MiniField>
          <MiniField label="Palavra-passe">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={setupNeeded ? "new-password" : "current-password"}
              required
              minLength={8}
            />
          </MiniField>
          {setupNeeded && (
            <MiniField label="Confirmar palavra-passe">
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </MiniField>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy
              ? "A guardar…"
              : setupNeeded
                ? "Criar administrador"
                : "Entrar"}
          </Button>
        </form>
      )}
    </GateShell>
  );
}
