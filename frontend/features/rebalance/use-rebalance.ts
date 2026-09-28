import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { get, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";
import type { DecimalString } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

export type Rebalance = components["schemas"]["RebalanceDTO"];
export type RebalanceLine = Rebalance["lines"][number];
export type Targets = components["schemas"]["TargetsDTO"];
export type Plan = components["schemas"]["PlanDTO"];
type TargetsInput = components["schemas"]["TargetsInDTO"];

export function useRebalance(subportfolioId: number | undefined) {
  return useQuery({
    queryKey: [...queryKeys.rebalance, subportfolioId ?? null],
    queryFn: () => get("/api/rebalance", { query: { subportfolio_id: subportfolioId } }),
  });
}

export function useTargets(subportfolioId: number) {
  return useQuery({
    queryKey: [...queryKeys.rebalance, subportfolioId, "targets"],
    queryFn: () =>
      get("/api/rebalance/{subportfolio_id}/targets", {
        path: { subportfolio_id: subportfolioId },
      }),
  });
}

export function useSaveTargets(subportfolioId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TargetsInput) =>
      put("/api/rebalance/{subportfolio_id}/targets", {
        path: { subportfolio_id: subportfolioId },
        body,
      }),
    onSuccess: () => {
      toast.success("Metas salvas.");
      // Os limites mudam o que aparece em Saúde dos dados
      return invalidateKeys(queryClient, [queryKeys.rebalance, queryKeys.dataHealth]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

interface PlanInput {
  subportfolioId: number;
  amount: DecimalString;
  allowSales: boolean;
}

/** A divisão do aporte é conta sobre os valores enviados: lê como uma query. */
export function usePlan({ subportfolioId, amount, allowSales }: PlanInput) {
  return useQuery({
    queryKey: [...queryKeys.rebalance, "plan", subportfolioId, amount, allowSales],
    queryFn: () =>
      post("/api/rebalance/plan", {
        body: { subportfolio_id: subportfolioId, amount, allow_sales: allowSales },
      }),
  });
}
