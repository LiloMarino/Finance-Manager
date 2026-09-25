import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";

import type { CorrelationWindow } from "@/features/correlation/correlation-params";
import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Correlation = components["schemas"]["CorrelationDTO"];
export type CorrelationMatrix = components["schemas"]["CorrelationMatrixDTO"];

export function useCorrelationMatrix(symbols: string[], window: CorrelationWindow) {
  return useQuery({
    queryKey: [...queryKeys.correlation, "matrix", symbols, window],
    queryFn:
      symbols.length >= 2
        ? () => get("/api/correlation/matrix", { query: { symbols, window } })
        : skipToken,
    placeholderData: keepPreviousData,
  });
}

export function useCorrelationPair(
  pair: [string, string] | null,
  window: CorrelationWindow,
) {
  return useQuery({
    queryKey: [...queryKeys.correlation, "pair", pair, window],
    queryFn: pair
      ? () =>
          get("/api/correlation/pair", {
            query: { first: pair[0], second: pair[1], window },
          })
      : skipToken,
    placeholderData: keepPreviousData,
  });
}
