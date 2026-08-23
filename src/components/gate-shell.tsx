import type { ReactNode } from "react";
import { OrgBanner } from "@/components/org-banner";

export function GateShell({
  title,
  children,
  wide,
}: {
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <OrgBanner />
      <main className="grid place-items-center px-4 py-8">
        <div
          className={
            wide
              ? "w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-[0_1px_0_rgba(28,36,40,0.04)]"
              : "w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[0_1px_0_rgba(28,36,40,0.04)]"
          }
        >
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <div className="mt-5 space-y-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
