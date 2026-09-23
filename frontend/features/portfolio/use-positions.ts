import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Position = components["schemas"]["PositionDTO"];

export function usePositions() {
  return useQuery({
    queryKey: queryKeys.positions,
    queryFn: () => get("/api/portfolio/positions"),
  });
}
