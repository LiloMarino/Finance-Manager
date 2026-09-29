import { useState } from "react";

import { formatVolatility } from "@/features/risk-return/format";
import { periodReturnHint, volatilityHint } from "@/features/risk-return/hints";
import { RiskReturnChart } from "@/features/risk-return/risk-return-chart";
import { RiskReturnTable } from "@/features/risk-return/risk-return-table";
import { useRiskReturn } from "@/features/risk-return/use-risk-return";
import { Metric } from "@/shared/components/metric";
import { PeriodSelect } from "@/shared/components/period-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";
import { formatSignedPercent } from "@/types/decimal";

interface RiskReturnPanelProps {
  category?: PortfolioCategory;
  subportfolioId?: number;
}

export function RiskReturnPanel({ category, subportfolioId }: RiskReturnPanelProps) {
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const { data, error } = useRiskReturn({
    category,
    subportfolio_id: subportfolioId,
    ...periodRange(period),
  });

  const toggle = (key: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="flex flex-col gap-6">
      <PeriodSelect value={period} onChange={setPeriod} />

      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : !data ? (
        <Skeleton className="h-80 w-full" />
      ) : !data.portfolio ? (
        <p className="text-muted-foreground">Nenhuma posição no período escolhido.</p>
      ) : (
        <>
          {/* Resumo da carteira */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Metric
              label="Volatilidade da carteira"
              hint={volatilityHint}
              value={formatVolatility(data.portfolio.volatility)}
            />
            <Metric
              label="Retorno da carteira"
              hint={periodReturnHint}
              value={formatSignedPercent(data.portfolio.period_return)}
            />
            <Metric
              label="Período"
              hint="Do fechamento que serve de base ao último dia com dado, dentro do período escolhido."
              value={
                data.end
                  ? `${data.start ? formatDate(data.start) : "Início"} a ${formatDate(data.end)}`
                  : null
              }
            />
          </div>

          <RiskReturnChart riskReturn={data} hidden={hidden} />

          <RiskReturnTable riskReturn={data} hidden={hidden} onToggle={toggle} />
        </>
      )}
    </div>
  );
}
