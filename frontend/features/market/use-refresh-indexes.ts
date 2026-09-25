import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";

export function useRefreshIndexes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => post("/api/market/indexes/refresh"),
    onSuccess: ({ failed }) => {
      void invalidateKeys(queryClient, [
        queryKeys.indexes,
        queryKeys.fixedIncome,
        queryKeys.portfolio,
        queryKeys.dataHealth,
        queryKeys.simulation,
      ]);
      // `failed` traz só o problema novo; os já avisados ficam no painel
      if (failed.length > 0) {
        toast.warning(`Série do BCB atrasada: ${failed.join(", ")}.`, {
          action: { label: "Ver painel", onClick: () => void navigate("/data-health") },
        });
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
