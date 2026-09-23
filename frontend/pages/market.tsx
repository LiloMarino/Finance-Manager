import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { IndexesTable } from "@/features/market/indexes-table";
import { PricesTable } from "@/features/market/prices-table";
import { useRefreshIndexes } from "@/features/market/use-refresh-indexes";
import { useRefreshPrices } from "@/features/market/use-refresh-prices";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { get, getApiErrorMessage } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";

export function MarketPage() {
  const prices = useQuery({
    queryKey: queryKeys.prices,
    queryFn: () => get("/api/market/prices"),
  });
  const indexes = useQuery({
    queryKey: queryKeys.indexes,
    queryFn: () => get("/api/market/indexes"),
  });
  const refreshPrices = useRefreshPrices();
  const refreshIndexes = useRefreshIndexes();
  const refreshing = refreshPrices.isPending || refreshIndexes.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mercado</h1>
          <p className="text-muted-foreground">
            Último fechamento de cada ativo e das séries do BCB, com a data do dado.
          </p>
        </div>
        <Button
          onClick={() => {
            refreshPrices.mutate();
            refreshIndexes.mutate();
          }}
          disabled={refreshing}
        >
          <RefreshCw className={refreshing ? "animate-spin" : undefined} />
          Atualizar mercado
        </Button>
      </div>

      {/* Cotações */}
      {prices.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : prices.error ? (
        <span className="text-destructive">{getApiErrorMessage(prices.error)}</span>
      ) : (
        <PricesTable prices={prices.data} />
      )}

      {/* Séries do BCB */}
      <h2 className="text-lg font-semibold">Juros e inflação</h2>
      {indexes.isPending ? (
        <Skeleton className="h-24 w-full" />
      ) : indexes.error ? (
        <span className="text-destructive">{getApiErrorMessage(indexes.error)}</span>
      ) : (
        <IndexesTable indexes={indexes.data} />
      )}
    </div>
  );
}
