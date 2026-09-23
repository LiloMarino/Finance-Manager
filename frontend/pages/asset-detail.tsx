import { useParams } from "react-router-dom";

import { OperationsTable } from "@/features/operations/operations-table";
import { useOperations } from "@/features/operations/use-operations";
import { usePositions } from "@/features/portfolio/use-positions";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAsset } from "@/shared/hooks/use-assets";
import { getApiErrorMessage } from "@/shared/lib/api";
import { assetClassLabels } from "@/shared/lib/labels";
import { formatBRL, formatQuantity } from "@/types/decimal";

export function AssetDetailPage() {
  const assetId = Number(useParams().assetId);
  const asset = useAsset(assetId);
  const positions = usePositions();
  const operations = useOperations({ asset_id: assetId });

  if (asset.error) {
    return <span className="text-destructive">{getApiErrorMessage(asset.error)}</span>;
  }
  if (asset.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  const position = positions.data?.find((item) => item.asset_id === assetId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{asset.data.ticker}</h1>
        <Badge variant="secondary">{assetClassLabels[asset.data.asset_class]}</Badge>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Posição atual</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.isPending ? (
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
