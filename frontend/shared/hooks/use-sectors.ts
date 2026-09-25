import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Sector = components["schemas"]["SectorDTO"];
export type Segment = components["schemas"]["SegmentDTO"];

export function useSectors() {
  return useQuery({
    queryKey: queryKeys.sectors,
    queryFn: () => get("/api/sectors"),
  });
}
