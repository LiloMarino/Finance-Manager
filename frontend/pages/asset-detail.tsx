import { Pencil, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { AssetFormDialog } from "@/features/assets/asset-form-dialog";
import { TickerChangeDialog } from "@/features/assets/ticker-change-dialog";
import { useIncome, useIncomeDistribution } from "@/features/income/use-income";
import { OperationFormDialog } from "@/features/operations/operation-form-dialog";
import { OperationsTable } from "@/features/operations/operations-table";
import { useOperations } from "@/features/operations/use-operations";
import { PerformancePanel } from "@/features/performance/performance-panel";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { AssetClassBadge } from "@/shared/components/asset-class-badge";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { Money, Quantity } from "@/shared/components/money";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";
import { type Asset, useAsset } from "@/shared/hooks/use-assets";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { incomeTypeLabels } from "@/shared/lib/labels";
import { signClass } from "@/shared/lib/sign";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";
import { formatPercent, formatSignedPercent } from "@/types/decimal";

// O resumo do cadastro: setor, segmento, subcarteira e os tickers antigos
function description(asset: Asset, subportfolio: string | undefined): string {
  return [
    asset.sector ? `${asset.sector} · ${asset.segment}` : "Sem classificação",
    subportfolio && `subcarteira ${subportfolio}`,
    ...asset.previous_tickers.map(
      ({ ticker, valid_until }) => `antes ${ticker}, até ${formatDate(valid_until)}`,
    ),
  ]
    .filter(Boolean)
    .join(" · ");
}

function PositionSummary({ assetId }: { assetId: number }) {
  const portfolio = usePortfolio({});
  if (portfolio.isPending) return <Skeleton className="h-24 w-full" />;
  const position = portfolio.data?.positions.find((item) => item.asset_id === assetId);
  if (!position) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">Sem posição aberta.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <MetricStrip>
      <Metric
        label="Posição"
        size="lg"
        value={<Money value={position.market_value} />}
        detail={
          <>
            <Quantity value={position.quantity} /> · {formatPercent(position.share)} da carteira
          </>
        }
      />
      <Metric
        label="Preço médio"
        value={<Money value={position.average_price} />}
        detail={
          <>
            custo de <Money value={position.total_cost} />
          </>
        }
      />
      <Metric
        label="Preço atual"
        value={position.price ? <Money value={position.price} /> : "sem cotação"}
        detail={
          position.price_date && (
            <>
              {position.day_return && (
                <span className={signClass(position.day_return)}>
                  {formatSignedPercent(position.day_return)}
                </span>
              )}
              fechamento de {formatDate(position.price_date)}
            </>
          )
        }
      />
      <Metric
        label="Resultado"
        value={<Money value={position.unrealized_result} signed />}
        tone={signClass(position.unrealized_result)}
        detail={
          position.unrealized_return && (
            <span className={signClass(position.unrealized_return)}>
              {formatSignedPercent(position.unrealized_return)} sobre o custo
            </span>
          )
        }
      />
    </MetricStrip>
  );
}

/** Os últimos proventos do ativo e o que ele rendeu em 12 meses. */
function IncomeCard({ assetId }: { assetId: number }) {
  const income = useIncome({ asset_id: assetId });
  const distribution = useIncomeDistribution({ months: 12 });
  const row = distribution.data?.assets.find((item) => item.asset_id === assetId);
  const recent = income.data?.events.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proventos</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to="/income?tab=history" />}
          >
            Ver todos
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3" data-flush>
        {row && (
          <div className="flex flex-col gap-0.5 px-5">
            <span className="text-caption text-muted-foreground">Recebido em 12 meses</span>
            <span className="text-kpi-sm tabular-nums">
              <Money value={row.amount} />
            </span>
            {row.dividend_yield && row.yield_on_cost && (
              <span className="text-caption text-muted-foreground">
                Dividend yield de {formatPercent(row.dividend_yield)} · yield on cost de{" "}
                {formatPercent(row.yield_on_cost)}
              </span>
            )}
          </div>
        )}
        {recent.length === 0 ? (
          <p className="text-caption text-muted-foreground px-5">
            Nenhum provento registrado para este ativo.
          </p>
        ) : (
          <Table>
            <TableBody>
              {recent.map((event) => (
                <TableRow key={event.id}>
                  <TableCell variant="muted">{formatDate(event.payment_date)}</TableCell>
                  <TableCell>{incomeTypeLabels[event.income_type]}</TableCell>
                  <TableCell className="text-right">
                    <Money value={event.amount} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function AssetDetailPage() {
  const assetId = Number(useParams().assetId);
  const asset = useAsset(assetId);
  const operations = useOperations({ asset_id: assetId });
  const { data: subportfolios = [] } = useSubportfolios();

  if (asset.error) {
    return <span className="text-destructive">{getApiErrorMessage(asset.error)}</span>;
  }
  if (asset.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  const subportfolio = subportfolios.find((item) => item.id === asset.data.subportfolio_id);

  return (
    <>
      <PageHeader
        breadcrumb={{ parents: [{ label: "Ativos", to: "/assets" }], current: asset.data.ticker }}
        title={
          <>
            <span className="font-mono">{asset.data.ticker}</span>
            <AssetClassBadge assetClass={asset.data.asset_class} />
          </>
        }
        description={description(asset.data, subportfolio?.name)}
        actions={
          <>
            <TickerChangeDialog asset={asset.data} />
            <AssetFormDialog
              asset={asset.data}
              trigger={
                <Button variant="outline">
                  <Pencil />
                  Editar
                </Button>
              }
            />
            <OperationFormDialog
              trigger={
                <Button>
                  <Plus />
                  Nova operação
                </Button>
              }
            />
          </>
        }
      />

      <PositionSummary assetId={assetId} />

      {/* Rentabilidade */}
      <PerformancePanel assetId={assetId} />

      <IncomeCard assetId={assetId} />

      {/* Operações */}
      <Card>
        <CardHeader>
          <CardTitle>Operações</CardTitle>
          <CardAction>
            <CardDescription>
              {operations.data?.length ?? 0}{" "}
              {operations.data?.length === 1 ? "operação" : "operações"}
            </CardDescription>
          </CardAction>
        </CardHeader>
        <CardContent data-flush>
          {operations.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : operations.error ? (
            <span className="text-destructive">{getApiErrorMessage(operations.error)}</span>
          ) : (
            <OperationsTable operations={operations.data} showAsset={false} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
