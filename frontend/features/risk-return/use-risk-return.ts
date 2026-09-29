import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components, paths } from "@/types/openapi.generated";

export type RiskReturn = components["schemas"]["RiskReturnDTO"];
export type RiskItem = RiskReturn["items"][number];
export type RiskPoint = RiskItem["risk"];
export type RiskReturnFilters = NonNullable<
  paths["/api/risk-return"]["get"]["parameters"]["query"]
>;

// A chave da carteira no conjunto de itens escondidos
export const PORTFOLIO_KEY = "portfolio";

export function useRiskReturn(filters: RiskReturnFilters) {
  return useQuery({
    queryKey: [...queryKeys.riskReturn, filters],
    queryFn: () => get("/api/risk-return", { query: filters }),
    placeholderData: keepPreviousData,
  });
}

/** A chave de um item, única entre ativos e títulos. */
export function itemKey(item: RiskItem): string {
  return item.asset_id !== null ? `asset-${item.asset_id}` : `investment-${item.investment_id}`;
}
