import { PortfolioCorrelation } from "@/features/correlation/portfolio-correlation";
import { PageHeader } from "@/shared/components/page-header";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";

export function CorrelationPage() {
  const [subportfolioId] = usePortfolioScope();
  const { data: subportfolios } = useSubportfolios();
  const scope = subportfolios?.find((item) => item.id === subportfolioId);

  return (
    <>
      <PageHeader
        title="Correlação"
        description={
          scope
            ? `O quanto os ativos da subcarteira ${scope.name} andam juntos. Troque a carteira no topo da sidebar.`
            : "O quanto os ativos da carteira andam juntos. Para ver uma subcarteira, troque no topo da sidebar."
        }
      />
      <PortfolioCorrelation subportfolioId={subportfolioId} />
    </>
  );
}
