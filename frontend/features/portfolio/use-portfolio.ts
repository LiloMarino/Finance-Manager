import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components, paths } from "@/types/openapi.generated";

export type Portfolio = components["schemas"]["PortfolioDTO"];
export type PortfolioFilters = NonNullable<paths["/api/portfolio"]["get"]["parameters"]["query"]>;

export function usePortfolio(filters: PortfolioFilters) {
  return useQuery({
    queryKey: [...queryKeys.portfolio, filters],
    queryFn: () => get("/api/portfolio", { query: filters }),
  });
}
