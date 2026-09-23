import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { PricesTable } from "@/features/market/prices-table";
import { useRefreshPrices } from "@/features/market/use-refresh-prices";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { get, getApiErrorMessage } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";

export function MarketPage() {
  const { data, isPending, error } = useQuery({
    queryKey: queryKeys.prices,
    queryFn: () => get("/api/market/prices"),
  });
  const refresh = useRefreshPrices();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mercado</h1>
          <p className="text-muted-foreground">
            Último fechamento de cada ativo, com a data da cotação.
          </p>
        </div>
        <Button onClick={() => refresh.mutate()} disabled={refresh.isPending}>
          <RefreshCw className={refresh.isPending ? "animate-spin" : undefined} />
          Atualizar cotações
        </Button>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <PricesTable prices={data} />
      )}
    </div>
  );
}
