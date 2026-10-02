import { type ReactNode, useState } from "react";

import { formatVolatility, formatVolatilityPoints } from "@/features/risk-return/format";
import { periodReturnHint, volatilityHint } from "@/features/risk-return/hints";
import { RiskReturnChart } from "@/features/risk-return/risk-return-chart";
import { RiskReturnTable } from "@/features/risk-return/risk-return-table";
import { type RiskReturn, itemKey, useRiskReturn } from "@/features/risk-return/use-risk-return";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { PeriodSelect } from "@/shared/components/period-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";
import { signClass } from "@/shared/lib/sign";
import { formatSignedPercent } from "@/types/decimal";

interface RiskReturnPanelProps {
  category?: PortfolioCategory;
  subportfolioId?: number;
  /** Filtros da tela, antes do seletor de período */
  filters?: ReactNode;
}

function Summary({ riskReturn, hidden }: { riskReturn: RiskReturn; hidden: ReadonlySet<string> }) {
  const portfolio = riskReturn.portfolio;
  if (!portfolio) return null;
  const measured = riskReturn.items.filter((item) => item.risk.volatility !== null);
  const shown = measured.filter((item) => !hidden.has(itemKey(item)));

  return (
    <MetricStrip>
      <Metric
        label="Retorno da carteira"
        hint={periodReturnHint}
        size="lg"
        value={formatSignedPercent(portfolio.period_return)}
        tone={signClass(portfolio.period_return)}
        detail={
          riskReturn.end &&
          `${riskReturn.start ? `de ${formatDate(riskReturn.start)} ` : "desde o início "}a ${formatDate(riskReturn.end)}`
        }
      />
      <Metric
        label="Volatilidade da carteira"
        hint={volatilityHint}
        size="lg"
        value={formatVolatility(portfolio.volatility)}
        detail={
          portfolio.volatility !== null &&
          `ao ano: num ano típico, o retorno varia uns ${formatVolatilityPoints(portfolio.volatility)} para cima ou para baixo`
        }
      />
      <Metric
        label="No gráfico"
        size="lg"
        value={`${shown.length} de ${riskReturn.items.length}`}
        detail={`itens, com ${portfolio.returns} pregões na carteira`}
      />
    </MetricStrip>
  );
}

/** Risco × retorno: indicadores da carteira, o gráfico de dispersão e a tabela com
a escolha do que entra no gráfico. */
export function RiskReturnPanel({ category, subportfolioId, filters }: RiskReturnPanelProps) {
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
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : !data ? (
        <Skeleton className="h-96 w-full" />
      ) : !data.portfolio ? (
        <p className="text-muted-foreground">Nenhuma posição no período escolhido.</p>
      ) : (
        <>
          <Summary riskReturn={data} hidden={hidden} />
          <RiskReturnChart riskReturn={data} hidden={hidden} />
          <RiskReturnTable riskReturn={data} hidden={hidden} onToggle={toggle} />
        </>
      )}
    </>
  );
}
