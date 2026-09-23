import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";

export function useRefreshPrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => post("/api/market/prices/refresh"),
    onSuccess: ({ failed }) => {
      void invalidateKeys(queryClient, [queryKeys.prices, queryKeys.portfolio]);
      if (failed.length > 0) {
        toast.warning(
          `Sem cotação nova para ${failed.join(", ")}: usando o último preço conhecido.`,
        );
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
