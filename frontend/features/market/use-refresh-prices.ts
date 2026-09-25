import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";

export function useRefreshPrices() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => post("/api/market/prices/refresh"),
    onSuccess: ({ failed }) => {
      void invalidateKeys(queryClient, [
        queryKeys.prices,
        queryKeys.portfolio,
        queryKeys.dataHealth,
        queryKeys.correlation,
      ]);
      // `failed` traz só o problema novo; os já avisados ficam no painel
      if (failed.length > 0) {
        toast.warning(`Faltam cotações de ${failed.join(", ")}.`, {
          action: { label: "Ver painel", onClick: () => void navigate("/data-health") },
        });
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
