import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { FixedIncome } from "@/shared/hooks/use-fixed-income-list";
import { del, get, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Movement = components["schemas"]["MovementDTO"];
type FixedIncomeInput = components["schemas"]["FixedIncomeInDTO"];
type FixedIncomeCreateInput = components["schemas"]["FixedIncomeCreateDTO"];
type MovementInput = components["schemas"]["MovementInDTO"];

export function useFixedIncome(investmentId: number) {
  return useQuery({
    queryKey: [...queryKeys.fixedIncome, investmentId],
    queryFn: () =>
      get("/api/fixed-income/{investment_id}", {
        path: { investment_id: investmentId },
      }),
  });
}

export type FixedIncomeSummary = components["schemas"]["FixedIncomeSummaryDTO"];

/** Os títulos que não venceram, somados no total, por tipo e por liquidez. */
export function useFixedIncomeSummary() {
  return useQuery({
    queryKey: [...queryKeys.fixedIncome, "summary"],
    queryFn: () => get("/api/fixed-income/summary"),
  });
}

function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidateKeys(queryClient, [
        queryKeys.fixedIncome,
        queryKeys.portfolio,
        queryKeys.dataHealth,
        queryKeys.subportfolios,
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useCreateFixedIncome() {
  return useWrite(
    (body: FixedIncomeCreateInput) => post("/api/fixed-income", { body }),
    "Título cadastrado.",
  );
}

export function useUpdateFixedIncome() {
  return useWrite(
    ({ investmentId, body }: { investmentId: number; body: FixedIncomeInput }) =>
      put("/api/fixed-income/{investment_id}", {
        path: { investment_id: investmentId },
        body,
      }),
    "Título salvo.",
  );
}

export function useDeleteFixedIncome() {
  return useWrite(
    (investment: FixedIncome) =>
      del("/api/fixed-income/{investment_id}", {
        path: { investment_id: investment.id },
      }),
    "Título apagado.",
  );
}

export function useAddMovement(investmentId: number) {
  return useWrite(
    (body: MovementInput) =>
      post("/api/fixed-income/{investment_id}/movements", {
        path: { investment_id: investmentId },
        body,
      }),
    "Movimentação registrada.",
  );
}

export function useDeleteMovement() {
  return useWrite(
    (movement: Movement) =>
      del("/api/fixed-income/movements/{movement_id}", {
        path: { movement_id: movement.id },
      }),
    "Movimentação apagada.",
  );
}
