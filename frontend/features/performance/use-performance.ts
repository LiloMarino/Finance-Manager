import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components, paths } from "@/types/openapi.generated";

export type Performance = components["schemas"]["PerformanceDTO"];
export type PerformanceFilters = NonNullable<
  paths["/api/performance"]["get"]["parameters"]["query"]
>;

export function usePerformance(filters: PerformanceFilters) {
  return useQuery({
    queryKey: [...queryKeys.performance, filters],
    queryFn: () => get("/api/performance", { query: filters }),
    placeholderData: keepPreviousData,
  });
}
