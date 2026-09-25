import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components, paths } from "@/types/openapi.generated";

export type MonthlyReturns = components["schemas"]["MonthlyPerformanceDTO"];
export type YearReturns = MonthlyReturns["years"][number];
export type MonthlyReturnsFilters = NonNullable<
  paths["/api/performance/monthly"]["get"]["parameters"]["query"]
>;

export function useMonthlyReturns(filters: MonthlyReturnsFilters) {
  return useQuery({
    queryKey: [...queryKeys.monthlyReturns, filters],
    queryFn: () => get("/api/performance/monthly", { query: filters }),
    placeholderData: keepPreviousData,
  });
}
