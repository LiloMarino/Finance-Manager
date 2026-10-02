import { PendingAlerts } from "@/features/data-health/pending-alerts";
import { CompositionCard } from "@/features/portfolio/composition-card";
import { PortfolioEmpty } from "@/features/portfolio/portfolio-empty";
import { PortfolioMetrics } from "@/features/portfolio/portfolio-metrics";
import { EquityCard, FixedIncomeCard } from "@/features/portfolio/positions-tables";
import { SectorCard } from "@/features/portfolio/sector-card";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { PageHeader } from "@/shared/components/page-header";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";

export function HomePage() {
  const [subportfolioId] = usePortfolioScope();
  const { data, isPending, error } = usePortfolio({ subportfolio_id: subportfolioId });

  return (
    <>
      <PageHeader
        title="Carteira"
        description={
          data?.price_date
            ? `Renda variável pelo fechamento de ${formatDate(data.price_date)} e renda fixa pelo valor bruto marcado hoje.`
            : "Renda variável pelo último fechamento e renda fixa pelo valor bruto marcado."
        }
      />

      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.categories.length === 0 ? (
        <PortfolioEmpty />
      ) : (
        <>
          {/* Pendências */}
          <PendingAlerts />

          {/* Indicadores */}
          <PortfolioMetrics portfolio={data} />

          {/* Composição e setores */}
          <div className="grid gap-4 xl:grid-cols-2">
            <CompositionCard portfolio={data} />
            {data.segments.length > 0 && <SectorCard portfolio={data} />}
          </div>

          {/* Posições */}
          <EquityCard portfolio={data} />
          <FixedIncomeCard portfolio={data} />
        </>
      )}
    </>
  );
}
