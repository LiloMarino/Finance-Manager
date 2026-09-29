import type { ReactNode } from "react";

import { MetricHint } from "@/shared/components/metric-hint";

interface MetricProps {
  label: string;
  hint: string;
  value?: string | null;
  /** Classe de cor do valor, para resultado com sinal. */
  tone?: string;
  /** Substitui o valor quando ele é mais que um número. */
  children?: ReactNode;
}

export function Metric({ label, hint, value, tone = "", children }: MetricProps) {
  return (
    <div className="flex flex-col gap-1">
      <MetricHint hint={hint}>
        <span className="text-muted-foreground text-sm">{label}</span>
      </MetricHint>
      {children ?? (
        <span className={`text-xl font-semibold tabular-nums ${tone}`}>{value ?? "—"}</span>
      )}
    </div>
  );
}
