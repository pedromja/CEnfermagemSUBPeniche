import { cn } from "@/lib/utils";
import type { YesNo } from "@/lib/report/types";

type Tone = "good" | "alert" | "info";

export function YesNo({
  value,
  onChange,
  tone = "info",
  disabled,
}: {
  value: YesNo;
  onChange: (v: YesNo) => void;
  tone?: Tone;
  disabled?: boolean;
}) {
  const toggle = (next: "sim" | "nao") => {
    onChange(value === next ? null : next);
  };

  return (
    <div className="inline-flex rounded-md border border-border bg-sunken p-0.5">
      <Choice
        label="Sim"
        active={value === "sim"}
        onClick={() => toggle("sim")}
        activeClass={
          tone === "alert"
            ? "bg-danger text-danger-fg"
            : tone === "good"
              ? "bg-ok text-accent-fg"
              : "bg-accent text-accent-fg"
        }
        disabled={disabled}
      />
      <Choice
        label="Não"
        active={value === "nao"}
        onClick={() => toggle("nao")}
        activeClass={
          tone === "good" ? "bg-danger text-danger-fg" : "bg-ink text-surface"
        }
        disabled={disabled}
      />
    </div>
  );
}

function Choice({
  label,
  active,
  onClick,
  activeClass,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeClass: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 min-w-14 rounded-sm px-3 text-xs font-medium text-muted transition-colors duration-150",
        active && activeClass,
        !active && "hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
