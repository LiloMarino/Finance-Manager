import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";

import { post } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type InstallmentsRequest = components["schemas"]["InstallmentsInDTO"];
export type Installments = components["schemas"]["InstallmentsDTO"];

export function useInstallments(body: InstallmentsRequest | null) {
  return useQuery({
    queryKey: [...queryKeys.simulation, "installments", body],
    queryFn: body ? () => post("/api/simulation/installments", { body }) : skipToken,
    placeholderData: keepPreviousData,
  });
}
