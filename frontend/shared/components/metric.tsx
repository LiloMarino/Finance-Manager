import { Children, type ReactNode } from "react";

import { MetricHint } from "@/shared/components/metric-hint";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface MetricProps {
  label: string;
  hint?: string;
  value?: ReactNode;
  /** Classe de cor do valor, para resultado com sinal. */
  tone?: string;
  /** `lg` é o número principal da tela, no máximo três por tela; `sm` é o de fileira. */
  size?: "lg" | "sm";
  /** A linha embaixo do valor: a variação, a contagem, a data de referência. */
  detail?: ReactNode;
  /** Substitui o valor quando ele é mais que um número. */
  children?: ReactNode;
}

/** Um indicador: rótulo com a definição no tooltip, o valor e uma linha de apoio. */
export function Metric({
  label,
  hint,
  value,
  tone = "",
  size = "sm",
  detail,
  children,
}: MetricProps) {
  const caption = <span className="text-caption text-muted-foreground">{label}</span>;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {hint ? <MetricHint hint={hint}>{caption}</MetricHint> : caption}
      {children ?? (
        <span className={cn("tabular-nums", size === "lg" ? "text-kpi" : "text-kpi-sm", tone)}>
          {value ?? "—"}
        </span>
      )}
      {detail && (
        <span className="text-caption text-muted-foreground flex flex-wrap items-baseline gap-1.5 tabular-nums">
          {detail}
        </span>
      )}
    </div>
  );
}

/** Os indicadores de uma tela numa faixa só, separados por uma divisória. */
export function MetricStrip({ children }: { children: ReactNode }) {
  return (
    <Card className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-0 py-0">
      {Children.map(children, (child) => (
        <div className="border-border border-l px-5 py-4 first:border-l-0">{child}</div>
      ))}
    </Card>
  );
}
