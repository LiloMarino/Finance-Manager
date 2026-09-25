import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type CurrentRates = components["schemas"]["CurrentRatesDTO"];

export function useCurrentRates() {
  return useQuery({
    queryKey: queryKeys.currentRates,
    queryFn: () => get("/api/simulation/rates"),
  });
}
