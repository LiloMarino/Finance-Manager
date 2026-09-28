import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type FixedIncome = components["schemas"]["FixedIncomeDTO"];

export function useFixedIncomeList() {
  return useQuery({
    queryKey: queryKeys.fixedIncome,
    queryFn: () => get("/api/fixed-income"),
  });
}
