import { cn } from "@/lib/utils";

export function FieldRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 border-b border-border/70 py-3 last:border-b-0 sm:grid-cols-[minmax(0,13.5rem)_1fr] sm:items-center lg:grid-cols-[minmax(0,16rem)_1fr] lg:py-3.5",
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Pair({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {left}
      {right}
    </div>
  );
}

export function MiniField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
