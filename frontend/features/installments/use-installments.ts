import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";

import { post } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

type InstallmentsRequest = components["schemas"]["InstallmentsInDTO"];
export type Installments = components["schemas"]["InstallmentsDTO"];
type CashOrAdvanceRequest = components["schemas"]["CashOrAdvanceInDTO"];
export type CashOrAdvance = components["schemas"]["CashOrAdvanceDTO"];
type AdvanceRequest = components["schemas"]["AdvanceInDTO"];
export type Advance = components["schemas"]["AdvanceDTO"];

export function useInstallments(body: InstallmentsRequest | null) {
  return useQuery({
    queryKey: [...queryKeys.simulation, "installments", body],
    queryFn: body ? () => post("/api/simulation/installments", { body }) : skipToken,
    placeholderData: keepPreviousData,
  });
}

export function useCashOrAdvance(body: CashOrAdvanceRequest | null) {
  return useQuery({
    queryKey: [...queryKeys.simulation, "cash-or-advance", body],
    queryFn: body ? () => post("/api/simulation/cash-or-advance", { body }) : skipToken,
    placeholderData: keepPreviousData,
  });
}

export function useAdvance(body: AdvanceRequest | null) {
  return useQuery({
    queryKey: [...queryKeys.simulation, "advance", body],
    queryFn: body ? () => post("/api/simulation/advance", { body }) : skipToken,
    placeholderData: keepPreviousData,
  });
}
