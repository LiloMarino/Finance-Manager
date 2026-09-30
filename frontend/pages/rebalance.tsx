import { Link } from "react-router-dom";

import { ScheduleCard } from "@/features/alert/schedule-card";
import { useCash } from "@/features/cash/use-cash";
import { ContributionCard } from "@/features/rebalance/contribution-card";
import { DeviationTable } from "@/features/rebalance/deviation-table";
import { imbalanceHint } from "@/features/rebalance/hints";
import { TargetsDialog } from "@/features/rebalance/targets-dialog";
import { type Rebalance, useRebalance } from "@/features/rebalance/use-rebalance";
import { MetricHint } from "@/shared/components/metric-hint";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSubportfolioParam } from "@/shared/hooks/use-subportfolio-param";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatBRL, formatPercent, formatPoints } from "@/types/decimal";

export function RebalancePage() {
  const [subportfolioId] = useSubportfolioParam();
  const { data, isPending, error } = useRebalance(subportfolioId);
  const cash = useCash();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Rebalanceamento</h1>
        <p className="text-muted-foreground">
          A meta de cada item da subcarteira, o quanto ela está longe e onde pôr o próximo aporte.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : subportfolioId === undefined ? (
        <GeneralView rebalance={data} />
      ) : (
        <>
          <SubportfolioSummary rebalance={data} subportfolioId={subportfolioId} />
          <Card>
            <CardHeader>
              <CardTitle>Desvio de cada item</CardTitle>
            </CardHeader>
            <CardContent>
              <DeviationTable lines={data.lines} general={false} />
            </CardContent>
          </Card>
          {data.complete && (
            <ContributionCard subportfolioId={subportfolioId} cash={cash.data?.balance ?? null} />
          )}
        </>
      )}

      {/* Alerta com o app fechado */}
      <ScheduleCard />
    </div>
  );
}

interface SummaryProps {
  rebalance: Rebalance;
  subportfolioId: number;
}

function SubportfolioSummary({ rebalance, subportfolioId }: SummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-muted-foreground text-sm font-normal">
            <MetricHint hint={imbalanceHint}>
              <span>Desbalanceamento</span>
            </MetricHint>
          </CardTitle>
          {rebalance.complete && rebalance.imbalance ? (
            <p className="flex flex-wrap items-center gap-3 text-4xl font-semibold tabular-nums">
              {formatPoints(rebalance.imbalance)}
              {rebalance.breached && <Badge variant="destructive">Fora do limite</Badge>}
            </p>
          ) : (
            <p className="text-muted-foreground">Sem meta completa.</p>
          )}
          {rebalance.max_item_deviation && rebalance.max_total_deviation && (
            <p className="text-muted-foreground text-sm">
              Subcarteira de {formatBRL(rebalance.total)}. Limites:{" "}
              {formatPoints(rebalance.max_item_deviation)} por item e{" "}
              {formatPoints(rebalance.max_total_deviation)} no total.
            </p>
          )}
        </div>
        <TargetsDialog subportfolioId={subportfolioId} />
      </CardHeader>
      {!rebalance.complete && rebalance.targets_total && (
        <CardContent>
          <Alert>
            <AlertTitle>As metas somam {formatPercent(rebalance.targets_total)}</AlertTitle>
            <AlertDescription>
              Com as metas somando 100%, a subcarteira passa a ter desvio, limite e a divisão do
              aporte. Ajuste em Editar metas.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
}

function GeneralView({ rebalance }: { rebalance: Rebalance }) {
  return (
    <>
      <Alert>
        <AlertTitle>A carteira geral não tem meta própria</AlertTitle>
        <AlertDescription>
          <span>
            A meta de cada item é a da subcarteira dele, pesada pela fração da subcarteira. Escolha
            uma subcarteira no topo para editar as metas e dividir o aporte, ou crie uma em{" "}
            <Link to="/subportfolios" className="underline">
              Subcarteiras
            </Link>
            .
          </span>
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Meta combinada</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviationTable lines={rebalance.lines} general />
        </CardContent>
      </Card>
    </>
  );
}
