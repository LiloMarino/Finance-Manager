import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { del, get, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Cash = components["schemas"]["CashDTO"];
export type CashEntry = Cash["entries"][number];
type CheckInput = components["schemas"]["CashCheckInDTO"];
type WithdrawalInput = components["schemas"]["CashWithdrawalInDTO"];
type SettingsInput = components["schemas"]["CashSettingsInDTO"];

export function useCash() {
  return useQuery({ queryKey: queryKeys.cash, queryFn: () => get("/api/cash") });
}

// O saldo entra no total da carteira, na evolução e no saldo parado dos problemas
function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidateKeys(queryClient, [queryKeys.portfolio, queryKeys.dataHealth]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useAddCheck() {
  return useWrite(
    (body: CheckInput) => post("/api/cash/checks", { body }),
    "Conferência registrada.",
  );
}

export function useDeleteCheck(checkId: number) {
  return useWrite<void, void>(
    () => del("/api/cash/checks/{check_id}", { path: { check_id: checkId } }),
    "Conferência apagada.",
  );
}

export function useAddWithdrawal() {
  return useWrite(
    (body: WithdrawalInput) => post("/api/cash/withdrawals", { body }),
    "Saque registrado.",
  );
}

export function useDeleteWithdrawal(withdrawalId: number) {
  return useWrite<void, void>(
    () =>
      del("/api/cash/withdrawals/{withdrawal_id}", {
        path: { withdrawal_id: withdrawalId },
      }),
    "Saque apagado.",
  );
}

export function useUpdateCashSettings() {
  return useWrite(
    (body: SettingsInput) => put("/api/cash/settings", { body }),
    "Limite salvo.",
  );
}
