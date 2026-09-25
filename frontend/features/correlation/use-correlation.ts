import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";

import type { CorrelationQuery } from "@/features/correlation/correlation-params";
import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Correlation = components["schemas"]["CorrelationDTO"];

export function useCorrelation(query: CorrelationQuery | null) {
  return useQuery({
    queryKey: [...queryKeys.correlation, query],
    queryFn: query ? () => get("/api/correlation", { query }) : skipToken,
    placeholderData: keepPreviousData,
  });
}
