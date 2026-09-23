import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage, post } from "@/shared/lib/api";

export const pricesQueryKey = ["market", "prices"] as const;

export function useRefreshPrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => post("/api/market/prices/refresh"),
    onSuccess: ({ failed }) => {
      void queryClient.invalidateQueries({ queryKey: pricesQueryKey });
      if (failed.length > 0) {
        toast.warning(
          `Sem cotação nova para ${failed.join(", ")}: usando o último preço conhecido.`,
        );
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
