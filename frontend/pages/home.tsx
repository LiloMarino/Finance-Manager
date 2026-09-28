import { Link } from "react-router-dom";

import { cashHint } from "@/features/cash/labels";
import { AllocationChart } from "@/features/portfolio/allocation-chart";
import { CategorySections } from "@/features/portfolio/category-sections";
import { dayChangeHint } from "@/features/portfolio/hints";
import { LiquidityCard } from "@/features/portfolio/liquidity-card";
import { SectorDistribution } from "@/features/portfolio/sector-distribution";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSubportfolioParam } from "@/shared/hooks/use-subportfolio-param";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { formatBRL, formatSignedBRL, formatSignedPercent } from "@/types/decimal";

export function HomePage() {
  const [subportfolioId] = useSubportfolioParam();
  const { data, isPending, error } = usePortfolio({ subportfolio_id: subportfolioId });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Carteira</h1>
        <p className="text-muted-foreground">
          Renda variável pelo último fechamento e renda fixa pelo valor bruto marcado.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <>
          {/* Patrimônio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-normal">
                Patrimônio total
              </CardTitle>
              <p className="text-4xl font-semibold">{formatBRL(data.total)}</p>
              {data.day_change && (
                <p className="tabular-nums">
                  <MetricHint hint={dayChangeHint}>
                    <span className="text-muted-foreground">Variação do dia</span>
                  </MetricHint>{" "}
                  {formatSignedBRL(data.day_change)}
                  {data.day_return && ` (${formatSignedPercent(data.day_return)})`}
                </p>
              )}
              {data.cash && (
                <p className="tabular-nums">
                  <MetricHint hint={cashHint}>
                    <span className="text-muted-foreground">Saldo a reinvestir</span>
                  </MetricHint>{" "}
                  <Link to="/cash" className="underline-offset-4 hover:underline">
                    {formatBRL(data.cash)}
                  </Link>
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                {data.price_date && data.previous_price_date
                  ? `Renda variável: fechamento de ${formatDate(data.price_date)} contra o de ${formatDate(data.previous_price_date)}. `
                  : "Renda variável: sem dois pregões em cache para a variação do dia. "}
                Renda fixa: marcação de hoje contra a do dia útil anterior.
              </p>
            </CardHeader>
            {data.categories.length > 0 && (
              <CardContent>
                <AllocationChart categories={data.categories} />
              </CardContent>
            )}
          </Card>

          {/* Liquidez */}
          <LiquidityCard portfolio={data} />

          {/* Posições por categoria */}
          <CategorySections portfolio={data} />

          {/* Renda variável por setor e segmento */}
          {data.sectors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Renda variável por setor</CardTitle>
              </CardHeader>
              <CardContent>
                <SectorDistribution sectors={data.sectors} segments={data.segments} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
