import { Pencil } from "lucide-react";
import { useParams } from "react-router-dom";

import { AssetFormDialog } from "@/features/assets/asset-form-dialog";
import { TickerChangeDialog } from "@/features/assets/ticker-change-dialog";
import { OperationsTable } from "@/features/operations/operations-table";
import { useOperations } from "@/features/operations/use-operations";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAsset } from "@/shared/hooks/use-assets";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { assetClassLabels } from "@/shared/lib/labels";
import { formatBRL, formatQuantity, formatSignedBRL } from "@/types/decimal";

export function AssetDetailPage() {
  const assetId = Number(useParams().assetId);
  const asset = useAsset(assetId);
  const portfolio = usePortfolio();
  const operations = useOperations({ asset_id: assetId });

  if (asset.error) {
    return <span className="text-destructive">{getApiErrorMessage(asset.error)}</span>;
  }
  if (asset.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  const position = portfolio.data?.positions.find((item) => item.asset_id === assetId);

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{asset.data.ticker}</h1>
            <Badge variant="secondary">{assetClassLabels[asset.data.asset_class]}</Badge>
            <span className="text-muted-foreground text-sm">
              {asset.data.sector
                ? `${asset.data.sector} / ${asset.data.segment}`
                : "Sem classificação"}
            </span>
          </div>
          {asset.data.previous_tickers.length > 0 && (
            <p className="text-muted-foreground text-sm">
              Antes:{" "}
              {asset.data.previous_tickers
                .map(({ ticker, valid_until }) => `${ticker} (até ${formatDate(valid_until)})`)
                .join(", ")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <AssetFormDialog
            asset={asset.data}
            trigger={
              <Button variant="outline">
                <Pencil />
                Editar
              </Button>
            }
          />
          <TickerChangeDialog asset={asset.data} />
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Posição atual</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.isPending ? (
            <Skeleton className="h-16 w-full" />
          ) : position ? (
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Quantidade</dt>
                <dd className="tabular-nums">{formatQuantity(position.quantity)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Preço médio</dt>
                <dd className="tabular-nums">{formatBRL(position.average_price)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Custo total</dt>
                <dd className="tabular-nums">{formatBRL(position.total_cost)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Preço atual</dt>
                <dd className="tabular-nums">
                  {position.price ? formatBRL(position.price) : "sem cotação"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Valor</dt>
                <dd className="tabular-nums">{formatBRL(position.market_value)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Resultado</dt>
                <dd className="tabular-nums">{formatSignedBRL(position.unrealized_result)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground">Sem posição aberta.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Operações</h2>
        {operations.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : operations.error ? (
          <span className="text-destructive">
            {getApiErrorMessage(operations.error)}
          </span>
        ) : (
          <OperationsTable operations={operations.data} />
        )}
      </div>
    </div>
  );
}
