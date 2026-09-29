import { AllocationChart } from "@/features/portfolio/allocation-chart";
import { CategorySections } from "@/features/portfolio/category-sections";
import { IndicatorCards } from "@/features/portfolio/indicator-cards";
import { LiquidityCard } from "@/features/portfolio/liquidity-card";
import { SectorDistribution } from "@/features/portfolio/sector-distribution";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSubportfolioParam } from "@/shared/hooks/use-subportfolio-param";
import { getApiErrorMessage } from "@/shared/lib/api";

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
          {/* Indicadores */}
          <IndicatorCards portfolio={data} />

          {/* Composição por categoria */}
          {data.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Composição</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationChart categories={data.categories} />
              </CardContent>
            </Card>
          )}

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
