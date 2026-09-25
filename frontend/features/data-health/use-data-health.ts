import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type DataIssue = components["schemas"]["DataIssueDTO"];

export function useDataHealth() {
  return useQuery({
    queryKey: queryKeys.dataHealth,
    queryFn: () => get("/api/data-health"),
  });
}
