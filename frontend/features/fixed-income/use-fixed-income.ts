import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { del, get, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type FixedIncome = components["schemas"]["FixedIncomeDTO"];
export type Movement = components["schemas"]["MovementDTO"];
type FixedIncomeInput = components["schemas"]["FixedIncomeInDTO"];
type MovementInput = components["schemas"]["MovementInDTO"];

export function useFixedIncomeList() {
  return useQuery({
    queryKey: queryKeys.fixedIncome,
    queryFn: () => get("/api/fixed-income"),
  });
}

export function useFixedIncome(investmentId: number) {
  return useQuery({
    queryKey: [...queryKeys.fixedIncome, investmentId],
    queryFn: () =>
      get("/api/fixed-income/{investment_id}", {
        path: { investment_id: investmentId },
      }),
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
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useSaveFixedIncome(investmentId?: number) {
  return useWrite(
    (body: FixedIncomeInput) =>
      investmentId === undefined
        ? post("/api/fixed-income", { body })
        : put("/api/fixed-income/{investment_id}", {
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
