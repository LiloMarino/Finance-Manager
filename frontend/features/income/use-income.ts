import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { del, get, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateIncomeData, queryKeys } from "@/shared/lib/query-keys";
import type { components, paths } from "@/types/openapi.generated";

export type IncomeEvent = components["schemas"]["IncomeEventDTO"];
export type IncomeFilters = NonNullable<paths["/api/income"]["get"]["parameters"]["query"]>;
export type IncomePerformanceQuery = NonNullable<
  paths["/api/income/performance"]["get"]["parameters"]["query"]
>;
export type IncomePerformance = components["schemas"]["IncomePerformanceDTO"];
export type IncomeDistribution = components["schemas"]["IncomeDistributionDTO"];
type IncomeInput = components["schemas"]["IncomeEventInDTO"];

export function useIncome(filters: IncomeFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.income, "list", filters],
    queryFn: () => get("/api/income", { query: filters }),
  });
}

export function useIncomePerformance(query: IncomePerformanceQuery) {
  return useQuery({
    queryKey: [...queryKeys.income, "performance", query],
    queryFn: () => get("/api/income/performance", { query }),
  });
}

export function useIncomeDistribution(months: number) {
  return useQuery({
    queryKey: [...queryKeys.income, "distribution", months],
    queryFn: () => get("/api/income/distribution", { query: { months } }),
  });
}

function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidateIncomeData(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useSaveIncome(incomeId?: number) {
  return useWrite(
    (body: IncomeInput) =>
      incomeId === undefined
        ? post("/api/income", { body })
        : put("/api/income/{income_id}", { path: { income_id: incomeId }, body }),
    "Provento salvo.",
  );
}

export function useDeleteIncome() {
  return useWrite(
    (event: IncomeEvent) =>
      del("/api/income/{income_id}", { path: { income_id: event.id } }),
    "Provento apagado.",
  );
}
