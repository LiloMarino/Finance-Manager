import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Subportfolio = components["schemas"]["SubportfolioDTO"];

export function useSubportfolios() {
  return useQuery({
    queryKey: queryKeys.subportfolios,
    queryFn: () => get("/api/subportfolios"),
  });
}
