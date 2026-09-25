import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components, paths } from "@/types/openapi.generated";

export type Evolution = components["schemas"]["EvolutionDTO"];
export type EvolutionFilters = NonNullable<
  paths["/api/evolution"]["get"]["parameters"]["query"]
>;

export function useEvolution(filters: EvolutionFilters) {
  return useQuery({
    queryKey: [...queryKeys.evolution, filters],
    queryFn: () => get("/api/evolution", { query: filters }),
    placeholderData: keepPreviousData,
  });
}
