import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";

import { post } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type ComparisonRequest = components["schemas"]["ComparisonInDTO"];
export type Comparison = components["schemas"]["ComparisonDTO"];

/** Sem opção ou sem projeção completa, não há o que calcular. */
export function useComparison(body: ComparisonRequest | null) {
  return useQuery({
    queryKey: [...queryKeys.simulation, "fixed-income", body],
    queryFn:
      body && body.options.length > 0
        ? () => post("/api/simulation/fixed-income", { body })
        : skipToken,
    placeholderData: keepPreviousData,
  });
}
