import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { flushReportBackup } from "@/lib/report/use-report-backup";

export function SaveReportButton() {
  const [saving, setSaving] = useState(false);
  return (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        try {
          await flushReportBackup();
        } catch (err) {
          console.error("[guardar]", err);
        } finally {
          setSaving(false);
        }
        window.alert("Relatório CE guardado");
      }}
    >
      <Save />
      {saving ? "A guardar…" : "Guardar"}
    </Button>
  );
}
