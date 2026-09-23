import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";

export function useRefreshIndexes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => post("/api/market/indexes/refresh"),
    onSuccess: ({ failed }) => {
      void invalidateKeys(queryClient, [
        queryKeys.indexes,
        queryKeys.fixedIncome,
        queryKeys.portfolio,
      ]);
      if (failed.length > 0) {
        toast.warning(
          `Sem dado novo do BCB para ${failed.join(", ")}: a renda fixa usa o último valor conhecido.`,
        );
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
