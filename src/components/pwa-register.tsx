import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PwaRegister() {
  const [installable, setInstallable] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(display-mode: standalone)");
    setStandalone(media.matches || window.navigator.standalone === true);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallable(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || !installable) return null;

  return (
    <div className="no-print fixed right-3 bottom-[4.5rem] z-40 max-w-[16rem] rounded-lg border border-border bg-surface p-3 shadow-lg sm:bottom-4">
      <p className="text-xs text-muted">
        Instale o Relatório CE no telemóvel para preencher fora da rede do
        serviço.
      </p>
      <Button
        size="sm"
        className="mt-2 w-full"
        onClick={async () => {
          await installable.prompt();
          setInstallable(null);
        }}
      >
        Adicionar ao ecrã inicial
      </Button>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
