import { AllocationChart } from "@/features/portfolio/allocation-chart";
import { FixedIncomeHoldings } from "@/features/portfolio/fixed-income-holdings";
import { PositionsTable } from "@/features/portfolio/positions-table";
import { SectorDistribution } from "@/features/portfolio/sector-distribution";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatBRL } from "@/types/decimal";

export function HomePage() {
  const { data, isPending, error } = usePortfolio();

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
            </CardHeader>
            {data.categories.length > 0 && (
              <CardContent>
                <AllocationChart categories={data.categories} />
              </CardContent>
            )}
          </Card>

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

          {/* Renda variável */}
          <h2 className="text-lg font-semibold">Renda variável</h2>
          <PositionsTable positions={data.positions} />

          {/* Renda fixa */}
          <h2 className="text-lg font-semibold">Renda fixa</h2>
          <FixedIncomeHoldings holdings={data.fixed_income} />
        </>
      )}
    </div>
  );
}
