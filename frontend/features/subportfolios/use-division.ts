import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Division = components["schemas"]["DivisionDTO"];
export type DivisionSlice = Division["slices"][number];

/** Como a carteira se divide entre as subcarteiras e o que está fora delas. */
export function useDivision() {
  return useQuery({
    queryKey: [...queryKeys.subportfolios, "division"],
    queryFn: () => get("/api/subportfolios/division"),
  });
}
