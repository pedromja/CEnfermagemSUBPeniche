import { useEffect } from "react";
import { useReportStore } from "./store";
import { loadReportBackup, saveReportBackup } from "./backup";

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let hydratedFromServer = false;

function pushBackup() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const { staff, months } = useReportStore.getState();
    void saveReportBackup({
      data: {
        savedAt: new Date().toISOString(),
        staff,
        months,
      },
    }).catch((err) => {
      console.error("[backup] falhou a gravar o relatório:", err);
    });
  }, 1200);
}

export function useReportBackup() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await useReportStore.persist.rehydrate();
      const remote = await loadReportBackup().catch(() => null);
      if (cancelled) return;
      if (remote?.months) {
        const local = useReportStore.getState();
        const localStamp = Object.values(local.months)
          .flatMap((days) => Object.values(days))
          .reduce(
            (acc, day) =>
              Math.max(acc, Date.parse(day.updatedAt ?? "") || 0),
            0,
          );
        const remoteStamp = Date.parse(remote.savedAt) || 0;
        if (remoteStamp >= localStamp) {
          useReportStore.setState({
            staff: remote.staff?.length ? remote.staff : local.staff,
            months: remote.months,
          });
        }
      }
      hydratedFromServer = true;
      if (!remote?.months) pushBackup();
    })();

    const unsub = useReportStore.subscribe((state, prev) => {
      if (!hydratedFromServer) return;
      if (state.months === prev.months && state.staff === prev.staff) return;
      pushBackup();
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);
}
